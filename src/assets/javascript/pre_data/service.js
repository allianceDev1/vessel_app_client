export const serviceFormPageRoute = [
    { key: 100, title: 'Select Products', description: "Choose the products or parts required for this service" },
    { key: 101, title: 'Review & Confirmation', description: "Review service details and verify the total amount" },
    { key: 102, title: 'Payment', description: "Collect and complete the service payment" }
]

export const serviceFormSubPageRoute = [
    { key: 200, title: 'Current Condition', description: "Record the current condition of the product before service" },
    { key: 201, title: 'Inspection report', description: "Document issues identified during the inspection" },
    { key: 202, title: 'Action Taken', description: "Record the solution or repair performed during the service" },
    { key: 203, title: 'Evaluation', description: "Evaluate the product condition after service completion" }
]

export const serviceFormAddOnSubPageRoute = [
    { key: 200, title: 'Current Condition', description: "Record the current condition of the product before service" },
    { key: 201, title: 'Action Taken', description: "Record the solution or repair performed during the service" },
    { key: 202, title: 'Evaluation', description: "Evaluate the product condition after service completion" }
]

export const SPARE_SECTIONS = ["RENEWAL_SPARE", "PACKAGE_SPARE", "ADDITIONAL_SPARE"]
export const SPARE_SECTION_TITLES = {
    RENEWAL_SPARE: "Package Renewal Spares",
    PACKAGE_SPARE: "Service Package Spares",
    ADDITIONAL_SPARE: "Additional Spares"
}

export const SERVICE_SECTIONS = ['RENEWAL_SERVICE', 'PACKAGE_SERVICE', 'ADDITIONAL_SERVICE']
export const SERVICE_SECTION_TITLES = {
    RENEWAL_SERVICE: "Package Renewal Services",
    PACKAGE_SERVICE: "Service Package Services",
    ADDITIONAL_SERVICE: "Additional Services"
}



