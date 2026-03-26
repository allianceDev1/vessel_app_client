import { isoToYYYYMMDD } from "../helpers/date-helpers"

export const serviceRegistration = (form) => {
    const errors = {}
   
    // what is complaint
    if (form.service_type === 'COMPLAINT' && (!form?.complaint_category || form?.complaint_category?.length === 0)) {
        errors.complaint_category = "Choose a complaint category."
    }

    // Schedule
    if (form.schedule_with_registration === true) {
        if (form?.schedule_date < isoToYYYYMMDD(new Date())) {
            errors.schedule_date = "Choose a future date."
        } else if (form?.start_time > form?.end_time) {
            errors.end_time = "End time should be greater than start time."
        } else if (form?.start_time === form?.end_time) {
            errors.end_time = "End time should be greater than start time."
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    }
}