import Vue from "vue";
import Router from "vue-router";
import Home from "./views/Home.vue";
import Login from "./views/Login.vue";
import bookingList from "./views/booking/List.vue";
import bookingIndex from "./views/booking/index.vue";
import bookingCreate from "./views/booking/Create.vue";
import bookingDetail from "./views/booking/Detail.vue";

import Test from "./views/test/Test.vue";

import get from "lodash/get";
import store from "./store";

Vue.use(Router);

const router = new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      name: "home",
      component: Home,
      meta: {
        requireAuth: true
      }
    },
    {
      path: "/booking",
      name: "bookingIndex",
      component: bookingIndex,
      meta: {
        requireAuth: true
      },
      children: [
        {
          path: "list",
          name: "bookingList",
          component: bookingList
        },
        {
          path: "create",
          name: "bookingCreate",
          component: bookingCreate
        },
        {
          path: "detail/:id",
          name: "bookingDetail",
          component: bookingDetail
        }
      ]
    },
    {
      path: "/test",
      name: "test",
      component: Test
    },
    {
      path: "/login",
      name: "login",
      component: Login
    }
  ]
});

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requireAuth)) {
    if (get(store, "state.auth.token")) {
      return next();
    }
    next("/login");
  } else {
    next();
  }
});

export default router;
