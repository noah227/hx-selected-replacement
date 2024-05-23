const path = require("path");
const {loadDist} = require("hx-vue-dist-loader")

function Html() {
    return loadDist(path.resolve(__dirname), "./html/dist/index.html")
}

module.exports = Html;
