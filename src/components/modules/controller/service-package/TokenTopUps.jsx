import React from 'react'
import { isoToDDMonYYYY } from '../../../../utils/helpers/date-helpers'
import { api } from '../../../../api'
import Table from '../../../UI_Primitives/table/Table'
import { useQuery } from '@tanstack/react-query'
import ErrorState from '../../../UI_Primitives/ui-states/ErrorState'
import { TbTable } from 'react-icons/tb'
import SkeletonGrid from '../../../UI_Primitives/skeleton/SkeletonGrid'



const TokenTopUps = ({ serial_number }) => {

    const cols = [
        { header: 'Index', accessorKey: 'Index' },
        { header: 'Date', accessorKey: 'Date', enableHiding: false },
        { header: 'By', accessorKey: 'By' },
        { header: 'Tokens', accessorKey: 'Tokens' },
        { header: 'Bill No', accessorKey: 'Bill No' }
    ]

    const { data, isLoading, error } = useQuery({
        queryKey: ['customer_package_token_top_ups', serial_number],
        queryFn: async () => {
            const res = await api.vfCv2Axios.get(`/package/${serial_number}/top-ups-history`)

            return res?.map((item, index) => {
                return {
                    Index: index + 1,
                    'Date': item.action_at ? isoToDDMonYYYY(new Date(item.action_at)) : '',
                    'By': item.action_by,
                    'Tokens': item.number_of_tokens,
                    'Bill No': item.bill_no
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
                key={'c_pack_top_up_history'}
                columns={cols}
                data={data}
                queryKey={['c_pack_top_up_history', serial_number]}
                tableKey="c_pack_top_up_history"
            />
        </div>
    )
}

export default TokenTopUps