import React, { useEffect } from 'react'
import './services.scss';
import { useDispatch } from 'react-redux';
import { modal, page } from '../../../redux/features/non_persisted/miniSystemSlice'
import { TbArrowDown, TbArrowsDownUp, TbCategory2, TbFilter, TbRefresh, TbRotate } from 'react-icons/tb';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../../api';
import Dropdown from '../../../components/UI_Primitives/dropdown/Dropdown'
import UpcomingServiceCard from '../../../components/modules/tech/service-card/UpcomingServiceCard';
import SkeletonGrid from '../../../components/UI_Primitives/skeleton/SkeletonGrid';
import ErrorState from '../../../components/UI_Primitives/ui-states/ErrorState';
import ServiceFilter from '../../../components/forms/tech/tech-services/ServiceFilter';
import ServiceSort from '../../../components/forms/tech/tech-services/ServiceSort';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import Button from '../../../components/UI_Primitives/buttons/Button';



const Services = () => {
    const dispatch = useDispatch();
    const queryClient = useQueryClient();
    const [searchParams, setSearchParams] = useSearchParams();


    const fetchDatas = async ({ pageParam = 0 }) => {

        const params = {
            page: pageParam,
            limit: 20,
            service_type: searchParams.get("tab") || 'COMPLAINT',
            customer_id: searchParams.get('customer_id') || undefined,
            city_ids: searchParams.get('city_id') || undefined,
            post_offices: searchParams.get('post')?.split(' ')?.join(',') || undefined,
            package_ids: searchParams.get('packages')?.split(' ')?.join(',') || undefined,
            from_date: searchParams.get('from_date') || undefined,
            to_date: searchParams.get('to_date') || undefined,
            sort_by: searchParams.get('field') || undefined,
            sort_dir: searchParams.get('order') || undefined,
        }

        const res = await api.vfTv2Axios('/service/upcoming-services', {
            params
        })

        return {
            items: res?.data || [],
            total: res?.total || 0,
            currentPage: pageParam
        };
    };

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        error
    } = useInfiniteQuery({
        queryKey: [
            "pending_services", searchParams.get("tab") || 'COMPLAINT', searchParams.get('customer_id'), searchParams.get('city_id'),
            searchParams.get('post'), searchParams.get('packages'), searchParams.get('from_date'), searchParams.get('to_date'),
            searchParams.get('field'), searchParams.get('order')
        ],
        queryFn: fetchDatas,
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) => {
            const totalLoaded = allPages
                .flatMap(page => page?.items)
                .length;

            if (totalLoaded >= lastPage?.total) return undefined;
            return allPages.length; // next page index
        },
        staleTime: 30_000
    })

    const serviceItemList = data?.pages?.flatMap(page => page.items) || [];


    const handleChangeTab = (value) => {
        const newSearchParams = new URLSearchParams(searchParams)
        newSearchParams.set('tab', value)
        setSearchParams(newSearchParams)
    }

    const handleOpenFilter = () => {
        dispatch(modal.push({
            title: 'Filter Services',
            body: <ServiceFilter />
        }))
    }

    const handleOpenSort = () => {
        dispatch(modal.push({
            title: 'Sort Services',
            body: <ServiceSort tab={searchParams.get("tab") || 'COMPLAINT'} />
        }))
    }


    const subPageOptions = [
        { label: 'Complaints', value: 'COMPLAINT', onClick: () => handleChangeTab('COMPLAINT') },
        { label: 'Services (Reg)', value: 'REG_SERVICE', onClick: () => handleChangeTab('REG_SERVICE') },
        { label: 'Services', value: 'SERVICE', onClick: () => handleChangeTab('SERVICE') },
        { label: 'Renewals (Reg)', value: 'REG_RENEWAL', onClick: () => handleChangeTab('REG_RENEWAL') },
        { label: 'Renewals', value: 'RENEWAL', onClick: () => handleChangeTab('RENEWAL') },
        { label: 'Overdue', value: 'OVERDUE', onClick: () => handleChangeTab('OVERDUE'), }
    ]

    const resetApi = async () => {
        await queryClient.resetQueries({
            queryKey: ["pending_services"]
        });
    }

    useEffect(() => {
        dispatch(page.setTitle({ title: 'Upcoming services', note: "Complaints, services, renewal and Overdue" }))

        // eslint-disable-next-line
    }, [])



    // loading
    if (isLoading) {
        return <div className="tech-service-page-load">
            <SkeletonGrid rows={1} columns={1} height={50} />
            <SkeletonGrid rows={5} columns={1} height={110} style={{ marginTop: '15px' }} />
        </div>
    }

    // Error
    if (error) {
        return <ErrorState
            hight='70vh'
            title={'Data fetching failed!'}
            message={error?.message}
            icon={<TbCategory2 />}
        />
    }

    // Data
    return (
        <div className="tech-service-page">
            <div className="top-section">
                <div className="section-one">
                    <Dropdown
                        button={{
                            label: `${subPageOptions?.find(a => a?.value === searchParams.get('tab'))?.label || 'Complaints'} ${data?.pages?.[0]?.total ? '| ' + data?.pages?.[0]?.total : ""}`,
                            icon: <TbArrowDown />,
                            iconPos: 'right',
                            rounded: true, text: true, size: 'small',
                        }}
                        list={[{
                            items: subPageOptions
                        }]}
                        selected={searchParams.get('tab') || 'COMPLAINT'}
                    />
                </div>
                <div className="section-two">
                    <span onClick={resetApi}>
                        <TbRefresh />
                    </span>
                    <span className={searchParams.get('sr') === 'Yes' ? 'active' : ''} onClick={handleOpenSort}>
                        <TbArrowsDownUp />
                    </span>
                    <span className={searchParams.get('fl') === 'Yes' ? 'active' : ''} onClick={handleOpenFilter}>
                        <TbFilter />
                    </span>
                </div>
            </div>
            <div className="service-card-container">
                {!serviceItemList?.length ?
                    <ErrorState
                        hight='60vh'
                        title='No data found'
                        icon={<TbCategory2 />}
                    />
                    : <> {serviceItemList?.map((card) => <UpcomingServiceCard data={card} key={card.customer[0]} />)} </>}

                {hasNextPage &&
                    <div style={{ display: "flex", justifyContent: 'center', marginTop: '20px' }}>
                        <Button icon={<TbRotate />} label={'See More'} rounded size='small' outlined style={{ width: '120px' }}
                            spinIcon={isFetchingNextPage}
                            onClick={() => {
                                if (!isFetchingNextPage) fetchNextPage();
                            }} />
                    </div>
                }
            </div>
        </div>
    )
}

export default Services 