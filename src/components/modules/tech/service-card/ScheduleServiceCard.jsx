import React from 'react'
import './schedule-service-card.scss'
import { TbBrandWhatsapp, TbPhone, TbPhonePlus } from 'react-icons/tb'
import Badge from '../../../UI_Primitives/badge/Badge'
import { convertIsoToAmPm } from '../../../../utils/helpers/date-helpers'
import { useNavigate } from 'react-router-dom'

const ScheduleServiceCard = ({ data, pickup = false }) => {
    const navigate = useNavigate();

    const handleCallClick = (e, number) => {
        e.stopPropagation();
        window.open(`tel:${number}`);
    };

    const handleWhatsappClick = (e, number) => {
        e.stopPropagation();
        window.open(`https://wa.me/${number}`);
    };

    const navigateTo = () => {

        let url = `/tech/schedules/${data?.customer?.[0]}/${data?.registration_id}`
        navigate(url)
    }


    return (
        <div className={`schedule-service-card-border 
            ${data?.priority === 2 ? 'warning-border' : data?.priority === 3 ? 'danger-border' : ''}`} onClick={navigateTo}>
            <div className="s-one">
                <div className="name-section">
                    <h3>{data?.customer?.[1] || '______'}</h3>
                    <h5>ID : {data?.customer?.[0] || '____'}</h5>
                </div>
                {pickup
                    ? <div className='badge-section'>
                        <Badge value={'Pickup'} severity={'success'} />
                    </div>
                    : <div className="date-section">
                        <p>Schedule time</p>
                        <p>{convertIsoToAmPm(new Date(data?.schedule_slot?.slot_start_time))} to {convertIsoToAmPm(new Date(data?.schedule_slot?.slot_end_time))}</p>
                    </div>}
            </div>
            <div className="s-two">
                <div className="text">
                    <p>{data?.address?.[0]}, {data?.address?.[1]}, P.O {data?.address?.[2]}, {data?.address?.[3]} City</p>
                </div>
                <div className="contacts">
                    <div className="icons">
                        {data?.contacts?.[0]?.length > 4
                            ? <span title='Primary number' onClick={(e) => handleCallClick(e, data?.contacts?.[0])} >
                                <TbPhone />
                            </span> : ''}
                        {data?.contacts?.[3]?.length > 4
                            ? <span title='Additional number' onClick={(e) => handleCallClick(e, data?.contacts?.[3])} >
                                <TbPhonePlus />
                            </span> : ''}
                        {data?.contacts?.[2]?.length > 4
                            ? <span title='Whatsapp number' onClick={(e) => handleWhatsappClick(e, data?.contacts?.[2])} >
                                <TbBrandWhatsapp />
                            </span> : ''}
                    </div>
                </div>
            </div>
            <div className="s-three">
                <div className="left">
                    <Badge value={data?.service_type} />
                    {data?.total_service_forms > 1 && <Badge value={'Revisit'} severity={'warning'} />}
                </div>
                <div className="right">
                    <p>{data?.registration_id}</p>
                </div>
            </div>
        </div>
    )
}

export default ScheduleServiceCard