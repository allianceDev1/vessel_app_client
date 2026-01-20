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

// find spare amount type
/**
 * Resolve pricing values for a spare item
 * @param {Object} spare
 * @param {'selling_rate' | 'discount_rate' | 'purchase_rate'} amountType
 * @param {boolean} warranty
 * @returns {{ list_price: number, charged: number, ledger_cost: number }}
 */
export const findSpareTypeAmount = (spare, amountType, warranty = false) => {
    if (!spare || !amountType) {
        throw new Error('Invalid arguments');
    }

    const {
        selling_rate = 0,
        discount_rate = 0,
        purchase_rate = 0
    } = spare;

    let pricing;
    let reason = null;

    switch (amountType) {
        case 'selling_rate':
            pricing = {
                list_price: selling_rate,
                charged: selling_rate,
                ledger_cost: selling_rate
            };
            break;

        case 'discount_rate':
            pricing = {
                list_price: selling_rate,
                charged: discount_rate,
                ledger_cost: discount_rate
            };
            break;

        case 'purchase_rate':
            pricing = {
                list_price: selling_rate,
                charged: 0,
                ledger_cost: purchase_rate
            };
            reason = 'Zero fee category'
            break;

        default:
            throw new Error(`Unsupported amountType: ${amountType}`);
    }

    // Warranty override (only charged becomes zero)
    if (warranty === true) {
        pricing.charged = 0;
    }

    return { ...pricing, reason };
};
