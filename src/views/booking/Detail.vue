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
          v-list-item-content id
          v-list-item-action {{booking.id}}
        v-list-item
          v-list-item-content 状态
          v-list-item-action {{configs.bookingStatusMap[booking.status]}}
        v-list-item
          v-list-item-content 类型
          v-list-item-action {{configs.bookingTypeMap[booking.type]}}
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
          v-bottom-sheet(v-if="['IN_SERVICE'].includes(booking.status)"  v-model="finishForm.confirm")
            template(v-slot:activator="{on}")
              v-btn(color="success" dark v-on="on") 完成订单
            v-sheet.px-10.flex.items-center(height="100px")
              v-btn.w-full(block color="primary"  @click="finishBooking" :loading="finishForm.loading" ) 确认完成

          v-bottom-sheet.ml-4(v-if="['IN_SERVICE'].includes(booking.status)"  v-model="extendForm.confirm"  :persistent="extendForm.confirm_payment")
            template(v-slot:activator="{on}")
              v-btn(color="cyan" dark v-on="on") 延长时间
            v-sheet.p-10.items-center(height="320px")
              v-form(v-model="extendForm.valid")
                p.text-3xl.text-center ￥{{extendForm.price}}
                v-btn-toggle.my-4(v-model="extendForm.form.hours")
                  v-btn.px-10(:value=1 text) 1小时
                  v-btn.px-10(:value=2 text v-if="booking.hours < 2") 2小时
                v-bottom-navigation(v-model="extendForm.form.paymentGateway" grow icons-and-text)
                  v-btn(v-for="item in extendForm.paymentGateways" :key="item.value")
                    span {{item.label}}
                    v-icon {{item.icon}}
              v-btn.mt-5.w-full(v-if="!extendForm.confirm_payment" block color="primary"  @click="extendBooking" :loading="extendForm.loading || extendForm.loading_price" :disabled="extendForm.price == 0") 确认延长
              v-btn.mt-5.w-full(v-if="extendForm.confirm_payment" block color="success"  @click="comfirmPayment" :loading="extendForm.loading_confirmPayment") 确认付款

          v-bottom-sheet.ml-4(v-if="['BOOKED', 'PENDING'].includes(booking.status)" v-model="refundForm.confirm")
            template(v-slot:activator="{on}")
              v-btn.self-end(color="error" dark v-on="on") 退款并取消
            v-sheet.px-10.flex.items-center(height="100px")
              v-btn.w-full(block color="error"  @click="refundBooking" :loading="refundForm.loading" ) 确认退款
          v-bottom-sheet.ml-4(v-model="refundManualForm.confirm")
            v-sheet.px-10.flex.items-center(height="100px")
              v-btn.w-full(block color="error"  @click="refundBookingManual" :loading="refundManualForm.loading" ) 确认手动退款

      v-data-table.mt-10.pt-4(
           v-if="payablePayments.length > 0"
          :headers="headers" 
          :items="payablePayments" 
          :items-per-page="20" 
          hide-default-footer )
          template(v-slot:item.action="{item}")
            a(small @click="handleRefundManual(item)") 手动退款
          template(v-slot:item.amount="{item}")
            p {{Math.abs(item.amount)}}
        

 </template>

<script>
import { getBooking, updateBooking, getBookingPrice } from "../../services/booking";
import { getUser } from "../../services/user";
import { updatePayment, sendPaymentToSunmi } from "../../services/payment";
import { sync } from "vuex-pathify";

export default {
  data() {
    return {
      headers: [
        {
          text: "订单",
          align: "left",
          value: "title",
          sortable: false
        },
        {
          text: "金额",
          align: "left",
          value: "amount",
          sortable: false
        },
        { text: "操作", value: "action", sortable: false }
      ],
      customer: {},
      finishForm: {
        confirm: false,
        loading: false
      },
      extendForm: {
        confirm: false,
        loading: false,
        valid: false,
        price: 0,
        loading_price: false,
        confirm_payment: false,
        loading_confirmPayment: false,
        form: { paymentGateway: 0, hours: 1 },
        paymentGateways: [
          { label: "扫码支付", value: "scan", icon: "mdi-qrcode" },
          { label: "现金支付", value: "cash", icon: "mdi-wallet" },
          { label: "刷卡支付", value: "card", icon: "mdi-credit-card" }
        ]
      },
      refundForm: {
        confirm: false,
        loading: false
      },
      refundManualForm: {
        loading: false,
        confirm: false,
        payment: {}
      },
      booking: {
        id: null,
        customer: {
          name: null,
          mobile: null
        },
        payments: [],
        date: null,
        hours: 0,
        membersCount: 0,
        socksCount: 0,
        remarks: null
      }
    };
  },
  watch: {
    "extendForm.form": {
      handler() {
        this.updateExtendPrice();
      },
      deep: true
    }
  },
  computed: {
    configs: sync("configs"),
    payablePayments() {
      return this.booking.payments.filter(i => i.amount < 0 && !i.paid);
    },
    extendPaymentGateway() {
      if (this.customer.credit >= this.extendForm.price) {
        return "credit";
      }
      return this.extendForm.paymentGateways[this.extendForm.form.paymentGateway].value;
    },
    extendHours() {
      return Number(this.extendForm.form.hours) + Number(this.booking.hours);
    }
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
    async extendBooking() {
      this.extendForm.loading = true;
      const { id } = this.booking;
      const { extendPaymentGateway: paymentGateway, extendHours: hours } = this;

      const res = await updateBooking({ id, hours, paymentGateway: paymentGateway == "credit" ? null : paymentGateway });
      this.booking = res.data;
      this.extendForm.loading = false;

      switch (paymentGateway) {
        case "scan":
          const { payments, price, id: businessId } = res.data;
          const [payment] = payments;
          const { id: orderId, attach: orderInfo } = payment;
          const paymentRes = await sendPaymentToSunmi({ amount: String(price), orderId, businessId, orderInfo });
          if (paymentRes.resultCode !== "T00") {
            throw new Error(`${paymentRes.resultCode}: ${paymentRes.resultMsg}`);
          }
          this.extendForm.confirm = false;
          break;
        case "cash":
        case "card":
        case "credit":
          this.extendForm.confirm_payment = true;
          break;
      }
    },
    async refundBooking() {
      const { id } = this.booking;
      this.refundForm.loading = true;
      const res = await updateBooking({ id, status: "CANCELED" });
      this.refundForm.loading = false;
      this.refundForm.confirm = false;
      await this.getBooking({ id });
    },
    async handleRefundManual(item) {
      this.refundManualForm.payment = item;
      this.refundManualForm.confirm = true;
    },
    async refundBookingManual() {
      const { id } = this.refundManualForm.payment;
      this.refundManualForm.loading = true;
      const res = await updatePayment({ id, paid: true });
      this.refundManualForm.loading = false;
      this.refundManualForm.confirm = false;
      this.getBooking({ id: this.booking.id });
    },
    async updateExtendPrice() {
      if (this.extendForm.loading_price || !this.booking.id) return;
      this.extendForm.loading_price = true;
      const { extendPaymentGateway: paymentGateway, extendHours: hours } = this;

      const res = await getBookingPrice({ ...this.booking, hours });
      this.extendForm.price = res.data.price - this.booking.price;
      this.extendForm.loading_price = false;
    },
    async getBooking({ id }) {
      const res = await getBooking({ id });
      this.booking = res.data;
      const {
        customer: { id: customerId }
      } = res.data;
      const res1 = await getUser({ id: customerId });
      this.customer = res1.data;
      await this.updateExtendPrice();
    },
    async comfirmPayment() {
      this.extendForm.loading_confirmPayment = true;
      const { payments } = this.booking;
      const [payment] = payments;
      const { id } = payment;
      const res = await updatePayment({ paid: true, id });
      this.extendForm.confirm_payment = false;
      this.extendForm.loading_confirmPayment = false;
      this.extendForm.confirm = false;
      this.getBooking({ id: this.booking.id });
    }
  }
};
</script>

<style>
</style>