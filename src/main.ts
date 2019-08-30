import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "reset.css";
import "normalize.css";
import "./assets/tailwind.css";

import vuetify from "./plugins/vuetify";
import Notifications from "vue-notification";

Vue.config.productionTip = false;

Vue.use(Notifications);

new Vue({
  router,
  store,
  //@ts-ignore
  vuetify,
  render: h => h(App)
}).$mount("#app");
