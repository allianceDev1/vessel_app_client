import { handleTokenError } from "../tokenHandler";
import env from "../../../config/env";

export const responseSuccess = (response) => response.data;

export const responseError = async (error) => {
    const originalRequest = error.config;

    if (error?.response?.status === 401 && !originalRequest?._retry) {
        return await handleTokenError(originalRequest);
    } else if ([401, 403].includes(error?.response?.status)) {
        window.location.href = env.REDIRECT_URL;
    } else if (error?.code === "ECONNABORTED") {
        return Promise.reject({ message: "Network timeout or bad connection" });
    } else if (error?.response?.data?.statusCode >= 400) {
        return Promise.reject(error.response.data);
    }

    return Promise.reject({ message: "Unknown Error" });
};