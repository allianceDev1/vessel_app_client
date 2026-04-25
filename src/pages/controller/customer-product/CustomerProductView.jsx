import React, { useEffect, useState } from 'react'
import './customer-product-view.scss'
import moment from "moment"
import { useDispatch } from 'react-redux'
import { modal, page } from '../../../redux/features/non_persisted/miniSystemSlice';
import { TbArrowUpRight, TbCircleCheck, TbDropletBolt, TbDropletStar, TbManualGearbox, TbMessage, TbMessagePlus, TbMoodSpark, TbPencilPlus, TbPlayCard4, TbPlus, TbReport, TbSquareLetterS } from 'react-icons/tb';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import Button from '../../../components/UI_Primitives/buttons/Button';
import Badge from '../../../components/UI_Primitives/badge/Badge';

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
        const lastSegment = ['about', 'spares', 'eligibility', 'service-cards'].includes((segments.at(-1) || ''))
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
                    <div className={`menu-item ${(activeSegment === 's-cards') && 'active'}`}
                        onClick={() => navigate(`/controller/completed?fl=Yes&from_date=${moment().subtract(3, "months").format("YYYY-MM-DD")}&end_date=${moment().format("YYYY-MM-DD")}&customer_id=${customer_id}`)}>
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