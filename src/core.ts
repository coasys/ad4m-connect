import {
  ApolloClient,
  InMemoryCache,
  NormalizedCacheObject,
} from "@apollo/client/core";
import { createClient } from "graphql-ws";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { Ad4mClient } from "@perspect3vism/ad4m";
import { checkPort } from "./utils";

function runBrowser(args: Ad4mConnectOptions): Client {
  const port =
    args.port || parseInt(localStorage.getItem("ad4minPort") || "12000");
  const token = args.token || localStorage.getItem("ad4minToken") || "";
  const url = args.url || localStorage.getItem("ad4minURL") || "";

  const client = new Client({
    ...args,
    port,
    token,
    url,
  });

  return client;
}

export type Ad4mConnectOptions = {
  appName: string;
  appDesc: string;
  appDomain: string;
  appIconPath?: string;
  capabilities: { [x: string]: any }[];
  dataPath?: string;
  port?: number;
  token?: string;
  url?: string;
  onStateChange?: any;
};

type PortSearchStateType = "na" | "searching" | "found" | "not_found";

export type ClientStates =
  | "connected_with_capabilities"
  | "agent_locked"
  | "capabilities_not_matched"
  | "verify_code"
  | "not_connected"
  | "loading"
  | "disconnected"
  | "remote_url";

class Client {
  apolloClient?: ApolloClient<NormalizedCacheObject>;
  ad4mClient?: Ad4mClient;
  requestId?: string;
  isFullyInitialized = false;
  port = 12000;
  portSearchState: PortSearchStateType = "na";
  appName: string;
  appDesc: string;
  appDomain: string;
  url: string;
  capabilities: { [x: string]: any }[];
  stateListeners: Function[];

  // @fayeed - params
  constructor({
    appName,
    appDesc,
    appDomain,
    capabilities,
    port,
    token,
    url,
  }: Ad4mConnectOptions) {
    //! @fayeed - make it support node.js
    this.appName = appName;
    this.appDesc = appDesc;
    this.appDomain = appDomain;
    this.capabilities = capabilities;
    this.port = port || this.port;
    this.url =
      url ||
      localStorage.getItem("ad4minUrl") ||
      `ws://localhost:${this.port}/graphql`;
    this.token = token || this.token;
    this.stateListeners = [];

    this.buildClient();

    this.ad4mClient.agent.status().then(() => {
      this.notifyStateChange("connected_with_capabilities");
    });

    this.ad4mClient.agent.addAgentStatusChangedListener(() => {
      this.checkConnection();
    });
  }

  onStateChange(listener: (...args: any[]) => void) {
    this.stateListeners.push(listener);
  }

  notifyStateChange(val: ClientStates) {
    this.stateListeners.forEach((listener) => {
      listener(val);
    });
  }

  async connect(url?: string) {
    if (url) {
      this.url = url;
    }
    this.notifyStateChange("loading");
    this.checkConnection();
  }

  async connectToPort() {
    try {
      this.notifyStateChange("loading");
      const port = await checkPort(this.port);
      if (port) {
        this.setPort(port);
        await this.checkConnection();
      } else {
        this.setPortSearchState("searching");

        const port = await this.findPort();

        if (port) {
          this.setPort(port);
          await this.checkConnection();
        }
      }
    } catch (error) {
      this.handleErrorMessage(error.message);
    }
  }

  private handleErrorMessage(message) {
    if (message.includes("Capability is not matched, you have capabilities:")) {
      // Show wrong capability message.
      this.notifyStateChange("capabilities_not_matched");
    } else if (
      message.includes(
        "Cannot extractByTags from a ciphered wallet. You must unlock first."
      )
    ) {
      // Show agent is locked message.
      this.notifyStateChange("agent_locked");
    } else if (message.includes("signature verification failed")) {
      // wrong agent error
      this.notifyStateChange("capabilities_not_matched");
    } else if (message.includes("Failed to fetch")) {
      // wrong agent error
      this.notifyStateChange("not_connected");
    } else if (message === "Couldn't find an open port") {
      // show no open port error & ask to retry
      this.setPortSearchState("not_found");
      this.notifyStateChange("not_connected");
    } else {
      this.notifyStateChange("not_connected");
    }
  }

  async findPort() {
    this.notifyStateChange("loading");

    for (let i = 12000; i <= 12010; i++) {
      try {
        const status = await checkPort(i);
        if (!status) {
          continue;
        } else {
          this.setPort(status);
          return status;
        }
      } catch (e) {
        this.handleErrorMessage(e.message);
      }
    }

    this.setPortSearchState("not_found");

    throw Error("Couldn't find an open port");
  }

  setPort(port: number) {
    this.portSearchState = "found";
    this.port = port;
    localStorage.setItem("ad4minPort", port.toString());
    this.url = `ws://localhost:${this.port}/graphql`;
    localStorage.setItem("ad4minURL", this.url);
    this.buildClient();
  }

  get token(): string | null {
    return localStorage.getItem("ad4minToken");
  }

  set token(token: string) {
    if (token) {
      localStorage.setItem("ad4minToken", token);
    } else {
      localStorage.removeItem("ad4minToken");
    }
  }

  setPortSearchState(state: PortSearchStateType) {
    this.portSearchState = state;
  }

  buildClient() {
    const wsLink = new GraphQLWsLink(
      createClient({
        url: this.url,
        connectionParams: {
          headers: {
            authorization: this.token,
          },
        },
        on: {
          closed: () => {
            if (this.isFullyInitialized) {
              this.notifyStateChange("disconnected");
            } else {
              this.notifyStateChange("not_connected");
            }
          },
        },
      })
    );

    this.apolloClient = new ApolloClient({
      link: wsLink,
      cache: new InMemoryCache({ resultCaching: false, addTypename: false }),
      defaultOptions: {
        watchQuery: {
          fetchPolicy: "no-cache",
        },
        query: {
          fetchPolicy: "no-cache",
        },
      },
    });

    this.ad4mClient = new Ad4mClient(this.apolloClient);
  }

  async checkConnection() {
    try {
      await this.ad4mClient.agent.status();
      this.isFullyInitialized = true;
      this.notifyStateChange("connected_with_capabilities");
    } catch (error) {
      if (error.message === undefined) {
        this.notifyStateChange("not_connected");
      } else {
        this.handleErrorMessage(error.message);
      }
    }
  }

  async requestCapability(invalidateToken = false) {
    if (invalidateToken) {
      this.token = null;
    }

    try {
      this.requestId = await this.ad4mClient?.agent.requestCapability(
        this.appName,
        this.appDesc,
        this.appDomain,
        JSON.stringify(this.capabilities)
      );
      this.notifyStateChange("verify_code");
    } catch (e) {
      this.handleErrorMessage(e.message);
    }
  }

  async verifyCode(code: string) {
    try {
      this.notifyStateChange("loading");

      const jwt = await this.ad4mClient?.agent.generateJwt(
        this.requestId!,
        code
      );

      this.token = jwt;

      this.isFullyInitialized = true;

      this.buildClient();

      this.notifyStateChange("connected_with_capabilities");
    } catch (e) {
      this.handleErrorMessage(e.message);
    }
  }
}

export function ad4mConnect(args: Ad4mConnectOptions) {
  if (window === undefined) {
    console.log("Running ad4m-connect in node.js");
  } else {
    console.log("Running ad4m-connect in browser");
    return runBrowser(args);
  }
}
