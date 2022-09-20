function Timeout() {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), 20);
  return controller;
}

export async function checkPort(port: number) {
  try {
    const res = await fetch(`http://localhost:${port}/graphql`, {
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
