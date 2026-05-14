import React from 'react'
import { useParams, } from 'react-router-dom'
import { isoToDDMonYYYY } from '../../../../utils/helpers/date-helpers'
import { api } from '../../../../api'
import Table from '../../../UI_Primitives/table/Table'
import { useQuery } from '@tanstack/react-query'
import ErrorState from '../../../UI_Primitives/ui-states/ErrorState'
import { TbTable } from 'react-icons/tb'
import SkeletonGrid from '../../../UI_Primitives/skeleton/SkeletonGrid'



const FreezeHistory = () => {

    const { serial_number } = useParams();

    const cols = [
        { header: 'Index', accessorKey: 'Index' },
        { header: 'Date', accessorKey: 'Date', enableHiding: false },
        { header: 'Event Type', accessorKey: 'Event Type' },
        { header: 'By', accessorKey: 'By' },
        { header: 'Comment', accessorKey: 'Comment' }
    ]

    const { data, isLoading, error } = useQuery({
        queryKey: ['customer_package_freeze_history', serial_number],
        queryFn: async () => {
            const res = await api.vfCv2Axios.get(`/package/${serial_number}/freeze-history`)

            return res?.map((item, index) => {
                return {
                    Index: index + 1,
                    'Date': item.action_at ? isoToDDMonYYYY(new Date(item.action_at)) : '',
                    'Event Type': item.event_type,
                    'By': item.action_by,
                    'Comment': item.comment
                }
            })
        },
        enabled: !!serial_number,
        staleTime: 60_000,
    })


    if (isLoading) {
        return <div style={{ marginTop: '20px' }}>
            <SkeletonGrid rows={10} columns={4} height={'40px'} gap={'5px'} />
        </div>
    }

    if (error) {
        return <div>
            <ErrorState
                icon={<TbTable />}
                title={'Data fetching Failed'}
                message={error?.message}
                hight='400px'
            />
        </div>
    }

    return (
        <div style={{ marginTop: '20px' }}>
            <Table
                key={'c_pack_freeze_history'}
                columns={cols}
                data={data}
                queryKey={['c_pack_freeze_history', serial_number]}
                tableKey="c_pack_freeze_history"
            />
        </div>
    )
}

export default FreezeHistory