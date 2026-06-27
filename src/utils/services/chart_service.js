import moment from "moment";

export const upcomingServiceMiniReport = (data) => {
    const { summary, city_chart, month_chart } = data;

    // Summary pie chart
    const summeryData = [
        { name: "Services", value: summary.total_service || 0 },
        { name: "Renewals", value: summary.total_renewal || 0 },
    ];

    // Counts
    const countsData = {
        total_pending: summary.total_work || 0,
        month_pending: summary.this_month_total_work || 0,
    };

    // City chart
    const chartData = city_chart.map((city) => ({
        name: city.city_name || "Unknown",
        Service: city.total_service || 0,
        Renewal: city.total_renewal || 0
    }))


    // Collect ALL unique package names across all months
    const formatMonthKey = (date) =>
        date.toISOString().slice(0, 7); // YYYY-MM
    const getMonthLabel = (date) =>
        date.toLocaleString("default", { year: "numeric", month: "long" });

    const allPackages = [
        ...new Set(
            month_chart?.flatMap((m) => (m.package_counts || [])?.map((p) => p.package_name))
        ),
    ];

    const monthCharPackageColorCode = Object.fromEntries(
        month_chart?.flatMap(({ package_counts = [] }) =>
            package_counts.map(({ package_name, package_color_code }) => [
                package_name,
                package_color_code
            ])
        ) || []
    );

    // ------------------ Build Month Range ------------------
    const now = new Date();

    const start = new Date(now.getFullYear(), now.getMonth() - 4, 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 2, 1);

    const monthRange = [];
    let cursor = new Date(start);

    while (cursor <= end) {
        monthRange.push(new Date(cursor));
        cursor.setMonth(cursor.getMonth() + 1);
    }

    // ------------------ Map Existing Data ------------------
    const monthMap = Object.fromEntries(
        (month_chart || []).map((m) => {
            const key = m.month; // assume YYYY-MM
            return [key, m];
        })
    );


    const monthChart = monthRange.map((date) => {
        const key = formatMonthKey(date);
        const m = monthMap[key];

        const packageMap = Object.fromEntries(
            (m?.package_counts || []).map((p) => [
                p.package_name,
                p.count
            ])
        );

        const packageEntries = Object.fromEntries(
            allPackages.map((pkg) => [pkg, packageMap[pkg] ?? 0])
        );

        const report = {
            name: getMonthLabel(date),

            // real data OR dummy fallback
            Works: m?.total_work ?? 0,
            Renewal: m?.total_renewal ?? 0,
            Service: m?.total_service ?? 0,
            ...packageEntries,

        }

        if (allPackages?.length) {
            report.Addon = m?.add_on_works ?? 0;
        }

        return report;
    });

    return {
        summeryData,
        countsData,
        chartData,
        monthChart,
        monthCharPackageColorCode
    }

}

//
export const normalizeRegistrationMiniReports = (data) => {
    const report = data || {};

    // ---------------------------
    // 1. Generate last 6 months
    // ---------------------------
    const getLast6Months = () => {
        const months = [];
        const now = new Date();

        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, "0");
            months.push(`${year}-${month}`);
        }

        return months;
    };

    const last6Months = getLast6Months();

    // ---------------------------
    // 2. Normalize TOTAL
    // ---------------------------
    const totalMap = Object.fromEntries(
        (report.total || []).map(item => [item.month, item])
    );

    const total = last6Months.map(month => ({
        month: new Date(month).toLocaleString("default", { year: "numeric", month: "long" }),
        closed: totalMap[month]?.closed || 0,
        cancelled: totalMap[month]?.cancelled || 0,
        registration: totalMap[month]?.registration || 0,
    }));

    // ---------------------------
    // 3. Normalize REG MODE
    // ---------------------------
    const regModeMap = Object.fromEntries(
        (report.reg_mode || []).map(item => [item.month, item])
    );

    const reg_mode = last6Months.map(month => ({
        month: new Date(month).toLocaleString("default", { year: "numeric", month: "long" }),
        complaint: regModeMap[month]?.complaint || 0,
        service: regModeMap[month]?.service || 0,
        renewal: regModeMap[month]?.renewal || 0,
    }));

    // ---------------------------
    // 4. Normalize ACTIVE STATUS
    // ---------------------------
    const REQUIRED_STATUS = [
        "Registered",
        "Proceed",
        "Scheduled",
        "On Visit"
    ];

    const activeMap = Object.fromEntries(
        (report.active_reg || []).map(item => [item.status_text, item.count])
    );

    const active_reg = REQUIRED_STATUS.map(status => ({
        status_text: status,
        count: activeMap[status] || 0,
    }));

    // ---------------------------
    // 5. City list (unchanged)
    // ---------------------------
    const city_list = report.city_list || [];

    return {
        total,
        reg_mode,
        active_reg,
        city_list
    };
};

export const normalizeCompletedModeReport = (data, months, allPackages) => {
    const packageKeys = Object.keys(allPackages); // 🔥 extract keys
    const map = new Map();

    data.forEach((item) => {
        const pkgFlat = {};

        item.package_counts?.forEach((pkg) => {
            pkgFlat[pkg.package_name] = pkg.count;
        });

        packageKeys.forEach((pkg) => {
            if (!(pkg in pkgFlat)) {
                pkgFlat[pkg] = 0;
            }
        });

        map.set(item.month, {
            name: moment(item.month, "YYYY-MM").format("MMM YYYY"),
            "Product Works": item.total_work,
            ...pkgFlat,
        });
    });

    return months.map((month) => {
        if (map.has(month)) return map.get(month);

        // missing month → fill all packages
        const emptyPackages = {};
        packageKeys.forEach((pkg) => {
            emptyPackages[pkg] = 0;
        });

        return {
            name: moment(month, "YYYY-MM").format("MMM YYYY"),
            "Product Works": 0,
            ...emptyPackages,
        };
    });
}

export const normalizeSubscriptionRenewalReport = (data, months, allPackages) => {
    const packageKeys = Object.keys(allPackages); // 🔥 extract keys
    const map = new Map();

    data.forEach((item) => {
        const pkgFlat = {};

        item.package_counts?.forEach((pkg) => {
            pkgFlat[pkg.package_name] = pkg.count;
        });

        packageKeys.forEach((pkg) => {
            if (!(pkg in pkgFlat)) {
                pkgFlat[pkg] = 0;
            }
        });

        map.set(item.month, {
            name: moment(item.month, "YYYY-MM").format("MMM YYYY"),
            "Pkg Context": item.from_package_count,
            "Non Pkg Context": item.from_non_package_count,
            ...pkgFlat,
        });
    });

    return months.map((month) => {
        if (map.has(month)) return map.get(month);

        // missing month → fill all packages
        const emptyPackages = {};
        packageKeys.forEach((pkg) => {
            emptyPackages[pkg] = 0;
        });

        return {
            name: moment(month, "YYYY-MM").format("MMM YYYY"),
            "Pkg Context": 0,
            "Non Pkg Context": 0,
            ...emptyPackages,
        };
    });
}

export const normalizeSubscriptionAmountReport = (data, months, allPackages = {}) => {
    const map = new Map();

    data.forEach((item) => {
        map.set(item.month, {
            name: moment(item.month, "YYYY-MM").format("MMM YYYY"),
            "Amount": item.total_amount
        });
    });

    return months.map((month) => {
        if (map.has(month)) return map.get(month);

        return {
            name: moment(month, "YYYY-MM").format("MMM YYYY"),
            "Amount": 0
        };
    });
}