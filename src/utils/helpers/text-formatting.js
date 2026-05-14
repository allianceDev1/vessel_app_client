export const toStandardText = (text = "") => {
    return text
        .toLowerCase()                // approval_pending
        .split("_")                   // ["approval", "pending"]
        .map(word =>
            word?.charAt(0).toUpperCase() + word.slice(1)
        )                             // ["Approval", "Pending"]
        .join(" ");                   // "Approval Pending"
};

export const serviceChargeSort = (chargeType) => {
    if (!chargeType) {
        return ''
    }

    let short = null

    switch (chargeType) {
        case 'PURCHASE_COST':
            short = 'PC'
            break;

        case 'PACKAGE_PRICE':
            short = 'P2'
            break;

        case 'SELLING_RATE':
            short = 'SR'
            break;

        default:
            short = null
            break;
    }

    return short
}

export const convertAmount = (amount) => {

    if (!Number(amount) && Number(amount) !== 0) {
        return 'Error'
    }

    if (amount < 1000) {
        return amount?.toLocaleString("en-IN"); // Keep as is
    } else if (amount >= 1000 && amount < 10000) {
        return (amount / 1000).toFixed(2) + "K"; // Convert to Thousand (K)
    } else if (amount >= 10000 && amount < 100000) {
        return (amount / 1000).toFixed(2) + "K"; // Convert to 10K+
    } else if (amount >= 100000 && amount < 10000000) {
        return (amount / 100000).toFixed(2) + "L"; // Convert to Lakhs (L)
    } else {
        return (amount / 10000000).toFixed(2) + "Cr"; // Convert to Crores (Cr)
    }
}