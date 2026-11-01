import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useGoogleMap } from './MapContext';
import {
    toggleVisibility,
    setTechnicianFilter,
    requestFitBounds,
} from '../../../../redux/features/mapSlice';
import { getLocation } from '../../../../utils/services/location_services';
import {
    TbPlus,
    TbMinus,
    TbCurrentLocation,
    TbUsers,
    TbTool,
    TbRoute,
    TbReload,
    TbFilter,
    TbEye,
    TbEyeOff,
} from 'react-icons/tb';

export const MapControls = ({
    technicians = [],
    travels = [],
    onRefresh,
    isRefreshing = false,
}) => {
    const { map } = useGoogleMap();
    const dispatch = useDispatch();
    const {
        visibility,
        technicianFilter,
        socketStatus,
        selectedTechnicianId,
        selectedTravelId,
    } = useSelector((state) => state.map);

    const [isLocating, setIsLocating] = useState(false);
    const [showFilterMenu, setShowFilterMenu] = useState(false);

    // Zoom Controls
    const handleZoomIn = () => {
        if (!map) return;
        map.setZoom(map.getZoom() + 1);
    };

    const handleZoomOut = () => {
        if (!map) return;
        map.setZoom(map.getZoom() - 1);
    };

    // Controller My Location
    const handleLocateMe = async () => {
        setIsLocating(true);
        try {
            const loc = await getLocation();
            if (loc.success && map) {
                map.panTo({ lat: loc.latitude, lng: loc.longitude });
                map.setZoom(15);
            }
        } catch (e) {
            console.warn('Unable to get controller location', e);
        } finally {
            setIsLocating(false);
        }
    };

    // Fit All Technicians
    const handleFitAllTechnicians = () => {
        dispatch(requestFitBounds({ type: 'ALL_TECH', payload: technicians }));
    };

    const filterOptions = [
        { key: 'ALL', label: 'All Statuses' },
        { key: 'TRAVEL', label: 'Travelling' },
        { key: 'IN_SERVICE', label: 'In Service' },
        { key: 'IDLE', label: 'Idle' },
    ];

    return (
        <div className="map-controls-container">
            {/* Top Toolbar: Status & Visibility Toggles */}
            <div className="controls-top-bar">
                {/* Socket status indicator */}
                <div
                    className={`socket-badge status-${socketStatus}`}
                    title={`Real-Time Gateway: ${socketStatus}`}
                >
                    <span className="pulse-dot" />
                    <span className="socket-label">
                        {socketStatus === 'connected' ? 'Live' : socketStatus}
                    </span>
                </div>

                {/* Visibility Toggles */}
                <div className="visibility-group">
                    <button
                        className={`control-pill ${visibility.customers ? 'active' : ''}`}
                        onClick={() => dispatch(toggleVisibility('customers'))}
                        title="Toggle Customers"
                    >
                        <TbUsers />
                        <span>Customers</span>
                        {visibility.customers ? <TbEye className="eye-icon" /> : <TbEyeOff className="eye-icon off" />}
                    </button>

                    <button
                        className={`control-pill ${visibility.technicians ? 'active' : ''}`}
                        onClick={() => dispatch(toggleVisibility('technicians'))}
                        title="Toggle Technicians"
                    >
                        <TbTool />
                        <span>Techs ({technicians.length})</span>
                        {visibility.technicians ? <TbEye className="eye-icon" /> : <TbEyeOff className="eye-icon off" />}
                    </button>

                    <button
                        className={`control-pill ${visibility.travels ? 'active' : ''}`}
                        onClick={() => dispatch(toggleVisibility('travels'))}
                        title="Toggle Active Travels"
                    >
                        <TbRoute />
                        <span>Travels ({travels.length})</span>
                        {visibility.travels ? <TbEye className="eye-icon" /> : <TbEyeOff className="eye-icon off" />}
                    </button>
                </div>

                {/* Status Filter Dropdown */}
                <div className="filter-dropdown-wrapper">
                    <button
                        className={`control-pill filter-btn ${technicianFilter !== 'ALL' ? 'active' : ''}`}
                        onClick={() => setShowFilterMenu((prev) => !prev)}
                        title="Filter Technicians"
                    >
                        <TbFilter />
                        <span>{filterOptions.find((f) => f.key === technicianFilter)?.label || 'Filter'}</span>
                    </button>

                    {showFilterMenu && (
                        <div className="filter-dropdown-menu">
                            {filterOptions.map((opt) => (
                                <div
                                    key={opt.key}
                                    className={`filter-item ${technicianFilter === opt.key ? 'selected' : ''}`}
                                    onClick={() => {
                                        dispatch(setTechnicianFilter(opt.key));
                                        setShowFilterMenu(false);
                                    }}
                                >
                                    {opt.label}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Refresh Button */}
                {onRefresh && (
                    <button
                        className={`control-btn refresh-btn ${isRefreshing ? 'rotating' : ''}`}
                        onClick={onRefresh}
                        title="Refresh Map Data"
                        disabled={isRefreshing}
                    >
                        <TbReload />
                    </button>
                )}
            </div>

            {/* Bottom-Right Float: Navigation / Zoom / Fit Actions */}
            <div className="controls-floating-group">
                {/* Fit Technicians */}
                <button
                    className="control-fab"
                    onClick={handleFitAllTechnicians}
                    title="Fit All Technicians in View"
                >
                    <TbTool />
                </button>

                {/* My Location */}
                <button
                    className={`control-fab ${isLocating ? 'locating' : ''}`}
                    onClick={handleLocateMe}
                    title="Center on My Location"
                    disabled={isLocating}
                >
                    <TbCurrentLocation />
                </button>

                {/* Zoom In & Out */}
                <div className="zoom-group">
                    <button className="zoom-btn" onClick={handleZoomIn} title="Zoom In">
                        <TbPlus />
                    </button>
                    <div className="zoom-divider" />
                    <button className="zoom-btn" onClick={handleZoomOut} title="Zoom Out">
                        <TbMinus />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MapControls;

