import { handleTokenError } from "../tokenHandler";
import env from "../../../config/env";

export const responseSuccess = (response) => response.data.data || response.data;

export const responseError = async (error) => {
    const originalRequest = error.config;

    if (!error.response) {
        const networkMsg =
            error.code === "ECONNABORTED"
                ? "Network timeout or bad connection"
                : "Unable to reach server. Please check your internet connection.";

        return Promise.reject({
            code: null,
            message: networkMsg,
            error,
        });
    }

    const { status, data } = error.response;

    // 🧩 Normalize code (works for both new + old)
    const code =
        data?.code ||
        data?.statusCode ||
        status ||
        null;

    // 🧩 Normalize message
    const message =
        data?.error?.message || // new format
        data?.message ||        // old format
        error.message ||
        "Something went wrong";


    if (code === 401 && !originalRequest?._retry) {
        return await handleTokenError(originalRequest);
    }

    if ([401, 403].includes(code)) {
        window.location.href = env.REDIRECT_URL;
        return;
    }

    if (error?.code === "ECONNABORTED") {
        return Promise.reject({ message: "Network timeout or bad connection" });
    }

    if (code >= 400) {
        return Promise.reject({
            code,
            message,
            ...(data?.error && { error: data.error }), // preserve new format details
            ...(data?.data && { data: data.data }),     // preserve optional data
        });
    }

    return Promise.reject({ message: "Unknown Error" });
};