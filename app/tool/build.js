const WebpackChain = require("webpack-chain");
const {VueLoaderPlugin} = require("vue-loader");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const Path = require("path");
const webpack = require("webpack");
const {merge} = require("lodash");
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
            const {dependencies} = FsExtra.readJSONSync(packageFile);
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
chain.mode('development')
chain.resolve.extensions.add(".ts").add(".vue").add(".js").add(".json");

chain.entry("main").add(Path.join(__dirname, "../src/main/index.ts"));
const HtmlWebpackPlugin = require('html-webpack-plugin');
const chalk = require("chalk");
const chunk = 'index';
const options = {
    template: Path.join(rootDir, 'public/index.html'),
    templateParameters: {
        BASE_URL: `/`
    },
    minify: false,
    hash: false,
    inject: true,
    // entry: Path.join(rootDir, './src/app.ts'),
    chunks: [chunk],
    filename: 'index.html',
};
chain.entry(chunk).add(Path.join(rootDir, './src/app.ts'));
chain.plugin('index.html').use(HtmlWebpackPlugin, [options])

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
    .rule('image')
    .test(/\.(png|jpe?g|gif)$/)
    .use('url-loader')
    .loader('url-loader')
    .options({
        limit: 800 * 1024,// 800k以内都以base64内联
        name: 'images/[name].[ext]'
    });
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
// const f = require('tsconfig-paths-webpack-plugin')
// chain.plugin('tsconfig').use(f, [{
//     configFile: Path.join(rootDir, 'tsconfig.json')
// }]).end();
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
chain.devtool('source-map')
chain.watch(true)
let config = chain.toConfig();
const fallback = {
    fs: false,
    path: false,
    electron: false,
};
config = merge(config, {resolve: {fallback}});

function logError(str) {
    const chalk = require('chalk')
    console.log(chalk.red(str));
}

function logInfo(str) {
    const chalk = require('chalk')
    console.log(chalk.blue(str));
}

let compiler = webpack(config, (error, status) => {
    if (error) {
        return console.error(error);
    }
    if (status && status.hasErrors()) {
        status.compilation.errors.forEach(err => {
            logError(err.message);
            logError(err.details);
            logError(err.stack);
        })
        console.log('build failed')
        return
    }
    status.compilation.emittedAssets.forEach((asset) => {
        logInfo(asset)
    })

    console.log("build succeed");
});
