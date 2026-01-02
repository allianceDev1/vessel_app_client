import { createSlice } from '@reduxjs/toolkit'


const initialState = {
    serviceForm: {},
    serviceFormSettings: {
        activePage: null,
        activeSubPage: null,
        activeProduct: null,
        storageTankAvailable: false
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
        setFormSettings: (state, action) => {
            state.serviceFormSettings = {
                ...(state.serviceFormSettings || {}),
                ...action.payload
            }
        },
        clearServiceFormSettings: (state) => {
            state.serviceFormSettings = {}
        }


    }
})


const {
    clearServiceForm, startServiceWork, setSfActivePage, setActiveSubPage, setActiveProduct, clearServiceFormSettings, updateServiceProduct,
    setFormSettings
} = appDataSlice.actions;


const sfSetting = {
    setActivePage: setSfActivePage,
    setActiveSubPage: setActiveSubPage,
    setActiveProduct: setActiveProduct,
    update: setFormSettings,
    clearAll: clearServiceFormSettings,
}
const sfActions = {
    clearAll: clearServiceForm,
    startWork: startServiceWork,
    updateProduct: updateServiceProduct
}

export { sfSetting, sfActions }

export default appDataSlice.reducer