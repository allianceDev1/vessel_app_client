import React, { useEffect, useRef, useState } from 'react'
import './service-completed.scss'
import ServiceSuccess from '../../../components/modules/tech/service-form-components/service-completion/ServiceSuccess'
import Button from '../../../components/UI_Primitives/buttons/Button';
import { TbShare2 } from 'react-icons/tb';
import { useSelector } from 'react-redux'
import { initAudio, vibrateSuccess } from '../../../utils/services/success_audio_services';
import { playSuccessAudio } from '../../../utils/services/success_audio_services';
import { useLocation, useNavigate } from 'react-router-dom'


const ServiceCompleted = () => {
    const shareRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { audioUnlocked } = useSelector((state) => state.miniSystem);
    const [data, setData] = useState()


    useEffect(() => {
        initAudio();

        if (!audioUnlocked) return;

        playSuccessAudio();
        vibrateSuccess();
    }, [audioUnlocked]);

    const handleShareClick = () => {
        shareRef.current?.shareAsImage();
    };

    const closePage = () => {
        navigate('/tech', {
            replace: true
        })
    }

    useEffect(() => {
        if (!location?.state?.date || !location?.state?.customerName || !location?.state?.customerId) {
            closePage()
            return;
        }

        setData(location?.state)
        // eslint-disable-next-line
    }, [])

    return (
        <div className="tech-service-completed-page">
            <ServiceSuccess data={data} ref={shareRef} />

            {/* Footer */}
            <div className="success-footer">
                <div className="confirmation-text">
                    A confirmation message has been sent to the customer
                </div>

                <div className="buttons">
                    <Button label={'Share'} style={{ width: '100%' }} icon={<TbShare2 />} rounded onClick={handleShareClick} />
                    <Button label={'Done'} rounded style={{ width: '100%' }} severity={'primary'} onClick={closePage} />
                </div>
            </div>

        </div>
    )
}

export default ServiceCompleted