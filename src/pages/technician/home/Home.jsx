import React, { useEffect } from 'react'
import { page } from '../../../redux/features/non_persisted/miniSystemSlice'
import { useDispatch } from 'react-redux';
import './home.scss'
import { TbAlertCircle, TbChevronsDown, TbChevronsUp, TbTagFilled, TbTarget } from 'react-icons/tb';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../api';
import { convertAmount } from '../../../utils/helpers/text-formatting'
import { getGrowthPercentage } from '../../../utils/helpers/math-equations';
import moment from 'moment';
import BannerImage from '../../../assets/images/illustrations/banner-image.png'
import SkeletonGrid from '../../../components/UI_Primitives/skeleton/SkeletonGrid';
import ErrorState from '../../../components/UI_Primitives/ui-states/ErrorState';

const Home = () => {
    const dispatch = useDispatch();


    const { data, isLoading, error, dataUpdatedAt } = useQuery({
        queryKey: ['tech_home_report'],
        queryFn: async () => {

            let report = await api.vfTv2Axios.get('/tech/work-report')

            report.revenue.percentage = getGrowthPercentage(report?.revenue?.current || 0, report?.revenue?.previous || 0)
            report.works.percentage = getGrowthPercentage(report?.works?.current || 0, report?.works?.previous || 0)
            report.calls.percentage = getGrowthPercentage(report?.calls?.current || 0, report?.calls?.previous || 0)

            return report
        },
        staleTime: 30 * 60_000 // 30 minutes
    })

    useEffect(() => {
        dispatch(page.setTitle({ title: '', note: "" }))

        // eslint-disable-next-line
    }, [])


    // loading
    if (isLoading) {
        return <div style={{ marginTop: '20px' }}>
            <SkeletonGrid rows={2} columns={2} height={90} gap={'10px'} />
            <SkeletonGrid rows={1} columns={3} height={80} style={{ marginTop: '65px' }} />
            <SkeletonGrid rows={1} columns={1} height={250} style={{ marginTop: '15px' }} />
        </div>
    }

    // Error
    if (error) {
        return <ErrorState
            size='sm'
            hight='70vh'
            title={'Data fetching failed !'}
            message={error?.message}
            icon={<TbAlertCircle />}
        />
    }

    return (
        <div className="tech-home-page-container">
            {/* My Works */}
            <div className="sub-title">
                <h3>My Works</h3>
                {dataUpdatedAt && <p>Last Update At {new Date(dataUpdatedAt).toLocaleString()}</p>}
            </div>
            <div className="my-works-report">
                <div className="report-work-item">
                    <p>Today <br></br> Schedules</p>
                    <h2>{(data?.today_schedules || 0).toLocaleString('en-IN')}</h2>
                    <TbTagFilled />
                </div>
                <div className="report-work-item">
                    <p>My <br></br> Schedules</p>
                    <h2>{(data?.total_schedules || 0).toLocaleString('en-IN')}</h2>
                    <TbTagFilled />
                </div>
                <div className="report-work-item">
                    <p>Registered <br></br> to me</p>
                    <h2>{(data?.my_registrations || 0).toLocaleString('en-IN')}</h2>
                    <TbTagFilled />
                </div>
                <div className="report-work-item">
                    <p>My work <br></br> credits</p>
                    <h2>Nil</h2>
                    <TbTagFilled />
                </div>
            </div>

            {/* My service status */}
            <div className="sub-title" style={{ marginTop: '30px' }}>
                <h3>Service Report - {new Date().getDate() > 5 ? moment(new Date()).format("MMMM YYYY") : moment().subtract(1, "month").format("MMMM YYYY")}</h3>
            </div>
            <div className="my-service-report">
                <div className="report-status-item">
                    <h2>{data?.works?.current || 0}</h2>
                    <div className='title'>
                        <p>Works</p>
                        <div className={`${data?.works?.percentage >= 0 ? 'success' : 'danger'}`}>
                            {data?.works?.percentage >= 0 ? <TbChevronsUp /> : <TbChevronsDown />}
                            <p>{data?.works?.percentage || 0}%</p>
                        </div>
                    </div>
                    <TbTarget />
                </div>
                <div className="report-status-item">
                    <h2>{data?.calls?.current || 0}</h2>
                    <div className='title'>
                        <p>Calls</p>
                        <div className={`${data?.calls?.percentage >= 0 ? 'success' : 'danger'}`}>
                            {data?.calls?.percentage >= 0 ? <TbChevronsUp /> : <TbChevronsDown />}
                            <p>{data?.calls?.percentage || 0}%</p>
                        </div>
                    </div>
                    <TbTarget />
                </div>
                <div className="report-status-item">
                    <h2>₹ {convertAmount(data?.revenue?.current || 0)}</h2>
                    <div className='title'>
                        <p>Revenue</p>
                        <div className={`${data?.revenue?.percentage >= 0 ? 'success' : 'danger'}`}>
                            {data?.revenue?.percentage >= 0 ? <TbChevronsUp /> : <TbChevronsDown />}
                            <p>{data?.revenue?.percentage || 0}%</p>
                        </div>
                    </div>
                    <TbTarget />
                </div>
            </div>

            {/* Banner */}
            <div className="banner-image-section">
                <img src={BannerImage} alt="banner" />
            </div>
        </div>
    )
}

export default Home