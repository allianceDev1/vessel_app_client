import axios from "axios";
import Cookies from "js-cookie";
import env from "../../config/env";

export const handleTokenError = async (originalRequest) => {
    originalRequest._retry = true;

    try {
        const refreshToken = Cookies.get("_rfs_tkn");

        const { data } = await axios.post(
            `${env.API.TIMETRACK}/s/v2/auth/rotate-token`,
            { refresh_token: refreshToken },
            { headers: { "Content-Type": "application/json" } }
        );

        const cookieOptions = {
            secure: false,
            sameSite: "lax",
            path: "/",
            expires: 40,
        };

        Cookies.set("_acc_tkn", data?.data?.access_token, cookieOptions);
        originalRequest.headers["Authorization"] = `Bearer ${data?.data?.access_token}`;

        const { recallAxios } = await import("./axiosConfig");
        return recallAxios(originalRequest);
    } catch (err) {
        window.location.href = env.REDIRECT_URL;
    }
};