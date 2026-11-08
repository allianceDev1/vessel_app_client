import React, { useEffect } from 'react'
import './home.scss'
import TodaysWork from '../../../components/modules/tech/TodaysWork/TodaysWork'
import QuickActions from '../../../components/modules/tech/QuickActions/QuickActions'
import PerformanceReport from '../../../components/modules/tech/PerformanceReport/PerformanceReport';
import PerformanceChart from '../../../components/modules/tech/PerformanceChart/PerformanceChart';
import { page } from '../../../redux/features/non_persisted/miniSystemSlice';
import { useDispatch } from 'react-redux';
import SkeletonGrid from '../../../components/UI_Primitives/skeleton/SkeletonGrid'
import ErrorState from '../../../components/UI_Primitives/ui-states/ErrorState'
import { TbExclamationCircle } from 'react-icons/tb';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../api'
import { formatSecondsToHHMM } from '../../../utils/helpers/date-helpers';
import moment from 'moment';

// meters -> "12.5 km"
const formatKm = (meters) => `${(Number(meters || 0) / 1000).toLocaleString('en-IN', { maximumFractionDigits: 1 })} km`



const Home = () => {
    const dispatch = useDispatch();

    const { data, isLoading, error } = useQuery({
        queryKey: ['tech_home_report', '3'],
        queryFn: async () => {

            const res = await Promise.all([
                api.ssTv2Axios.get('/tech/report/today-performance'),
                api.ssTv2Axios.get('/tech/report/month-performance'),
                api.ssTv2Axios.get('/tech/report/chart/week/revenue'),
                api.ssTv2Axios.get('/tech/report/chart/week/works')
            ])

            const successVisits = (res?.[1]?.completed_visits ?? 0) - (res?.[1]?.cancelled_visits ?? 0)

            const report = {
                today: {
                    assign_works: (res?.[0]?.service_jobs ?? 0) + (res?.[0]?.schedules ?? 0),
                    completed_works: res?.[0]?.service_jobs ?? 0,
                    pending_works: res?.[0]?.schedules ?? 0,
                    revenue: (res?.[0]?.revenue ?? 0).toLocaleString('en-IN'),
                    travel_duration: res?.[0]?.travel_seconds ?? 0,
                    distance_meters: res?.[0]?.distance_meters ?? 0,
                    work_duration: res?.[0]?.work_seconds ?? 0,
                    travel_percentage: res?.[0]?.travel_seconds > 0 ? ((res?.[0]?.travel_seconds ?? 0) / ((res?.[0]?.travel_seconds ?? 0) + (res?.[0]?.work_seconds ?? 0))) * 100 : 0,
                    work_percentage: res?.[0]?.work_seconds > 0 ? ((res?.[0]?.work_seconds ?? 0) / ((res?.[0]?.travel_seconds ?? 0) + (res?.[0]?.work_seconds ?? 0))) * 100 : 0,
                },
                month: {
                    revenue: (res?.[1]?.revenue ?? 0).toLocaleString('en-IN'),
                    completed_visits: (res?.[1]?.completed_visits ?? 0).toLocaleString('en-IN'),
                    cancelled_visits: (res?.[1]?.cancelled_visits ?? 0).toLocaleString('en-IN'),
                    travel_duration: (res?.[1]?.travel_seconds ?? 0),
                    distance_meters: res?.[1]?.distance_meters ?? 0,
                    travel_avrg: (res?.[1]?.travel_seconds ?? 0) / successVisits,
                    work_duration: (res?.[1]?.work_seconds ?? 0),
                    work_avrg: (res?.[1]?.work_seconds ?? 0) / successVisits,
                },
                revenue: res?.[2]?.map(i => ({
                    name: moment(i?.weekStart).format("DD MMM"),
                    value: i?.revenue
                })),
                works: res?.[3]?.map(i => ({
                    name: moment(i?.weekStart).format("DD MMM"),
                    value: i?.works
                })),
                work_time: res?.[3]?.map(i => ({
                    name: moment(i?.weekStart).format("DD MMM"),
                    value: i?.work_seconds
                }))
            }
            
            return report

        },
        staleTime: 10 * 60_000 // 10 minutes
    })


    useEffect(() => {
        dispatch(page.config({ title: '', note: "" }))

        // eslint-disable-next-line
    }, [])

    if (isLoading) {
        return <div className={'tech-home-page-container'}>

            <SkeletonGrid height={'80px'} />
            <br></br>
            <SkeletonGrid height={'90px'} columns={4} />
            <br></br>
            <br></br>
            <SkeletonGrid height={'80px'} />
            <br></br>
            <SkeletonGrid height={'110px'} rows={2} columns={2} />
            <br></br>
            <SkeletonGrid height={'200px'} />
            <br></br>
            <SkeletonGrid height={'80px'} columns={2} />
            <br></br>
            <SkeletonGrid height={'150px'} />

            <div className="footer-container">
                <div className="left-section">
                    <p>Copyright © 2012 - {new Date().getFullYear()} Alliance Water Solutions LLP. <br></br> All Rights Reserved</p>
                </div>
                <div className="right-section">
                    <p className='link' onClick={() => window.open('https://awsllp.gitbook.io/workers/privacy-policy#id-7.-cookies-and-tracking')}>Cookies</p>
                    <span>.</span>
                    <p className='link' onClick={() => window.open('https://awsllp.gitbook.io/workers/terms-of-service')}>Terms</p>
                    <span>.</span>
                    <p className='link' onClick={() => window.open('https://awsllp.gitbook.io/workers/privacy-policy')}>Privacy</p>
                </div>
            </div>
        </div>
    }

    if (error) {
        return <div className={'tech-home-page-container'}>

            <ErrorState
                title={'Data fetching failed !'}
                message={error?.message}
                icon={<TbExclamationCircle />}
                hight='60vh'
            />

            <div className="footer-container">
                <div className="left-section">
                    <p>Copyright © 2012 - {new Date().getFullYear()} Alliance Water Solutions LLP. <br></br> All Rights Reserved</p>
                </div>
                <div className="right-section">
                    <p className='link' onClick={() => window.open('https://awsllp.gitbook.io/workers/privacy-policy#id-7.-cookies-and-tracking')}>Cookies</p>
                    <span>.</span>
                    <p className='link' onClick={() => window.open('https://awsllp.gitbook.io/workers/terms-of-service')}>Terms</p>
                    <span>.</span>
                    <p className='link' onClick={() => window.open('https://awsllp.gitbook.io/workers/privacy-policy')}>Privacy</p>
                </div>
            </div>
        </div>
    }

    return (
        <div className={'tech-home-page-container'}>

            <TodaysWork data={data?.today} />
            <br></br>
            <QuickActions />
            <br></br>
            <br></br>

            <PerformanceReport
                today={{
                    revenue: data?.today?.revenue,
                    works: data?.today?.completed_works,
                    workTime: formatSecondsToHHMM(data?.today?.work_duration),
                    travelTime: formatSecondsToHHMM(data?.today?.travel_duration),
                    distance: formatKm(data?.today?.distance_meters),
                }}
                month={{
                    revenue: data?.month?.revenue,
                    works: data?.month?.completed_visits,
                    workTime: formatSecondsToHHMM(data?.month?.work_duration),
                    workTimeAvg: formatSecondsToHHMM(data?.month?.work_avrg),
                    travelTime: formatSecondsToHHMM(data?.month?.travel_duration),
                    travelTimeAvg: formatSecondsToHHMM(data?.month?.travel_avrg),
                    distance: formatKm(data?.month?.distance_meters),
                }}
            />
            <br></br>

            <PerformanceChart data={{ revenue: data?.revenue, works: data?.works, work_time: data?.work_time }} />
            <br></br>

            <div className="footer-container">
                <div className="left-section">
                    <p>Copyright © 2012 - {new Date().getFullYear()} Alliance Water Solutions LLP. <br></br> All Rights Reserved</p>
                </div>
                <div className="right-section">
                    <p className='link' onClick={() => window.open('https://awsllp.gitbook.io/workers/privacy-policy#id-7.-cookies-and-tracking')}>Cookies</p>
                    <span>.</span>
                    <p className='link' onClick={() => window.open('https://awsllp.gitbook.io/workers/terms-of-service')}>Terms</p>
                    <span>.</span>
                    <p className='link' onClick={() => window.open('https://awsllp.gitbook.io/workers/privacy-policy')}>Privacy</p>
                </div>
            </div>
        </div >
    )
}

export default Home