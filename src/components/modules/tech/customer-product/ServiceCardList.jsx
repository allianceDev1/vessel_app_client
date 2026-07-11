import React from 'react'
import ServiceCard from '../../common/cards/ServiceCard'
import Button from '../../../UI_Primitives/buttons/Button'
import { TbPlayCard4, TbRotate } from 'react-icons/tb'
import { useNavigate, useParams } from 'react-router-dom'
import SkeletonGrid from '../../../UI_Primitives/skeleton/SkeletonGrid'
import ErrorState from '../../../UI_Primitives/ui-states/ErrorState'
import { useInfiniteQuery } from '@tanstack/react-query'
import { api } from '../../../../api'
import InstallationCard from '../../common/cards/InstallationCard'

const ServiceCardList = () => {
    const { product_id } = useParams();
    const navigate = useNavigate();

    const fetchServiceCards = async ({ pageParam = 0 }) => {

        const res = await api.vfTv2Axios.get(`/product/${product_id}/service-cards?page=${pageParam}&limit=10`)
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
        queryKey: ["product_service_cards", product_id],
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
    })

    const allCards = data?.pages?.flatMap(page => page.items) || [];

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
                icon={<TbPlayCard4 />}
                title={'Data fetching Failed'}
                message={error?.message}
                hight='400px'
            />
        </div>
    }

    return (
        <div className="tech-customer-service-cards-container"
            style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }} >
            <div className="content" style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '400px' }}>
                {!allCards.length && <ErrorState
                    icon={<TbPlayCard4 />}
                    title={'No service history yet.'}
                    message={error?.message}
                    hight='400px'
                />}

                {allCards.map((card) => (
                    card?.card_type === 'SERVICE_CARD' ? <ServiceCard key={card.uuid} data={card} pointer={card?.version === 2}
                        onClick={() => card?.version === 2 ? navigate(`/controller/completed/service-job/${card?.service_srl_no}`) : null} /> :
                        card?.card_type === 'INSTALLATION_CARD' ? <InstallationCard key={card.uuid} data={card} /> : ""
                ))}

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

export default ServiceCardList