import { normalizeDate } from "../helpers/date-helpers";

export const buildCustomerPGStretcher = (products = []) => {
    const vessels = products.filter(p => p.product_type === 'Vessel');
    const addOns = products.filter(p => p.product_type === 'Add-On');

    // Group vessels by order prefix (A, B, C, etc.)
    const vesselGroups = {};
    vessels.forEach(vessel => {
        const prefix = vessel.order_id.charAt(0);
        if (!vesselGroups[prefix]) {
            vesselGroups[prefix] = [];
        }
        vesselGroups[prefix].push(vessel);
    });



    // Sort vessels within each group by their number
    Object.keys(vesselGroups).forEach(prefix => {
        vesselGroups[prefix].sort((a, b) => {
            const numA = parseInt(a.order_id.slice(1));
            const numB = parseInt(b.order_id.slice(1));
            return numA - numB;
        });
    });

    // Convert to array format
    const result = [];

    // Add vessel groups
    Object.keys(vesselGroups).sort().forEach(prefix => {
        result.push(vesselGroups[prefix]);
    });

    // Add each add-on as separate array
    addOns.forEach(addOn => {
        result.push([addOn]);
    });

    return result
}

export const getUpcomingServiceType = (serviceDate = null, expireDate = null,) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thresholdDate = new Date(today);
    thresholdDate.setDate(thresholdDate.getDate() + 30);

    const expiry = normalizeDate(expireDate);
    const service = normalizeDate(serviceDate);

    // Explicit priority: RENEWAL > SERVICE
    if (expiry && expiry <= thresholdDate) {
        return 'RENEWAL';
    }

    if (service && service <= thresholdDate) {
        return 'SERVICE';
    }

    return null;

}