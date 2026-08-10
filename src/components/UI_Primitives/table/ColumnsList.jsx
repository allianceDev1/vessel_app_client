import React from 'react'
import Checkbox from '../inputs/Checkbox';

const ColumnsList = ({ columns, columnVisibility, columnListing, onToggle }) => {

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: "5px" }}>
            {columns
                .filter((column) => columnListing?.[column.id] !== false)
                .map((column) => (
                    <Checkbox
                        key={column.id}
                        checked={columnVisibility[column.id] ?? true}
                        label={column.id}
                        disabled={column.enableHiding === false}
                        onChange={() => {
                            if (column.enableHiding !== false) {
                                onToggle(column.id)
                            }
                        }}
                    />
                ))}
        </div>
    )
}

export default ColumnsList