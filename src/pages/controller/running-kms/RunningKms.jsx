import React, { useEffect } from 'react'
import './running-kms.scss'
import { useDispatch } from 'react-redux';
import { page } from '../../../redux/features/non_persisted/miniSystemSlice'
import { TbCalendar } from 'react-icons/tb';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { api } from '../../../api';
import SkeletonGrid from '../../../components/UI_Primitives/skeleton/SkeletonGrid';
import ErrorState from '../../../components/UI_Primitives/ui-states/ErrorState';
import { useQuery } from '@tanstack/react-query';
import { controllerRunningKmsCalenderData, generateMonthlyRunningReport } from '../../../utils/services/work_services';
import InputText from '../../../components/UI_Primitives/inputs/InputText';
import Select from '../../../components/UI_Primitives/inputs/Select';



const RunningKms = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const { month } = useParams()

    const {
        data,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['controller-running-kms', month, searchParams.get('worker_uuid')],
        queryFn: async () => {
            const res = await api.vfCv2Axios.get(`/worker/running-kms/${month}`, {
                params: {
                    worker_uuid: searchParams.get('worker_uuid') ? searchParams.get('worker_uuid') : ''
                }
            })
            const calcData = controllerRunningKmsCalenderData(month, res)
            const report = generateMonthlyRunningReport(res)

            return { calcData, calcReport: report }
        },
        staleTime: 10 * 60_000,
    })

    const {
        data: techList
    } = useQuery({
        queryKey: ['vessel_staff_list', 'name_only'],
        queryFn: async () => {
            const res = await api.ttPv2Axios('/worker/account/list?nameOnly=Yes')
            return res
        },
        staleTime: 10 * 60_000
    })

    const handleChangeMonth = (e) => {
        navigate(
            `/controller/running-kms/${e.target.value}${location.search}`
        );
    }

    const handleChangeTech = (e) => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            if (e.target.value) {
                next.set('worker_uuid', e.target.value)
            } else {
                next.delete('worker_uuid')
            }
            return next;
        })
    }

    useEffect(() => {
        dispatch(page.setTitle({ title: 'Running Kilometers', note: "Workers daily running kilometers." }))
        // eslint-disable-next-line
    }, [])

    // loading
    if (isLoading) {
        return <div className="tech-service-page-load">
            <SkeletonGrid style={{ marginTop: '15px' }} rows={1} columns={1} height={100} gap={5} />
            <SkeletonGrid rows={5} columns={7} height={80} gap={5} style={{ marginTop: '20px' }} />
        </div>
    }

    if (error) {
        return <ErrorState
            hight='calc(100vh - 100px)'
            icon={<TbCalendar />}
            message={'Data fetching Failed'}
        />
    }

    return (
        <div className='running-kms-page'>
            <div className="mini-report-border">
                <div className="sub-item">
                    <h3>{(data?.calcReport?.validDays ?? 0)}</h3>
                    <p>Days</p>
                </div>
                <div className="sub-item">
                    <h3>{(data?.calcReport?.total ?? 0).toLocaleString('en-IN')}</h3>
                    <p>Total Running</p>
                </div>
                <div className="sub-item">
                    <h3>{(data?.calcReport?.average ?? 0).toLocaleString('en-IN')}</h3>
                    <p>Average</p>
                </div>
                <div className="sub-item">
                    <h3>{(data?.calcReport?.highest ?? 0).toLocaleString('en-IN')}</h3>
                    <p>Highest</p>
                </div>
            </div>

            <div className="search-inputs">
                <Select label={'Technicians'} name={'worker_uuid'} onChange={handleChangeTech}
                    options={[{ label: '', value: '' }, ...techList?.map((t) => ({
                        label: t.full_name,
                        value: t.worker_uuid
                    }))]} value={searchParams.get('worker_uuid')} />
                <InputText label={'Month'} value={month} type='month' onChange={handleChangeMonth} />
            </div>

            <div className="content-section">
                <div className="km-calender">
                    <div className="week-head">
                        <div className="day">Sun</div>
                        <div className="day">Mon</div>
                        <div className="day">Tue</div>
                        <div className="day">Wed</div>
                        <div className="day">Thu</div>
                        <div className="day">Fri</div>
                        <div className="day">Sat</div>
                    </div>
                    {data?.calcData?.map((week, wIndex) => {
                        return <div className="week" key={wIndex}>
                            {week?.map((day, dIndex) => {
                                return <div className={`day ${!day?.isCurrentMonth && 'disabled'} ${day?.isToday && 'today'}`} key={dIndex}
                                    onClick={() => ''}>
                                    <span className="date">{day.day}</span>
                                    <div className="day-content">
                                        {day.km ? <small className={day?.isEditEnabled && 'add'}>{day.km}</small> : ""}
                                    </div>
                                </div>
                            })}
                        </div>
                    })}
                </div>
            </div>
        </div>
    )
}

export default RunningKms


