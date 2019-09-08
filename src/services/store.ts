import { axios } from "../utils/axios";

export const findStores = () =>
  axios.request({
    url: "/store"
  });

export const getConfigs = () => axios.request({ url: "/config" });

export const getStats = () =>
  axios.request({
    url: "/stats"
  });
