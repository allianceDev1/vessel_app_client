import React, { useState } from 'react'
import './start-travel.scss'
import WorkerImage from '../../../../assets/images/illustrations/service-worker.png';
import Button from '../../../UI_Primitives/buttons/Button';
import { useDispatch } from 'react-redux';
import { api } from '../../../../api';
import { modal, toast } from '../../../../redux/features/non_persisted/miniSystemSlice';
import { getLocation } from '../../../../utils/services/location_services';
import { sfActions } from '../../../../redux/features/persisted/applicationSlice';
import { useNavigate } from 'react-router-dom';

const StartWork = ({ registrationId, visitId }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [loading, setLoading] = useState('')


    const handleProceed = async () => {
        try {
            setLoading('submit')

            // collect location
            const locationData = await getLocation()
            const location = locationData.latitude && locationData.longitude ? [locationData.latitude, locationData.longitude] : []

            const work = await api.vfTv2Axios.post(`/registered-service/${registrationId}/${visitId}/start-work`, { location })
            dispatch(sfActions.startWork(work))

            dispatch(modal.pull.all())

            navigate('/tech/service/attend-work')


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
        <div className="tech-start-travel-container">
            <div className="image-section">
                <img style={{ width: '150px' }} src={WorkerImage} alt='worker' />
            </div>
            <div className="text-section">
                <h2>Start Your Work</h2>
                <p>
                    By proceeding, we will access your current location to verify the service start.
                    This action officially marks the beginning of the service work and records the start time
                    for tracking and compliance.
                </p>
            </div>
            <Button label={'Proceed'} severity={'primary'} rounded style={{ width: '100%' }} onClick={handleProceed}
                spinIcon={loading} />
        </div>
    )
}

export default StartWork