export const validateUpdatePackageForm = (form) => {
    const errors = {}
    // package name
    if (!form.package_name?.trim()) {
        errors.package_name = "Package name is required"
    } else if (form.package_name.trim().length > 5) {
        errors.package_name = "Max length is 5 characters"
    }

    // Full form
    if (!form.full_form?.trim()) {
        errors.full_form = "Package full form is required"
    }

    // Color code
    if (!form.color_code?.trim()) {
        errors.color_code = "Package color is required"
    }

    // duration (0 allowed, -1 not allowed)
    if (Number(form.package_duration_months) < 0) {
        errors.package_duration_months = "Invalid duration value"
    }

    // work limit (0 allowed, -1 not allowed)
    if (Number(form.tokens_count) < 0) {
        errors.tokens_count = "Invalid tokens value"
    }

    // if more than one expire type => query operator required
    if (form.expire_types.length > 1 && !form.et_query_operator) {
        errors.et_query_operator = "Query operator required for multiple expiration types"
    }

    // If package fund is zero and other charges entered
    if (Number(form.package_fund) === 0 && Number(form?.gst_rate)) {
        errors.gst_rate = "Clear your gst rate to continue"
    }
    if (Number(form.package_fund) === 0 && Number(form?.service_work_fund)) {
        errors.service_work_fund = "Clear your service fund to continue"
    }
    if (Number(form.package_fund) === 0 && Number(form?.spare_parts_fund)) {
        errors.spare_parts_fund = "Clear your spare fund to continue"
    }

    const totalUsedFund = Number(form?.spare_parts_fund ?? 0) + Number(form?.service_work_fund ?? 0);

    if (totalUsedFund > Number(form?.package_fund ?? 0)) {
        errors.package_fund = "Package fund is smaller than service and spare fund"
    }


    return {
        isValid: Object.keys(errors).length === 0,
        errors
    }
}


export const validateUpdatePackageServiceForm = (form) => {
    const errors = {}
    // service name
    if (!form.service_name?.trim()) {
        errors.service_name = "Service name is required"
    } else if (form.service_name.trim().length < 3) {
        errors.service_name = "Min length is 3 characters"
    }

    // Default services
    if (form?.service_charges?.length === 0) {
        errors.service_charges = "Add minimum 1 default service charge."
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    }
}

export const packageExtendForm = (form) => {
    const errors = {}
    // service name
    if (!form.verify_text?.trim()) {
        errors.verify_text = "Is required"
    } else if (form.verify_text !== 'EXTEND') {
        errors.verify_text = "Confirmation not completed"
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    }
}