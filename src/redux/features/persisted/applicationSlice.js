import { createSlice } from '@reduxjs/toolkit'


const initialState = {
    serviceForm: {}
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
                customer_id: action.payload.customer_id,
                registration_id: action.payload.registration_id,
                visit_uuid: action.payload.visit_uuid,
                technician_uuid: action.payload.technician_uuid,
                in_time: new Date(action.payload.start_time).toISOString(),
                out_time: null
            }
        }



    }
})


export const { clearServiceForm, startServiceWork } = appDataSlice.actions;
export default appDataSlice.reducer