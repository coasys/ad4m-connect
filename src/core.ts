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
  | "port_found"
  | "port_searching"
  | "port_notfound"
  | "connected_without_capabilities"
  | "connected_with_capabilities"
  | "disconnected"
  | "agent_locked"
  | "capabilties_not_matched"
  | "not_connected"
  | "loading";

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
  listeners: { [x: ClientStates]: [(...args: any[]) => void] } = {};
  onStateChange: (val: any) => {};

  // @fayeed - params
  constructor({
    appName,
    appDesc,
    appDomain,
    capabilities,
    port,
    token,
    url,
    onStateChange,
  }: Ad4mConnectOptions) {
    //! @fayeed - make it support node.js
    this.appName = appName;
    this.appDesc = appDesc;
    this.appDomain = appDomain;
    this.capabilities = capabilities;
    this.port = port || this.port;
    this.url = url || this.url;
    this.onStateChange = onStateChange || this.onStateChange;

    if (token && token.length > 0) {
      this.setToken(token);
    }

    if (localStorage.getItem("ad4minURL") && token.length > 0) {
      setInterval(() => {
        this.checkConnection();
      }, 10000);

      this.buildClient();
      this.checkConnection();
    } else {
      this.onStateChange("init");
      this.callListener("state_change");
    }
  }

  async connectRemote(url: string) {
    this.url = url;
    localStorage.setItem("ad4minToken", "");
    localStorage.setItem("ad4minURL", url);

    this.onStateChange("loading");

    this.buildClient();
    this.checkConnection();
  }

  async connectToPort() {
    try {
      this.onStateChange("loading");
      const port = await checkPort(this.port);
      if (port) {
        this.onStateChange("port_found");

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

  addEventListener(event: ClientStates, listener: (...args: any[]) => void) {
    if (this.listeners[event]) {
      this.listeners[event].push(listener);
    } else {
      this.listeners[event] = [listener];
    }
  }

  private handleErrorMessage(message) {
    if (message.includes("Capability is not matched, you have capabilities:")) {
      // Show wrong capability message.
      if (this.isFullyInitialized) {
        this.onStateChange("capabilties_not_matched");
      } else {
        this.onStateChange("capabilties_not_matched_first");
      }
    } else if (
      message.includes(
        "Cannot extractByTags from a ciphered wallet. You must unlock first."
      )
    ) {
      // Show agent is locked message.
      this.onStateChange("agent_locked");
    } else if (message.includes("signature verification failed")) {
      // wrong agent error
      this.onStateChange("capabilties_not_matched");
    } else if (message.includes("Failed to fetch")) {
      // wrong agent error
      this.onStateChange("could_not_make_request");
    } else if (message === "Couldn't find an open port") {
      // show no open port error & ask to retry
      this.setPortSearchState("not_found");
      this.onStateChange("port_notfound");
    } else {
      if (this.isFullyInitialized) {
        this.onStateChange("capabilties_not_matched");
      } else {
        this.onStateChange("not_connected");
      }
    }
  }

  private callListener(event: ClientStates, ...args: any[]) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((e) => {
        e(...args);
      });
    }
  }

  async findPort() {
    this.onStateChange("loading");

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

  setToken(jwt: string) {
    localStorage.setItem("ad4minToken", jwt);
    this.buildClient();
  }

  token(): string {
    return localStorage.getItem("ad4minToken") || "";
  }

  setPortSearchState(state: PortSearchStateType) {
    this.portSearchState = state;
  }

  buildClient() {
    const wsLink = new GraphQLWsLink(
      createClient({
        url: this.url,
        connectionParams: () => {
          return {
            headers: {
              authorization: this.token(),
            },
          };
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
      const status = await this.ad4mClient?.agent.status();
      console.log(status);
      this.isFullyInitialized = true;
      this.onStateChange("connected_with_capabilities");
    } catch (error) {
      if (error.message === undefined) {
        this.onStateChange("not_connected");
      } else {
        this.handleErrorMessage(error.message);
      }
    }
  }

  async requestCapability(invalidateToken = false) {
    if (invalidateToken || !this.token()) {
      localStorage.removeItem("ad4minToken");

      this.buildClient();

      try {
        this.requestId = await this.ad4mClient?.agent.requestCapability(
          this.appName,
          this.appDesc,
          this.appDomain,
          JSON.stringify(this.capabilities)
        );

        this.onStateChange("request_capability");
      } catch (e) {
        this.handleErrorMessage(e.message);
      }

      return true;
    } else {
      return false;
    }
  }

  async verifyCode(code: string) {
    try {
      const jwt = await this.ad4mClient?.agent.generateJwt(
        this.requestId!,
        code
      );

      this.setToken(jwt!);

      this.isFullyInitialized = true;

      this.onStateChange("connected_with_capabilities");
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
