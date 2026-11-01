import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useGoogleMap } from './MapContext';
import {
    geoPointToLatLng,
    getTechnicianStatusMeta,
    formatSpeed,
    formatRelativeTime,
    isLocationStale,
} from '../../../../utils/map.utils';
import {
    setSelectedTechnician,
    setSelectedTravel,
    requestFitBounds,
} from '../../../../redux/features/mapSlice';
import {
    TbGauge,
    TbCompass,
    TbClock,
    TbAlertTriangle,
    TbRoute,
    TbX,
    TbTool,
} from 'react-icons/tb';

export const TechnicianInfoWindow = ({ technicians = [], travels = [] }) => {
    const { map } = useGoogleMap();
    const dispatch = useDispatch();
    const { selectedTechnicianId } = useSelector((state) => state.map);

    const infoWindowRef = useRef(null);
    const containerRef = useRef(document.createElement('div'));

    const technician = technicians.find(
        (t) => (t.technicianId || t.sid || t._id) === selectedTechnicianId
    );

    // Check if technician is currently on an active travel
    const activeTravel = travels.find(
        (tr) => tr.technicianId === selectedTechnicianId
    );

    useEffect(() => {
        if (!map || !window.google) return;

        if (!infoWindowRef.current) {
            infoWindowRef.current = new window.google.maps.InfoWindow({
                content: containerRef.current,
                maxWidth: 340,
            });

            infoWindowRef.current.addListener('closeclick', () => {
                dispatch(setSelectedTechnician(null));
            });
        }

        return () => {
            if (infoWindowRef.current) {
                infoWindowRef.current.close();
            }
        };
    }, [map, dispatch]);

    useEffect(() => {
        if (!map || !infoWindowRef.current) return;

        if (!technician) {
            infoWindowRef.current.close();
            return;
        }

        const pos = geoPointToLatLng(technician.location) || (
            technician.latitude && technician.longitude
                ? { lat: technician.latitude, lng: technician.longitude }
                : null
        );

        if (pos) {
            infoWindowRef.current.setPosition(pos);
            infoWindowRef.current.open(map);
        } else {
            infoWindowRef.current.close();
        }
    }, [technician, map]);

    if (!technician) return null;

    const statusMeta = getTechnicianStatusMeta(technician.status);
    const stale = isLocationStale(technician.recordedAt, 15);
    const id = technician.technicianId || technician.sid || technician._id;

    const handleFocusTravel = () => {
        if (activeTravel) {
            const travelId = activeTravel.travelId || activeTravel._id;
            dispatch(setSelectedTravel(travelId));

            // Fit travel bounds
            const origin = geoPointToLatLng(activeTravel?.origin?.location);
            const dest = geoPointToLatLng(activeTravel?.destination?.location);
            const current = geoPointToLatLng(technician.location);

            const points = [origin, dest, current].filter(Boolean);
            if (points.length > 0) {
                dispatch(requestFitBounds({ type: 'FIT_COORDINATES', payload: points }));
            }
        }
    };

    return createPortal(
        <div className="map-info-window technician-info-window">
            <div className="info-window-header">
                <div
                    className="header-icon tech-icon"
                    style={{ backgroundColor: statusMeta.bgColor, color: statusMeta.color }}
                >
                    <TbTool />
                </div>
                <div className="header-text">
                    <h4 className="title">{technician.name || 'Technician'}</h4>
                    <span className="subtitle">{technician.sid || id}</span>
                </div>
                <button
                    className="close-btn"
                    onClick={() => dispatch(setSelectedTechnician(null))}
                    title="Close"
                >
                    <TbX />
                </button>
            </div>

            <div className="info-window-body">
                <div className="status-badge-row">
                    <span
                        className="status-pill"
                        style={{
                            backgroundColor: statusMeta.bgColor,
                            color: statusMeta.color,
                            borderColor: statusMeta.borderColor,
                        }}
                    >
                        {statusMeta.label}
                    </span>

                    {stale && (
                        <span className="stale-pill" title="Location was not updated recently">
                            <TbAlertTriangle /> Stale GPS
                        </span>
                    )}
                </div>

                <div className="telemetry-grid">
                    <div className="telemetry-item">
                        <TbGauge className="item-icon" />
                        <span className="item-label">Speed:</span>
                        <span className="item-val">{formatSpeed(technician.speed)}</span>
                    </div>

                    {technician.heading !== undefined && technician.heading !== null && (
                        <div className="telemetry-item">
                            <TbCompass className="item-icon" />
                            <span className="item-label">Heading:</span>
                            <span className="item-val">{Math.round(technician.heading)}°</span>
                        </div>
                    )}

                    <div className="telemetry-item">
                        <TbClock className="item-icon" />
                        <span className="item-label">Updated:</span>
                        <span className="item-val">{formatRelativeTime(technician.recordedAt)}</span>
                    </div>
                </div>

                {activeTravel && (
                    <div className="active-visit-box">
                        <div className="visit-title">Active Travel Target:</div>
                        <p className="visit-destination">
                            {activeTravel?.destination?.address || 'Customer site'}
                        </p>
                        {activeTravel?.customerId && (
                            <span className="visit-cid">CID: {activeTravel.customerId}</span>
                        )}
                    </div>
                )}
            </div>

            {activeTravel && (
                <div className="info-window-footer">
                    <button className="focus-travel-btn" onClick={handleFocusTravel}>
                        <TbRoute />
                        <span>Focus Travel Route</span>
                    </button>
                </div>
            )}
        </div>,
        containerRef.current
    );
};

export default TechnicianInfoWindow;

