import React from 'react'
import './registration-info.scss'
import Badge from '../../../UI_Primitives/badge/Badge'
import { convertIsoToAmPm, isoToDDMonYYYY } from '../../../../utils/helpers/date-helpers'
import { toStandardText } from '../../../../utils/helpers/text-formatting'
import { reg_priority } from '../../../../assets/javascript/pre_data/package'
import { SERVICE_REG_STATUS_LIST, SERVICE_VISIT_STATUS_LIST } from '../../../../assets/javascript/pre_data/service'


const RegistrationInfo = ({ data }) => {

    return (
        <div>
            <div className="registration-info-container">
                <h3 className='sub-title'>Registration Info</h3>
                <div className="reg-content">
                    <div className="list">
                        <div className="item">
                            <p className='label'>Reg Number</p>
                            <div>
                                <p className='text-value'>{data?.registration_id}</p>
                            </div>
                        </div>
                        <div className="item">
                            <p className='label'>Reg Date & Time</p>
                            <div>
                                <p className='text-value'>{isoToDDMonYYYY(data?.registered_at)}, {convertIsoToAmPm(data?.registered_at)}</p>
                            </div>
                        </div>
                        <div className="item">
                            <p className='label'>Reg By & Method</p>
                            <div>
                                {data?.reg_by?.type === 'CUSTOMER'
                                    ? <p className='text-value'>Customer By {toStandardText(data?.about?.reg_method)}</p>
                                    : <p className='text-value'>{data?.reg_by?.user_name} By {toStandardText(data?.about?.reg_method)}</p>}
                            </div>
                        </div>
                        <div className="item">
                            <p className='label'>Service Type & Priority</p>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <p className='text-value'>{toStandardText(data?.about?.service_type)}</p>
                                {data?.about?.priority ? <Badge value={reg_priority[data?.about?.priority][0]} severity={reg_priority[data?.about?.priority][1]} /> : ''}
                            </div>
                        </div>
                        <div className="item span-item">
                            <p className='label'>{data?.about?.service_type === 'COMPLAINT' ? 'Complaint Category' : 'Comment'}</p>
                            <div>
                                {data?.about?.complaint_category?.length > 0
                                    ? <p className='text-value'>{data?.about?.complaint_category?.map(c => `${c}, `)}</p>
                                    : ''}
                                <p className='text-value'>{data?.about?.comment || 'No Comment'}</p>
                            </div>
                        </div>
                        <div className="item">
                            <p className='label'>Additional Number</p>
                            <div>
                                <p className='text-value'>{data?.customer?.additional_number?.number ?
                                    `${data?.customer?.additional_number?.country_code} ${data?.customer?.additional_number?.number}`
                                    : "No Additional Number"}</p>
                            </div>
                        </div>
                        <div className="item">
                            <p className='label'>Status</p>
                            <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                                <Badge value={data?.status?.status_text} style={{
                                    backgroundColor: SERVICE_REG_STATUS_LIST.find(s => s.key === data?.status?.status)?.bg,
                                    color: SERVICE_REG_STATUS_LIST.find(s => s.key === data?.status?.status)?.text
                                }} />
                                {data?.about?.is_under_rnd && <Badge value={'RND'} severity={'warning'} />}
                                {data?.status?.is_self_close && <Badge value={'Self Close'} severity={'success'} />}

                                <Badge value={`Total ${data?.status?.total_visits} Visit(s)`} severity={'secondary'} />
                            </div>
                        </div>
                        <div className="item">
                            <p className='label'>Current Technician</p>
                            <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                                <p className='text-value'>{data?.technician?.worker_name || 'No Assigned'}</p>
                            </div>
                        </div>
                        {data?.slot?.start_time && <div className="item">
                            <p className='label'>Slot</p>
                            <div>
                                <p className='text-value'>{isoToDDMonYYYY(new Date(data?.slot?.start_time))}, {convertIsoToAmPm(data?.slot?.start_time)} to {convertIsoToAmPm(data?.slot?.end_time)}</p>
                            </div>
                        </div>}
                        {data?.status?.is_self_close && <div className="item">
                            <p className='label'>Self Close</p>
                            <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                                <p className='text-value'>{data?.status?.self_close_reason || 'Not available'}</p>
                            </div>
                        </div>}
                        {data?.status?.status === 5 ? <div className="item">
                            <p className='label'>Closed Date</p>
                            <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                                <p className='text-value'>{isoToDDMonYYYY(data?.status?.status_at)}, {convertIsoToAmPm(data?.status?.status_at)}</p>
                            </div>
                        </div> : ""}
                        {data?.status?.status === 6 ? <div className="item" >
                            <p className='label'>Cancellation</p>
                            <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                                {data?.cancellation?.is_customer_cancelled && <Badge value={'Customer Cancelled'} severity={'danger'} />}
                                <p className='text-value'>{data?.cancellation?.comment || 'No Reason'}</p>
                            </div>
                        </div> : ""}
                        {data?.status?.status === 5 && <div className="item">
                            <p className='label'>Turnaround Time (TAT)</p>
                            <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                                <p className='text-value'>{data?.tat?.day || 0} Days  ({data?.tat?.hour} Hours {data?.tat?.minute} Minutes)</p>
                            </div>
                        </div>}
                    </div>
                </div>
            </div>

            {/* This is a temp visit info setup. this update feature versions. */}
            {data?.last_visit?.visit_status && <div className="registration-info-container">
                <h3 className='sub-title'>Last Visit Info</h3>
                <div className="reg-content">
                    <div className="list">
                        {data?.last_visit?.pickup_work_at && <div className="item">
                            <p className='label'>Travel Started Time</p>
                            <div>
                                <p className='text-value'>{isoToDDMonYYYY(new Date(data?.last_visit?.pickup_work_at))}, {convertIsoToAmPm(new Date(data?.last_visit?.pickup_work_at))}</p>
                            </div>
                        </div>}
                        {data?.last_visit?.visit_status && <div className="item">
                            <p className='label'>Visit Status</p>
                            <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                                <Badge value={data?.last_visit?.visit_status_text} style={{
                                    backgroundColor: SERVICE_VISIT_STATUS_LIST.find(s => s.key === data?.last_visit?.visit_status)?.bg,
                                    color: SERVICE_VISIT_STATUS_LIST.find(s => s.key === data?.last_visit?.visit_status)?.text
                                }} />
                                {data?.last_visit?.service_srl_no && <p className='text-value'>{data?.last_visit?.service_srl_no}</p>}
                            </div>
                        </div>}
                        {data?.last_visit?.service_start_at && <div className="item">
                            <p className='label'>Service Time</p>
                            <div>
                                <p className='text-value'>{isoToDDMonYYYY(new Date(data?.last_visit?.service_start_at))}, {convertIsoToAmPm(new Date(data?.last_visit?.service_start_at))} to {convertIsoToAmPm(new Date(data?.last_visit?.service_finish_at)) || 'Running...'} </p>
                            </div>
                        </div>}
                    </div>
                </div>
            </div>}

        </div>
    )
}

export default RegistrationInfo