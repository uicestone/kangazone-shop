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
          div(@click="goBookingList({type: '场内人数'})")
            p 302
            p 场内人数
          div(@click="goBookingList({type: '即将超时 '})")
            p 12 
            p 即将超时 
          div(@click="goBookingCreate") 非预约
        div.flex.text.justify-between.items-center.pt-4
          div(@click="goBookingList({type: '当前订单 '})")
            p 806
            p 当前订单
          div(@click="goBookingList({type: '当日流水 '})")
            p ￥12345 
            p 当日流水 
          div(@click="goBookingCreate") 预约入场
    

    
</template>

<script>
import { sync } from "vuex-pathify";
import { logout } from "../services/auth";
// @ is an alias to /src
export default {
  name: "home",
  data() {
    return {
      drawer: false
    };
  },
  computed: {
    token: sync("auth/token")
  },
  methods: {
    goBookingList({ type }) {
      this.$router.push({
        name: "bookingList",
        params: {
          type
        }
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
