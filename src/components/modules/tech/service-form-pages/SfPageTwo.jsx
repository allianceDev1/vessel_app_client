import './sf-page-two.scss'
import { serviceFormPageRoute } from '../../../../assets/javascript/pre_data/service'
import Button from '../../../UI_Primitives/buttons/Button'
import { TbShieldCheckFilled } from 'react-icons/tb'
import { useDispatch, useSelector } from 'react-redux'
import { sfActions, sfSetting } from '../../../../redux/features/persisted/applicationSlice'
import OtpVerification from '../service-form-components/OtpVerification'
import { toStandardText } from '../../../../utils/helpers/text-formatting'


const SfPageTwo = ({ page }) => {
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

    const resetVerificationType = () => {
        dispatch(sfActions.updateVerification({
            verification_type: null,
            is_verified: false,
            verification_at: null
        }))
    }

    const handleNext = () => {
        dispatch(sfSetting.setActivePage(102))
        return;
    }

    return (
        <div className="tech-service-form-page sf-page-two">
            {/* Title */}
            <div className="title-section">
                <h3>{serviceFormPageRoute?.filter(p => p.key === page?.index)?.[0]?.title}</h3>
                <p>{serviceFormPageRoute?.filter(p => p.key === page?.index)?.[0]?.description}</p>
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

            {/* Submitted */}
            {verification?.verification_type && verification?.is_verified && <div className="submitted-section" >
                <div className="border">
                    <TbShieldCheckFilled />
                    <h3>Verification Completed</h3>
                    <p>Verified using {toStandardText(verification?.verification_type)}.</p>
                    {verification?.verification_type === 'SUPERVISOR_APPROVAL' &&
                        <p>Your Supervisor verify this service after your service completion.</p>}
                </div>

                <div className="action">
                    {verification?.verification_type !== 'OTP' && <p onClick={resetVerificationType}>Verify by Customer OTP ?</p>}
                    <Button label={'Next'} rounded style={{ width: "100%", marginTop: '20px' }} onClick={handleNext} />
                </div>
            </div>}

            {verification?.verification_type && !verification?.is_verified && verification?.verification_type === 'OTP' &&
                <OtpVerification resetType={resetVerificationType} />}


        </div>
    )
}

export default SfPageTwo