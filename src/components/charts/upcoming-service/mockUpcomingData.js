/**
 * Mock API Response for Upcoming Services Report across 3 product types:
 * - VESSEL_FILTER
 * - WATER_PURIFIER
 * - ADD_ON
 * 
 * Note: All products & Add-on do not have package reports.
 */

const baseCities = [
    { city_name: "Vellangallur", vf_s: 0, vf_r: 2, wp_s: 1, wp_r: 0, ao_s: 1, ao_r: 0 },
    { city_name: "Vadanappally", vf_s: 12, vf_r: 3, wp_s: 8, wp_r: 2, ao_s: 4, ao_r: 1 },
    { city_name: "Thriprayar", vf_s: 6, vf_r: 0, wp_s: 4, wp_r: 1, ao_s: 2, ao_r: 0 },
    { city_name: "Sn Puram", vf_s: 2, vf_r: 6, wp_s: 3, wp_r: 2, ao_s: 1, ao_r: 1 },
    { city_name: "Peringottukara", vf_s: 6, vf_r: 2, wp_s: 5, wp_r: 1, ao_s: 2, ao_r: 0 },
    { city_name: "Mathilakam", vf_s: 8, vf_r: 3, wp_s: 6, wp_r: 1, ao_s: 3, ao_r: 1 },
    { city_name: "Kodungallur", vf_s: 4, vf_r: 1, wp_s: 7, wp_r: 2, ao_s: 2, ao_r: 0 },
    { city_name: "Kattoor", vf_s: 5, vf_r: 2, wp_s: 4, wp_r: 1, ao_s: 1, ao_r: 1 },
    { city_name: "Kanjani", vf_s: 1, vf_r: 0, wp_s: 2, wp_r: 0, ao_s: 1, ao_r: 0 },
    { city_name: "Irinjalakuda", vf_s: 2, vf_r: 1, wp_s: 5, wp_r: 1, ao_s: 2, ao_r: 1 },
    { city_name: "Guruvayoor", vf_s: 0, vf_r: 0, wp_s: 3, wp_r: 1, ao_s: 1, ao_r: 0 },
    { city_name: "Engandiyoor", vf_s: 2, vf_r: 0, wp_s: 2, wp_r: 0, ao_s: 1, ao_r: 0 },
    { city_name: "Chendrapinni", vf_s: 32, vf_r: 5, wp_s: 18, wp_r: 4, ao_s: 8, ao_r: 2 },
    { city_name: "Chavakkad", vf_s: 3, vf_r: 1, wp_s: 4, wp_r: 1, ao_s: 2, ao_r: 0 },
    { city_name: "Azhikode", vf_s: 5, vf_r: 1, wp_s: 3, wp_r: 0, ao_s: 2, ao_r: 1 }
];

export const mockUpcomingReportData = {
    vessel_filter: {
        summary: {
            total_work: 210,
            total_service: 178,
            total_renewal: 32,
            this_month_total_work: 38
        },
        city_chart: baseCities.map(c => ({
            city_name: c.city_name,
            total_service: c.vf_s,
            total_renewal: c.vf_r
        })),
        month_chart: [
            {
                month: "2026-06",
                total_work: 8,
                total_service: 5,
                total_renewal: 3,
                add_on_works: 0,
                package_counts: [
                    { package_name: "IW", package_color_code: "#0087cf", count: 6 },
                    { package_name: "IW Plus", package_color_code: "#003366", count: 2 }
                ]
            },
            {
                month: "2026-07",
                total_work: 4,
                total_service: 3,
                total_renewal: 1,
                add_on_works: 0,
                package_counts: [
                    { package_name: "IW", package_color_code: "#0087cf", count: 3 },
                    { package_name: "IW Plus", package_color_code: "#003366", count: 1 }
                ]
            },
            {
                month: "2026-08",
                total_work: 12,
                total_service: 10,
                total_renewal: 2,
                add_on_works: 0,
                package_counts: [
                    { package_name: "IW", package_color_code: "#0087cf", count: 10 },
                    { package_name: "IW Plus", package_color_code: "#003366", count: 2 }
                ]
            },
            {
                month: "2026-09",
                total_work: 36,
                total_service: 22,
                total_renewal: 14,
                add_on_works: 1,
                package_counts: [
                    { package_name: "IW", package_color_code: "#0087cf", count: 33 },
                    { package_name: "IW Plus", package_color_code: "#003366", count: 2 }
                ]
            },
            {
                month: "2026-10",
                total_work: 38,
                total_service: 20,
                total_renewal: 18,
                add_on_works: 1,
                package_counts: [
                    { package_name: "IW", package_color_code: "#0087cf", count: 34 },
                    { package_name: "IW Plus", package_color_code: "#003366", count: 3 }
                ]
            },
            {
                month: "2026-11",
                total_work: 13,
                total_service: 11,
                total_renewal: 2,
                add_on_works: 0,
                package_counts: [
                    { package_name: "IW", package_color_code: "#0087cf", count: 11 },
                    { package_name: "IW Plus", package_color_code: "#003366", count: 2 }
                ]
            },
            {
                month: "2026-12",
                total_work: 12,
                total_service: 10,
                total_renewal: 2,
                add_on_works: 0,
                package_counts: [
                    { package_name: "IW", package_color_code: "#0087cf", count: 10 },
                    { package_name: "IW Plus", package_color_code: "#003366", count: 2 }
                ]
            }
        ]
    },
    water_purifier: {
        summary: {
            total_work: 142,
            total_service: 118,
            total_renewal: 24,
            this_month_total_work: 28
        },
        city_chart: baseCities.map(c => ({
            city_name: c.city_name,
            total_service: c.wp_s,
            total_renewal: c.wp_r
        })),
        month_chart: [
            {
                month: "2026-06",
                total_work: 6,
                total_service: 4,
                total_renewal: 2,
                add_on_works: 0,
                package_counts: [
                    { package_name: "WP Care", package_color_code: "#00B4D8", count: 4 },
                    { package_name: "WP Shield", package_color_code: "#0077B6", count: 2 }
                ]
            },
            {
                month: "2026-07",
                total_work: 5,
                total_service: 4,
                total_renewal: 1,
                add_on_works: 0,
                package_counts: [
                    { package_name: "WP Care", package_color_code: "#00B4D8", count: 3 },
                    { package_name: "WP Shield", package_color_code: "#0077B6", count: 2 }
                ]
            },
            {
                month: "2026-08",
                total_work: 10,
                total_service: 8,
                total_renewal: 2,
                add_on_works: 0,
                package_counts: [
                    { package_name: "WP Care", package_color_code: "#00B4D8", count: 7 },
                    { package_name: "WP Shield", package_color_code: "#0077B6", count: 3 }
                ]
            },
            {
                month: "2026-09",
                total_work: 28,
                total_service: 22,
                total_renewal: 6,
                add_on_works: 2,
                package_counts: [
                    { package_name: "WP Care", package_color_code: "#00B4D8", count: 21 },
                    { package_name: "WP Shield", package_color_code: "#0077B6", count: 5 }
                ]
            },
            {
                month: "2026-10",
                total_work: 25,
                total_service: 19,
                total_renewal: 6,
                add_on_works: 1,
                package_counts: [
                    { package_name: "WP Care", package_color_code: "#00B4D8", count: 18 },
                    { package_name: "WP Shield", package_color_code: "#0077B6", count: 6 }
                ]
            },
            {
                month: "2026-11",
                total_work: 11,
                total_service: 9,
                total_renewal: 2,
                add_on_works: 0,
                package_counts: [
                    { package_name: "WP Care", package_color_code: "#00B4D8", count: 8 },
                    { package_name: "WP Shield", package_color_code: "#0077B6", count: 3 }
                ]
            },
            {
                month: "2026-12",
                total_work: 9,
                total_service: 7,
                total_renewal: 2,
                add_on_works: 0,
                package_counts: [
                    { package_name: "WP Care", package_color_code: "#00B4D8", count: 7 },
                    { package_name: "WP Shield", package_color_code: "#0077B6", count: 2 }
                ]
            }
        ]
    },
    add_on: {
        summary: {
            total_work: 68,
            total_service: 54,
            total_renewal: 14,
            this_month_total_work: 15
        },
        city_chart: baseCities.map(c => ({
            city_name: c.city_name,
            total_service: c.ao_s,
            total_renewal: c.ao_r
        })),
        month_chart: [
            {
                month: "2026-06",
                total_work: 3,
                total_service: 2,
                total_renewal: 1,
                add_on_works: 0,
                package_counts: []
            },
            {
                month: "2026-07",
                total_work: 2,
                total_service: 2,
                total_renewal: 0,
                add_on_works: 0,
                package_counts: []
            },
            {
                month: "2026-08",
                total_work: 5,
                total_service: 4,
                total_renewal: 1,
                add_on_works: 0,
                package_counts: []
            },
            {
                month: "2026-09",
                total_work: 15,
                total_service: 11,
                total_renewal: 4,
                add_on_works: 1,
                package_counts: []
            },
            {
                month: "2026-10",
                total_work: 14,
                total_service: 10,
                total_renewal: 4,
                add_on_works: 1,
                package_counts: []
            },
            {
                month: "2026-11",
                total_work: 6,
                total_service: 5,
                total_renewal: 1,
                add_on_works: 0,
                package_counts: []
            },
            {
                month: "2026-12",
                total_work: 5,
                total_service: 4,
                total_renewal: 1,
                add_on_works: 0,
                package_counts: []
            }
        ]
    }
};
