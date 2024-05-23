const {defineConfig} = require('@vue/cli-service')
const webpack = require("webpack")
module.exports = defineConfig({
    transpileDependencies: true,
    productionSourceMap: false,
    publicPath: "./",
    chainWebpack: (config) => {
        config.optimization.delete('splitChunks');
        config.plugin("monaco-webpack-plugin").use("monaco-editor-webpack-plugin");
    }
})
