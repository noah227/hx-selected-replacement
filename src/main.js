const hx = require("hbuilderx")
const Html = require('./html.js')
const path = require("path")

const showView = () => {
    let dialog = hx.window.createWebViewDialog({
        modal: true,
        title: "内容替换",
        description: "替换内容，支持正则",
        dialogButtons: ["关闭"],
        size: {
            width: 820,
            height: 600
        }
    }, {
        enableScripts: true
    })

    const webview = dialog.webView
    webview.html = Html()

    let selection = null
    webview.onDidReceiveMessage((msg) => {
        let action = msg.command
        console.log(action)
        let data = msg.data
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
                    console.log(">>>", language)
                    selection = editor.selection
                    console.log(selection, "<SSSSSS")
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
