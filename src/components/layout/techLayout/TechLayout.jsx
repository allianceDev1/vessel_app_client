import React, { useEffect, useState } from 'react'
import './techLayout.scss';
import BrandLogo from '../../../assets/images/icons/alliance-logo.png';
import env from '../../../config/env';
import { IoChevronBack } from "react-icons/io5";
import { RxDashboard } from "react-icons/rx";
import { useLocation, useNavigate } from 'react-router-dom';
import { TbCalendarWeek, TbDropletCheck, TbDropletHalf2, TbHome } from 'react-icons/tb';
import { useSelector } from 'react-redux';
import moment from 'moment';

const TechLayout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeSegment, setActiveSegment] = useState('')
    const { pageTitle } = useSelector((state) => state.miniSystem)


    useEffect(() => {
        const firstSegment = location?.pathname?.split("/")[2] || ''
        setActiveSegment(firstSegment)
    }, [location?.pathname])

    return (
        <div className="technician-layout">
            <div className="color-temp-div">
                <div className="box box-one"></div>
                <div className="box box-two"></div>
                <div className="box box-three"></div>
                <div className="box box-four"></div>
            </div>

            <div className="layout-header">
                <div className="section-one">
                    <IoChevronBack onClick={() => navigate(-1)} />
                    <img src={BrandLogo} alt='brand-logo' onClick={() => navigate(-1)} />
                    <h3>Alliance</h3>
                </div>
                <div className="section-two">
                    <div className="navigate-button" title='Home Software' onClick={() => window.location.href = (`${env.REDIRECT_URL}?page=home`)}>
                        <RxDashboard />
                    </div>
                </div>
            </div>
            <div className="layout-body">
                <div className="body-container">
                    {(pageTitle?.title || pageTitle.note) && <div className="body-title">
                        {pageTitle?.title && <h3>{pageTitle?.title}</h3>}
                        {pageTitle.note && <p>{pageTitle.note}</p>}
                    </div>}
                    {children}
                </div>
            </div>
            <div className="layout-menu">
                <div className="menu-items">
                    <div className={`item ${!activeSegment && 'active'}`} onClick={() => navigate('/tech')}>
                        <TbHome />
                        <p>Home</p>
                    </div>
                    <div className={`item ${activeSegment === 'services' && 'active'}`} onClick={() => navigate('/tech/services')}>
                        <TbDropletHalf2 />
                        <p>Services</p>
                    </div>
                    <div className={`item ${activeSegment === 'schedules' && 'active'}`} onClick={() => navigate('/tech/schedules')}>
                        <TbCalendarWeek />
                        <p>Schedules</p>
                    </div>
                    <div className={`item ${activeSegment === 'completed' && 'active'}`} onClick={() => navigate(`/tech/completed?fl=Yes&from_date=${moment().format('YYYY-MM-DD')}&end_date=${moment().format('YYYY-MM-DD')}`)}>
                        <TbDropletCheck />
                        <p>Completed</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TechLayout
