import React, { useEffect } from 'react'
import './service-job.scss'
import { useDispatch } from 'react-redux'
import { page, toast } from '../../../redux/features/non_persisted/miniSystemSlice';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import Button from '../../../components/UI_Primitives/buttons/Button'
import { TbArrowUpRight, TbChevronDown, TbClipboardText, TbDots, TbDownload, TbHome, TbRefresh } from 'react-icons/tb';
import Dropdown from '../../../components/UI_Primitives/dropdown/Dropdown'
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../api'
import SkeletonGrid from '../../../components/UI_Primitives/skeleton/SkeletonGrid';
import ErrorState from '../../../components/UI_Primitives/ui-states/ErrorState';
import Badge from '../../../components/UI_Primitives/badge/Badge';
import { toStandardText } from '../../../utils/helpers/text-formatting';
import { convertIsoToAmPm, formatDuration, isoToDDMonYYYY } from '../../../utils/helpers/date-helpers';
import { downloadServiceBill, downloadServiceReceipt } from '../../../utils/services/finance_service';
import { generateUniqueId } from '../../../utils/helpers/generate_Id';
import Message from '../../../components/UI_Primitives/message/Message';



const getStatusSeverity = (status = '') => {
    const normalized = String(status).toUpperCase();
    if (['PAID', 'SUCCESS', 'COMPLETED', 'CONFIRMED', 'ISSUED', 'ACTIVE', 'VERIFIED'].includes(normalized)) {
        return 'success';
    }
    if (['PARTIALLY_PAID', 'PARTIAL', 'DRAFT', 'PENDING', 'PROCESSING'].includes(normalized)) {
        return 'warning';
    }
    if (['UNPAID', 'FAILED', 'REJECTED', 'CANCELLED', 'VOID', 'OVERDUE'].includes(normalized)) {
        return 'danger';
    }
    return 'secondary';
};

const formatCurrencySymbol = (currency = 'INR') => {
    if (!currency || String(currency).toUpperCase() === 'INR') return '₹';
    return `${currency} `;
};

const ServiceJob = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { service_srl_no, pl_product_id, pp_product_id } = useParams();


    useEffect(() => {
        dispatch(page.config({ title: service_srl_no, note: "Service Job View" }))
        // eslint-disable-next-line
    }, [])

    const { data, isLoading, error } = useQuery({
        queryKey: ['service_job_view', service_srl_no, 'about'],
        queryFn: async () => {
            const data = await api.ssTv2Axios.get(`/completed/${service_srl_no}/about`);
            const billData = await api.fnPv1Axios.get(`/bill/service-job/${service_srl_no}`).catch(() => null);

            const billAmount = Number(billData?.bill_amount ?? 0);
            const paidAmount = Number(billData?.paid_amount ?? 0);
            const balance = Math.max(0, billAmount - paidAmount);
            const paymentStatus = billData?.status
                ? toStandardText(billData.status)
                : billAmount === 0
                    ? 'No Amounts'
                    : balance <= 0 && paidAmount >= billAmount
                        ? 'Paid'
                        : paidAmount > 0
                            ? 'Partially Paid'
                            : 'Unpaid';
            const paidPercentage = billAmount <= 0
                ? (paidAmount > 0 ? 100 : 0)
                : Math.min(100, (paidAmount / billAmount) * 100);

            return {
                ...data,
                bill: billData,
                bill_summery: {
                    grand_total: billAmount,
                    paid_percentage: paidPercentage,
                    paid: paidAmount,
                    balance: balance,
                    payment_status: paymentStatus,
                    currency_symbol: formatCurrencySymbol(billData?.currency)
                }
            }
        },
        staleTime: 60_000
    })

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
                await downloadServiceReceipt(data?.bill?.bill_no || '')
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
                <SkeletonGrid rows={1} columns={1} height={'90px'} />
                <SkeletonGrid rows={8} columns={1} height={'60px'} />

            </div>
        )
    }

    if (error) {
        return <ErrorState icon={<TbClipboardText />} title={'Data not available'}
            message={error?.message} hight='400px' />
    }

    return (
        <div className="service-job-tech-container">
            <div className="buttons">
                <div className="menu-buttons">
                    <Button icon={<TbHome />} rounded outlined={pl_product_id || pp_product_id ? true : false} size='small'
                        onClick={() => navigate(`/tech/completed/service-job/${service_srl_no}`)} severity={'secondary'} />
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
                                    label: pl, value: pl, onClick: () => navigate(`/tech/completed/service-job/${service_srl_no}/pl/${pl}`)
                                }))
                            }] : []),
                            ...(data?.purchase_products?.length > 0 ? [{
                                heading: 'Install Logs',
                                items: data?.purchase_products?.map((pp) => ({
                                    label: pp, value: pp, onClick: () => navigate(`/tech/completed/service-job/${service_srl_no}/pp/${pp}`)
                                }))
                            }] : [])
                        ]}
                    />}
                </div>
                <div className='action-buttons'>
                    <Button icon={<TbArrowUpRight />} label={'Customer'} rounded outlined size='small'
                        iconPos='right' onClick={() => navigate(`/tech/customer/${data?.customer_id}/about`)} />
                    <Dropdown button={{
                        icon: <TbDots />,
                        size: 'small',
                        rounded: true,
                        outlined: true,
                    }}
                        list={[
                            {
                                heading: 'Download',
                                items: [
                                    {
                                        icon: <TbDownload />, label: "Bill", onClick: () => downloadAction('Bill'),
                                        disabled: data?.bill?.bill_no ? false : true,
                                    },
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
                    {data?.bill?.bill_no ? (
                        <div className="payment-border">
                            <div className="summery-box">
                                <div className="bill-header">
                                    <div className="bill-no-box">
                                        <span className="bill-label">Bill No</span>
                                        <h3 className="bill-number">{data?.bill?.bill_no}</h3>
                                    </div>
                                    <div className="bill-badges">
                                        {data?.bill?.bill_status && (
                                            <Badge
                                                size="small"
                                                value={toStandardText(data.bill.bill_status)}
                                                severity={getStatusSeverity(data.bill.bill_status)}
                                            />
                                        )}
                                        {data?.bill?.status && (
                                            <Badge
                                                size="small"
                                                value={toStandardText(data.bill.status)}
                                                severity={getStatusSeverity(data.bill.status)}
                                            />
                                        )}
                                    </div>
                                </div>
                                <div className="amount">
                                    <div className="left-section">
                                        <h2>{data?.bill_summery?.currency_symbol}{(data?.bill_summery?.grand_total || 0).toFixed(2)}</h2>
                                        <p>Bill Amount</p>
                                    </div>
                                    <div className="right-section">
                                        <h2>{data?.bill_summery?.currency_symbol}{(data?.bill_summery?.paid || 0).toFixed(2)}</h2>
                                        <p>Paid Amount</p>
                                    </div>
                                </div>
                                <div className="graph">
                                    <div className="graph-outer-line">
                                        <div className="graph-inner-line" style={{ width: `${data?.bill_summery?.paid_percentage || 0}%` }}></div>
                                    </div>
                                    <div className="footer">
                                        <h4>{data?.bill_summery?.payment_status || 'No Amounts'}</h4>
                                        <h4>{data?.bill_summery?.currency_symbol}{(data?.bill_summery?.balance || 0).toFixed(2)} Balance</h4>
                                    </div>
                                </div>
                            </div>

                            <div className="transactions-section">
                                <div className="transactions-header">
                                    <h4>Transactions</h4>
                                    <span className="tx-count">{data?.bill?.transactions?.length || 0}</span>
                                </div>
                                {data?.bill?.transactions?.length > 0 ? (
                                    <div className="tx-card-list">
                                        {data?.bill?.transactions?.map((tx, idx) => (
                                            <div key={tx?.transaction_id || idx} className="tx-card">
                                                <div className="tx-row-top">
                                                    <div className="tx-id-group">
                                                        <span className="tx-id">{tx?.transaction_id || '-'}</span>
                                                        {tx?.payment_mode && (
                                                            <span className="tx-mode-pill">{toStandardText(tx.payment_mode)}</span>
                                                        )}
                                                    </div>
                                                    <span className="tx-amount">
                                                        {data?.bill_summery?.currency_symbol}{(Number(tx?.allocated_amount) || 0).toFixed(2)}
                                                    </span>
                                                </div>
                                                <div className="tx-row-bottom">
                                                    <span className="tx-date">
                                                        {tx?.payment_date
                                                            ? `${isoToDDMonYYYY(tx.payment_date)}${convertIsoToAmPm(tx.payment_date) ? `, ${convertIsoToAmPm(tx.payment_date)}` : ''}`
                                                            : '-'}
                                                    </span>
                                                    <Badge
                                                        size="small"
                                                        value={toStandardText(tx?.status || 'UNKNOWN')}
                                                        severity={getStatusSeverity(tx?.status)}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="empty-transactions">
                                        <p>No payment transactions recorded</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div style={{ marginTop: '20px' }}>
                            <Message
                                type={'info'}
                                head={'Bill not generated'}
                                message={'The bill is not generated yet. Bills are generated only after the service registration is closed.'}
                            />
                        </div>
                    )}
                    <div className="text-content">
                        <div className="item" style={{ cursor: 'pointer' }} onClick={() => navigate(`/tech/customer/${data?.customer_id}/about`)}>
                            <p className='label'>Customer Id & Customer Name</p>
                            <div>
                                <p className='text-value'>{data?.customer_name} ({data?.customer_id})</p>
                            </div>
                            <div className="right-icon">
                                <TbArrowUpRight />
                            </div>
                        </div>
                        <div className="item">
                            <p className='label'>Reg No & Visit No</p>
                            <div>
                                <p className='text-value'>{data?.registration_id} - Visit : {data?.visit_index} </p>
                            </div>
                        </div>
                        <div className="item">
                            <p className='label'>Service Srl No & Reg Status</p>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <p className='text-value'>{data?.service_srl_no}</p>
                                <Badge size='small'
                                    value={data?.work_closed ? 'Reg Closed' : 'Reg not closed'}
                                    severity={data?.work_closed ? 'success' : 'warning'} />
                            </div>
                        </div>
                        <div className="item">
                            <p className='label'>Technician</p>
                            <div>
                                <p className='text-value'>{data?.worker_name}</p>
                            </div>
                        </div>
                        <div className="item">
                            <p className='label'>Service Date</p>
                            <div>
                                <p className='text-value'>{isoToDDMonYYYY(data?.date)}</p>
                            </div>
                        </div>
                        <div className="item">
                            <p className='label'>IN & OUT</p>
                            <div>
                                <p className='text-value'>{convertIsoToAmPm(data?.in_time)} - {convertIsoToAmPm(data?.out_time)} ({formatDuration(data?.duration)})</p>
                            </div>
                        </div>
                        <div className="item">
                            <p className='label'>Call Summery (Applied / Estimate)</p>
                            <div>
                                <p className='text-value'>
                                    <p className='text-value'>{data?.call_summery?.call_rate_applied || 0} Call <span style={{ color: 'var(--text-muted)' }}> /  {data?.call_summery?.call_rate_estimate || 0} Call</span></p>
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
                </div>}
        </div>
    )
}

export default ServiceJob