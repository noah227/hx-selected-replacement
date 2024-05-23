<template>
    <div id="home">
        <div id="controls">
            <div id="input-area">
                <input v-model="filter.searchContent" type="text" placeholder="搜索"/>
                <input v-model="filter.replacement" type="text" placeholder="替换内容"/>
            </div>
            <div id="splitter"></div>
            <div id="filter-area">
                <div title="大小写">
                    <input id="enable-case-sensitive" v-model="filter.caseSensitive" type="checkbox"/>
                    <label for="enable-case-sensitive">Cc</label>
                </div>
                <div title="正则">
                    <input id="use-regex" v-model="filter.useRegex" type="checkbox"/>
                    <label for="use-regex">.*</label>
                </div>
            </div>
        </div>
        <div id="content-area">
            <Editor ref="refCodeOriginEditor" v-model="codeOrigin" language="javascript"></Editor>
            <Editor ref="refCodeReplacedEditor" v-model="codeReplaced" language="javascript" readonly></Editor>
        </div>
    </div>
</template>

<script lang="ts" setup>
import {getHBuilderX} from "@/hx/index"
import {computed, nextTick, onMounted, ref, shallowRef, watch} from "vue";
import "raw-beautify/dist/default/input.css"
import Editor from "./Editor.vue"
import {TFilter} from "@/views/Home";

/** HBuilderX **/
const initMessage = () => {
    // hbx面板上的按钮事件处理
    getHBuilderX().onDidReceiveMessage((msg: any) => {
        if (msg.type == 'DialogButtonEvent') {
            let button = msg.button
            if (button == '关闭') {
                getHBuilderX().postMessage({
                    command: "close"
                })
            }
        }
    })
}

const initArgs = () => {
    getHBuilderX().postMessage({
        command: "initArgs"
    })
}

const filter = ref<TFilter>({
    searchContent: "",
    replacement: "",
    useRegex: false,
    caseSensitive: false
})
const refCodeOriginEditor = shallowRef()
const refCodeReplacedEditor = shallowRef()
const codeOrigin = ref("console.log(999999)")
const codeReplaced = computed(() => {
    const {searchContent, replacement} = filter.value
    if (searchContent && replacement) {
        const {useRegex, caseSensitive} = filter.value
        if (useRegex) {
            const flagList: string[] = []
            if (!caseSensitive) flagList.push("i")
            flagList.push("g")
            console.log(new RegExp(searchContent, flagList.join("")))
            return codeOrigin.value.replaceAll(new RegExp(searchContent, flagList.join("")), replacement)
        }
        return codeOrigin.value.replaceAll(searchContent, replacement)
    }
    return codeOrigin.value
})
watch(() => filter.value, () => {
    updateHighlight()
}, {deep: true})

const updateTid = ref(0)
const updateHighlight = () => {
    updateTid.value && clearTimeout(updateTid.value)
    updateTid.value = setTimeout(() => {
        refCodeOriginEditor.value.updateHighlight(filter.value)
    }, 200) as any
}

onMounted(() => {
    // registerDocumentKeyEvents()
    nextTick(() => {
        window.addEventListener('hbuilderxReady', () => {
            initMessage()
            setTimeout(() => initArgs(), 1000)
        })
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
