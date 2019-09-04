import Axios from "axios";
import { config } from "../../config";
import get from "lodash/get";
import store from "@/store";
import Vue from "vue";
import { logout } from "../services/auth";

export const axios = Axios.create({
  baseURL: config.VUE_APP_API_ENDPOINT
});

axios.interceptors.request.use(config => {
  const token = get(store, "state.auth.token");
  if (token) {
    config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
  }

  return config;
});

axios.interceptors.response.use(
  res => {
    return res;
  },
  err => {
    const message = get(err, "response.data.message");
    const statusCode = get(err, "response.status");

    if (statusCode) {
      if (statusCode == 401) {
        logout();
      }
    }
    if (message) {
      Vue.notify({
        group: "api",
        type: "error",
        text: message,
        duration: 2000
      });
    }
    throw new Error(err);
  }
);
