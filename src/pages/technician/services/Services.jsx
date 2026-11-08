import React, { useEffect, useRef, useState } from 'react'
import './services.scss';
import { useDispatch } from 'react-redux';
import { modal, page } from '../../../redux/features/non_persisted/miniSystemSlice'
import { TbArrowsDownUp, TbArrowUp, TbCategory2, TbChevronLeft, TbChevronRight, TbFilter, TbRefresh, TbRotate } from 'react-icons/tb';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../../api';
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
            product_type: searchParams.get('product_type') || undefined,
            from_date: searchParams.get('from_date') || undefined,
            to_date: searchParams.get('to_date') || undefined,
            sort_by: searchParams.get('field') || undefined,
            sort_dir: searchParams.get('order') || undefined,
        }

        const res = await api.ssTv2Axios('/service/upcoming-services', {
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
            searchParams.get('field'), searchParams.get('order'), searchParams.get("product_type")
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
        { label: 'Renewals (Reg)', value: 'REG_RENEWAL', onClick: () => handleChangeTab('REG_RENEWAL') },
        { label: 'Services', value: 'SERVICE', onClick: () => handleChangeTab('SERVICE') },
        { label: 'Renewals', value: 'RENEWAL', onClick: () => handleChangeTab('RENEWAL') },
        { label: 'Overdue', value: 'OVERDUE', onClick: () => handleChangeTab('OVERDUE'), }
    ]

    const resetApi = async () => {
        await queryClient.resetQueries({
            queryKey: ["pending_services"]
        });
    }

    useEffect(() => {
        dispatch(page.config({ title: 'Upcoming services', note: "Complaints, services, renewal and Overdue" }))

        // eslint-disable-next-line
    }, [])

    const currentTab = searchParams.get('tab') || 'COMPLAINT';
    const currentTabLabel = subPageOptions?.find(a => a?.value === currentTab)?.label || 'Complaints';
    const totalCount = data?.pages?.[0]?.total ?? 0;

    const tabsRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const updateTabScrollState = () => {
        const el = tabsRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 4);
        setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    };

    useEffect(() => {
        updateTabScrollState();
        window.addEventListener('resize', updateTabScrollState);
        return () => window.removeEventListener('resize', updateTabScrollState);
    }, [isLoading]);

    const handleScrollTabs = (dir) => {
        const el = tabsRef.current;
        if (!el) return;
        el.scrollBy({ left: dir === 'left' ? -160 : 160, behavior: 'smooth' });
    };

    const handleScrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
        document.body.scrollTo({ top: 0, behavior: 'smooth' });
    };

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
                <div className="section-one-wrapper">
                    {canScrollLeft && (
                        <button
                            type="button"
                            className="tab-scroll-btn left"
                            onClick={() => handleScrollTabs('left')}
                            aria-label="Scroll tabs left"
                        >
                            <TbChevronLeft />
                        </button>
                    )}
                    <div
                        className="section-one"
                        ref={tabsRef}
                        onScroll={updateTabScrollState}
                    >
                        {subPageOptions.map((item) => (
                            <button
                                key={item.value}
                                type="button"
                                className={`tab-btn ${currentTab === item.value ? 'active' : ''}`}
                                onClick={item.onClick}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                    {canScrollRight && (
                        <button
                            type="button"
                            className="tab-scroll-btn right"
                            onClick={() => handleScrollTabs('right')}
                            aria-label="Scroll tabs right"
                        >
                            <TbChevronRight />
                        </button>
                    )}
                </div>
                <div className="section-bottom">
                    <div className="item-count">
                        <span className="count-label">{currentTabLabel}:</span>
                        <span className="count-badge">{totalCount}</span>
                    </div>
                    <div className="section-two">
                        <span onClick={resetApi} title="Refresh">
                            <TbRefresh />
                        </span>
                        <span className={searchParams.get('sr') === 'Yes' ? 'active' : ''} onClick={handleOpenSort} title="Sort">
                            <TbArrowsDownUp />
                        </span>
                        <span className={searchParams.get('fl') === 'Yes' ? 'active' : ''} onClick={handleOpenFilter} title="Filter">
                            <TbFilter />
                        </span>
                    </div>
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
                            spinIcon={isFetchingNextPage} severity={'secondary'}
                            onClick={() => {
                                if (!isFetchingNextPage) fetchNextPage();
                            }} />
                    </div>
                }
            </div>

            <div className="scroll-top-btn">
                <Button
                    icon={<TbArrowUp />}
                    rounded
                    onClick={handleScrollToTop}
                    aria-label="Scroll to top"
                    severity={'primary'}
                />
            </div>
        </div>
    )
}

export default Services 