import React, { useEffect, useRef, useState } from 'react'
import './controllerLayout.scss';
import BrandLogo from '../../../assets/images/icons/alliance-logo.png';
import {
    IconBell,
    IconChevronDown,
    IconBrightnessFilled,
    IconHome,
    IconLogout2,
    IconMenu2,
    IconMoon,
    IconPointFilled,
    IconSun,
    IconMoodSpark,
    IconWorldMap,
    IconCurrentLocation,
    IconClockStar,
    IconPaperclip,
    IconClipboardText,
    IconCrown,
    IconDropletCog,
} from '@tabler/icons-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Cookies from 'js-cookie';
import { getUserProfileImagePath } from '../../../utils/helpers/image-helpers';
import { changeThemeColor } from '../../../redux/features/persisted/systemSlice';
import env from '../../../config/env';


// Sidebar menus
const MENU_ITEMS = [
    { key: "home", title: "Home", icon: <IconHome />, url: '/controller/home', hide: false },
    // { key: "map", title: "Live map", icon: <IconCurrentLocation />, url: '/controller/map', hide: false },
    { key: "area-list", title: "Aria list", icon: <IconWorldMap />, url: '/controller/area-list', hide: false },
    { key: "customers", title: "Customers", icon: <IconMoodSpark />, url: '/controller/customers', hide: false },
    { key: "upcoming", title: "Upcoming", icon: <IconClockStar />, url: '/controller/upcoming?view_type=product&parent_type=ALL', hide: false },
    { key: "registered", title: "Registered", icon: <IconPaperclip />, url: '/controller/registered', hide: false },
    { key: "completed", title: "Completed", icon: <IconClipboardText />, url: '/controller/completed', hide: false },
    { key: "subscriptions", title: "Subscriptions", icon: <IconCrown />, url: '/controller/subscriptions', hide: false },
    { key: "app-config", title: "App config", icon: <IconDropletCog />, url: '/controller/app-config', hide: false }
]


const ControllerLayout = ({ children }) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const location = useLocation()
    const navbarRef = useRef(null)

    const [activeSegment, setActiveSegment] = useState('')
    const [navbarShow, setNavbarShow] = useState(false)
    const [openSubmenu, setOpenSubmenu] = useState(null)

    const { page } = useSelector((state) => state.miniSystem)
    const { user } = useSelector((state) => state.user)
    const { internet, theme } = useSelector((state) => state.system)
    const userProfileImage = getUserProfileImagePath(user?.first_name)

    // ── Navigation helpers ───────────────────────────────────────────────────
    const handleMenuClick = (path) => {
        navigate(path)
        setNavbarShow(false)
        setOpenSubmenu(null)
    }

    const handleSubmenuToggle = (name) => {
        setOpenSubmenu(prev => prev === name ? null : name)
    }

    const isActive = (path) =>
        location.pathname === path || location.pathname.startsWith(path + '/')


    // ── Theme toggle — cycles: os-default → dark → light → os-default ──────────
    const handleThemeToggle = () => {
        const cycle = { 'os-default': 'dark', 'dark': 'light', 'light': 'os-default' }
        const next = cycle[theme] ?? 'os-default'
        Cookies.set('color_mode', next, {
            expires: 365,
            secure: true,
            sameSite: 'None',
            domain: '.alliancewatersolutions.com',
            path: '/',
        });
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

    // ── Active segment tracking ──────────────────────────────────────────────
    useEffect(() => {
        const parts = location?.pathname?.split('/') || []

        setActiveSegment(parts[2] || '')

    }, [location?.pathname])

    // ── Outside click — close mobile sidebar ─────────────────────────────────
    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (navbarShow && navbarRef.current && !navbarRef.current.contains(e.target)) {
                setNavbarShow(false)
            }
        }
        document.addEventListener('mousedown', handleOutsideClick)
        return () => document.removeEventListener('mousedown', handleOutsideClick)
    }, [navbarShow])



    return (
        <div className={`controller-layout${navbarShow ? ' show-navbar' : ''}`}>

            {/* ── Mobile backdrop ─────────────────────────────────────────── */}
            {navbarShow && (
                <div
                    className="sidebar-backdrop"
                    onClick={() => setNavbarShow(false)}
                />
            )}

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* SIDEBAR                                                        */}
            {/* ══════════════════════════════════════════════════════════════ */}
            <div className="layout-navbar" ref={navbarRef}>
                <div className="nav-sections">

                    {/* ── Brand ─────────────────────────────────────────── */}
                    <div className="title-section">
                        <div className="brand-logo">
                            <img src={BrandLogo} alt="brand-logo" />
                        </div>
                        <div className="head-text">
                            <h3>Service Controller</h3>
                            <p>Controller App</p>
                        </div>
                    </div>

                    {/* ── Menu items ────────────────────────────────────── */}
                    <div className="items-section">

                        {MENU_ITEMS?.map((item) => {
                            const hasSubmenu = item?.subItems?.length ? true : false

                            return (
                                <React.Fragment key={item?.key}>
                                    <div
                                        className={`item ${activeSegment === item?.key ? 'active' : ''}`}
                                        onClick={() => hasSubmenu ? handleSubmenuToggle(item?.key) : handleMenuClick(item?.url)}
                                        title={item?.title}
                                    >
                                        {item?.icon}
                                        <span>{item?.title}</span>
                                        {hasSubmenu && (
                                            <IconChevronDown size={14} className={`submenu-chevron ${openSubmenu === item?.key ? 'open' : ''}`} />
                                        )}
                                    </div>
                                    {hasSubmenu && (
                                        <div className={`sub-items ${openSubmenu === item?.key ? 'open' : ''}`}>
                                            {item?.subItems?.map((subItem) => {
                                                return (
                                                    <div
                                                        key={subItem?.key}
                                                        className={`sub-item ${isActive(subItem?.url) ? 'active' : ''}`}
                                                        onClick={() => subItem?.url ? handleMenuClick(subItem?.url) : ""}
                                                    >
                                                        <IconPointFilled size={18} />
                                                        <span>{subItem?.title}</span>
                                                    </div>
                                                )
                                            })}

                                            <div className="sub-line"></div>
                                        </div>
                                    )}
                                </React.Fragment>
                            )
                        })}
                    </div>

                    {/* ── Profile footer ────────────────────────────────── */}
                    <div className="footer-section">
                        <div className="profile">
                            <div className="profile-image">
                                <img src={userProfileImage || BrandLogo} alt="profile" />
                                <span className={`network-dot ${internet ? 'online' : "offline"}`} />
                            </div>
                            <div className="profile-name">
                                <h4>{user?.first_name} {user?.last_name}</h4>
                                <p>{user?.designation}</p>
                            </div>
                            <div
                                className="profile-action"
                                onClick={() => window.location.href = `${env.REDIRECT_URL}?page=home`}
                                title="Logout"
                            >
                                <IconLogout2 size={15} />
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            {/* ══════════════════════════════════════════════════════════════ */}


            {/* ══════════════════════════════════════════════════════════════ */}
            {/* MAIN CONTENT                                                   */}
            {/* ══════════════════════════════════════════════════════════════ */}
            <div className="layout-body">

                {/* ── Sticky top header ─────────────────────────────────── */}
                <div className="layout-header">
                    <div className="header-left">
                        {/* Mobile hamburger */}
                        <div
                            className="mobile-menu-btn"
                            onClick={() => setNavbarShow(!navbarShow)}
                        >
                            <IconMenu2 size={20} />
                        </div>

                        {/* Page Header / Title */}
                        {(page?.title || page?.head || page?.note) && (
                            <div className="page-header">
                                <div className="page-title-wrap">
                                    {page?.icon && (
                                        <span className="page-title-icon">
                                            {page?.icon}
                                        </span>
                                    )}
                                    {(page?.title || page?.head) && (
                                        <h2 className="page-title">
                                            {page?.title || page?.head}
                                        </h2>
                                    )}
                                </div>
                                {page?.note && (
                                    <p className="page-note">
                                        {page?.note}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="header-right">
                        {/* Theme toggle */}
                        <button
                            className="header-btn theme-btn"
                            onClick={handleThemeToggle}
                            title={themeLabel}
                        >
                            {themeIcon}
                        </button>

                        {/* Notifications */}
                        <div className="header-btn notif-btn" title="Notifications">
                            <IconBell size={18} />
                        </div>
                    </div>
                </div>

                {/* ── Page content ───────────────────────────────────────── */}
                <div className={`body-container ${page?.unsetPageContainer ? 'body-container-unset' : ""}`} >
                    {children}
                </div>

            </div>
            {/* ══════════════════════════════════════════════════════════════ */}

        </div>
    )
}

export default ControllerLayout