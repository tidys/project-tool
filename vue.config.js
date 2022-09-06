const production = process.env.NODE_ENV === "production";
const { defineConfig } = require("@vue/cli-service");
const Path = require("path");
module.exports = defineConfig({
  transpileDependencies: true,
  // outputDir: Path.resolve(__dirname, '../dist'),
  pages: {},
  configureWebpack(config) {
    const devtool = production ? false : "source-map";
    return {
      devtool,
      // entry:{'main':'./src/main/index.ts'},
      resolve: {
        fallback: {
          fs: false,
          path: false,
          electron: false,
        },
      },
    };
  },
});
