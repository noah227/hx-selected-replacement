<template>
    <div ref="refMonaco" class="editor">

    </div>
</template>

<script lang="ts" setup>
import * as monaco from "monaco-editor"
import {editor, Range} from "monaco-editor"
import {computed, onMounted, ref, shallowRef, watch} from "vue";
import {createRegexFlags, TFilter} from "@/views/Home";
import FindMatch = editor.FindMatch;
import IEditorDecorationsCollection = editor.IEditorDecorationsCollection;


const props = defineProps({
    modelValue: {
        type: String,
        required: true
    },
    language: {
        type: String,
        required: true
    },
    readonly: Boolean
})

const emits = defineEmits(["update:modelValue", "save"])

const _value = ref(props.modelValue)

watch(() => props.modelValue, v => {
    if (!refMonacoInstance.value) return
    clearDecorations()
    refMonacoInstance.value.setValue(v)
})

watch(() => props.language, lang => {
    refMonacoInstance.value.updateOptions({language: lang})
})

watch(() => _value.value, v => {
    if (props.readonly) return
    emits("update:modelValue", v)
})

const refMonaco = shallowRef()
const refMonacoInstance = shallowRef()

const tid = ref<any>(0)
const getEditorValue = () => new Promise((resolve, reject) => {
    clearTimeout(tid.value)
    tid.value = setTimeout(() => resolve(refMonacoInstance.value.getValue()), 500)
})

const editorOptions = computed(() => ({
    value: _value.value,
    language: props.language,
    automaticLayout: true,
    autoFocus: true,
    minimap: {enabled: false},
    locale: "zh_CN",
    readOnly: props.readonly
    // theme: "vs-dark"
}))

/**
 * 动态同步Editor的语言设置
 */
watch(() => editorOptions.value.language, language => {
    if (!refMonacoInstance.value) return
    const model = refMonacoInstance.value.getModel()
    model.setLanguage(language)
})

const initEditor = () => {
    // 默认格式化快捷键alt+shift+f todo 似乎内置没有css语法提示
    refMonacoInstance.value = monaco.editor.create(refMonaco.value, {
        ...editorOptions.value
    })
    // 编辑器变化事件监听
    refMonacoInstance.value.onDidChangeModelContent(() => {
        console.log("CHANGE")
        getEditorValue().then((v) => {
            if (typeof v === "string") _value.value = v
        }).catch(e => console.error(e))
    })
    const keyBindingList = [
        // 格式化
        [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Alt | monaco.KeyCode.KeyL, "editor.action.format"],
        // 换行
        [monaco.KeyMod.Shift | monaco.KeyCode.Enter, "editor.action.insertLineAfter"],
        // 删除行
        [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyY, "editor.action.deleteLines"],
        // 复制
        [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyD, "editor.action.duplicateSelection"]
    ]
    keyBindingList.forEach(([k, action]) => {
        refMonacoInstance.value.addCommand(k, () => {
            refMonacoInstance.value.trigger("", action)
        })
    })
    refMonacoInstance.value.focus()
}

const editorDecorations = shallowRef<IEditorDecorationsCollection[]>([])

defineExpose({
    setValue(value: string) {
        refMonacoInstance.value.setValue(value)
    },
    updateHighlight({searchContent, replacement, useRegex, caseSensitive}: TFilter) {
        // const domNode = refMonaco.value.getOriginalEditor().getDomNode
        // console.log(domNode)
        clearDecorations()
        matchAndHighlight({searchContent, replacement, useRegex, caseSensitive})
    }
})

const clearDecorations = () => {
    editorDecorations.value.forEach(editorDecoration => {
        editorDecoration.clear()
    })
}

// 主要是检测下regex是否合法
const prepareMatch = ({searchContent, useRegex}: TFilter) => new Promise((resolve, reject) => {
    try {
        (!useRegex || new RegExp(searchContent)) && resolve(true)
    } catch (e) {

    }
})

const matchAndHighlight = (filter: TFilter) => {
    const {searchContent: searchStr, replacement, useRegex, caseSensitive} = filter
    prepareMatch(filter).then(() => {
        const matches = refMonacoInstance.value.getModel().findMatches(searchStr, true, useRegex, caseSensitive) as FindMatch[]
        console.log(matches)
        matches.forEach(({range}) => {
            const {startColumn, startLineNumber, endColumn, endLineNumber} = range
            editorDecorations.value.push(
                refMonacoInstance.value.createDecorationsCollection([
                    {
                        range: new monaco.Range(startLineNumber, startColumn, endLineNumber, endColumn),
                        options: {
                            inlineClassName: replacement ? "search-str-matched in-replace-mode" : "search-str-matched",
                            // linesDecorationsTooltip: replacement ? createTooltip(range, filter) : "",
                            after: replacement ? {
                                content: createMatchedAfterContent(range, filter),
                                inlineClassName: "search-str-matched--after"
                            } : undefined,
                        }
                    }
                ])
            )
        })
    })
}

const createMatchedAfterContent = (range: Range, {searchContent, replacement, useRegex, caseSensitive}: TFilter) => {
    const content = refMonacoInstance.value.getModel().getValueInRange(range)
    const replaced = content.replaceAll(new RegExp(searchContent, createRegexFlags({caseSensitive})), replacement)
    console.log(content, replaced, "<<<<<<<<<")
    return replaced
}

onMounted(() => {
    initEditor()
})
</script>

<style lang="scss">
@import "common";
@import "common.variables";

.editor {
    border: 1px solid $border-color;
}

.margin:first-child {
    border-right: 1px solid $border-color;
    box-sizing: border-box;
}

.search-str-matched {
    background-color: yellow;

    &.in-replace-mode {
        text-decoration: line-through;
    }
}

/* 如果需要自然也是可以通过position设置成tooltip样式的 */
.search-str-matched--after {
    background-color: #999;
    color: #fff !important;
    border-radius: 3px;
    padding: 0 3px;
    margin: 0 3px;
}
</style>
