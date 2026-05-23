import React, { useMemo } from 'react'
import './completed-service-report.scss'
import { TbBriefcase2, TbChevronsDown, TbChevronsUp, TbCurrencyRupee, TbDroplet, TbDropletBolt, TbManualGearbox, TbTransactionRupee } from 'react-icons/tb'
import { Bar, ComposedChart, Line, XAxis, YAxis } from 'recharts'
import ChartTooltip from '../primitives/ChartTooltip'
import ChartLegend from '../primitives/ChartLegend'
import { chartLabelColors } from '../../../assets/javascript/pre_data/chart'
import { getGrowthPercentage } from '../../../utils/helpers/math-equations'
import { convertAmount } from '../../../utils/helpers/text-formatting'
import { normalizeCompletedModeReport } from '../../../utils/services/chart_service'
import moment from 'moment'


const CompletedServiceReport = ({ data, loading, error, updatedAt }) => {

    const { countReport, complaintReport, serviceReport, renewalReport, cityReport, getAllPackages } = useMemo(() => {

        // Count Report
        const REPORT1 = data?.count_report || {}
        const count_report = [
            {
                label: "Works",
                icon: <TbBriefcase2 />,
                value: REPORT1?.works?.current || 0,
                desc: null,
                percentage: getGrowthPercentage(REPORT1?.works?.current || 0, REPORT1?.works?.previous || 0)
            },
            {
                label: "Revenue",
                icon: <TbCurrencyRupee />,
                value: `₹ ${convertAmount(REPORT1?.revenue?.current || 0)}`,
                desc: `₹ ${new Intl.NumberFormat("en-IN").format(REPORT1?.revenue?.current || 0)}`,
                percentage: getGrowthPercentage(REPORT1?.revenue?.current || 0, REPORT1?.revenue?.previous || 0)
            },
            {
                label: "Spare Amount",
                icon: <TbTransactionRupee />,
                value: `₹ ${convertAmount(REPORT1?.spare_amount?.current || 0)}`,
                desc: `₹ ${new Intl.NumberFormat("en-IN").format(REPORT1?.spare_amount?.current || 0)}`,
                percentage: getGrowthPercentage(REPORT1?.spare_amount?.current || 0, REPORT1?.spare_amount?.previous || 0)
            },
            {
                label: "Service Work Amount",
                icon: <TbTransactionRupee />,
                value: `₹ ${convertAmount(REPORT1?.service_amount?.current || 0)}`,
                desc: `₹ ${new Intl.NumberFormat("en-IN").format(REPORT1?.service_amount?.current || 0)}`,
                percentage: getGrowthPercentage(REPORT1?.service_amount?.current || 0, REPORT1?.service_amount?.previous || 0)
            },
            {
                label: "Service Products",
                icon: <TbManualGearbox />,
                value: REPORT1?.vessel_filter_count?.current || 0,
                desc: null,
                percentage: getGrowthPercentage(REPORT1?.vessel_filter_count?.current || 0, REPORT1?.vessel_filter_count?.previous || 0)
            },
            {
                label: "New Add-Ons",
                icon: <TbManualGearbox />,
                value: REPORT1?.addon_count?.current || 0,
                desc: null,
                percentage: getGrowthPercentage(REPORT1?.addon_count?.current || 0, REPORT1?.addon_count?.previous || 0)
            },
            {
                label: "Package Works",
                icon: <TbDropletBolt />,
                value: REPORT1?.package_count?.current || 0,
                desc: null,
                percentage: getGrowthPercentage(REPORT1?.package_count?.current || 0, REPORT1?.package_count?.previous || 0)
            },
            {
                label: "Non Package Works",
                icon: <TbDroplet />,
                value: REPORT1?.non_package_count?.current || 0,
                desc: null,
                percentage: getGrowthPercentage(REPORT1?.non_package_count?.current || 0, REPORT1?.non_package_count?.previous || 0)
            }
        ]

        // Get last siz months
        const months = Array.from({ length: 6 }, (_, i) =>
            moment().subtract(i, "months").format("YYYY-MM")
        ).reverse()

        // Complaint & Service & Renewal Report
        const REPORT2 = data?.complaint_mode_report || []
        const REPORT3 = data?.service_mode_report || []
        const REPORT4 = data?.renewal_mode_report || []

        const map = new Map();
        let getAllPackages = [...REPORT2, ...REPORT3, ...REPORT4].forEach((report) => {
            report.package_counts?.forEach((pkg) => {
                if (!map.has(pkg.package_name)) {
                    map.set(pkg.package_name, pkg.package_color_code);
                }
            });
        });

        getAllPackages = Object.fromEntries(map);

        const complaint_report = normalizeCompletedModeReport(REPORT2, months, getAllPackages)
        const service_report = normalizeCompletedModeReport(REPORT3, months, getAllPackages)
        const renewal_report = normalizeCompletedModeReport(REPORT4, months, getAllPackages)

        // City Report
        const city_report = data?.city_base_report?.map(a => ({ name: a.city_name, 'Works': a?.total_work }))

        return {
            countReport: count_report,
            complaintReport: complaint_report,
            serviceReport: service_report,
            renewalReport: renewal_report,
            cityReport: city_report,
            getAllPackages
        }
        // eslint-disable-next-line
    }, [data, loading, error])

    return (
        <div className="completed-service-report-container">

            <div className="count-card-list">
                {countReport.map((c, index) => (
                    <div className="count-card">
                        <div className="top-section">
                            <div className="icon">
                                {c?.icon}
                            </div>
                            <div className="count">
                                <h2>{c?.value}</h2>
                                <p>{c?.desc}</p>
                            </div>
                        </div>
                        <div className="text-footer">
                            <h4>{c?.label}</h4>
                            <div className={`percentage ${c?.percentage >= 0 ? 'success' : 'danger'}`}>
                                <p>{Math.abs(Number(c?.percentage).toFixed(2))}%</p>
                                {c?.percentage >= 0 ? <TbChevronsUp /> : <TbChevronsDown />}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="reports">
                <div className="report-one report-box">
                    <div className="title-section">
                        <h4>Complaint Mode Chart (6 Months)</h4>
                    </div>
                    <div className="content">
                        <ComposedChart
                            style={{ width: '100%', height: '230px' }}
                            data={complaintReport}
                            responsive
                            margin={{ left: -30 }}
                        >
                            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                            <YAxis niceTicks="snap125" tick={{ fontSize: 11 }} />
                            <ChartTooltip />
                            <ChartLegend />
                            <Bar key={'key'} dataKey={'Product Works'} barSize={20} fill={chartLabelColors[1]} radius={[10, 10, 0, 0]} />
                            {Object.keys(getAllPackages)?.map(k => (
                                <Line key={k} type="monotone" dataKey={k} strokeWidth={2} stroke={getAllPackages[k]} />
                            ))}
                        </ComposedChart>
                    </div>
                </div>
                <div className="report-two report-box">
                    <div className="title-section">
                        <h4>Service Mode Chart (6 Months)</h4>
                    </div>
                    <div className="content">
                        <ComposedChart
                            style={{ width: '100%', height: '230px' }}
                            data={serviceReport}
                            responsive
                            margin={{ left: -30 }}
                        >
                            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                            <YAxis niceTicks="snap125" tick={{ fontSize: 11 }} />
                            <ChartTooltip />
                            <ChartLegend />
                            <Bar key={'key'} dataKey={'Product Works'} barSize={20} fill={chartLabelColors[1]} radius={[10, 10, 0, 0]} />
                            {Object.keys(getAllPackages)?.map(k => (
                                <Line key={k} type="monotone" dataKey={k} strokeWidth={2} stroke={getAllPackages[k]} />
                            ))}
                        </ComposedChart>
                    </div>
                </div>
                <div className="report-three report-box">
                    <div className="title-section">
                        <h4>Renewal Mode Chart (6 Months)</h4>
                    </div>
                    <div className="content">
                        <ComposedChart
                            style={{ width: '100%', height: '230px' }}
                            data={renewalReport}
                            responsive
                            margin={{ left: -30 }}
                        >
                            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                            <YAxis niceTicks="snap125" tick={{ fontSize: 11 }} />
                            <ChartTooltip />
                            <ChartLegend />
                            <Bar key={'key'} dataKey={'Product Works'} barSize={20} fill={chartLabelColors[1]} radius={[10, 10, 0, 0]} />
                            {Object.keys(getAllPackages)?.map(k => (
                                <Line key={k} type="monotone" dataKey={k} strokeWidth={2} stroke={getAllPackages[k]} />
                            ))}
                        </ComposedChart>
                    </div>
                </div>
                <div className="report-four report-box">
                    <div className="title-section">
                        <h4>City Base Chart</h4>
                    </div>
                    <div className="content">
                        <ComposedChart
                            style={{ width: '100%', height: '230px' }}
                            data={cityReport}
                            responsive
                            margin={{ left: -30 }}
                        >
                            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                            <YAxis niceTicks="snap125" tick={{ fontSize: 11 }} />
                            <ChartTooltip />
                            <Bar key={'key'} dataKey={'Works'} barSize={20} fill={chartLabelColors[0]} radius={[10, 10, 0, 0]} />
                        </ComposedChart>
                    </div>
                </div>
            </div>
            <p className="last-update">Last update at {new Date(updatedAt).toLocaleString()}</p>
        </div>
    )
}

export default CompletedServiceReport