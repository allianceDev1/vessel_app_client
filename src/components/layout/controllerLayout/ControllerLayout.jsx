import React, { useEffect, useRef, useState } from 'react'
import './controllerLayout.scss';
import BrandLogo from '../../../assets/images/icons/alliance-logo.png';
import { TbDropletCog, TbFilePhone, TbHome, TbLayoutSidebarLeftCollapse, TbLayoutSidebarLeftExpand, TbLogout2, TbMap2, TbMoodSpark, TbReport } from 'react-icons/tb';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getUserProfileImagePath } from '../../../utils/helpers/image-helpers';

const ControllerLayout = ({ children }) => {
    const navigate = useNavigate()
    const location = useLocation();
    const navbarRef = useRef(null);
    const [activeSegment, setActiveSegment] = useState('');
    const [navbarShow, setNavbarShow] = useState(false)
    const { pageTitle } = useSelector((state) => state.miniSystem)
    const { user } = useSelector((state) => state.user)
    const userProfileImage = getUserProfileImagePath(user?.first_name);

    const handleMenuClick = (path) => {
        navigate(path);
        setNavbarShow(false);
    }


    useEffect(() => {
        const firstSegment = location?.pathname?.split("/")[2] || ''
        setActiveSegment(firstSegment)
    }, [location?.pathname])

    // Outside click close (only when visible)
    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (navbarShow && navbarRef.current && !navbarRef.current.contains(e.target)) {
                setNavbarShow(false);
            }
        };
        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, [navbarShow]);


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
                        {(pageTitle?.title || pageTitle.note) && <div className="title-section">
                            {pageTitle?.title && <h3>{pageTitle?.title}</h3>}
                            {pageTitle.note && <p>{pageTitle.note}</p>}
                        </div>}

                        {navbarShow
                            ? <div className="nav-icon-section" onClick={() => setNavbarShow(false)}>
                                <TbLayoutSidebarLeftCollapse />
                            </div>
                            : <div className="nav-icon-section" onClick={() => setNavbarShow(true)} >
                                <TbLayoutSidebarLeftExpand />
                            </div>}
                    </div>
                    {children}
                </div>
            </div>
            <div className="layout-navbar" ref={navbarRef}>
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
                        <div className={`item ${!activeSegment && 'active'}`} onClick={() => handleMenuClick('/controller')}>
                            <TbHome />
                            <span>Home</span>
                        </div>
                        {user?.allowed_origins?.some(access => ['vfcr_areas_read', 'vfcr_areas_write'].includes(access)) &&
                            <div className={`item ${activeSegment === 'area-list' && 'active'}`} onClick={() => handleMenuClick('/controller/area-list')}>
                                <TbMap2 />
                                <span>Area list</span>
                            </div>}

                        <div className={`item ${activeSegment === 'customers' && 'active'}`} onClick={() => handleMenuClick('/controller/customers')}>
                            <TbMoodSpark />
                            <span>Customers</span>
                        </div>
                        <div className={`item ${activeSegment === 'csr-list' && 'active'}`} onClick={() => handleMenuClick('/controller/csr-list')}>
                            <TbFilePhone />
                            <span>CSR list</span>
                        </div>
                        <div className={`item ${activeSegment === 'dar-list' && 'active'}`} onClick={() => handleMenuClick('/controller/dar-list')}>
                            <TbReport />
                            <span>DAR list</span>
                        </div>
                        {user?.allowed_origins?.includes('vfcr_appConfig_write') &&
                            <div className={`item ${activeSegment === 'app-config' && 'active'}`} onClick={() => handleMenuClick('/controller/app-config')}>
                                <TbDropletCog />
                                <span>App Configuration</span>
                            </div>}
                        <div className={`item danger`} onClick={() => window.location.href = 'http://localhost:3000?page=home'}>
                            <TbLogout2 />
                            <span>Exit</span>
                        </div>
                    </div>
                    <div className="footer-section">
                        <div className="profile">
                            <div className="profile-image">
                                <img src={userProfileImage || BrandLogo} alt='profile-image' />
                            </div>
                            <div className="profile-name">
                                <h4>{user?.first_name} {user?.last_name}</h4>
                                <p>{user?.designation}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ControllerLayout