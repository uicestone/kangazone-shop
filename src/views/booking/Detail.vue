<template lang="pug">
  .booking-detail
    v-app-bar( color="#6A76AB" dark)
        v-app-bar-nav-icon(@click="$router.go(-1)")
          v-icon mdi-chevron-left
        v-toolbar-title 创建订单
    v-container
      v-card.p-4
        v-card-title 订单详情
        v-list-item
          v-list-item-content 状态
          v-list-item-action {{booking.status}}
        v-list-item
          v-list-item-content 类型
          v-list-item-action {{booking.type}}
        v-list-item
          v-list-item-content 昵称
          v-list-item-action {{booking.customer.name}}
        v-list-item
          v-list-item-content 手机号
          v-list-item-action {{booking.customer.mobile}}
        v-list-item
          v-list-item-content 日期
          v-list-item-action {{booking.date}}
        v-list-item
          v-list-item-content 时间
          v-list-item-action {{booking.hours}}
        v-list-item
          v-list-item-content 人数
          v-list-item-action {{booking.membersCount}}
        v-list-item
          v-list-item-content 袜子数
          v-list-item-action {{booking.socksCount}}
        v-list-item
          v-list-item-content 备注
          v-list-item-action {{booking.remarks}}
        v-card-actions
          v-bottom-sheet(v-model="finishForm.confirm")
            template(v-slot:activator="{on}")
              v-btn(color="success" dark v-on="on") 订单完成
            v-sheet.px-10.flex.items-center(height="100px")
              v-btn.w-full(block color="primary"  @click="finishBooking" :loading="finishForm.loading" ) 确认完成
          v-bottom-sheet.ml-4(v-model="extendForm.confirm")
            template(v-slot:activator="{on}")
              v-btn(color="cyan" dark v-on="on") 延长时间
            v-sheet.px-10.flex.items-center(height="100px")
              v-btn.w-full(block color="primary"  @click="extendBokking" :loading="extendForm.loading") 确认订单
          v-bottom-sheet.ml-4(v-model="refundForm.confirm")
            template(v-slot:activator="{on}")
              v-btn.self-end(color="red" dark v-on="on") 退款并取消
            v-sheet.px-10.flex.items-center(height="100px")
              v-btn.w-full(block color="primary"  @click="refundBooking" :loading="refundForm.loading" ) 确认订单
          

    

 </template>

<script>
import { getBooking, updateBooking } from "../../services/booking";

export default {
  data() {
    return {
      finishForm: {
        confirm: false,
        loading: false
      },
      extendForm: {
        confirm: false,
        loading: false
      },
      refundForm: {
        confirm: false,
        loading: false
      },
      booking: {
        customer: {
          name: null,
          mobile: null
        },
        date: null,
        hours: null,
        membersCount: 0,
        socksCount: 0,
        remarks: null
      }
    };
  },
  mounted() {
    const { id } = this.$route.params;
    this.getBooking({ id });
  },
  methods: {
    async finishBooking() {
      const { id } = this.booking;
      this.finishForm.loading = true;
      await updateBooking({ id, status: "FINISHED" });
      this.finishForm.loading = false;
      this.finishForm.confirm = false;
      this.getBooking({ id });
    },
    async getBooking({ id }) {
      const res = await getBooking({ id });
      this.booking = res.data;
    }
  }
};
</script>

<style>
</style>