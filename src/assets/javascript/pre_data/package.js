import { toStandardText } from "../../../utils/helpers/text-formatting";

export const work_modes = ['COMPLAINT', 'SERVICE', 'RENEWAL']
export const reg_priority = [
    [],
    ['Normal', 'info'],
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
    { key: 1, label: "Pending", bg: "var(--status-neutral-bg)", text: "var(--status-neutral-text)", border: "var(--status-neutral-border)" },
    { key: 2, label: "Active", bg: "var(--status-success-bg)", text: "var(--status-success-text)", border: "var(--status-success-border)" },
    { key: 3, label: "Expired", bg: "var(--status-danger-bg)", text: "var(--status-danger-text)", border: "var(--status-danger-border)" },
    { key: 4, label: "Frozen", bg: "var(--status-orange-bg)", text: "var(--status-orange-text)", border: "var(--status-orange-border)" }
]
