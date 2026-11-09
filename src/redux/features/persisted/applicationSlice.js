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
                state.serviceForm.service_products[productId][key] = updates;
            });
        },
        resetServiceCategory: (state, action) => {
            const productId = action?.payload || state?.serviceFormSettings?.activeProduct?.[0] || null;

            if (productId && state?.serviceForm?.service_products) {
                state.serviceForm.service_products[productId] = {
                    ...(state.serviceForm.service_products[productId] || {}),
                    service_data: null,
                    work: null,
                    service_category: null
                };
            }
        },
        increaseServiceChargeIndex: (state) => {

            const productId = state?.serviceFormSettings?.activeProduct?.[0] || null;

            if (!productId) {
                return;
            }

            const serviceCharge = state.serviceForm.service_products[productId].service_data.service_charge

            let startIndex = serviceCharge?.start_index || 0;
            let chargeIndex = serviceCharge?.charge_index || 0;
            let estimate = serviceCharge?.estimate || '';

            if (serviceCharge?.start_index === 0 && serviceCharge?.charge_index === 0) {
                startIndex = 1;
                chargeIndex = 1;
                estimate = state.serviceForm.service_products[productId]?.service_category?.service_charges?.[1]?.charge_amount || 0;
            } else if (serviceCharge?.start_index === 0) {
                startIndex = 1;
            }

            state.serviceForm.service_products[productId].service_data.service_charge = {
                ...(state.serviceForm.service_products[productId].service_data.service_charge || {}),
                charge_index: chargeIndex,
                start_index: startIndex,
                estimate: estimate
            };

        },
        decreaseServiceChargeIndex: (state) => {

            const productId = state?.serviceFormSettings?.activeProduct?.[0] || null;

            if (!productId) {
                return;
            }

            // find condition apply items 1 or 0

            const spares = state.serviceForm.service_products[productId].work?.components_list?.filter(c => {
                if (c?.spare_category === 'PUMP' || (c?.spare_category === "MEMBRANE" && state.serviceForm.service_products[productId]?.service_data?.mode !== 'RENEWAL')) {
                    return c
                }
            })

            const qty = spares?.reduce((acc, crr) => acc + crr?.qty || 0, 0)
            const serviceCharge = state.serviceForm.service_products[productId].service_data.service_charge

            if (!qty && serviceCharge?.start_index !== 0) {

                state.serviceForm.service_products[productId].service_data.service_charge = {
                    ...(state.serviceForm.service_products[productId].service_data.service_charge || {}),
                    charge_index: 0,
                    start_index: 0,
                    estimate: state.serviceForm.service_products[productId]?.service_category?.service_charges?.[0]?.charge_amount || 0
                };
            }
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
            const { product_id } = action.payload;

            if (!state.serviceFormSettings.products) {
                state.serviceFormSettings.products = {};
            }

            const product = state.serviceFormSettings.products?.[product_id] || {};
          
            if (product?.is_submitted) return;

            product.is_submitted = true;
            product.is_saved = false;

            state.serviceFormSettings.form_saved = false;
            state.serviceFormSettings.form_saved_time = null;

            state.serviceFormSettings.products[product_id] = {
                ...product
            };
        },
        updateSubmitStatusToFalse: (state, action) => {
            const productId = action?.payload || state?.serviceFormSettings?.activeProduct?.[0] || null;

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
    updateSubmitStatusToFalse, updateProductFormParentValue, increaseServiceChargeIndex, decreaseServiceChargeIndex,
} = appDataSlice.actions;


const sfSetting = {
    page: {
        back: setFormBackPage,
        next: setFormNextPage,
    },
    productSubmit: {
        setStatus: updateSubmitStatus,
        resetStatus: updateSubmitStatusToFalse
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
        parentValue: updateProductFormParentValue,
        increaseSCIndex: increaseServiceChargeIndex,
        decreaseSCIndex: decreaseServiceChargeIndex
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