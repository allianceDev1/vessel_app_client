import React, { useEffect, useMemo } from 'react'
import './area-list.scss'
import { useDispatch, useSelector } from 'react-redux';
import { doDialog, modal, page, toast } from '../../../redux/features/non_persisted/miniSystemSlice'
import { IoIosArrowDown } from 'react-icons/io';
import { TbCircleX, TbDownload, TbPencil, TbTrash } from 'react-icons/tb';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../../api';
import Table from '../../../components/UI_Primitives/table/Table'
import Button from '../../../components/UI_Primitives/buttons/Button'
import Dropdown from '../../../components/UI_Primitives/dropdown/Dropdown'
import SkeletonGrid from '../../../components/UI_Primitives/skeleton/SkeletonGrid';
import ErrorState from '../../../components/UI_Primitives/ui-states/ErrorState';
import UpdateAreaTech from '../../../components/forms/controller/update-area-tech/UpdateAreaTech';
import { isoToDDMonYYYY } from '../../../utils/helpers/date-helpers';
import { useQuery, useQueryClient } from '@tanstack/react-query';


const AreaList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.user)
    const [searchParams, setSearchParams] = useSearchParams();
    const queryClient = useQueryClient()

    const viewType = searchParams.get('view_type') || 'cityBase'

    const getSortField = (id) => ({
        'City name': 'city_name',
        'State name': 'state_name',
        'Worker name': 'worker_name',
        'Post office': 'post_office',
        'Pin code': 'pin_code'
    })[id] || id

    useEffect(() => {
        dispatch(page.setTitle({ title: 'Area List', note: "View all cities and related information." }))
        // eslint-disable-next-line
    }, [])


    const {
        data: miniReport = {},
        isLoading: reportLoading,
        error: reportError,
    } = useQuery({
        queryKey: ['area-mini-report'],
        queryFn: async () => {
            const res = await api.vfCv2Axios.get('/branch-area/mini-report')
            return res
        },
        staleTime: 10 * 60_000,
    })

    const handleChangeViewType = (type) => {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev)
            next.set('view_type', type)
            // Reset pagination when switching views
            next.delete(`area_page`)
            next.delete(`area_search`)
            next.delete(`area_sort_by`)
            next.delete(`area_sort_dir`)
            return next
        })
    }

    const viewTypeOptions = [
        {
            items: [
                { label: 'City view', value: 'cityBase', onClick: (arg) => handleChangeViewType(arg?.value) },
                { label: 'Tech view', value: 'techBase', onClick: (arg) => handleChangeViewType(arg?.value) },
                { label: 'Post view', value: 'postBase', onClick: (arg) => handleChangeViewType(arg?.value) },
                { label: 'Pin view', value: 'pinBase', onClick: (arg) => handleChangeViewType(arg?.value) },
            ],
        }
    ];

    const fetchAreaData = useMemo(() => async ({ page, pageSize, search, sort }) => {

        const sortBy = sort?.[0] ? getSortField(sort[0].id) : ''
        const sortDir = sort?.[0] ? (sort[0].desc ? 'desc' : 'asc') : ''

        const params = new URLSearchParams({
            page,
            limit: pageSize,
            sort_by: sortBy,
            sort_dir: sortDir,
            ...(search ? { search } : {})
        })
        const res = await api.vfCv2Axios.get(`/branch-area/cities/${viewType}?${params}`)

        // Transform raw API rows into table row shape here
        const transformed = res.data.map((item, index) => {
            const globalIndex = page * pageSize + index + 1  // correct index across pages

            switch (viewType) {
                case 'cityBase':
                    return {
                        Index: globalIndex,
                        'City name': item.city_name,
                        city_id: item.city_id,
                        'State name': item.state_name,
                        'Pin codes': item.pin_codes_count,
                        'Post offices': item.post_offices_count,
                        'Tech count': item.vf_technicians_count,
                        _rowClassName: !item.vf_technicians_count ? 'danger-row' : '',
                        _rowStyle: { cursor: 'pointer' },
                        _rowNavigateUrl: `/controller/area-list/${item.city_id}`,
                    }

                case 'techBase':
                    return {
                        Index: globalIndex,
                        'Worker name': item.worker_name,
                        worker_uuid: item.worker_uuid,
                        'City name': item.city_name,
                        city_id: item.city_id,
                        'From date': item.from_date ? isoToDDMonYYYY(new Date(item.from_date)) : '',
                        'To date': item.to_date ? isoToDDMonYYYY(new Date(item.to_date)) : '',
                        _rowClassName: item.is_deleted ? 'danger-row' : '',
                    }

                case 'postBase':
                    return {
                        Index: globalIndex,
                        'Post office': item.post_office,
                        'City name': item.city_name,
                        city_id: item.city_id,
                    }

                case 'pinBase':
                    return {
                        Index: globalIndex,
                        'Pin code': item.pin_code,
                        'City name': item.city_name,
                        city_id: item.city_id,
                    }

                default:
                    return item
            }
        })

        return { data: transformed, total: res.total }
        // eslint-disable-next-line
    }, [viewType, navigate]) 


    // ── 4. Edit modal ─────────────────────────────────────────────────────────
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
                submitAction={() => {
                    queryClient.invalidateQueries({ queryKey: ['area-data', viewType] })
                }} />
        }))
    }
    // ── 5. Delete technician ──────────────────────────────────────────────────
    const handleDeleteTech = (arr, clearSelection = () => { }) => {
        if (!arr.length) return;

        dispatch(doDialog.confirm({
            message: 'Do you want to delete these technicians?',
            accept: {
                onClick: async () => {
                    try {
                        await api.vfCv2Axios.delete(`/branch-area/cities/technicians`, { data: { workers: arr } })
                        queryClient.invalidateQueries({ queryKey: ['area-data', viewType] })
                        clearSelection()
                    } catch (error) {
                        dispatch(toast.push({
                            type: 'danger',
                            head: 'Deletion failed',
                            message: error.message
                        }))
                    }
                }
            }
        }))
    }

    // ── 6. Columns per view type ──────────────────────────────────────────────
    const tableColumns = useMemo(() => {
        switch (viewType) {
            case 'cityBase':
                return [
                    { header: 'Index', accessorKey: 'Index', enableHiding: false, enableSorting: false },
                    { header: 'City name', accessorKey: 'City name', enableHiding: false },
                    { header: 'State name', accessorKey: 'State name' },
                    { header: 'Pin codes', accessorKey: 'Pin codes', enableSorting: false, meta: { style: { textAlign: 'center' } } },
                    { header: 'Post offices', accessorKey: 'Post offices', enableSorting: false, meta: { style: { textAlign: 'center' } } },
                    { header: 'Tech count.', accessorKey: 'Tech count', enableSorting: false, meta: { style: { textAlign: 'center' } } },
                ]

            case 'techBase': {
                const cols = [
                    { header: 'Index', accessorKey: 'Index', enableHiding: false, enableSorting: false },
                    { header: 'Worker name', accessorKey: 'Worker name', enableHiding: false },
                    { header: 'City name', accessorKey: 'City name' },
                    { header: 'From date', accessorKey: 'From date', enableSorting: false },
                    { header: 'To date', accessorKey: 'To date', enableSorting: false },
                ]

                if (user?.allowed_origins?.includes('vfcr_areas_write')) {
                    cols.push({
                        header: 'Actions',
                        enableSorting: false,
                        enableColumnFilter: false,
                        cell: ({ row }) => (
                            <div className="action-buttons" style={{ display: 'flex', justifyContent: 'center', gap: '3px' }}>
                                <Button rounded title={'Edit'}
                                    icon={<TbPencil />} size='small' outlined
                                    onClick={() => openEditModal(row.original)}
                                />
                                <Button rounded severity={'danger'} title={'Delete'}
                                    icon={<TbTrash />} size='small' outlined
                                    spinIcon={row.original.deletedLoad}
                                    onClick={() => handleDeleteTech([
                                        { worker_uuid: row.original.worker_uuid, city_id: row.original.city_id }
                                    ])}
                                />
                            </div>
                        ),
                    })
                }
                return cols
            }

            case 'postBase':
                return [
                    { header: 'Index', accessorKey: 'Index', enableHiding: false, enableSorting: false },
                    { header: 'Post office', accessorKey: 'Post office', enableHiding: false },
                    { header: 'City name', accessorKey: 'City name' },
                ]

            case 'pinBase':
                return [
                    { header: 'Index', accessorKey: 'Index', enableHiding: false, enableSorting: false },
                    { header: 'Pin code', accessorKey: 'Pin code', enableHiding: false },
                    { header: 'City name', accessorKey: 'City name' },
                ]

            default:
                return []
        }
    }, [viewType, user?.allowed_origins])  // eslint-disable-line react-hooks/exhaustive-deps


    // Data
    return (
        <div className='area-list-page'>
            {reportLoading
                ? <>
                    <SkeletonGrid style={{ marginTop: '20px' }} />
                </>
                : reportError ?
                    <ErrorState
                        hight='100px'
                        icon={<TbCircleX />}
                        message={'Report fetching Failed'}
                    />
                    : <div className="mini-report-border">
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
                    </div>}

            <div className="table-border">
                <Table
                    key={viewType}
                    columns={tableColumns}
                    fetchFn={fetchAreaData}
                    queryKey={['area-data', viewType]}
                    tableKey="area"
                    data={[]}
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
                            }} list={viewTypeOptions} selected={searchParams.get('view_type') || 'cityBase'} />
                        </div>
                    } />
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