<template lang="pug">
  v-container.p-0
    a.test-link(@click="goTest") 调试
    div.flex.justify-center.items-center.h-screen
      v-card.p-10
        v-form.w-64(v-model="form.valid" ref="form" @submit.native.prevent)
          v-text-field(label="请输入用户名" v-model="form.username" required :rules="[v => !!v || '请输入用户名']")
          v-text-field(label="请输入密码" v-model="form.password"  required  type="password" :rules="[v => !!v || '请输入密码']")
          v-btn.w-full(color="primary" :disabled="!form.valid" @click="login") 登录 
</template>

<script>
import { sync } from "vuex-pathify";
import { login } from "../services/auth";
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
    token: sync("auth/token"),
    user: sync("auth/user")
  },
  methods: {
    async login() {
      const { username, password } = this.form;
      const res = await login({ username, password });
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      this.token = token;
      this.user = user;
      this.$router.replace("/");
    },
    goTest() {
      this.$router.push("/test");
    }
  }
};
</script>

<style scoped>
.test-link {
  position: absolute;
  right: 2vw;
  bottom: 2vw;
  color: #444;
  font-size: 50%;
}
</style>