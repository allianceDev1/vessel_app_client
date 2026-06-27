import React, { useEffect, useState } from 'react'
import './customer-view.scss'
import { useDispatch, useSelector } from 'react-redux'
import { modal, page } from '../../../redux/features/non_persisted/miniSystemSlice';
import { TbArrowUpRight, TbManualGearbox, TbMessage, TbMessagePlus, TbMoodSpark, TbPencilPlus, TbPlus } from 'react-icons/tb';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import Button from '../../../components/UI_Primitives/buttons/Button';
import ServiceRegistration from '../../../components/forms/controller/registration/ServiceRegistration';
import AddCallLog from '../../../components/forms/common/add-call-log/AddCallLog';
import moment from "moment"
import AddCustomerProduct from '../../../components/forms/controller/product/AddCustomerProduct';

const CustomerView = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();
    const [activeSegment, setActiveSegment] = useState('');
    const { customer_id } = useParams();
    const { user } = useSelector((state) => state.user)

    const navigateSubMenu = (url) => {
        navigate(url)
    }

    const openRegistrationPopUp = ({ customer_id, customer_name, service_type }) => {
        dispatch(modal.push({
            show: true, title: "Register Service",
            body: <ServiceRegistration customerName={customer_name} customerId={customer_id} serviceType={service_type || ''} />
        }))
    }

    const openEnterCallLogPopUp = ({ customer_id }) => {
        dispatch(modal.push({
            show: true, title: "Enter Call Log",
            body: <AddCallLog customerId={customer_id} isController={true} />
        }))
    }

    const openAddProductPopUp = () => {

        dispatch(modal.push({
            title: "Add New Product",
            body: <AddCustomerProduct customerId={customer_id} />,
            style: { width: '700px' }
        }))

    }

    useEffect(() => {
        dispatch(page.setTitle({ title: '', note: "" }))
        // eslint-disable-next-line
    }, [])

    useEffect(() => {
        const segments = location?.pathname?.split('/').filter(Boolean)
        const lastSegment = ['about', 'products', 'call-logs', 'service-cards'].includes((segments.at(-1) || ''))
            ? segments.at(-1) || '' : null

        setActiveSegment(lastSegment)
    }, [location?.pathname])

    return (
        <div className="customer-view-controller-container">
            <div className="top-section">
                <div className="title">
                    <h2>{`Customer ID : ${customer_id}`}</h2>
                </div>
                {user?.allowed_origins?.some(a => ['vessel_c_writer', 'vessel_c_admin'].includes(a)) &&
                    <div className="actions">
                        <Button label={'Product'} icon={<TbPlus />} size='small' severity={'primary'} rounded style={{ width: '100px' }}
                            onClick={openAddProductPopUp} />
                        <Button label={'Call Log'} icon={<TbMessagePlus />} size='small' outlined rounded style={{ width: '110px' }}
                            onClick={() => openEnterCallLogPopUp({ customer_id })} />
                        <Button label={'Registration'} icon={<TbPencilPlus />} size='small' outlined rounded style={{ width: '130px' }}
                            onClick={() => openRegistrationPopUp({ customer_id })} />
                    </div>}
            </div>
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
                        onClick={() => navigate(`/controller/registered?fl=Yes&id_key=${customer_id}&registered_service_sort_by=Action+Date&registered_service_sort_dir=desc&status=1%2C2%2C3%2C4`)}>
                        <p>Registrations</p>
                        <TbArrowUpRight />
                    </div>
                    <div className={`menu-item ${(activeSegment === 'service-cards') && 'active'}`}
                        onClick={() => navigate(`/controller/completed?fl=Yes&from_date=${moment().subtract(3, "months").format("YYYY-MM-DD")}&end_date=${moment().format("YYYY-MM-DD")}&customer_id=${customer_id}`)}>
                        <p>Service Jobs</p>
                        <TbArrowUpRight />
                    </div>
                </div>
            </div>
            <div className="customer-content">
                <Outlet />
            </div>
        </div >
    )
}

export default CustomerView