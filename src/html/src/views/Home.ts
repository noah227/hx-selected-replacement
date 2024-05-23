export type TFilter = {
    searchContent: string
    replacement: string
    useRegex: boolean
    caseSensitive: boolean
}

export const createRegexFlags = ({caseSensitive}: { caseSensitive: boolean }) => {
    const flagList: string[] = []
    if (!caseSensitive) flagList.push("i")
    flagList.push("g")
    return flagList.join("")
}
