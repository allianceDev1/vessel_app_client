
function generateUniqueId(sting_length, addition = "", customString = "") {
    const string = customString || 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let randomString = '';
    for (let i = 0; i < sting_length; i++) {
        randomString += string.charAt(Math.floor(Math.random() * string.length))
    }
    return addition + randomString
}

const parseServiceJobKey = (workKey) => {
    if (!workKey || typeof workKey !== "string") {
        throw new Error("Invalid work key");
    }

    const values = workKey.split("|");

    if (values.length !== 6) {
        throw new Error("Invalid work key format");
    }

    const [
        customer_id,
        technician_uuid,
        dvc_id,
        reg_id,
        visit_uuid,
        service_job_uuid
    ] = values;

    return {
        service_job_uuid,
        customer_id,
        dvc_id,
        reg_id,
        visit_uuid,
        technician_uuid
    };
};


export { generateUniqueId, parseServiceJobKey }