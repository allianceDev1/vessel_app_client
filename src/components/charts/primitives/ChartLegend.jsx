import React from 'react'
import { Legend } from 'recharts'

const ChartLegend = ({ verticalAlign = 'bottom', }) => {

    return <Legend
        verticalAlign={verticalAlign}
        formatter={(value, entry) => (
            <span style={{ fontSize: '13px' }}>
                {value}{entry.payload.value ? ` : ${entry.payload.value}` : ''}
            </span >
        )}
    />
}

export default ChartLegend