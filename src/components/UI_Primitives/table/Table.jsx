import React, { useState } from 'react'
import './style.scss'
import { IoIosArrowForward, IoIosArrowBack } from 'react-icons/io'
import { useReactTable, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, flexRender } from '@tanstack/react-table';
import { HiArrowsUpDown, HiMiniArrowDown, HiMiniArrowUp } from "react-icons/hi2";
import { TbColumns3 } from "react-icons/tb";
import { modal } from '../../../redux/features/non_persisted/miniSystemSlice';
import { useDispatch } from 'react-redux';
import InputText from '../../UI_Primitives/inputs/InputText'
import Button from '../../UI_Primitives/buttons/Button';
import ColumnsList from './ColumnsList';

const Table = ({ columns = [], data = [], rowCheckBox = false, topComponents, bulkActions, columnVisible, columnListing }) => {

    // Example
    //  const columns = [
    //     { header: 'Name', accessorKey: 'name', enableHiding: false, },
    //     { header: 'Email', accessorKey: 'email', meta: { className: 'col-id', style: { fontWeight: 'bold', color: 'red' } } },
    //     { header: 'Role', accessorKey: 'role', cellStyle: { color: 'blue', fontWeight: 'bold' } },
    //     {
    //         header: 'Actions',
    //         cell: ({ row }) => (
    //             <div className="action-buttons">
    //                 <button onClick={(e) => handleEdit(e, row.original)}>Edit</button>
    //                 <button onClick={(e) => handleDelete(e, row.original)}>Delete</button>
    //             </div>
    //         ),
    //         enableSorting: false,
    //         enableColumnFilter: false,
    //     },
    // ];

    //   const list = Array.from({ length: 20 }, (_, i) => ({
    //     name: `User ${i + 1}`,
    //     _rowStyle: { backgroundColor: '#e0f7fa', cursor: 'Pointer' },
    //     _rowClassName: 'row-user',
    //     _cellStyle: {
    //         name: { fontWeight: 'bold', backgroundColor: '#e0f7fa' }
    //     },
    //      _onClick: () => navigate(`/user/1`)
    // }));

    const dispatch = useDispatch();
    const [globalFilter, setGlobalFilter] = useState('');
    const [columnVisibility, setColumnVisibility] = useState({ ...columnVisible, ...columnListing });
    const [rowSelection, setRowSelection] = useState({});
    const [sorting, setSorting] = useState([]);

    const table = useReactTable({
        data,
        columns: [
            ...(rowCheckBox ? [

                {
                    id: 'select',
                    header: ({ table }) => {

                        // Get all selectable (non-disabled) rows on current page
                        const selectableRows = table.getRowModel().rows.filter(row => !row.original.disableCheckbox);
                        const allSelected = selectableRows.every(row => row.getIsSelected());
                        const someSelected = selectableRows.some(row => row.getIsSelected());

                        const handleSelectAll = () => {
                            selectableRows.forEach(row => {
                                row.toggleSelected(!allSelected);
                            });
                        };

                        return <label className="table-checkbox-input">
                            <input type="checkbox"
                                checked={allSelected}
                                onChange={handleSelectAll}
                                indeterminate={`${!allSelected && someSelected}`}
                                disabled={table.getRowModel().rows.every(row => row.original.disableCheckbox)}
                            />
                            <span className="checkbox-box"></span>
                        </label>
                    },
                    cell: ({ row }) => {
                        const isDisabled = row.original.disableCheckbox;
                        return <label className="table-checkbox-input">
                            <input type="checkbox"
                                checked={row.getIsSelected()}
                                onChange={row.getToggleSelectedHandler()}
                                onClick={(e) => e.stopPropagation()}
                                disabled={isDisabled}
                            />
                            <span className="checkbox-box"></span>
                        </label>
                    },
                    enableSorting: false,
                    enableHiding: false
                }
            ] : []),
            ...columns
        ],
        state: {
            globalFilter,
            columnVisibility,
            rowSelection,
            sorting
        },
        onGlobalFilterChange: setGlobalFilter,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        enableRowSelection: true,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    const pageIndex = table?.getState()?.pagination?.pageIndex || 0;
    const pageSize = table?.getState()?.pagination?.pageSize || 0;
    const totalRows = table?.getFilteredRowModel()?.rows?.length || 0;
    const startRow = pageIndex * pageSize + 1;
    const endRow = Math.min(startRow + pageSize - 1, totalRows);
    const selectedRowsData = table?.getSelectedRowModel()?.rows?.map(r => r?.original);

    const handleColumnHide = () => {
        dispatch(modal.push({
            show: true,
            title: "Edit Columns",
            body: <ColumnsList table={table} columnVisibility={columnVisibility} columnListing={columnListing} />
        }));
    }



    return (
        <div className="ui-tanstack-table-div">
            {/* Top Section */}
            <div className="table-filter-top">
                <div className="table-filter-left">
                    {/* Search */}
                    <div className="text-input-div">
                        <InputText id={'search'} name='search' value={globalFilter}
                            onChange={(e) => setGlobalFilter(e.target.value)} label='Search...' />
                    </div>
                </div>
                <div className="table-filter-right">
                    <Button style={{ marginRight: '10px' }} icon={<TbColumns3 />} onClick={handleColumnHide} rounded outlined size='small' />
                    {topComponents}
                </div>
            </div>

            {/* Bulk Action */}
            {selectedRowsData.length > 0 && (
                <div className="bulk-actions">
                    <div className="section-one">
                        <span>{selectedRowsData.length} Selected</span>
                    </div>
                    <div className="section-two">{bulkActions(selectedRowsData, () => setRowSelection({}))}</div>
                </div>
            )}

            {/* Table section */}
            <div className="table-filter-content">
                <table className={`custom-table ${rowCheckBox && 'RowCheckBox'}`}>
                    <thead>
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th key={header.id} onClick={header.column.getToggleSortingHandler()}>
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                        {header.column.getIsSorted() === 'asc' ? <HiMiniArrowUp className='sort-icon ascent-sort' />
                                            : header.column.getIsSorted() === 'desc' ? <HiMiniArrowDown className='sort-icon descent-sort' />
                                                : header.column.columnDef.enableSorting !== false ? <HiArrowsUpDown className='sort-icon' /> : ""}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {
                            table.getRowModel().rows.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={table.getVisibleFlatColumns().length}
                                        className="no-data-row"
                                    >
                                        No data available
                                    </td>
                                </tr>
                            ) : (table.getRowModel().rows.map(row => (
                                <tr
                                    key={row.id}
                                    style={row.original._rowStyle || {}}
                                    className={`table-row ${row.original._rowClassName || ''}`}
                                    onClick={(e) => row.original._onClick?.(e)}
                                >
                                    {row.getVisibleCells().map(cell => {
                                        const colMeta = cell.column.columnDef.meta || {};
                                        const cellStyle = row.original._cellStyle?.[cell.column.id] || {};

                                        return <td className={`${colMeta.className || ''} ${row?.getIsSelected() && 'selected-td'}`} key={cell.id}
                                            onClick={(e) => cell.column.id === 'select' && e.stopPropagation()}
                                            style={{ ...colMeta.style, ...cellStyle }}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    })}
                                </tr>
                            )))
                        }
                    </tbody>
                </table>
            </div>

            {/* Bottom content */}
            <div className="table-filter-bottom">
                <div className="table-filter-left">
                    <div className="page-row">
                        <label htmlFor="">Rows per page:</label>
                        <select onChange={e => table.setPageSize(Number(e.target.value))}
                            value={table.getState().pagination.pageSize}>
                            {[10, 25, 50, 100].map(size => (<option key={size} value={size}>{size}</option>))}
                        </select>
                    </div>
                </div>

                <div className="table-filter-right">
                    <div className="page-numbers">
                        <p>{table.getFilteredRowModel().rows.length ? startRow : 0}-{endRow} of {table.getFilteredRowModel().rows.length}</p>
                    </div>
                    <div className="pagination-buttons">
                        <Button size='small' icon={<IoIosArrowBack />} onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} rounded outlined />
                        <Button size='small' icon={<IoIosArrowForward />} onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} rounded outlined />
                    </div>
                </div>
            </div>
        </div >
    )
}

export default Table