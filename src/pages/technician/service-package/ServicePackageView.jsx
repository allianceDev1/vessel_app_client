import React, { useEffect, useState } from 'react'
import '../customer-view/customer-view.scss'
import { useDispatch } from 'react-redux'
import { page } from '../../../redux/features/non_persisted/miniSystemSlice';
import { TbDropletBolt, TbPlayCard4 } from 'react-icons/tb';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';


const ServicePackageView = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();
    const [activeSegment, setActiveSegment] = useState('');
    const { serial_number } = useParams();

    const navigateSubMenu = (url) => {
        navigate(url)
    }

    useEffect(() => {
        dispatch(page.setTitle({ title: serial_number, note: "Service Package View" }))
        // eslint-disable-next-line
    }, [])

    useEffect(() => {
        const segments = location?.pathname?.split('/').filter(Boolean)

        setActiveSegment(segments.at(-1))
    }, [location?.pathname])

    return (
        <div className="tech-customer-view-container">
            <div className="menu-box">
                <div className="slide-menus">
                    <div className={`menu-item ${(activeSegment === 'about' || !activeSegment) && 'active'}`} onClick={() => navigateSubMenu(`/tech/customer/product/package/${serial_number}/about`)}>
                        <TbDropletBolt />
                        <p>About</p>
                    </div>
                    <div className={`menu-item ${(activeSegment === 'services') && 'active'}`} onClick={() => navigateSubMenu(`/tech/customer/product/package/${serial_number}/services`)}>
                        <TbPlayCard4 />
                        <p>Services</p>
                    </div>
                </div>
            </div>
            <div className="customer-content">
                <Outlet />
            </div>
        </div>
    )
}

export default ServicePackageView