import React, { useEffect, useState } from 'react'
import './customer-product-view.scss'
import { useDispatch } from 'react-redux'
import { page } from '../../../redux/features/non_persisted/miniSystemSlice';
import { TbCircleCheck, TbDropletBolt, TbDropletStar, TbPlayCard4, TbSquareLetterS } from 'react-icons/tb';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';


const CustomerProductView = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();
    const [activeSegment, setActiveSegment] = useState('');
    const { customer_id, product_id } = useParams();

    const navigateSubMenu = (url) => {
        navigate(url)
    }

    useEffect(() => {
        dispatch(page.setTitle({ title: product_id, note: "Customer Product View" }))
        // eslint-disable-next-line
    }, [])

    useEffect(() => {
        const segments = location?.pathname?.split('/').filter(Boolean)
        const lastSegment = ['about', 'spares', 'eligibility', 'service-cards', 'package-history'].includes((segments.at(-1) || ''))
            ? segments.at(-1) || '' : null

        setActiveSegment(lastSegment)
    }, [location?.pathname])

    return (
        <div className="customer-product-view-controller-container">
            <div className="menu-box">
                <div className="slide-menus">
                    <div className={`menu-item ${(activeSegment === 'about' || !activeSegment) && 'active'}`} onClick={() => navigateSubMenu(`/controller/customer/${customer_id}/product/${product_id}/about`)}>
                        <TbDropletStar />
                        <p>Product</p>
                    </div>
                    <div className={`menu-item ${(activeSegment === 'spares') && 'active'}`} onClick={() => navigateSubMenu(`/controller/customer/${customer_id}/product/${product_id}/spares`)}>
                        <TbSquareLetterS />
                        <p>spares</p>
                    </div>
                    <div className={`menu-item ${(activeSegment === 'eligibility') && 'active'}`} onClick={() => navigateSubMenu(`/controller/customer/${customer_id}/product/${product_id}/eligibility`)}>
                        <TbCircleCheck />
                        <p>Eligibility</p>
                    </div>
                    <div className={`menu-item ${(activeSegment === 'service-cards') && 'active'}`} onClick={() => navigateSubMenu(`/controller/customer/${customer_id}/product/${product_id}/service-cards`)}>
                        <TbPlayCard4 />
                        <p>Service Cards</p>
                    </div>
                    <div className={`menu-item ${(activeSegment === 'package-history') && 'active'}`} onClick={() => navigateSubMenu(`/controller/customer/${customer_id}/product/${product_id}/package-history`)}>
                        <TbDropletBolt />
                        <p>Package History</p>
                    </div>
                </div>
            </div>
            <div className="customer-content">
                <Outlet />
            </div>
        </div>
    )
}

export default CustomerProductView