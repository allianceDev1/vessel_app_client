import React, { useEffect } from 'react'
import './home.scss'
import TodaysWork from '../../../components/modules/tech/TodaysWork/TodaysWork'
import QuickActions from '../../../components/modules/tech/QuickActions/QuickActions'
import MonthlyReport from '../../../components/modules/tech/MonthlyReport/MonthlyReport';
import PerformanceChart from '../../../components/modules/tech/PerformanceChart/PerformanceChart';
import TodaysReport from '../../../components/modules/tech/TodaysReport/TodaysReport';
import { page } from '../../../redux/features/non_persisted/miniSystemSlice';
import { useDispatch } from 'react-redux';
import SkeletonGrid from '../../../components/UI_Primitives/skeleton/SkeletonGrid'
import ErrorState from '../../../components/UI_Primitives/ui-states/ErrorState'
import { TbExclamationCircle } from 'react-icons/tb';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../api'
import { formatSecondsToHHMM } from '../../../utils/helpers/date-helpers';
import moment from 'moment';



const Home = () => {
    const dispatch = useDispatch();

    const { data, isLoading, error } = useQuery({
        queryKey: ['tech_home_report', '2'],
        queryFn: async () => {

            const res = await Promise.all([
                api.vfTv2Axios.get('/tech/report/today-performance'),
                api.vfTv2Axios.get('/tech/report/month-performance'),
                api.vfTv2Axios.get('/tech/report/chart/week/revenue'),
                api.vfTv2Axios.get('/tech/report/chart/week/works')
            ])

            const successVisits = (res?.[1]?.completed_visits ?? 0) - (res?.[1]?.cancelled_visits ?? 0)

            const report = {
                today: {
                    assign_works: (res?.[0]?.service_jobs ?? 0) + (res?.[0]?.schedules ?? 0),
                    completed_works: res?.[0]?.service_jobs ?? 0,
                    pending_works: res?.[0]?.schedules ?? 0,
                    revenue: (res?.[0]?.revenue ?? 0).toLocaleString('en-IN'),
                    travel_duration: res?.[0]?.travel_seconds ?? 0,
                    work_duration: res?.[0]?.work_seconds ?? 0,
                    travel_percentage: res?.[0]?.travel_seconds > 0 ? ((res?.[0]?.travel_seconds ?? 0) / ((res?.[0]?.travel_seconds ?? 0) + (res?.[0]?.work_seconds ?? 0))) * 100 : 0,
                    work_percentage: res?.[0]?.work_seconds > 0 ? ((res?.[0]?.work_seconds ?? 0) / ((res?.[0]?.travel_seconds ?? 0) + (res?.[0]?.work_seconds ?? 0))) * 100 : 0,
                },
                month: {
                    revenue: (res?.[1]?.revenue ?? 0).toLocaleString('en-IN'),
                    completed_visits: (res?.[1]?.completed_visits ?? 0).toLocaleString('en-IN'),
                    cancelled_visits: (res?.[1]?.cancelled_visits ?? 0).toLocaleString('en-IN'),
                    travel_duration: (res?.[1]?.travel_seconds ?? 0),
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
        dispatch(page.setTitle({ title: '', note: "" }))

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

            <MonthlyReport
                revenue={data?.month?.revenue}
                totalWork={data?.month?.completed_visits}
                totalWorkTime={formatSecondsToHHMM(data?.month?.work_duration)}
                workTimeAvg={formatSecondsToHHMM(data?.month?.work_avrg)}
                travelTime={formatSecondsToHHMM(data?.month?.travel_duration)}
                travelTimeAvg={formatSecondsToHHMM(data?.month?.travel_avrg)}
                cancelledVisits={data?.month?.cancelled_visits}
            />
            <br></br>

            <PerformanceChart data={{ revenue: data?.revenue, works: data?.works, work_time: data?.work_time }} />
            <br></br>

            <TodaysReport
                scheduled={data?.today?.assign_works}
                completed={data?.today?.completed_works}
                revenueToday={data?.today?.revenue}
                travelTimeToday={formatSecondsToHHMM(data?.today?.travel_duration)}
                workDuration={formatSecondsToHHMM(data?.today?.work_duration)}
                workPercent={data?.today?.work_percentage}
                travelDuration={formatSecondsToHHMM(data?.today?.travel_duration)}
                travelPercent={data?.today?.travel_percentage}
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
        </div >
    )
}

export default Home