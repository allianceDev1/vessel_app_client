import axios from "axios";
import env from "../../config/env";
import { requestConfig, requestError } from "./interceptors/requestInterceptor";
import { responseSuccess, responseError } from "./interceptors/responseInterceptor";



const apiHeaders = { "Content-Type": "application/json" };

const url = (apiServer, path = "") => `${apiServer}${path}`;

export const recallAxios = axios.create({ headers: apiHeaders });

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

const instances = [
    recallAxios,
    ttSv2Axios,
    ttPv2Axios,
    cnPv2Axios,
];

instances.forEach((instance) => {
    instance.interceptors.request.use(requestConfig, requestError);
    instance.interceptors.response.use(responseSuccess, responseError);
});

export default {
    ttSv2Axios,
    ttPv2Axios,
    cnPv2Axios,
};
