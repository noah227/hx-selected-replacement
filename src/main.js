const hx = require("hbuilderx")
const Html = require('./html.js')

const showView = () => {
    let dialog = hx.window.createWebViewDialog({
        modal: true,
        title: "内容替换",
        description: "替换内容，支持正则",
        dialogButtons: ["关闭"],
        size: {width: 820, height: 600}
    }, {
        enableScripts: true
    })

    const webview = dialog.webView
    webview.html = Html()

    webview.onDidReceiveMessage((msg) => {
        let action = msg.command
        let data = msg.data
        const activeEditor = hx.window.getActiveTextEditor()
        switch (action) {
            case "close":
                // 关闭对话框
                dialog.close()
                break
			case "initText":
				console.log(">>>>")
				break
            case "setReplacement":
                // activeEditor.then((editor) => {
                //     let selection = editor.selection 
                //     editor.edit((editBuilder) => {
                //         editBuilder.replace(selection, data)
                //         // 光标位置后移
                //         const {active, anchor, start, end} = selection
                //         setTimeout(() => {
                //             // 延迟设置，类似vue nextTick的效果，等待编辑窗口内容更新后再更新光标位置
                //             // 实例要重新获取
                //             hx.window.getActiveTextEditor().then(e => {
                //                 e.setSelection(active + data.length, active + data.length)
                //             })
                //         }, 0)
                //     })
                // })
                break
            default:
                break
        }
    })
    // 显示对话框，返回显示成功或者失败的信息，主要包含内置浏览器相关状态。
    dialog.show().then((data) => {
		webview.postMessage({
			command: "insertArgs",
			data: "hello"
		})
        // ...
    })
}

module.exports = {showView}
