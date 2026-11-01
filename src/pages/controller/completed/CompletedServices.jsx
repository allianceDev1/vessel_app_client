import React, { useEffect } from 'react'
import './completed-services.scss'
import { useDispatch } from 'react-redux';
import { modal, page } from '../../../redux/features/non_persisted/miniSystemSlice';
import { TbChevronDown, TbFilter, TbReport, TbTable } from 'react-icons/tb';
import Button from '../../../components/UI_Primitives/buttons/Button';
import FilterBox from '../../../components/forms/controller/completed-service/FilterBox';
import { useSearchParams } from 'react-router-dom';
import CompletedServiceTable from '../../../components/modules/controller/completed-service/CompletedServiceTable';
import Dropdown from '../../../components/UI_Primitives/dropdown/Dropdown';
import CompletedServiceReport from '../../../components/charts/completed-service/CompletedServiceReport';
import { getIsoDayDifference } from '../../../utils/helpers/date-helpers';


const CompletedServices = () => {
    const dispatch = useDispatch();
    const [searchParams, setSearchParams] = useSearchParams();

    const fromDate = searchParams.get('from_date');
    const endDate = searchParams.get('end_date');
    const isDateGapExceeded = fromDate && endDate
        ? getIsoDayDifference(new Date(endDate), new Date(fromDate)) > 35
        : false;

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

    const handleChangePage = (type) => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.set('p', type);
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
        dispatch(page.config({ title: 'Completed Services', note: "Completed service list and tracking." }))

        // eslint-disable-next-line
    }, [])

    return (
        <div className="completed-services-page-controller">
            <div className="top-section">
                <div className="left"> </div>

                <div className="right">
                    {searchParams.get('p') === "l" &&
                        <Dropdown button={{
                            label: searchParams.get('view_type') === 'product' ? 'Product view' : 'Customer view',
                            icon: < TbChevronDown />, iconPos: 'right',
                            rounded: true, outlined: true, size: 'small', style: { width: '140px' }
                        }} list={viewTypeOptions}
                            selected={searchParams.get('view_type') || 'customer'} />}


                    {searchParams.get('fl') === "Yes" && <>
                        {searchParams.get('p') === 'l'
                            ? <Button label={'Report'} icon={<TbReport />} size='small' outlined rounded style={{ width: '100px' }}
                                severity={'secondary'} disabled={isDateGapExceeded}
                                title={isDateGapExceeded ? 'Report is disabled because the date range exceeds 35 days' : 'View report'}
                                onClick={() => handleChangePage('r')} />
                            : <Button label={'List'} icon={<TbTable />} size='small' outlined rounded style={{ width: '100px' }}
                                severity={'secondary'} onClick={() => handleChangePage('l')} />}
                    </>}

                    <Button label={'Filter'} icon={<TbFilter />} size='small' outlined rounded style={{ width: '100px' }}
                        onClick={onClickFilter} severity={'secondary'} />
                </div>
            </div>

            <div className="content">
                {searchParams.get('p') === "l"
                    ? < CompletedServiceTable />
                    : <CompletedServiceReport />}

            </div>
        </div>
    )
}

export default CompletedServices