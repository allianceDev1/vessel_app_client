import React from 'react'
import { useParams, } from 'react-router-dom'
import { isoToDDMonYYYY } from '../../../../utils/helpers/date-helpers'
import { api } from '../../../../api'
import Table from '../../../UI_Primitives/table/Table'
import { useQuery } from '@tanstack/react-query'
import ErrorState from '../../../UI_Primitives/ui-states/ErrorState'
import { TbTable } from 'react-icons/tb'
import SkeletonGrid from '../../../UI_Primitives/skeleton/SkeletonGrid'



const Extensions = () => {

    const { serial_number } = useParams();

    const cols = [
        { header: 'Index', accessorKey: 'Index' },
        { header: 'Date', accessorKey: 'Date', enableHiding: false },
        { header: 'By', accessorKey: 'By' },
        { header: 'Extended To', accessorKey: 'Extended To' },
        { header: 'Days', accessorKey: 'Days', enableHiding: false },
        { header: 'Re-active', accessorKey: 'Re-active', enableHiding: false },
        { header: 'Reason', accessorKey: 'Reason' }
    ]

    const { data, isLoading, error } = useQuery({
        queryKey: ['customer_package_extensions', serial_number],
        queryFn: async () => {
            const res = await api.vfCv2Axios.get(`/package/${serial_number}/extensions`)

            return res?.map((item, index) => {
                return {
                    Index: index + 1,
                    'Date': item.date ? isoToDDMonYYYY(new Date(item.date)) : '',
                    'By': item.extended_by,
                    'Extended To': item.extended_to ? isoToDDMonYYYY(new Date(item.extended_to)) : '',
                    'Days': item.extended_days,
                    'Re-active': item.is_return_based_extension ? 'Yes' : 'No',
                    'Reason': item.comment
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
                key={'c_pack_ext'}
                columns={cols}
                data={data}
                queryKey={['c_pack_ext', serial_number]}
                tableKey="c_pack_ext"
            />
        </div>
    )
}

export default Extensions