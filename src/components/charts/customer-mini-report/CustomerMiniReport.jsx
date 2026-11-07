import React from 'react'
import './customer-mini-report.scss'
import { TbMoodSadDizzy, TbMoodSearch } from 'react-icons/tb'
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { renderCustomChartLabel } from '../../../utils/helpers/chart_utils'
import { chartLabelColors } from '../../../assets/javascript/pre_data/chart'
import { api } from '../../../api'
import ChartTooltip from '../primitives/ChartTooltip'
import ChartLegend from '../primitives/ChartLegend'
import SkeletonGrid from '../../UI_Primitives/skeleton/SkeletonGrid'
import ErrorState from '../../UI_Primitives/ui-states/ErrorState'
import { modal } from '../../../redux/features/non_persisted/miniSystemSlice'
import { useDispatch } from 'react-redux'
import SearchCustomerByKey from '../../forms/controller/search-customer/SearchCustomerByKey'
import { useQuery } from '@tanstack/react-query'

const CustomerMiniReport = () => {
    const dispatch = useDispatch()

    const openSearchModal = () => {
        dispatch(modal.push({
            show: true,
            title: "Search Customers",
            body: <SearchCustomerByKey />
        }))
    }

    const {
        data: {
            vesselReport = {},
            purifierReport = {},
            customerCount = [],
            addOnReport = {},
        } = {},
        isLoading: reportLoading,
        error: reportError,
        dataUpdatedAt: reportDataUpdatedAt,
    } = useQuery({
        queryKey: ['customer_mini_report', 'v3'],
        queryFn: async () => {
            const reports = await api.ssCv2Axios.get('/product/mini-report')

            // 1. Vessel Report Calculations
            const vProducts = Number(reports?.vessel_report?.products || 0)
            const vInHouse = Number(reports?.vessel_report?.inHouse_products || 0)
            const vOutside = Number(reports?.vessel_report?.outSide_products || 0)
            const vInHousePct = vProducts > 0 ? Number(((vInHouse / vProducts) * 100).toFixed(2)) : 0
            const vOutsidePct = vProducts > 0 ? Number(((vOutside / vProducts) * 100).toFixed(2)) : 0

            // 2. Water Purifier Report Calculations
            const pProducts = Number(reports?.purifier_report?.products || 0)
            const pInHouse = Number(reports?.purifier_report?.inHouse_products || 0)
            const pOutside = Number(reports?.purifier_report?.outSide_products || 0)
            const pInHousePct = pProducts > 0 ? Number(((pInHouse / pProducts) * 100).toFixed(2)) : 0
            const pOutsidePct = pProducts > 0 ? Number(((pOutside / pProducts) * 100).toFixed(2)) : 0

            // 3. Customer Report Calculations
            const totalCustomers = Number(reports?.customer_report?.total_customers || 0)
            const productCustomers = Number(reports?.customer_report?.product_customers || 0)
            const otherCustomers = Math.max(0, totalCustomers - productCustomers)

            // 4. Add-on Report Calculations
            const addOnProducts = Number(reports?.addOn_report?.products || 0)
            const addOnInHouse = Number(reports?.addOn_report?.inHouse_products || 0)
            const addOnOutside = Number(reports?.addOn_report?.outSide_products || 0)
            const addOnInHousePct = addOnProducts > 0 ? Number(((addOnInHouse / addOnProducts) * 100).toFixed(2)) : 0
            const addOnOutsidePct = addOnProducts > 0 ? Number(((addOnOutside / addOnProducts) * 100).toFixed(2)) : 0

            return {
                vesselReport: {
                    products: vProducts,
                    inactive_products: Number(reports?.vessel_report?.inactive_products || 0),
                    new_product_in_30_days: Number(reports?.vessel_report?.new_product_in_30_days || 0),
                    in_house_products: vInHousePct,
                    out_side_products: vOutsidePct,
                    in_house_count: vInHouse,
                    out_side_count: vOutside
                },
                purifierReport: {
                    products: pProducts,
                    inactive_products: Number(reports?.purifier_report?.inactive_products || 0),
                    new_product_in_30_days: Number(reports?.purifier_report?.new_product_in_30_days || 0),
                    in_house_products: pInHousePct,
                    out_side_products: pOutsidePct,
                    in_house_count: pInHouse,
                    out_side_count: pOutside
                },
                customerCount: [
                    { name: 'Product Users', value: productCustomers },
                    { name: 'Other Users', value: otherCustomers }
                ],
                addOnReport: {
                    products: addOnProducts,
                    inactive_products: Number(reports?.addOn_report?.inactive_products || 0),
                    new_product_in_30_days: Number(reports?.addOn_report?.new_product_in_30_days || 0),
                    rental_products: Number(reports?.addOn_report?.rental_products || 0),
                    in_house_products: addOnInHousePct,
                    out_side_products: addOnOutsidePct,
                    in_house_count: addOnInHouse,
                    out_side_count: addOnOutside
                }
            }
        },
        staleTime: 30 * 60_000
    })

    // Loading State
    if (reportLoading) {
        return (
            <div className="customer-mini-report-comp-load">
                <SkeletonGrid rows={1} columns={1} height={165} />
                <SkeletonGrid rows={1} columns={2} height={170} style={{ marginTop: '15px' }}
                    responsive={{
                        md: { rows: 2, columns: 1 }
                    }} />
                <SkeletonGrid rows={1} columns={2} height={170} style={{ marginTop: '15px' }}
                    responsive={{
                        md: { rows: 2, columns: 1 }
                    }} />
            </div>
        )
    }

    // Error State
    if (reportError) {
        return (
            <ErrorState
                hight="70vh"
                title="Report can't Load!"
                message={reportError?.message}
                icon={<TbMoodSadDizzy />}
            />
        )
    }

    return (
        <div className="customer-mini-report-comp">
            {/* Quick Search Action */}
            <div className="search-button-box" onClick={openSearchModal}>
                <span><TbMoodSearch /></span>
                <h3>Search customers</h3>
                <p>Search customers using Name, address, contact numbers and product Id</p>
            </div>

            {/* Reports Grid */}
            <div className="reports">

                {/* 1. Vessel Report */}
                <div className="vessel-report report-box">
                    <div className="title-section">
                        <h4>Vessel Report</h4>
                    </div>
                    <div className="content">
                        <div className="number-chart">
                            <div className="section-one">
                                <div className="item-div">
                                    <h2>{vesselReport?.products || 0}</h2>
                                    <p>Products</p>
                                </div>
                                <div className="item-div">
                                    <h2>{vesselReport?.inactive_products || 0}</h2>
                                    <p>Inactive</p>
                                </div>
                                <div className="item-div">
                                    <h2>{vesselReport?.new_product_in_30_days || 0}</h2>
                                    <p>New in 30d</p>
                                </div>
                            </div>

                            <div className="section-two">
                                <div className="bar-border">
                                    <p>Product Types (In House & Outside)</p>
                                    <ResponsiveContainer width="100%" height={18}>
                                        <BarChart
                                            layout="vertical"
                                            data={[{
                                                name: "Percentage (%)",
                                                'In house': vesselReport?.in_house_products || 0,
                                                Outside: vesselReport?.out_side_products || 0
                                            }]}
                                            stackOffset="none"
                                        >
                                            <XAxis type="number" domain={[0, 100]} hide />
                                            <YAxis type="category" dataKey="name" hide />
                                            <Bar
                                                dataKey="In house"
                                                stackId="a"
                                                fill={chartLabelColors[0]}
                                                barSize={10}
                                                radius={[6, 6, 6, 6]}
                                                background={{
                                                    fill: "var(--surface-3)",
                                                    radius: 6,
                                                    pointerEvents: "none"
                                                }}
                                            />
                                            <Bar
                                                dataKey="Outside"
                                                stackId="a"
                                                fill={chartLabelColors[1]}
                                                barSize={10}
                                                radius={[6, 6, 6, 6]}
                                                background={{
                                                    fill: "var(--surface-3)",
                                                    radius: 6,
                                                    pointerEvents: "none"
                                                }}
                                            />
                                            <ChartTooltip valueFormatter={(value) => `${value}%`} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Water Purifier Report */}
                <div className="purifier-report report-box">
                    <div className="title-section">
                        <h4>Water Purifier Report</h4>
                    </div>
                    <div className="content">
                        <div className="number-chart">
                            <div className="section-one">
                                <div className="item-div">
                                    <h2>{purifierReport?.products || 0}</h2>
                                    <p>Products</p>
                                </div>
                                <div className="item-div">
                                    <h2>{purifierReport?.inactive_products || 0}</h2>
                                    <p>Inactive</p>
                                </div>
                                <div className="item-div">
                                    <h2>{purifierReport?.new_product_in_30_days || 0}</h2>
                                    <p>New in 30d</p>
                                </div>
                            </div>

                            <div className="section-two">
                                <div className="bar-border">
                                    <p>Product Types (In House & Outside)</p>
                                    <ResponsiveContainer width="100%" height={18}>
                                        <BarChart
                                            layout="vertical"
                                            data={[{
                                                name: "Percentage (%)",
                                                'In house': purifierReport?.in_house_products || 0,
                                                Outside: purifierReport?.out_side_products || 0
                                            }]}
                                            stackOffset="none"
                                        >
                                            <XAxis type="number" domain={[0, 100]} hide />
                                            <YAxis type="category" dataKey="name" hide />
                                            <Bar
                                                dataKey="In house"
                                                stackId="a"
                                                fill={chartLabelColors[0]}
                                                barSize={10}
                                                radius={[6, 6, 6, 6]}
                                                background={{
                                                    fill: "var(--surface-3)",
                                                    radius: 6,
                                                    pointerEvents: "none"
                                                }}
                                            />
                                            <Bar
                                                dataKey="Outside"
                                                stackId="a"
                                                fill={chartLabelColors[1]}
                                                barSize={10}
                                                radius={[6, 6, 6, 6]}
                                                background={{
                                                    fill: "var(--surface-3)",
                                                    radius: 6,
                                                    pointerEvents: "none"
                                                }}
                                            />
                                            <ChartTooltip valueFormatter={(value) => `${value}%`} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Customer Report */}
                <div className="report-box customer-report">
                    <div className="title-section">
                        <h4>Customer Report</h4>
                    </div>
                    <div className="content">
                        <ResponsiveContainer width="100%" height={140}>
                            <PieChart>
                                <Pie
                                    accessibilityLayer
                                    cornerRadius={10}
                                    data={customerCount}
                                    stroke="none"
                                    cx="50%"
                                    cy="87%"
                                    startAngle={180}
                                    endAngle={0}
                                    labelLine={false}
                                    label={renderCustomChartLabel}
                                    outerRadius={100}
                                    innerRadius={80}
                                    fill={chartLabelColors[0]}
                                    dataKey="value"
                                    animationBegin={0}
                                    animationDuration={800}
                                    paddingAngle={5}
                                >
                                    {customerCount?.map((entry, index) => (
                                        <Cell
                                            key={`c-cell-${index}`}
                                            fill={chartLabelColors[index % chartLabelColors.length]}
                                            stroke="none"
                                        />
                                    ))}
                                    <ChartTooltip />
                                    <ChartLegend />
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 4. Add-on Report (2 Rows) */}
                <div className="report-box add-on-report">
                    <div className="title-section">
                        <h4>Add-on Report</h4>
                    </div>
                    <div className="content">
                        {/* Row 1: KPI Numbers */}
                        <div className="section-one">
                            <div className="item-div">
                                <h2>{addOnReport?.products || 0}</h2>
                                <p>Products</p>
                            </div>
                            <div className="item-div">
                                <h2>{addOnReport?.inactive_products || 0}</h2>
                                <p>Inactive</p>
                            </div>
                            <div className="item-div">
                                <h2>{addOnReport?.rental_products || 0}</h2>
                                <p>Rental</p>
                            </div>
                            <div className="item-div">
                                <h2>{addOnReport?.new_product_in_30_days || 0}</h2>
                                <p>New in 30d</p>
                            </div>
                        </div>

                        {/* Row 2: Product Types Bar */}
                        <div className="section-two">
                            <div className="bar-border">
                                <p>Product Types (In House & Outside)</p>
                                <ResponsiveContainer width="100%" height={18}>
                                    <BarChart
                                        layout="vertical"
                                        data={[{
                                            name: "Percentage (%)",
                                            'In house': addOnReport?.in_house_products || 0,
                                            Outside: addOnReport?.out_side_products || 0
                                        }]}
                                        stackOffset="none"
                                    >
                                        <XAxis type="number" domain={[0, 100]} hide />
                                        <YAxis type="category" dataKey="name" hide />
                                        <Bar
                                            dataKey="In house"
                                            stackId="a"
                                            fill={chartLabelColors[0]}
                                            barSize={10}
                                            radius={[6, 6, 6, 6]}
                                            background={{
                                                fill: "var(--surface-3)",
                                                radius: 6,
                                                pointerEvents: "none"
                                            }}
                                        />
                                        <Bar
                                            dataKey="Outside"
                                            stackId="a"
                                            fill={chartLabelColors[1]}
                                            barSize={10}
                                            radius={[6, 6, 6, 6]}
                                            background={{
                                                fill: "var(--surface-3)",
                                                radius: 6,
                                                pointerEvents: "none"
                                            }}
                                        />
                                        <ChartTooltip valueFormatter={(value) => `${value}%`} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Footer with Timestamp */}
            <p className="last-update">
                Last update at {new Date(reportDataUpdatedAt).toLocaleString()}
            </p>
        </div>
    )
}

export default CustomerMiniReport
