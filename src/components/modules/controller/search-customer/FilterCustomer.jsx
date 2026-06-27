import React, { useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { TbDownload } from 'react-icons/tb'
import { api } from '../../../../api'
import { toStandardText } from '../../../../utils/helpers/text-formatting'
import { getContrastText } from '../../../../utils/helpers/color-utils'
import Button from '../../../UI_Primitives/buttons/Button'
import Table from '../../../UI_Primitives/table/Table'
import Badge from '../../../UI_Primitives/badge/Badge'



const FilterCustomer = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.user)
    const [searchParams] = useSearchParams();

    const getSortField = (id) => ({
        "CID": "customer_id"
    })[id] || id

    const tableColumns = useMemo(() => {

        const tempColumns = [
            { header: 'CID', accessorKey: 'CID', enableHiding: false },
            { header: 'Customer', accessorKey: 'Customer', enableSorting: false },
            { header: 'Post offices', accessorKey: 'Post offices', enableSorting: false },
            { header: 'City', accessorKey: 'City', enableSorting: false },
            { header: 'Product Type', accessorKey: 'Product Type', enableSorting: false },
            { header: 'Product Id', accessorKey: 'Product Id', enableSorting: false },
            { header: 'Origin', accessorKey: 'Origin', enableSorting: false },
            {
                header: 'Package',
                enableSorting: false,
                enableColumnFilter: false,
                meta: { style: { textAlign: 'center' } },
                cell: ({ row }) => {
                    if (row.original.package_id) {
                        return <Badge value={row.original.package_name}
                            style={{
                                backgroundColor: row.original.package_color_code,
                                color: getContrastText(row.original.package_color_code)
                            }} />
                    }
                },
            },
        ]

        return tempColumns
        // eslint-disable-next-line
    }, [user])

    const fetchCustomerData = useMemo(() => async ({ page, pageSize, search, sort }) => {

        const sortBy = sort?.[0] ? getSortField(sort[0].id) : ''
        const sortDir = sort?.[0] ? (sort[0].desc ? 'desc' : 'asc') : ''

        const params = new URLSearchParams({
            page,
            limit: pageSize,
            sort_by: sortBy,
            sort_dir: sortDir,
            ...(search ? { search } : {}),
            city_id: searchParams.get('city_id') ? searchParams.get('city_id') : '',
            sku: searchParams.get('sku') ? searchParams.get('sku') : '',
            installation_mode: searchParams.get('installation_mode') ? searchParams.get('installation_mode') : '',
            product_type: searchParams.get('product_type') ? searchParams.get('product_type') : '',
            origin_category: searchParams.get('origin_category') ? searchParams.get('origin_category') : '',
            package_filter_type: searchParams.get('package_filter_type') ? searchParams.get('package_filter_type') : '',
            package_ids: searchParams.get('package_ids') ? searchParams.get('package_ids') : '',
            date_filtration_type: searchParams.get('date_filtration_type') ? searchParams.get('date_filtration_type') : '',
            from_date: searchParams.get('from_date') ? searchParams.get('from_date') : '',
            end_date: searchParams.get('end_date') ? searchParams.get('end_date') : '',
        })

        const res = await api.vfCv2Axios.get(`/product/filter?${params}`)

        const transformed = res.data.map((item, index) => {
            const globalIndex = page * pageSize + index + 1

            return {
                Index: globalIndex,
                'CID': item?.customer_id,
                "Customer": item?.customer_name,
                "Post offices": item?.post,
                "City": item?.city_name,
                "Product Id": item?.product_id,
                "Origin": toStandardText(item?.origin_category),
                "Product Type": toStandardText(item?.product_type),
                city_id: item?.city_id,
                package_name: item?.package_name,
                package_id: item?.package_id,
                package_color_code: item?.package_color_code,
                _rowStyle: { cursor: 'pointer' },
                _rowNavigateUrl: `/controller/customer/${item?.customer_id}/product/${item?.product_id}/about`
            }
        })

        return { data: transformed, total: res.total }
        // eslint-disable-next-line
    }, [navigate, searchParams.get('city_id'), searchParams.get('sku'), searchParams.get('installation_mode'), searchParams.get('product_type'),
        // eslint-disable-next-line
        searchParams.get('origin_category'), searchParams.get('package_filter_type'), searchParams.get('package_ids'), searchParams.get('date_filtration_type'),
        // eslint-disable-next-line
        searchParams.get('from_date'), searchParams.get('end_date')
    ])

    // Content
    return (
        <div className="customer-search-comp">
            <Table
                tableKey="filter_customer_product_table"
                columns={tableColumns}
                fetchFn={fetchCustomerData}
                columnVisible={{ 'Pin Code': false, "City": false }}
                queryKey={['filter_customer_product_table', searchParams.get('city_id'), searchParams.get('sku'), searchParams.get('installation_mode'), searchParams.get('product_type'),
                    searchParams.get('origin_category'), searchParams.get('package_filter_type'), searchParams.get('package_ids'), searchParams.get('date_filtration_type'),
                    searchParams.get('from_date'), searchParams.get('end_date')]}
                topComponents={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Button label={'Excel'} rounded outlined size='small' icon={<TbDownload />} />
                    </div>
                }
            />
        </div>
    )
}

export default FilterCustomer