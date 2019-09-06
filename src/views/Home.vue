<template lang="pug">
  div
    v-app-bar( color="#6A76AB" dark)
      v-app-bar-nav-icon(@click.stop="drawer = !drawer")
      v-toolbar-title 首页
    v-navigation-drawer(v-model="drawer" absolute bottom temporary)
      v-list(nav dense)
        v-list-item-group
          v-list-item(@click="logout") 退出登录

    v-container
      div.p-10
        div.flex.text.justify-between.items-center
          div(@click="goBookingList({type: 'in_services'})")
            p 302
            p 场内人数
          div(@click="goBookingList({type: 'due'})")
            p 12 
            p 即将超时 
          div(@click="goBookingCreate") 非预约
        div.flex.text.justify-between.items-center.pt-4
          div(@click="goBookingList({type: 'day'})")
            p 806
            p 当前订单
          div
            p ￥12345 
            p 当日流水 
          div(@click="goBookingCreate") 预约入场
    

    
</template>

<script>
import { sync } from "vuex-pathify";
import { logout } from "../services/auth";
import { getStats } from "../services/store";
import { moment } from "../utils/moment";
// @ is an alias to /src
export default {
  name: "home",
  data() {
    return {
      drawer: false
    };
  },
  computed: {
    token: sync("auth/token"),
    stats: sync("store/stats")
  },
  mounted() {
    this.getStats();
  },
  methods: {
    async getStats() {
      const res = await getStats();
      this.stats = res.data;
    },
    goBookingList({ type }) {
      let query;
      switch (type) {
        case "in_services":
          query = { status: "IN_SERVICE" };
          break;
        case "day":
          query = { date: moment().format("YYYY-MM-DD") };
          break;
        case "due":
          query = { due: true };
          break;
      }
      this.$router.push({
        name: "bookingList",
        query
      });
    },
    goBookingCreate({ type }) {
      this.$router.push({
        name: "bookingCreate"
      });
    },
    logout() {
      logout();
    }
  }
};
</script>
