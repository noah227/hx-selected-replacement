type THBuilderX = {
    postMessage: (arg: { [index: string]: any }) => void
} & any
export const getHBuilderX = () => {
    const _ = (window as any).hbuilderx
    if (!_) console.warn("未获取到hbuilder对象，如果是直接进行的vue页面调试，可忽略本警告")
    return _ ? _ : {
        postMessage: (...args: any) => null
    } as THBuilderX
}
