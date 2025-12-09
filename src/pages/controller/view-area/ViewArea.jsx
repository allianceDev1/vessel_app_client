import React, { useEffect, useState } from 'react'
import './view-area.scss';
import { useDispatch } from 'react-redux';
import { doDialog, modal, page, toast } from '../../../redux/features/non_persisted/miniSystemSlice';
import Button from '../../../components/UI_Primitives/buttons/Button';
import { TbDots, TbMapX, TbPencil, TbPlus, TbReport, TbTrash } from 'react-icons/tb';
import { useParams } from 'react-router-dom';
import { api } from '../../../api';
import SkeletonGrid from '../../../components/UI_Primitives/skeleton/SkeletonGrid';
import ErrorState from '../../../components/UI_Primitives/ui-states/ErrorState';
import Dropdown from '../../../components/UI_Primitives/dropdown/Dropdown';
import AddAreaTech from '../../../components/forms/update-area-tech/AddAreaTech';
import UpdateAreaTech from '../../../components/forms/update-area-tech/UpdateAreaTech';
import { isoToDDMonYYYY } from '../../../utils/helpers/date-helpers';

const ViewArea = () => {
    const dispatch = useDispatch();
    const [data, setData] = useState({})
    const { city_id } = useParams()
    const [loading, setLoading] = useState('fetch')
    const [error, setError] = useState({ error: false, title: null, message: null })


    const openCreateModal = (title, component) => {
        dispatch(modal.push({
            title: title,
            body: component
        }))
    }

    const openEditModal = (workerData) => {
        dispatch(modal.push({
            title: "Update Area Technician",
            body: <UpdateAreaTech
                data={{
                    city_id,
                    worker_name: workerData?.full_name,
                    city_name: data?.city_name,
                    ...workerData,
                }}
                submitAction={(updateForm, techData) => {
                    setData((state) => {
                        return {
                            ...state,
                            vf_technicians: state?.vf_technicians?.map((w) => {
                                if (w?.worker_uuid === techData?.worker_uuid) {
                                    return { ...w, form_date: isoToDDMonYYYY(new Date(updateForm?.from_date)), to_date: isoToDDMonYYYY(new Date(updateForm?.to_date)) }
                                } else {
                                    return w
                                }
                            })
                        }
                    })
                }} />
        }))
    }

    const handleDeleteTech = (worker_uuid) => {
        dispatch(doDialog.confirm({
            message: 'Do you want to delete this technician?',
            accept: {
                onClick: async () => {
                    setLoading('delete' + worker_uuid)
                    try {
                        await api.vfCv2Axios.delete(`/branch-area/cities/technicians`, {
                            data: { workers: [{ worker_uuid, city_id }] }
                        })
                        setData((state) => {
                            return {
                                ...state,
                                vf_technicians: state?.vf_technicians?.filter((w) => w.worker_uuid !== worker_uuid)
                            }
                        })
                    } catch (error) {
                        dispatch(toast.push({
                            type: 'danger',
                            head: 'Deletion failed',
                            message: error.message
                        }))
                    } finally {
                        setLoading('')
                    }
                }
            }
        }))
    }

    const fetchData = async () => {
        try {
            setLoading('fetch')
            setError({ error: false, title: null, message: null })

            const data = await api.vfCv2Axios.get(`/branch-area/city/${city_id}`)
            setData(data)

        } catch (error) {
            setError({ error: true, title: 'Data fecting failed', message: error.message })
        } finally {
            setLoading('')
        }
    }

    useEffect(() => {
        dispatch(page.setTitle({ title: 'View Area', note: "View city and related information." }))

        // initial fetch
        fetchData();

        // eslint-disable-next-line
    }, [])



    // loading
    if (loading === 'fetch') {
        return <div className="view-area-page-load">
            <SkeletonGrid rows={1} columns={2} height={60} responsive={{ md: { columns: 1, rows: 2 } }} />
            <div className="section">
                <SkeletonGrid rows={1} columns={2} height={200} responsive={{ md: { columns: 1, rows: 2 } }} />
                <SkeletonGrid rows={1} columns={1} height={200} />
            </div>
        </div>
    }

    // Error
    if (error?.error) {
        return <ErrorState
            hight='80vh'
            title={error?.title}
            message={error?.message}
            icon={<TbMapX />}
        />
    }

    return (
        <div className="view-area-page">
            <div className="top-section">
                <div className="title">
                    <small>City name</small>
                    <h2>{data?.city_name}</h2>
                </div>
                <div className="actions">
                    <Button label={'Report'} icon={<TbReport />} size='small' outlined rounded style={{ width: '100px' }} />
                    <Button label={'Worker'} icon={<TbPlus />} size='small' rounded severity={'primary'} style={{ width: '100px' }}
                        onClick={() => openCreateModal('Add new city worker', <AddAreaTech cityId={data?.city_id}
                            activeWorkers={data?.vf_technicians} setData={setData} />)} />
                </div>
            </div>
            <div className="contents">
                <div className="section-one">
                    <div className="item-list">
                        <h4>Post offices</h4>
                        {data?.post_offices?.length
                            ? <>
                                {data?.post_offices?.sort((a, b) => a.localeCompare(b))?.map((post, index) => {
                                    return <div className="item" key={post}>
                                        <p>{index + 1}. {post}</p>
                                    </div>
                                })}
                            </>
                            : <div className='no-data'>
                                <p>No posts</p>
                            </div>}
                    </div>

                    <div className="item-list">
                        <h4>Pin codes</h4>
                        {data?.pin_codes?.length
                            ? <>
                                {data?.pin_codes?.sort((a, b) => a.localeCompare(b))?.map((pin, index) => {
                                    return <div className="item" key={pin}>
                                        <p>{index + 1}. {pin}</p>
                                    </div>
                                })}
                            </>
                            : <div className='no-data'>
                                <p>No pins</p>
                            </div>}
                    </div>
                </div>
                <div className="section-two">
                    <div className="item-list">
                        <h4>Workers</h4>
                        {data?.vf_technicians?.length
                            ? <>
                                <div className="item header" >
                                    <p>Name</p>
                                    <p>From date</p>
                                    <p>To Date</p>
                                    <p></p>
                                </div>
                                {data?.vf_technicians?.sort((a, b) => a.full_name.localeCompare(b?.full_name))?.map((worker, index) => {
                                    return <div className="item" key={worker?.worker_uuid}>
                                        <p>{worker?.full_name}</p>
                                        <p>{worker?.from_date ? isoToDDMonYYYY(new Date(worker?.from_date)) : 'Nil'}</p>
                                        <p>{worker?.to_date ? isoToDDMonYYYY(new Date(worker?.to_date)) : 'Nil'}</p>
                                        <Dropdown button={{
                                            icon: < TbDots />,
                                            text: true,
                                            size: 'small',
                                            spinIcon: loading === `delete${worker?.worker_uuid}` ? true : false,
                                        }} list={[
                                            {
                                                items: [
                                                    { label: 'Update', icon: <TbPencil />, onClick: () => openEditModal(worker) },
                                                    { label: 'Remove', icon: <TbTrash />, theme: 'danger', onClick: () => handleDeleteTech(worker?.worker_uuid) }
                                                ],
                                            }
                                        ]} />
                                    </div>
                                })}
                            </>
                            : <div className='no-data'>
                                <p>No workers</p>
                            </div>}
                    </div>
                </div>
            </div>
        </div >
    )
}

export default ViewArea