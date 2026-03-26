import React, { useEffect } from 'react'
import './upcoming-service.scss'
import { useDispatch } from 'react-redux';
import { modal, page } from '../../../redux/features/non_persisted/miniSystemSlice';
import UpcomingReport from '../../../components/charts/upcoming-service/UpcomingReport';
import Button from '../../../components/UI_Primitives/buttons/Button'
import Dropdown from '../../../components/UI_Primitives/dropdown/Dropdown'
import FilterBox from '../../../components/forms/controller/upcoming-service/FilterBox';
import { TbChevronDown, TbFilter } from 'react-icons/tb';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../api';
import UpcomingServiceTable from '../../../components/modules/controller/upcoming-service/UpcomingServiceTable';

const UpcomingServices = () => {
    const dispatch = useDispatch();
    const [searchParams, setSearchParams] = useSearchParams();

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
                { label: 'Product view', value: 'product', onClick: (arg) => handleChangeViewType(arg.value) },
                { label: 'Customer view', value: 'customer', onClick: (arg) => handleChangeViewType(arg.value) }
            ]
        }
    ];

    const {
        data: reportData,
        isLoading: reportLoading,
        error: reportError,
        dataUpdatedAt: reportDataUpdatedAt,
    } = useQuery({
        queryKey: ['upcoming_mini_report', searchParams.get('view_type') || 'product'],
        queryFn: async () => {
            const res = await api.vfCv2Axios.get(`/service/upcoming/mini-report/${searchParams.get('view_type') || 'product'}`)
            return res
        },
        enabled: searchParams.get('fl') !== 'Yes',
        staleTime: 30 * 60_000
    })

    const onClickFilter = () => {
        dispatch(modal.push({
            title: "Filter Services",
            body: <FilterBox />
        }))
    }

    useEffect(() => {
        dispatch(page.setTitle({ title: 'Upcoming Services', note: "Vessel filter upcoming service and renewal list." }))

        // eslint-disable-next-line
    }, [])

    return (
        <div className="upcoming-services-page-controller">
            <div className="top-section">
                <Dropdown button={{
                    label: searchParams.get('view_type') === 'customer' ? 'Customer view' : 'Product view',
                    icon: < TbChevronDown />, iconPos: 'right',
                    rounded: true, outlined: true, size: 'small', style: { width: '140px' }
                }} list={viewTypeOptions}
                    selected={searchParams.get('view_type') || 'product'} />
                <Button label={'Filter'} icon={<TbFilter />} size='small' outlined rounded style={{ width: '100px' }}
                    onClick={onClickFilter} />
            </div>
            <div className="content">
                {searchParams.get('fl') !== "Yes" && <UpcomingReport data={reportData} loading={reportLoading} error={reportError} updatedAt={reportDataUpdatedAt} />}
                {searchParams.get('fl') === "Yes" && <UpcomingServiceTable />}
            </div>
        </div>
    )
}

export default UpcomingServices