export const isoToYYYYMMDD = (input, symbol = "-") => {
    if (!input) return null;

    const date = typeof input === "string" ? new Date(input) : input;
    if (isNaN(date.getTime())) return null;

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");

    return `${yyyy}${symbol}${mm}${symbol}${dd}`;
};

export const isoToDDMonYYYY = (input) => {
    if (!input) return null;

    const date = typeof input === "string" ? new Date(input) : input;
    if (isNaN(date.getTime())) return null;

    const dd = String(date.getDate()).padStart(2, "0");

    // Intl is the most reliable & modern approach
    const mon = date.toLocaleString("en-US", { month: "short" });

    const yyyy = date.getFullYear();

    return `${dd} ${mon} ${yyyy}`;
};

export const getIsoDayDifference = (iso1, iso2) => {
    if (!iso1 || !iso2) return null;

    if (typeof iso1 === "string" || typeof iso2 === "string") {
        return null;
    }

    const d1 = new Date(iso1);
    const d2 = new Date(iso2);

    if (isNaN(d1) || isNaN(d2)) return null;

    const diff = Math.ceil((d1 - d2) / (1000 * 60 * 60 * 24))

    return diff || 0;
};

export const getTimeDiff = (startISO, endISO, options = {}) => {
    const { includeSeconds = false } = options;

    const start = new Date(startISO);
    const end = new Date(endISO);

    // validation
    if (isNaN(start) || isNaN(end)) {
        throw new Error('Invalid ISO date provided');
    }

    const diffMs = end - start;
    const absDiff = Math.abs(diffMs);

    const totalSeconds = Math.floor(absDiff / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const totalHours = Math.floor(totalMinutes / 60);
    const totalDays = Math.floor(totalHours / 24);

    // breakdown (important 🔥)
    const days = totalDays;
    const hours = totalHours % 24;
    const minutes = totalMinutes % 60;
    const seconds = totalSeconds % 60;

    const result = {
        days,
        hours,
        minutes,
        totalDays,
        totalHours,
        totalMinutes,
        isNegative: diffMs < 0
    };

    if (includeSeconds) {
        result.seconds = seconds;
        result.totalSeconds = totalSeconds;
    }

    return result;
};

export const formatRelativeIsoDate = (isoDate) => {

    if (!isoDate) return null;

    const input = new Date(isoDate);
    const now = new Date();

    // Normalize to start of day (local timezone)
    const startOfInput = new Date(
        input.getFullYear(),
        input.getMonth(),
        input.getDate()
    );

    const startOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
    );

    const dayDiff = (startOfInput - startOfToday) / (1000 * 60 * 60 * 24);

    if (dayDiff === 0) return "Today";
    if (dayDiff === -1) return "Yesterday";
    if (dayDiff === 1) return "Tomorrow";

    return isoToDDMonYYYY(input);
}

export const convertIsoToAmPm = (isoString) => {
    if (!isoString) return null;

    const date = new Date(isoString);

    if (isNaN(date.getTime())) return null;

    let hours = date.getHours();
    const minutes = date.getMinutes();

    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;

    const minutesStr = String(minutes).padStart(2, "0");

    return `${hours}:${minutesStr} ${ampm}`;
}

export const normalizeDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return isNaN(d) ? null : d;
}

export const getPackageProgress = ({
    startDate,
    endDate,
    currentDate = new Date()
}) => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const today = new Date(currentDate).getTime();

    if (Number.isNaN(start) || Number.isNaN(end)) {
        throw new Error("Invalid date input");
    }

    if (start >= end) {
        return {
            status: "invalid",
            progress: 0
        };
    }

    // Status
    let status;
    if (today < start) status = "upcoming";
    else if (today > end) status = "expired";
    else status = "active";

    // Progress Calculation
    const totalDuration = end - start;
    const elapsed = today - start;

    let progress = (elapsed / totalDuration) * 100;

    // Clamp between 0 and 100
    progress = Math.max(0, Math.min(100, progress));

    return {
        status,
        progress: Number(progress.toFixed(2))
    };
};

export const formatDuration = (totalSeconds) => {
    if (!totalSeconds || totalSeconds < 0) return "0 Seconds";

    const days = Math.floor(totalSeconds / (24 * 60 * 60));
    const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
    const seconds = totalSeconds % 60;

    const parts = [];

    if (days) parts.push(`${days} Day${days > 1 ? "s" : ""}`);
    if (hours) parts.push(`${hours} Hour${hours > 1 ? "s" : ""}`);
    if (minutes) parts.push(`${minutes} Minute${minutes > 1 ? "s" : ""}`);
    if (seconds) parts.push(`${parseInt(seconds)} Second${seconds > 1 ? "s" : ""}`);

    return parts.join(" ");
}

export const isoToDecimalHour = (isoDate) => {
    const date = new Date(isoDate);

    let hours = date.getHours();
    const minutes = date.getMinutes();

    return Number((hours + minutes / 60).toFixed(2));
};

export const addDurationToDate = (inputDate, duration) => {
    const date = new Date(inputDate);

    if (isNaN(date.getTime())) {
        throw new Error("Invalid date provided");
    }

    const {
        days = 0,
        weeks = 0,
        months = 0,
        years = 0,
        hours = 0,
        minutes = 0
    } = duration;

    // Clone date to avoid mutation
    const result = new Date(date);

    result.setFullYear(result.getFullYear() + years);
    result.setMonth(result.getMonth() + months);
    result.setDate(result.getDate() + days + (weeks * 7));
    result.setHours(result.getHours() + hours);
    result.setMinutes(result.getMinutes() + minutes);

    return result;
}