import React, { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { isoToDDMonYYYY } from '../../../../utils/helpers/date-helpers'
import { api } from '../../../../api'
import Table from '../../../UI_Primitives/table/Table'
import Badge from '../../../UI_Primitives/badge/Badge'
import { getContrastText } from '../../../../utils/helpers/color-utils'
import { useDispatch, useSelector } from 'react-redux'
import Button from '../../../UI_Primitives/buttons/Button'
import ServiceRegistration from '../../../forms/controller/registration/ServiceRegistration'
import AddCallLog from '../../../forms/common/add-call-log/AddCallLog'
import { TbArrowForwardUpDouble, TbMessagePlus, TbPencilPlus } from 'react-icons/tb'
import { modal } from '../../../../redux/features/non_persisted/miniSystemSlice'
import PostponeService from '../../../forms/common/postpone-service/PostponeService'

const UpcomingServiceTable = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();
    const listType = searchParams.get('view_type') || 'product';
    const [columnVisibility, setColumnVisibility] = useState({})
    const { user } = useSelector((state) => state.user)


    const getSortField = (id) => ({
        'Customer name': 'customer_name',
        'CID': 'customer_id',
        'Place': 'place',
        'Post office': 'post'
    })[id] || id

    const allowedKeys = ['fl', 'view_type'];

    const filteredParams = Object.fromEntries(
        [...searchParams.entries()].filter(([key]) =>
            !allowedKeys.includes(key)
        )
    );

    const openRegistrationPopUp = ({ customer_id, customer_name, service_type }) => {
        dispatch(modal.push({
            show: true, title: "Register Service",
            body: <ServiceRegistration customerName={customer_name} customerId={customer_id} serviceType={service_type || ''} />
        }))
    }

    const openEnterCallLogPopUp = ({ customer_id }) => {
        dispatch(modal.push({
            show: true, title: "Enter Call Log",
            body: <AddCallLog customerId={customer_id} isController={true} />
        }))
    }

    const openPostponePopUp = ({ customer_id, product }) => {
        dispatch(modal.push({
            show: true, title: "Postpone Service",
            body: <PostponeService customerId={customer_id} isController={true} products={[
                { ...product }
            ]} />
        }))
    }

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

        const res = await api.vfCv2Axios.get(`/service/upcoming/list/${listType}?${params}`)

        const transformed = res.data.map((item, index) => {
            const globalIndex = page * pageSize + index + 1

            switch (listType) {
                case 'customer':
                    return {
                        Index: globalIndex,
                        'CID': item.customer_id,
                        "Customer name": item.customer_name,
                        'Place': item.place,
                        'Post office': item.post,
                        'City': item.city_name,
                        'Service Date': item.next_service_date ? isoToDDMonYYYY(new Date(item.next_service_date)) : '',
                        'Expire Date': item.expire_date ? isoToDDMonYYYY(new Date(item.expire_date)) : '',
                        _rowStyle: { cursor: 'pointer' },
                        _rowNavigateUrl: `/controller/customer/${item?.customer_id}/about`
                    }

                case 'product':
                    return {
                        Index: globalIndex,
                        'CID': item.customer_id,
                        "Customer name": item.customer_name,
                        'Place': item.place,
                        'Post office': item.post,
                        'City': item.city_name,
                        'Product': `${item.product_id} - ${item.product_name}`,
                        'Service': `${item.service_type} - S${item.service_index || 1}`,
                        'Service Date': item.next_service_date ? isoToDDMonYYYY(new Date(item.next_service_date)) : '',
                        'Expire Date': item.expire_date ? isoToDDMonYYYY(new Date(item.expire_date)) : '',
                        package_id: item.package_id,
                        product_id: item.product_id,
                        product_name: item.product_name,
                        service_type: item.service_type,
                        package_name: item.package_name,
                        package_color_code: item.package_color_code,
                        _rowStyle: { cursor: 'pointer' },
                        _rowNavigateUrl: `/controller/customer/${item?.customer_id}/product/${item.product_id}/about`
                    }

                default:
                    return item
            }
        })

        return { data: transformed, total: res.total }
        // eslint-disable-next-line
    }, [navigate, searchParams.get('view_type'), searchParams.get('product_type'), searchParams.get('service_type'), searchParams.get('package_id'), searchParams.get('city_id'), searchParams.get('service_index'), searchParams.get('from_date'), searchParams.get('end_date')])

    const tableColumns = useMemo(() => {

        switch (listType) {
            case 'customer':

                setColumnVisibility({
                    'Place': false,
                })

                const cols = [
                    { header: 'Index', accessorKey: 'Index', enableHiding: false, enableSorting: false },
                    { header: 'CID', accessorKey: 'CID', enableHiding: false },
                    { header: 'Customer name', accessorKey: 'Customer name' },
                    { header: 'Place', accessorKey: 'Place' },
                    { header: 'Post office', accessorKey: 'Post office' },
                    { header: 'City', accessorKey: 'City', enableSorting: false },
                    { header: 'Service Date', accessorKey: 'Service Date', enableSorting: false },
                    { header: 'Expire Date', accessorKey: 'Expire Date', enableSorting: false },
                ]

                if (user?.allowed_origins?.some(a => ['vessel_c_writer', 'vessel_c_admin'].includes(a))) {
                    cols.push({
                        header: 'Actions',
                        enableSorting: false,
                        enableColumnFilter: false,
                        meta: { disableRowClick: true },
                        cell: ({ row }) => (
                            <div className="action-buttons" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '3px' }}>

                                <Button rounded outlined title='Register Service'
                                    icon={<TbPencilPlus />} size='small' severity={'primary'}
                                    onClick={() => openRegistrationPopUp({ customer_id: row.original.CID, customer_name: row.original['Customer name'] })}
                                />
                                <Button rounded title='Enter Call Log'
                                    icon={<TbMessagePlus />} size='small' outlined
                                    onClick={() => openEnterCallLogPopUp({ customer_id: row.original.CID })}
                                />

                            </div>
                        ),
                    })
                }

                return cols

            case 'product': {
                setColumnVisibility({
                    'Place': false,
                    'Post office': false,
                    'City': false,
                    'Product': true,
                    'Service': true,
                    'Service Date': true,
                    'Expire Date': true
                })

                const cols = [
                    { header: 'Index', accessorKey: 'Index', enableHiding: false, enableSorting: false },
                    { header: 'CID', accessorKey: 'CID', enableHiding: false },
                    { header: 'Customer name', accessorKey: 'Customer name' },
                    { header: 'Place', accessorKey: 'Place' },
                    { header: 'Post office', accessorKey: 'Post office', },
                    { header: 'City', accessorKey: 'City', enableSorting: false },
                    { header: 'Product', accessorKey: 'Product', enableSorting: false },
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
                    { header: 'Service', accessorKey: 'Service', enableSorting: false },
                    { header: 'Service Date', accessorKey: 'Service Date', enableSorting: false },
                    { header: 'Expire Date', accessorKey: 'Expire Date', enableSorting: false },
                ]

                if (user?.allowed_origins?.some(a => ['vessel_c_writer', 'vessel_c_admin'].includes(a))) {
                    cols.push({
                        header: 'Actions',
                        enableSorting: false,
                        enableColumnFilter: false,
                        meta: { disableRowClick: true },
                        cell: ({ row }) => (
                            <div className="action-buttons" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '3px' }}>

                                <Button rounded outlined title='Register Service'
                                    icon={<TbPencilPlus />} size='small' severity={'primary'}
                                    onClick={() => openRegistrationPopUp({
                                        customer_id: row.original.CID, customer_name: row.original['Customer name'],
                                        service_type: row.original.service_type
                                    })}
                                />
                                <Button rounded title='Enter Call Log'
                                    icon={<TbMessagePlus />} size='small' outlined
                                    onClick={() => openEnterCallLogPopUp({ customer_id: row.original.CID })}
                                />
                                <Button rounded severity={row.original.service_type !== 'SERVICE' ? '' : 'danger'}
                                    outlined title='Postpone' icon={<TbArrowForwardUpDouble />} size='small'
                                    onClick={() => openPostponePopUp({
                                        customer_id: row.original.CID,
                                        product: {
                                            product_id: row.original.product_id,
                                            product_name: row.original.product_name
                                        }
                                    })} disabled={row.original.service_type !== 'SERVICE'}
                                />

                            </div>
                        ),
                    })
                }
                return cols
            }

            default:
                return []
        }
    }, [listType])  // eslint-disable-line react-hooks/exhaustive-deps




    return (
        <div className="upcoming-service-table-container">
            <Table
                key={listType}
                columns={tableColumns}
                fetchFn={fetchServiceData}
                columnVisible={columnVisibility}
                queryKey={['upcoming_service_table_list', listType, searchParams.get('product_type'),
                    searchParams.get('service_type'), searchParams.get('package_id'), searchParams.get('city_id'),
                    searchParams.get('service_index'), searchParams.get('from_date'), searchParams.get('end_date')]}
                tableKey="upcoming_service"
            />
        </div>
    )
}

export default UpcomingServiceTable