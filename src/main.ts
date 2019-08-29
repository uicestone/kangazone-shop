import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "reset.css";
import "normalize.css";
// import "./assets/tailwind.css";
import "tailwindcss/dist/tailwind.css";

// import mandMobile from "mand-mobile";
const mandMobile = require("mand-mobile");
import "mand-mobile/lib/mand-mobile.css";

Vue.use(mandMobile);
Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
