import { QueryClient } from '@tanstack/react-query'
import { persistQueryClient } from '@tanstack/react-query-persist-client'
import { app_version } from '../config/app_config'

const MAX_AGE = 1000 * 60 * 60 * 24 // 24 hours

// Create Query Client
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 2,
            staleTime: 1000 * 60 * 5,   // 5 mints
            gcTime: MAX_AGE,   // must be >= maxAge
            refetchOnWindowFocus: false,
            throwOnError: false,
        },
        mutations: {
            retry: 0,
        },
    },
})

// Custom Persister (Manual - Recommended)
const localStoragePersister = {
    persistClient: async (client) => {
        try {
            localStorage.setItem('REACT_QUERY_CACHE', JSON.stringify(client))
        } catch (e) {
            console.warn('RQ persist failed:', e)
        }
    },
    restoreClient: async () => {
        try {
            const cache = localStorage.getItem('REACT_QUERY_CACHE')
            return cache ? JSON.parse(cache) : undefined
        } catch {
            return undefined
        }
    },
    removeClient: async () => {
        try {
            localStorage.removeItem('REACT_QUERY_CACHE')
        } catch { }
    },
}

// Persist Query Client
persistQueryClient({
    queryClient,
    persister: localStoragePersister,
    maxAge: MAX_AGE,
    buster: app_version
})



/*
 staleTime =
     Static / config data   =  Infinity or 1000 * 60 * 60 * 24 // 24 hrs
     feature flags, app config, countries list
     
     Rarely changing        = 1000 * 60 * 60 * 1       // 1 hrs 
     user profile, settings,categories, roles, permissions

     Moderate               = 1000 * 60 * 5   // 5 min

     Frequently  changing   =  1000 * 30    // 30 sec
        notifications, cart, inbox

     Real-time / live       = 0 

*/