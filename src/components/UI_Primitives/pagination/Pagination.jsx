import React, { useState, useEffect, useCallback } from 'react'
import './pagination.scss'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { IoIosArrowForward, IoIosArrowBack } from 'react-icons/io'
import InputText from '../../UI_Primitives/inputs/InputText'
import Button from '../../UI_Primitives/buttons/Button'
import SkeletonGrid from '../skeleton/SkeletonGrid'

// ─────────────────────────────────────────────
// URL STATE
// ─────────────────────────────────────────────
function useListUrlState(listKey = 'list') {
    const [searchParams, setSearchParams] = useSearchParams()

    const getParam = (key, fallback) =>
        searchParams.get(`${listKey}_${key}`) ?? fallback

    const page = parseInt(getParam('page', '0'), 10)
    const pageSize = parseInt(getParam('limit', '10'), 10)
    const search = getParam('search', '')

    const setParam = useCallback(
        (updates) => {
            setSearchParams(prev => {
                const next = new URLSearchParams(prev)

                Object.entries(updates).forEach(([k, v]) => {
                    const key = `${listKey}_${k}`

                    if (
                        v === '' ||
                        v === null ||
                        v === undefined
                    ) {
                        next.delete(key)
                    } else {
                        next.set(key, String(v))
                    }
                })

                return next
            }, { replace: true })
        },
        [setSearchParams, listKey]
    )

    const setPage = (p) => setParam({ page: p })
    const setPageSize = (s) =>
        setParam({ limit: s, page: 0 })

    const setSearch = (s) =>
        setParam({ search: s, page: 0 })

    return {
        page,
        pageSize,
        search,
        setPage,
        setPageSize,
        setSearch
    }
}

// ─────────────────────────────────────────────
// DEBOUNCE
// ─────────────────────────────────────────────
function useDebounce(value, delay = 400) {
    const [debounced, setDebounced] = useState(value)

    useEffect(() => {
        const t = setTimeout(
            () => setDebounced(value),
            delay
        )
        return () => clearTimeout(t)
    }, [value, delay])

    return debounced
}

// ─────────────────────────────────────────────
// LIST CONTROLLER
// ─────────────────────────────────────────────
const Pagination = ({
    data: clientData = [],
    fetchFn,
    queryKey = 'list-data',
    listKey = 'list',
    renderItem,
    searchEnabled = true,
    selectable = false,
    topComponents,
    bulkActions,
    layout = 'list',
    gridGap = '10px',
    gridRepeat = 'repeat(auto-fit,minmax(280px,1fr))',
    skeletonGrid = {}
}) => {

    const isServerMode = !!fetchFn

    const {
        page,
        pageSize,
        search,
        setPage,
        setPageSize,
        setSearch
    } = useListUrlState(listKey)

    const debouncedSearch = useDebounce(
        search,
        isServerMode ? 400 : 0
    )

    const [selectedItems, setSelectedItems] =
        useState({})

    // ─────────────────────────────────────────
    // SERVER MODE
    // ─────────────────────────────────────────
    const {
        data: serverResult,
        isLoading,
        isFetching
    } = useQuery({
        queryKey: [
            ...(Array.isArray(queryKey)
                ? queryKey
                : [queryKey]),
            page,
            pageSize,
            debouncedSearch
        ],
        queryFn: () =>
            fetchFn({
                page,
                pageSize,
                search: debouncedSearch
            }),
        enabled: isServerMode,
        staleTime: 30000
    })

    const serverData =
        serverResult?.data ?? []

    const serverTotal =
        Number(serverResult?.total ?? 0)

    // ─────────────────────────────────────────
    // DATA
    // ─────────────────────────────────────────
    const fullData = isServerMode
        ? serverData
        : clientData

    // client search
    const filteredData = isServerMode
        ? fullData
        : fullData.filter(item =>
            JSON.stringify(item)
                .toLowerCase()
                .includes(search.toLowerCase())
        )

    // client pagination
    const paginatedData = isServerMode
        ? filteredData
        : filteredData.slice(
            page * pageSize,
            page * pageSize + pageSize
        )

    const totalRows = isServerMode
        ? serverTotal
        : filteredData.length

    const startRow =
        totalRows === 0
            ? 0
            : page * pageSize + 1

    const endRow = Math.min(
        startRow + pageSize - 1,
        totalRows
    )

    const canPrevPage = page > 0

    const canNextPage = isServerMode
        ? (page + 1) * pageSize <
        serverTotal
        : endRow < totalRows

    // ─────────────────────────────────────────
    // SELECTION
    // ─────────────────────────────────────────
    const toggleSelect = (id) => {
        setSelectedItems(prev => {
            const next = { ...prev }

            if (next[id]) {
                delete next[id]
            } else {
                next[id] = true
            }

            return next
        })
    }

    const selectedData =
        fullData.filter(
            item =>
                selectedItems[
                item._id || item.id
                ]
        )

    useEffect(() => {
        setSelectedItems({})
    }, [page, pageSize, search])

    // ─────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────
    return (
        <div className="ui-pagination-container">

            {/* ── Top Section ───────────────────────────────────────────────── */}
            {!selectedData.length && <div className="list-top">
                <div className="list-left">
                    <div className="text-input-div">
                        {searchEnabled && <InputText
                            id="search"
                            name="search"
                            type='search'
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            label="Search..."
                            size='small'
                        />}
                    </div>
                </div>
                <div className="list-right">
                    {topComponents}
                </div>
            </div>}

            {/* BULK */}
            {selectedData.length > 0 && (
                <div className="bulk-actions">
                    <div className="section-one">
                        <span>{selectedData.length} Selected</span>
                    </div>
                    <div className="section-two">
                        {bulkActions?.(selectedData, () => setSelectedItems({}))}
                    </div>
                </div>
            )}

            {/* CONTENT */}
            {(isLoading || isFetching)
                ? (
                    <SkeletonGrid
                        rows={skeletonGrid?.rows || 4}
                        columns={skeletonGrid?.columns || 3}
                        height={skeletonGrid?.hight || "150px"}
                        gap={skeletonGrid?.gap || '10px'}
                        responsive={skeletonGrid?.responsive || {
                            sm: {
                                rows: 5,
                                columns: 2
                            }
                        }}
                        style={{ marginTop: '15px' }}
                    />
                )
                : (
                    <div className={`list-content`} >
                        {paginatedData.length === 0 ? (
                            <div className="no-data">
                                <p>No data available</p>
                            </div>
                        ) : (
                            <div className={`list-wrapper layout-${layout}`}
                                style={{
                                    gap: gridGap,
                                    gridTemplateColumns: layout === 'grid' ? gridRepeat : '2fr'
                                }} >
                                {paginatedData.map(
                                    (item, index) => {
                                        const id = item._id || item.id || index
                                        return (
                                            <div key={id} className="list-item-wrapper" >
                                                {renderItem?.(
                                                    item,
                                                    {
                                                        selected: !!selectedItems[id],
                                                        toggleSelect: () => toggleSelect(id),
                                                        selectable
                                                    }
                                                )}
                                            </div>
                                        )
                                    }
                                )}
                            </div>
                        )}
                    </div>
                )
            }

            {/* PAGINATION */}
            <div className="list-bottom">
                <div className="left">
                    <label> Rows per page </label>
                    <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} >
                        {[10, 25, 50, 100]
                            .map(size => (
                                <option
                                    key={size}
                                    value={size}
                                >
                                    {size}
                                </option>
                            ))}
                    </select>
                </div>

                <div className="right">
                    <p>  {startRow}–{endRow}{' '}of{' '}{totalRows} </p>
                    <Button
                        size="small" icon={<IoIosArrowBack />} onClick={() => setPage(page - 1)}
                        disabled={!canPrevPage} rounded outlined
                    />
                    <Button
                        size="small" icon={<IoIosArrowForward />} onClick={() => setPage(page + 1)}
                        disabled={!canNextPage} rounded outlined
                    />
                </div>
            </div>
        </div >
    )
}

export default Pagination