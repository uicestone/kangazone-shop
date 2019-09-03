<template lang="pug">
  v-app#app
    notifications(group="api" position="top center")
    router-view
</template>

<script>
import { sync } from "vuex-pathify";
import { getAuthUser, logout } from "./services";
export default {
  async created() {
    if (this.token) {
      const res = await getAuthUser();
      this.user = res.data;
    }
  },
  computed: {
    user: sync("auth/user"),
    token: sync("auth/token")
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
