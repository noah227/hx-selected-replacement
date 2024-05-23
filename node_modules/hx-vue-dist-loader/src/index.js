const fs = require("fs")
const path = require("path")

/**
 * 加载vue打包文件内容
 * @param dirname {String} __dirname
 * @param dist {String} 打包文件入口，如xx/dist/index.html
 * @param encoding {BufferEncoding}
 * @return {*}
 */
const loadDist = (dirname, dist, encoding = "utf8") => {
    const buffer = fs.readFileSync(path.join(dirname, dist))
    return replaceDistStatics(buffer.toString(encoding), dirname, dist)
}

/**
 * 替换静态文件路径
 * @param s {String}
 * @param dirname {String}
 * @param dist {String}
 * @return {String}
 */
const replaceDistStatics = (s, dirname, dist) => {
    const matches = s.matchAll(/\/(js|css)\/[\w-]+\.(\w+\.)?(js|css)/g)
    for (let m of matches) {
        const [file, _, __, ___] = m;
        const f = path.join(path.dirname(path.join(dirname, dist)), file);
        s = s.replace(file, f);
    }
    return s;
}

module.exports = {
    loadDist,
    replaceDistStatics
}
