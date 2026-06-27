import { toStandardText } from "../../../utils/helpers/text-formatting";

export const work_modes = ['Complaint', 'Service', 'Renewal']
export const reg_priority = [
    [],
    ['Low', 'info'],
    ['Urgent', 'warning'],
    ['High', 'danger']
]
export const packageExpireTypes = {
    PACKAGE_DURATION: 'PACKAGE_DURATION',
    REMAINING_TOKENS: 'REMAINING_TOKENS'
}

// Package Status
export const PACKAGE_STATUSES = {
    PENDING: 1,
    ACTIVE: 2,
    EXPIRED: 3,
    FROZEN: 4
};

export const PACKAGE_STATUSES_TEXT = Object.fromEntries(
    Object.entries(PACKAGE_STATUSES).map(([key, value]) => [value, toStandardText(key)])
);

export const PACKAGE_STATUSES_LIST = [
    { key: 1, label: "Pending", bg: "rgba(107, 114, 128, 0.12)", text: "#6B7280", border: "rgba(107, 114, 128, 0.25)" },
    { key: 2, label: "Active", bg: "rgba(22, 163, 74, 0.12)", text: "#16A34A", border: "rgba(22, 163, 74, 0.25)" },
    { key: 3, label: "Expired", bg: "rgba(220, 38, 38, 0.12)", text: "#DC2626", border: "rgba(220, 38, 38, 0.25)" },
    { key: 4, label: "Frozen", bg: "rgba(234, 88, 12, 0.12)", text: "#EA580C", border: "rgba(234, 88, 12, 0.25)" }
]