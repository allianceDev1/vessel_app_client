
// find spare amount type
/**
 * Resolve pricing values for a spare item
 * @param {Object} spare
 * @param {'selling_rate' | 'discount_rate' | 'purchase_rate'} amountType
 * @param {boolean} warranty
 * @returns {{ list_price: number, charged: number, ledger_cost: number }}
 */
export const findSpareTypeAmount = (
    sparePriceList = {},
    amountType = 'SELLING_RATE',
    servicePackageId = null,
    warranty = false
) => {

    const {
        selling_rate = 0,
        purchase_cost = 0,
        ...packagePricing
    } = sparePriceList ?? {};

    let pricing;
    let reason = null;

    switch (amountType) {
        case 'SELLING_RATE':
            pricing = {
                list_price: selling_rate,
                charged: selling_rate
            };
            break;

        case 'PURCHASE_COST':
            pricing = {
                list_price: selling_rate,
                charged: 0
            };
            reason = 'Zero price coverage item'
            break;

        case 'PACKAGE_PRICE':
            pricing = {
                list_price: selling_rate,
                charged: packagePricing?.[servicePackageId] ?? selling_rate
            };
            break;

        default:
            throw new Error(`Unsupported amountType: ${amountType}`);
    }

    // Warranty override (only charged becomes zero)
    if (warranty === true) {
        pricing.charged = 0;
        pricing.reason = 'Spare warranty override';
    }

    return { ...pricing, reason };
};

export const findTdsStatus = (inputValue = 0, outputValue = 0, productInfo = {}) => {

    if (typeof inputValue !== 'number' || typeof outputValue !== 'number') {
        throw Error('TDS inValue / outValue is not Number')
    }

    // NO
    if (!inputValue || !outputValue) {
        return 'NO'
    }

    // LOW
    if (outputValue < 5) {
        return 'LOW'
    }

    // TYPE : UV
    if (productInfo?.hasUV) {
        if (outputValue > (inputValue + 50)) {
            return 'HIGH'
        } else {
            return 'NORMAL'
        }
    }

    // TYPE : ALKALINE
    if (productInfo?.hasAlkaline) {
        if (outputValue > ((inputValue * 0.15) + 40)) {
            return 'HIGH'
        } else {
            return 'NORMAL'
        }
    }

    // Input TDS < 50
    if (inputValue < 50) {
        if (outputValue > 10) {
            return 'HIGH'
        } else {
            return "NORMAL"
        }
    }


    // TYPE : RO only
    if (outputValue > (inputValue * 0.15)) {
        return 'HIGH'
    } else {
        return 'NORMAL'
    }

}

export const findFilteredWaterFlowStatus = (flowValue = 0, criteria = 11) => {

    if (typeof flowValue !== 'number' || typeof criteria !== 'number') {
        throw Error('Value is not Number')
    }

    // NO
    if (!flowValue || flowValue === 0) {
        return 'NO'
    }

    // LOW
    if (flowValue < criteria) {
        return 'LOW'
    }

    // NORMAL
    if (flowValue >= criteria) {
        return 'NORMAL'
    }

}

export const findRejectWaterFlowStatus = (flowValue = 0, frValue = 0) => {

    if (typeof flowValue !== 'number' || typeof frValue !== 'number') {
        throw Error('Flow value / fr value is not Number')
    }

    // NO
    if (!flowValue || !frValue) {
        return 'NO'
    }

    // LOW
    if (flowValue < frValue) {
        return 'LOW'
    }

    // TYPE : RO only
    if (flowValue >= frValue) {
        return 'NORMAL'
    }

}

export const findPhStatus = (phValue = 0) => {

    if (typeof phValue !== 'number') {
        throw Error('Value is not Number')
    }

    // NO
    if (!phValue || phValue === 0) {
        return 'NO'
    }

    // LOW
    if (phValue < 6.5) {
        return 'LOW'
    }

    // HIGH
    if (phValue > 8.5) {
        return 'HIGH'
    }

    // NORMAL
    return 'NORMAL'

}