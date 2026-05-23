import React, { useEffect, useState } from 'react'
import './customer-view.scss'
import { useDispatch } from 'react-redux'
import { modal, page } from '../../../redux/features/non_persisted/miniSystemSlice';
import { TbManualGearbox, TbMessage, TbMessagePlus, TbMoodSpark } from 'react-icons/tb';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import Button from '../../../components/UI_Primitives/buttons/Button';
import AddCallLog from '../../../components/forms/common/add-call-log/AddCallLog';


const CustomerView = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();
    const [activeSegment, setActiveSegment] = useState('');
    const { customer_id } = useParams();

    const navigateSubMenu = (url) => {
        navigate(url)
    }

    const openEnterCallLogPopUp = ({ customer_id }) => {
        dispatch(modal.push({
            show: true, title: "Enter Call Log",
            body: <AddCallLog customerId={customer_id} setCallLogs={() => { }} />
        }))
    }

    useEffect(() => {
        dispatch(page.setTitle({ title: `Customer Id : ${customer_id}`, note: "Customer View" }))
        // eslint-disable-next-line
    }, [])

    useEffect(() => {
        const segments = location?.pathname?.split('/').filter(Boolean)
        const lastSegment = ['about', 'products', 'call-logs'].includes((segments.at(-1) || ''))
            ? segments.at(-1) || '' : null

        setActiveSegment(lastSegment)
    }, [location?.pathname])

    return (
        <div className="tech-customer-view-container">
            <div className="menu-box">
                <div className="slide-menus">
                    <div className={`menu-item ${(activeSegment === 'about' || !activeSegment) && 'active'}`} onClick={() => navigateSubMenu(`/tech/customer/${customer_id}/about`)}>
                        <TbMoodSpark />
                        <p>About</p>
                    </div>
                    <div className={`menu-item ${(activeSegment === 'products') && 'active'}`} onClick={() => navigateSubMenu(`/tech/customer/${customer_id}/products`)}>
                        <TbManualGearbox />
                        <p>Products</p>
                    </div>
                    <div className={`menu-item ${(activeSegment === 'call-logs') && 'active'}`} onClick={() => navigateSubMenu(`/tech/customer/${customer_id}/call-logs`)}>
                        <TbMessage />
                        <p>Call Logs</p>
                    </div>

                </div>
            </div>
            <div className="customer-content">
                <Outlet />
            </div>
            <div className="fixed-section">
                <Button icon={<TbMessagePlus />} size='large'  rounded
                    onClick={() => openEnterCallLogPopUp({ customer_id })} />
            </div>
        </div>
    )
}

export default CustomerView