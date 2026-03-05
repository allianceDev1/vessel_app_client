import React, { useEffect, useState } from 'react'
import './otp-verification.scss'
import { useDispatch, useSelector } from 'react-redux';
import Button from '../../../UI_Primitives/buttons/Button';
import { TbBrandWhatsapp, TbDeviceSim1, TbDeviceSim2, TbRefresh } from 'react-icons/tb';
import { convertIsoToAmPm, isoToDDMonYYYY } from '../../../../utils/helpers/date-helpers';
import { toStandardText } from '../../../../utils/helpers/text-formatting';
import Message from '../../../UI_Primitives/message/Message';
import { api } from '../../../../api'
import { sfActions } from '../../../../redux/features/persisted/applicationSlice';
import { toast } from '../../../../redux/features/non_persisted/miniSystemSlice';

const OtpVerification = ({ resetType }) => {
    const dispatch = useDispatch();
    const { verification, serviceForm } = useSelector((state) => state.application)
    const [otp, setOtp] = useState('')
    const [loading, setLoading] = useState('')
    const [cooldowns, setCooldowns] = useState({ SMS: 0, WHATSAPP: 0 });

    const getCooldownSeconds = (attempt = 0) => attempt * 2 * 60;

    const getRemainingSeconds = (lastTryTime, attempt) => {
        if (!lastTryTime || !attempt) return 0;

        const last = new Date(lastTryTime).getTime();
        const now = Date.now();
        const totalMs = getCooldownSeconds(attempt) * 1000;

        const remaining = Math.ceil((last + totalMs - now) / 1000);
        return remaining > 0 ? remaining : 0;
    };

    const formatTimer = (sec) => {
        const m = String(Math.floor(sec / 60)).padStart(2, '0');
        const s = String(sec % 60).padStart(2, '0');
        return `${m}:${s}`;
    };

    const refetchOtpLogs = async () => {
        try {
            setLoading('refetch')

            const logs = await api.vfTv2Axios.get(`/registered-service/${serviceForm?.registration_id}/${serviceForm?.visit_uuid}/verify/otp-logs`)
            dispatch(sfActions.updateVerification({
                otpLogs: logs || []
            }))

        } catch (error) {
            dispatch(toast.push({
                type: 'danger',
                message: error?.message
            }))
        } finally {
            setLoading('')
        }
    }

    const resendOtp = async (sendType, numberType) => {
        try {
            await api.vfTv2Axios.post(`/registered-service/${serviceForm?.registration_id}/${serviceForm?.visit_uuid}/resend-otp`, {
                number_type: numberType,
                send_type: sendType
            })

            dispatch(sfActions.updateVerification({
                resendLog: {
                    ...(verification?.resendLog || {}),
                    [sendType]: {
                        attempt: (verification?.resendLog?.[sendType]?.attempt || 0) + 1,
                        last_try_time: new Date().toISOString()
                    }
                }
            }))

            refetchOtpLogs()

        } catch (error) {
            dispatch(toast.push({
                type: 'danger',
                message: error?.message
            }))
        } finally {
            setLoading('')
        }
    }

    const verifyOtp = async (OTP) => {

        if ((OTP || otp).length !== 6) return;

        try {
            setLoading('verify')

            await api.vfTv2Axios.post(`/registered-service/${serviceForm?.registration_id}/${serviceForm?.visit_uuid}/verify/otp`, {
                otp: OTP || otp
            })

            dispatch(sfActions.updateVerification({
                verification_type: "OTP",
                is_verified: true,
                verification_at: new Date().toISOString()
            }))
        } catch (error) {
            dispatch(toast.push({
                type: 'danger',
                message: error?.message
            }))
            setOtp('')
        } finally {
            setLoading('')
        }
    }

    const handleChangeOtp = (e) => {

        if (e.target.value.length > 6) return;

        setOtp(e.target.value)

        if (e.target.value.length === 6) {
            verifyOtp(e.target.value)
        }
    }

    useEffect(() => {
        const log = verification?.resendLog || {};

        setCooldowns({
            SMS: getRemainingSeconds(
                log?.SMS?.last_try_time,
                log?.SMS?.attempt
            ),
            WHATSAPP: getRemainingSeconds(
                log?.WHATSAPP?.last_try_time,
                log?.WHATSAPP?.attempt
            )
        });
    }, [verification?.resendLog]);

    useEffect(() => {
        const timer = setInterval(() => {
            setCooldowns(prev => ({
                SMS: Math.max(prev.SMS - 1, 0),
                WHATSAPP: Math.max(prev.WHATSAPP - 1, 0)
            }));
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="tech-service-form-otp-verification-comp" >
            {/* Info */}
            <div className="info-box">
                <p>
                    Collect the OTP directly from the customer and verify it here to close the service request.
                    OTP verification is mandatory to complete the service.
                </p>
            </div>

            {/* Verify */}
            <div className="verify-section">
                <div className="head">
                    <h3>Verify OTP</h3>
                    <p>Enter the 6 Digital OTP</p>
                </div>
                <form action="" onSubmit={(e) => {
                    e.preventDefault();
                    verifyOtp()
                }}>
                    <input value={otp} placeholder='______' type='number' onChange={handleChangeOtp} name='otp' min={0} />
                    <Button label={'Verify'} rounded severity={'primary'} disabled={loading === 'verify'}
                        spinIcon={loading === 'verify'} />


                    <p className='reset-type' onClick={resetType}>Try Another Verification Type</p>
                </form>
            </div>


            {/* Status and Resend */}
            <div className="status-section">
                <div className="head">
                    <h3>Mobile numbers</h3>
                    <Button icon={<TbRefresh />} disabled={loading === 'refetch'} spinIcon={loading === 'refetch'} size='small' rounded onClick={refetchOtpLogs} />
                </div>
                {verification?.otpLogs?.length
                    ? <div className="number-list">
                        {[...verification?.otpLogs]?.sort((a, b) => a.number_type.localeCompare(b.number_type))?.map((log) => {
                            return <div className="item">
                                <div className="icon">
                                    {log?.number_type === 'PRIMARY' ? <TbDeviceSim1 />
                                        : log?.number_type === 'SECONDARY' ? <TbDeviceSim2 />
                                            : <TbBrandWhatsapp />}
                                </div>
                                <div>
                                    <h4>+{log?.send_to}</h4>
                                    <p>Send at {isoToDDMonYYYY(new Date(log?.send_at))}, {convertIsoToAmPm(new Date(log?.send_at))}</p>
                                </div>
                                <p>{toStandardText(log?.status || "failed")}</p>
                            </div>
                        })}
                    </div>
                    : <Message type={'warning'} message={'The OTP send logs not available. Try to resend or contact managing team.'}
                        style={{ marginTop: '10px' }} />}

                <div className="action">
                    <div className="buttons">
                        <Button icon={<TbDeviceSim1 />}
                            label={
                                cooldowns.SMS > 0
                                    ? `${formatTimer(cooldowns.SMS)}`
                                    : 'Retry'
                            }
                            rounded
                            outlined
                            size='small'
                            disabled={cooldowns.SMS > 0}
                            onClick={() => resendOtp('SMS', 'PRIMARY')} />
                        <Button icon={<TbBrandWhatsapp />}
                            label={
                                cooldowns.WHATSAPP > 0
                                    ? `${formatTimer(cooldowns.WHATSAPP)}`
                                    : 'Retry'
                            }
                            rounded
                            outlined
                            size='small'
                            disabled={cooldowns.WHATSAPP > 0}
                            onClick={() => resendOtp('WHATSAPP', 'WHATSAPP')} />
                    </div>
                </div>
            </div>

            {/* Info */}
            <div className="info-box" style={{ marginTop: '40px' }}>
                <dl>
                    <li >If the OTP delivery status shows <b>Failed</b> or the customer confirms they have not received the OTP, immediately report the issue to the manager team.</li>
                    <li >Once the manager confirms, select the <b>"Supervisor Approval"</b> verification type.</li>
                    <li >If the customer later provides the OTP, the service can be verified through the DAR module.</li>
                </dl>
            </div>

        </div>
    )
}

export default OtpVerification