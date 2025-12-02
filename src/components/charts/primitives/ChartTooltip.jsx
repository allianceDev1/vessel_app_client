import React from 'react'
import { Tooltip } from 'recharts'

const ChartTooltip = () => {
    return <Tooltip
        contentStyle={{
            backgroundColor: 'var(--background)',
            border: '1px solid var(--border-light)',
            color: 'var(--text-primary)',
            borderRadius: '8px',
            padding: '2px 8px',
            fontSize: '13px'
        }}
        itemStyle={{
            color: 'var(--text-primary)',
            padding: '2px 0'
        }}
    />

}

export default ChartTooltip