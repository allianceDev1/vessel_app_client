import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    setSelectedTechnician,
    setSelectedTravel,
    setActiveTab,
    toggleSidebar,
    requestFitBounds,
} from '../../../../redux/features/mapSlice';
import {
    getTechnicianStatusMeta,
    formatDistance,
    formatDuration,
    formatSpeed,
    formatRelativeTime,
    isLocationStale,
    geoPointToLatLng,
} from '../../../../utils/map.utils';
import {
    TbSearch,
    TbRoute,
    TbTool,
    TbChevronLeft,
    TbChevronRight,
    TbAlertTriangle,
    TbGauge,
    TbClock,
    TbMapPin,
    TbUser,
} from 'react-icons/tb';

export const MapSidebar = ({ technicians = [], travels = [] }) => {
    const dispatch = useDispatch();
    const {
        sidebarOpen,
        activeTab,
        selectedTechnicianId,
        selectedTravelId,
    } = useSelector((state) => state.map);

    const [searchTerm, setSearchTerm] = useState('');

    // Filter travels by search
    const filteredTravels = travels.filter((tr) => {
        const query = searchTerm.toLowerCase();
        const tech = technicians.find((t) => (t.technicianId || t.sid) === tr.technicianId);
        return (
            (tr.customerId && tr.customerId.toLowerCase().includes(query)) ||
            (tr.registrationId && tr.registrationId.toLowerCase().includes(query)) ||
            (tr?.destination?.address && tr.destination.address.toLowerCase().includes(query)) ||
            (tech?.name && tech.name.toLowerCase().includes(query))
        );
    });

    // Filter technicians by search
    const filteredTechnicians = technicians.filter((tech) => {
        const query = searchTerm.toLowerCase();
        return (
            (tech.name && tech.name.toLowerCase().includes(query)) ||
            (tech.sid && tech.sid.toLowerCase().includes(query)) ||
            (tech.technicianId && tech.technicianId.toLowerCase().includes(query))
        );
    });

    // Select travel and focus on map
    const handleSelectTravel = (travel) => {
        const id = travel.travelId || travel._id;
        dispatch(setSelectedTravel(id));

        const origin = geoPointToLatLng(travel?.origin?.location);
        const dest = geoPointToLatLng(travel?.destination?.location);
        const lastLoc = geoPointToLatLng(travel?.lastLocation);

        const points = [origin, dest, lastLoc].filter(Boolean);
        if (points.length > 0) {
            dispatch(requestFitBounds({ type: 'FIT_COORDINATES', payload: points }));
        }
    };

    // Select technician and focus on map
    const handleSelectTechnician = (tech) => {
        const id = tech.technicianId || tech.sid || tech._id;
        dispatch(setSelectedTechnician(id));

        const pos = geoPointToLatLng(tech.location) || (
            tech.latitude && tech.longitude ? { lat: tech.latitude, lng: tech.longitude } : null
        );

        if (pos) {
            dispatch(requestFitBounds({ type: 'PAN_TO', payload: { ...pos, zoom: 16 } }));
        }
    };

    return (
        <div className={`map-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
            {/* Sidebar toggle tab */}
            <button
                className="sidebar-toggle-tab"
                onClick={() => dispatch(toggleSidebar())}
                title={sidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
            >
                {sidebarOpen ? <TbChevronLeft /> : <TbChevronRight />}
            </button>

            {sidebarOpen && (
                <div className="sidebar-inner">
                    {/* Header & Tabs */}
                    <div className="sidebar-header">
                        <div className="tab-buttons">
                            <button
                                className={`tab-btn ${activeTab === 'travels' ? 'active' : ''}`}
                                onClick={() => dispatch(setActiveTab('travels'))}
                            >
                                <TbRoute />
                                <span>Active Travels</span>
                                <span className="tab-count">{travels.length}</span>
                            </button>

                            <button
                                className={`tab-btn ${activeTab === 'technicians' ? 'active' : ''}`}
                                onClick={() => dispatch(setActiveTab('technicians'))}
                            >
                                <TbTool />
                                <span>Technicians</span>
                                <span className="tab-count">{technicians.length}</span>
                            </button>
                        </div>

                        {/* Search Input */}
                        <div className="search-bar">
                            <TbSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder={activeTab === 'travels' ? 'Search travels, customers...' : 'Search technicians...'}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Content List */}
                    <div className="sidebar-list">
                        {activeTab === 'travels' ? (
                            filteredTravels.length > 0 ? (
                                filteredTravels.map((travel) => {
                                    const id = travel.travelId || travel._id;
                                    const isSelected = selectedTravelId === id;
                                    const tech = technicians.find(
                                        (t) => (t.technicianId || t.sid) === travel.technicianId
                                    );

                                    return (
                                        <div
                                            key={id}
                                            className={`sidebar-card travel-card ${isSelected ? 'selected' : ''}`}
                                            onClick={() => handleSelectTravel(travel)}
                                        >
                                            <div className="card-header">
                                                <div className="card-tech-info">
                                                    <TbUser className="icon" />
                                                    <span className="tech-name">
                                                        {tech?.name || 'Technician'} ({travel.technicianId?.slice(0, 7)})
                                                    </span>
                                                </div>
                                                <span className="badge-in-progress">In Progress</span>
                                            </div>

                                            <div className="card-body">
                                                <div className="destination-row">
                                                    <TbMapPin className="pin-icon" />
                                                    <div className="dest-text">
                                                        <span className="dest-addr">
                                                            {travel?.destination?.address || 'Customer site'}
                                                        </span>
                                                        {travel.customerId && (
                                                            <span className="dest-cid">CID: {travel.customerId}</span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="metrics-row">
                                                    <span className="metric-pill">
                                                        Dist: {formatDistance(travel?.route?.distanceMeters)}
                                                    </span>
                                                    <span className="metric-pill">
                                                        ETA: {formatDuration(travel?.route?.durationSeconds)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="sidebar-empty">
                                    <TbRoute className="empty-icon" />
                                    <p>No active technician travels</p>
                                </div>
                            )
                        ) : filteredTechnicians.length > 0 ? (
                            filteredTechnicians.map((tech) => {
                                const id = tech.technicianId || tech.sid || tech._id;
                                const isSelected = selectedTechnicianId === id;
                                const meta = getTechnicianStatusMeta(tech.status);
                                const stale = isLocationStale(tech.recordedAt, 15);

                                return (
                                    <div
                                        key={id}
                                        className={`sidebar-card tech-card ${isSelected ? 'selected' : ''}`}
                                        onClick={() => handleSelectTechnician(tech)}
                                    >
                                        <div className="card-header">
                                            <div className="tech-meta">
                                                <h5 className="tech-name">{tech.name || 'Technician'}</h5>
                                                <span className="tech-sid">{tech.sid || id.slice(0, 8)}</span>
                                            </div>
                                            <span
                                                className="status-pill"
                                                style={{
                                                    backgroundColor: meta.bgColor,
                                                    color: meta.color,
                                                    borderColor: meta.borderColor,
                                                }}
                                            >
                                                {meta.label}
                                            </span>
                                        </div>

                                        <div className="card-body">
                                            <div className="tech-stats">
                                                <span className="stat-item">
                                                    <TbGauge /> {formatSpeed(tech.speed)}
                                                </span>
                                                <span className="stat-item">
                                                    <TbClock /> {formatRelativeTime(tech.recordedAt)}
                                                </span>
                                                {stale && (
                                                    <span className="stale-warning" title="GPS is stale">
                                                        <TbAlertTriangle /> Stale
                                                    </span>
                                                )}
                                            </div>

                                            {tech.customerId && (
                                                <div className="assigned-customer">
                                                    Assigned to: {tech.customerId}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="sidebar-empty">
                                <TbTool className="empty-icon" />
                                <p>No active technicians found</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MapSidebar;

