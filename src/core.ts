import { ApolloClient, InMemoryCache, NormalizedCacheObject } from "@apollo/client/core";
import { createClient } from "graphql-ws";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { Ad4mClient } from "@perspect3vism/ad4m";
import { checkPort } from "./utils";

if (window === undefined) {
  console.log('Running ad4m-connect in node.js');
} else {
  console.log('Running ad4m-connect in browser');
}


function runNode() {
  
}

function runBrowser(args: Ad4mConnectOptions): Client {
  const port = args.port || parseInt(localStorage.getItem("ad4minPort") || "12000");
  const token = args.token || localStorage.getItem("ad4minToken") || "";
  const url = args.url || localStorage.getItem("ad4minURL") || "";

  const setExecutorUrl = (url: string) => {
    localStorage.setItem("ad4minURL", url);
  }

  const setExecutorPort = (port: string) => {
    localStorage.setItem("ad4minToken", port);
  }

  const setExecutorToken = (token: string) => {
    localStorage.setItem("ad4minToken", token);
  }

  const client = new Client({
    ...args,
    port,
    token,
    url,
    setExecutorUrl: args.setExecutorUrl || setExecutorUrl,
    setExecutorPort: args.setExecutorPort || setExecutorPort,
    setExecutorToken: args.setExecutorToken || setExecutorToken
  });

  return client;
}

type Ad4mConnectOptions = {
  appName: string,
  appDesc: string,
  appDomain: string,
  appIconPath?: string,
  capabilities: {[x: string]: any}[],
  dataPath?: string,
  port?: number,
  token?: string,
  url?: string,
  setExecutorUrl?: (val: string) => void,
  setExecutorPort?: (val: string) => void,
  setExecutorToken?: (val: string) => void
}

type PortSearchStateType = "na" | "searching" | "found" | "not_found";
type ClientEvents = 'port_found' | 'port_searching' | 'port_notfound' | 'connected_without_capabilities' 
  | 'connected_with_capabilities' | 'disconnected' | 'agent_locked' | 'capabilties_not_matched' 
  | 'not_connected' | 'loading' | string;

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
  capabilities: {[x: string]: any}[];
  listeners: {[x: ClientEvents]: [(...args: any[]) => void]} = {};
  setExecutorUrl: (val: string) => void;
  setExecutorPort: (val: string) => void;
  setExecutorToken: (val: string) => void;

  // @fayeed - params
  constructor({ appName, appDesc, appDomain, capabilities, port, token, url, setExecutorUrl, setExecutorPort, setExecutorToken }: Ad4mConnectOptions) {
    //! @fayeed - make it support node.js
    this.appName = appName;
    this.appDesc = appDesc;
    this.appDomain = appDomain;
    this.capabilities = capabilities;
    this.setExecutorUrl = setExecutorUrl;
    this.setExecutorPort = setExecutorPort;
    this.setExecutorToken = setExecutorToken;
    if (port) this.port = port!;
    if (url) this.url = url;
    console.log('gg', port, url)
    if (token){
      this.setToken(token!);
    }

    if (localStorage.getItem("ad4minURL") && token.length > 0) {
      setTimeout(() => {
        this.callListener('loading');
      }, 0)
      this.buildClient();
      this.checkConnection();
    } else {
      setTimeout(() => {
        this.callListener('init');
      }, 500)
    }
  }

  async connectRemote(url: string) {
    this.url = url;
    this.setExecutorUrl(url);

    this.callListener('loading');

    this.buildClient();

    await this.checkConnection();
  }

  async connectToPort() {
    try {
      this.callListener('loading');
      const port = 12000; //await checkPort(this.port);
      if (port) {
        this.callListener('port_found', port);
        this.setPort(port);
        await this.checkConnection();
      } else {
        this.setPortSearchState("searching");

        const port = await this.findPort();

        if (port) {
          this.callListener('port_found', port);
          this.setPort(port);
          await this.checkConnection();
        }
      }
    } catch (error: any) {
      console.log('error', error);
      if (error.message.includes("Capability is not matched, you have capabilities:")) {
        // Show wrong capability message.
        this.callListener('capabilties_not_matched', !this.isFullyInitialized);

        console.log("Requesting capabilities...");

        // await this.requestCapability(true);
      } else if (error.message === "Cannot extractByTags from a ciphered wallet. You must unlock first.") {
        // Show agent is locked message.
        this.callListener('agent_locked');
      } else if (error.message === "signature verification failed") {
        // wrong agent error
        this.callListener('capabilties_not_matched', !this.isFullyInitialized);

        console.log("Requesting capabilities...");

        // await this.requestCapability(true);
      } else if (error.message === "Couldn't find an open port") {
        console.log('arrr')
        // show no open port error & ask to retry
        this.setPortSearchState("not_found");
        this.callListener('port_notfound');
        this.callListener('not_connected');
      } else {
        this.callListener('not_connected');
      }
    }
  }

  addEventListener(event: ClientEvents, listener: (...args: any[]) => void) {
    if (this.listeners[event]) {
      this.listeners[event].push(listener);
    } else {
      this.listeners[event] = [listener];
    }
  }
  
  private callListener(event: ClientEvents, ...args: any[]) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(e => e(...args));
    }
  }

  async findPort() {
    this.callListener('port_searching');

    for (let i = 12000; i <= 12010; i++) {
      const status = await checkPort(i);
      if (!status) {
        continue;
      } else {
        this.setPort(status);
        return status;
      }
    }

    this.setPortSearchState("not_found");

    throw Error("Couldn't find an open port");
  }

  setPort(port: number) {
    console.warn("Setting client port to", port);
    this.portSearchState = "found";
    this.port = port;
    this.setExecutorPort(port.toString());
    this.url = `ws://localhost:${this.port}/graphql`;
    this.setExecutorUrl(this.url)
    this.buildClient();
  }

  setToken(jwt: string) {
    this.setExecutorToken(jwt)
    this.buildClient();
  }

  token() {
    return localStorage.getItem("ad4minToken") || "";
  }

  setPortSearchState(state: PortSearchStateType) {
    this.portSearchState = state;
  }

  buildClient() {
    const wsLink = new GraphQLWsLink(createClient({
        url: this.url,
        connectionParams: () => {
            return {
                headers: {
                    authorization: this.token()
                }
            }
        },
    }));

    this.apolloClient = new ApolloClient({
        link: wsLink,
        cache: new InMemoryCache({ resultCaching: false, addTypename: false }),
        defaultOptions: {
            watchQuery: {
                fetchPolicy: "no-cache",
            },
            query: {
                fetchPolicy: "no-cache",
            }
        },
    });

    this.ad4mClient = new Ad4mClient(this.apolloClient);
  }

  async checkConnection() {
    try {
      const status = await this.ad4mClient?.agent.status();
      console.log('status', status);
      this.callListener('connected_with_capabilities');
    } catch (error: any) {
      console.log('error', error);
      if (error.message.includes("Capability is not matched, you have capabilities:")) {
        // Show wrong capability message.
        this.callListener('capabilties_not_matched', !this.isFullyInitialized);

        console.log("Requesting capabilities...");

        // await this.requestCapability(true);
      } else if (error.message === "Cannot extractByTags from a ciphered wallet. You must unlock first.") {
        // Show agent is locked message.
        this.callListener('agent_locked');
      } else if (error.message === "signature verification failed") {
        // wrong agent error
        this.callListener('capabilties_not_matched', !this.isFullyInitialized);

        console.log("Requesting capabilities...");

        // await this.requestCapability(true);
      } else if (error.message === "Couldn't find an open port") {
        // show no open port error & ask to retry
        this.setPortSearchState("not_found");
        this.callListener('port_notfound');
        this.callListener('not_connected');
      } else {
        this.callListener('not_connected');
      }
    }
  }

  async requestCapability(invalidateToken = false) {
    if (invalidateToken || !this.token()) {
      localStorage.removeItem("ad4minToken");

      this.buildClient();

      this.requestId = await this.ad4mClient?.agent.requestCapability(
        this.appName,
        this.appDesc,
        this.appDomain,
        JSON.stringify(this.capabilities)
      );

      this.callListener('request_capability', this.requestId);

      return true;
    } else {
      return false;
    }
  }

  async verifyCode(code: string) {
    console.log('verifyCode',this.requestId, code);

    const jwt = await this.ad4mClient?.agent.generateJwt(this.requestId!, code);
    
    this.setToken(jwt!);
    
    this.isFullyInitialized = true;

    this.callListener('connected_with_capabilities', {
      executorUrl: this.url,
      capabilityToken: this.token,
      client: this.ad4mClient,
    });
  }
}


export function ad4mConnect(args: Ad4mConnectOptions) {
  if (window === undefined) {
    console.log('Running ad4m-connect in node.js');
  } else {
    console.log('Running ad4m-connect in browser');
    return runBrowser(args);
  }
}