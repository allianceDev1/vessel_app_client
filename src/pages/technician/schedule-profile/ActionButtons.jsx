import React, { useState } from 'react'
import Button from '../../../components/UI_Primitives/buttons/Button'
import { TbBike, TbBikeOff, TbCalendarUp, TbCalendarX, TbPlayerPlay } from 'react-icons/tb'
import { useDispatch, useSelector } from 'react-redux'
import { modal } from '../../../redux/features/non_persisted/miniSystemSlice'
import RescheduleService from '../../../components/forms/tech/schedule-service/RescheduleService'
import UnscheduleService from '../../../components/forms/tech/schedule-service/UnscheduleService'
import StartTravel from '../../../components/modules/tech/service-action/StartTravel'
import StopTravel from '../../../components/forms/tech/service-action/StopTravel'
import StartWork from '../../../components/modules/tech/service-action/StartWork'

const ActionButtons = ({ regData, setRegData }) => {
    const dispatch = useDispatch();
    const { serviceForm } = useSelector((state) => state.application)
    const [loading, setLoading] = useState('')


    const proceedTravel = (visitId) => {
        setRegData((state) => ({
            ...(state || []),
            status: {
                ...(state.status || {}),
                status: 4,
                status_text: 'On Visit'
            },
            last_visit: {
                visit_id: visitId,
                visit_status: 1,
                visit_status_text: 'Travel',
            }
        }))
    }

    const handleUnschedule = () => {
        dispatch(modal.push({
            title: 'Unschedule Service',
            body: <UnscheduleService registrationId={regData?.registration_id} />
        }))
    }

    const handleReschedule = () => {
        dispatch(modal.push({
            title: 'Reschedule Service',
            body: <RescheduleService registrationId={regData?.registration_id} />
        }))
    }

    const handleStartTravel = () => {
        dispatch(modal.push({
            title: ' ',
            body: <StartTravel registrationId={regData?.registration_id} proceedTravel={proceedTravel} />
        }))
    }

    const handleStopTravel = () => {
        dispatch(modal.push({
            title: 'Stop Travel',
            body: <StopTravel registrationId={regData?.registration_id} visitId={regData?.last_visit?.visit_id} />
        }))
    }

    const handleStarWork = () => {
        dispatch(modal.push({
            title: ' ',
            body: <StartWork registrationId={regData?.registration_id} visitId={regData?.last_visit?.visit_id} />
        }))
    }

    const handleContinueWork = () => {
        setLoading('continue')

        // two type continue, 1. continue with data, 2. continue without data
        // continue with data : redirect to service form
        // continue without data : retrieve the data and store , then redirect 
        // if bug the show the reset alert , the reset fix error the apply continue

    }


    return (
        <div className="schedule-profile-action-buttons">
            <div className="action-buttons" style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>

                {/* On Schedule */}
                {regData?.status?.status === 3
                    ? <>
                        <Button icon={<TbCalendarX />} title={'Unschedule'} rounded severity={'danger'} onClick={handleUnschedule} />
                        <Button icon={<TbCalendarUp />} rounded title={'Reschedule'} onClick={handleReschedule} />
                        <Button icon={<TbBike />} label={'Start Travel'} rounded severity={'primary'} style={{ width: '100%' }}
                            onClick={handleStartTravel} />
                    </> : ''}

                {/* On Travel */}
                {regData?.status?.status === 4 && regData?.last_visit?.visit_status === 1 ? <>
                    <Button icon={<TbBikeOff />} label={'Stop Travel'} rounded severity={'danger'} style={{ width: '100%' }}
                        onClick={handleStopTravel} />
                    <Button icon={<TbPlayerPlay />} label={'Start work'} rounded severity={'primary'} style={{ width: '100%' }}
                        onClick={handleStarWork} disabled={serviceForm?.visit_uuid} />
                </> : ""}

                {/* On Attend */}
                {regData?.status?.status === 4 && regData?.last_visit?.visit_status === 2 ?
                    <Button icon={<TbPlayerPlay />} label={'Continue work'} rounded severity={'primary'} style={{ width: '100%' }}
                        onClick={handleContinueWork} spinIcon={loading === 'continue'} disabled={regData?.last_visit?.visit_id !== serviceForm?.visit_uuid} />
                    : ""}

            </div>
        </div>
    )
}

export default ActionButtons