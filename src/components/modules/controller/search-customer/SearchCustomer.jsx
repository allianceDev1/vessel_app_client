import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { TbDownload, TbFilePencil, TbMoodSadDizzy, TbMoodSearch, TbPencilPlus } from 'react-icons/tb'
import { api } from '../../../../api'
import ErrorState from '../../../UI_Primitives/ui-states/ErrorState'
import SkeletonGrid from '../../../UI_Primitives/skeleton/SkeletonGrid'
import Button from '../../../UI_Primitives/buttons/Button'
import SearchCustomerByKey from '../../../forms/tech/search-customer/SearchCustomerByKey'
import Table from '../../../UI_Primitives/table/Table'
import Badge from '../../../UI_Primitives/badge/Badge'
import { modal } from '../../../../redux/features/non_persisted/miniSystemSlice'
import { getContrastText } from '../../../../utils/helpers/color-utils'
import Dropdown from '../../../UI_Primitives/dropdown/Dropdown'



const SearchCustomer = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.user)
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState('fetch')
    const [customerList, setCustomerList] = useState([])
    const [tableColumns, setTableColumns] = useState([])
    const [tableRows, setTableRows] = useState([])
    const [error, setError] = useState({ error: false, title: null, message: null })
    const [viewType, setViewType] = useState('Group View')




    const fetchApi = async () => {
        try {
            setLoading('fetch')
            setError({ error: false, title: null, message: null })

            const customers = await api.vfCv2Axios.get(`/customer/search?${searchParams.toString()}`)
            setCustomerList(customers)

        } catch (error) {
            setError({ error: true, title: error.message })
        } finally {
            setLoading('')
        }
    }

    useEffect(() => {
        fetchApi()
        // eslint-disable-next-line
    }, [searchParams.get('key'), searchParams.get('key_type'), searchParams.get('city_id'), searchParams.get('post')])

    useEffect(() => {

        if (!customerList?.length) {
            return;
        }

        const tempColumns = [
            { header: 'CID', accessorKey: 'CID', enableHiding: false },
            { header: 'Customer', accessorKey: 'Customer' },
            { header: 'Address', accessorKey: 'Address' },
            { header: 'Place', accessorKey: 'Place' },
            { header: 'Post offices', accessorKey: 'Post offices' },
            { header: 'Pin Code', accessorKey: 'Pin Code' },
            { header: 'City', accessorKey: 'City' }
        ]

        setTableRows(customerList?.map((customer) => ({
            'CID': customer?.cid,
            "Customer": customer?.full_name,
            "Address": customer?.address,
            "Place": customer?.place,
            "Post offices": customer?.post,
            "City": customer?.city_name,
            city_id: customer?.city_id,
            "Pin Code": customer?.pin_code
        })))


        if (user?.allowed_origins?.includes('vfcr_customers_write')) {
            tempColumns.push({
                header: 'Actions',
                cell: ({ row }) => (
                    <div className="action-buttons" style={{ display: 'flex', justifyContent: 'center' }}>
                        <Button title={'Register'} severity={'warning'} icon={<TbPencilPlus />} rounded size='small' />
                    </div>
                ),
                enableSorting: false,
                enableColumnFilter: false,
            })
        }

        setTableColumns(tempColumns)

        // eslint-disable-next-line
    }, [customerList])

    // loading
    if (loading === 'fetch') {
        return <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <SkeletonGrid rows={1} columns={1} height={50} />
            <SkeletonGrid rows={1} columns={1} height={400} />
        </div>
    }

    // Error
    if (error?.error) {
        return <ErrorState
            hight='70vh'
            title={error?.title}
            message={error?.message}
            icon={<TbMoodSadDizzy />}
            footer={<div>
                <Button label={'Search again'} rounded outlined size='small' icon={<TbMoodSearch />} style={{ width: '140px' }}
                    onClick={() => dispatch(modal.push({ show: true, title: "Search Customers", body: <SearchCustomerByKey /> }))} />
            </div>}
        />
    }

    // Content
    return (
        <div className="customer-search-comp">
            <Table
                columns={tableColumns}
                data={tableRows}
                columnVisible={{ 'Pin Code': false, "City": false }}
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