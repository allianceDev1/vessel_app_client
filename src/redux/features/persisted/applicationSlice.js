import { createSlice } from '@reduxjs/toolkit'


const initialState = {
    serviceForm: {},
    serviceFormSettings: {
        activePage: null,
        activeSubPage: null,
        activeProduct: null,
        storageTankAvailable: false,
        products: {}
    },
    verification: {},
    review: {},
    payment: {},
    formResources: {}
}

export const appDataSlice = createSlice({
    name: 'application',
    initialState,
    reducers: {

        // ? SERVICE FORM ACTIONS
        // Clear
        clearServiceForm: (state) => {
            state.serviceForm = {}
            state.verification = {}
            state.review = {}
            state.payment = {}
            state.formResources = {}
        },

        // Start work
        startServiceWork: (state, action) => {
            const payload = action.payload || {}
            state.serviceForm = {
                work_key: payload?.work_key,
                customer_id: payload.customer_id,
                start_time: new Date(payload.start_time).toISOString()
            }
        },

        // Form resources
        setUpFormResources: (state, action) => {
            const payload = action?.payload;
            state.formResources = payload
        },

        // Updates
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

        // ? SERVICE FORM SETTINGS

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
        setVerification: (state, action) => {
            state.verification = {
                ...(state.verification || {}),
                ...action.payload
            }
        },
        setReview: (state, action) => {
            state.review = action.payload
        },
        setPayment: (state, action) => {
            state.payment = action.payload
        },
        clearServiceFormSettings: (state) => {
            state.serviceFormSettings = {}
        },
    }
})


const {
    clearServiceForm, startServiceWork, setSfActivePage, setActiveSubPage, setActiveProduct, clearServiceFormSettings, updateServiceProduct,
    resetServiceCategory, updateSubmitStatus, updateServiceForm, setFormSettings, setVerification, setReview, setPayment, setUpFormResources
} = appDataSlice.actions;


const sfSetting = {
    setActivePage: setSfActivePage,
    setActiveSubPage: setActiveSubPage,
    setActiveProduct: setActiveProduct,
    clearAll: clearServiceFormSettings,
    updateSubmitStatus: updateSubmitStatus,
    update: setFormSettings
}
const sfActions = {
    clearAll: clearServiceForm,
    startWork: startServiceWork,
    updateProduct: updateServiceProduct,
    updateForm: updateServiceForm,
    resetService: resetServiceCategory,
    updateVerification: setVerification,
    updateReview: setReview,
    updatePayment: setPayment,
    setUpFormResources: setUpFormResources,
}

export { sfSetting, sfActions }

export default appDataSlice.reducer