export const toStandardText = (text = "", capitalizeAll = false) => {
    const words = text
        .toLowerCase()
        .split("_");

    if (capitalizeAll) {
        return words
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    }

    return words
        .map((word, index) =>
            index === 0
                ? word.charAt(0).toUpperCase() + word.slice(1)
                : word
        )
        .join(" ");
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

export const getExpiryMessage = ({
    packageDuration = false,
    remainingTokens = false,
    operator = 'OR',
}) => {
    const conditions = [];

    if (packageDuration) {
        conditions.push('the package duration ends');
    }

    if (remainingTokens) {
        conditions.push('all remaining tokens are used');
    }

    if (conditions.length === 0) {
        return '';
    }

    if (conditions.length === 1) {
        return `The package will expire when ${conditions[0]}.`;
    }

    const joiner = operator === 'AND' ? ' and ' : ' or ';

    return `The package will expire when ${conditions.join(joiner)}.`;
};


export const textSortFormate = (text) => {
    if (!text) {
        return ''
    }

    let short = null

    switch (text) {
        case 'PURCHASE_COST':
            short = 'PC'
            break;

        case 'PACKAGE_PRICE':
            short = 'P2'
            break;

        case 'SELLING_RATE':
            short = 'SR'
            break;

        case 'WATER_PURIFIER':
            short = 'WP'
            break;

        case 'VESSEL_FILTER':
            short = 'VF'
            break;

        default:
            short = null
            break;
    }

    return short
}

export const maskPhoneNumber = (number) => {
    if (!number) return '';
    const str = String(number).trim();
    const digits = str.replace(/\D/g, '');

    if (digits.length < 6) {
        return str;
    }

    const core = digits.length >= 10 ? digits.slice(-10) : digits;
    const first3 = core.slice(0, 2);
    const last4 = core.slice(-4);
    const middleCount = Math.max(core.length - 6, 2);

    return `${first3}${'*'.repeat(middleCount)}${last4}`;
};
