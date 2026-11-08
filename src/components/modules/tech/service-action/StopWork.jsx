import React, { useState } from 'react'
import './stop-work.scss'
import Button from '../../../UI_Primitives/buttons/Button';
import { useDispatch, useSelector } from 'react-redux';
import { api } from '../../../../api';
import { modal, toast } from '../../../../redux/features/non_persisted/miniSystemSlice';
import { sfActions, sfSetting } from '../../../../redux/features/persisted/applicationSlice';
import { useQueryClient } from '@tanstack/react-query';

const StopWork = ({ workKey }) => {

    const dispatch = useDispatch();
    const queryClient = useQueryClient()
    const [loading, setLoading] = useState('')
    const { serviceForm } = useSelector((state) => state.application)


    const handleStop = async () => {
        try {
            setLoading('submit')

            await api.ssTv2Axios.post(`/registered-service/stop-work`,
                { work_key: workKey }
            )

            const activeWork = serviceForm?.work_key || null;

            if (activeWork && workKey === activeWork) {
                dispatch(sfActions.clearAll())
                dispatch(sfSetting.clearAll())
            }

            dispatch(modal.pull.all())

            queryClient.removeQueries({
                queryKey: ['tech_schedule_profile']
            })

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

