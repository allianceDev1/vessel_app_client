import { api } from '../api';

/**
 * Controller Map API Client
 * Interfaces with backend Map endpoints mounted at /c/v2/map/*
 */

export const mapApi = {
    /**
     * Retrieve lightweight customer pins within bounding box
     * @param {Object} bounds - { north, south, east, west, limit }
     */
    getCustomersInViewport: async ({ north, south, east, west, limit = 500 }) => {
        return await api.vfCv2Axios.get('/map/customers', {
            params: { north, south, east, west, limit },
        });
    },

    /**
     * Retrieve all active technicians with latest GPS locations and status
     */
    getActiveTechnicians: async () => {
        return await api.vfCv2Axios.get('/map/technicians');
    },

    /**
     * Retrieve all technician travels currently in progress
     */
    getActiveTravels: async () => {
        return await api.vfCv2Axios.get('/map/travels');
    },

    /**
     * Retrieve single travel session details including planned polyline and actual GPS path
     * @param {string} travelId
     */
    getTravelDetails: async (travelId) => {
        if (!travelId) return null;
        return await api.vfCv2Axios.get(`/map/travels/${travelId}`);
    },

    /**
     * Retrieve technician historical GPS breadcrumbs
     * @param {string} technicianId
     * @param {Object} [params] - { serviceVisitId, startDate, endDate, limit }
     */
    getTechnicianHistory: async (technicianId, params = {}) => {
        if (!technicianId) return [];
        return await api.vfCv2Axios.get(`/map/technicians/${technicianId}/history`, {
            params,
        });
    },

    /**
     * Request backend server-side route calculation
     * @param {{ latitude: number, longitude: number }} origin
     * @param {{ latitude: number, longitude: number }} destination
     */
    calculateRoute: async (origin, destination) => {
        return await api.vfCv2Axios.post('/map/routes', {
            origin,
            destination,
        });
    },
};

export default mapApi;

