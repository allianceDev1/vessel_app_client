import React, { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { convertIsoToAmPm, isoToDDMonYYYY } from '../../../../utils/helpers/date-helpers'
import { api } from '../../../../api'
import Table from '../../../UI_Primitives/table/Table'
import Badge from '../../../UI_Primitives/badge/Badge'
import { getContrastText } from '../../../../utils/helpers/color-utils'
import { toStandardText } from '../../../../utils/helpers/text-formatting'

const CompletedServiceTable = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const listType = searchParams.get('view_type') || 'customer';
    const [columnVisibility, setColumnVisibility] = useState({})


    const getSortField = (id) => ({
        'Date': 'date',
        'Customer Name': 'customer_name',
        'Post Office': 'post',
        'City': 'city_name',
        'Package Name': 'package_name',
        'Category': 'category_id',
        'Reg No': 'registration_id',
        'Product Id': 'product_id',
    })[id] || id

    const allowedKeys = ['fl', 'view_type'];

    const filteredParams = Object.fromEntries(
        [...searchParams.entries()].filter(([key]) =>
            !allowedKeys.includes(key)
        )
    );

    const fetchServiceData = useMemo(() => async ({ page, pageSize, search, sort }) => {

        if (searchParams.get('fl') !== 'Yes') return { data: [], total: 0 }

        const sortBy = sort?.[0] ? getSortField(sort[0].id) : ''
        const sortDir = sort?.[0] ? (sort[0].desc ? 'desc' : 'asc') : ''

        const params = new URLSearchParams({
            page,
            limit: pageSize,
            sort_by: sortBy,
            sort_dir: sortDir,
            ...(search ? { search } : {}),
            ...filteredParams
        })

        const res = await api.vfCv2Axios.get(`/service/completed/list/${listType}?${params}`)

        const transformed = res.data.map((item, index) => {
           

            switch (listType) {
                case 'customer':
                    return {
                        "Date": item.date ? isoToDDMonYYYY(new Date(item.date)) : '',
                        'CID': item.customer_id,
                        "Customer name": item.customer_name,
                        'Post Office': item.post,
                        'City': item.city_name,
                        'Service Srl No': item.service_srl_no || '',
                        'Reg No': item.registration_id || '',
                        'Technician': item.technician || '',
                        'In Time': item.in_time ? convertIsoToAmPm(new Date(item.in_time)) : '',
                        'Out Time': item.out_time ? convertIsoToAmPm(new Date(item.out_time)) : '',
                        _rowStyle: { cursor: 'pointer' },
                        _rowNavigateUrl: `/controller/completed/service-job/${item.service_srl_no}`,
                    }

                case 'product':
                    return {
                        "Date": item.date ? isoToDDMonYYYY(new Date(item.date)) : '',
                        'CID': item.customer_id,
                        "Customer name": item.customer_name,
                        'Product Id': item.product_id,
                        'Origin': toStandardText(item.origin_category),
                        'Service': item.category_id,
                        'Service Srl No': item.service_srl_no,
                        'Reg No': item.registration_id,
                        'Technician': item.technician,
                        package_id: item.package_id,
                        package_name: item.package_name,
                        package_color_code: item.package_color_code,
                        _rowStyle: { cursor: 'pointer' },
                        _rowNavigateUrl: `/controller/completed/service-job/${item.service_srl_no}/pl/${item.product_id}`,
                    }

                default:
                    return item
            }
        })

        return { data: transformed, total: res.total }
        // eslint-disable-next-line
    }, [navigate, searchParams.get('view_type'), searchParams.get('product_id'), searchParams.get('customer_id'), searchParams.get('technician_id'),
       // eslint-disable-next-line
        searchParams.get('from_date'), searchParams.get('end_date'), searchParams.get('reg_no')])

    const tableColumns = useMemo(() => {

        switch (listType) {
            case 'customer':

                setColumnVisibility({
                    'Post Office': false,
                    'Reg No': false
                })

                return [
                    { header: 'Date', accessorKey: 'Date', enableHiding: false },
                    { header: 'CID', accessorKey: 'CID', enableHiding: false },
                    { header: 'Customer name', accessorKey: 'Customer name' },
                    { header: 'Post Office', accessorKey: 'Post Office' },
                    { header: 'City', accessorKey: 'City' },
                    { header: 'Service Srl No', accessorKey: 'Service Srl No', enableSorting: false },
                    { header: 'Reg No', accessorKey: 'Reg No' },
                    { header: 'Technician', accessorKey: 'Technician', enableSorting: false },
                    { header: 'In Time', accessorKey: 'In Time', enableSorting: false },
                    { header: 'Out Time', accessorKey: 'Out Time', enableSorting: false },
                ]

            case 'product': {
                setColumnVisibility({
                    'Customer name': false,
                    'Reg No': false
                })

                return [
                    { header: 'Date', accessorKey: 'Date', enableHiding: false },
                    { header: 'CID', accessorKey: 'CID', enableHiding: false },
                    { header: 'Customer name', accessorKey: 'Customer name' },
                    { header: 'Product Id', accessorKey: 'Product Id', },
                    { header: 'Origin', accessorKey: 'Origin', },
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
                    { header: 'Service', accessorKey: 'Service' },
                    { header: 'Service Srl No', accessorKey: 'Service Srl No' },
                    { header: 'Reg No', accessorKey: 'Reg No', enableSorting: false },
                    { header: 'Technician', accessorKey: 'Technician', enableSorting: false },
                ]
            }

            default:
                return []
        }
    }, [listType])  // eslint-disable-line react-hooks/exhaustive-deps




    return (
        <div className="completed-service-table-container">
            <Table
                key={listType}
                columns={tableColumns}
                fetchFn={fetchServiceData}
                columnVisible={columnVisibility}
                queryKey={['completed_service_table_list', listType, searchParams.get('product_id'), searchParams.get('customer_id'),
                    searchParams.get('technician_id'), searchParams.get('from_date'), searchParams.get('end_date'), searchParams.get('reg_no')]}
                tableKey="completed_service"
            />
        </div>
    )
}

export default CompletedServiceTable