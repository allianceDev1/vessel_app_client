import { toStandardText } from "../../../utils/helpers/text-formatting"


export const serviceFormPageRoute = [
    { key: 1000, title: 'Service Form Home Page', description: "Manage assigned products, configure site specifications, and record completion status" },
    { key: 1001, title: 'Review & Confirmation', description: "Review service details and verify the total amount" },
    { key: 1002, title: 'Payment', description: "Collect and complete the service payment" },

    // Purifier
    { key: 1100, title: 'Current Condition', description: "Record the current condition of the product before service" },
    { key: 1101, title: 'With new spun filter', description: "Change the spun filter and record the current condition of the product before service" },
    { key: 1102, title: 'Pump & membrane', description: "Check current condition with change pump, membrane and FR" },
    { key: 1103, title: 'Inspection report', description: "Document issues identified during the inspection" },
    { key: 1104, title: 'Action Taken', description: "Record the solution or repair performed during the service" },
    { key: 1105, title: 'Evaluation', description: "Evaluate the product condition after service completion" },

    // Vessel filter
    { key: 1200, title: 'Current Condition', description: "Record the current condition of the product before service" },
    { key: 1201, title: 'Inspection report', description: "Document issues identified during the inspection" },
    { key: 1202, title: 'Action Taken', description: "Record the solution or repair performed during the service" },
    { key: 1203, title: 'Evaluation', description: "Evaluate the product condition after service completion" },

    // Add-on
    { key: 1300, title: 'Current Condition', description: "Record the current condition of the product before service" },
    { key: 1301, title: 'Action Taken', description: "Record the solution or repair performed during the service" },
    { key: 1302, title: 'Evaluation', description: "Evaluate the product condition after service completion" }

]


export const SPARE_SECTIONS = ["RENEWAL_SPARE", "PACKAGE_SPARE", "ADDITIONAL_SPARE"]
export const SERVICE_SECTIONS = ['RENEWAL_SERVICE', 'PACKAGE_SERVICE', 'ADDITIONAL_SERVICE']


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
    { key: 1, label: "Registered", bg: "var(--status-neutral-bg)", text: "var(--status-neutral-text)", border: "var(--status-neutral-border)" },
    { key: 2, label: "Proceed", bg: "var(--status-blue-bg)", text: "var(--status-blue-text)", border: "var(--status-blue-border)" },
    { key: 3, label: "Scheduled", bg: "var(--status-purple-bg)", text: "var(--status-purple-text)", border: "var(--status-purple-border)" },
    { key: 4, label: "On Visit", bg: "var(--status-orange-bg)", text: "var(--status-orange-text)", border: "var(--status-orange-border)" },
    { key: 5, label: "Closed", bg: "var(--status-success-bg)", text: "var(--status-success-text)", border: "var(--status-success-border)" },
    { key: 6, label: "Cancelled", bg: "var(--status-danger-bg)", text: "var(--status-danger-text)", border: "var(--status-danger-border)" }
]

export const SERVICE_VISIT_STATUS_LIST = [
    { key: 1, label: "Travel", bg: "var(--status-blue-bg)", text: "var(--status-blue-text)", border: "var(--status-blue-border)" },
    { key: 2, label: "In Service", bg: "var(--status-purple-bg)", text: "var(--status-purple-text)", border: "var(--status-purple-border)" },
    { key: 3, label: "Completed", bg: "var(--status-success-bg)", text: "var(--status-success-text)", border: "var(--status-success-border)" },
    { key: 4, label: "Cancelled", bg: "var(--status-danger-bg)", text: "var(--status-danger-text)", border: "var(--status-danger-border)" }
]
