import React, { useMemo } from 'react'
import './subscription-report.scss'
import { Area, Cell, ComposedChart, Line, Pie, PieChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import ChartTooltip from '../primitives/ChartTooltip'
import ChartLegend from '../primitives/ChartLegend'
import { chartLabelColors } from '../../../assets/javascript/pre_data/chart'
import { convertAmount } from '../../../utils/helpers/text-formatting'
import { normalizeSubscriptionAmountReport, normalizeSubscriptionRenewalReport } from '../../../utils/services/chart_service'
import moment from 'moment'
import SkeletonGrid from '../../UI_Primitives/skeleton/SkeletonGrid'
import ErrorState from '../../UI_Primitives/ui-states/ErrorState'
import { TbAlertCircle } from 'react-icons/tb'


const SubscriptionReport = ({ data, loading, error, updatedAt }) => {

    const { amountReport, renewalReport, getAllPackages, packageUsage, packageNameReport, summery } = useMemo(() => {

        // Get last siz months
        const months = Array.from({ length: 6 }, (_, i) =>
            moment().subtract(i, "months").format("YYYY-MM")
        ).reverse()

        // Renewal Chart
        const REPORT1 = data?.renewal_chart || []
        const map = new Map();
        let getAllPackages = REPORT1.forEach((report) => {
            report.package_counts?.forEach((pkg) => {
                if (!map.has(pkg.package_name)) {
                    map.set(pkg.package_name, pkg.package_color_code);
                }
            });
        });

        getAllPackages = Object.fromEntries(map);
        const renewal_count_report = normalizeSubscriptionRenewalReport(REPORT1, months, getAllPackages)

        // Amount Report
        const REPORT2 = data?.amount_chart || []
        const amount_report = normalizeSubscriptionAmountReport(REPORT2, months)

        // Count Report
        const packageUsageChart = [
            { name: 'Subscription', value: data?.count_report?.total_package_products || 0 },
            { name: 'Standard', value: data?.count_report?.total_nonPackage_products || 0 }
        ]

        // package report
        const packageTypeReport = data?.count_report?.package_group_count?.map((g) => {
            return {
                name: g?.package_name,
                value: g?.count,
                color_code: g?.color_code
            }
        })

        // Summery
        const summery = {
            total_products: data?.count_report?.total_package_products || 0,
            total_customers: data?.count_report?.total_package_customers || 0,
            total_upcoming: data?.count_report?.total_pending_packages || 0,
            total_freezed: data?.count_report?.total_freeze_packages || 0
        }

        return {
            renewalReport: renewal_count_report,
            amountReport: amount_report,
            getAllPackages,
            packageUsage: packageUsageChart,
            packageNameReport: packageTypeReport,
            summery
        }
        // eslint-disable-next-line
    }, [data, loading, error])


    if (loading) {
        return <>
            <SkeletonGrid style={{ marginTop: '20px', }} rows={1} columns={3} height={'210px'}
                responsive={{
                    md: { columns: 1, rows: 1, height: '120px' },
                    sm: { columns: 1, rows: 1, height: '120px' }
                }} />

            <SkeletonGrid style={{ marginTop: '20px', marginBottom: '40px' }} rows={1} columns={2} height={'250px'}
                responsive={{ md: { columns: 2, rows: 2, height: '250px' } }} />
        </>
    }

    if (error) {
        return <ErrorState icon={<TbAlertCircle />} title={'Report not available'}
            message={error?.message || "Can't find report data"} hight='400px' />
    }

    return (
        <div className="subscription-report-container">
            <div className="reports">
                <div className="report-box report-one">
                    <div className="title-section">
                        <h4>Summery</h4>
                    </div>
                    <div className="content">
                        <div className="item-div">
                            <h2>{summery?.total_products || 0}</h2>
                            <p>Products</p>
                        </div>
                        <div className="item-div">
                            <h2>{summery?.total_customers || 0}</h2>
                            <p>Customers</p>
                        </div>
                        <div className="item-div">
                            <h2>{summery?.total_upcoming || 0}</h2>
                            <p>Upcoming</p>
                        </div>
                        <div className="item-div">
                            <h2>{summery?.total_freezed || 0}</h2>
                            <p>Freezed</p>
                        </div>
                    </div>
                </div>

                <div className="report-box report-two">
                    <div className="title-section">
                        <h4>Vessel Filters</h4>
                    </div>
                    <div className="content">
                        <ResponsiveContainer width={'100%'} height={170}>
                            <PieChart>
                                <Pie
                                    accessibilityLayer
                                    cornerRadius={10}
                                    data={packageUsage}
                                    stroke='none'
                                    cx="50%"
                                    cy="87%"
                                    startAngle={180}
                                    endAngle={0}
                                    labelLine={false}
                                    outerRadius={100}
                                    innerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    animationBegin={0}
                                    animationDuration={800}
                                    paddingAngle={5}
                                >
                                    <Cell key={`cell-1`} fill={chartLabelColors[0]} stroke='none' />
                                    <Cell key={`cell-2`} fill={chartLabelColors[1]} stroke='none' />
                                    <ChartTooltip />
                                    <ChartLegend />
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="report-box report-three">
                    <div className="title-section">
                        <h4>Subscriptions</h4>
                    </div>
                    <div className="content">
                        <div className="chart">
                            <ResponsiveContainer width={'100%'} height={170}>
                                <PieChart>
                                    <Pie
                                        accessibilityLayer
                                        cornerRadius={10}
                                        data={packageNameReport}
                                        stroke='none'
                                        cx="50%"
                                        cy="47%"
                                        labelLine={false}
                                        outerRadius={70}
                                        innerRadius={50}
                                        fill="#8884d8"
                                        dataKey="value"
                                        animationBegin={0}
                                        animationDuration={800}
                                        paddingAngle={5}
                                    >
                                        {packageNameReport?.map((entry, index) => {
                                            return <Cell key={`cell-${index}`} fill={entry?.color_code} stroke='none' />
                                        })}
                                        <ChartTooltip />
                                        <ChartLegend />
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="report-box report-four">
                    <div className="title-section">
                        <h4>Subscription Renewals (6 Months)</h4>
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
                            <Line key={'Pkg Context'} type="monotone" dataKey={'Pkg Context'} strokeWidth={2} stroke={chartLabelColors[2]}
                                strokeDasharray="3 4 5 2" />
                            <Line key={'Non Pkg Context'} type="monotone" dataKey={'Non Pkg Context'} strokeWidth={2} stroke={chartLabelColors[1]}
                                strokeDasharray="3 4 5 2" />

                            {Object.keys(getAllPackages)?.map(k => (
                                <Line key={k} type="monotone" dataKey={k} strokeWidth={2} stroke={getAllPackages[k]} />
                            ))}
                        </ComposedChart>
                    </div>
                </div>

                <div className="report-box report-five">
                    <div className="title-section">
                        <h4>Subscription Amounts (6 Months)</h4>
                    </div>
                    <div className="content">
                        <ComposedChart
                            style={{ width: '100%', height: '230px' }}
                            data={amountReport}
                            responsive
                            margin={{ left: -10 }}
                        >
                            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                            <YAxis niceTicks="snap125" tick={{ fontSize: 11 }} tickFormatter={(value) => `₹${convertAmount(value)}`}
                            />
                            <ChartTooltip valueFormatter={(value) => [`₹${convertAmount(value)}`]} nameVisibility={false}
                                nameColorVisibility={false} />

                            <Area key={'Amount'} type="monotone" dataKey={'Amount'} strokeWidth={2} stroke={chartLabelColors[0]}
                                strokeDasharray="3 4 5 2" fill={chartLabelColors[1]} />
                        </ComposedChart>
                    </div>
                </div>
            </div>
            <p className="last-update">Last update at {new Date(updatedAt).toLocaleString()}</p>
        </div>
    )
}

export default SubscriptionReport