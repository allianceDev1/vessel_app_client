import React, { useState } from 'react'
import './start-travel.scss'
import WorkerImage from '../../../../assets/images/illustrations/service-worker.webp';
import Button from '../../../UI_Primitives/buttons/Button';
import { useDispatch } from 'react-redux';
import { api } from '../../../../api';
import { modal, toast } from '../../../../redux/features/non_persisted/miniSystemSlice';
import { getLocation } from '../../../../utils/services/location_services';
import { sfActions } from '../../../../redux/features/persisted/applicationSlice';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import env from '../../../../config/env';
import { TbInfoCircle } from 'react-icons/tb';

const StartWork = ({ registrationId, visitId }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const queryClient = useQueryClient()
    const [loading, setLoading] = useState('');
    const [actionError, setActionError] = useState({ error: false, title: null, description: null })


    const handleProceed = async () => {
        try {
            setLoading('submit')

            // collect location
            const locationData = await getLocation();

            const locationAccess = locationData.latitude && locationData.longitude

            if (env.APP_SETTINGS.TECH_LOCATION_ACCESS === 'REQUIRED' && !locationAccess) {
                setActionError({
                    error: true,
                    title: "Location access denied",
                    description: "We need your location to start job. Please turn on location services and allow location access, then try again."
                })
                return;
            }

            const location = {
                location_access: locationAccess ? true : false,
                coordinates: [locationData.latitude, locationData.longitude],
                accuracy: locationData?.accuracy || null,
                speed: locationData?.speed || null,
                timestamp: locationData?.timestamp || null,
            }

            const work = await api.ssTv2Axios.post(`/registered-service/${registrationId}/${visitId}/start-work`, { location })
            dispatch(sfActions.startWork(work))
            
            navigate('/tech/service/attend-work')

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
        <div className="tech-start-travel-container">

            {actionError?.error ? <>
                <div className="text-section">
                    <TbInfoCircle size={60} color='red' />
                    <h2>{actionError?.title}</h2>
                    <p> {actionError?.description} </p>
                </div>
                <Button label={'Close'} rounded severity={'secondary'} style={{ width: '100%' }} onClick={() => dispatch(modal.pull.all())} />
            </> : <>
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
                    spinIcon={loading} disabled={loading}/>
            </>}
        </div>
    )
}

export default StartWork