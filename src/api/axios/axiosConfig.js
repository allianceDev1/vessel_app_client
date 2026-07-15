import axios from "axios";
import env from "../../config/env";
import { requestConfig, requestError } from "./interceptors/requestInterceptor";
import { responseSuccess, responseError } from "./interceptors/responseInterceptor";



const apiHeaders = { "Content-Type": "application/json" };

const url = (apiServer, path = "") => `${apiServer}${path}`;

export const recallAxios = axios.create({ headers: apiHeaders });

export const vfCv2Axios = axios.create({
    baseURL: url(env.API.VESSEL, "/c/v2/"),
    headers: apiHeaders,
});
export const vfTv2Axios = axios.create({
    baseURL: url(env.API.VESSEL, "/t/v2/"),
    headers: apiHeaders,
});
export const vfPv1Axios = axios.create({
    baseURL: url(env.API.VESSEL, "/p/v1/"),
    headers: apiHeaders,
});
export const ttSv2Axios = axios.create({
    baseURL: url(env.API.TIMETRACK, "/s/v2/"),
    headers: apiHeaders,
});
export const ttPv2Axios = axios.create({
    baseURL: url(env.API.TIMETRACK, "/p/v2/"),
    headers: apiHeaders,
});
export const cnPv2Axios = axios.create({
    baseURL: url(env.API.CONTROLNEX, "/p/v2/"),
    headers: apiHeaders,
});

export const cnAv1Axios = axios.create({
    baseURL: url(env.API.CONTROLNEX, "/"),
    headers: apiHeaders,
});

export const fnPv1Axios = axios.create({
    baseURL: url(env.API.FINANCE, "/p/"),
    headers: apiHeaders,
});

const instances = [
    recallAxios,
    ttSv2Axios,
    ttPv2Axios,
    cnPv2Axios,
    cnAv1Axios,
    vfCv2Axios,
    vfTv2Axios,
    fnPv1Axios,
    vfPv1Axios
];

instances.forEach((instance) => {
    instance.interceptors.request.use(requestConfig, requestError);
    instance.interceptors.response.use(responseSuccess, responseError);
});

const axiosClients = {
    ttSv2Axios,
    ttPv2Axios,
    cnPv2Axios,
    cnAv1Axios,
    vfCv2Axios,
    vfTv2Axios,
    fnPv1Axios,
    vfPv1Axios
};

export default axiosClients;
