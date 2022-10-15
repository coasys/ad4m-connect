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
type ClientEvents =
  | "port_found"
  | "port_searching"
  | "port_notfound"
  | "connected_without_capabilities"
  | "connected_with_capabilities"
  | "disconnected"
  | "agent_locked"
  | "capabilties_not_matched"
  | "not_connected"
  | "loading"
  | "state_change";

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
  listeners: { [x: ClientEvents]: [(...args: any[]) => void] } = {};
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
      this.onStateChange({
        message: "init",
        status: 200,
      });
      this.callListener("state_change");
    }
  }

  async connectRemote(url: string) {
    this.url = url;
    localStorage.setItem("ad4minToken", "");
    localStorage.setItem("ad4minURL", url);

    this.onStateChange({
      message: "loading",
      status: 102,
    });

    this.buildClient();
    this.checkConnection();
  }

  async connectToPort() {
    try {
      this.onStateChange({
        message: "loading",
        status: 102,
      });
      const port = await checkPort(this.port);
      if (port) {
        this.onStateChange({
          message: "port_found",
          status: 200,
          port,
        });

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

  addEventListener(event: ClientEvents, listener: (...args: any[]) => void) {
    if (this.listeners[event]) {
      this.listeners[event].push(listener);
    } else {
      this.listeners[event] = [listener];
    }
  }

  private handleErrorMessage(message) {
    console.log("error message", message);
    if (message.includes("Capability is not matched, you have capabilities:")) {
      // Show wrong capability message.
      if (this.isFullyInitialized) {
        this.onStateChange({
          message: "capabilties_not_matched",
          status: 401,
        });
      } else {
        this.onStateChange({
          message: "capabilties_not_matched_first",
          status: 401,
        });
      }
    } else if (
      message.includes(
        "Cannot extractByTags from a ciphered wallet. You must unlock first."
      )
    ) {
      // Show agent is locked message.
      this.onStateChange({
        message: "agent_locked",
        status: 401,
      });
    } else if (message.includes("signature verification failed")) {
      // wrong agent error
      this.onStateChange({
        message: "capabilties_not_matched",
        status: 401,
      });
    } else if (message.includes("Failed to fetch")) {
      // wrong agent error
      this.onStateChange({
        message: "could_not_make_request",
        status: 404,
      });
    } else if (message === "Couldn't find an open port") {
      // show no open port error & ask to retry
      this.setPortSearchState("not_found");
      this.onStateChange({
        message: "port_notfound",
        status: 404,
      });
    } else {
      if (this.isFullyInitialized) {
        this.onStateChange({
          message: "capabilties_not_matched",
          status: 401,
        });
      } else {
        this.onStateChange({
          message: "not_connected",
          status: 404,
        });
      }
    }
  }

  private callListener(event: ClientEvents, ...args: any[]) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((e) => {
        e(...args);
      });
    }
  }

  async findPort() {
    this.onStateChange({
      message: "loading",
      status: 102,
    });

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
      this.onStateChange({
        message: "connected_with_capabilities",
        status: 200,
      });
    } catch (error) {
      if (error.message === undefined) {
        this.onStateChange({
          message: "not_connected",
          status: 404,
        });
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

        this.onStateChange({
          message: "request_capability",
          code: 200,
          executorUrl: this.url,
          capabilityToken: this.token,
          requestId: this.requestId,
        });
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

      this.onStateChange({
        message: "connected_with_capabilities",
        code: 200,
        executorUrl: this.url,
        capabilityToken: this.token,
        client: this.ad4mClient,
      });
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
