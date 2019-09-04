import Vue from "vue";
import Vuex from "vuex";
import pathify, { make } from "vuex-pathify";

Vue.use(Vuex);

import auth from "./auth";
import _store from "./store";

const state = {
  configs: {
    bookingSlots: ["上午", "下午", "晚上"],
    bookingTypes: [{ value: "play", label: "计时" }, { value: "party", label: "派对" }, { value: "group", label: "团建" }],
    bookingTypeMap: {
      play: "计时",
      party: "派对",
      group: "团建"
    },
    bookingStatusMap: {
      PENDING: "进行中",
      BOOKED: "待服务",
      IN_SERVICE: "服务中",
      FINISHED: "已完成",
      CANCELED: "已取消"
    },
    bookingStatus: [
      { value: "PENDING", label: "进行中" },
      { value: "BOOKED", label: "待服务" },
      { value: "IN_SERVICE", label: "服务中" },
      { value: "FINISHED", label: "已完成" },
      { value: "CANCELED", label: "已取消" }
    ],
    cardTypes: {},
    depositLevels: [],
    hourPrice: null,
    hourPriceRatio: []
  }
};

const mutations = make.mutations(state);
const store = new Vuex.Store({
  plugins: [pathify.plugin],
  state,
  mutations,
  modules: { auth, store: _store }
});

Vue.prototype.$store = store;

export default store;
