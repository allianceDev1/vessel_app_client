export const calculatePercentage = (partValue, totalValue, decimals = 2) => {
    // Input validation
    if (typeof partValue !== 'number' || typeof totalValue !== 'number') {
        throw new Error('Both inputs must be numbers');
    }

    if (totalValue === 0) {
        throw new Error('Division by zero: totalValue cannot be zero');
    }

    if (!Number.isFinite(partValue) || !Number.isFinite(totalValue)) {
        throw new Error('Inputs must be finite numbers');
    }

    // Calculate percentage: (partValue / totalValue) × 100
    const percentage = (partValue / totalValue) * 100;

    // Round to specified decimal places
    return Number(percentage.toFixed(decimals));
};


/**
 * Calculate tax amount based on tax type
 * @param {number} baseAmount
 * @param {number} taxRate - percentage (e.g. 18 for 18%)
 * @param {string} taxType
 * @returns {{
 *   totalTax: number,
 *   breakup: Record<string, number>,
 *   totalAmount: number
 * }}
 */

export const calculateTaxAmount = (baseAmount = 0, taxRate = 0, taxType = '') => {

    const amount = Number(baseAmount) || 0;
    const rate = Number(taxRate) || 0;
    const type = taxType.toUpperCase();

    const percentValue = (amount * rate) / 100;
    const round = (value) => Number(value.toFixed(2));

    const result = {
        total_tax: 0,
        breakup: {}
    };

    switch (type) {
        case 'CGST_SGST': {
            const half = percentValue / 2;
            result.breakup = {
                CGST: round(half),
                SGST: round(half)
            };
            result.total_tax = round(percentValue);
            break;
        }

        case 'CGST': {
            result.breakup = { CGST: round(percentValue) };
            result.total_tax = round(percentValue);
            break;
        }

        case 'SGST': {
            result.breakup = { SGST: round(percentValue) };
            result.total_tax = round(percentValue);
            break;
        }

        case 'IGST': {
            result.breakup = { IGST: round(percentValue) };
            result.total_tax = round(percentValue);
            break;
        }

        case 'VAT': {
            result.breakup = { VAT: round(percentValue) };
            result.total_tax = round(percentValue);
            break;
        }

        default:
            return result;
    }

    return result;
}


/**
 * Convert any input into a safe decimal number
 * @param {any} value
 * @param {object} options
 * @param {number} options.precision - decimal places (default: 2)
 * @param {number} options.fallback - value returned if conversion fails
 * @param {boolean} options.allowNegative
 * @returns {number}
 */
export const toDecimal = (
    value,
    {
        precision = 2,
        fallback = 0,
        allowNegative = true
    } = {}
) => {

    const toFormatted = (n) => Number(n).toFixed(precision);

    if (value === null || value === undefined) return toFormatted(fallback);

    // Convert to string & clean
    let cleaned = String(value)
        .trim()
        .replace(/,/g, '')               // remove commas
        .replace(/[^\d.-]/g, '');        // remove currency & text

    if (!cleaned || cleaned === '-' || cleaned === '.') {
        return toFormatted(fallback);
    }

    let number = Number(cleaned);

    // Handle NaN & Infinity
    if (!Number.isFinite(number)) {
        return toFormatted(fallback);
    }

    // Negative handling
    if (!allowNegative && number < 0) {
        return toFormatted(fallback);
    }

    // Fix floating precision issue
    const factor = 10 ** precision;
    return ((Math.round((number + Number.EPSILON) * factor) / factor)).toFixed(precision);
};

export const normalizeMoney = (value, options) => {
    if (value == null) return toDecimal(0, options);

    // Case 1: Real Decimal128 (non-lean)
    if (value._bsontype === 'Decimal128') {
        return toDecimal(value.toString(), options);
    }

    // Case 2: Lean / Aggregate Decimal128 (Extended JSON)
    if (typeof value === 'object' && '$numberDecimal' in value) {
        return toDecimal(value.$numberDecimal, options);
    }

    // Case 3: number or string
    return toDecimal(value, options);
};

export const calculateBillTotalAmount = (items, zeroFeeItems = []) => {
    let total = 0;

    items?.map((item) => {
        if (!zeroFeeItems?.includes(item?.uuid)) {
            total = total + Number(item?.total || 0)
        }

        return item
    })

    const decimalPart = total % 1;
    total -= decimalPart;

    return total;
}

export const calculateBillsSummery = (bills = [], zeroFeeItems = [], maxDiscount = 0) => {

    const allBillTotal = bills.reduce(
        (sum, bill) =>
            sum +
            calculateBillTotalAmount(
                bill?.items ?? [],
                zeroFeeItems
            ),
        0
    );

    const compliment = maxDiscount > allBillTotal ? allBillTotal : maxDiscount
    const grandTotal = allBillTotal - compliment

    return {
        subTotal: allBillTotal,
        discount: compliment,
        grandTotal: grandTotal
    }

}


export const getGrowthPercentage = (current, previous) => {
    // handle edge case
    if (previous === 0) {
        if (current === 0) return 0;
        return 100; // or Infinity based on your business logic
    }

    const growth = ((current - previous) / previous) * 100;

    return Number(growth.toFixed(2)); // 2 decimal
}

