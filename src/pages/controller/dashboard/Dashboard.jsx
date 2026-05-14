import React, { useEffect } from 'react'
import './dashboard.scss'
import { page } from '../../../redux/features/non_persisted/miniSystemSlice'
import { useDispatch } from 'react-redux'
import TodayWorkFlow from '../../../components/charts/dashboard/TodayWorkFlow'
import { TbArrowRight, TbReload } from 'react-icons/tb'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../../api'
import SkeletonGrid from '../../../components/UI_Primitives/skeleton/SkeletonGrid'
import ErrorState from '../../../components/UI_Primitives/ui-states/ErrorState'
import { isoToDecimalHour, isoToYYYYMMDD } from '../../../utils/helpers/date-helpers'
import { chartLabelColors } from '../../../assets/javascript/pre_data/chart'
import moment from 'moment'
import Button from '../../../components/UI_Primitives/buttons/Button'

const Dashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const redirectButtons = [
        {
            label: 'R&D Jobs',
            redirect_url: null
        },
        {
            label: 'R&D Registrations',
            redirect_url: null
        },
        {
            label: 'Upcoming Packages',
            redirect_url: null
        },
        {
            label: 'Running Kms',
            redirect_url: null
        },
    ]

    const countQuery = useQuery({
        queryKey: ['controller_dash_count_report'],
        queryFn: async () => {
            const res = await api.vfCv2Axios.get('/service/report/dashboard')

            return [
                {
                    label: "Yellow List",
                    value: res?.yellow_list_count || 0,
                    desc: 'Service Under 11 - 20 Days',
                    text_color: 'var(--color-warning)',
                    redirect_url: `/controller/upcoming?fl=Yes&view_type=product&from_date=${isoToYYYYMMDD(new Date(new Date().setDate(new Date().getDate() + 10)))}&end_date=${isoToYYYYMMDD(new Date(new Date().setDate(new Date().getDate() + 19)))}`
                },
                {
                    label: "Red List",
                    value: res?.red_list_count || 0,
                    desc: 'Service Under 1 - 10 Days',
                    text_color: 'var(--color-danger)',
                    redirect_url: `/controller/upcoming?fl=Yes&view_type=product&from_date=${isoToYYYYMMDD(new Date())}&end_date=${isoToYYYYMMDD(new Date(new Date().setDate(new Date().getDate() + 9)))}`
                },
                {
                    label: "Overdue List",
                    value: res?.overdue_list_count || 0,
                    desc: 'Expired package, service pending',
                    text_color: 'var(--text-primary)',
                    redirect_url: `/controller/overdue-list`
                },
                {
                    label: "Unverified Jobs",
                    value: res?.non_verified_count || 0,
                    desc: 'Customer not verified jobs',
                    text_color: 'var(--text-primary)',
                    redirect_url: `/controller/completed`
                }
            ]
        },
        staleTime: 1000 * 60 * 30,
    })

    const workerQuery = useQuery({
        queryKey: ['workers_current_status'],
        queryFn: async () => {
            const res = await api.ttPv2Axios.get('/worker/account/current-status?origins=vftc_default_write')
            return res?.map((w, i) => ({
                worker_uuid: w?.worker_uuid,
                worker_name: `${w?.first_name || ''} ${w?.last_name || ''}`,
                attendance_status: w?.status,
                color: chartLabelColors[i],
                status_color: w?.status === 'PENDING' ? 'yellow' : w?.status === "IN" ? 'green' : "red"
            }))
        },
        staleTime: 1000 * 60 * 30,
    })

    const servicesQuery = useQuery({
        queryKey: ['workers_today_work_flow'],
        queryFn: async () => {
            const res = await api.vfCv2Axios.get(`/worker/work-flow/${moment().format('YYYY-MM-DD')}`)
            return res?.map((w, i) => ({
                techId: w?.technician_uuid,
                id: w?.customer_id,
                label: `${w?.customer_id} - ${w?.customer_name}`,
                travelStart: w?.pickup_work_at ? isoToDecimalHour(w?.pickup_work_at) : null,
                workStart: w?.start_work_at ? isoToDecimalHour(w?.start_work_at) : null,
                workClose: w?.end_work_at ? isoToDecimalHour(w?.end_work_at) : null,
            }))
        },
        staleTime: 1000 * 60 * 30,
    })

    const reloadWorkFlow = () => {
        countQuery.refetch()
        workerQuery.refetch()
        servicesQuery.refetch()
    }

    useEffect(() => {
        dispatch(page.setTitle({}))
        // eslint-disable-next-line
    }, [])


    return (
        <div className='controller-dashboard-page-container'>
            {countQuery?.isLoading && <SkeletonGrid
                rows={1} columns={4} height={'125px'} gap={'10px'}
                responsive={{
                    md: { rows: 2, columns: 2 },
                    sm: { rows: 4, columns: 1 }
                }}
            />}

            {countQuery?.error && <ErrorState
                title={'Report Not Loaded'}
                hight='125px'
            />}

            <div className="count-card-list">
                {countQuery?.data?.map((c, index) => (
                    <div className="count-card" onClick={() => navigate(c?.redirect_url)}>
                        <h4>{c?.label}</h4>
                        <p>{c?.desc}</p>
                        <h2 style={{ color: c?.text_color }}>{c?.value}</h2>
                    </div>
                ))}
            </div>

            <div className="direct-buttons-list">
                {redirectButtons.map((c, index) => (
                    <div className="button-card" onClick={() => navigate(c?.redirect_url)}>
                        <h4>{c?.label}</h4>
                        <TbArrowRight />
                    </div>
                ))}
            </div>

            <div className="reports">
                {(servicesQuery?.isLoading || workerQuery?.isLoading)
                    ? <SkeletonGrid height={'240px'} />
                    : <div className="report-box work-flow-report">
                        <div className="title-section">
                            <h4>Today work flow</h4>
                            <div>
                                <p>Last update at {new Date(servicesQuery?.dataUpdatedAt).toLocaleString()}</p>
                                <Button icon={<TbReload />} rounded outlined size='small' onClick={reloadWorkFlow}
                                    spinIcon={servicesQuery?.isFetching} />
                            </div>
                        </div>
                        <div className="content">
                            <TodayWorkFlow technicians={workerQuery?.data || []} workFlows={servicesQuery?.data || []} />
                        </div>
                    </div>}

            </div>
            <div className="text-mark">
                <h1>Track, monitor, decide —</h1>
                <h2>Purity is our flag.</h2>
            </div>
        </div>
    )
}

export default Dashboard