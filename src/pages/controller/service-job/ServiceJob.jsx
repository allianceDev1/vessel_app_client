import React, { useEffect } from 'react'
import './service-job.scss'
import { useDispatch, useSelector } from 'react-redux'
import { modal, page, toast } from '../../../redux/features/non_persisted/miniSystemSlice';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import Button from '../../../components/UI_Primitives/buttons/Button'
import { TbArrowUpRight, TbChevronDown, TbClipboardText, TbDownload, TbPasswordFingerprint, TbRefresh } from 'react-icons/tb';
import Dropdown from '../../../components/UI_Primitives/dropdown/Dropdown'
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../api'
import SkeletonGrid from '../../../components/UI_Primitives/skeleton/SkeletonGrid';
import ErrorState from '../../../components/UI_Primitives/ui-states/ErrorState';
import Badge from '../../../components/UI_Primitives/badge/Badge';
import { toStandardText } from '../../../utils/helpers/text-formatting';
import { convertIsoToAmPm, formatDuration, getTimeDiff, isoToDDMonYYYY } from '../../../utils/helpers/date-helpers';
import VerifyService from '../../../components/forms/controller/completed-service/VerifyService';
import { downloadServiceBill, downloadServiceReceipt } from '../../../utils/services/finance_service';
import { generateUniqueId } from '../../../utils/helpers/generate_Id';



const ServiceJob = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { service_srl_no, pl_product_id, pp_product_id } = useParams();
    const { user } = useSelector((state) => state.user)

    useEffect(() => {
        dispatch(page.setTitle({ title: service_srl_no, note: "Service Job View" }))
        // eslint-disable-next-line
    }, [])

    const { data, isLoading, error } = useQuery({
        queryKey: ['service_job_view', service_srl_no, 'about'],
        queryFn: async () => {
            const data = await api.vfCv2Axios.get(`/service/completed/${service_srl_no}/about`);

            const diff = getTimeDiff(new Date(data?.out_time), new Date(data?.reg_date))

            const grandTotal = data?.bills?.reduce((acc, curr) => acc + (curr?.grand_total || 0), 0)
            const paid = data?.bills?.reduce((acc, curr) => acc + (curr?.paid_amount || 0), 0)
            const balance = grandTotal - paid;
            const paymentStatus = grandTotal === paid ? 'Paid' : paid > 0 ? 'Partially Paid' : 'Unpaid';
            const paidPercentage = (paid / grandTotal) * 100;

            return {
                ...data,
                tat: { day: diff.days, hour: diff.hours, minute: diff.minutes },
                bill_summery: {
                    grand_total: grandTotal,
                    paid_percentage: grandTotal === 0 ? 100 : paidPercentage,
                    paid: paid,
                    balance: balance,
                    payment_status: paymentStatus
                }
            }
        },
        staleTime: 60_000
    })

    const verifyService = () => {
        dispatch(modal.push({
            title: "Service Manual Verification",
            body: <VerifyService
                registrationId={data?.registration_id} serviceSrlNo={service_srl_no} verifyType={'SUPERVISOR_APPROVAL'}
            />
        }))
    }


    const downloadAction = async (type) => {

        const key = generateUniqueId(6)

        try {
            dispatch(toast.push({
                id: key,
                type: null,
                head: `Fetching ${type}...`,
                message: 'Place wait for a while',
                icon: <TbRefresh />,
                doClose: false,
                autoClose: false
            }))

            if (type === 'Bill') {
                await downloadServiceBill(service_srl_no)
            } else {
                await downloadServiceReceipt(data?.bills?.[0]?.bill_no || '')
            }

        } catch (error) {
            dispatch(toast.push({
                type: 'danger',
                head: "Downloading Failed",
                message: error?.message
            }))
        } finally {
            dispatch(toast.pull.single(key))
        }
    }



    if (isLoading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px', marginBottom: '40px' }}>
                <SkeletonGrid rows={1} columns={1} height={'80px'} />
                <SkeletonGrid rows={4} columns={3} height={'70px'}
                    responsive={{ md: { columns: 2, rows: 4, height: '70px' } }} />
                <SkeletonGrid rows={1} columns={1} height={'180px'} />
            </div>
        )
    }

    if (error) {
        return <ErrorState icon={<TbClipboardText />} title={'Data not available'}
            message={error?.message} hight='400px' />
    }

    return (
        <div className="service-job-controller-container">
            <div className="buttons">
                <div className="menu-buttons">
                    <Button label={'About'} rounded outlined={pl_product_id || pp_product_id ? true : false} size='small' style={{ width: '100px' }}
                        onClick={() => navigate(`/controller/completed/service-job/${service_srl_no}`)} />
                    {(data?.service_products?.length > 0 || data?.purchase_products?.length > 0) && <Dropdown button={{
                        icon: <TbChevronDown />,
                        label: "Products",
                        size: 'small',
                        rounded: true,
                        outlined: (pl_product_id || pp_product_id) ? false : true,
                        style: { width: '120px' }
                    }}
                        selected={pl_product_id || pp_product_id}
                        list={[
                            ...(data?.service_products?.length > 0 ? [{
                                heading: 'Product Logs',
                                items: data?.service_products?.map((pl) => ({
                                    label: pl, value: pl, onClick: () => navigate(`/controller/completed/service-job/${service_srl_no}/pl/${pl}`)
                                }))
                            }] : []),
                            ...(data?.purchase_products?.length > 0 ? [{
                                heading: 'Install Logs',
                                items: data?.purchase_products?.map((pp) => ({
                                    label: pp, value: pp, onClick: () => navigate(`/controller/completed/service-job/${service_srl_no}/pp/${pp}`)
                                }))
                            }] : [])
                        ]}
                    />}
                </div>
                <div className='action-buttons'>
                    <Button icon={<TbArrowUpRight />} label={'Registration'} rounded outlined size='small' style={{ width: '150px' }}
                        onClick={() => navigate(`/controller/registered/${data?.registration_id}`)} iconPos='right' />
                    <Dropdown button={{
                        icon: <TbChevronDown />,
                        label: "Actions",
                        size: 'small',
                        rounded: true,
                        outlined: true,
                        style: { width: '120px' }
                    }}
                        list={[
                            (!data?.verification?.verified && user?.allowed_origins?.some(a => ['vessel_c_writer', 'vessel_c_admin'].includes(a))) && {
                                items: [
                                    { icon: <TbPasswordFingerprint />, label: "Verify Service", onClick: verifyService },
                                    { type: 'divider' },
                                ]
                            },
                            {
                                heading: 'Download',
                                items: [
                                    { icon: <TbDownload />, label: "Bill", onClick: () => downloadAction('Bill') },
                                    {
                                        icon: <TbDownload />, label: "Receipt", disabled: data?.bill_summery?.paid > 0 ? false : true,
                                        onClick: () => downloadAction('Receipt')
                                    },
                                ]
                            }
                        ]}
                    />
                </div>
            </div>
            {(pl_product_id || pp_product_id)
                ? <div className='outlet-border'>
                    <Outlet />
                </div>
                : <div className='about-content'>
                    <div className="text-content">
                        <div className="item">
                            <p className='label'>Customer Id & Customer Name</p>
                            <div>
                                <p className='text-value'>{data?.customer_name} ({data?.customer_id})</p>
                            </div>
                        </div>
                        <div className="item">
                            <p className='label'>Reg No & Visit No</p>
                            <div>
                                <p className='text-value'>{data?.registration_id} - Visit : {data?.visit_index} </p>
                            </div>
                        </div>
                        <div className="item">
                            <p className='label'>Service Srl No & Job Status</p>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <p className='text-value'>{data?.service_srl_no}</p>
                                <Badge size='small' value={toStandardText(data?.job_status)} severity={'success'} />
                                {data?.rnd_uuid && <Badge size='small' value={'R&D'} severity={'warning'} />}
                            </div>
                        </div>
                        <div className="item">
                            <p className='label'>Technician</p>
                            <div>
                                <p className='text-value'>{data?.worker_name}</p>
                            </div>
                        </div>
                        <div className="item">
                            <p className='label'>Work Pickup Time</p>
                            <div>
                                <p className='text-value'>{isoToDDMonYYYY(data?.pickup_work_at)}, {convertIsoToAmPm(data?.pickup_work_at)}</p>
                            </div>
                        </div>
                        <div className="item">
                            <p className='label'>Service Date</p>
                            <div>
                                <p className='text-value'>{isoToDDMonYYYY(data?.date)}</p>
                            </div>
                        </div>
                        <div className={`item ${data?.duration <= 600 && 'warning-item'}`}>
                            <p className='label'>IN & OUT</p>
                            <div>
                                <p className='text-value ' >{convertIsoToAmPm(data?.in_time)} - {convertIsoToAmPm(data?.out_time)} ({formatDuration(data?.duration)})</p>
                            </div>
                        </div>
                        <div className="item">
                            <p className='label'>Call Summery (Applied / Estimate)</p>
                            <div>
                                <p className='text-value'>{data?.call_summery?.call_rate_applied || 0} Call <span style={{ color: 'var(--text-secondary-3)' }}> /  {data?.call_summery?.call_rate_estimate || 0} Call</span></p>
                            </div>
                        </div>
                        <div className="item">
                            <p className='label'>Turnaround Time (TAT)</p>
                            <div>
                                <p className='text-value'>
                                    {(data?.tat?.day || 0) > 0 && `${data?.tat?.day || 0} Days,`} {(data?.tat?.hour || 0) > 0 && `${data?.tat?.hour || 0} Hours,`} {(data?.tat?.minute || 0) > 0 && `${data?.tat?.minute || 0} Minutes`}
                                    {data?.tat?.day === 0 && data?.tat?.hour === 0 && data?.tat?.minute === 0 && 'No TAT'}
                                </p>
                            </div>
                        </div>
                        <div className="item">
                            <p className='label'>Verify Status</p>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                {data?.verification?.verified ?
                                    <Badge size='small' value={'Verified'} severity={'success'} />
                                    : <Badge size='small' value={'Not Verified'} severity={'danger'} />}
                                <p className='text-value'>
                                    {data?.verification?.verified && `Using ${toStandardText(data?.verification?.verification_type)}`} {data?.verification?.verification_type === "OTP" && data?.verification?.otp}
                                </p>
                            </div>
                        </div>
                        {data?.verification?.verified && <div className="item">
                            <p className='label'>Verified By</p>
                            <div>
                                <p className='text-value'>{data?.verification?.verify_by}</p>
                            </div>
                        </div>}
                        {data?.verification?.verified && <div className="item">
                            <p className='label'>Verified At</p>
                            <div>
                                <p className='text-value'>{isoToDDMonYYYY(data?.verification?.verified_at)}</p>
                            </div>
                        </div>}
                    </div>
                    <div className="payment-border">
                        <div className="summery-box">
                            <div className="amount">
                                <div className="left-section">
                                    <h2>₹{(data?.bill_summery?.grand_total || 0).toFixed(2)}</h2>
                                    <p>Total Amount</p>
                                </div>
                                <div className="right-section">
                                    <h2>₹{(data?.bill_summery?.paid || 0).toFixed(2)}</h2>
                                    <p>Paid Amount</p>
                                </div>
                            </div>
                            <div className="graph">
                                <div className="graph-outer-line">
                                    <div className="graph-inner-line" style={{ width: `${data?.bill_summery?.paid_percentage || 0}%` }}></div>
                                </div>
                                <div className='footer'>
                                    <h4>{data?.bill_summery?.grand_total > 0 ? data?.bill_summery?.payment_status : 'No Amounts'}</h4>
                                    <h4>₹{(data?.bill_summery?.balance || 0).toFixed(2)} Balance</h4>
                                </div>
                            </div>
                        </div>
                        <div className="bills-list">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Bill No</th>
                                        <th>Total</th>
                                        <th>Paid</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data?.bills?.map((bill) => (
                                        <tr key={bill?.bill_no} style={{ color: bill?.status === 'DRAFT' ? 'var(--color-warning)' : '' }}>
                                            <td>{bill?.bill_no}</td>
                                            <td>₹ {(bill?.grand_total || 0).toFixed(2)}</td>
                                            <td>₹ {(bill?.paid_amount || 0).toFixed(2)}</td>
                                            <td>
                                                {bill?.status === 'DRAFT'
                                                    ? <Badge size='small' value={'DRAFT'} severity={'warning'} />
                                                    : bill?.payment_status === 'UNPAID'
                                                        ? <Badge size='small' value={toStandardText(bill?.payment_status)} severity={'danger'} />
                                                        : <Badge size='small' value={toStandardText(bill?.payment_status)} severity={'success'} />}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="info">
                        <p>
                            Only issued bills are ready for payment. Draft bills are converted to issued bills only after the service registration is closed. <br></br>
                            In some cases, there may be a mismatch between the bill amount and the service or spare part amounts. This usually happens due to manual overrides by technicians or adjustments made during billing.
                        </p>
                    </div>
                </div>}
        </div>
    )
}

export default ServiceJob