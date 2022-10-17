require("esbuild")
  .build({
    entryPoints: ["./src/core.ts"],
    bundle: true,
    format: "esm",
    minify: true,
    sourcemap: false,
    outfile: "dist/index.js",
    watch: process.env.NODE_ENV === "dev" ? true : false,
  })
  .catch(() => process.exit(1));
