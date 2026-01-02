import React, { useState } from 'react'
import './stop-work.scss'
import Button from '../../../UI_Primitives/buttons/Button';
import { useDispatch, useSelector } from 'react-redux';
import { api } from '../../../../api';
import { modal, toast } from '../../../../redux/features/non_persisted/miniSystemSlice';
import { sfActions, sfSetting } from '../../../../redux/features/persisted/applicationSlice';

const StopWork = ({ serviceFormUuid, registrationId, visitId, setRegData }) => {

    const dispatch = useDispatch();
    const [loading, setLoading] = useState('')
    const { serviceForm } = useSelector((state) => state.application)


    const handleStop = async () => {
        try {
            setLoading('submit')

            await api.vfTv2Axios.post(`/registered-service/${registrationId}/${visitId}/stop-work`,
                { service_form_uuid: serviceFormUuid }
            )

            const activeVisitId = serviceForm?.visit_uuid || null;

            if (activeVisitId && visitId === activeVisitId) {
                dispatch(sfActions.clearAll())
                dispatch(sfSetting.clearAll())
            }

            dispatch(modal.pull.all())

            setRegData((state) => ({
                ...(state || {}),
                last_visit: {
                    ...(state.last_visit || {}),
                    visit_status: 1,
                    visit_status_text: "Travel"
                }
            }))

        } catch (error) {
            dispatch(toast.push({
                type: 'danger',
                head: 'Work staring failed',
                message: error.message,
            }))
        } finally {
            setLoading('')
        }
    }

    return (
        <div className="tech-stop-work-container">
            <div className="text-section">
                <p >
                    This action will permanently delete all current work data from the system.
                    <br></br>
                    <br></br>
                    The service will be reset to the <b>Travel status,</b> and you can start a new service form from the beginning.
                    <br></br>
                    <br></br>
                    This action cannot be undone.
                </p>
            </div>

            <Button label={'Yes, I understand'} severity={'danger'} rounded style={{ width: '100%' }} onClick={handleStop} spinIcon={loading} />
        </div>
    )
}

export default StopWork

