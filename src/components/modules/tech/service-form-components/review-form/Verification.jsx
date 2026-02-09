import './verification.scss'
import { useDispatch, useSelector } from 'react-redux'
import { sfActions } from '../../../../../redux/features/persisted/applicationSlice'
import OtpVerification from '../OtpVerification'



const Verification = ({ resetVerificationType }) => {
    const dispatch = useDispatch();
    const { verification } = useSelector((state) => state.application)

    const selectVerificationType = (type) => {

        if (type === 'SUPERVISOR_APPROVAL') {
            dispatch(sfActions.updateVerification({
                verification_type: type,
                is_verified: true,
                verification_at: new Date().toISOString()
            }))

            return;
        }

        dispatch(sfActions.updateVerification({
            verification_type: type,
            is_verified: false,
            verification_at: null
        }))
    }

    return (
        <div className="tech-service-form-page verification">
            {/* Title */}
            <div className="title-section">
                <h3>Verify Service</h3>
                <p>Verify your service is completed</p>
            </div>

            {/* Verification Types */}
            {!verification?.verification_type && <div className="verification-type-section" >
                <div className="type-border" onClick={() => selectVerificationType('OTP')}>
                    <h3>Customer OTP</h3>
                    <p>Primary verification</p>
                </div>
                <div className="type-border" onClick={() => selectVerificationType('SUPERVISOR_APPROVAL')}>
                    <h3>Supervisor Approval</h3>
                    <p>Fallback verification</p>
                </div>
            </div>}

            {/* OTP Verification */}
            {verification?.verification_type && !verification?.is_verified && verification?.verification_type === 'OTP' &&
                <OtpVerification resetType={resetVerificationType} />}

        </div>
    )
}

export default Verification