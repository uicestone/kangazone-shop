import { make } from "vuex-pathify";

const state = {
  showLogin: false,
  token: localStorage.getItem("token") || "",
  user: {
    name: "",
    avatarUrl: "",
    customer: null
  }
};

const mutations = make.mutations(state);

export default {
  namespaced: true,
  state,
  mutations
};
