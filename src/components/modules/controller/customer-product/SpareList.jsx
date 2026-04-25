import React from 'react'
import './spare-list.scss'
import { TbPlus, TbSquareLetterS } from 'react-icons/tb'
import Button from '../../../UI_Primitives/buttons/Button'
import SpareCard from '../../common/spare-card/SpareCard'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { api } from '../../../../api'
import SkeletonGrid from '../../../UI_Primitives/skeleton/SkeletonGrid'
import ErrorState from '../../../UI_Primitives/ui-states/ErrorState'

const SpareList = () => {
    const { customer_id, product_id } = useParams();

    const { data, isLoading, error } = useQuery({
        queryKey: ['controller_customer_spare_list', customer_id, product_id],
        queryFn: async () => {
            const data = await api.vfCv2Axios(`/product/${product_id}/spares`)
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
        <div className="controller-spares-customer-container">
            <div className="menu-buttons">
                <Button icon={<TbPlus />} label={'Spare'} size='small' severity={'primary'} rounded style={{ width: '100px' }} />
            </div>
            <div className="content">
                {data?.length > 0
                    ? <div className='list-items'>
                        {data?.map((spare) => {
                            return <SpareCard
                                key={spare?.spare_id}
                                spareUuid={spare?.spare_uuid}
                                spareId={spare?.spare_id}
                                spareName={spare?.spare_name}
                                spareCategory={spare?.spare_category}
                                Qty={`${spare?.qty} ${spare?.unit || ''}`}
                                warrantyExpiry={spare?.wr_expire_date}
                                insertAt={spare?.insert_at}
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