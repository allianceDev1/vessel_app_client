import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist';
import createIdbStorage from "@piotr-cz/redux-persist-idb-storage";
import userSlice from "../features/persisted/userSlice"
import systemSlice from '../features/persisted/systemSlice'
import applicationSlice from '../features/persisted/applicationSlice'
import controllerSlice from '../features/persisted/controllerSlice'
import miniSystemSlice from '../features/non_persisted/miniSystemSlice';


// Create IndexedDB storage
const storage = createIdbStorage({
    name: 'vessel_app',
    storeName: 'v2',
});

const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['user', 'system', 'controller', 'application'],
    serialize: false,
    deserialize: false,
};

const rootReducer = combineReducers({

    // Persisted
    user: userSlice,
    system: systemSlice,
    application: applicationSlice,
    controller: controllerSlice,

    // Non persisted
    miniSystem: miniSystemSlice
});


const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
            },
        }),
})

export const persistor = persistStore(store);