import React, { useEffect } from 'react'
import '../completed/completed-services.scss'
import { useDispatch } from 'react-redux';
import { modal, page } from '../../../redux/features/non_persisted/miniSystemSlice';
import { TbFilter } from 'react-icons/tb';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../api';
import Button from '../../../components/UI_Primitives/buttons/Button';
import FilterBox from '../../../components/forms/controller/subscription/FilterBox';
import SubscriptionReport from '../../../components/charts/subscription/SubscriptionReport';
import SubscriptionTable from '../../../components/modules/controller/subscription/SubscriptionTable';

const Subscriptions = () => {
    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();


    const onClickFilter = () => {
        dispatch(modal.push({
            title: "Filter Subscriptions",
            body: <FilterBox />
        }))
    }

    const {
        data: reportData,
        isLoading: reportLoading,
        error: reportError,
        dataUpdatedAt: reportDataUpdatedAt,
    } = useQuery({
        queryKey: ['subscription_mini_report'],
        queryFn: async () => {
            const res = await api.vfCv2Axios.get(`/package/mini-report`)
            return res
        },
        enabled: searchParams.get('fl') !== 'Yes',
        staleTime: 30 * 60_000
    })

    useEffect(() => {
        dispatch(page.setTitle({ title: 'Customer Subscriptions', note: "All product service subscription plan details." }))

        // eslint-disable-next-line
    }, [])

    return (
        <div className="completed-services-page-controller">
            <div className="top-section">
                <div className="left">
                </div>

                <div className="right">
                    <Button label={'Filter'} icon={<TbFilter />} size='small' outlined rounded style={{ width: '100px' }}
                        onClick={onClickFilter} />
                </div>
            </div>

            <div className="content">
                {searchParams.get('fl') !== "Yes" && <SubscriptionReport
                    data={reportData} loading={reportLoading} error={reportError} updatedAt={reportDataUpdatedAt} />}
                {searchParams.get('fl') === "Yes" && <SubscriptionTable />}
            </div>
        </div>
    )
}

export default Subscriptions