const hx = require("hbuilderx")
const Html = require('./html.js')
const path = require("path")

const pkgId = require("../package.json").id

const storeWindowSize = (webWidth, webHeight) => {
    hx.workspace.getConfiguration(pkgId).update("dialogSize", [webWidth + 40 * 2, webHeight + 99 + 73])
}
const getWindowSize = () => {
    const dialogSize = hx.workspace.getConfiguration(pkgId).get("dialogSize")
    const [width, height] = dialogSize || [820, 600]
    return [width < 720 ? 720 : width, height < 480 ? 480 : height]
}

const showView = () => {
    const [width, height] = getWindowSize()
    let dialog = hx.window.createWebViewDialog({
        modal: true,
        title: "内容替换",
        description: "替换内容，支持正则",
        dialogButtons: ["关闭"],
        size: {
            width,
            height
        }
    }, {
        enableScripts: true
    })

    const webview = dialog.webView
    webview.html = Html()

    let selection = null
    webview.onDidReceiveMessage((msg) => {
        let action = msg.command
        let data = msg.data
        console.log(action, data)
        const activeEditor = hx.window.getActiveTextEditor()    
        switch (action) {
            case "close":
                // 关闭对话框
                dialog.close()
                break
            case "initEnvInfo":
                webview.postMessage({
                    command: "resInitEnvInfo",
                    data: {
                        htmlRoot: path.resolve(__dirname, "html").replaceAll(/\\/g, "/")
                    }
                })
                break
            case "fetchContent":
                activeEditor.then((editor) => {
                    const language = editor.document.languageId
                    selection = editor.selection
                    const text = editor.document.getText(selection)
                    webview.postMessage({
                        command: "resFetchContent",
                        data: {language, text}
                    })
                })
                break
            case "confirm-replacement":
                activeEditor.then((editor) => {
                    // todo第一次操作的selection要提前存下来，而不是从这里取
                    console.log("FDSFSFSDFS", selection)
                    editor.edit((editBuilder) => {
                        const text = data.replaced
                        editBuilder.replace(selection, text)
                        // 光标位置后移
                        const {active, anchor, start, end} = selection
                        const language = editor.document.languageId
                        setTimeout(() => {
                            // 延迟设置，类似vue nextTick的效果，等待编辑窗口内容更新后再更新光标位置
                            // 实例要重新获取
                            hx.window.getActiveTextEditor().then(e => {
                                e.setSelection(active + text.length, active + text.length)
                                webview.postMessage({
                                    command: "resConfirmReplacement",
                                    data: {language, text}
                                })
                            })
                        }, 0)
                    })
                })
                break
            case "syncConfig":
                console.log(">>>SYNC Config")
                storeWindowSize(data.width, data.height)
                break
            default:
                break
        }
    })
    // 显示对话框，返回显示成功或者失败的信息，主要包含内置浏览器相关状态。
    dialog.show().then((data) => {
        // ...
    })
}

module.exports = {
    showView
}
