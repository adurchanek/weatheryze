import axios from "axios";
import { Store } from "redux";
import { RootState } from "../redux/store";
import { getBaseUrl } from "../utils/getBaseUrl";

const axiosInstance = axios.create({
  baseURL: getBaseUrl(),
});

let store: Store<RootState>;

export const setStore = (_store: Store<RootState>) => {
  store = _store;
};

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
