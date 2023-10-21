const path = require('path');
// const CopyPlugin = require('copy-webpack-plugin');
module.exports = {
   mode: "development",
   entry: {
      "background": path.resolve(__dirname, "src", "chrome", "background.ts"),
      "content-script": path.resolve(__dirname, "src", "chrome", "content-script.ts"),
   },
   output: {
      path: path.join(__dirname, "dist"),
      filename: "[name].js",
      sourceMapFilename: "[name].js.map", // add source map generation
   },
   resolve: {
      extensions: [".ts", ".js"],
   },
   module: {
      rules: [
         {
            test: /\.tsx?$/,
            loader: "ts-loader",
            exclude: /node_modules/,
         },
         {
            test: /\.html$/i,
            loader: "html-loader",
         },
         {
            test: /\.css$/i,
            loader: "css-loader",
         }
      ],
   },
   // plugins: [
   //    new CopyPlugin({
   //       patterns: [{from: ".", to: ".", context: "public"}]
   //    }),
   // ],
   devtool: "source-map", // add source map generation
};