import { createAction } from '@reduxjs/toolkit'

// Dispatch to wipe all redux data except user, theme and internet.
// Handled in the root reducer wrapper (see redux/app/store.js).
export const resetMemory = createAction('app/resetMemory')

// Keeps user, system and miniSystem untouched; every other slice
// falls back to its initial state.
export const memoryResetReducer = (rootReducer) => (state, action) => {
    if (action.type === resetMemory.type) {
        const kept = {
            user: state?.user,
            system: state?.system,
            miniSystem: state?.miniSystem,
            // keep redux-persist bookkeeping so rehydration state stays valid
            _persist: state?._persist,
        }
        return rootReducer(kept, action)
    }
    return rootReducer(state, action)
}
