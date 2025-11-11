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
    if (Number(form.work_limit) < 0) {
        errors.work_limit = "Invalid work limit value"
    }

    // if more than one expire type => query operator required
    if (
        Array.isArray(form.expire_types) &&
        form.expire_types.length > 1 &&
        !form.et_query_operator
    ) {
        errors.et_query_operator = "Query operator required for multiple expiration types"
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    }
}


export const validateUpdatePackageServiceForm = (form, mode) => {
    const errors = {}
    // service name
    if (!form.service_name?.trim()) {
        errors.service_name = "Service name is required"
    } else if (form.service_name.trim().length < 3) {
        errors.service_name = "Min length is 3 characters"
    }

    // Credit percentage type limit
    if (form.credit_type === 'Percentage' && Number(form.credit_limit) > 100) {
        errors.credit_limit = "Percentage credit limit cannot exceed 100%"
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