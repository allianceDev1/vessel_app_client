export const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text)
        return { success: true }
    } catch (err) {
        return { success: false }
    }
}

export const createBatchProgress = (setProgress) => {
    const progresses = {};

    return (key, percent) => {
        progresses[key] = percent;

        const values = Object.values(progresses);
        const total = values.reduce((a, b) => a + b, 0);
        const avg = Math.round(total / values.length);

        setProgress(avg);
    };
};