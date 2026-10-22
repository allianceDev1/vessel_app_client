import React, { useMemo } from 'react'
import './product-list.scss'
import Badge from '../../../UI_Primitives/badge/Badge'
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../../api';
import SkeletonGrid from '../../../UI_Primitives/skeleton/SkeletonGrid';
import ErrorState from '../../../UI_Primitives/ui-states/ErrorState';
import { TbChevronRight, TbManualGearbox } from 'react-icons/tb';
import EmptyState from '../../../UI_Primitives/ui-states/EmptyState';
import { toStandardText } from '../../../../utils/helpers/text-formatting';
import { getContrastText } from '../../../../utils/helpers/color-utils';


const PRODUCT_GROUPS = [
    {
        key: 'WATER_PURIFIER',
        title: 'Water purifier',
        match: (p) => p?.product_type === 'WATER_PURIFIER',
        sort: (a, b) => (a?.order_id || '').localeCompare(b?.order_id || '')
    },
    {
        key: 'WATER_PURIFIER_ADD_ON',
        title: 'Water Purifier Add-ons',
        match: (p) => p?.product_type === 'ADD_ON' && p?.parent_type === 'WATER_PURIFIER',
        sort: (a, b) => (a?.order_id || '').localeCompare(b?.order_id || '')
    },
    {
        key: 'VESSEL_FILTER',
        title: 'Vessel Filters',
        match: (p) => p?.product_type === 'VESSEL_FILTER',
        sort: (a, b) => (a?.order_id || '').localeCompare(b?.order_id || '')
    },
    {
        key: 'VESSEL_FILTER_ADD_ON',
        title: 'Vessel Add-ons',
        match: (p) => p?.product_type === 'ADD_ON' && (p?.parent_type === 'VESSEL_FILTER' || !p?.parent_type),
        sort: (a, b) => (a?.order_id || '').localeCompare(b?.order_id || '')
    }
];

const ProductCard = ({ product, onNavigate }) => {
    const hasBadges = Boolean(
        product?.product_warranty ||
        product?.package?.has_service_package ||
        product?.rental ||
        !product?.active
    );

    return (
        <div
            className="product-item"
            key={product?.product_id}
            onClick={onNavigate}
        >
            <div className="product-item-header">
                <div className="product-meta">
                    <span className="product-id">ID : {product?.product_id}</span>
                    {product?.origin_category && (
                        <span className="product-category">
                            {toStandardText(product?.origin_category)}
                        </span>
                    )}
                </div>
                <div className="product-arrow">
                    <TbChevronRight />
                </div>
            </div>

            <h3 className="product-title">{product?.product_name}</h3>

            {hasBadges && (
                <div className="product-badges">
                    {product?.product_warranty && <Badge severity={'info'} value={'Warranty'} />}
                    {product?.package?.has_service_package && (
                        <Badge
                            value={product?.package?.package_name}
                            style={{
                                backgroundColor: product?.package?.color_code,
                                color: getContrastText(product?.package?.color_code)
                            }}
                        />
                    )}
                    {product?.rental && <Badge value={'Rental'} />}
                    {!product?.active && <Badge severity={'danger'} value={'Disconnected'} />}
                </div>
            )}
        </div>
    );
};

const ProductList = () => {
    const navigate = useNavigate();
    const { customer_id } = useParams();

    const { data, isLoading, error } = useQuery({
        queryKey: ["tech", 'customer_products', customer_id],
        queryFn: async () => {
            const res = await api.vfTv2Axios(`/customer/${customer_id}/products`)

            return res || [];
        },
        staleTime: 60_000
    })

    const groupedProducts = useMemo(() => {
        if (!Array.isArray(data) || !data.length) return [];

        const assignedIds = new Set();
        const result = [];

        // Match predefined groups in exact order
        PRODUCT_GROUPS.forEach(group => {
            const items = data.filter(p => {
                if (assignedIds.has(p?.product_id)) return false;
                if (group.match(p)) {
                    assignedIds.add(p?.product_id);
                    return true;
                }
                return false;
            });

            if (items.length > 0) {
                result.push({
                    key: group.key,
                    title: group.title,
                    fallbackCode: group.fallbackCode,
                    items: group.sort ? [...items].sort(group.sort) : items
                });
            }
        });

        // Any leftover products that didn't match known groups
        const remaining = data.filter(p => !assignedIds.has(p?.product_id));
        if (remaining.length > 0) {
            const leftoverMap = new Map();
            remaining.forEach(p => {
                const groupKey = p?.product_type === 'ADD_ON' && p?.parent_type
                    ? `${p.parent_type}_ADD_ON`
                    : (p?.product_type || 'OTHER');

                const title = p?.product_type === 'ADD_ON' && p?.parent_type
                    ? `${toStandardText(p.parent_type)} Add-ons`
                    : toStandardText(p?.product_type || 'OTHER');

                const fallbackCode = p?.product_type === 'ADD_ON'
                    ? 'AD'
                    : (p?.product_type || 'OT').slice(0, 2).toUpperCase();

                if (!leftoverMap.has(groupKey)) {
                    leftoverMap.set(groupKey, { title, fallbackCode, items: [] });
                }
                leftoverMap.get(groupKey).items.push(p);
            });

            leftoverMap.forEach((group, key) => {
                result.push({
                    key,
                    title: group.title,
                    fallbackCode: group.fallbackCode,
                    items: group.items.sort((a, b) => (a?.order_id || '').localeCompare(b?.order_id || ''))
                });
            });
        }

        return result;
    }, [data]);



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

    if (!data?.length) {
        return (
            <div>
                <EmptyState
                    icon={<TbManualGearbox />}
                    title={'No product existed'}
                    hight='400px'
                />
            </div>
        );
    }

    return (
        <div className="tech-customer-products-container">
            {groupedProducts.map(group => (
                <React.Fragment key={group.key}>
                    <h3 className='sub-title' style={{ marginTop: "25px" }}>{group.title}</h3>
                    <div className="product-list">
                        {group.items.map(product => (
                            <ProductCard
                                key={product?.product_id}
                                product={product}
                                onNavigate={() => navigate('/tech/customer/' + customer_id + '/product/' + product?.product_id + '/about')}
                            />
                        ))}
                    </div>
                </React.Fragment>
            ))}
        </div>
    )
}

export default ProductList
