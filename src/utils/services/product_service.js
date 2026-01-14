import { packageExpireTypes } from "../../assets/javascript/pre_data/package.js";
import { normalizeDate } from "../helpers/date-helpers.js";
import { TbDropletCog, TbDropletHeart, TbDropletStar } from "react-icons/tb";


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

export const setupAvailableServiceCategories = (categories, product, productEligibility, regData) => {
    const arrangedCategories = categories?.map((c) => {

        let is_disable = false, disable_reason = null, icon = null;

        const categoryServiceLimit = c?.service_limit || 0;

        switch (c?.mode) {
            case 'COMPLAINT':
                icon = <TbDropletCog />

                if (!productEligibility?.complaint) {
                    is_disable = true
                    disable_reason = productEligibility?.complaint_note
                } else if (regData?.service_type !== 'COMPLAINT') {
                    is_disable = true
                    disable_reason = "It is not complaint registration."
                } else if (categoryServiceLimit && categoryServiceLimit <= product?.package?.total_complaints) {
                    is_disable = true
                    disable_reason = 'The service limit reached'
                }

                break;

            case 'SERVICE':
                icon = <TbDropletHeart />

                if (!productEligibility?.service) {
                    is_disable = true
                    disable_reason = productEligibility?.service_note
                } else if (categoryServiceLimit && categoryServiceLimit <= product?.package?.total_services) {
                    is_disable = true
                    disable_reason = 'The service limit reached'
                }

                break;

            case 'RENEWAL':
                icon = <TbDropletStar />

                if (!productEligibility?.renewal) {
                    is_disable = true
                    disable_reason = productEligibility?.renewal_note
                } else if (!productEligibility?.ssp_renewal && c?.category_id === 'ssp_renewal') {
                    is_disable = true
                    disable_reason = productEligibility?.ssp_renewal_note
                } else if (!c?.target_package?.package_id) {
                    is_disable = true
                    disable_reason = 'The renewal target package is not active'
                } else if (categoryServiceLimit && categoryServiceLimit <= product?.package?.total_renewals) {
                    is_disable = true
                    disable_reason = 'The service limit reached'
                }

                break;

            default:
                break;
        }

        return { ...c, icon, is_disable, disable_reason }
    })

    return arrangedCategories
}