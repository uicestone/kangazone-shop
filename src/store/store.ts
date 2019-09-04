import { make } from "vuex-pathify";

const state = {
  currentStore: {
    id: localStorage.getItem("storeId"),
    name: "",
    distance: 0,
    phone: null
  }
};

const mutations = make.mutations(state);

export default {
  namespaced: true,
  state,
  mutations
};
