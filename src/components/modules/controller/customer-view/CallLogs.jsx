import React, { useMemo } from 'react'
import Table from '../../../UI_Primitives/table/Table'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { modal } from '../../../../redux/features/non_persisted/miniSystemSlice';
import ServiceRegistration from '../../../forms/controller/registration/ServiceRegistration';
import Button from '../../../UI_Primitives/buttons/Button';
import { TbPencilPlus } from 'react-icons/tb';
import { api } from '../../../../api';
import { convertIsoToAmPm, isoToDDMonYYYY } from '../../../../utils/helpers/date-helpers';

const CallLogs = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.user)
    const { customer_id } = useParams();
    const [searchParams] = useSearchParams();

    const getSortField = (id) => ({
        'Date': 'called_at',
        'Caller': 'called_by'
    })[id] || id

    const openRegistrationPopUp = (customer) => {
        dispatch(modal.push({ show: true, title: "Register Service", body: <ServiceRegistration customerName={customer?.Customer} customerId={customer?.CID} /> }))
    }

    const tableColumns = [
        { header: 'Date', accessorKey: 'Date', enableHiding: false },
        { header: 'Caller', accessorKey: 'Caller' },
        { header: 'Caller Category', accessorKey: 'Caller Category', enableSorting: false },
        { header: 'Message', accessorKey: 'Message', enableSorting: false }
    ]

    const fetchData = useMemo(() => async ({ page, pageSize, search, sort }) => {

        const sortBy = sort?.[0] ? getSortField(sort[0].id) : ''
        const sortDir = sort?.[0] ? (sort[0].desc ? 'desc' : 'asc') : ''

        const params = new URLSearchParams({
            page,
            limit: pageSize,
            sort_by: sortBy,
            sort_dir: sortDir
        })

        const res = await api.vfCv2Axios.get(`/customer/${customer_id}/call-logs?${params}`)

        const transformed = res.data.map((item, index) => {
            const globalIndex = page * pageSize + index + 1

            return {
                'Date': `${isoToDDMonYYYY(item?.called_at)}, ${convertIsoToAmPm(item?.called_at)}`,
                "Caller": item?.called_by,
                "Caller Category": item?.caller_category,
                "Message": item?.message
            }
        })

        return { data: transformed, total: res.total }
        // eslint-disable-next-line
    }, [])




    return (
        <div className="controller-customer-call-logs-container" style={{ marginTop: '20px' }}>
            <Table
                tableKey="customer_call_logs"
                searchEnabled={false}
                columns={tableColumns}
                fetchFn={fetchData}
                queryKey={['customer_call_logs', customer_id]}
            />
        </div>
    )
}

export default CallLogs