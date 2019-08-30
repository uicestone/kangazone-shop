<template lang="pug">
  div
    v-app-bar( color="#6A76AB" dark)
      v-app-bar-nav-icon(@click="$router.go(-1)")
        v-icon mdi-chevron-left
      v-toolbar-title 订单列表
    v-container
      div.pt-20
        v-data-table.pt-10(:headers="headers" :items="items" :items-per-page="20" hide-default-footer)
          template(v-slot:item.action="{item}")
            a(small @click="editBooking(item)") 编辑
    v-dialog(v-model="showEditBooking")
      v-card
        v-card-title 订单详情
        v-list-item
          v-list-item-content 昵称
          v-list-item-action {{editBookingItem.name}}
        v-list-item
          v-list-item-content 手机号
          v-list-item-action {{editBookingItem.mobile}}
        v-list-item
          v-list-item-content 日期
          v-list-item-action {{editBookingItem.date}}
        v-list-item
          v-list-item-content 时间
          v-list-item-action {{editBookingItem.hours}}
        v-list-item
          v-list-item-content 人数
          v-list-item-action {{editBookingItem.membersCount}}
        v-list-item
          v-list-item-content 袜子数
          v-list-item-action {{editBookingItem.socksCount}}
        v-list-item
          v-list-item-content 备注
          v-list-item-action {{editBookingItem.remarks}}
        v-card-actions
          v-btn(color="red" dark) 退款并取消
          v-btn(color="orange" dark) 退押金
          v-btn(color="green" dark) 延长时间

        
</template>

<script>
import get from "lodash/get";

export default {
  data() {
    return {
      editBookingItem: {},
      showEditBooking: false,

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
          value: "socksCount"
        },
        {
          text: "人数",
          align: "left",
          value: "membersCount"
        },
        { text: "Actions", value: "action", sortable: false }
      ],
      items: [
        {
          id: "123",
          name: "test",
          mobile: "13122389130",
          status: "pending",
          hours: 10,
          type: "test",
          socksCount: 5,
          membersCount: 5
        }
      ]
    };
  },
  methods: {
    editBooking(item) {
      this.editBookingItem = item;
      this.showEditBooking = true;
    }
  }
};
</script>

<style>
</style>