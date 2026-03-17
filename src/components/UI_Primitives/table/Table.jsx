import React, { useState, useEffect, useCallback } from 'react'
import './style.scss'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    flexRender
} from '@tanstack/react-table'
import { IoIosArrowForward, IoIosArrowBack } from 'react-icons/io'
import { HiArrowsUpDown, HiMiniArrowDown, HiMiniArrowUp } from 'react-icons/hi2'
import { TbColumns3 } from 'react-icons/tb'
import { useDispatch } from 'react-redux'
import { modal } from '../../../redux/features/non_persisted/miniSystemSlice'
import InputText from '../../UI_Primitives/inputs/InputText'
import Button from '../../UI_Primitives/buttons/Button'
import ColumnsList from './ColumnsList'
import SkeletonGrid from '../skeleton/SkeletonGrid'

// ─────────────────────────────────────────────────────────────────────────────
// HOOK: useTableUrlState
// Syncs pagination, pageSize, and search to URL search params.
// This is WHY state is preserved when navigating back — the URL is the source of truth.
// ─────────────────────────────────────────────────────────────────────────────
function useTableUrlState(tableKey = 'table') {
    const [searchParams, setSearchParams] = useSearchParams()

    const getParam = (key, fallback) => searchParams.get(`${tableKey}_${key}`) ?? fallback

    const page = parseInt(getParam('page', '0'), 10)
    const pageSize = parseInt(getParam('limit', '10'), 10)
    const search = getParam('search', '')
    const sortBy = getParam('sort_by', '')
    const sortDir = getParam('sort_dir', '')

    const sorting = sortBy ? [{ id: sortBy, desc: sortDir === 'desc' }] : []

    const setParam = useCallback((updates) => {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev)
            Object.entries(updates).forEach(([k, v]) => {
                const key = `${tableKey}_${k}`
                if (v === '' || v === null || v === undefined) {
                    next.delete(key)
                } else {
                    next.set(key, String(v))
                }
            })
            return next
        }, { replace: true }) // replace:true keeps back-button history clean
    }, [setSearchParams, tableKey])

    const setPage = (p) => setParam({ page: p })
    const setPageSize = (s) => setParam({ limit: s, page: 0 })
    const setSearch = (s) => setParam({ search: s, page: 0 })
    const setSorting = (updaterOrValue) => {
        const newSorting = typeof updaterOrValue === 'function'
            ? updaterOrValue(sorting)   // ← call it with current sorting to get new value
            : updaterOrValue
        const s = newSorting[0]

        setParam({
            sort_by: s?.id ?? '',
            sort_dir: s?.desc ? 'desc' : s?.id ? 'asc' : '',
        })
    }

    return { page, pageSize, search, setPage, setPageSize, setSearch, sorting, setSorting }
}

// ─────────────────────────────────────────────────────────────────────────────
// HOOK: useDebounce
// Delays the API search call so we don't fire on every keystroke
// ─────────────────────────────────────────────────────────────────────────────
function useDebounce(value, delay = 400) {
    const [debounced, setDebounced] = useState(value)
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay)
        return () => clearTimeout(t)
    }, [value, delay])
    return debounced
}

// ─────────────────────────────────────────────────────────────────────────────
// TABLE COMPONENT
//
// Props:
//   columns          - TanStack column definitions
//   data             - Used only in CLIENT mode (no fetchFn)
//   fetchFn          - async ({ page, pageSize, search }) => { data: [], total: number }
//                      When provided, enables SERVER mode
//   searchEnabled    - default true, if false the search bar hide.
//   queryKey         - Unique string key for react-query caching (required in server mode)
//   tableKey         - Unique key for URL param namespacing (default: 'table')
//                      Use different keys if you have multiple tables on the same page.
//   rowCheckBox      - Show row selection checkboxes
//   topComponents    - Extra JSX rendered in top-right area
//   bulkActions      - fn(selectedRows, clearSelection) => JSX
//   columnVisible    - { [accessorKey]: boolean } initial visibility
//   columnListing    - { [accessorKey]: boolean } columns listing config
// ─────────────────────────────────────────────────────────────────────────────
const Table = ({
    columns = [],
    data: clientData = [],
    fetchFn,
    searchEnabled = true,
    queryKey = 'table-data',
    tableKey = 'table',
    rowCheckBox = false,
    topComponents,
    bulkActions,
    columnVisible,
    columnListing,
}) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()


    // ── Determine mode ──────────────────────────────────────────────────────
    const isServerMode = !!fetchFn
    const effectiveSearchMode = isServerMode ? 'server' : 'client'

    // ── URL State (page, pageSize, search) ──────────────────────────────────
    const { page, pageSize, search, setPage, setPageSize, setSearch, sorting, setSorting } = useTableUrlState(tableKey)

    // ── Debounce the search only for server mode to avoid too many API calls ─
    const debouncedSearch = useDebounce(search, effectiveSearchMode === 'server' ? 400 : 0)

    // ── Column visibility & row selection (these are UI-only, not in URL) ───
    const [columnVisibility, setColumnVisibility] = useState({ ...columnVisible, ...columnListing })
    const [rowSelection, setRowSelection] = useState({})

    // ── SERVER MODE: fetch via react-query ──────────────────────────────────
    // react-query automatically:
    //   • Caches results (navigate away & back = instant data restore)
    //   • Shows stale data while fetching new page (no flicker)
    //   • Retries on network failure
    const {
        data: serverResult,
        isFetching,
        isLoading,
    } = useQuery({
        queryKey: [...(Array.isArray(queryKey) ? queryKey : [queryKey]), page, pageSize, debouncedSearch, sorting],
        queryFn: () => fetchFn({ page, pageSize, search: debouncedSearch, sort: sorting }),
        enabled: isServerMode,
        staleTime: 30_000, // 30s before refetch
    })

    const serverData = serverResult?.data ?? []
    const serverTotal = serverResult?.total ?? 0

    // ── Decide what data the table renders ──────────────────────────────────
    // Server mode: data comes from API, pagination is manual (manualPagination: true)
    // Client mode: data is the full prop array, TanStack handles pagination
    const tableData = isServerMode ? serverData : clientData

    // ── Build TanStack table ─────────────────────────────────────────────────
    const table = useReactTable({
        data: tableData,
        columns: [
            ...(rowCheckBox ? [checkboxColumn] : []),
            ...columns,
        ],

        // ── State ────────────────────────────────────────────────────────────
        state: {
            // In server mode: pagination is controlled manually via URL
            // In client mode: TanStack manages pagination internally but we still mirror URL
            pagination: { pageIndex: page, pageSize },
            globalFilter: effectiveSearchMode === 'client' ? search : undefined,
            columnVisibility,
            rowSelection,
            sorting,
        },

        // ── Server-side flags ────────────────────────────────────────────────
        // When true, TanStack won't slice data itself — your API does it
        manualPagination: isServerMode,
        manualFiltering: effectiveSearchMode === 'server',
        pageCount: isServerMode ? Math.ceil(serverTotal / pageSize) : undefined,

        // ── Handlers ─────────────────────────────────────────────────────────
        onPaginationChange: (updater) => {
            // TanStack calls this with either a value or an updater function
            const prev = { pageIndex: page, pageSize }
            const next = typeof updater === 'function' ? updater(prev) : updater
            if (next.pageIndex !== prev.pageIndex) {
                setPage(next.pageIndex)
            }
            if (next.pageSize !== prev.pageSize) {
                setPageSize(next.pageSize)
            }
        },
        onGlobalFilterChange: (val) => {
            if (effectiveSearchMode === 'client') setSearch(val)
        },
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        enableRowSelection: true,

        // ── Row models ───────────────────────────────────────────────────────
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        // In server mode we still need getPaginationRowModel for the table API,
        // but actual slicing is done server-side
        getPaginationRowModel: getPaginationRowModel(),
    })

    // ── Derived pagination display values ───────────────────────────────────
    const totalRows = isServerMode ? serverTotal : table.getFilteredRowModel().rows.length
    const startRow = page * pageSize + 1
    const endRow = Math.min(startRow + pageSize - 1, totalRows)
    const canPrevPage = page > 0
    const canNextPage = isServerMode ? (page + 1) * pageSize < serverTotal : table.getCanNextPage()

    const selectedRowsData = table.getSelectedRowModel().rows.map(r => r.original)

    // ── Column visibility modal ──────────────────────────────────────────────
    const handleColumnHide = () => {
        dispatch(modal.push({
            show: true,
            title: 'Edit Columns',
            body: <ColumnsList table={table} columnVisibility={columnVisibility} columnListing={columnListing} />,
        }))
    }

    // ── Search input handler ─────────────────────────────────────────────────
    // Both modes write to URL via setSearch.
    // Server mode: the debounced value triggers react-query refetch.
    // Client mode: TanStack's globalFilter picks it up immediately.
    const handleSearchChange = (e) => setSearch(e.target.value)

    useEffect(() => {
        setRowSelection({})
    }, [page, pageSize])

    return (
        <div className="ui-tanstack-table-div">

            {/* ── Top Section ───────────────────────────────────────────────── */}
            {!selectedRowsData.length && <div className="table-filter-top">
                <div className="table-filter-left">
                    <div className="text-input-div">
                        {searchEnabled && <InputText
                            id="search"
                            name="search"
                            type='search'
                            value={search}
                            onChange={handleSearchChange}
                            label="Search..."
                            size='small'
                        />}
                    </div>
                </div>
                <div className="table-filter-right">
                    <Button
                        style={{ marginRight: '10px' }}
                        icon={<TbColumns3 />}
                        onClick={handleColumnHide}
                        rounded outlined size="small"
                    />
                    {topComponents}
                </div>
            </div>}

            {/* ── Bulk Actions ──────────────────────────────────────────────── */}
            {selectedRowsData.length > 0 && (
                <div className="bulk-actions">
                    <div className="section-one">
                        <span>{selectedRowsData.length} Selected</span>
                    </div>
                    <div className="section-two">
                        {bulkActions?.(selectedRowsData, () => setRowSelection({}))}
                    </div>
                </div>
            )}

            {/* ── Table ─────────────────────────────────────────────────────── */}
            {(isLoading || isFetching) ? <>
                <SkeletonGrid rows={7} columns={4} height={'45px'} gap={'3px'} />
            </>
                : <div className={`table-filter-content ${isFetching ? 'table-fetching' : ''}`}>
                    <table className={`custom-table ${rowCheckBox ? 'RowCheckBox' : ''}`}>
                        <thead>
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <th key={header.id} onClick={header.column.getToggleSortingHandler()}>
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                            {header.column.getIsSorted() === 'asc'
                                                ? <HiMiniArrowUp className="sort-icon ascent-sort" />
                                                : header.column.getIsSorted() === 'desc'
                                                    ? <HiMiniArrowDown className="sort-icon descent-sort" />
                                                    : header.column.columnDef.enableSorting !== false
                                                        ? <HiArrowsUpDown className="sort-icon" />
                                                        : null}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody>
                            {table.getRowModel().rows.length === 0 ? (
                                <tr>
                                    <td colSpan={table.getVisibleFlatColumns().length} className="no-data-row">
                                        No data available
                                    </td>
                                </tr>
                            ) : (
                                table.getRowModel().rows.map(row => (
                                    <tr
                                        key={row.id}
                                        style={row.original._rowStyle || {}}
                                        className={`table-row ${row.original._rowClassName || ''}`}
                                        onClick={(e) => {
                                            if (!row.original._rowNavigateUrl) return

                                            // Ctrl+Click (Windows/Linux) or Cmd+Click (Mac) → open in new tab
                                            if (e.ctrlKey || e.metaKey) {
                                                window.open(row.original._rowNavigateUrl, '_blank')
                                                return
                                            }

                                            navigate(row.original._rowNavigateUrl)
                                        }}
                                    >
                                        {row.getVisibleCells().map(cell => {
                                            const colMeta = cell.column.columnDef.meta || {}
                                            const cellStyle = row.original._cellStyle?.[cell.column.id] || {}
                                            return (
                                                <td
                                                    key={cell.id}
                                                    className={`${colMeta.className || ''} ${row.getIsSelected() ? 'selected-td' : ''}`}
                                                    style={{ ...colMeta.style, ...cellStyle }}
                                                    onClick={(e) => cell.column.id === 'select' && e.stopPropagation()}
                                                >
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </td>
                                            )
                                        })}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>}


            {/* ── Bottom / Pagination ───────────────────────────────────────── */}
            <div className="table-filter-bottom">
                <div className="table-filter-left">
                    <div className="page-row">
                        <label>Rows per page:</label>
                        <select
                            value={pageSize}
                            onChange={e => setPageSize(Number(e.target.value))}
                        >
                            {[10, 25, 50, 100].map(size => (
                                <option key={size} value={size}>{size}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="table-filter-right">
                    <div className="page-numbers">
                        <p>{totalRows ? startRow : 0}–{endRow} of {totalRows}</p>
                    </div>
                    <div className="pagination-buttons">
                        <Button
                            size="small" icon={<IoIosArrowBack />}
                            onClick={() => { setPage(page - 1) }}
                            disabled={!canPrevPage}
                            rounded outlined
                        />
                        <Button
                            size="small" icon={<IoIosArrowForward />}
                            onClick={() => { setPage(page + 1) }}
                            disabled={!canNextPage}
                            rounded outlined
                        />
                    </div>
                </div>
            </div>

        </div>
    )
}

export default Table

// ─────────────────────────────────────────────────────────────────────────────
// Checkbox column definition (extracted to keep the component clean)
// ─────────────────────────────────────────────────────────────────────────────
const checkboxColumn = {
    id: 'select',
    enableSorting: false,
    enableHiding: false,
    header: ({ table }) => {
        const selectableRows = table.getRowModel().rows.filter(row => !row.original.disableCheckbox)
        const allSelected = selectableRows.every(row => row.getIsSelected())
        const someSelected = selectableRows.some(row => row.getIsSelected())
        const handleSelectAll = () => selectableRows.forEach(row => row.toggleSelected(!allSelected))
        return (
            <label className="table-checkbox-input">
                <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={handleSelectAll}
                    indeterminate={`${!allSelected && someSelected}`}
                    disabled={table.getRowModel().rows.every(row => row.original.disableCheckbox)}
                />
                <span className="checkbox-box" />
            </label>
        )
    },
    cell: ({ row }) => (
        <label className="table-checkbox-input">
            <input
                type="checkbox"
                checked={row.getIsSelected()}
                onChange={row.getToggleSelectedHandler()}
                onClick={e => e.stopPropagation()}
                disabled={row.original.disableCheckbox}
            />
            <span className="checkbox-box" />
        </label>
    ),
}