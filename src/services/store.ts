import { axios } from "../utils/axios";

export const findStores = async () =>
  axios.request({
    url: "/store"
  });

export const getConfigs = async () => axios.request({ url: "/config" });

export const getStats = async () =>
  axios.request({
    url: "/stats"
  });
