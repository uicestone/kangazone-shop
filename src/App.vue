<template lang="pug">
  v-app#app
    notifications(group="api" position="top center")
    router-view
</template>

<script>
import { sync } from "vuex-pathify";
import { getAuthUser, logout } from "./services";
import { findStores, getConfigs } from "./services/store";
import { jsBridageBus, jsGetDevice } from "./services/payment";
export default {
  created() {
    jsGetDevice();
    this.getAuthUser();
    this.getStore();
    this.getConfig();
    window.sendJSMessage = this.sendJSMessage;
  },
  computed: {
    user: sync("auth/user"),
    token: sync("auth/token"),
    currentStore: sync("store/currentStore"),
    configs: sync("configs")
  },
  methods: {
    sendJSMessage(str) {
      const data = JSON.parse(str);
      if (data.resultCode == "-1") {
        if (this.$route.path == "/") return 1;
        this.$router.go(-1);
        return 0;
      }
      jsBridageBus.emit("javaCall", data);
      return "js调用成功";
    },
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
  font-family: Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
button:focus {
  outline: none !important;
}
.h-content {
  height: calc(100vh - 56px);
}
header {
  flex: 0 !important;
}
.v-toolbar__content {
  height: 24px !important;
  margin: 4px auto;
}
.v-toolbar__content .v-icon {
  font-size: 1.25rem !important;
  height: 1.25rem !important;
}
.v-toolbar__title {
  font-size: 1rem !important;
  opacity: 0.7;
  padding-left: 0 !important;
}
</style>
