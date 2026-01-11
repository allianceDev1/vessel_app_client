import React, { useEffect, useState } from 'react'
import { doDialog, modal, page, toast } from '../../../redux/features/non_persisted/miniSystemSlice';
import { useDispatch } from 'react-redux';
import { api } from '../../../api'
import { TbLayoutGrid, TbPencil, TbPlus, TbTrash } from 'react-icons/tb';
import SkeletonGrid from '../../../components/UI_Primitives/skeleton/SkeletonGrid';
import ErrorState from '../../../components/UI_Primitives/ui-states/ErrorState';
import Table from '../../../components/UI_Primitives/table/Table';
import ButtonGroup from '../../../components/UI_Primitives/buttons/ButtonGroup';
import Button from '../../../components/UI_Primitives/buttons/Button';
import CreateServiceWork from '../../../components/forms/controller/service-work/CreateServiceWork';
import UpdateServiceWork from '../../../components/forms/controller/service-work/UpdateServiceWork';

const ServiceWorks = () => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState('fetch')
    const [data, setData] = useState([])
    const [error, setError] = useState({ error: false, title: null, message: null })

    const tableColumns = [
        { header: 'Work name', accessorKey: 'Work name', enableHiding: false },
        { header: 'Scop', accessorKey: 'Scop', meta: { style: { textAlign: 'center' } } },
        { header: 'Selling Rate', accessorKey: 'Selling Rate', meta: { style: { textAlign: 'center' } } },
        { header: 'Discount Rate', accessorKey: 'Discount Rate', meta: { style: { textAlign: 'center' } } },
        { header: 'Purchase Rate', accessorKey: 'Purchase Rate', meta: { style: { textAlign: 'center' } } },
        { header: 'Call Rate', accessorKey: 'Call Rate', meta: { style: { textAlign: 'center' } } },
        {
            header: 'Actions',
            cell: ({ row }) => (
                <div className="action-buttons" style={{ display: 'flex', justifyContent: 'center' }}>
                    <ButtonGroup rounded>
                        <Button icon={<TbPencil />} size='small' outlined onClick={() => openUpdateModal(row?.original)} />
                        <Button icon={<TbTrash />} size='small' outlined onClick={() => handleDeleteWork(row?.original?.work_uuid)}
                            spinIcon={row?.original?.deletedLoad ? true : false} />
                    </ButtonGroup>
                </div>
            ),
            enableSorting: false,
            enableColumnFilter: false,
        }
    ]

    const handleDeleteWork = (workUuid) => {
        dispatch(doDialog.confirm({
            message: 'Do you want to delete this work?',
            accept: {
                onClick: async () => {
                    setData((state) => state?.map(w => {
                        if (w.work_uuid === workUuid) {
                            return { ...w, deletedLoad: true }
                        }
                        return w
                    }))

                    try {
                        await api.vfCv2Axios.delete(`/config/service-work/${workUuid}`)
                        setData((state) => state.filter(w => {
                            return w.work_uuid !== workUuid
                        }))
                    } catch (error) {
                        dispatch(toast.push({
                            type: 'danger',
                            head: 'Deletion failed',
                            message: error.message
                        }))
                    } finally {
                        setData((state) => state?.map(w => ({ ...w, deletedLoad: false })))
                    }
                }
            }
        }))
    }

    const openCreateModel = () => {
        dispatch(modal.push({
            title: "Create Service Work",
            body: <CreateServiceWork setData={setData} />
        }))
    }

    const openUpdateModal = (work) => {
        dispatch(modal.push({
            title: "Update Service Work",
            body: <UpdateServiceWork data={work} setData={setData} />
        }))
    }


    const fetchApi = async () => {
        try {
            setLoading('fetch')
            setError({ error: false, title: null, message: null })
            const res = await api.vfCv2Axios.get('/config/service-works?fields=work_name,selling_rate,discount_rate,purchase_rate,call_rate,refill_included,reinstallation_included')
            setData(res?.map(item => ({
                "Work name": item?.work_name,
                "Scop": item?.service_scope,
                "Selling Rate": item?.selling_rate,
                "Discount Rate": item?.discount_rate,
                "Purchase Rate": item?.purchase_rate,
                "Call Rate": item?.call_rate,
                refill_included: item?.refill_included,
                reinstallation_included: item?.reinstallation_included,
                work_uuid: item?.work_uuid
            })))
        } catch (error) {
            setError({ error: true, title: 'Data fetching failed', message: error.message })
        } finally {
            setLoading('')
        }
    }

    useEffect(() => {
        dispatch(page.setTitle({ title: 'Service Works', note: "Manage the vessel system service works." }))

        // Initial fetch
        fetchApi();
        // eslint-disable-next-line
    }, [])


    // loading
    if (loading === 'fetch') {
        return <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
            <SkeletonGrid
                rows={1}
                columns={1}
                height={50}
            />
            <SkeletonGrid
                rows={1}
                columns={1}
                height={350}
            />
        </div>
    }

    if (error?.error) {
        return <ErrorState
            hight='80vh'
            title={error?.title}
            message={error?.message}
            icon={<TbLayoutGrid />}
        />
    }

    return (
        <div className="service-works-page-container" style={{ marginTop: '20px', marginBottom: '40px' }}>
            <Table
                columns={tableColumns}
                data={data}
                topComponents={<>
                    <Button label={'Work'} icon={<TbPlus />} severity='primary' size='small' rounded style={{ width: '100px' }}
                        onClick={openCreateModel} />
                </>}
            />
        </div>
    )
}

export default ServiceWorks