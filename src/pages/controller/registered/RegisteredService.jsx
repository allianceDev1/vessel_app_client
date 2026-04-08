import React, { useEffect } from 'react'
import './registered-service.scss'
import { useDispatch } from 'react-redux'
import { useSearchParams } from 'react-router-dom';
import { modal, page } from '../../../redux/features/non_persisted/miniSystemSlice';
import { TbFilter } from 'react-icons/tb';
import RegisteredReport from '../../../components/charts/registered-service/RegisteredReport';
import Button from '../../../components/UI_Primitives/buttons/Button';
import FilterBox from '../../../components/forms/controller/registered-service/FilterBox';
import RegisteredServiceTable from '../../../components/modules/controller/registered-service/RegisteredServiceTable';

const RegisteredService = () => {
    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();

    const onClickFilter = () => {
        dispatch(modal.push({
            title: "Filter Services",
            body: <FilterBox />
        }))
    }

    useEffect(() => {
        dispatch(page.setTitle({ title: 'Registered Services', note: "Registered service list and tracking." }))

        // eslint-disable-next-line
    }, [])

    return (
        <div className="registered-services-page-controller">
            <div className="top-section">
                <Button label={'Filter'} icon={<TbFilter />} size='small' outlined rounded style={{ width: '100px' }}
                    onClick={onClickFilter} />
            </div>
            <div className="content">
                {searchParams.get('fl') !== "Yes" && <RegisteredReport />}
                {searchParams.get('fl') === "Yes" && <RegisteredServiceTable />}
            </div>
        </div>
    )
}

export default RegisteredService