<template lang="pug">
  v-app#app
    notifications(group="api" position="top center")
    router-view
</template>

<script>
import { sync } from "vuex-pathify";
import { getAuthUser, logout } from "./services";
import { findStores, getConfigs } from "./services/store";
export default {
  created() {
    this.getAuthUser();
    this.getStore();
    this.getConfig();
  },
  computed: {
    user: sync("auth/user"),
    token: sync("auth/token"),
    currentStore: sync("store/currentStore"),
    configs: sync("configs")
  },
  methods: {
    async getAuthUser() {
      if (this.token) {
        const res = await getAuthUser();
        this.user = res.data;
      }
    },
    async getStore() {
      const res = await findStores();
      this.currentStore = res.data[0];
    },
    async getConfig() {
      const res = await getConfigs();
      this.configs = { ...this.configs, ...res.data };
    }
  }
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
