import { findSpareTypeAmount } from "../flows/service_form_utils.js"
import { calculateTaxAmount, toDecimal } from "../helpers/math-equations.js"
import { normalizeDate } from "../helpers/date-helpers.js"

const MONEY_TOLERANCE = 0.01
const UI_ONLY_CATEGORY_KEYS = ['icon', 'is_disable', 'disable_reason']

// ---------- helpers ----------

const stableStringify = (value) => {
    if (value === undefined) return 'null'
    if (value === null || typeof value !== 'object') return JSON.stringify(value)
    if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`
    return `{${Object.keys(value).sort()
        .filter(k => value[k] !== undefined)
        .map(k => `${JSON.stringify(k)}:${stableStringify(value[k])}`).join(',')}}`
}

const isSame = (a, b) => stableStringify(a) === stableStringify(b)

const sameMoney = (a, b) => Math.abs(Number(a || 0) - Number(b || 0)) <= MONEY_TOLERANCE

const omit = (obj, keys) => {
    const out = { ...(obj || {}) }
    keys.forEach(k => delete out[k])
    return out
}

const findCoverage = (category, coverageId, position) =>
    category?.coverage?.find(c => c?.coverage_id === coverageId && c?.position === position) || null

const isDateActive = (date) =>
    Boolean(date && normalizeDate(new Date()) <= normalizeDate(new Date(date)))

const safeSpareAmount = (pricing, priceType, packageId, warranty = false) => {
    try {
        return findSpareTypeAmount(pricing || {}, priceType || 'SELLING_RATE', packageId || null, warranty)
    } catch (e) {
        return null
    }
}

// ---------- per product group checks ----------

const verifyCategory = (ctx, err) => {
    const { stored, resProduct, resources } = ctx
    const sd = stored?.service_data
    const sc = stored?.service_category

    if (!sd?.category_id) return null

    const category = resources?.service_categories?.find(c =>
        c?.category_id === sd.category_id && (c?.package_id || null) === (sd.package_id || null)
    ) || null

    if (!category) {
        const anyCategory = resources?.service_categories?.find(c => c?.category_id === sd.category_id)
        err(anyCategory
            ? 'Selected service category is now linked to a different package.'
            : 'Selected service category no longer exists.')
        return null
    }

    // package
    const resPackageId = resProduct?.package?.package_id || null
    if (sd.package_id) {
        if (!resPackageId) err('The product package no longer exists.')
        else if (resPackageId !== sd.package_id) err('The product package has changed.')
    } else if (resPackageId && category.package_id) {
        err('The product now has a package.')
    }

    // category info
    if (sc) {
        const current = omit(category, UI_ONLY_CATEGORY_KEYS)
        const saved = omit(sc, UI_ONLY_CATEGORY_KEYS)
    
        if (!isSame(saved.coverage, current.coverage)) err('Service category coverage has changed.')
        if (!isSame(saved.service_charges, current.service_charges)) err('Service category service charges have changed.')
        if (!isSame(saved.target_package, current.target_package)) err('Service category target package info has changed.')

        const rest = (o) => omit(o, ['coverage', 'service_charges', 'target_package'])
        if (!isSame(rest(saved), rest(current))) err('Service category details have changed.')
    }

    // service charge index
    if (sd.service_charge_applied && !category.service_charges?.length) {
        err('Service charge is no longer available for this category.')
    } else if (sd.service_charge) {
        const len = category.service_charges?.length || 0
        if (sd.service_charge.charge_index >= len || sd.service_charge.start_index >= len) {
            err('Selected service charge is no longer available.')
        }
    }

    // renewal
    if (category.mode === 'RENEWAL' && sd.renewed_package?.is_renewed) {
        const target = category.target_package
        if (sd.renewed_package.package_id !== target?.package_id) {
            err('Renewal target package has changed.')
        } else {
            const base = target?.pricing_config?.base_price || 0
            const taxRate = target?.pricing_config?.gst?.rate || 0
            const taxType = target?.pricing_config?.gst?.type || null
            const tax = taxRate ? calculateTaxAmount(base, taxRate, taxType) : 0
            const total = toDecimal(base + (tax?.total_tax || 0), { precision: 2 })
            if (!sameMoney(sd.renewed_package?.price?.total_rate, total) ||
                !sameMoney(sd.renewed_package?.price?.base_rate, base)) {
                err('Renewal package price has changed.')
            }
        }
    }

    // repeat
    const repeatWork = resources?.repeat_works?.find(r => r?.product_id === ctx.productId) || null
    if (sd.repeat) {
        if (Boolean(sd.repeat.system_say) !== Boolean(repeatWork)) err('Repeat service status has changed.')
        else if (repeatWork && Boolean(sd.repeat.same_registration) !== Boolean(repeatWork.same_registration)) {
            err('Repeat registration status has changed.')
        }
    }

    // product warranty
    const productWarranty = Boolean(!category.package_id && isDateActive(resProduct?.product?.wr_expire_date))
    if (Boolean(sd.has_product_warranty) !== productWarranty) err('Product warranty status has changed.')

    return { category, productWarranty }
}

const verifyWorks = (ctx, err) => {
    const { stored, resources, productType, category, productWarranty } = ctx
    const packageId = stored?.service_data?.package_id || null

    stored?.work?.services_list?.forEach((item) => {
        const work = resources?.service_work_list?.find(w => w?.work_uuid === item?.work_uuid)
        const label = work?.work_name || item?.work_uuid

        if (!work) return err(`Service work "${label}" no longer exists.`)
        if (!work.applicable_for?.includes(productType)) err(`Service work "${label}" is no longer applicable for this product.`)
        if (work.is_active === false) err(`Service work "${label}" is inactive.`)

        const isRenewal = item?.selection_context === 'RENEWAL_SERVICE'
        const coverage = findCoverage(category, 'SERVICE_WORK', isRenewal ? 'TARGET' : 'CURRENT')
        if (!coverage?.access) return err(`Service work "${label}" is not covered by the service category now.`)

        const priceType = isRenewal ? 'PURCHASE_COST'
            : packageId && item?.selection_context === 'ADDITIONAL_SERVICE' ? 'SELLING_RATE'
                : coverage.price_type
        const hasWarranty = Boolean(!isRenewal && productWarranty)
        const expected = safeSpareAmount(work.pricing, priceType, packageId, hasWarranty)

        if (!expected) return err(`Service work "${label}" has an unsupported price type.`)
        if (!sameMoney(item?.pricing?.list_price, expected.list_price)) {
            err(`Service work "${label}" rate changed (was ₹${item?.pricing?.list_price ?? 0}, now ₹${expected.list_price}).`)
        } else if (!sameMoney(item?.pricing?.charged, expected.charged)) {
            err(`Service work "${label}" charge changed by policy/warranty (was ₹${item?.pricing?.charged ?? 0}, now ₹${expected.charged}).`)
        }
    })
}

const verifySpares = (ctx, err) => {
    const { stored, resources, resProduct, productType, category, productWarranty } = ctx
    const packageId = stored?.service_data?.package_id || null
    const productSpares = resProduct?.product?.spares || []

    stored?.work?.components_list?.forEach((item) => {
        const spare = resources?.spare_list?.find(s => s?.spare_uuid === item?.spare_uuid)
        const label = spare?.spare_name || item?.spare_uuid

        if (!spare) return err(`Spare "${label}" no longer exists.`)
        if (!spare.applicable_for?.includes(productType)) err(`Spare "${label}" is no longer applicable for this product.`)
        if (spare.is_active === false) err(`Spare "${label}" is inactive.`)

        const isRenewal = item?.selection_context === 'RENEWAL_SPARE'
        const coverage = findCoverage(category, 'SPARE_PARTS', isRenewal ? 'TARGET' : 'CURRENT')
        if (!coverage?.access) err(`Spare "${label}" is not covered by the service category now.`)

        const priceType = isRenewal ? 'PURCHASE_COST'
            : packageId && item?.selection_context === 'ADDITIONAL_SPARE' ? 'SELLING_RATE'
                : coverage?.price_type
        const expected = safeSpareAmount(spare.pricing, priceType, packageId, false)
        if (!expected) return err(`Spare "${label}" has an unsupported price type.`)

        let expectedCharged = expected.charged

        // product spare checks
        if (item?.section_id === 'PRODUCT_SPARE') {
            const productSpare = productSpares.find(p => p?.component_uuid === item?.component_uuid)
            if (!productSpare) {
                err(`Spare "${label}" no longer exists in the product spares.`)
            } else {
                if (item?.original_spare_uuid && item.original_spare_uuid !== productSpare.spare_uuid) {
                    err(`Product spare for "${label}" has changed.`)
                }
                if (productSpare.is_active === false) err(`Product spare "${label}" is inactive.`)

                const spareWarranty = isDateActive(productSpare.wr_expire_date)
                const hasWarranty = Boolean(!isRenewal && (spareWarranty || productWarranty))
                if (Boolean(item?.is_warranty_item) !== hasWarranty) {
                    err(`Spare "${label}" warranty has changed.`)
                }

                // policy effect
                switch (item?.policy_mode) {
                    case 'WARRANTY':
                    case 'PAID_ZERO_OVERRIDE':
                        expectedCharged = 0
                        break
                    case 'PAID_CUSTOM':
                        expectedCharged = item?.pricing?.charged
                        break
                    default:
                        break
                }
            }
        }

        if (!sameMoney(item?.pricing?.list_price, expected.list_price)) {
            err(`Spare "${label}" rate changed (was ₹${item?.pricing?.list_price ?? 0}, now ₹${expected.list_price}).`)
        } else if (!sameMoney(item?.pricing?.charged, expectedCharged)) {
            err(`Spare "${label}" charge changed by policy/rate (was ₹${item?.pricing?.charged ?? 0}, now ₹${expectedCharged}).`)
        }

        const expectedMonths = Number(item?.pricing?.charged) > 0 && spare.warranty_period ? spare.warranty_period : 0
        if (item?.purchase_warranty_months !== undefined && Number(item.purchase_warranty_months || 0) !== Number(expectedMonths)) {
            err(`Spare "${label}" warranty period has changed.`)
        }
    })

    stored?.work?.removed_components_list?.forEach((item) => {
        if (!productSpares.some(p => p?.component_uuid === item?.component_uuid)) {
            err('A removed product spare no longer exists in the product spares.')
        }
    })
}

// ---------- main ----------

/**
 * Verify the stored service form data against freshly loaded form resources.
 * Only products already stored in the service form are checked.
 */
export const serviceFormResourcesVerification = (formResources, serviceForm) => {
    const result = { success: true, message: null, general_errors: [], products: {} }

    if (!formResources || !serviceForm) {
        return { ...result, success: false, message: 'Form data or resources missing.', general_errors: ['Form data or resources missing.'] }
    }

    const storedProducts = serviceForm?.service_products || {}

    Object.entries(storedProducts).forEach(([productId, stored]) => {
        const resProduct = formResources?.products?.find(p => p?.product_id === productId) || null
        const errors = []
        const err = (m) => errors.push(m)

        const productType = resProduct?.product_type || null

        try {
            if (!resProduct) {
                err('Product not found in the resources.')
            } else if (stored) {
                const ctx = { stored, resProduct, resources: formResources, productId, productType }
                const cat = verifyCategory(ctx, err)
                if (cat) {
                    ctx.category = cat.category
                    ctx.productWarranty = cat.productWarranty
                    verifyWorks(ctx, err)
                    verifySpares(ctx, err)
                }
            }
        } catch (e) {
            err(`Verification failed: ${e?.message || 'unknown error'}`)
        }

        result.products[productId] = {
            success: !errors.length,
            product_id: productId,
            product_name: resProduct?.product?.product_name || resProduct?.product_name || productId,
            product_type: productType,
            errors: [...new Set(errors)]
        }
    })

    const failed = Object.values(result.products).filter(p => !p.success)
    if (failed.length || result.general_errors.length) {
        result.success = false
        result.message = `${failed.length} product(s) have conflicts with the updated resources.`
    }

    return result
}