import { Ad4mClient } from "@perspect3vism/ad4m";
import { ClientStates } from "./core";

function Timeout() {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), 20);
  return controller;
}

export async function checkPort(port: number) {
  try {
    const res = await fetch(`http://localhost:${port}/graphql/`, {
      signal: Timeout().signal,
      mode: "no-cors",
    });

    if (res.status === 0) {
      return port;
    } else {
      return null;
    }
  } catch (e) {
    throw e;
  }
}

export function getAd4mClient(): Promise<Ad4mClient> {
  return new Promise((resolve, reject) => {
    const el = document.querySelector("ad4m-connect");

    // @ts-ignore
    const client = el?.getClient();

    if (client) {
      resolve(client);
    } else {
      reject("No Ad4mClient found");
    }
  });
}

export function onAuthStateChanged(callback) {
  const el = document.querySelector("ad4m-connect");

  el?.addEventListener("authStateChange", (e: CustomEvent) => {
    callback(e.detail as ClientStates);
  });
}

export function isConnected() {
  return new Promise((resolve, reject) => {
    const el = document.querySelector("ad4m-connect");

    // @ts-ignore
    const connected = el?.connected();

    if (connected) {
      resolve(true);
    } else {
      resolve(false);
    }
  });
}
