import { createSlice } from '@reduxjs/toolkit'
import { generateUniqueId } from '../../../assets/javascript/utils/generateId';


const initialState = {
    internet: navigator.onLine,
    theme: 'os-default'
}

export const systemSlice = createSlice({
    name: 'system',
    initialState,
    reducers: {
        // Internet
        connection: (state, action) => {
            state.internet = action.payload
        },

        // Theme
        changeThemeColor: (state, action) => {
            const root = document.documentElement;
            root.className = action?.payload;
            state.theme = action?.payload
        },

        // admin active page
        setAdminActivePage: (state, action) => {
            state.adminActivePage = action.payload
        }


    }
})


export const { connection, changeThemeColor, setAdminActivePage } = systemSlice.actions;
export default systemSlice.reducer