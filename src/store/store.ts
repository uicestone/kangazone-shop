import { make } from "vuex-pathify";

const state = {
  currentStore: {
    id: localStorage.getItem("storeId"),
    name: "",
    distance: 0,
    phone: null
  },
  stats: {
    checkedInCount: 0,
    dueCount: 0,
    todayCount: 0,
    todayAmount: 0
  }
};

const mutations = make.mutations(state);

export default {
  namespaced: true,
  state,
  mutations
};
