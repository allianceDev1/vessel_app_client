import React from 'react'
import { Legend } from 'recharts'

const ChartLegend = ({ verticalAlign = 'bottom', iconType = 'circle' }) => {

    return <Legend
        verticalAlign={verticalAlign}
        iconType={iconType}
        formatter={(value, entry) => (
            <span style={{ fontSize: '13px' }}>
                {value}: {entry.payload.value}
            </span >
        )}
    />
}

export default ChartLegend