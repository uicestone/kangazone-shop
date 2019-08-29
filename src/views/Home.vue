<template lang="pug">
  div
    v-app-bar( color="#6A76AB" dark)
      v-app-bar-nav-icon
      v-toolbar-title 首页
    v-container
      div.p-10
        div.flex.text.justify-between.items-center
          div(@click="goOrderList({type: '场内人数'})")
            p 302
            p 场内人数
          div(@click="goOrderList({type: '即将超时 '})")
            p 12 
            p 即将超时 
          div 非预约
        div.flex.text.justify-between.items-center.pt-4
          div(@click="goOrderList({type: '当前订单 '})")
            p 806
            p 当前订单
          div(@click="goOrderList({type: '当日流水 '})")
            p ￥12345 
            p 当日流水 
          div 预约入场
    

    
</template>

<script>
// @ is an alias to /src
export default {
  name: "home",
  data() {
    return {};
  },
  methods: {
    goOrderList({ type }) {
      this.$router.push({
        name: "orderList",
        params: {
          type
        }
      });
    }
  }
};
</script>
