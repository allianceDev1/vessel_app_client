import React, { useEffect, useState } from 'react'
import './service-job.scss'
import { useDispatch } from 'react-redux'
import { modal, page } from '../../../redux/features/non_persisted/miniSystemSlice';
import { TbArrowUpRight, TbManualGearbox, TbMessage, TbMessagePlus, TbMoodSpark, TbPencilPlus, TbPlayCard4, TbPlus, TbReport } from 'react-icons/tb';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import Button from '../../../components/UI_Primitives/buttons/Button';
import Badge from '../../../components/UI_Primitives/badge/Badge';
import ServiceRegistration from '../../../components/forms/controller/registration/ServiceRegistration';
import AddCallLog from '../../../components/forms/common/add-call-log/AddCallLog';
import moment from "moment"
import AddCustomerProduct from '../../../components/forms/controller/product/AddCustomerProduct';

const ServiceJob = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();
    const [activeSegment, setActiveSegment] = useState('');
    const { customer_id, service_srl_no } = useParams();

    const navigateSubMenu = (url) => {
        navigate(url)
    }

    useEffect(() => {
        dispatch(page.setTitle({ title: service_srl_no, note: "Service Job View" }))
        // eslint-disable-next-line
    }, [])

    useEffect(() => {
        const segments = location?.pathname?.split('/').filter(Boolean)
        const lastSegment = ['about', 'products', 'call-logs', 'service-cards'].includes((segments.at(-1) || ''))
            ? segments.at(-1) || '' : null

        setActiveSegment(lastSegment)
    }, [location?.pathname])

    return (
        <div className="service-job-controller-container">

            <div className="menu-box">
                <div className="slide-menus">
                    <div className={`menu-item ${(activeSegment === 'about' || !activeSegment) && 'active'}`} onClick={() => navigateSubMenu(`/controller/customer/${customer_id}/about`)}>
                        <TbMoodSpark />
                        <p>About</p>
                    </div>
                    <div className={`menu-item ${(activeSegment === 'products') && 'active'}`} onClick={() => navigateSubMenu(`/controller/customer/${customer_id}/products`)}>
                        <TbManualGearbox />
                        <p>Products</p>
                    </div>
                    <div className={`menu-item ${(activeSegment === 'call-logs') && 'active'}`} onClick={() => navigateSubMenu(`/controller/customer/${customer_id}/call-logs`)}>
                        <TbMessage />
                        <p>Call Logs</p>
                    </div>
                    <div className={`menu-item ${(activeSegment === 'service-cards') && 'active'}`}
                        onClick={() => navigateSubMenu(`/controller/registered?fl=Yes&id_key=${customer_id}&registered_service_sort_by=Action+Date&registered_service_sort_dir=desc&status=1%2C2%2C3%2C4`)}>
                        <p>Registrations</p>
                        <TbArrowUpRight />
                    </div>
                    <div className={`menu-item ${(activeSegment === 'service-cards') && 'active'}`}
                        onClick={() => navigateSubMenu(`/controller/completed?fl=Yes&from_date=${moment().subtract(3, "months").format("YYYY-MM-DD")}&end_date=${moment().format("YYYY-MM-DD")}&customer_id=${customer_id}`)}>
                        <p>Service Jobs</p>
                        <TbArrowUpRight />
                    </div>

                </div>
            </div>
            <div className="customer-content">
                <Outlet />
            </div>
        </div>
    )
}

export default ServiceJob