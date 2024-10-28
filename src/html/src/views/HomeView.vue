<template>
    <div id="home" v-if="readyToRender">
        <div id="controls">
            <div id="input-area">
                <input v-model="filter.searchContent" type="text" placeholder="搜索" @keydown.enter="confirmReplacement(false)"/>
                <input v-model="filter.replacement" type="text" placeholder="替换内容" @keydown.enter="confirmReplacement(false)"/>
            </div>
            <div id="splitter"></div>
            <div id="filter-area">
                <div>
                    <div title="大小写">
                        <input id="enable-case-sensitive" v-model="filter.caseSensitive" type="checkbox"/>
                        <label for="enable-case-sensitive">Cc</label>
                    </div>
                    <div title="正则">
                        <input id="use-regex" v-model="filter.useRegex" type="checkbox"/>
                        <label for="use-regex">.*</label>
                    </div>
                </div>
                <div></div>
                <div>
                    <button @click="confirmReplacement(false)" title="Enter">替换</button>
                    <button @click="confirmReplacement(true)">全部替换</button>
                </div>
            </div>
        </div>
        <div id="content-area">
            <Editor ref="refCodeOriginEditor" v-model="codeOrigin" :language="language" readonly></Editor>
        </div>
    </div>
</template>

<script lang="ts" setup>
import {getHBuilderX} from "@/hx/index"
import {nextTick, onMounted, ref, shallowRef, watch} from "vue";
import "raw-beautify/dist/default/input.css"
import "raw-beautify/dist/default/button.css"
import Editor from "./Editor.vue"
import {TFilter} from "@/views/Home";

const filter = ref<TFilter>({
    searchContent: "",
    replacement: "",
    useRegex: false,
    caseSensitive: false
})
const refCodeOriginEditor = shallowRef()
const codeOrigin = ref("console.log(999999, 'Excellent!')")

watch(() => codeOrigin.value, () => {
    if (!readyToRender.value) return
    updateHighlight()
})
watch(() => filter.value, () => {
    if (!readyToRender.value) return
    updateHighlight()
}, {deep: true})

const updateTid = ref(0)
const updateHighlight = () => {
    updateTid.value && clearTimeout(updateTid.value)
    updateTid.value = setTimeout(() => {
        refCodeOriginEditor.value.updateHighlight(filter.value)
    }, 200) as any
}

const getCodeReplaced = (replaceAll = false) => {
    const {searchContent, replacement} = filter.value
    if (searchContent) {
        const {useRegex, caseSensitive} = filter.value
        if (useRegex) {
            const flagList: string[] = []
            if (!caseSensitive) flagList.push("i")
            if (replaceAll) flagList.push("g")
            const reg = new RegExp(searchContent, flagList.join(""))
            return codeOrigin.value.replace(reg, replacement)
        }
        return replaceAll ? codeOrigin.value.replaceAll(searchContent, replacement) : codeOrigin.value.replace(searchContent, replacement)
    }
    return codeOrigin.value
}

const confirmReplacement = (replaceAll = false) => {
    console.log(getCodeReplaced(replaceAll))
    getHBuilderX().postMessage({
        command: "confirm-replacement",
        data: {
            replaced: getCodeReplaced(replaceAll)
        }
    })
}

const syncTid = ref<any>(0)
// 这里只sync了size，所以直接在这里写了
const syncConfig = () => {
    syncTid.value && clearTimeout(syncTid.value)
    syncTid.value = setTimeout(() => {
        getHBuilderX().postMessage({
            command: "syncConfig",
            data: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        })
    }, 200)
}

/************************* HBuilderX 部分的内容 *************************/

const htmlRoot = ref("")
const language = ref("javascript")
/** HBuilderX **/
const initMessage = () => {
    // hbx面板上的按钮事件处理
    getHBuilderX().onDidReceiveMessage((msg: any) => {
        console.log("MESSAGE", msg, "<<<")
        const data = msg.data as { [index: string]: any }
        if (msg.type == 'DialogButtonEvent') {
            let button = msg.button
            if (button == '关闭') {
                getHBuilderX().postMessage({
                    command: "close"
                })
            }
        } else {
            switch (msg.command) {
                case "resInitEnvInfo":
                    htmlRoot.value = data.htmlRoot || ""
                    __webpack_public_path__ = `${htmlRoot.value}/dist/`
                    fetchContent()
                    break
                case "resFetchContent":
                    codeOrigin.value = data.text || ""
                    language.value = data.language || ""
                    nextTick(() => {
                        readyToRender.value = true
                    })
                    break
                case "resConfirmReplacement":
                    fetchContent()
                    break

            }
        }
    })
}

const initEnvInfo = () => {
    getHBuilderX().postMessage({
        command: "initEnvInfo"
    })
}


const readyToRender = ref(false)
/**
 * 示例通信：获取编辑器中选择的文本
 */
const fetchContent = () => {
    getHBuilderX().postMessage({
        command: "fetchContent"
    })
}

onMounted(() => {
    nextTick(() => {
        // hbx ready之后进行初始化操作
        window.addEventListener('hbuilderxReady', () => {
            // 初始化通信监听
            initMessage()
            // 如果需要在webview窗口打开时进行数据交换，可以这样做
            setTimeout(() => {
                // 这个时候的window.postMessageToHX是已经初始化完成了的
                initEnvInfo()
            }, 0)
        })
        window.addEventListener("resize", () => syncConfig())
    })
})


</script>
<style lang="scss" scoped>
@import "HomeView.scss";

#home {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 1rem;
    box-sizing: border-box;
}
</style>
