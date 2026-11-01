import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    selectedCustomerId: null,
    selectedTechnicianId: null,
    selectedTravelId: null,
    visibility: {
        customers: true,
        technicians: true,
        travels: true,
        actualPath: true,
    },
    technicianFilter: 'ALL', // 'ALL' | 'TRAVEL' | 'IN_SERVICE' | 'IDLE'
    sidebarOpen: true,
    socketStatus: 'disconnected', // 'disconnected' | 'connecting' | 'connected'
    activeTab: 'travels', // 'travels' | 'technicians'
    fitBoundsRequest: null, // { type: 'ALL_TECH' | 'TECH' | 'TRAVEL' | 'LOCATION', payload: any, timestamp: number }
};

export const mapSlice = createSlice({
    name: 'map',
    initialState,
    reducers: {
        setSelectedCustomer: (state, action) => {
            state.selectedCustomerId = action.payload;
            if (action.payload) {
                // Clear tech selection if a customer is selected to keep UI focused
                state.selectedTechnicianId = null;
            }
        },
        setSelectedTechnician: (state, action) => {
            state.selectedTechnicianId = action.payload;
            if (action.payload) {
                state.selectedCustomerId = null;
            }
        },
        setSelectedTravel: (state, action) => {
            state.selectedTravelId = action.payload;
        },
        clearSelection: (state) => {
            state.selectedCustomerId = null;
            state.selectedTechnicianId = null;
            state.selectedTravelId = null;
        },
        toggleVisibility: (state, action) => {
            const key = action.payload; // 'customers' | 'technicians' | 'travels' | 'actualPath'
            if (state.visibility[key] !== undefined) {
                state.visibility[key] = !state.visibility[key];
            }
        },
        setVisibility: (state, action) => {
            state.visibility = { ...state.visibility, ...action.payload };
        },
        setTechnicianFilter: (state, action) => {
            state.technicianFilter = action.payload;
        },
        toggleSidebar: (state) => {
            state.sidebarOpen = !state.sidebarOpen;
        },
        setSidebarOpen: (state, action) => {
            state.sidebarOpen = Boolean(action.payload);
        },
        setSocketStatus: (state, action) => {
            state.socketStatus = action.payload;
        },
        setActiveTab: (state, action) => {
            state.activeTab = action.payload;
        },
        requestFitBounds: (state, action) => {
            state.fitBoundsRequest = {
                type: action.payload.type,
                payload: action.payload.payload || null,
                timestamp: Date.now(),
            };
        },
        clearFitBoundsRequest: (state) => {
            state.fitBoundsRequest = null;
        },
    },
});

export const {
    setSelectedCustomer,
    setSelectedTechnician,
    setSelectedTravel,
    clearSelection,
    toggleVisibility,
    setVisibility,
    setTechnicianFilter,
    toggleSidebar,
    setSidebarOpen,
    setSocketStatus,
    setActiveTab,
    requestFitBounds,
    clearFitBoundsRequest,
} = mapSlice.actions;

export default mapSlice.reducer;

