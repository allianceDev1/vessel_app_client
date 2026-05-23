import React from 'react'
import { TbSquareLetterS } from 'react-icons/tb'
import SpareCard from '../../common/spare-card/SpareCard'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { api } from '../../../../api'
import SkeletonGrid from '../../../UI_Primitives/skeleton/SkeletonGrid'
import ErrorState from '../../../UI_Primitives/ui-states/ErrorState'


const SpareList = () => {
    const { customer_id, product_id } = useParams();

    const { data, isLoading, error } = useQuery({
        queryKey: ['customer_spare_list', customer_id, product_id],
        queryFn: async () => {
            const data = await api.vfTv2Axios.get(`/product/${product_id}/spares`)
            return data;
        },
        staleTime: 60_000
    })

    if (isLoading) {
        return <div>
            <SkeletonGrid rows={3} columns={3} height={'150px'} gap={'10px'} responsive={{
                md: { rows: 4, columns: 2 },
                sm: { rows: 6, columns: 1 },
            }} />
        </div>
    }

    if (error) {
        return <div>
            <ErrorState
                icon={<TbSquareLetterS />}
                title={'Data fetching Failed'}
                message={error?.message}
                hight='400px'
            />
        </div>
    }

    return (
        <div className="tech-spares-customer-container">
            <div >
                {data?.length > 0
                    ? <div className='list-items' style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {data?.map((spare) => {
                            return <SpareCard
                                key={spare?.spare_id}
                                customerId={customer_id}
                                productId={product_id}
                                spareUuid={spare?.spare_uuid}
                                spareId={spare?.spare_id}
                                spareName={spare?.spare_name}
                                spareCategory={spare?.spare_category}
                                Qty={spare?.qty}
                                Unit={spare?.unit}
                                warrantyStarted={spare?.wr_start_date}
                                warrantyExpiry={spare?.wr_expire_date}
                                warrantyPeriod={spare?.wr_period}
                                insertAt={spare?.insert_at}
                                isReadyOnly={true}
                            />
                        })}
                    </div>
                    : <>
                        <ErrorState
                            icon={<TbSquareLetterS />}
                            title={'Spares is Empty'}
                            message={'Spares not available under the product'}
                            hight='400px'
                        />
                    </>}
            </div>
        </div>
    )
}

export default SpareList