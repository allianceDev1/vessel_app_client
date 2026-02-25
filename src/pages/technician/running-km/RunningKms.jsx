import React, { useEffect, useState } from 'react'
import './running-kms.scss'
import { useDispatch } from 'react-redux'
import { modal, page } from '../../../redux/features/non_persisted/miniSystemSlice';
import InputText from '../../../components/UI_Primitives/inputs/InputText'
import { useSearchParams } from 'react-router-dom';
import SkeletonGrid from '../../../components/UI_Primitives/skeleton/SkeletonGrid';
import ErrorState from '../../../components/UI_Primitives/ui-states/ErrorState';
import { TbBike, TbBikeOff, TbPlus } from 'react-icons/tb';
import moment from 'moment';
import Button from '../../../components/UI_Primitives/buttons/Button';
import { generateMonthlyRunningCalendar, generateMonthlyRunningReport } from '../../../utils/services/work_services';
import { isoToDDMonYYYY, isoToYYYYMMDD } from '../../../utils/helpers/date-helpers';
import { api } from '../../../api'
import UpdateRunningKm from '../../../components/modules/tech/running-km/UpdateRunningKm';

const RunningKms = () => {
    const dispatch = useDispatch();
    const [searchParams, setSearchParams] = useSearchParams()
    const [error, setError] = useState({ error: false })
    const [loading, setLoading] = useState('fetch')
    const [data, setData] = useState([])
    const [report, setReport] = useState({})
    const [calenderData, setCalenderData] = useState([])


    const fetchApi = async () => {
        setLoading('fetch');
        setError({ error: false, title: '', message: '' })

        // api
        try {
            const response = await api.vfTv2Axios.get(`/tech/running-kms/${searchParams.get('month')}`)
            setData(response)

        } catch (error) {
            setError({ error: true, title: 'Calender fetch failed', message: error?.message })
        } finally {
            setLoading('')
        }
    }

    const openUpdateModal = (day) => {

        if (!day?.isEditEnabled) {
            return;
        }

        dispatch(modal.push({
            title: 'Update Kilometer',
            body: <UpdateRunningKm data={day} setData={setData} />
        }))
    }

    useEffect(() => {
        setCalenderData(generateMonthlyRunningCalendar(searchParams.get('month'), data))
        setReport(generateMonthlyRunningReport(data))
        // eslint-disable-next-line
    }, [data])

    useEffect(() => {
        dispatch(page.setTitle({ title: 'Running Kilometers', note: "Your monthly base running kilometers." }))

        if (!searchParams.get('month') && searchParams.get('month') === null) {
            setSearchParams({ month: new Date().toISOString().slice(0, 7) })
        }

        // eslint-disable-next-line
    }, [])


    useEffect(() => {
        if (!searchParams.get('month')) {
            return;
        }
        fetchApi();
        // eslint-disable-next-line
    }, [searchParams.get('month')])


    // loading
    if (loading === 'fetch') {
        return <div className="tech-service-page-load">
            <SkeletonGrid rows={1} columns={1} height={50} gap={5} />
            <SkeletonGrid rows={5} columns={7} height={50} gap={5} style={{ marginTop: '10px' }} />
            <SkeletonGrid rows={1} columns={3} height={80} gap={5} style={{ marginTop: '10px' }} />
        </div>
    }

    // Success
    return (
        <div className="tech-running-kms-container">
            <div className="month-section">
                <InputText label={'Select Month'} name={'month'} type='month' value={searchParams.get('month')}
                    onChange={(e) => setSearchParams({ month: e.target.value })} size='small' max={isoToYYYYMMDD(new Date()).slice(0, 7)} />
            </div>

            {error?.error || (!loading && !data?.length)
                ? <ErrorState
                 size='sm'
                    hight='60vh'
                    title={error?.title || "You are tired."}
                    message={error?.message || "Running data not found"}
                    icon={<TbBikeOff />}
                />
                : <div className="content-section">
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
                        {calenderData?.map((week, wIndex) => {
                            return <div className="week" key={wIndex}>
                                {week?.map((day, dIndex) => {
                                    return <div className={`day ${!day?.isCurrentMonth && 'disabled'} ${day?.isToday && 'today'}`} key={dIndex}
                                        onClick={() => openUpdateModal(day)}>
                                        <span>{day.day}</span>
                                        {day.km ? <small className={day?.isEditEnabled && 'add'}>{day.km}</small> : ""}
                                        {(!day.km && day?.isEditEnabled) ? <small className={'add'}>Add</small> : ""}
                                    </div>
                                })}
                            </div>
                        })}
                    </div>
                    <div className="km-report">
                        <div className="report-item">
                            <h4>{report?.total} km</h4>
                            <p>Total Running</p>
                        </div>
                        <div className="report-item">
                            <h4>{report?.average} km</h4>
                            <p>Avrg.</p>
                        </div>
                        <div className="report-item">
                            <h4>{report?.highest} km</h4>
                            <p>Hightest</p>
                        </div>
                    </div>
                </div>}


        </div>
    )
}

export default RunningKms