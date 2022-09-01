const { default: litPlugin } = require("esbuild-plugin-lit");

require("esbuild")
  .build({
    entryPoints: ["./src/web.ts"],
    bundle: true,
    format: "esm",
    minify: true,
    sourcemap: false,
    outfile: "dist/web.js",
    watch: process.env.NODE_ENV === "dev" ? true : false,
    plugins: [
      litPlugin()
    ],
  })
  .catch(() => process.exit(1));
