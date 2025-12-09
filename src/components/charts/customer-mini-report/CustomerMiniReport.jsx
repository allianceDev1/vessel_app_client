import React, { useEffect, useState } from 'react'
import './customer-mini-report.scss'
import { TbMoodSadDizzy, TbMoodSearch } from 'react-icons/tb'
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { renderCustomChartLabel } from '../../../utils/services/chart_service'
import { chartLabelColors } from '../../../assets/javascript/pre_data/chart'
import { api } from '../../../api'
import { calculatePercentage } from '../../../utils/helpers/math-equations';
import ChartTooltip from '../primitives/ChartTooltip';
import ChartLegend from '../primitives/ChartLegend';
import SkeletonGrid from '../../UI_Primitives/skeleton/SkeletonGrid'
import ErrorState from '../../UI_Primitives/ui-states/ErrorState'
import { modal } from '../../../redux/features/non_persisted/miniSystemSlice'
import { useDispatch } from 'react-redux'
import SearchCustomerByKey from '../../forms/search-customer/SearchCustomerByKey'


const CustomerMiniReport = () => {
    const dispatch = useDispatch();
    const [productChart, setProductChart] = useState([])
    const [productReport, setProductReport] = useState({})
    const [customerCount, setCustomerCount] = useState([])
    const [addOnReport, setAddOnReport] = useState({})
    const [error, setError] = useState({ error: false, title: null, message: null })
    const [loading, setLoading] = useState('fetch')

    const openSearchModal = () => {
        dispatch(modal.push({
            show: true,
            title: "Search Customers",
            body: <SearchCustomerByKey />
        }))
    }

    const fetchApi = async () => {
        try {
            setLoading('fetch')
            setError({ error: false, title: null, message: null })

            const reports = await api.vfCv2Axios.get('/product/mini-report')
            setProductChart([
                { name: 'In-house', value: reports?.vessel_report?.inHouse_products || 0 },
                { name: 'Outside', value: reports?.vessel_report?.outSide_products || 0 }
            ])
            setProductReport({
                products: reports?.vessel_report?.products || 0,
                inactive_products: reports?.vessel_report?.inactive_products || 0,
                new_product_in_30_days: reports?.vessel_report?.new_product_in_30_days || 0,
                iw_products: reports?.vessel_report?.iw_products || 0,
                ssp_products: reports?.vessel_report?.ssp_products || 0,
                iw_percentage: calculatePercentage(reports?.vessel_report?.iw_products, reports?.vessel_report?.products) || 0,
                ssp_percentage: calculatePercentage(reports?.vessel_report?.ssp_products, reports?.vessel_report?.products) || 0
            })
            setCustomerCount([
                { name: 'Vessel Users', value: reports?.customer_report?.vessel_customers || 0 },
                { name: 'Other Users', value: reports?.customer_report?.total_customers - reports?.customer_report?.vessel_customers || 0, }
            ])
            setAddOnReport({
                products: reports?.addOn_report?.products || 0,
                inactive_products: reports?.addOn_report?.inactive_products || 0,
                new_product_in_30_days: reports?.addOn_report?.new_product_in_30_days || 0,
                in_house_products: reports?.addOn_report?.inHouse_products || 0,
                out_side_products: reports?.addOn_report?.outSide_products || 0,
                rental_products: reports?.addOn_report?.rental_products || 0,
            })
        } catch (error) {
            setError({ error: true, title: 'Data fecting failed', message: error.message })
        } finally {
            setLoading('')
        }
    }

    useEffect(() => {
        fetchApi()
    }, [])

    // loading
    if (loading === 'fetch') {
        return <div className="customer-mini-report-comp-load">
            <SkeletonGrid rows={1} columns={1} height={165} />
            <SkeletonGrid rows={1} columns={2} height={140} style={{ marginTop: '15px' }}
                responsive={{
                    md: { rows: 1, columns: 2 }
                }} />
            <SkeletonGrid rows={1} columns={1} height={140} style={{ marginTop: '15px' }}
                responsive={{
                    md: { rows: 1, columns: 2 }
                }} />
        </div>
    }

    // Error
    if (error?.error) {
        return <ErrorState
            hight='70vh'
            title={error?.title}
            message={error?.message}
            icon={<TbMoodSadDizzy />}
        />
    }

    // Content
    return (
        <div className="customer-mini-report-comp">
            <div className="search-button-box" onClick={openSearchModal}>
                <span> <TbMoodSearch /></span>
                <h3>Search vessel filter customer</h3>
                <p>Search customers using Name, address, contact numbers and product Id</p>
            </div>
            <div className="reports">
                <div className="vessel-report report-box">
                    <div className="title-section">
                        <h4>Vessel Report</h4>
                    </div>
                    <div className="content">
                        <div className="number-chart">
                            <div className="section-one">
                                <div className="item-div">
                                    <h2>{productReport?.products || 0}</h2>
                                    <p>Products</p>
                                </div>
                                <div className="item-div">
                                    <h2>{productReport?.inactive_products || 0}</h2>
                                    <p>Inactive</p>
                                </div>
                                <div className="item-div">
                                    <h2>{productReport?.new_product_in_30_days || 0}</h2>
                                    <p>New in 30d</p>
                                </div>
                            </div>

                            <div className="section-two">
                                <div className="bar-border">
                                    <p>I/W Products : {productReport?.iw_products}</p>
                                    <ResponsiveContainer width="100%" height="18">
                                        <BarChart layout="vertical" data={[{ name: "", percentage: productReport?.iw_percentage, remaining: 100 - productReport?.iw_percentage }]} stackOffset="none">
                                            <XAxis type="number" domain={[0, 100]} hide />
                                            <YAxis type="category" dataKey="name" hide />
                                            <Bar dataKey="percentage" stackId="a" fill={chartLabelColors[0]} barSize={10} radius={[6, 6, 6, 6]}
                                                background={{
                                                    fill: "var(--color-natural-trans-73)",
                                                    radius: 6,
                                                    pointerEvents: "none"
                                                }} >
                                                <ChartTooltip />
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="bar-border">
                                    <p>SSP Products : {productReport?.ssp_products}</p>
                                    <ResponsiveContainer width="100%" height="18">
                                        <BarChart layout="vertical" data={[{ name: "", percentage: productReport?.ssp_percentage }]} stackOffset="none">
                                            <XAxis type="number" domain={[0, 100]} hide />
                                            <YAxis type="category" dataKey="name" hide />
                                            <Bar dataKey="percentage" stackId="a" fill={chartLabelColors[1]} barSize={10} radius={[6, 6, 6, 6]}
                                                background={{
                                                    fill: "var(--color-natural-trans-73)",
                                                    radius: 6
                                                }} >
                                                <ChartTooltip />
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                        <div className="chart">
                            <ResponsiveContainer width={'100%'} height={170}>
                                <PieChart>
                                    <Pie
                                        accessibilityLayer
                                        cornerRadius={10}
                                        data={productChart}
                                        stroke='none'
                                        cx="50%"
                                        cy="47%"
                                        labelLine={false}
                                        label={renderCustomChartLabel}
                                        outerRadius={70}
                                        innerRadius={50}
                                        fill="#8884d8"
                                        dataKey="value"
                                        animationBegin={0}
                                        animationDuration={800}
                                        paddingAngle={5}
                                    >
                                        {productChart.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={chartLabelColors[index % chartLabelColors.length]} stroke='none' />
                                        ))}
                                        <ChartTooltip />
                                        <ChartLegend />
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>


                    </div>

                </div>
                <div className="report-box customer-report">
                    <div className="title-section">
                        <h4>Customer Report</h4>
                    </div>
                    <div className="content">
                        <ResponsiveContainer width={'100%'} height={170}>
                            <PieChart>
                                <Pie
                                    accessibilityLayer
                                    cornerRadius={10}
                                    data={customerCount}
                                    stroke='none'
                                    cx="50%"
                                    cy="87%"
                                    startAngle={180}
                                    endAngle={0}
                                    labelLine={false}
                                    label={renderCustomChartLabel}
                                    outerRadius={100}
                                    innerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    animationBegin={0}
                                    animationDuration={800}
                                    paddingAngle={5}
                                >
                                    {productChart.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={chartLabelColors[(index + 4) % chartLabelColors.length]} stroke='none' />
                                    ))}
                                    <ChartTooltip />
                                    <ChartLegend />
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                </div>
                <div className="report-box add-on-report">
                    <div className="title-section">
                        <h4>Add-on Report</h4>
                    </div>
                    <div className="content">
                        <div className="section-two">
                            <div className="bar-border">
                                <p>Product Types</p>
                                <ResponsiveContainer width="100%" height="18">
                                    <BarChart layout="vertical" data={[{ name: "Product Types", 'In house': productReport?.iw_percentage, Outside: 100 - productReport?.iw_percentage }]} stackOffset="none">
                                        <XAxis type="number" domain={[0, 100]} hide />
                                        <YAxis type="category" dataKey="name" hide />
                                        <Bar dataKey="In house" stackId="a" fill={chartLabelColors[0]} barSize={10} radius={[6, 6, 6, 6]}
                                            background={{
                                                fill: "var(--color-natural-trans-73)",
                                                radius: 6,
                                                pointerEvents: "none"
                                            }} >
                                        </Bar>
                                        <Bar dataKey="Outside" stackId="a" fill={chartLabelColors[1]} barSize={10} radius={[6, 6, 6, 6]}
                                            background={{
                                                fill: "var(--color-natural-trans-73)",
                                                radius: 6,
                                                pointerEvents: "none"
                                            }} >
                                        </Bar>
                                        <ChartTooltip />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
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
                                <h2>{productReport?.new_product_in_30_days || 0}</h2>
                                <p>New in 30d</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}

export default CustomerMiniReport