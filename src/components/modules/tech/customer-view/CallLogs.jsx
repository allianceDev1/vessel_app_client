import React, { useMemo } from 'react'
import { useParams } from 'react-router-dom';
import { api } from '../../../../api';
import Pagination from '../../../UI_Primitives/pagination/Pagination';
import CallLogItem from './CallLogItem';

const CallLogs = () => {
    const { customer_id } = useParams();


    const fetchData = useMemo(() => async ({ page, pageSize }) => {

        const params = new URLSearchParams({ page, limit: pageSize })
        const res = await api.vfTv2Axios.get(`/customer/${customer_id}/call-logs?${params}`)

        const transformed = res.data.map((item, index) => {
            return {
                id: item?.call_uuid,
                ...item
            }
        })

        return { data: transformed, total: res.total }
        // eslint-disable-next-line
    }, [])

    return (
        <div className="controller-customer-call-logs-container">
            <Pagination
                fetchFn={fetchData}
                queryKey="products"
                listKey="products"
                searchEnabled={false}
                layout="grid"
                gridRepeat='repeat(auto-fit,minmax(250px,1fr))'
                skeletonGrid={{
                    rows: 10,
                    columns: 1,
                    responsive : {},
                    hight : '70px'
                }}
                renderItem={(item, helpers) => (
                    <CallLogItem
                        data={item}
                    // selected={helpers.selected}
                    // onSelect={helpers.toggleSelect}
                    />
                )}
            />
        </div>
    )
}

export default CallLogs