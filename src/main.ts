import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "reset.css";
import "normalize.css";
import "./assets/tailwind.css";

import vuetify from "./plugins/vuetify";
import Notifications from "vue-notification";
import { jsBridageBus } from "./services/payment";
import { _ } from "./utils/lodash";
import { config } from "../config";

Vue.prototype.$_ = _;

Vue.config.productionTip = false;
Vue.config.errorHandler = (err, vm, info) => {
  console.error(err);
  if (!config.IS_PROD) {
    Vue.notify({
      group: "api",
      type: "error",
      text: err.message,
      duration: 2000
    });
  }
};

Vue.use(Notifications);

new Vue({
  router,
  store,
  //@ts-ignore
  vuetify,
  render: h => h(App)
}).$mount("#app");
