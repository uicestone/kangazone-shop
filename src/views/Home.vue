<template lang="pug">
  div
    v-app-bar(color="secondary")
      v-app-bar-nav-icon(@click.stop="drawer = !drawer")
      v-toolbar-title 概况
    v-navigation-drawer(v-model="drawer" bottom absolute height="auto")
      v-list-item
        v-list-item-content
          v-list-item-title.title
            | Kanga Zone 商户
          v-list-item-subtitle
            | 技术支持：诗序软件
      v-divider
      v-list(dense nav)
        v-list-item(@click="logout")
          v-icon mdi-logout
          span 退出登录

    v-container.flex.flex-column.stats(style="height:calc(100vh - 56px)")
      div.flex.text.justify-between.items-center.align-stretch
        v-card(@click="goBookingList({status: 'IN_SERVICE'})" :elevation="5")
          div.number 302
          div.label 场内人数
        v-card(@click="goBookingList({due: true})" :elevation="5")
          div.number 12 
          div.label 即将超时 
        v-card.action.primary(@click="goBookingCreate" :elevation="5")
          v-card-actions 非预约
      div.flex.text.justify-between.items-center.pt-4.align-stretch
        v-card(@click="goBookingList({date: today})" :elevation="5")
          div.number 806
          div.label 当日订单
        v-card(:elevation="5")
          div.number ￥12345 
          div.label 当日流水 
        v-card.action.primary(@click="goBookingCreate" :elevation="5")
          v-card-actions 预约入场
    

    
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
      drawer: false,
      today: moment().format("YYYY-MM-DD")
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
    goBookingList(query) {
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

<style lang="stylus" scoped>
.container
  max-width none
.v-navigation-drawer--close
  height 0 !important
.stats .v-card
  display flex
  flex-direction column
  justify-content center
  width 32%
  height 100%
  .number
    display flex
    align-items center
    justify-content center
    font-size 2.75rem
    font-weight lighter
    flex 2
  .label
    font-size 1rem
    font-weight normal
    flex 1
  &.action
    border-top 50% solid transparent
    border-bottom 50% solid transparent
    border-left 50% solid green
    .v-card__actions
      justify-content center
      font-size 2rem
</style>