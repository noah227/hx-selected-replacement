const { defineConfig } = require('@vue/cli-service')
const webpack = require("webpack")
module.exports = defineConfig({
  transpileDependencies: true,
  chainWebpack: (config) => {
      config.optimization.delete('splitChunks');
      config
          .plugin('limitSplitChunks')
          .use(webpack.optimize.LimitChunkCountPlugin, [{maxChunks: 1}]);
	  config.plugin("monaco-webpack-plugin").use("monaco-editor-webpack-plugin");
  }
})
