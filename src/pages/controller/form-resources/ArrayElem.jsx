import React, { useEffect, useMemo } from 'react'
import { useDispatch } from 'react-redux'
import { modal, page } from '../../../redux/features/non_persisted/miniSystemSlice';
import { useParams } from 'react-router-dom';
import { toStandardText } from '../../../utils/helpers/text-formatting';
import Table from '../../../components/UI_Primitives/table/Table'
import { api } from '../../../api';
import { useQuery } from '@tanstack/react-query';
import Button from '../../../components/UI_Primitives/buttons/Button';
import { TbBox, TbPencil, TbPlus, TbTrash } from 'react-icons/tb';
import SkeletonGrid from '../../../components/UI_Primitives/skeleton/SkeletonGrid';
import ErrorState from '../../../components/UI_Primitives/ui-states/ErrorState';
import ArrayElemCU from '../../../components/forms/controller/resources/ArrayElemCU';



const ArrayElem = ({ deleteData }) => {
    const dispatch = useDispatch();
    const { title } = useParams()

    const { data, isLoading, isFetching, error } = useQuery({
        queryKey: ['resources_values', title],
        queryFn: async () => {

            const data = await api.vfCv2Axios.get(`/resources/form-resources?titles=${title}`)
            return { title: data?.[0]?.title, values: data?.[0]?.values, title_stretcher: data?.[0]?.title_stretcher?.title_stretcher };
        },
        staleTime: 60_000
    })

    const editModel = (editUuid) => {
        const currenValues = data?.values?.find(v => v?.uuid === editUuid)

        dispatch(modal.push({
            title: 'Update Resource',
            body: <ArrayElemCU uuid={editUuid} stretcher={data?.title_stretcher} data={currenValues} isEditMode={true}
                title={data?.title} />
        }))
    }

    const createModel = () => {
        dispatch(modal.push({
            title: 'Create Resource',
            body: <ArrayElemCU stretcher={data?.title_stretcher} title={data?.title} />
        }))
    }

    const { tableColumns, tableData } = useMemo(() => {

        const columns = [
            { header: 'Order', accessorKey: "Order", enableHiding: false },
            ...(data?.title_stretcher?.map((t) => ({
                header: t, accessorKey: t, enableHiding: false
            })) || []),
            {
                header: 'Actions',
                enableSorting: false,
                enableColumnFilter: false,
                cell: ({ row }) => (
                    <div className="action-buttons" style={{ display: 'flex', justifyContent: 'center', gap: '3px' }}>
                        <Button rounded title={'Edit'}
                            icon={<TbPencil />} size='small' outlined
                            onClick={() => editModel(row?.original?.uuid)}
                        />
                        <Button rounded severity={'danger'} title={'Delete'}
                            icon={<TbTrash />} size='small' outlined
                            spinIcon={row.original.deletedLoad}
                            onClick={() => deleteData(row?.original?.uuid)}
                        />
                    </div>
                )
            }
        ]

        const tb = data?.values?.map((v) => {
            const c = {
                "Order": v?.order,
                uuid: v?.uuid
            }

            v?.data?.map((text, index) => c[columns?.[index + 1]?.accessorKey] = text)

            return c
        })

        return { tableColumns: columns, tableData: tb }
        // eslint-disable-next-line
    }, [data])

    useEffect(() => {
        dispatch(page.setTitle({
            title: toStandardText(title),
            note: 'Add, update and delete the resources'
        }))
        // eslint-disable-next-line
    }, [])

    if (isLoading || isFetching) {
        return <div style={{ marginTop: '15px' }}>
            <SkeletonGrid rows={8} columns={1} height={'50px'} gap={'10px'} responsive={{
                md: { rows: 6, columns: 1 },
            }} />
        </div>
    }

    if (error) {
        return <div>
            <ErrorState
                icon={<TbBox />}
                title={'Data fetching Failed'}
                message={error?.message}
                hight='400px'
            />
        </div>
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: "flex-end", marginBottom: '15px' }}>
                <Button icon={<TbPlus />} label={'Add'} rounded size='small' severity={'primary'} style={{ width: '100px' }}
                    onClick={createModel} />
            </div>
            <Table
                key={'resources_values'}
                columns={tableColumns}
                data={tableData}
                tableKey="resources_values"
            />
        </div>
    )
}

export default ArrayElem