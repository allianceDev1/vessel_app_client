import React, { useEffect, useState } from 'react'
import './controllerLayout.scss';
import BrandLogo from '../../../assets/images/icons/alliance-logo.png';
import { TbHome, TbLayoutSidebarLeftCollapse, TbLayoutSidebarLeftExpand } from 'react-icons/tb';
import { useLocation } from 'react-router-dom';

const ControllerLayout = ({ children }) => {
    const location = useLocation();
    const [activeSegment, setActiveSegment] = useState('');
    const [navbarShow, setNavbarShow] = useState(false)

    useEffect(() => {
        const firstSegment = location?.pathname?.split("/")[2] || ''
        setActiveSegment(firstSegment)
    }, [location?.pathname])


    return (
        <div className={`controller-layout${navbarShow ? ' show-navbar' : ''}`}>
            <div className="color-temp-div">
                <div className="box box-one"></div>
                <div className="box box-two"></div>
                <div className="box box-three"></div>
                <div className="box box-four"></div>
            </div>

            <div className="layout-body">
                <div className="body-container">
                    <div className="header">
                        <div className="title-section">
                            <h3>Page Title</h3>
                            <p>Page Description</p>
                        </div>
                        <div className="nav-icon-section">
                            {navbarShow
                                ? <TbLayoutSidebarLeftCollapse onClick={() => setNavbarShow(!navbarShow)} />
                                : <TbLayoutSidebarLeftExpand onClick={() => setNavbarShow(!navbarShow)} />}
                        </div>
                    </div>
                    {children}
                </div>
            </div>
            <div className="layout-navbar">
                <div className="nav-sections">
                    <div className="title-section">
                        <div className="brand-logo">
                            <img src={BrandLogo} alt='brand-logo' />
                        </div>
                        <div className='head-text'>
                            <h3>Alliance</h3>
                            <p>Vessel Controller App</p>
                        </div>
                    </div>
                    <div className="items-section">
                        <div className={`item ${!activeSegment && 'active'}`}>
                            <TbHome />
                            <span>Home</span>
                        </div>
                        <div className={`item ${activeSegment === 'a' && 'active'}`}>
                            <TbHome />
                            <span>Home</span>
                        </div>
                        <div className={`item ${activeSegment === 'a' && 'active'}`}>
                            <TbHome />
                            <span>Home</span>
                        </div>
                    </div>
                    <div className="footer-section">
                        <div className="profile">
                            <div className="profile-image">
                                <img src={BrandLogo} alt='profile-image' />
                            </div>
                            <div className="profile-name">
                                <h4>Controller Name</h4>
                                <p>Designation</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ControllerLayout