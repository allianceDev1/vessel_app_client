import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useGoogleMap } from './MapContext';
import { geoPointToLatLng } from '../utils/map.utils';
import { setSelectedCustomer } from '../store/mapSlice';
import { TbUser, TbMapPin, TbArrowRight, TbX } from 'react-icons/tb';

export const CustomerInfoWindow = ({ customers = [] }) => {
    const { map } = useGoogleMap();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { selectedCustomerId } = useSelector((state) => state.map);

    const infoWindowRef = useRef(null);
    const containerRef = useRef(document.createElement('div'));

    const customer = customers.find(
        (c) => (c.cid || c._id) === selectedCustomerId
    );

    useEffect(() => {
        if (!map || !window.google) return;

        if (!infoWindowRef.current) {
            infoWindowRef.current = new window.google.maps.InfoWindow({
                content: containerRef.current,
                maxWidth: 320,
            });

            infoWindowRef.current.addListener('closeclick', () => {
                dispatch(setSelectedCustomer(null));
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

        if (!customer) {
            infoWindowRef.current.close();
            return;
        }

        const pos = geoPointToLatLng(customer.location);
        if (pos) {
            infoWindowRef.current.setPosition(pos);
            infoWindowRef.current.open(map);
        } else {
            infoWindowRef.current.close();
        }
    }, [customer, map]);

    if (!customer) return null;

    const cid = customer.cid || customer._id;
    const addr = customer.addressSummary || {};

    return createPortal(
        <div className="map-info-window customer-info-window">
            <div className="info-window-header">
                <div className="header-icon customer-icon">
                    <TbUser />
                </div>
                <div className="header-text">
                    <h4 className="title">{customer.name || 'Customer'}</h4>
                    <span className="subtitle">{cid}</span>
                </div>
                <button
                    className="close-btn"
                    onClick={() => dispatch(setSelectedCustomer(null))}
                    title="Close"
                >
                    <TbX />
                </button>
            </div>

            <div className="info-window-body">
                {(addr.address || addr.place) && (
                    <div className="info-row">
                        <TbMapPin className="row-icon" />
                        <div className="row-content">
                            {addr.address && <p className="addr-line">{addr.address}</p>}
                            <p className="addr-meta">
                                {[addr.place, addr.pin_code, addr.state].filter(Boolean).join(', ')}
                            </p>
                            {addr.land_mark && (
                                <p className="landmark">Landmark: {addr.land_mark}</p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="info-window-footer">
                <button
                    className="view-details-btn"
                    onClick={() => navigate(`/controller/customer/${cid}`)}
                >
                    <span>View Customer</span>
                    <TbArrowRight />
                </button>
            </div>
        </div>,
        containerRef.current
    );
};

export default CustomerInfoWindow;

