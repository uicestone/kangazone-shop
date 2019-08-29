<template lang="pug">
  v-container
    div.flex.justify-center.items-center.h-screen
      v-card.p-10
        v-form.w-64(v-model="form.valid" ref="form")
          v-text-field(label="请输入用户名" v-model="form.username" required :rules="[v => !!v || '请输入用户名']")
          v-text-field(label="请输入密码" v-model="form.password"  required  type="password" :rules="[v => !!v || '请输入密码']")
          v-btn.w-full(color="primary" :disabled="!form.valid" @click="login") 登录 
</template>

<script>
import { sync } from "vuex-pathify";
export default {
  data() {
    return {
      form: {
        valid: false,
        username: "",
        password: ""
      }
    };
  },
  computed: {
    token: sync("auth/token")
  },
  methods: {
    login() {
      const token = "test";
      localStorage.setItem("token", token);
      this.token = token;
      this.$router.replace("/");
    }
  }
};
</script>

<style>
</style>