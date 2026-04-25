import React, { useEffect } from 'react'
import './completed-services.scss'
import { useDispatch } from 'react-redux';
import { modal, page } from '../../../redux/features/non_persisted/miniSystemSlice';
import { TbChevronDown, TbFilter, TbReport } from 'react-icons/tb';
import Button from '../../../components/UI_Primitives/buttons/Button';
import FilterBox from '../../../components/forms/controller/completed-service/FilterBox';
import { useSearchParams } from 'react-router-dom';
import CompletedServiceTable from '../../../components/modules/controller/completed-service/CompletedServiceTable';
import Dropdown from '../../../components/UI_Primitives/dropdown/Dropdown';

const CompletedServices = () => {
    const dispatch = useDispatch();
    const [searchParams, setSearchParams] = useSearchParams();

    const onClickFilter = () => {
        dispatch(modal.push({
            title: "Filter Services",
            body: <FilterBox />
        }))
    }

    const handleChangeViewType = (type) => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.set('view_type', type);
            return next;
        })
    }

    const viewTypeOptions = [
        {
            items: [
                { label: 'Customer view', value: 'customer', onClick: () => handleChangeViewType('customer') },
                { label: 'Product view', value: 'product', onClick: () => handleChangeViewType('product') },
            ]
        }
    ];



    useEffect(() => {
        dispatch(page.setTitle({ title: 'Completed Services', note: "Completed service list and tracking." }))

        // eslint-disable-next-line
    }, [])

    return (
        <div className="completed-services-page-controller">
            <div className="top-section">
                {searchParams.get('fl') === "Yes" && <>
                    <Dropdown button={{
                        label: searchParams.get('view_type') === 'product' ? 'Product view' : 'Customer view',
                        icon: < TbChevronDown />, iconPos: 'right',
                        rounded: true, outlined: true, size: 'small', style: { width: '140px' }
                    }} list={viewTypeOptions}
                        selected={searchParams.get('view_type') || 'customer'} />

                    <Button label={'Report'} icon={<TbReport />} size='small' outlined rounded style={{ width: '100px' }} />
                </>}

                <Button label={'Filter'} icon={<TbFilter />} size='small' outlined rounded style={{ width: '100px' }}
                    onClick={onClickFilter} />

            </div>
            <div className="content">
                {searchParams.get('fl') !== "Yes" && <>REPORT</>}
                {searchParams.get('fl') === "Yes" && <CompletedServiceTable />}
            </div>
        </div>
    )
}

export default CompletedServices