const { WebpackPluginServe } = require("webpack-plugin-serve");
const { MiniHtmlWebpackPlugin } = require("mini-html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const webpack = require("webpack");
const { GitRevisionPlugin } = require("git-revision-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const path = require("path");
const glob = require("glob");
const PurgeCSSPlugin = require("purgecss-webpack-plugin");
const APP_SOURCE = path.join(__dirname, "src");
const ALL_FILES = glob.sync(path.join(__dirname, "src/*.js"));
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

exports.eliminateUnusedCSS = () => ({
  plugins: [
    new PurgeCSSPlugin({
      paths: ALL_FILES, // Consider extracting as a parameter
      extractors: [
        {
          extractor: (content) =>
            content.match(/[^<>"'`\s]*[^<>"'`\s:]/g) || [],
          extensions: ["html"],
        },
      ],
    }),
  ],
});

exports.devServer = () => ({
  watch: true,
  plugins: [
    new WebpackPluginServe({
      port: parseInt(process.env.PORT, 10) || 3333,
      static: "./dist", // Expose if output.path changes
      liveReload: true,
      waitForBuild: true,
    }),
  ],
});

// exports.page = ({ title }) => ({
//   plugins: [
//     new MiniHtmlWebpackPlugin({
//       context: { title },
//     }),
//   ],
// });
exports.page = ({ title, url = "", chunks } = {}) => ({
  plugins: [
    new MiniHtmlWebpackPlugin({
      publicPath: "/",
      chunks,
      filename: `${url && url + "/"}index.html`,
      context: { title },
    }),
  ],
});

exports.loadCSS = () => ({
  module: {
    rules: [{ test: /\.css$/, use: ["style-loader", "css-loader"] }],
  },
});
exports.extractCSS = ({ options = {}, loaders = [] } = {}) => {
  return {
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [
            { loader: MiniCssExtractPlugin.loader, options },
            "css-loader",
          ].concat(loaders),
          sideEffects: true,
        },
      ],
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: "[name].[contenthash].css",
      }),
    ],
  };
};
exports.tailwind = () => ({
  loader: "postcss-loader",
  options: {
    postcssOptions: { plugins: [require("tailwindcss")()] },
  },
});
exports.autoprefix = () => ({
  loader: "postcss-loader",
  options: {
    postcssOptions: { plugins: [require("autoprefixer")()] },
  },
});

exports.loadImages = ({ limit } = {}) => ({
  module: {
    rules: [
      {
        test: /\.(png|jpg)$/,
        type: "asset",
        parser: { dataUrlCondition: { maxSize: limit } },
      },
    ],
  },
});

exports.loadJavaScript = () => ({
  module: {
    rules: [
      // Consider extracting include as a parameter
      { test: /\.js$/, include: APP_SOURCE, use: "babel-loader" },
    ],
  },
});
exports.generateSourceMaps = ({ type }) => ({ devtool: type });
exports.clean = () => ({
  output: {
    clean: true,
  },
});

exports.attachRevision = () => ({
  plugins: [
    new webpack.BannerPlugin({
      banner: new GitRevisionPlugin().version(),
    }),
  ],
});

exports.minifyJavaScript = () => ({
  optimization: { minimizer: [new TerserPlugin()] },
});

exports.minifyCSS = ({ options }) => ({
  optimization: {
    minimizer: [new CssMinimizerPlugin({ minimizerOptions: options })],
  },
});

exports.setFreeVariable = (key, value) => {
  const env = {};
  env[key] = JSON.stringify(value);

  return {
    plugins: [new webpack.DefinePlugin(env)],
  };
};
