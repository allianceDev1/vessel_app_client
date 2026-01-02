const MAIN_PAGE_BACK_MAP = new Map([
    [103, 102],
    [102, 101],
    [101, 100],
    [100, null] // exit
]);

const SUB_PAGE_BACK_MAP = new Map([
    [203, 202],
    [202, 201],
    [201, 200],
    [200, null]
]);

export const getPreviousServicePageKey = (mainPageKey = null, subPageKey = null) => {
    // 1️⃣ Sub page flow
    if (subPageKey !== null) {
        const prevSub = SUB_PAGE_BACK_MAP.get(subPageKey) ?? null;

        return [
            mainPageKey, // main page stays same
            prevSub
        ];
    }

    // 2️⃣ Main page flow
    if (mainPageKey !== null) {
        const prevMain = MAIN_PAGE_BACK_MAP.get(mainPageKey) ?? null;

        return [
            prevMain,
            null
        ];
    }

    // 3️⃣ Exit
    return [null, null];
}