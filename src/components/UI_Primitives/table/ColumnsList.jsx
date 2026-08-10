import React from 'react'
import Checkbox from '../inputs/Checkbox';

const ColumnsList = ({ table, columnVisibility, columnListing }) => {

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: "5px" }}>
            {table.getAllLeafColumns()
                .filter((column) => columnListing?.[column.id] !== false)
                .map((column) => (
                    <Checkbox key={column.id}
                        checked={column.getIsVisible()}
                        label={column.id}
                        disabled={column.columnDef.enableHiding === false}
                        onChange={() => {
                            if (column.columnDef.enableHiding !== false) {
                                column.toggleVisibility(!column.getIsVisible());
                            }
                        }} />
                ))}
        </div>
    )
}

export default ColumnsList