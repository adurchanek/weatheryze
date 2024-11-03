import axios from "axios";
import { Store } from "redux";
import { RootState } from "../redux/store";

const axiosInstance = axios.create({
  baseURL: "/api",
});

let store: Store<RootState>;

export const setStore = (_store: Store<RootState>) => {
  store = _store;
};

// Add a request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = store?.getState().user?.token;
    if (token && config.headers) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export default axiosInstance;
