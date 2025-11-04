import Cookies from "js-cookie";

export const requestConfig = (config) => {
  const token = Cookies.get("_acc_tkn");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  config.timeout = 10000;
  return config;
};

export const requestError = (error) => Promise.reject(error);