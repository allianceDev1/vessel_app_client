import axios from 'axios'
import Cookies from 'js-cookie';
export const baseUrl = 'http://192.168.56.1'
const apiHeaders = { 'Content-Type': 'application/json' }

//* Base Setup
const baseSetup = {

    recallAxios: axios.create({ headers: apiHeaders }),
    //? v2.1
    ttSv2Axios: axios.create({ baseURL: `${baseUrl}:8000/s/v2/`, headers: apiHeaders }),
    ttPv2Axios: axios.create({ baseURL: `${baseUrl}:8000/p/v2/`, headers: apiHeaders }),
    cnPv2Axios: axios.create({ baseURL: `${baseUrl}:8004/p/v2/`, headers: apiHeaders }),
    slUv1Axios: axios.create({ baseURL: `${baseUrl}:8008/u/v1/`, headers: apiHeaders, timeout: 70000 }),
    slPv1Axios: axios.create({ baseURL: `${baseUrl}:8008/p/v1/`, headers: apiHeaders }),
    slCv1Axios: axios.create({ baseURL: `${baseUrl}:8008/c/v1/`, headers: apiHeaders }),
}




const handleTokenError = async (originalRequest) => {
    originalRequest._retry = true;

    // Call the refresh token API to get a new access token
    try {
        const refreshToken = Cookies.get('_rfs_tkn'); // Retrieve the refresh token
        const { data } = await axios.post(`${baseUrl}:8000/s/v2/auth/rotate-token`, { refresh_token: refreshToken }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const cookieOptions = {
            secure: false,
            sameSite: 'lax',
            path: '/',
            expires: 40
        };

        Cookies.set('_acc_tkn', data?.data?.access_token, cookieOptions);
        originalRequest.headers['Authorization'] = `Bearer ${data?.data?.access_token}`;
     
        return baseSetup.recallAxios(originalRequest); // Retry original request with new access token
    } catch (err) {
        window.location.href = 'http://localhost:3000/'
    }

}

const requestConfigFunction = (config) => {
    let userToken = Cookies.get('_acc_tkn')
    if (userToken) {
        config.headers['Authorization'] = `Bearer ${userToken}`;
        config.timeout = 10000
    }
    return config
}

const requestErrorFunction = (error) => {
    return Promise.reject(error);
}

const responseConfigFunction = (response) => {
    // Handle successful responses here if needed
    return response.data;
}

const responseErrorFunction = async (error) => {
    const originalRequest = error.config;
    if (error?.response && error?.response?.status === 401 && !originalRequest?._retry) {
        return await handleTokenError(originalRequest);
    } else if (error?.response?.status === 403 || error?.response?.status === 401) {
        window.location.href = 'http://localhost:3000/'
        return Promise.reject(error?.response?.data);
    } else if (error?.code === 'ECONNABORTED') {
        return Promise.reject({ ...error?.response?.data, message: 'No proper internet connection' });
    } else if (error?.response?.data?.statusCode >= 400 && error?.response?.data?.statusCode < 500) {
        return Promise.reject(error?.response?.data);
    }

    return Promise.reject({ message: 'Unknown Error' });
}

//* API interceptors

//? Recall 
baseSetup.recallAxios.interceptors.request.use(requestConfigFunction, requestErrorFunction)
baseSetup.recallAxios.interceptors.response.use(responseConfigFunction, responseErrorFunction);

//? time track staff v2 all
baseSetup.ttSv2Axios.interceptors.request.use(requestConfigFunction, requestErrorFunction)
baseSetup.ttSv2Axios.interceptors.response.use(responseConfigFunction, responseErrorFunction);

//? time track public v2 all
baseSetup.ttPv2Axios.interceptors.request.use(requestConfigFunction, requestErrorFunction)
baseSetup.ttPv2Axios.interceptors.response.use(responseConfigFunction, responseErrorFunction);

//? controlNex all 
baseSetup.cnPv2Axios.interceptors.request.use(requestConfigFunction, requestErrorFunction)
baseSetup.cnPv2Axios.interceptors.response.use(responseConfigFunction, responseErrorFunction);

//? sales user v1 all 
baseSetup.slUv1Axios.interceptors.request.use(requestConfigFunction, requestErrorFunction)
baseSetup.slUv1Axios.interceptors.response.use(responseConfigFunction, responseErrorFunction);

//? sales public v1 all 
baseSetup.slPv1Axios.interceptors.request.use(requestConfigFunction, requestErrorFunction)
baseSetup.slPv1Axios.interceptors.response.use(responseConfigFunction, responseErrorFunction);

//? sales controller v1 all 
baseSetup.slCv1Axios.interceptors.request.use(requestConfigFunction, requestErrorFunction)
baseSetup.slCv1Axios.interceptors.response.use(responseConfigFunction, responseErrorFunction);


export const { ttSv2Axios, ttPv2Axios, cnPv2Axios, slUv1Axios, slPv1Axios, slCv1Axios } = baseSetup
