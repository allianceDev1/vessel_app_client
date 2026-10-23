import { calculateTaxAmount, toDecimal } from './math-equations';

/**
 * Total amount of one product in the service form
 * (renewed package + service charge + spares + works).
 * Mirrors the calculation shown in SelectedWorkSummary.
 */
export const calculateProductFormTotal = (productInForm) => {
    if (!productInForm) return 0;

    // Spares
    const spares = (productInForm?.work?.components_list ?? []).reduce(
        (acc, s) => acc + Number(s?.qty || 1) * Number(s?.pricing?.charged ?? 0), 0
    );

    // Works
    const works = (productInForm?.work?.services_list ?? []).reduce(
        (acc, w) => acc + Number(w?.pricing?.charged ?? 0), 0
    );

    // Package
    let packageAmount = 0;
    const renewedPkg = productInForm?.service_data?.renewed_package;
    const isRenewalMode = productInForm?.service_category?.mode === 'RENEWAL' || productInForm?.service_data?.mode === 'RENEWAL';

    if (renewedPkg?.is_renewed || isRenewalMode) {
        if (renewedPkg?.price?.total_rate !== undefined && renewedPkg?.price?.total_rate !== null) {
            packageAmount = Number(renewedPkg.price.total_rate) || 0;
        } else if (renewedPkg?.price?.base_rate !== undefined && renewedPkg?.price?.base_rate !== null) {
            packageAmount = Number(renewedPkg.price.base_rate) || 0;
        } else if (productInForm?.service_category?.target_package?.pricing_config) {
            const config = productInForm.service_category.target_package.pricing_config;
            const baseRate = config?.base_price || 0;
            const taxRate = config?.gst?.rate || 0;
            const taxType = config?.gst?.type || '';
            const tax = taxRate ? calculateTaxAmount(baseRate, taxRate, taxType) : 0;
            packageAmount = Number(toDecimal(baseRate + (tax?.total_tax || 0), { precision: 2 })) || 0;
        }
    }

    // Service charge
    let serviceCharge = 0;
    if (productInForm?.service_data?.service_charge_applied) {
        const isCategoryChargeApplied = Boolean(
            productInForm?.service_category?.service_charge_applied && !productInForm?.service_data?.has_product_warranty
        );

        if (isCategoryChargeApplied) {
            const rawCharge = Number(
                productInForm?.service_data?.service_charge?.estimate ??
                productInForm?.service_category?.service_charges?.[0]?.charge_amount ??
                0
            );
            const repeatActive = Boolean(
                productInForm?.service_data?.repeat?.tech_say && !productInForm?.service_data?.repeat?.same_registration
            );
            serviceCharge = repeatActive
                ? Math.max(0, rawCharge - Number(productInForm?.service_category?.service_charges?.[0]?.charge_amount || 0))
                : rawCharge;
        }
    }

    return packageAmount + serviceCharge + spares + works;
};

/**
 * Total amount of the whole current work in the service form
 * (all products + new add-ons), whole rupees (decimals dropped like the bill total).
 */
export const calculateServiceFormTotal = (serviceForm) => {
    const productsTotal = Object.values(serviceForm?.service_products ?? {}).reduce(
        (acc, product) => acc + calculateProductFormTotal(product), 0
    );

    const addOnsTotal = (serviceForm?.new_add_ons ?? []).reduce(
        (acc, item) => acc + Number(item?.total_amount?.charged || 0), 0
    );

    return Math.floor(productsTotal + addOnsTotal);
};

