import React, { useEffect } from 'react'
import './service-job.scss'
import { useDispatch } from 'react-redux'
import { page } from '../../../redux/features/non_persisted/miniSystemSlice';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import Button from '../../../components/UI_Primitives/buttons/Button'
import { TbChevronDown, TbClipboardText, TbDots, TbDownload, TbHome } from 'react-icons/tb';
import Dropdown from '../../../components/UI_Primitives/dropdown/Dropdown'
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../api'
import SkeletonGrid from '../../../components/UI_Primitives/skeleton/SkeletonGrid';
import ErrorState from '../../../components/UI_Primitives/ui-states/ErrorState';
import Badge from '../../../components/UI_Primitives/badge/Badge';
import { toStandardText } from '../../../utils/helpers/text-formatting';
import { convertIsoToAmPm, formatDuration, isoToDDMonYYYY } from '../../../utils/helpers/date-helpers';
import { downloadServiceBill, downloadServiceReceipt } from '../../../utils/services/finance_service';



const ServiceJob = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { service_srl_no, pl_product_id, pp_product_id } = useParams();


    useEffect(() => {
        dispatch(page.setTitle({ title: service_srl_no, note: "Service Job View" }))
        // eslint-disable-next-line
    }, [])

    const { data, isLoading, error } = useQuery({
        queryKey: ['service_job_view', service_srl_no, 'about'],
        queryFn: async () => {
            const data = await api.vfTv2Axios.get(`/completed/${service_srl_no}/about`);
            const grandTotal = data?.bills?.reduce((acc, curr) => acc + (curr?.grand_total || 0), 0)
            const paid = data?.bills?.reduce((acc, curr) => acc + (curr?.paid_amount || 0), 0)

            return {
                ...data,
                bill_summery: {
                    grand_total: grandTotal,
                    paid: paid
                }
            }
        },
        staleTime: 60_000
    })


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
                        onClick={() => navigate(`/tech/completed/service-job/${service_srl_no}`)} />
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
                                    { icon: <TbDownload />, label: "Bill", onClick: () => downloadServiceBill(service_srl_no) },
                                    {
                                        icon: <TbDownload />, label: "Receipt", disabled: data?.bill_summery?.paid > 0 ? false : true,
                                        onClick: () => downloadServiceReceipt(data?.bills?.[0]?.bill_no || '')
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
                        </div>
                    </div>
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