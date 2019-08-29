import Vue from "vue";
import Vuex from "vuex";
import pathify, { make } from "vuex-pathify";

Vue.use(Vuex);

import auth from "./auth";

const state = {
  configs: {
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
  modules: { auth }
});

Vue.prototype.$store = store;

export default store;
