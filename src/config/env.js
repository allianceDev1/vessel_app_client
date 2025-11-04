const env = {
    PROJECT_STAGE: process.env.REACT_APP_PROJECT_STAGE,
    BASE_URL: process.env.REACT_APP_BASE_APP_URL,
    REDIRECT_URL: process.env.REACT_APP_TIMETRACK_APP_URL,
    API: {
        TIMETRACK: process.env.REACT_APP_API_TIMETRACK_SERVER,
        CONTROLNEX: process.env.REACT_APP_API_CONTROLNEX_SERVER,
        VESSEL: process.env.REACT_APP_API_VESSEL_SERVER
    }
}

export default env;

