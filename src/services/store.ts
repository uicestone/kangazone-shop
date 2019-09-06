import { axios } from "../utils/axios";

export const findStores = () =>
  axios.request({
    url: "/api/store"
  });

export const getConfigs = () => axios.request({ url: "/api/config" });

export const getStats = () =>
  axios.request({
    url: "/api/stats"
  });
