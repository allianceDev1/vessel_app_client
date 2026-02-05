import React, { useState } from 'react'
import './start-travel.scss'
import RunningImage from '../../../../assets/images/illustrations/running-scooter.webp';
import Button from '../../../UI_Primitives/buttons/Button';
import { useDispatch } from 'react-redux';
import { api } from '../../../../api';
import { modal, toast } from '../../../../redux/features/non_persisted/miniSystemSlice';

const StartTravel = ({ registrationId, proceedTravel }) => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState('')
    const [isProceed, setIsProceed] = useState(false)


    const handleProceed = async () => {
        try {
            setLoading('submit')

            const visit = await api.vfTv2Axios.post(`/registered-service/${registrationId}/start-travel`)
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
            <div className="image-section">
                <img src={RunningImage} alt='traveler' />
            </div>

            {isProceed
                ? <>
                    <div className="text-section">
                        <h2>Your Travel Started</h2>
                    </div>
                    <Button label={'Close'} rounded style={{ width: '100%' }} onClick={() => dispatch(modal.pull.all())} />
                </>
                : <>
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
                        spinIcon={loading} />
                </>}


        </div>
    )
}

export default StartTravel