import React, { useEffect, useState } from 'react'
import './area-list.scss'
import { useDispatch, useSelector } from 'react-redux';
import { doDialog, modal, page, toast } from '../../../redux/features/non_persisted/miniSystemSlice'
import { IoIosArrowDown } from 'react-icons/io';
import { TbDownload, TbMapX, TbPencil, TbTrash } from 'react-icons/tb';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../../api';
import Table from '../../../components/UI_Primitives/table/Table'
import Button from '../../../components/UI_Primitives/buttons/Button'
import ButtonGroup from '../../../components/UI_Primitives/buttons/ButtonGroup'
import Dropdown from '../../../components/UI_Primitives/dropdown/Dropdown'
import SkeletonGrid from '../../../components/UI_Primitives/skeleton/SkeletonGrid';
import ErrorState from '../../../components/UI_Primitives/ui-states/ErrorState';
import UpdateAreaTech from '../../../components/forms/controller/update-area-tech/UpdateAreaTech';
import { isoToDDMonYYYY } from '../../../utils/helpers/date-helpers';


const AreaList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.user)
    const [searchParams, setSearchParams] = useSearchParams();
    const [miniReport, setMiniReport] = useState({})
    const [reportLoading, setReportLoading] = useState('fetch')
    const [dataLoading, setDataLoading] = useState('fetch')
    const [data, setData] = useState([])
    const [error, setError] = useState({ error: false, title: null, message: null })
    const [tableColumns, setTableColumns] = useState([])

    const viewTypeOptions = [
        {
            items: [
                { label: 'City view', onClick: () => handleChangeViewType('cityBase') },
                { label: 'Tech view', onClick: () => handleChangeViewType('techBase') },
                { label: 'Post view', onClick: () => handleChangeViewType('postBase') },
                { label: 'Pin view', onClick: () => handleChangeViewType('pinBase') },
            ],
        }
    ];

    const handleChangeViewType = (type) => {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set('view_type', type);
        setSearchParams(newSearchParams);

        fetchData(type);
    }

    const openEditModal = (workerData) => {
        dispatch(modal.push({
            title: "Update Area Technician",
            body: <UpdateAreaTech
                data={{
                    city_id: workerData?.city_id,
                    worker_uuid: workerData?.worker_uuid,
                    city_name: workerData?.['City name'],
                    worker_name: workerData?.['Worker name'],
                    from_date: workerData?.['From date'],
                    to_date: workerData?.['To date']
                }}
                submitAction={(updateForm, techData) => {
                    setData((state) => state.map((w) => {
                        if (w?.worker_uuid === techData?.worker_uuid && w?.city_id === techData?.city_id) {
                            return { ...w, 'From date': isoToDDMonYYYY(new Date(updateForm?.from_date)), 'To date': isoToDDMonYYYY(new Date(updateForm?.to_date)) }
                        } else {
                            return w
                        }
                    }))
                }} />
        }))
    }

    const handleDeleteTech = (arr, fn = () => { }) => {
        if (!arr.length) return;

        dispatch(doDialog.confirm({
            message: 'Do you want to delete these technicians?',
            accept: {
                onClick: async () => {
                    setData((state) => state?.map(w => {
                        if (arr.some(a => a.worker_uuid === w.worker_uuid && a.city_id === w.city_id)) {
                            return { ...w, deletedLoad: true }
                        }
                        return w
                    }))
                    try {
                        await api.vfCv2Axios.delete(`/branch-area/cities/technicians`, { data: { workers: arr } })
                        setData((state) => state.filter(w => {
                            return !arr.some(a => a.worker_uuid === w.worker_uuid && a.city_id === w.city_id)
                        }))
                        fn()
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

    const fetchReport = async () => {
        try {
            setReportLoading('fetch')
            setError({ error: false, title: null, message: null })
            const report = await api.vfCv2Axios.get('/branch-area/mini-report')
            setMiniReport(report)

        } catch (error) {
            setError({ error: true, title: 'Data fecting failed', message: error.message })
        } finally {
            setReportLoading('')
        }
    }

    const fetchData = async (type) => {
        try {
            setDataLoading('fetch')
            setError({ error: false, title: null, message: null })
            const viewType = type || searchParams.get('view_type') || 'cityBase'
            const data = await api.vfCv2Axios.get(`/branch-area/cities/${viewType}`)

            // Switch
            switch (viewType) {
                case 'cityBase':
                    setTableColumns([
                        { header: 'Index', accessorKey: 'Index', enableHiding: false, enableSorting: false },
                        { header: 'City name', accessorKey: 'City name', enableHiding: false },
                        { header: 'State name', accessorKey: 'State name' },
                        { header: 'Pin codes', accessorKey: 'Pin codes', meta: { style: { textAlign: 'center' } } },
                        { header: 'Post offices', accessorKey: 'Post offices', meta: { style: { textAlign: 'center' } } },
                        { header: 'Tech count.', accessorKey: 'Tech count', meta: { style: { textAlign: 'center' } } },
                    ])

                    setData(data?.map((city, index) => ({
                        Index: index + 1,
                        'City name': city.city_name,
                        city_id: city.city_id,
                        'State name': city.state_name,
                        'Pin codes': city.pin_codes_count,
                        'Post offices': city.post_offices_count,
                        'Tech count': city.vf_technicians_count,
                        _rowClassName: !city.vf_technicians_count ? 'danger-row' : "",
                        _rowStyle: { cursor: 'Pointer' },
                        _onClick: () => navigate(`/controller/area-list/${city?.city_id}`),
                    })))

                    break;

                case 'techBase':
                    const tempColumns = [
                        { header: 'Index', accessorKey: 'Index', enableHiding: false, enableSorting: false },
                        { header: 'Worker name', accessorKey: 'Worker name', enableHiding: false },
                        { header: 'City name', accessorKey: 'City name' },
                        { header: 'From date', accessorKey: 'From date' },
                        { header: 'To date', accessorKey: 'To date' }
                    ]

                    if (user?.allowed_origins?.includes('vfcr_areas_write')) {
                        tempColumns.push({
                            header: 'Actions',
                            cell: ({ row }) => (
                                <div className="action-buttons" style={{ display: 'flex', justifyContent: 'center' }}>
                                    <ButtonGroup rounded>
                                        <Button icon={<TbPencil />} size='small' outlined onClick={() => openEditModal(row?.original)} />
                                        <Button icon={<TbTrash />} size='small' outlined
                                            spinIcon={row?.original?.deletedLoad ? true : false}
                                            onClick={() => handleDeleteTech([{ worker_uuid: row?.original?.worker_uuid, city_id: row?.original?.city_id }])} />
                                    </ButtonGroup>
                                </div>
                            ),
                            enableSorting: false,
                            enableColumnFilter: false,
                        })
                    }

                    setTableColumns(tempColumns)

                    setData(data?.map((city, index) => ({
                        Index: index + 1,
                        'Worker name': city.worker_name,
                        worker_uuid: city.worker_uuid,
                        'City name': city.city_name,
                        city_id: city.city_id,
                        'From date': city.from_date ? isoToDDMonYYYY(new Date(city.from_date)) : '',
                        'To date': city.to_date ? isoToDDMonYYYY(new Date(city.to_date)) : '',
                        _rowClassName: city.is_deleted ? 'danger-row' : ""
                    })))

                    break;

                case 'postBase':
                    setTableColumns([
                        { header: 'Index', accessorKey: 'Index', enableHiding: false, enableSorting: false },
                        { header: 'Post office', accessorKey: 'Post office', enableHiding: false },
                        { header: 'City name', accessorKey: 'City name' }
                    ])

                    setData(data?.map((city, index) => ({
                        Index: index + 1,
                        'Post office': city.post_office,
                        'City name': city.city_name,
                        city_id: city.city_id
                    })))

                    break;

                case 'pinBase':
                    setTableColumns([
                        { header: 'Index', accessorKey: 'Index', enableHiding: false, enableSorting: false },
                        { header: 'Pin code', accessorKey: 'Pin code', enableHiding: false },
                        { header: 'City name', accessorKey: 'City name' }
                    ])

                    setData(data?.map((city, index) => ({
                        Index: index + 1,
                        'Pin code': city.pin_code,
                        'City name': city.city_name,
                        city_id: city.city_id
                    })))

                    break;

                default:
                    break;
            }

        } catch (error) {
            setError({ error: true, title: 'Data fecting failed', message: error.message })
        } finally {
            setDataLoading('')
        }
    }

    useEffect(() => {
        dispatch(page.setTitle({ title: 'Area List', note: "View all cities and related information." }))

        // initial fetch
        fetchReport();
        fetchData();
        // eslint-disable-next-line
    }, [])



    // loading
    if (reportLoading === 'fetch') {
        return <div className="area-list-page-load">
            <SkeletonGrid rows={1} columns={1} height={105} />
            <SkeletonGrid rows={1} columns={2} height={60} style={{ marginTop: '15px' }}
                responsive={{
                    md: { rows: 2, columns: 1 }
                }} />
            <SkeletonGrid rows={1} columns={1} height={500} style={{ marginTop: '15px' }} />
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

    // Data
    return (
        <div className='area-list-page'>
            <div className="mini-report-border">
                <div className="sub-item">
                    <h3>{miniReport?.total_city_count || 0}</h3>
                    <p>Total Cities</p>
                </div>
                <div className="sub-item">
                    <h3>{miniReport?.total_technician_count || 0}</h3>
                    <p>Total Workers</p>
                </div>
                <div className="sub-item">
                    <h3>{miniReport?.total_post_count || 0}</h3>
                    <p>Total Posts</p>
                </div>
                <div className="sub-item">
                    <h3>{miniReport?.inactive_city_count || 0}</h3>
                    <p>Inactive Cities</p>
                </div>
            </div>
            <div className="table-border">
                {dataLoading === 'fetch' ? <>
                    <SkeletonGrid rows={1} columns={2} height={60} style={{ marginTop: '15px' }} />
                    <SkeletonGrid rows={1} columns={1} height={500} style={{ marginTop: '15px' }} />
                </>
                    : <Table
                        columns={tableColumns}
                        data={data}
                        rowCheckBox={searchParams.get('view_type') === 'techBase' && user?.allowed_origins?.includes('vfcr_areas_write')}
                        bulkActions={(selectedRows, clearSelection) => (
                            <Button icon={<TbTrash />} label={'Delete'} text
                                onClick={() => handleDeleteTech(
                                    selectedRows?.map(row => ({ worker_uuid: row?.worker_uuid, city_id: row?.city_id })),
                                    clearSelection
                                )}
                            />
                        )}
                        topComponents={
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Button label={'Excel'} icon={<TbDownload />} outlined size='small' rounded style={{ width: '100px' }} />
                                <Dropdown button={{
                                    label: searchParams.get('view_type') === 'techBase' ? 'Tech view' :
                                        searchParams.get('view_type') === 'postBase' ? 'Post view' :
                                            searchParams.get('view_type') === 'pinBase' ? 'Pin view' : 'City view',
                                    icon: < IoIosArrowDown />, iconPos: 'right',
                                    rounded: true, outlined: true, size: 'small', style: { width: '120px' }
                                }} list={viewTypeOptions} />
                            </div>
                        } />}
            </div>
            <div className="info">
                <p>You can control the area base technicians data from here. The City, post office and pin code related data only can control from
                    the controlNex software.
                </p>
            </div>
        </div>
    )
}

export default AreaList