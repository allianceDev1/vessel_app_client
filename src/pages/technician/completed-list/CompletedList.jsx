import React, { useEffect } from 'react'
import './completed-list.scss'
import Button from '../../../components/UI_Primitives/buttons/Button'
import { TbDropletCheck, TbFilter, TbReport } from 'react-icons/tb'
import { useDispatch } from 'react-redux'
import { modal, page } from '../../../redux/features/non_persisted/miniSystemSlice'
import ServiceJobItem from '../../../components/modules/tech/service-job/ServiceJobItem'
import FilterBox from '../../../components/forms/tech/completed-service/FilterBox'
import { useSearchParams } from 'react-router-dom'
import { useInfiniteQuery } from '@tanstack/react-query'
import { api } from '../../../api'
import EmptyState from '../../../components/UI_Primitives/ui-states/EmptyState'
import ErrorState from '../../../components/UI_Primitives/ui-states/ErrorState'
import SkeletonGrid from '../../../components/UI_Primitives/skeleton/SkeletonGrid'


const CompletedList = () => {
    const LIMIT = 10;
    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        dispatch(page.setTitle({ title: 'Completed Services', note: "All your closed service jobs" }))

        // eslint-disable-next-line
    }, [])

    const openFilterBox = () => {
        dispatch(modal.push({
            title: "Filter Completed Services",
            body: <FilterBox />
        }))
    }

    // Extract filters
    const filters = {
        from_date: searchParams.get('from_date'),
        end_date: searchParams.get('end_date'),
        customer_id: searchParams.get('customer_id')
    }

    // Infinite Query
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        error
    } = useInfiniteQuery({
        queryKey: ['tech_completed-services', filters?.customer_id, filters?.from_date, filters?.end_date],
        queryFn: async ({ pageParam = 0 }) => {
            const res = await api.vfTv2Axios.get('/completed/list', {
                params: {
                    page: pageParam,
                    limit: LIMIT,
                    ...filters
                }
            });

            return {
                items: res?.data || [],
                total: res?.total || 0,
                currentPage: pageParam
            };
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) => {
            const totalLoaded = allPages
                .flatMap(page => page.items)
                .length;

            if (totalLoaded >= lastPage.total) return undefined;
            return allPages.length; // next page index
        },
        enabled: (filters?.customer_id || (filters?.from_date && filters?.end_date)) ? true : false,
        staleTime: 60_000
    });

    const allServiceJobs = data?.pages?.flatMap(page => page.items) || [];


    if (isLoading) {
        return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '400px' }}>
                <SkeletonGrid rows={7} columns={1} height={'80px'} gap={'10px'} />
            </div>
        </div>
    }

    if (error) {
        return <div>
            <ErrorState
                icon={<TbDropletCheck />}
                title={'Data fetching Failed'}
                message={error?.message}
                hight='400px'
            />
        </div>
    }

    return (
        <div className="tech-completed-services-page-container">
            {(filters?.customer_id || (filters?.from_date && filters?.end_date)) ?
                allServiceJobs?.length ? <>
                    <div className="top-buttons">
                        <Button icon={<TbReport />} label={'Report'} rounded outlined size='small' style={{ width: '110px' }} />
                        <Button icon={<TbFilter />} label={'Filter'} rounded outlined size='small' style={{ width: '110px' }}
                            onClick={() => openFilterBox()} />
                    </div>
                    <div className="content">
                        <div className="list-items">
                            {allServiceJobs?.map((job) => {
                                return <ServiceJobItem key={job?.service_srl_no} data={job}
                                    redirectUrl={`/tech/completed/service-job/${job?.service_srl_no}`}
                                />
                            })}
                        </div>
                        {hasNextPage && <div className="more-button">
                            <Button label={'Load More'} rounded outlined size='small' style={{ width: "100%" }}
                                spinIcon={isFetchingNextPage}
                                onClick={() => {
                                    if (!isFetchingNextPage) fetchNextPage();
                                }} />
                        </div>}
                    </div>
                </> : <EmptyState
                    icon={<TbDropletCheck />}
                    title={'No Service Jobs'}
                    description={'Service Jobs not available under your filtration'}
                    hight='calc(100vh - 220px)'
                    footer={
                        <Button icon={<TbFilter />} label={'Filter'} rounded size='small' style={{ width: '110px' }}
                            onClick={() => openFilterBox()} />
                    }
                /> : <EmptyState
                    icon={<TbDropletCheck />}
                    title={'Filter Your Service Jobs'}
                    description={'Click below button and filter your service jobs'}
                    hight='calc(100vh - 220px)'
                    footer={
                        <Button icon={<TbFilter />} label={'Filter'} rounded size='small' style={{ width: '110px' }}
                            onClick={() => openFilterBox()} />
                    }
                />}


        </div>
    )
}

export default CompletedList