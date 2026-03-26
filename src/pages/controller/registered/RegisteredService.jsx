import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useSearchParams } from 'react-router-dom';
import { page } from '../../../redux/features/non_persisted/miniSystemSlice';
import RegisteredReport from '../../../components/charts/registered-service/RegisteredReport';

const RegisteredService = () => {
    const dispatch = useDispatch();
    const [searchParams, setSearchParams] = useSearchParams();



    useEffect(() => {
        dispatch(page.setTitle({ title: 'Registered Services', note: "Registered service list and tracking." }))

        // eslint-disable-next-line
    }, [])

    return (
        <div className="registered-services-page-controller">
            {/* <div className="top-section">
                <Dropdown button={{
                    label: searchParams.get('view_type') === 'customer' ? 'Customer view' : 'Product view',
                    icon: < TbChevronDown />, iconPos: 'right',
                    rounded: true, outlined: true, size: 'small', style: { width: '140px' }
                }} list={viewTypeOptions}
                    selected={searchParams.get('view_type') || 'product'} />
                <Button label={'Filter'} icon={<TbFilter />} size='small' outlined rounded style={{ width: '100px' }}
                    onClick={onClickFilter} />
            </div> */}
            <div className="content">
                {searchParams.get('fl') !== "Yes" && <RegisteredReport />}
                {/* {searchParams.get('fl') === "Yes" && <UpcomingServiceTable />} */}
            </div>
        </div>
    )
}

export default RegisteredService