import React, { useMemo } from 'react'
import './completed-service-report.scss'
import {
    TbAlertCircle, TbBriefcase2, TbCashBanknote, TbClockHour4, TbCrown,
    TbManualGearbox, TbCircleLetterC, TbCalendarEvent, TbUser, TbBox, TbPlugConnected, TbRepeat, TbRoute, TbRoad, TbTool, TbRefresh, TbAlertTriangle
} from 'react-icons/tb'
import { convertAmount, toStandardText } from '../../../utils/helpers/text-formatting'
import { formatSecondsToHHMM } from '../../../utils/helpers/date-helpers'
import moment from 'moment'
import SkeletonGrid from '../../UI_Primitives/skeleton/SkeletonGrid'
import ErrorState from '../../UI_Primitives/ui-states/ErrorState'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../../api'
import { useSearchParams } from 'react-router-dom'


const MODE_META = {
    COMPLAINT: { icon: <TbAlertTriangle />, tone: 'danger' },
    SERVICE: { icon: <TbTool />, tone: 'primary' },
    RENEWAL: { icon: <TbRefresh />, tone: 'success' },
}

const inr = (n) => `₹ ${new Intl.NumberFormat('en-IN').format(Number(n) || 0)}`
const pct = (part, total) => total > 0 ? Math.round((part / total) * 100) : 0

const CompletedServiceReport = () => {
    const [searchParams] = useSearchParams();


    const parentType = useMemo(() => {

        if (searchParams.get('product_type')) {
            const types = [...new Set(String(searchParams.get('product_type')).split(',').map(t => t.trim().toUpperCase()).filter(Boolean))]

            if (types?.length === 1 && types?.[0] !== 'DEFAULT') {
                return searchParams.get('product_type')
            }
        }

        return null

        // eslint-disable-next-line
    }, [searchParams.get('product_type')])


    const {
        data: { report_data, query } = {},
        isLoading: reportLoading,
        isFetching: reportFetching,
        error: reportError,
        dataUpdatedAt: reportDataUpdatedAt
    } = useQuery({
        queryKey: ['sn', 'completed-report', searchParams.get('technician_id'), searchParams.get('from_date'),
            searchParams.get('end_date'), parentType],
        queryFn: async () => {
            // params
            const params = {}
            let techName = null

            if (!searchParams.get('from_date') || !searchParams.get('end_date')) {
                params.from_date = moment().startOf('month').format('YYYY-MM-DD')
                params.end_date = moment().endOf('month').format('YYYY-MM-DD')
            } else {
                params.from_date = searchParams.get('from_date')
                params.end_date = searchParams.get('end_date')
            }

            if (searchParams.get('technician_id')) {
                params.technician_uuid = searchParams.get('technician_id')
                techName = searchParams.get('tech_name') ?? null

            }
            if (parentType) {
                params.parent_type = parentType
            }

            const res = await api.vfCv2Axios.get(`/service/completed/job-report`, {
                params: params
            })
            return {
                report_data: res,
                query: {
                    from_date: new Date(params?.from_date),
                    end_date: new Date(params?.end_date),
                    technician_name: techName,
                    parent_type: params.parent_type ?? null,
                }
            }
        },
        enabled: searchParams.get('p') !== 'l' || !searchParams.get('p'),
        staleTime: 30 * 60_000
    })


    const view = useMemo(() => {
        const r = report_data || {}
        const revenue = Number(r.revenue) || 0
        const spare = Number(r.spare_amount) || 0
        const service = Number(r.service_work_amount) || 0
        const other = Math.max(0, revenue - spare - service)

        const totalWork = Number(r.total_work) || 0
        const working = Number(r.working_time) || 0
        const travel = Number(r.travel_time) || 0
        const modes = (r.mode_count || [])
        const modeTotal = modes.reduce((a, m) => a + (Number(m.count) || 0), 0)

        return {
            revenue, spare, service, other, totalWork, working, travel,
            avgRevenue: totalWork > 0 ? Math.round(revenue / totalWork) : 0,
            avgWorking: totalWork > 0 ? working / totalWork : 0,
            avgTravel: totalWork > 0 ? travel / totalWork : 0,
            distanceKm: (Number(r.travel_distance) || 0) / 1000,
            modes, modeTotal,
            subscriptionWorks: modes.reduce((a, m) => a + (m.packages || []).reduce((s, p) => s + (Number(p.count) || 0), 0), 0),
        }
    }, [report_data])

    // Query details (only the dates are required; technician & product type are optional)
    const fromDate = query?.from_date ? moment(query.from_date) : null
    const endDate = query?.end_date ? moment(query.end_date) : null
    const sameDay = fromDate && endDate && fromDate.isSame(endDate, 'day')
    const rangeLabel = fromDate && endDate
        ? (sameDay ? fromDate.format('DD MMM YYYY') : `${fromDate.format('DD MMM')} to ${endDate.format('DD MMM')}`)
        : 'All dates'
    const dayCount = fromDate && endDate ? endDate.clone().endOf('day').diff(fromDate.clone().startOf('day'), 'days') + 1 : null

    const querySection = (
        <div className="query-details">
            <div className="q-chip q-date">
                <TbCalendarEvent />
                <div>
                    <p className="q-label">Report Period</p>
                    <p className="q-value">{rangeLabel}{dayCount ? <small>{dayCount} day{dayCount > 1 ? 's' : ''}</small> : null}</p>
                </div>
            </div>
            <div className="q-chip">
                <TbUser />
                <div>
                    <p className="q-label">Technician</p>
                    <p className="q-value">{query?.technician_name ? query?.technician_name : 'All technicians'}</p>
                </div>
            </div>
            <div className="q-chip">
                <TbBox />
                <div>
                    <p className="q-label">Product Type</p>
                    <p className="q-value">{query?.parent_type ? toStandardText(query?.parent_type) : "All Products"}</p>
                </div>
            </div>
        </div>
    )

    if (reportLoading || reportFetching) {
        return <>
            <SkeletonGrid style={{ marginTop: '20px' }} rows={1} columns={1} height={'150px'} />
            <SkeletonGrid style={{ marginTop: '15px' }} rows={1} columns={5} height={'100px'}
                responsive={{ md: { columns: 2, rows: 3, height: '100px' }, sm: { columns: 1, rows: 5, height: '100px' } }} />
            <SkeletonGrid style={{ marginTop: '20px', marginBottom: '40px' }} rows={1} columns={3} height={'220px'}
                responsive={{ md: { columns: 1, rows: 3, height: '220px' } }} />
        </>
    }

    if (reportError) {
        return <ErrorState icon={<TbAlertCircle />} title={'Report not available'}
            message={reportError?.message || "Can't find report data"} hight='400px' />
    }

    const revenueParts = [
        { key: 'spare', label: 'Spare Amount', value: view.spare, cls: 'seg-spare' },
        { key: 'service', label: 'Service Work Amount', value: view.service, cls: 'seg-service' },
        { key: 'other', label: 'Other Charges', value: view.other, cls: 'seg-other' },
    ]

    const stats = [
        { label: 'Total Works', value: view.totalWork, icon: <TbBriefcase2 />, tone: 'primary' },
        { label: 'Calls', value: report_data?.call_total || 0, icon: <TbCircleLetterC />, tone: 'info' },
        { label: 'Service Products', value: report_data?.service_product_count || 0, icon: <TbManualGearbox />, tone: 'success' },
        { label: 'New Add-Ons', value: report_data?.new_add_on_count || 0, icon: <TbPlugConnected />, tone: 'warning' },
        { label: 'Repeat Product Works', value: report_data?.repeat_product_work || 0, icon: <TbRepeat />, tone: 'danger' },
    ]

    const activityTotal = view.working + view.travel

    return (
        <div className="completed-service-report-container">

            {querySection}

            {/* Hero: revenue */}
            <div className="revenue-hero">
                <div className="hero-main">
                    <div className="hero-text">
                        <span className="hero-label">Total Revenue</span>
                        <h2 className="hero-value">{inr(view.revenue)}</h2>
                        <span className="hero-sub">{convertAmount(view.revenue)} · Avg {inr(view.avgRevenue)} / work</span>
                    </div>
                    <div className="hero-icon"><TbCashBanknote /></div>
                </div>

                <div className="hero-split">
                    <div className="split-bar">
                        {revenueParts.map(p => (
                            <span key={p.key} className={`seg ${p.cls}`} style={{ width: `${pct(p.value, view.revenue)}%` }} />
                        ))}
                    </div>
                    <div className="split-legend">
                        {revenueParts.map(p => (
                            <div className="legend-item" key={p.key}>
                                <span className={`dot ${p.cls}`} />
                                <div>
                                    <p className="legend-label">{p.label}</p>
                                    <p className="legend-value">{inr(p.value)} <small>{pct(p.value, view.revenue)}%</small></p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Stat cards */}
            <div className="stat-card-list">
                {stats.map(s => (
                    <div className={`stat-card tone-${s.tone}`} key={s.label}>
                        <div className="stat-icon">{s.icon}</div>
                        <h3 className="stat-value">{s.value}</h3>
                        <p className="stat-label">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Mode breakdown */}
            <h4 className="section-title">Work Mode Breakdown</h4>
            <div className="mode-list">
                {view.modes.map(m => {
                    const meta = MODE_META[m.mode] || { icon: <TbBriefcase2 />, tone: 'primary' }
                    const pkgTotal = (m.packages || []).reduce((a, p) => a + (Number(p.count) || 0), 0)
                    return (
                        <div className={`mode-card tone-${meta.tone}`} key={m.mode}>
                            <div className="mode-head">
                                <div className="mode-icon">{meta.icon}</div>
                                <div className="mode-title">
                                    <h4>{toStandardText(m.mode)}</h4>
                                    <p>{pct(m.count, view.modeTotal)}% of works</p>
                                </div>
                                <h2 className="mode-count">{m.count}</h2>
                            </div>

                            <div className="mode-progress">
                                <span style={{ width: `${pct(m.count, view.modeTotal)}%` }} />
                            </div>

                            <div className="mode-packages">
                                <p className="pkg-title"><TbCrown /> Subscription works · {pkgTotal}</p>
                                {(m.packages || []).length === 0 && <p className="pkg-empty">No subscription works</p>}
                                {(m.packages || []).map(p => (
                                    <div className="pkg-row" key={p.package_id}>
                                        <span className="pkg-dot" style={{ backgroundColor: p.color_code }} />
                                        <span className="pkg-name">{p.package_name}</span>
                                        <div className="pkg-bar">
                                            <span style={{ width: `${pct(p.count, m.count)}%`, backgroundColor: p.color_code }} />
                                        </div>
                                        <span className="pkg-count">{p.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Field activity */}
            <h4 className="section-title">Field Activity</h4>
            <div className="activity-card">
                <div className="activity-grid">
                    <div className="activity-item">
                        <div className="a-icon tone-success"><TbClockHour4 /></div>
                        <div>
                            <p className="a-label">Working Time</p>
                            <h3 className="a-value">{formatSecondsToHHMM(view.working) || '0m'}</h3>
                            <p className="a-sub">Avg {formatSecondsToHHMM(view.avgWorking) || '0m'} / work</p>
                        </div>
                    </div>
                    <div className="activity-item">
                        <div className="a-icon tone-warning"><TbRoute /></div>
                        <div>
                            <p className="a-label">Travel Time</p>
                            <h3 className="a-value">{formatSecondsToHHMM(view.travel) || '0m'}</h3>
                            <p className="a-sub">Avg {formatSecondsToHHMM(view.avgTravel) || '0m'} / work</p>
                        </div>
                    </div>
                    <div className="activity-item">
                        <div className="a-icon tone-info"><TbRoad /></div>
                        <div>
                            <p className="a-label">Travel Distance</p>
                            <h3 className="a-value">{new Intl.NumberFormat('en-IN', { maximumFractionDigits: 1 }).format(view.distanceKm)} km</h3>
                            <p className="a-sub">Avg {(view.totalWork > 0 ? view.distanceKm / view.totalWork : 0).toFixed(1)} km / work</p>
                        </div>
                    </div>
                </div>

                <div className="time-split">
                    <div className="time-bar">
                        <span className="seg-work" style={{ width: `${pct(view.working, activityTotal)}%` }} />
                        <span className="seg-travel" style={{ width: `${pct(view.travel, activityTotal)}%` }} />
                    </div>
                    <div className="time-legend">
                        <span><i className="seg-work" /> Working {pct(view.working, activityTotal)}%</span>
                        <span><i className="seg-travel" /> Travel {pct(view.travel, activityTotal)}%</span>
                    </div>
                </div>
            </div>

            {reportDataUpdatedAt ? <p className="last-update">Last update at {new Date(reportDataUpdatedAt).toLocaleString()}</p> : null}
        </div>
    )
}

export default CompletedServiceReport
