import Cookies from "js-cookie";
import { rotateAccessToken } from "../tokenHandler";

export const requestConfig = async (config) => {
  let token = Cookies.get("_acc_tkn");
  if (!token && Cookies.get("_rfs_tkn")) {
    try {
      token = await rotateAccessToken();
    } catch {
      // Handled by response interceptor if request fails
    }
  }
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  config.timeout = 10000;
  return config;
};

export const requestError = (error) => Promise.reject(error);