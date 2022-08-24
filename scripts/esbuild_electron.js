const { sassPlugin, postcssModules } = require("esbuild-sass-plugin");
const alias = require('esbuild-plugin-alias');

const preactCompatPlugin = {
  name: "preact-compat",
  setup(build) {
    const path = require("path");
    const preact = path.join(
      process.cwd(),
      "node_modules",
      "preact",
      "compat",
      "dist",
      "compat.module.js"
    );

    build.onResolve({ filter: /^(react-dom|react)$/ }, (args) => {
      return { path: preact };
    });
  },
};

require("esbuild")
  .build({
    entryPoints: ["./src/electron.ts"],
    external: ['electron'],
    platform: 'node',
    bundle: true,
    format: "cjs",
    minify: true,
    sourcemap: false,
    outfile: "dist/electron.js",
    watch: process.env.NODE_ENV === "dev" ? true : false,
    inject: ["./preact-shim.js"],

    plugins: [
      sassPlugin({
        transform: postcssModules({}),
      }),
    ],
  })
  .catch(() => process.exit(1));
