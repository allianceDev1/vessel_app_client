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
            const data = await api.vfCv2Axios(`/customer/${customer_id}/products`)

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
        <div className="controller-customer-products-container">
            {data?.vessels?.length ? <>
                <h3 className='sub-title' style={{ marginTop: "25px" }}>Vessel Filters</h3>
                <div className="product-list">
                    {data?.vessels?.map((vessel) => {
                        return <div className="product-item"
                            onClick={() => navigate('/controller/customer/' + customer_id + '/product/' + vessel?.product_id + '/about')}>
                            <div className="order-section">
                                <h4>{vessel?.order_id ? vessel?.order_id : "UN"}</h4>
                            </div>
                            <div className="content">
                                <div className="x1">
                                    <p className='text-1'>ID : {vessel?.product_id}</p>
                                    <p className='text-2'>{toStandardText(vessel?.origin_category)}</p>
                                </div>
                                <h3>{vessel?.product_name}</h3>
                                <div className="x3">
                                    {vessel?.product_warranty && <Badge severity={'info'} value={'Warranty'} />}
                                    {vessel?.package?.has_service_package && < Badge
                                        value={vessel?.package?.package_name}
                                        style={{ backgroundColor: vessel?.package?.color_code, color: getContrastText(vessel?.package?.color_code) }} />}
                                    {vessel?.rental && <Badge value={'Rental'} />}
                                    {!vessel?.active && <Badge severity={'danger'} value={'Disconnected'} />}
                                </div>
                            </div>
                        </div>
                    })}
                </div>
            </> : ''}


            {data?.addons?.length ? <>
                <h3 className='sub-title' style={{ marginTop: "25px" }}>Vessel Add-ons</h3>
                <div className="product-list">
                    {data?.addons?.map((vessel) => {
                        return <div className="product-item"
                            onClick={() => navigate('/controller/customer/' + customer_id + '/product/' + vessel?.product_id + '/about')}>
                            <div className="order-section">
                                <h4>{"AD"}</h4>
                            </div>
                            <div className="content">
                                <div className="x1">
                                    <p className='text-1'>ID : {vessel?.product_id}</p>
                                    <p className='text-2'>{toStandardText(vessel?.origin_category)}</p>
                                </div>
                                <h3>{vessel?.product_name}</h3>
                                <div className="x3">
                                    {vessel?.product_warranty && <Badge severity={'info'} value={'Warranty'} />}
                                    {vessel?.package?.has_service_package && < Badge
                                        value={vessel?.package?.package_name}
                                        style={{ backgroundColor: vessel?.package?.color_code, color: getContrastText(vessel?.package?.color_code) }} />}
                                    {vessel?.rental && <Badge value={'Rental'} />}
                                    {!vessel?.active && <Badge severity={'danger'} value={'Disconnected'} />}
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