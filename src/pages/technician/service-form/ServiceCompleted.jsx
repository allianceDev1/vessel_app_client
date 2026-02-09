import React, { useEffect, useRef, useState } from 'react'
import './service-completed.scss'
import ServiceSuccess from '../../../components/modules/tech/service-form-components/service-completion/ServiceSuccess'
import Button from '../../../components/UI_Primitives/buttons/Button';
import SuccessEffect from '../../../assets/audio/success-effect.mp3'
import { TbShare2 } from 'react-icons/tb';


const ServiceCompleted = ({ }) => {
    const shareRef = useRef(null);
    const successAudioRef = useRef(null);
    const playedRef = useRef(false);
    const unlockedRef = useRef(false);
    const audioRef = useRef(null);

    const vibrationWave = [80, 15, 80, 15, 40];





    const handleShareClick = () => {
        shareRef.current?.shareAsImage();
    };

    const temp = {
        serviceNumber: 'SRV-2026-001245',
        paymentStatus: 'pending', // 'completed' or 'pending'
        amount: 1250.00,
        paymentId: 'UPI202602051234567',
        customerName: 'Rahul Kumar',
        customerId: 'CUST-10982'
    }

    // const playSuccessFeedback = () => {
    //     // 🔊 Sound
    //     const audio = successAudioRef.current;
    //     console.log(audio, 'call audio')
    //     if (audio) {
    //         audio.currentTime = 0;
    //         audio.play().catch((error) => { console.log(error) });
    //     }

    //     if ("vibrate" in navigator) {
    //         navigator.vibrate(vibrationWave); // success pattern
    //     }
    // };

    // useEffect(() => {
    //     successAudioRef.current = new Audio(SuccessEffect);
    //     successAudioRef.current.volume = 0.7;
    // }, []);

    // useEffect(() => {
    //     // if (playedRef.current) return;

    //     playedRef.current = true;
    //     playSuccessFeedback();
    // }, []);

    useEffect(() => {
        audioRef.current = new Audio(SuccessEffect);
        audioRef.current.volume = 0.7;

        const unlock = () => {
            if (unlockedRef.current) return;

            const audio = audioRef.current;
            audio.volume = 0;          // silent
            audio.play()
                .then(() => {
                    audio.pause();
                    audio.currentTime = 0;
                    audio.volume = 0.7;
                    unlockedRef.current = true;
                })
                .catch(() => {
                    navigator.vibrate?.(vibrationWave);
                });

            window.removeEventListener("pointerdown", unlock);
        };

        // Any user interaction unlocks audio
        window.addEventListener("pointerdown", unlock);

        return () => {
            window.removeEventListener("pointerdown", unlock);
        };
    }, []);

    // Can be called WITHOUT click after unlock
    const playSuccessSound = () => {
        if (!unlockedRef.current) return;
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => { });
    };

    // Example: auto play after API success
    useEffect(() => {
        setTimeout(() => {
            playSuccessSound(); // 🔥 works after unlock
            if ("vibrate" in navigator) {
                navigator.vibrate(vibrationWave);
            }
        }, 500);
    }, []);

    return (
        <div className="tech-service-completed-page">
            <ServiceSuccess data={temp} ref={shareRef} />

            {/* Footer */}
            <div className="footer">
                <div className="confirmation-text">
                    A confirmation message has been sent to the customer
                </div>

                <div className="buttons">
                    <Button icon={<TbShare2 />} rounded onClick={handleShareClick} />
                    <Button label={'Done'} rounded style={{ width: '100%' }} severity={'primary'} />

                </div>
            </div>

        </div>
    )
}

export default ServiceCompleted