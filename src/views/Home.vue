<template lang="pug">
  div.flex.flex-column
    v-app-bar.flex-none(color="secondary")
      v-app-bar-nav-icon(@click.stop="drawer = !drawer")
      v-toolbar-title 概况
      .flex.justify-end(style="opacity:0.7")
        v-btn(@click="printReceipt" color="secondary" height="28px" elevation="0") 盘点小票
        v-btn(@click="reloadApp" height="28px" width="28px" elevation="0" icon)
          v-icon mdi-refresh
    v-navigation-drawer(v-model="drawer" bottom absolute height="auto")
      v-list-item
        v-list-item-content
          v-list-item-title.title
            | Kanga Zone 商户
          v-list-item-subtitle
            | 技术支持：诗序软件
      v-divider
      v-list(dense nav)
        v-list-item
          v-icon mdi-account
          span.ml-1 {{ user.name }}
        v-list-item(@click="logout")
          v-icon mdi-logout
          span.ml-1 退出登录

    v-container.flex.flex-column.stats.flex-1
      div.flex.text.justify-between.items-center.align-stretch.flex-1
        v-card(@click="goBookingList({status: 'IN_SERVICE'})" :elevation="5")
          div.number {{ stats.checkedInCount }}
          div.label 游玩中人数
            div.hint 点击查看游玩中订单
        v-card(@click="goBookingList({due: true})" :elevation="5")
          div.number {{ stats.dueCount }}
          div.label 即将超时人数
            div.hint 点击查看即将超时订单
        v-card.action.primary(@click="goBookingCreate" :elevation="5")
          v-icon mdi-location-enter
          v-card-actions 入场登记
      div.flex.text.justify-between.items-center.pt-4.align-stretch.flex-1
        v-card(@click="goBookingList({date: today})" :elevation="5")
          div.number {{ stats.customerCount }}
          div.label 当日人数
            div.hint 点击查看当日订单
        v-card(:elevation="5")
          div.number ￥{{ stats.paidAmount.toFixed(0) }}
          div.label 当日流水 
        v-card.action.primary.disabled(@click="goCheckout" :elevation="5")
          v-icon mdi-location-exit
          v-card-actions 出场登记
    

    
</template>

<script>
import { sync } from "vuex-pathify";
import { logout } from "../services/auth";
import { getStats } from "../services/store";
import { moment } from "../utils/moment";
import { statsReceiptPrint } from "../services/payment";
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
    user: sync("auth/user"),
    token: sync("auth/token"),
    stats: sync("store/stats")
  },
  mounted() {
    this.getStats();
  },
  methods: {
    async printReceipt() {
      await statsReceiptPrint();
    },
    reloadApp() {
      window.location.reload();
    },
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
    goCheckout() {
      alert("出场登记功能暂未上线");
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
  height auto
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
    .hint
      font-size 0.4rem
      opacity 0.6
  &.action
    &.disabled
      opacity 0.5
    .v-card__actions
      justify-content center
      font-size 1.75rem
</style>