import React from 'react'
import { Tooltip } from 'recharts'

const ChartTooltip = ({ labelFormatter } = {}) => {
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
                    fontSize: '13px',
                }}>
                    {/* Optional label/title row */}
                    {label && (
                        <p style={{ margin: '0 0 4px 0', fontWeight: 600 }}>
                            {labelFormatter ? labelFormatter(label) : label}
                        </p>
                    )}

                    {/* Each data entry with a color dot */}
                    {payload.map((entry, index) => (
                        <div key={index} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '2px 0',
                        }}>
                            {/* Color dot */}
                            <span style={{
                                display: 'inline-block',
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: entry.color,
                                flexShrink: 0,
                            }} />

                            {/* Label + value */}
                            <span style={{ color: 'var(--text-primary)' }}>
                                {entry.name}: <strong>{entry.value}</strong>
                            </span>
                        </div>
                    ))}
                </div>
            )
        }}
    />

}

export default ChartTooltip