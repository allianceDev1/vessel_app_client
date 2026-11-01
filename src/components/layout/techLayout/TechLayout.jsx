import React, { useEffect, useState } from 'react'
import './techLayout.scss';
import BrandLogo from '../../../assets/images/icons/alliance-logo.png';
import env from '../../../config/env';
import Cookies from 'js-cookie';
import { RxDashboard } from "react-icons/rx";
import { useLocation, useNavigate } from 'react-router-dom';
import { TbCalendarWeek, TbDropletCheck, TbDropletHalf2, TbHome } from 'react-icons/tb';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import SkeletonPage from '../../UI_Primitives/skeleton/SkeletonPage';
import { IconBrightnessFilled, IconMoon, IconSun } from '@tabler/icons-react';
import { changeThemeColor } from '../../../redux/features/persisted/systemSlice';

const TechLayout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [activeSegment, setActiveSegment] = useState('')
    const [isNavigating, setIsNavigating] = useState(false);
    const { page } = useSelector((state) => state.miniSystem)
    const {  theme } = useSelector((state) => state.system)

    // ── Theme toggle — cycles: os-default → dark → light → os-default ──────────
    const handleThemeToggle = () => {
        const cycle = { 'os-default': 'dark', 'dark': 'light', 'light': 'os-default' }
        const next = cycle[theme] ?? 'os-default'
        Cookies.set('color_mode', next, { expires: 365 })
        dispatch(changeThemeColor(next))
    }

    // Derive button icon + tooltip from current theme
    const themeIcon = theme === 'dark'
        ? <IconSun size={18} />
        : theme === 'light'
            ? <IconBrightnessFilled size={18} />
            : <IconMoon size={18} />   // os-default

    const themeLabel = theme === 'dark'
        ? 'Dark mode — click for Light'
        : theme === 'light'
            ? 'Light mode — click for OS default'
            : 'OS default — click for Dark'


    useEffect(() => {
        const firstSegment = location?.pathname?.split("/")[2] || ''
        setActiveSegment(firstSegment)
    }, [location?.pathname])

    useEffect(() => {
        setIsNavigating(true);
        const timer = setTimeout(() => setIsNavigating(false), 0);
        return () => clearTimeout(timer);
    }, [location.pathname, location.search]);

    return (
        <div className="technician-layout">

            <div className="layout-header">
                <div className="section-one">
                    <img src={BrandLogo} alt='brand-logo' />
                    <h3>Service</h3>
                </div>
                <div className="section-two">
                    <div className="navigate-button" title={themeLabel} onClick={handleThemeToggle}>
                        {themeIcon}
                    </div>
                    <div className="navigate-button" title='Home Software' onClick={() => window.location.href = (`${env.REDIRECT_URL}?page=home`)}>
                        <RxDashboard />
                    </div>
                </div>
            </div>
            <div className="layout-body">
                <div className="body-container">
                    {(page?.title || page.note) && <div className="body-title">
                        {page?.title && <h3>{page?.title}</h3>}
                        {page.note && <p>{page.note}</p>}
                    </div>}
                    {isNavigating ? <SkeletonPage /> : children}
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
