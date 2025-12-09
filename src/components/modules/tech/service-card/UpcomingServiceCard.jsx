import React from 'react'
import './upcoming-service-card.scss'
import { TbBrandWhatsapp, TbPhone, TbPhonePlus } from 'react-icons/tb'
import Badge from '../../../UI_Primitives/badge/Badge'
import { isoToDDMonYYYY } from '../../../../utils/helpers/date-helpers'
import { useNavigate, useSearchParams } from 'react-router-dom'

const UpcomingServiceCard = ({ data }) => {
    const navigate = useNavigate();
    const today = new Date();
    const [searchParams, setSearchParams] = useSearchParams();
    const target = new Date(data?.expire_date || data?.service_date);
    const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
    const severity = diff <= 10 ? "danger" : diff <= 20 ? "warning" : null;
    const text = diff < 0 ? `${Math.abs(diff)} Days Ago` : diff === 0 ? "Today" : null;


    const handleCallClick = (e, number) => {
        e.stopPropagation();
        window.open(`tel:${number}`);
    };

    const handleWhatsappClick = (e, number) => {
        e.stopPropagation();
        window.open(`https://wa.me/${number}`);
    };

    const navigateTo = () => {
        let url = `/tech/services/${searchParams.get('tab')?.toLowerCase() || 'complaints'}/${data?.customer?.[0]}`

        if (data?.registration?.[0]) {
            url = `${url}?reg_id=${data?.registration?.[1]}`
        }

        navigate(url)
    }


    return (
        <div className={`upcoming-service-card-border 
        ${data?.registration?.[3] === 2 ? 'warning-border' : data?.registration?.[3] === 3 ? 'danger-border' : ''}
        `} onClick={navigateTo}>
            <div className="s-one">
                <div className="name-section">
                    <h3>{data?.customer?.[1] || '______'}</h3>
                    <h5>ID : {data?.customer?.[0] || '____'}</h5>
                </div>
                <div className="date-section">
                    {data?.registration?.[0]
                        ? <>
                            <p>Register date</p>
                            <p>{isoToDDMonYYYY(new Date(data?.registration?.[2]))}</p>
                        </>
                        : data?.expire_date ? <>
                            <p>Renewal date</p>
                            <p>{isoToDDMonYYYY(new Date(data?.expire_date))}</p>
                        </>
                            : <>
                                <p>Service date</p>
                                <p>{isoToDDMonYYYY(new Date(data?.service_date))}</p>
                            </>}
                </div>
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
                        {data?.contacts?.[2]?.length > 4
                            ? <span title='Additional number' onClick={(e) => handleCallClick(e, data?.contacts?.[2])} >
                                <TbPhonePlus />
                            </span> : ''}
                        {data?.contacts?.[1]?.length > 4
                            ? <span title='Whatsapp number' onClick={(e) => handleWhatsappClick(e, data?.contacts?.[1])} >
                                <TbBrandWhatsapp />
                            </span> : ''}
                    </div>
                </div>
            </div>
            <div className="s-three">
                <div className="left">
                    {data?.total_products > 0 ? <Badge value={`V - ${data?.total_products} `} severity={'info'} /> : ''}
                    {data?.total_add_ons > 0 ? <Badge value={`A - ${data?.total_add_ons} `} severity={'info'} /> : ''}
                    {data?.registration?.[0] && <Badge value={'Registered'} severity={'success'} />}
                </div>
                <div className="right">
                    {data?.product_packages?.map((p) => <Badge value={p} />)}
                    {text && <Badge value={text} severity={severity} />}
                </div>
            </div>
        </div>
    )
}

export default UpcomingServiceCard