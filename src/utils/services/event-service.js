export const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text)
        return { success: true }
    } catch (err) {
        return { success: false }
    }
}

