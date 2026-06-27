import React, { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { isoToDDMonYYYY } from '../../../../utils/helpers/date-helpers'
import { api } from '../../../../api'
import Table from '../../../UI_Primitives/table/Table'
import { SERVICE_REG_STATUS_LIST } from '../../../../assets/javascript/pre_data/service'



const RegisteredServiceTable = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const listType = searchParams.get('view_type') || 'product';
    const [columnVisibility, setColumnVisibility] = useState({})

    const getSortField = (id) => ({
        'Reg No': 'reg_no',
        'Reg Date': 'reg_date',
        'Customer name': 'customer_name',
        'CID': 'customer_id',
        'Place': 'place',
        'Post': 'post',
        'Status': 'registration_status',
        'Action Date': 'action_date'
    })[id] || id

    const allowedKeys = ['fl'];

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

        const res = await api.vfCv2Axios.get(`/service-registration/list?${params}`)

        const transformed = res.data.map((item, index) => {
            const globalIndex = page * pageSize + index + 1
            const statusColor = SERVICE_REG_STATUS_LIST.find((s) => s.key === item.registration_status)

            return {
                Index: globalIndex,
                'Reg No': item.reg_no,
                'Reg Date': item.reg_date ? isoToDDMonYYYY(new Date(item.reg_date)) : '',
                'CID': item.customer_id,
                'Customer name': item.customer_name,
                'Place': item.place,
                'Post': item.post,
                'City': item.city_name,
                'Service Type': item.service_type,
                'Technician': item.technician,
                'Status': item.status_text,
                'Action Date': isoToDDMonYYYY(new Date(item.action_date)),
                registration_status: item.registration_status,
                _rowStyle: { cursor: 'pointer' },
                _rowNavigateUrl: `/controller/registered/${item.reg_no}`,
                _cellStyle: {
                    Status: {
                        backgroundColor: statusColor.bg,
                        color: statusColor.text
                    }
                },
            }
        })

        return { data: transformed, total: res.total }
        // eslint-disable-next-line
    }, [navigate, searchParams.get('id_key'), searchParams.get('service_type'), searchParams.get('status'), searchParams.get('city_id'), searchParams.get('from_date'), searchParams.get('end_date'), searchParams.get('rnd')])

    const tableColumns = useMemo(() => {

        setColumnVisibility({
            'Place': false,
            'Post': false,
            'City': false,
            'Reg Date': false,

        })

        const cols = [
            { header: 'Reg No', accessorKey: 'Reg No', enableHiding: false },
            { header: 'Reg Date', accessorKey: 'Reg Date' },
            { header: 'CID', accessorKey: 'CID' },
            { header: 'Customer name', accessorKey: 'Customer name' },
            { header: 'Place', accessorKey: 'Place' },
            { header: 'Post', accessorKey: 'Post' },
            { header: 'City', accessorKey: 'City', enableSorting: false },
            { header: 'Service Type', accessorKey: 'Service Type', enableSorting: false },
            { header: 'Technician', accessorKey: 'Technician', enableSorting: false },
            { header: 'Status', accessorKey: 'Status' },
            { header: 'Action Date', accessorKey: 'Action Date' }
        ]

        return cols

    }, [])  // eslint-disable-line react-hooks/exhaustive-deps



    return (
        <div className="registered-service-table-container">
            <Table
                key={listType}
                columns={tableColumns}
                fetchFn={fetchServiceData}
                columnVisible={columnVisibility}
                queryKey={['registered_service_table_list', searchParams.get('status'), searchParams.get('id_key'),
                    searchParams.get('service_type'), searchParams.get('city_id'),
                    searchParams.get('from_date'), searchParams.get('end_date'), searchParams.get('rnd')]}
                tableKey="registered_service"
            />
        </div>
    )
}

export default RegisteredServiceTable