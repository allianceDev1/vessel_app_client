import React, { useState } from 'react'
import './start-travel.scss'
import RunningImage from '../../../../assets/images/illustrations/running-scooter.webp';
import Button from '../../../UI_Primitives/buttons/Button';
import { useDispatch } from 'react-redux';
import { api } from '../../../../api';
import { modal, toast } from '../../../../redux/features/non_persisted/miniSystemSlice';
import { getLocation } from '../../../../utils/services/location_services';
import env from '../../../../config/env';
import { TbInfoCircle } from 'react-icons/tb';

const StartTravel = ({ registrationId, proceedTravel }) => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState('')
    const [isProceed, setIsProceed] = useState(false)
    const [actionError, setActionError] = useState({ error: false, title: null, description: null })


    const handleProceed = async () => {
        try {
            setLoading('submit')

            // collect location
            const locationData = await getLocation()

            const locationAccess = locationData.latitude && locationData.longitude

            if (env.APP_SETTINGS.TECH_LOCATION_ACCESS === 'REQUIRED' && !locationAccess) {
                setActionError({
                    error: true,
                    title: "Location access denied",
                    description: "We need your location to start travel. Please turn on location services and allow location access, then try again."
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

            const visit = await api.vfTv2Axios.post(`/registered-service/${registrationId}/start-travel`, { location })
            setIsProceed(true)
            proceedTravel(visit.visit_uuid)

        } catch (error) {
            dispatch(toast.push({
                type: 'danger',
                head: 'Your travel failed',
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
            </>
                : isProceed
                    ? <>
                        <div className="image-section">
                            <img src={RunningImage} alt='traveler' />
                        </div>
                        <div className="text-section">
                            <h2>Your Travel Started</h2>
                        </div>
                        <Button label={'Close'} rounded severity={'secondary'} style={{ width: '100%' }} onClick={() => dispatch(modal.pull.all())} />
                    </>
                    : <>
                        <div className="image-section">
                            <img src={RunningImage} alt='traveler' />
                        </div>
                        <div className="text-section">
                            <h2>Start Your Travel</h2>
                            <p>
                                By proceeding, your travel for the service will start immediately and a
                                verification OTP will be sent to the customer’s registered mobile number for service completion.
                                <br></br>
                                <br></br>
                                The customer will also receive a message informing them that you are on the way to perform the service.
                            </p>
                        </div>
                        <Button label={'Proceed'} severity={'primary'} rounded style={{ width: '100%' }} onClick={handleProceed}
                            spinIcon={loading} disabled={loading} />
                    </>}


        </div>
    )
}

export default StartTravel