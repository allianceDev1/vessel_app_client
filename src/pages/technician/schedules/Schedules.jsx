import React, { useEffect, useState } from 'react'
import './schedules.scss';
import { page } from '../../../redux/features/non_persisted/miniSystemSlice';
import { useDispatch } from 'react-redux';
import { TbCalendarStats, TbChevronDown, TbChevronUp, TbRefresh } from 'react-icons/tb';
import { api } from '../../../api';
import { groupAndSortByScheduleDate } from '../../../utils/services/work_services';
import ScheduleServiceCard from '../../../components/modules/tech/service-card/ScheduleServiceCard';
import SkeletonGrid from '../../../components/UI_Primitives/skeleton/SkeletonGrid';
import ErrorState from '../../../components/UI_Primitives/ui-states/ErrorState';
import { formatRelativeIsoDate } from '../../../utils/helpers/date-helpers';

const Schedules = () => {
    const dispatch = useDispatch();
    const [activeSections, setActiveSections] = useState({ pickup: false, scheduler: false })
    const [loading, setLoading] = useState('fetch')
    const [error, setError] = useState({ error: false, title: null, message: null })
    const [data, setData] = useState({ pickups: [], schedules: [] })
    const [totalSchedules, setTotalSchedules] = useState(0)



    const fetchApi = async () => {
        try {
            setLoading('fetch')
            setError({ error: false, title: null, message: null })
            const services = await api.vfTv2Axios.get('/registered-service/my-schedules')

            setData({
                pickups: services?.filter(s => s.reg_status === 4) || [],
                schedules: groupAndSortByScheduleDate(services?.filter(s => s.reg_status === 3) || [])
            })
            setTotalSchedules(services?.filter(s => s.reg_status === 3).length)

            if (services?.filter(s => s.reg_status === 4).length) {
                setActiveSections({ ...activeSections, pickup: true })
            } else {
                setActiveSections({ ...activeSections, scheduler: true })
            }

        } catch (error) {
            setError({ error: true, title: 'Data fetching failed', message: error.message })
        } finally {
            setLoading('')
        }
    }

    useEffect(() => {
        dispatch(page.setTitle({ title: 'Your schedules', note: "All scheduled and progress services" }))

        // fetch data
        fetchApi()

        // eslint-disable-next-line
    }, [])


    // loading
    if (loading === 'fetch') {
        return <div className="">
            <SkeletonGrid rows={2} columns={1} height={50} />
            <SkeletonGrid rows={1} columns={1} height={110} style={{ marginTop: '15px' }} />
            <SkeletonGrid rows={1} columns={1} height={50} style={{ marginTop: '15px' }} />
            <SkeletonGrid rows={2} columns={1} height={110} style={{ marginTop: '15px' }} />
        </div>
    }

    // Error
    if (error?.error) {
        return <ErrorState
         size='sm'
            hight='70vh'
            title={error?.title}
            message={error?.message}
            icon={<TbCalendarStats />}
        />
    }

    // Data
    return (
        <div className="tech-schedules-container-page">
            <div className="top-section">
                <div className="section-one"></div>
                <div className="section-two">
                    <span onClick={fetchApi}>
                        <TbRefresh />
                    </span>
                    {/* <span >
                        <TbSearch />
                    </span> */}
                </div>
            </div>
            <div className="service-section pickup-section">
                <div className="section-title" onClick={() => setActiveSections({ ...activeSections, pickup: !activeSections.pickup })}
                    aria-expanded={activeSections?.pickup}>
                    <h4>Pickup services ({data?.pickups?.length || 0})</h4>
                    {activeSections?.pickup ? <TbChevronUp /> : <TbChevronDown />}
                </div>
                <div className={`section-content ${activeSections?.pickup ? 'content-active' : ""}`}>
                    <div className="section-inner">
                        {data?.pickups?.length ? <>{data?.pickups?.map((card) => <ScheduleServiceCard data={card} key={card.customer[0]} pickup={true} />)}</>
                            : <div className='no-data'><span>No Services</span></div>}
                    </div>
                </div>
            </div>
            <div className="service-section">
                <div className="section-title" onClick={() => setActiveSections({ ...activeSections, scheduler: !activeSections.scheduler })}
                    aria-expanded={activeSections?.scheduler}>
                    <h4>Schedule services ({totalSchedules})</h4>
                    {activeSections?.scheduler ? <TbChevronUp /> : <TbChevronDown />}
                </div>
                <div className={`section-content ${activeSections?.scheduler ? 'content-active' : ""}`}>
                    <div className="section-inner">
                        {totalSchedules
                            ? <>
                                {data?.schedules?.map((section, index) => <div className="date-section" key={index}>
                                    <div className="divider">
                                        <p>{formatRelativeIsoDate(new Date(section?.[0]?.schedule_slot?.slot_start_time))}</p>
                                    </div>
                                    {section?.map((card) => <ScheduleServiceCard data={card} key={card.customer[0]} />)}
                                </div>)}
                            </>
                            : <div className='no-data'><span>No Services</span></div>}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Schedules