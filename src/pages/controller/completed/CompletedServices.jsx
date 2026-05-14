import React, { useEffect } from 'react'
import moment from "moment";
import './completed-services.scss'
import { useDispatch } from 'react-redux';
import { modal, page } from '../../../redux/features/non_persisted/miniSystemSlice';
import { TbChevronDown, TbFilter, TbReport } from 'react-icons/tb';
import Button from '../../../components/UI_Primitives/buttons/Button';
import FilterBox from '../../../components/forms/controller/completed-service/FilterBox';
import { useSearchParams } from 'react-router-dom';
import CompletedServiceTable from '../../../components/modules/controller/completed-service/CompletedServiceTable';
import Dropdown from '../../../components/UI_Primitives/dropdown/Dropdown';
import CompletedServiceReport from '../../../components/charts/completed-service/CompletedServiceReport';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../api';

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

    const {
        data: reportData,
        isLoading: reportLoading,
        error: reportError,
        dataUpdatedAt: reportDataUpdatedAt,
    } = useQuery({
        queryKey: ['completed_mini_report'],
        queryFn: async () => {
            const res = await api.vfCv2Axios.get(`/service/completed/mini-report`)
            return res
        },
        enabled: searchParams.get('fl') !== 'Yes',
        staleTime: 30 * 60_000
    })

    useEffect(() => {
        dispatch(page.setTitle({ title: 'Completed Services', note: "Completed service list and tracking." }))

        // eslint-disable-next-line
    }, [])

    return (
        <div className="completed-services-page-controller">
            <div className="top-section">
                <div className="left">
                    {searchParams.get('fl') !== "Yes" && <h4 className='sub-title'>
                        {new Date().getDate() > 5 ? moment(new Date()).format("MMMM YYYY") : moment().subtract(1, "month").format("MMMM YYYY")} - Report
                    </h4>}
                </div>

                <div className="right">
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
            </div>

            <div className="content">
                {searchParams.get('fl') !== "Yes" && <CompletedServiceReport
                    data={reportData} loading={reportLoading} error={reportError} updatedAt={reportDataUpdatedAt} />}
                {searchParams.get('fl') === "Yes" && <CompletedServiceTable />}
            </div>
        </div>
    )
}

export default CompletedServices