export const toStandardText = (text = "") => {
    return text
        .toLowerCase()                // approval_pending
        .split("_")                   // ["approval", "pending"]
        .map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        )                             // ["Approval", "Pending"]
        .join(" ");                   // "Approval Pending"
};

export const serviceChargeSort = (chargeType) => {
    if (!chargeType) {
        return ''
    }

    let short = null

    switch (chargeType) {
        case 'purchase_rate':
            short = 'PR'
            break;

        case 'discount_rate':
            short = 'DR'
            break;

        case 'selling_rate':
            short = 'SR'
            break;

        default:
            short = null
            break;
    }

    return short
}