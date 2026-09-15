import React, { useEffect, useMemo } from 'react'
import './registered-workflow.scss'
import { useDispatch } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { page } from '../../../redux/features/non_persisted/miniSystemSlice'
import { useInfiniteQuery } from '@tanstack/react-query'
import { api } from '../../../api'
import Button from '../../../components/UI_Primitives/buttons/Button'
import Badge from '../../../components/UI_Primitives/badge/Badge'
import SkeletonGrid from '../../../components/UI_Primitives/skeleton/SkeletonGrid'
import ErrorState from '../../../components/UI_Primitives/ui-states/ErrorState'
import {
    TbArrowLeft,
    TbArrowUpRight,
    TbRotate,
    TbExclamationCircle,
    TbFileText,
    TbPlayerPlay,
    TbCalendar,
    TbCalendarUp,
    TbCar,
    TbUserCheck,
    TbShieldCheck,
    TbCircleCheck,
    TbLock,
    TbClock,
    TbUser,
    TbTimeline,
    TbRefresh,
    TbCalendarEvent,
    TbCircleX,
    TbCalendarX
} from 'react-icons/tb'
import { convertIsoToAmPm, getTimeDiff, isoToDDMonYYYY } from '../../../utils/helpers/date-helpers'
import { toStandardText } from '../../../utils/helpers/text-formatting'

const getEventMeta = (type) => {
    switch (type) {
        case 'REGISTERED':
            return {
                label: 'Registered',
                icon: <TbFileText />,
                badgeSeverity: 'info',
                theme: 'registered'
            }
        case 'PROCEED':
            return {
                label: 'Proceeded',
                icon: <TbPlayerPlay />,
                badgeSeverity: 'primary',
                theme: 'proceed'
            }
        case 'SCHEDULED':
            return {
                label: 'Scheduled',
                icon: <TbCalendar />,
                badgeSeverity: 'warning',
                theme: 'scheduled'
            }
        case 'RESCHEDULED':
            return {
                label: 'Rescheduled',
                icon: <TbCalendarUp />,
                badgeSeverity: 'warning',
                theme: 'rescheduled'
            }
        case 'TRAVEL':
            return {
                label: 'Travel',
                icon: <TbCar />,
                badgeSeverity: 'info',
                theme: 'travel'
            }
        case 'ATTENDED':
            return {
                label: 'Attended',
                icon: <TbUserCheck />,
                badgeSeverity: 'primary',
                theme: 'attended'
            }
        case 'VERIFIED':
            return {
                label: 'Verified',
                icon: <TbShieldCheck />,
                badgeSeverity: 'success',
                theme: 'verified'
            }
        case 'COMPLETED':
            return {
                label: 'Completed',
                icon: <TbCircleCheck />,
                badgeSeverity: 'success',
                theme: 'completed'
            }
        case 'CLOSED':
            return {
                label: 'Closed',
                icon: <TbLock />,
                badgeSeverity: 'secondary',
                theme: 'closed'
            }
        case 'CANCELLED':
        case 'CANCELED':
            return {
                label: 'Cancelled',
                icon: <TbCircleX />,
                badgeSeverity: 'danger',
                theme: 'cancelled'
            }
        case 'UNSCHEDULED':
            return {
                label: 'Unscheduled',
                icon: <TbCalendarX />,
                badgeSeverity: 'danger',
                theme: 'unscheduled'
            }
        default:
            return {
                label: toStandardText(type, true),
                icon: <TbTimeline />,
                badgeSeverity: 'secondary',
                theme: 'default'
            }
    }
}

const formatTimeDelta = (startISO, endISO) => {
    if (!startISO || !endISO) return null
    try {
        const diff = getTimeDiff(startISO, endISO)
        if (diff.isNegative) return null
        if (diff.days > 0) {
            return `+${diff.days}d ${diff.hours}h`
        }
        if (diff.hours > 0) {
            return `+${diff.hours}h ${diff.minutes}m`
        }
        if (diff.minutes > 0) {
            return `+${diff.minutes}m`
        }
        return '+1m'
    } catch {
        return null
    }
}

const RegisteredWorkflow = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { reg_no } = useParams()

    useEffect(() => {
        dispatch(
            page.setTitle({})
        )
        // eslint-disable-next-line
    }, [])

    const fetchWorkflow = async ({ pageParam = 1 }) => {
        const res = await api.vfCv2Axios.get(
            `/service-registration/${reg_no}/workflow?page=${pageParam}`
        )
        const payload = res?.events ? res : res?.data || {}
        return {
            registration_id: payload?.registration_id || reg_no,
            is_closed: payload?.is_closed,
            is_self_close: payload?.is_self_close,
            events: payload?.events || [],
            pagination: payload?.pagination || {
                page: pageParam,
                limit: 10,
                total: (payload?.events || []).length,
                has_next: false,
                has_previous: pageParam > 1
            }
        }
    }

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        error,
        refetch,
        isRefetching
    } = useInfiniteQuery({
        queryKey: ['service_registration_workflow', reg_no],
        queryFn: fetchWorkflow,
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            if (lastPage?.pagination?.has_next) {
                return (lastPage?.pagination?.page || 1) + 1
            }
            return undefined
        },
        enabled: !!reg_no,
        staleTime: 30_000
    })

    const allEvents = useMemo(() => {
        return data?.pages?.flatMap((p) => p?.events || []) || []
    }, [data])

    const firstPage = data?.pages?.[0]
    const registrationId = firstPage?.registration_id || reg_no
    const isClosed = firstPage?.is_closed
    const isSelfClose = firstPage?.is_self_close
    const totalEvents = firstPage?.pagination?.total ?? allEvents.length

    const maxVisitIndex = useMemo(() => {
        let max = 0
        allEvents.forEach((ev) => {
            if (ev?.visit_index && ev.visit_index > max) {
                max = ev.visit_index
            }
        })
        return max
    }, [allEvents])

    const isCancelled = useMemo(() => {
        return allEvents.some((ev) => ['CANCELLED', 'CANCELED'].includes(ev?.type))
    }, [allEvents])

    const firstEvent = allEvents[0]
    const lastEvent = allEvents[allEvents.length - 1]

    if (isLoading) {
        return (
            <div className="registered-workflow-page">
                <div style={{ marginTop: '20px' }}>
                    <SkeletonGrid
                        rows={6}
                        columns={1}
                        height={'80px'}
                        gap={'14px'}
                    />
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="registered-workflow-page">
                <div style={{ marginTop: '20px' }}>
                    <ErrorState
                        icon={<TbExclamationCircle />}
                        title={'Data Fetching Failed'}
                        message={error?.message || 'Failed to load workflow history.'}
                        hight="400px"
                    />
                </div>
            </div>
        )
    }

    return (
        <div className="registered-workflow-page">
            {/* Header & Top Navigation */}
            <div className="top-navigation-bar">
                <div className="nav-left">
                    <div className="title-block">
                        <div className="heading-row">
                            <h2>Registration Workflow</h2>
                            <span className="reg-id-badge">{registrationId}</span>
                        </div>
                        <div className="meta-badges">
                            {isCancelled ? (
                                <Badge value="Cancelled" severity="danger" />
                            ) : (
                                isClosed !== undefined && (
                                    <Badge
                                        value={isClosed ? 'Closed' : 'Active'}
                                        severity={isClosed ? 'secondary' : 'success'}
                                    />
                                )
                            )}
                            {isSelfClose && (
                                <Badge value="Self Closed" severity="warning" />
                            )}
                            <Badge
                                value={`${allEvents.length} of ${totalEvents} Events`}
                                severity="info"
                            />
                        </div>
                    </div>
                </div>

                <div className="nav-right">
                    <Button
                        icon={<TbRefresh />}
                        label={'Refresh'}
                        size="small"
                        outlined
                        rounded
                        spinIcon={isRefetching}
                        onClick={() => refetch()}
                        severity="secondary"
                    />
                    <Button
                        icon={<TbArrowUpRight />}
                        iconPos="right"
                        label={'View Registration'}
                        size="small"
                        outlined
                        rounded
                        onClick={() => navigate(`/controller/registered/${reg_no}`)}
                        severity="secondary"
                    />
                </div>
            </div>

            {/* Quick Summary Cards */}
            <div className="workflow-summary-cards">
                <div className="summary-card">
                    <span className="card-label">Registration No</span>
                    <span className="card-val">{registrationId}</span>
                </div>
                <div className="summary-card">
                    <span className="card-label">Workflow Status</span>
                    <div className="card-val-row">
                        {isCancelled ? (
                            <Badge value="Cancelled" severity="danger" />
                        ) : (
                            <Badge
                                value={isClosed ? 'Closed' : 'In Progress'}
                                severity={isClosed ? 'secondary' : 'success'}
                            />
                        )}
                    </div>
                </div>
                <div className="summary-card">
                    <span className="card-label">Total Visits</span>
                    <span className="card-val">
                        {maxVisitIndex > 0 ? `${maxVisitIndex} Visit${maxVisitIndex > 1 ? 's' : ''}` : 'None'}
                    </span>
                </div>
                <div className="summary-card">
                    <span className="card-label">Started At</span>
                    <span className="card-val">
                        {firstEvent?.time ? isoToDDMonYYYY(firstEvent.time) : '-'}
                    </span>
                </div>
                <div className="summary-card">
                    <span className="card-label">Latest Action</span>
                    <span className="card-val">
                        {lastEvent?.type ? toStandardText(lastEvent.type, true) : '-'}
                    </span>
                </div>
            </div>

            {/* Workflow Timeline */}
            {!allEvents.length ? (
                <div style={{ marginTop: '30px' }}>
                    <ErrorState
                        icon={<TbTimeline />}
                        title={'No Workflow Events'}
                        message={'No workflow history recorded for this registration yet.'}
                        hight="350px"
                    />
                </div>
            ) : (
                <div className="workflow-timeline-wrapper">
                    <div className="timeline-container">
                        {allEvents.map((ev, index) => {
                            const meta = getEventMeta(ev?.type)
                            const prevEvent = index > 0 ? allEvents[index - 1] : null
                            const timeDelta = prevEvent
                                ? formatTimeDelta(prevEvent?.time, ev?.time)
                                : null

                            return (
                                <div
                                    key={ev?.time ? `${ev?.type}_${ev.time}_${index}` : index}
                                    className={`timeline-step theme-${meta.theme}`}
                                >
                                    {/* Vertical connecting line */}
                                    <div className="step-track">
                                        <div className="step-node">{meta.icon}</div>
                                        {index < allEvents.length - 1 && (
                                            <div className="step-connector" />
                                        )}
                                    </div>

                                    {/* Event Details Card */}
                                    <div className="step-card">
                                        <div className="card-header">
                                            <div className="header-left">
                                                <span className="event-title">{meta.label}</span>
                                                <Badge
                                                    value={meta.label}
                                                    severity={meta.badgeSeverity}
                                                />
                                                {ev?.visit_index !== undefined && ev?.visit_index !== null && (
                                                    <span className="visit-badge">
                                                        <TbCalendarEvent /> Visit #{ev.visit_index}
                                                    </span>
                                                )}
                                                {ev?.is_final_close && (
                                                    <Badge value="Final Close" severity="success" />
                                                )}
                                                {ev?.is_self_close && (
                                                    <Badge value="Self Close" severity="warning" />
                                                )}
                                            </div>

                                            <div className="header-right">
                                                {timeDelta && (
                                                    <span className="time-delta" title="Elapsed time since previous event">
                                                        <TbClock /> {timeDelta}
                                                    </span>
                                                )}
                                                <span className="event-datetime">
                                                    {isoToDDMonYYYY(ev?.time)}, {convertIsoToAmPm(ev?.time)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Reason or note */}
                                        {ev?.reason && (
                                            <div className="card-reason">
                                                <span className="reason-label">Note / Reason:</span>
                                                <span className="reason-text">{ev.reason}</span>
                                            </div>
                                        )}

                                        {/* Actor / Performed By Footer */}
                                        <div className="card-footer">
                                            <div className="actor-info">
                                                <TbUser className="actor-icon" />
                                                <span className="actor-label">By:</span>
                                                <span className="actor-name">
                                                    {ev?.by?.name || 'System / Auto'}
                                                </span>
                                            </div>
                                            <span className="step-number">#{index + 1}</span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Pagination / Load More */}
                    {hasNextPage ? (
                        <div className="load-more-section">
                            <Button
                                icon={<TbRotate />}
                                label={isFetchingNextPage ? 'Loading more...' : 'Load More Events'}
                                rounded
                                size="small"
                                outlined
                                spinIcon={isFetchingNextPage}
                                severity="secondary"
                                disabled={isFetchingNextPage}
                                onClick={() => {
                                    if (!isFetchingNextPage) fetchNextPage()
                                }}
                                style={{ width: '180px' }}
                            />
                            <p className="pagination-count-label">
                                Showing {allEvents.length} of {totalEvents} events
                            </p>
                        </div>
                    ) : (
                        <div className="timeline-end-section">
                            <span className="timeline-end-badge">
                                All {totalEvents || allEvents.length} workflow events loaded
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default RegisteredWorkflow

