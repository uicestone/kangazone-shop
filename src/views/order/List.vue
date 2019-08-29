<template lang="pug">
  div
    v-app-bar( color="#6A76AB" dark)
      v-app-bar-nav-icon(@click="$router.go(-1)")
        v-icon mdi-chevron-left
      v-toolbar-title 订单列表
    v-container
      v-data-table.pt-20(:headers="headers" :items="items" items-per-page="20" hide-default-footer)
</template>

<script>
export default {
  data() {
    return {
      headers: [
        {
          text: "昵称",
          align: "left",
          value: "name",
          sortable: false
        },
        {
          text: "手机号",
          align: "left",
          value: "mobile"
        },
        {
          text: "状态",
          align: "left",
          value: "status",
          sortable: false
        },
        {
          text: "小时",
          align: "left",
          value: "hours"
        },
        {
          text: "类型",
          align: "left",
          value: "type",
          sortable: false
        },
        {
          text: "袜子数",
          align: "left",
          value: "nums1"
        },
        {
          text: "人数",
          align: "left",
          value: "nums2"
        }
      ],
      items: [
        {
          name: "test",
          mobile: "13122389130",
          status: "pending",
          hours: 10,
          type: "test",
          nums1: 5,
          nums2: 5
        }
      ]
    };
  }
};
</script>

<style>
</style>