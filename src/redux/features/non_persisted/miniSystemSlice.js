import { createSlice } from '@reduxjs/toolkit'
import { generateUniqueId } from '../../../utils/generateId'


const initialState = {
    toasts: [],
    dialog: {},
    modals: [],
    pageTitle: {}
}

export const miniSystemSlice = createSlice({
    name: 'miniSystem',
    initialState,
    reducers: {

        // Toast
        toastPush: (state, action) => {
            state.toasts = [
                {
                    id: action?.payload?.id || generateUniqueId(6, 'ALT_'),
                    type: action.payload.type || null,
                    head: action.payload.head || null,
                    message: action.payload.message || null,
                    icon: action.payload.icon || null,
                    doClose: action.payload.doClose === false ? false : true,
                    autoClose: action.payload.autoClose === false ? false : true
                },
                ...(state?.toasts || [])
            ]
        },
        pullSingleToast: (state, action) => {
            state.toasts = state.toasts?.filter((item) => item.id !== action.payload)
        },
        pullAllToast: (state, action) => {
            state.toasts = []
        },

        // Dialog
        alert: (state, action) => {
            state.dialog = {
                type: 'alert',
                mIcon: action?.payload?.mIcon || null,
                message: action?.payload?.message || null,
                accept: {
                    label: action?.payload?.accept?.label || null,
                    icon: action?.payload?.accept?.icon || null,
                    theme: action?.payload?.accept?.theme || null,
                    onClick: action?.payload?.accept?.onClick || null
                }
            }
        },
        confirm: (state, action) => {
            state.dialog = {
                type: 'confirm',
                mIcon: action?.payload?.mIcon || null,
                message: action?.payload?.message || null,
                accept: {
                    label: action?.payload?.accept?.label || null,
                    icon: action?.payload?.accept?.icon || null,
                    theme: action?.payload?.accept?.theme || null,
                    onClick: action?.payload?.accept?.onClick || null
                },
                reject: {
                    label: action?.payload?.reject?.label || null,
                    icon: action?.payload?.reject?.icon || null,
                    theme: action?.payload?.reject?.theme || null,
                    onClick: action?.payload?.reject?.onClick || null
                }
            }
        },
        pullDialog: (state, action) => {
            state.dialog = {}
        },

        // modal
        pushModal: (state, action) => {
            state.modals = [
                {
                    id: action?.payload?.id || generateUniqueId(6, 'MODAL_'),
                    show: true,
                    title: action?.payload?.title || null,
                    body: action?.payload?.body || null,
                    style: action?.payload?.style || {},
                    freezeClose: action?.payload?.freezeClose || false
                },
                ...(state.modals || [])
            ]
        },
        pullSingleModal: (state, action) => {
            state.modals = state.modals.map((item) => {
                if (item.id === action.payload) {
                    return { ...item, show: false };
                }
                return item;
            });
        },
        removeModal: (state, action) => {
            state.modals = state.modals.filter((item) => item.id !== action.payload);
        },
        pullAllModal: (state, action) => {
            state.modals = []
        },

        // pageTitle
        setPageTitle: (state, action) => {
            state.pageTitle = {
                title: action.payload.title,
                note: action.payload.note
            }
        }

    }
})

const {
    toastPush, pullSingleToast, pullAllToast, alert, confirm, pullDialog, pushModal, pullSingleModal, pullAllModal, removeModal,
    setPageTitle
} = miniSystemSlice.actions

// ✅ Thunk (delay remove modal after closing)
export const closeModalWithDelay = (id, delay = 5000) => async (dispatch) => {
    dispatch(pullSingleModal(id))
    await new Promise(resolve => setTimeout(resolve, delay))
    dispatch(removeModal(id))
}

// Export 
export const toast = { pull: { single: pullSingleToast, all: pullAllToast }, push: toastPush }
export const doDialog = { alert, confirm, clear: pullDialog }
export const modal = { push: pushModal, pull: { single: closeModalWithDelay, all: pullAllModal } }
export const page = { setTitle: setPageTitle }



export default miniSystemSlice.reducer