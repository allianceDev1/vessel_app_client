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