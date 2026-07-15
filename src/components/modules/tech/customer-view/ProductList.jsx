import React from 'react'
import './product-list.scss'
import Badge from '../../../UI_Primitives/badge/Badge'
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../../api';
import SkeletonGrid from '../../../UI_Primitives/skeleton/SkeletonGrid';
import ErrorState from '../../../UI_Primitives/ui-states/ErrorState';
import { TbManualGearbox } from 'react-icons/tb';
import EmptyState from '../../../UI_Primitives/ui-states/EmptyState';
import { toStandardText } from '../../../../utils/helpers/text-formatting';
import { getContrastText } from '../../../../utils/helpers/color-utils';

const ProductList = () => {
    const navigate = useNavigate();
    const { customer_id } = useParams();

    const { data, isLoading, error } = useQuery({
        queryKey: ['controller_customer_products', customer_id],
        queryFn: async () => {
            const data = await api.vfTv2Axios(`/customer/${customer_id}/products`)

            let vessels = data?.filter(i => i.product_type === 'VESSEL_FILTER')
            vessels = vessels.sort((a, b) => a.order_id.localeCompare(b.order_id))
            const addons = data?.filter(i => i.product_type === 'ADD_ON')

            return { vessels, addons };
        },
        staleTime: 60_000
    })

    if (isLoading) {
        return <div style={{ marginTop: '15px' }}>
            <SkeletonGrid rows={5} columns={2} height={'100px'} gap={'10px'} responsive={{
                md: { rows: 6, columns: 1 },
            }} />
        </div>
    }

    if (error) {
        return <div>
            <ErrorState
                icon={<TbManualGearbox />}
                title={'Data fetching Failed'}
                message={error?.message}
                hight='400px'
            />
        </div>
    }

    if (!data?.vessels?.length && !data?.addons?.length) {
        return <div>
            <EmptyState
                icon={<TbManualGearbox />}
                title={'No Product Existed'}
                hight='400px'
            />
        </div>
    }

    return (
        <div className="tech-customer-products-container">
            {data?.vessels?.length ? <>
                <h3 className='sub-title' style={{ marginTop: "10x" }}>Vessel Filters</h3>
                <div className="product-list">
                    {data?.vessels?.map((item) => {
                        return <div className="product-item"
                            onClick={() => navigate('/tech/customer/' + customer_id + '/product/' + item?.product_id + '/about')}>
                            <div className="order-section">
                                <h4>{item?.order_id ? item?.order_id : "UN"}</h4>
                            </div>
                            <div className="content">
                                <div className="x1">
                                    <p className='text-1'>ID : {item?.product_id}</p>
                                    <p className='text-2'>{toStandardText(item?.origin_category)}</p>
                                </div>
                                <h3>{item?.product_name}</h3>
                                <div className="x3">
                                    {item?.product_warranty && <Badge severity={'info'} value={'Warranty'} />}
                                    {item?.package?.has_service_package && < Badge
                                        value={item?.package?.package_name}
                                        style={{ backgroundColor: item?.package?.color_code, color: getContrastText(item?.package?.color_code) }} />}
                                    {item?.rental && <Badge value={'Rental'} />}
                                    {!item?.active && <Badge severity={'danger'} value={'Disconnected'} />}
                                </div>
                            </div>
                        </div>
                    })}
                </div>
            </> : ''}


            {data?.addons?.length ? <>
                <h3 className='sub-title' style={{ marginTop: "25px" }}>Vessel Add-ons</h3>
                <div className="product-list">
                    {data?.addons?.map((item) => {
                        return <div className="product-item"
                            onClick={() => navigate('/controller/product/' + item?.product_id + '/about')}>
                            <div className="order-section">
                                <h4>{"AD"}</h4>
                            </div>
                            <div className="content">
                                <div className="x1">
                                    <p className='text-1'>ID : {item?.product_id}</p>
                                    <p className='text-2'>{toStandardText(item?.origin_category)}</p>
                                </div>
                                <h3>{item?.product_name}</h3>
                                <div className="x3">
                                    {item?.product_warranty && <Badge severity={'info'} value={'Warranty'} />}
                                    {item?.package?.has_service_package && < Badge
                                        value={item?.package?.package_name}
                                        style={{ backgroundColor: item?.package?.color_code, color: getContrastText(item?.package?.color_code) }} />}
                                    {item?.rental && <Badge value={'Rental'} />}
                                    {!item?.active && <Badge severity={'danger'} value={'Disconnected'} />}
                                </div>
                            </div>
                        </div>
                    })}
                </div>
            </> : ''}
        </div>
    )
}

export default ProductList