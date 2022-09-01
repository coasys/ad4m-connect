function Timeout() {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), 20);
  return controller;
}

export async function checkPort(port: number) {
  try {
    const res = await fetch(`http://localhost:${port}/graphql`, {
      signal: Timeout().signal,
      mode: 'no-cors'
    });

    if (res.status == 0) {
      return port
    } else {
      return null
    }
  } catch (e: any) {
    console.error("failed", e);

    if (Array.isArray(e)) {
      if (
        e.length > 0 &&
        e[0].message.contains(
          "Capability is not matched, you have capabilities:"
        )
      ) {
        throw e[0];
      }
    }

    if (
      e.message ===
      "Cannot extractByTags from a ciphered wallet. You must unlock first."
    ) {
      throw e;
    }

    if (e.message === "signature verification failed") {
      throw e;
    }
  }
}