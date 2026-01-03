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

