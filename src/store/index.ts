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
      PENDING: "待支付",
      BOOKED: "已确认",
      IN_SERVICE: "已入场",
      FINISHED: "已结束",
      CANCELED: "已取消"
    },
    bookingStatus: [
      { value: "PENDING", label: "待支付" },
      { value: "BOOKED", label: "已确认" },
      { value: "IN_SERVICE", label: "已入场" },
      { value: "FINISHED", label: "已结束" },
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
