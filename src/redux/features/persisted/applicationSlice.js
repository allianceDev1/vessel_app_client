import { createSlice } from '@reduxjs/toolkit'


const initialState = {
    serviceForm: {},
    serviceFormSettings: {
        activePage: null,
        activeSubPage: null,
        activeProduct: null,
        storageTankAvailable: false,
        products: {}
    }
}

export const appDataSlice = createSlice({
    name: 'application',
    initialState,
    reducers: {

        // ServiceForm
        clearServiceForm: (state) => {
            state.serviceForm = {}
        },
        startServiceWork: (state, action) => {
            state.serviceForm = {
                service_form_uuid: action.payload.service_form_uuid,
                customer_id: action.payload.customer_id,
                registration_id: action.payload.registration_id,
                visit_uuid: action.payload.visit_uuid,
                technician_uuid: action.payload.technician_uuid,
                in_time: new Date(action.payload.attended.in_time).toISOString(),
                out_time: null,
            }
        },
        updateServiceProduct: (state, action) => {
            const payload = action?.payload;

            if (!state?.serviceForm?.service_products) {
                state.serviceForm.service_products = {};
            }

            const productId = state?.serviceFormSettings?.activeProduct?.[0] || null;

            if (!productId) {
                return;
            }

            if (!state?.serviceForm?.service_products?.[productId]) {
                state.serviceForm.service_products[productId] = {};
            }

            Object.entries(payload).forEach(([key, updates]) => {
                state.serviceForm.service_products[productId][key] = {
                    ...(state.serviceForm.service_products[productId]?.[key] || {}),
                    ...updates
                };
            });
        },
        resetServiceCategory: (state, action) => {
            const productId = action?.payload?.product_id;

            state.serviceForm.service_products[productId] = {
                ...(state.serviceForm.service_products[productId] || {}),
                service_data: {},
                work: {}
            };

        },
        updateServiceForm: (state, action) => {
            const payload = action?.payload;
            state.serviceForm = {
                ...state.serviceForm,
                ...payload
            }
        },

        // service form settings
        setSfActivePage: (state, action) => {
            state.serviceFormSettings = {
                ...(state.serviceFormSettings || {}),
                activePage: action.payload
            }
        },
        setActiveSubPage: (state, action) => {
            state.serviceFormSettings = {
                ...(state.serviceFormSettings || {}),
                activeSubPage: action.payload
            }
        },
        setActiveProduct: (state, action) => {
            state.serviceFormSettings = {
                ...(state.serviceFormSettings || {}),
                activeProduct: action.payload
            }
        },
        clearServiceFormSettings: (state) => {
            state.serviceFormSettings = {}
        },
        updateSubmitStatus: (state, action) => {
            const { product_id, ...status } = action.payload;

            if (!state.serviceFormSettings.products) {
                state.serviceFormSettings.products = {};
            }

            state.serviceFormSettings.products[product_id] = {
                ...(state.serviceFormSettings.products[product_id] || {}),
                ...status
            };
        },


    }
})


const {
    clearServiceForm, startServiceWork, setSfActivePage, setActiveSubPage, setActiveProduct, clearServiceFormSettings, updateServiceProduct,
    resetServiceCategory, updateSubmitStatus, updateServiceForm
} = appDataSlice.actions;


const sfSetting = {
    setActivePage: setSfActivePage,
    setActiveSubPage: setActiveSubPage,
    setActiveProduct: setActiveProduct,
    clearAll: clearServiceFormSettings,
    updateSubmitStatus: updateSubmitStatus
}
const sfActions = {
    clearAll: clearServiceForm,
    startWork: startServiceWork,
    updateProduct: updateServiceProduct,
    updateForm: updateServiceForm,
    resetService: resetServiceCategory
}

export { sfSetting, sfActions }

export default appDataSlice.reducer