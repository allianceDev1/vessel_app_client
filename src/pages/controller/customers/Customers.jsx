import React, { useEffect, useState } from 'react'
import './customers.scss'
import { useDispatch } from 'react-redux';
import { page } from '../../../redux/features/non_persisted/miniSystemSlice';
import { Outlet, useNavigate } from 'react-router-dom';
import Button from '../../../components/UI_Primitives/buttons/Button';
import { TbFilter, TbMoodSearch, TbPlus, TbReport, TbSearch } from 'react-icons/tb';

const Customers = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [pageState, setPageState] = useState('report')  // report, search , filter


    useEffect(() => {
        dispatch(page.setTitle({ title: 'Customers', note: "Vessel filter customers list and reports." }))


        // eslint-disable-next-line
    }, [])


    return (
        <div className="customers-page">
            <div className="action-buttons">
                <Button label={'Product'} icon={<TbPlus />} size='small' rounded severity={'primary'} style={{ width: '100px' }} />
                <Button label={'Filter'} icon={<TbFilter />} size='small' outlined rounded style={{ width: '100px' }} />
                <Button label={'Report'} icon={<TbReport />} size='small' outlined rounded style={{ width: '100px' }} />
            </div>
            <div className="outlet">
                <Outlet />
            </div>
        </div>
    )
}

export default Customers