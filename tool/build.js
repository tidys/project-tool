const WebpackChain = require("webpack-chain");
const { VueLoaderPlugin } = require("vue-loader");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const Path = require("path");
const webpack = require("webpack");
const { merge } = require("lodash");
const FsExtra = require("fs-extra");
const chain = new WebpackChain();
const Fs = require("fs");

const rootDir = Path.join(__dirname, "../");

function getExternal(defaultModules) {
  const map = {};
  defaultModules.forEach((module) => {
    map[module] = "";
  });
  const packageFile = Path.join(rootDir, "./package.json");
  if (Fs.existsSync(packageFile)) {
    try {
      const { dependencies } = FsExtra.readJSONSync(packageFile);
      for (let key in dependencies) {
        if (!key.endsWith(".js")) {
          map[key] = "";
        }
      }
    } catch (e) {
      console.log(e);
    }
  }
  for (let key in map) {
    map[key] = `commonjs ${key}`;
  }

  ["vue-loader"].forEach((item) => {
    delete map[item];
  });

  return map;
}

chain.target("node");

chain.resolve.extensions.add(".ts").add(".vue").add(".js").add(".json");

chain.entry("main").add(Path.join(__dirname, "../src/main/index.ts"));
chain.output.path(Path.join(rootDir, "./dist"));
chain.output.libraryTarget("commonjs");
chain.externals(getExternal(["electron", "fs-extra", "express"]));
chain.module
  .rule("less")
  .test(/\.less$/)
  .use("extract")
  .loader(MiniCssExtractPlugin.loader)
  .end()
  .use("css-loader")
  .loader("css-loader")
  .end()
  .use("less-loader")
  .loader("less-loader")
  .end();

chain.module
  .rule("css")
  .test(/\.css$/)
  .use("extract")
  .loader(MiniCssExtractPlugin.loader)
  .end()
  .use("css-loader")
  .loader("css-loader")
  .end();

chain.module
  .rule("vue")
  .test(/\.vue$/)
  .use("vue-loader")
  .loader("vue-loader")
  .options({
    isServerBuild: false,
    compilerOptions: {
      isCustomElement(tag) {
        return /^ui-/i.test(String(tag));
      },
    },
  })
  .end();

chain.module
  .rule("ts")
  .test(/\.ts(x?)$/)
  .include.add(Path.join(rootDir, "src"))
  .end()
  // .exclude.add(/node_modules/).end()
  .use("ts-loader")
  .loader("ts-loader")
  .options({
    onlyCompileBundledFiles: true,
    appendTsSuffixTo: ["\\.vue$"],
    transpileOnly: true,
    allowTsInNodeModules: true,
    // happyPackMode: true,
    compilerOptions: {
      target: "es6",
      module: "es6",
      strict: false,
      // jsx: "preserve",
      // importHelpers: true,
      moduleResolution: "node",
      skipLibCheck: true,
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
      // noImplicitAny: false,
      // noImplicitThis: false,
      lib: ["es6", "dom"],
    },
  });

chain.plugin("vue").use(VueLoaderPlugin).end();
chain
  .plugin("extract-css")
  .use(MiniCssExtractPlugin, [
    {
      filename: "[name].css",
      chunkFilename: "[id].css",
    },
  ])
  .end();
chain.plugin("vue_env").use(webpack.DefinePlugin, [
  {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
  },
]);

let config = chain.toConfig();
const fallback = {
  fs: false,
  path: false,
  electron: false,
};
config = merge(config, { resolve: { fallback } });
let compiler = webpack(config, (error, status) => {
  if (error) {
    return console.error(error);
  }
  console.log("build succeed");
});
