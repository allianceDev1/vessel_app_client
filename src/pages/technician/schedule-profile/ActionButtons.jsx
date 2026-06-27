import React, { useState } from 'react'
import Button from '../../../components/UI_Primitives/buttons/Button'
import { TbBike, TbBikeOff, TbCalendarUp, TbCalendarX, TbPlayerPlay, TbPlayerStop } from 'react-icons/tb'
import { useDispatch, useSelector } from 'react-redux'
import { modal, toast } from '../../../redux/features/non_persisted/miniSystemSlice'
import RescheduleService from '../../../components/forms/tech/schedule-service/RescheduleService'
import UnscheduleService from '../../../components/forms/tech/schedule-service/UnscheduleService'
import StartTravel from '../../../components/modules/tech/service-action/StartTravel'
import StopTravel from '../../../components/forms/tech/service-action/StopTravel'
import StartWork from '../../../components/modules/tech/service-action/StartWork'
import StopWork from '../../../components/modules/tech/service-action/StopWork'
import { useNavigate } from 'react-router-dom'
import { api } from '../../../api'
import { sfActions } from '../../../redux/features/persisted/applicationSlice'
import { useQueryClient } from '@tanstack/react-query'

const ActionButtons = ({ regData, setRegData }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const queryClient = useQueryClient()
    const { serviceForm } = useSelector((state) => state.application)
    const [loading, setLoading] = useState('')


    const proceedTravel = (visitId) => {

        queryClient.setQueryData(
            ['tech_schedule_profile', regData?.customer?.customer_id, regData?.registration_id],
            old => {
                if (!old) return old

                return {
                    ...old,
                    regService: {
                        ...(old?.regService || {}),
                        status: {
                            ...(old?.regService.status || {}),
                            status: 4,
                            status_text: 'On Visit'
                        },
                        last_visit: {
                            visit_id: visitId,
                            visit_status: 1,
                            visit_status_text: 'Travel',
                        }
                    }
                }
            }
        )
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

    const handleContinueAction = async () => {

        try {

            setLoading('continue')

            if (serviceForm?.service_form_uuid && serviceForm?.customer_id && serviceForm?.registration_id && serviceForm?.visit_uuid
                && serviceForm?.technician_uuid && serviceForm?.in_time && !serviceForm?.out_time
            ) {
                navigate('/tech/service/attend-work')
                return;
            }

            const work = await api.vfTv2Axios.get(`/registered-service/${regData?.registration_id}/${regData?.last_visit?.visit_id}/retrieve-start-work`)
            dispatch(sfActions.startWork(work));
            navigate('/tech/service/attend-work')

        } catch (error) {
            dispatch(toast.push({
                type: 'danger',
                head: 'Something wrong',
                message: error.message,
            }))
        } finally {
            setLoading('')
        }
    }

    const handleContinueWork = async () => {

        const activeVisitId = serviceForm?.visit_uuid || null;

        // continue cases : 
        // 1. the reg data and catch data is same visit id (check the required elements is available or not)
        // if available then continue or not the fetch data form data and continue
        // 2. the reg data on the started work. but the cache not available then fetch data form data and continue

        if ((regData?.last_visit?.visit_id === activeVisitId) || (regData?.status?.status === 4 && regData?.last_visit?.visit_status === 2 && !activeVisitId)) {
            await handleContinueAction()
        }

        return;

    }

    const handleStopWork = () => {
        dispatch(modal.push({
            title: 'Stop Current Work',
            body: <StopWork serviceFormUuid={serviceForm?.service_form_uuid} registrationId={regData?.registration_id}
                visitId={regData?.last_visit?.visit_id} customerId={regData?.customer?.customer_id}
            />
        }))
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
                    <>
                        <Button icon={<TbPlayerStop />} label={'Stop work'} rounded severity={'danger'} style={{ width: '100%' }}
                            onClick={handleStopWork} spinIcon={loading === 'stop'} />
                        <Button icon={<TbPlayerPlay />} label={'Continue work'} rounded severity={'primary'} style={{ width: '100%' }}
                            onClick={handleContinueWork} spinIcon={loading === 'continue'} disabled={serviceForm?.visit_uuid && regData?.last_visit?.visit_id !== serviceForm?.visit_uuid} />
                    </>
                    : ""}

            </div>
        </div>
    )
}

export default ActionButtons