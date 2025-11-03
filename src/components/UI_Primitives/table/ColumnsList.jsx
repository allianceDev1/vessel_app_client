import React, { useState } from 'react'
import Checkbox from '../inputs/Checkbox';

const ColumnsList = ({ table, columnVisibility, columnListing }) => {

    const [columnVisibleData, setColumnVisibleData] = useState(columnVisibility || {})

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: "5px" }}>
            {table.getAllLeafColumns()
                .filter((column) => columnListing?.[column.id] !== false)
                .map((column) => (
                    <Checkbox checked={columnVisibleData?.[column.id] !== false} label={column.id}
                        disabled={column.columnDef.enableHiding === false}
                        onChange={() => {
                            if (column.columnDef.enableHiding !== false) {
                                column.toggleVisibility(!column.getIsVisible());
                                setColumnVisibleData({
                                    ...columnVisibleData,
                                    [column.id]: !column.getIsVisible()
                                })
                            }
                        }} />
                ))}
        </div>
    )
}

export default ColumnsList