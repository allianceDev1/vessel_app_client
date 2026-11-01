
import { normalizeDate } from "../helpers/date-helpers.js";
import { TbDropletCog, TbDropletHeart, TbDropletStar } from "react-icons/tb";


export const buildCustomerPGStretcher = (products = []) => {

    const purifier = products.filter(p => p.product_type === 'WATER_PURIFIER')?.map(p => p?.product_id);
    const vessels = products.filter(p => p.product_type === 'VESSEL_FILTER')?.map(p => p?.product_id);
    const addOns = products.filter(p => p.product_type === 'ADD_ON')?.map(p => p?.product_id);

    const productStretcher = []

    // ? Water purifier
    if (purifier?.length) {
        productStretcher.push({
            title: 'Water purifier',
            productIds: purifier
        })
    }

    // ? Vessel filter
    if (vessels?.length) {
        productStretcher.push({
            title: 'Vessel filter',
            productIds: vessels
        })
    }

    // ? Add-on
    if (addOns?.length) {
        productStretcher.push({
            title: 'Add-on',
            productIds: addOns
        })
    }

    return productStretcher
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

export const setupAvailableServiceCategories = (categories, serviceEligibility) => {

    const arrangedCategories = categories?.map((c) => {

        let is_disable = false, disable_reason = null, icon = null;

        const eligibility = serviceEligibility?.find(e => e?.category === c?.category_id) || null

        icon = c?.mode === 'COMPLAINT' ? <TbDropletCog />
            : c?.mode === 'SERVICE' ? <TbDropletHeart />
                : c?.mode === 'RENEWAL' ? <TbDropletStar />
                    : ''

        if (eligibility && eligibility?.isEligible) {
            is_disable = false
            disable_reason = null
        } else if (eligibility && !eligibility?.isEligible) {
            is_disable = true
            disable_reason = 'Service not eligible. Review customer product details.'
        } else {
            is_disable = true
            disable_reason = 'Not apply for eligibility'
        }

        return { ...c, icon, is_disable, disable_reason }
    })

    const order = {
        COMPLAINT: 1,
        SERVICE: 2,
        RENEWAL: 3,
    };

    const sortedData = [...arrangedCategories].sort(
        (a, b) => order[a.mode] - order[b.mode]
    );


    return sortedData
}

export const setupAddOnServiceCategories = (categories, regData, productEligibility) => {
    const arrangedCategories = categories?.map((c) => {

        let is_disable = false, disable_reason = null, icon = null;

        switch (c?.mode) {
            case 'COMPLAINT':
                icon = <TbDropletCog />

                if (!productEligibility?.complaint?.[0]) {
                    is_disable = true
                    disable_reason = productEligibility?.complaint?.[1] || 'Not apply for eligibility'
                    // } else if (regData?.service_type !== 'COMPLAINT') {
                    //     is_disable = true
                    //     disable_reason = "It is not complaint registration."
                }
                break;

            case 'SERVICE':
                icon = <TbDropletHeart />

                if (!productEligibility?.service?.[0]) {
                    is_disable = true
                    disable_reason = productEligibility?.service?.[1] || 'Not apply for eligibility'
                }

                break;

            default:
                break;
        }

        return { ...c, icon, is_disable, disable_reason }
    })

    return arrangedCategories
}