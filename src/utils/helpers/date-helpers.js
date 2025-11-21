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



