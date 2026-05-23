import React from 'react'
import './package-history.scss'
import PackageCard from '../../common/package/PackageCard'
import Button from '../../../UI_Primitives/buttons/Button'
import { TbDropletBolt, TbRotate } from 'react-icons/tb'
import { useParams } from 'react-router-dom'
import { api } from '../../../../api'
import { useInfiniteQuery } from '@tanstack/react-query'
import SkeletonGrid from '../../../UI_Primitives/skeleton/SkeletonGrid'
import ErrorState from '../../../UI_Primitives/ui-states/ErrorState'

const PackageHistory = () => {
    const { product_id } = useParams();

    const fetchServiceCards = async ({ pageParam = 0 }) => {

        const res = await api.vfTv2Axios.get(`/product/${product_id}/package-history?page=${pageParam}&limit=6`)
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
        queryKey: ["product_service_package_history", product_id],
        queryFn: fetchServiceCards,
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) => {
            const totalLoaded = allPages
                .flatMap(page => page.items)
                .length;

            if (totalLoaded >= lastPage.total) return undefined;
            return allPages.length; // next page index
        },
        enabled: !!product_id,
        staleTime: 60_000
    })

    const allPackages = data?.pages?.flatMap(page => page.items) || [];

    if (isLoading) {
        return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '400px' }}>
                <SkeletonGrid rows={7} columns={1} height={'130px'} gap={'10px'} />
            </div>
        </div>
    }

    if (error) {
        return <div>
            <ErrorState
                icon={<TbDropletBolt />}
                title={'Data fetching Failed'}
                message={error?.message}
                hight='400px'
            />
        </div>
    }

    return (
        <div className="tech-customer-package-history-container" style={{ marginTop: '20px' }}>

            {!allPackages.length && <ErrorState
                icon={<TbDropletBolt />}
                title={'No service packages yet.'}
                message={error?.message}
                hight='400px'
            />}

            <div style={{ display: 'flex', flexDirection: "column", gap: "10px" }}>
                {allPackages.map((pack) => <PackageCard key={pack.serial_number} data={pack} redirectUrl={`/tech/customer/product/package/${pack.serial_number}/about`}/>)}
            </div>

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
    )
}

export default PackageHistory