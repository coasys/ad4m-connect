import { Ad4mClient } from "@perspect3vism/ad4m";

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
    document.addEventListener(
      "return-fetch-ad4m-client",
      function listener(event) {
        this.removeEventListener("return-fetch-ad4m-client", listener);
        // @ts-ignore
        resolve(event.detail.ad4mClient);
      }
    );

    const event = new CustomEvent("fetch-ad4m-client");
    document.dispatchEvent(event);

    setTimeout(() => {
      reject("No Ad4mClient found");
    }, 5000);
  });
}

export function isConnected() {
  return new Promise((resolve, reject) => {
    document.addEventListener(
      "return-fetch-ad4m-client",
      function listener(event) {
        // @ts-ignore
        event.detail.addEventListener("connected_with_capabilities", () => {
          this.removeEventListener("return-fetch-ad4m-client", listener);

          resolve(true);
        });
      }
    );

    const event = new CustomEvent("fetch-ad4m-client");
    document.dispatchEvent(event);
  });
}

