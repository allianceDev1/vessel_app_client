import { toStandardText } from "../../../utils/helpers/text-formatting"

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

export const SERVICE_TYPES = ['COMPLAINT', 'SERVICE', 'RENEWAL']
export const SERVICE_PRIORITY = {
    1: "Normal",
    2: "Urgent",
    3: "High"
}
export const SERVICE_PRIORITY_TEXT = Object.fromEntries(
    Object.entries(SERVICE_PRIORITY).map(([key, value]) => [value, toStandardText(key)])
);

export const SERVICE_REG_STATUS_LIST = [
    { key: 1, label: "Registered", bg: "rgba(107, 114, 128, 0.12)", text: "#6B7280", border: "rgba(107, 114, 128, 0.25)" },
    { key: 2, label: "Proceed", bg: "rgba(37, 99, 235, 0.12)", text: "#2563EB", border: "rgba(37, 99, 235, 0.25)" },
    { key: 3, label: "Scheduled", bg: "rgba(124, 58, 237, 0.12)", text: "#7C3AED", border: "rgba(124, 58, 237, 0.25)" },
    { key: 4, label: "On Visit", bg: "rgba(234, 88, 12, 0.12)", text: "#EA580C", border: "rgba(234, 88, 12, 0.25)" },
    { key: 5, label: "Closed", bg: "rgba(22, 163, 74, 0.12)", text: "#16A34A", border: "rgba(22, 163, 74, 0.25)" },
    { key: 6, label: "Cancelled", bg: "rgba(220, 38, 38, 0.12)", text: "#DC2626", border: "rgba(220, 38, 38, 0.25)" }
]

export const SERVICE_VISIT_STATUS_LIST = [
    { key: 1, label: "Travel", bg: "rgba(37, 99, 235, 0.12)", text: "#2563EB", border: "rgba(37, 99, 235, 0.25)" },
    { key: 2, label: "In Service", bg: "rgba(124, 58, 237, 0.12)", text: "#7C3AED", border: "rgba(124, 58, 237, 0.25)" },
    { key: 3, label: "Completed", bg: "rgba(22, 163, 74, 0.12)", text: "#16A34A", border: "rgba(22, 163, 74, 0.25)" },
    { key: 4, label: "Cancelled", bg: "rgba(220, 38, 38, 0.12)", text: "#DC2626", border: "rgba(220, 38, 38, 0.25)" }
]