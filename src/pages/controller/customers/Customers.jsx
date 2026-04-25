import React, { useEffect, } from 'react'
import './customers.scss'
import { useDispatch } from 'react-redux';
import { modal, page } from '../../../redux/features/non_persisted/miniSystemSlice';
import { Outlet } from 'react-router-dom';
import Button from '../../../components/UI_Primitives/buttons/Button';
import { TbFilter, TbPlus, TbReport } from 'react-icons/tb';
import AddCustomerProduct from '../../../components/forms/controller/product/AddCustomerProduct';
import FilterCustomerProduct from '../../../components/forms/controller/search-customer/FilterCustomerProduct';

const Customers = () => {
    const dispatch = useDispatch();

    const openAddProductPopUp = () => {

        dispatch(modal.push({
            title: "Add New Product",
            body: <AddCustomerProduct />,
            style: { width: '700px' }
        }))

    }

    const openFilterCustomerProductPopUp = () => {

        dispatch(modal.push({
            title: "Filter Customer Products",
            body: <FilterCustomerProduct />
        }))

    }

    useEffect(() => {
        dispatch(page.setTitle({ title: 'Customers', note: "Vessel filter customers list and reports." }))

        // eslint-disable-next-line
    }, [])


    return (
        <div className="customers-page">
            <div className="action-buttons">
                <Button label={'Product'} icon={<TbPlus />} size='small' rounded severity={'primary'} style={{ width: '100px' }}
                    onClick={openAddProductPopUp} />
                <Button label={'Filter'} icon={<TbFilter />} size='small' outlined rounded style={{ width: '100px' }}
                    onClick={openFilterCustomerProductPopUp} />
                <Button label={'Report'} icon={<TbReport />} size='small' outlined rounded style={{ width: '100px' }} />
            </div>
            <div className="outlet">
                <Outlet />
            </div>
        </div>
    )
}

export default Customers