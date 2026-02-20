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
