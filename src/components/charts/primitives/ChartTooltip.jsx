import React from 'react'
import { Tooltip } from 'recharts'

const ChartTooltip = ({
    labelFormatter,
    valueFormatter,
    nameVisibility = true,
    nameColorVisibility = true,
    labelVisibility = true
} = {}) => {
    return <Tooltip
        cursor={false}
        content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null

            return (
                <div style={{
                    backgroundColor: 'var(--background)',
                    border: '1px solid var(--border-light)',
                    color: 'var(--text-primary)',
                    borderRadius: '8px',
                    padding: '6px 10px',
                    fontSize: '13px'
                }}>
                    {/* Optional label/title row */}
                    {(label && labelVisibility) && (
                        <p style={{ margin: '0 0 4px 0', fontWeight: 600 }}>
                            {labelFormatter ? labelFormatter(label) : label}
                        </p>
                    )}

                    {/* Each data entry with a color dot */}
                    {payload.map((entry, index) => {
                        const color = entry.color || entry.fill || entry.payload?.fill || entry.payload?.color_code

                        return <div key={index} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '2px 0',
                        }}>
                            {/* Color dot */}
                            {nameColorVisibility && <span style={{
                                display: 'inline-block',
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: color,
                                flexShrink: 0,
                            }} />}

                            {/* Label + value */}
                            <span style={{ color: 'var(--text-primary)' }}>
                                {nameVisibility ? `${entry.name} : ` : ''}
                                <strong>{valueFormatter ? valueFormatter(entry.value) : entry.value}</strong>
                            </span>
                        </div>
                    })}
                </div>
            )
        }}
    />

}

export default ChartTooltip