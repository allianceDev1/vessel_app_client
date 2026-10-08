import { createSlice } from '@reduxjs/toolkit'


const initialState = {
    serviceForm: {},
    serviceFormSettings: {
        activePage: null,
        pageHistory: [],
        activeProduct: null,
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
            state.serviceFormSettings.pageHistory = [1000]
            state.serviceFormSettings.activePage = 1000
        },

        // Form resources
        setUpFormResources: (state, action) => {
            const payload = action?.payload;
            state.formResources = payload
        },

        // Updates
        updateProductFormInnerField: (state, action) => {
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
        updateProductFormParentValue: (state, action) => {
            const payload = action?.payload;
            console.log(payload)
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
                console.log(updates)
                state.serviceForm.service_products[productId][key] = updates;
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
        setFormNextPage: (state, action) => {
            const pageKey = action.payload
            if (!state.serviceFormSettings.pageHistory) {
                state.serviceFormSettings.pageHistory = []
            }
            state.serviceFormSettings.pageHistory.push(pageKey)
            state.serviceFormSettings.activePage = pageKey
        },
        setFormBackPage: (state) => {
            const { pageHistory } = state.serviceFormSettings;

            if (pageHistory.length <= 1) return;

            pageHistory.pop();
            state.serviceFormSettings.activePage = pageHistory[pageHistory.length - 1];
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
        updateSubmitStatusToFalse: (state) => {
            const productId = state?.serviceFormSettings?.activeProduct?.[0] || null;

            if (!productId) return;

            const product = state.serviceFormSettings.products?.[productId];

            if (!product?.is_submitted) return;

            product.is_submitted = false;
            product.is_saved = false;

            state.serviceFormSettings.form_saved = false;
            state.serviceFormSettings.form_saved_time = null;
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
    clearServiceForm, startServiceWork, setFormBackPage, setFormNextPage, setActiveProduct, clearServiceFormSettings, updateProductFormInnerField,
    resetServiceCategory, updateSubmitStatus, updateServiceForm, setFormSettings, setVerification, setReview, setPayment, setUpFormResources,
    updateSubmitStatusToFalse, updateProductFormParentValue
} = appDataSlice.actions;


const sfSetting = {
    page: {
        back: setFormBackPage,
        next: setFormNextPage,
    },
    productSubmit: {
        setStatus: updateSubmitStatus,
        resetStatus: updateSubmitStatusToFalse,
    },
    setActiveProduct: setActiveProduct,
    clearAll: clearServiceFormSettings,
    update: setFormSettings
}
const sfActions = {
    clearAll: clearServiceForm,
    startWork: startServiceWork,
    updateProduct: {
        innerFields: updateProductFormInnerField,
        parentValue: updateProductFormParentValue
    },
    updateForm: updateServiceForm,
    resetService: resetServiceCategory,
    updateVerification: setVerification,
    updateReview: setReview,
    updatePayment: setPayment,
    setUpFormResources: setUpFormResources,
}

export { sfSetting, sfActions }

export default appDataSlice.reducer