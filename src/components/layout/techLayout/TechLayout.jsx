import React, { useEffect, useState } from 'react'
import './techLayout.scss';
import BrandLogo from '../../../assets/images/icons/alliance-logo.png';
import { IoChevronBack } from "react-icons/io5";
import { RxDashboard } from "react-icons/rx";
import { useLocation } from 'react-router-dom';
import { TbHome } from 'react-icons/tb';
import { useSelector } from 'react-redux';

const TechLayout = ({ children }) => {
    const location = useLocation();
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
                    <IoChevronBack />
                    <img src={BrandLogo} alt='brand-logo' />
                    <h3>Alliance</h3>
                </div>
                <div className="section-two">
                    <div className="navigate-button" title='Home Software' onClick={() => window.location.href = ('http://localhost:3000/')}>
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
                    <div className={`item ${!activeSegment && 'active'}`}>
                        <TbHome />
                        <p>Home</p>
                    </div>
                    <div className={`item ${activeSegment === 'a' && 'active'}`}>
                        <TbHome />
                        <p>Home</p>
                    </div>
                    <div className={`item ${!activeSegment === 'a' && 'active'}`}>
                        <TbHome />
                        <p>Home</p>
                    </div>
                    <div className={`item ${!activeSegment === 'a' && 'active'}`}>
                        <TbHome />
                        <p>Home</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TechLayout
