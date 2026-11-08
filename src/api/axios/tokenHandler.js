import axios from "axios";
import Cookies from "js-cookie";
import env from "../../config/env";

let refreshPromise = null;

export const rotateAccessToken = () => {
    if (refreshPromise) {
        return refreshPromise;
    }

    refreshPromise = (async () => {
        const refreshToken = Cookies.get("_rfs_tkn");
        if (!refreshToken) {
            throw new Error("No refresh token available");
        }

        const { data } = await axios.post(
            `${env.API.TIMETRACK}/s/v2/auth/rotate-token`,
            { refresh_token: refreshToken },
            { headers: { "Content-Type": "application/json" } }
        );

        const payload = data?.data || data;
        const accessToken = payload?.access_token;
        const newRefreshToken = payload?.refresh_token;

        if (!accessToken) {
            throw new Error("Failed to rotate access token");
        }

        const cookieOptions = {
            secure: true,
            sameSite: 'None',
            domain: '.alliancedev.in',
            path: '/',
            expires: new Date(Date.now() + 60 * 60 * 1000)
        };

        Cookies.set("_acc_tkn", accessToken, cookieOptions);
        if (newRefreshToken) {
            Cookies.set("_rfs_tkn", newRefreshToken, cookieOptions);
        }

        return accessToken;
    })().finally(() => {
        refreshPromise = null;
    });

    return refreshPromise;
};

export const handleTokenError = async (originalRequest) => {
    originalRequest._retry = true;

    try {
        const accessToken = await rotateAccessToken();
        originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;

        const { recallAxios } = await import("./axiosConfig");
        return recallAxios(originalRequest);
    } catch (err) {
        window.location.href = env.REDIRECT_URL;
        return Promise.reject(err);
    }
};