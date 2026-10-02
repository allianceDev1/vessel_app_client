import React, { useState } from 'react';
import { TbInfoCircle, TbChevronDown, TbChevronUp } from 'react-icons/tb';

export const MapLegend = () => {
    const [collapsed, setCollapsed] = useState(true);

    return (
        <div className={`map-legend-card ${collapsed ? 'collapsed' : ''}`}>
            <div className="legend-header" onClick={() => setCollapsed((prev) => !prev)}>
                <div className="legend-title">
                    <TbInfoCircle className="legend-icon" />
                    <span>Map Legend</span>
                </div>
                <button className="collapse-toggle-btn" title={collapsed ? 'Expand' : 'Collapse'}>
                    {collapsed ? <TbChevronUp /> : <TbChevronDown />}
                </button>
            </div>

            {!collapsed && (
                <div className="legend-content">
                    <div className="legend-section">
                        <span className="section-title">Technicians</span>
                        <div className="legend-row">
                            <span className="legend-dot tech-travel" />
                            <span className="legend-text">Travelling</span>
                        </div>
                        <div className="legend-row">
                            <span className="legend-dot tech-service" />
                            <span className="legend-text">In Service</span>
                        </div>
                        <div className="legend-row">
                            <span className="legend-dot tech-idle" />
                            <span className="legend-text">Idle</span>
                        </div>
                    </div>

                    <div className="legend-section">
                        <span className="section-title">Locations & Paths</span>
                        <div className="legend-row">
                            <span className="legend-dot customer-dot" />
                            <span className="legend-text">Customer Site</span>
                        </div>
                        <div className="legend-row">
                            <span className="legend-line planned-line" />
                            <span className="legend-text">Planned Route</span>
                        </div>
                        <div className="legend-row">
                            <span className="legend-line actual-line" />
                            <span className="legend-text">Actual GPS Path</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MapLegend;

