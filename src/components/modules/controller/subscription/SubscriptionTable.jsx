import React, { useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { isoToDDMonYYYY } from '../../../../utils/helpers/date-helpers'
import { api } from '../../../../api'
import Table from '../../../UI_Primitives/table/Table'
import { PACKAGE_STATUSES_LIST, PACKAGE_STATUSES_TEXT } from '../../../../assets/javascript/pre_data/package'



const SubscriptionTable = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const columnVisibility = {
    'Product Id': false,
    'Expired At': false,
  }

  const tableColumns = [
    { header: 'Idx', accessorKey: 'Idx', enableSorting: false },
    { header: 'Srl No', accessorKey: 'Srl No', enableHiding: false },
    { header: 'Title', accessorKey: 'Title' },
    { header: 'Status', accessorKey: 'Status' },
    { header: 'CID', accessorKey: 'CID' },
    { header: 'Product Id', accessorKey: 'Product Id' },
    { header: 'Start Date', accessorKey: 'Start Date' },
    { header: 'Expire Date', accessorKey: 'Expire Date' },
    { header: 'Expired At', accessorKey: 'Expired At' },
    { header: 'Plan', accessorKey: 'Plan' }
  ]

  const getSortField = (id) => ({
    'Srl No': 'serial_number',
    'Title': 'package_name',
    'Status': 'package_status',
    'CID': 'customer_id',
    'Product Id': 'product_id',
    'Start Date': 'start_date',
    'Expire Date': 'expire_date',
    'Expired At': 'expired_at',
    'Plan': 'plan_amount'
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

    const res = await api.vfCv2Axios.get(`/package/filter?${params}`)

    const transformed = res.data.map((item, index) => {
      const globalIndex = page * pageSize + index + 1

      return {
        Idx: globalIndex,
        'Srl No': item.serial_number,
        'Title': item.package_name,
        'Status': PACKAGE_STATUSES_TEXT?.[item?.package_status],
        'CID': item.customer_id,
        'Product Id': item.product_id,
        'Start Date': item.start_date ? isoToDDMonYYYY(new Date(item.start_date)) : '',
        'Expire Date': item.expire_date ? isoToDDMonYYYY(new Date(item.expire_date)) : '',
        'Expired At': item.expired_at ? isoToDDMonYYYY(new Date(item.expired_at)) : '',
        'Plan': `₹ ${(item.plan_amount).toLocaleString('en-IN')}`,
        _rowStyle: { cursor: 'pointer' },
        _rowNavigateUrl: `/controller/service-package/${item.serial_number}/about`,
        _cellStyle: {
          Title: {
            color: item.color_code
          },
          Status: {
            backgroundColor: PACKAGE_STATUSES_LIST.find((s) => s.key === item.package_status)?.bg,
            color: PACKAGE_STATUSES_LIST.find((s) => s.key === item.package_status)?.text
          }
        },
      }
    })

    return { data: transformed, total: res.total }
    // eslint-disable-next-line
  }, [navigate, searchParams.get('statuses'), searchParams.get('package_ids'), searchParams.get('date_type'), searchParams.get('from_date'), searchParams.get('end_date'), searchParams.get('blacklisted')])




  return (
    <div className="registered-service-table-container">
      <Table
        columns={tableColumns}
        fetchFn={fetchServiceData}
        columnVisible={columnVisibility}
        queryKey={['subsc_table', searchParams.get('statuses'), searchParams.get('package_ids'), searchParams.get('date_type'), searchParams.get('from_date'), searchParams.get('end_date'), searchParams.get('blacklisted')]}
        tableKey="subsc_table"
      />
    </div>
  )
}

export default SubscriptionTable