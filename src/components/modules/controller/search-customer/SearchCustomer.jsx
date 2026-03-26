import React, { useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { TbDownload, TbMoodSearch, TbPencilPlus } from 'react-icons/tb'
import { api } from '../../../../api'
import Button from '../../../UI_Primitives/buttons/Button'
import SearchCustomerByKey from '../../../forms/controller/search-customer/SearchCustomerByKey'
import Table from '../../../UI_Primitives/table/Table'
import { modal } from '../../../../redux/features/non_persisted/miniSystemSlice'
import ServiceRegistration from '../../../forms/controller/registration/ServiceRegistration'



const SearchCustomer = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.user)
    const [searchParams] = useSearchParams();

    const getSortField = (id) => ({
        'CID': 'cid',
        'Customer': 'full_name',
        'Address': 'address',
        'Place': 'place',
        'Post offices': 'post',
        'City': 'city_name'
    })[id] || id

    const openRegistrationPopUp = (customer) => {
        dispatch(modal.push({ show: true, title: "Register Service", body: <ServiceRegistration customerName={customer?.Customer} customerId={customer?.CID} /> }))
    }

    const tableColumns = useMemo(() => {

        const tempColumns = [
            { header: 'CID', accessorKey: 'CID', enableHiding: false },
            { header: 'Customer', accessorKey: 'Customer' },
            { header: 'Address', accessorKey: 'Address' },
            { header: 'Place', accessorKey: 'Place' },
            { header: 'Post offices', accessorKey: 'Post offices' },
            { header: 'Pin Code', accessorKey: 'Pin Code' },
            { header: 'City', accessorKey: 'City' }
        ]

        if (user?.allowed_origins?.includes('vfcr_sr_reg_write')) {
            tempColumns.push({
                header: 'Actions',
                enableSorting: false,
                enableColumnFilter: false,
                meta: { disableRowClick: true },
                cell: ({ row }) => (
                    <div className="action-buttons" style={{ display: 'flex', justifyContent: 'center' }}>
                        <Button title={'Register Service'} outlined severity={'primary'} icon={<TbPencilPlus />} rounded size='small'
                            onClick={() => openRegistrationPopUp(row.original)} />
                    </div>
                )
            })
        }

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
            key: searchParams.get('key') || '',
            key_type: searchParams.get('key_type') || '',
            city_id: searchParams.get('city_id') || '',
            post: searchParams.get('post') || ''
        })

        const res = await api.vfCv2Axios.get(`/customer/search?${params}`)

        const transformed = res.data.map((item, index) => {
            const globalIndex = page * pageSize + index + 1

            return {
                Index: globalIndex,
                'CID': item?.cid,
                "Customer": item?.full_name,
                "Address": item?.address,
                "Place": item?.place,
                "Post offices": item?.post,
                "City": item?.city_name,
                city_id: item?.city_id,
                "Pin Code": item?.pin_code,
                _rowStyle: { cursor: 'pointer' },
                _rowNavigateUrl: `/404`
            }
        })

        return { data: transformed, total: res.total }
        // eslint-disable-next-line
    }, [navigate, searchParams.get('key'), searchParams.get('key_type'), searchParams.get('city_id'), searchParams.get('post')])

    // Content
    return (
        <div className="customer-search-comp">
            <Table
                tableKey="search_customer_table"
                columns={tableColumns}
                fetchFn={fetchCustomerData}
                columnVisible={{ 'Pin Code': false, "City": false }}
                queryKey={['search_customer_table', searchParams.get('key'), searchParams.get('key_type'), searchParams.get('city_id'), searchParams.get('post')]}
                topComponents={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Button label={'Excel'} rounded outlined size='small' icon={<TbDownload />} />
                        <Button label={'Edit search'} rounded outlined size='small' icon={<TbMoodSearch />}
                            onClick={() => dispatch(modal.push({ show: true, title: "Search Customers", body: <SearchCustomerByKey /> }))} />
                    </div>
                }
            />
        </div>
    )
}

export default SearchCustomer