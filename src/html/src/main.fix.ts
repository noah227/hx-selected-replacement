const debounce = (callback: Function, delay: number) => {
    let tid: any
    return function () {
        console.log("dd")
        const ctx = self
        tid && clearTimeout(tid);
        tid = setTimeout(() => {
            callback.apply(ctx, arguments)
        }, delay)
    }
}

export default () => {
    const _ = (window as any).ResizeObserver;
    (window as any).ResizeObserver = class ResizeObserver extends _ {
        constructor(callback: any) {
            callback = debounce(callback, 20)
            super(callback);
        }
    }
}
