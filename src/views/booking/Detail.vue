<template lang="pug">
  .booking-detail.flex.flex-column
    v-app-bar(color="secondary" style="flex:0")
        v-app-bar-nav-icon(@click="$router.go(-1)")
          v-icon mdi-chevron-left
        v-toolbar-title 预约详情
    v-container
      v-card.p-3
        div.flex
          div.p-4(style="flex:3;border-right:1px solid grey")
            v-list-item
              v-list-item-content 手机号
              v-list-item-action {{booking.customer.mobile}}
            v-list-item
              v-list-item-content 昵称
              v-list-item-action {{booking.customer.name}}
            v-list-item
              v-list-item-content 日期
              v-list-item-action {{booking.date}}
            v-list-item
              v-list-item-content 入场时间
              v-list-item-action {{booking.checkInAt}}
            v-list-item(v-if="booking.code")
              v-list-item-content 券码
              v-list-item-action {{booking.code.title}}
            v-list-item(v-if="booking.coupon")
              v-list-item-content 券码
              v-list-item-action {{configs.coupons.find(c=>c.slug===booking.coupon).name}}
          div.p-4(style="flex:2")
            v-list-item
              v-list-item-content 类型
              v-list-item-action {{configs.bookingTypeMap[booking.type]}}
            v-list-item
              v-list-item-content 状态
              v-list-item-action {{configs.bookingStatusMap[booking.status]}}
            v-list-item
              v-list-item-content 时长
              v-list-item-action(v-if="booking.hours") {{booking.hours}} 小时
              v-list-item-action(v-else) 畅玩
            v-list-item
              v-list-item-content 人数
              v-list-item-action.flex-row
                span(v-if="booking.membersCount") {{booking.membersCount}}大
                span(v-if="booking.kidsCount") {{booking.kidsCount}}小
            v-list-item
              v-list-item-content 袜子数
              v-list-item-action {{booking.socksCount}}
        v-divider.pt-2
        //- 操作栏
        v-card-actions.justify-end(style="flex:1;min-width:0")
          //- v-bottom-sheet(v-if="['IN_SERVICE'].includes(booking.status)"  v-model="finishForm.confirm")
          //-   template(v-slot:activator="{on}")
          //-     v-btn(color="success" dark v-on="on") 完成订单
          //-   v-sheet.px-10.flex.items-center(height="100px")
          //-     v-btn.w-full(block color="primary"  @click="finishBooking" :loading="finishForm.loading" ) 确认完成
          
          v-btn.mx-2(color="primary" @click="handlePrintBookingOnly") 打印小票

          //- extend button & bottom sheet
          v-bottom-sheet(v-if="['IN_SERVICE'].includes(booking.status) && booking.hours"  v-model="extendForm.confirm"  :persistent="extendForm.confirm_payment")
            template(v-slot:activator="{on}")
              v-btn.mx-2(color="green" dark v-on="on") 延长时间
            v-sheet.p-10.py-3.items-center
              v-form(v-model="extendForm.valid" @submit.native.prevent)
                p.text-3xl.text-center.text-orange-600 ￥{{extendForm.price}}
                p.mb-0 会员卡: ￥{{extendCreditPrice}} / 现场支付: ￥{{extendForm.price-extendCreditPrice}}
                v-btn-toggle.my-4(v-model="extendForm.form.hours")
                  v-btn.px-10(:value=1 text) 1小时
                  v-btn.px-10(:value=2 text v-if="booking.hours < 2") 2小时
                  v-btn.px-10(:value=0 text v-if="booking.hours") 畅玩
                v-bottom-navigation(v-if="extendForm.price-extendCreditPrice>0.01" v-model="extendForm.form.paymentGateway" grow icons-and-text style="box-shadow:none")
                  v-btn(v-for="item in extendForm.paymentGateways" :key="item.value")
                    span {{item.label}}
                    v-icon {{item.icon}}
              v-btn.mt-5.w-full(v-if="!extendForm.confirm_payment" block color="primary"  @click="extendBooking" :loading="extendForm.loading || extendForm.loading_price" :disabled="extendForm.price == 0") 确认延长
              v-btn.mt-5.w-full(v-if="extendForm.confirm_payment" block color="success"  @click="comfirmPayment" :loading="extendForm.loading_confirmPayment") 确认收款完成
          
          
          //- start service button & bottom sheet
          v-bottom-sheet(v-if="['BOOKED'].includes(booking.status)"  v-model="startServiceForm.confirm")
            template(v-slot:activator="{on}")
              v-btn.self-end.mx-2(color="success" dark v-on="on") 确认入场
            v-sheet.px-10.flex.items-center(height="100px")
              v-btn.w-full(block color="success"  @click="startService" :loading="startServiceForm.loading" ) 确认用户已入场
          
          //- refund buttom & bottom
          v-bottom-sheet(v-if="['BOOKED'].includes(booking.status)" v-model="refundForm.confirm")
            template(v-slot:activator="{on}")
              v-btn.self-end.mx-2(color="error" dark v-on="on") 退款并取消
            v-sheet.px-10.flex.items-center(height="100px")
              v-btn.w-full(block color="error"  @click="refundBooking" :loading="refundForm.loading" ) 发起退款
          //- confirm refund bottom sheet
          v-bottom-sheet(v-model="refundManualForm.confirm")
            v-sheet.px-10.flex.items-center(height="100px")
              v-btn.w-full(block color="error"  @click="refundBookingManual" :loading="refundManualForm.loading" ) 确定已退款
          //- confirm payment bottom sheet
          v-bottom-sheet(v-model="payManuallForm.confirm")
            v-sheet.px-10.flex.items-center(height="100px")
              v-btn.w-full(block color="error"  @click="payBookingManual" :loading="payManuallForm.loading" ) 确定已收款
      //- 绑定的手环
      v-card.p-3.mt-5(v-if="['BOOKED', 'IN_SERVICE', 'PENDING_REFUND', 'FINISHED'].includes(booking.status)" )
        v-form(v-model="checkInForm.valid" ref="checkInForm" @submit.native.prevent )
          v-text-field(autocomplete="off" v-for="(item, index) in booking.membersCount + booking.kidsCount" :key="index" :label="`玩家${index+1}手环号`" v-model="checkInForm.bandIds[index]"  required :disabled="!['BOOKED'].includes(booking.status)" :rules="[v => !!v || '请点击后用读卡器识别手环号']")
          v-btn(color="primary" v-if="['BOOKED'].includes(booking.status)" :disabled="!checkInForm.valid" @click="handleCheckIn" :loading="checkInForm.loading") 重新绑定手环并打印小票
      //- 手动收款/退款
      v-data-table.mt-10.pt-4(
           v-if="payablePayments.length > 0"
          :headers="headers" 
          :items="payablePayments" 
          :items-per-page="20" 
          hide-default-footer )
          template(v-slot:item.action="{item}")
            a(small v-if="item.amount<0 && item.gateway == 'scan'"  @click="handleRefundManual(item)") 扫码退款
            v-btn(color="primary" small v-if="item.amount<0 && item.gateway == 'cash'"  @click="handleRefundManual(item)") 手动退款
            v-btn(color="primary" small v-if="item.amount>0" @click="handlePayManual(item)") 手动收款

          template(v-slot:item.amount="{item}")
            span {{Math.abs(item.amount)}}
        

 </template>

<script>
import { getBooking, updateBooking, getBookingPrice } from "../../services/booking";
import { getUser } from "../../services/user";
import { updatePayment, sendPaymentToSunmi, openDrawer, bookingPrint, refundPaymentToSunmi } from "../../services/payment";
import { sync } from "vuex-pathify";
import { helpers } from "../../utils/helper";

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
      startServiceForm: {
        confirm: false,
        loading: false
      },
      checkInForm: {
        valid: false,
        loading: false,
        booking: {
          membersCount: 1
        },
        bandIds: []
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
      payManuallForm: {
        loading: false,
        confirm: false,
        payment: {}
      },
      booking: {
        id: null,
        bandIds: [],
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
      deep: true,
      immediate: true
    }
  },
  computed: {
    configs: sync("configs"),
    payablePayments() {
      return this.booking.payments.filter(i => !i.paid);
    },
    extendPaymentGateway() {
      if (this.customer.credit >= this.extendForm.price) {
        return "credit";
      }
      return this.extendForm.paymentGateways[this.extendForm.form.paymentGateway].value;
    },
    extendHours() {
      // console.log(this.extendForm.form.hours, this.booking.hours);
      if (Number(this.extendForm.form.hours) === 0) {
        return 0;
      }
      return Number(this.extendForm.form.hours) + Number(this.booking.hours);
    },
    extendCreditPrice() {
      const { price } = this.extendForm;
      const { credit = 0 } = this.customer;
      return Math.min(price, credit);
    }
  },
  mounted() {
    const { id } = this.$route.params;
    this.getBooking({ id });
  },
  methods: {
    //绑定手环
    async handleCheckIn() {
      this.checkInForm.loading = true;
      const { bandIds } = this.checkInForm;
      const { id } = this.booking;
      const [err, res] = await helpers.runAsync(updateBooking({ id, bandIds }));
      this.checkInForm.loading = false;
      if (err) {
        return;
      }
      await bookingPrint({ id });
      this.getBooking({ id });
    },
    async handlePrintBookingOnly() {
      const { id } = this.booking;
      await bookingPrint({ id });
    },
    async finishBooking() {
      const { id } = this.booking;
      this.finishForm.loading = true;
      const [err, res] = await helpers.runAsync(updateBooking({ id, status: "FINISHED" }));
      this.finishForm.loading = false;
      if (err) {
        return;
      }
      this.finishForm.confirm = false;
      this.getBooking({ id });
    },
    async extendBooking() {
      this.extendForm.loading = true;
      const { id } = this.booking;
      const { extendPaymentGateway: paymentGateway, extendHours: hours } = this;
      const [err, res] = await helpers.runAsync(updateBooking({ id, hours, paymentGateway: paymentGateway == "credit" ? null : paymentGateway }));
      this.extendForm.loading = false;
      if (err) {
        return;
      }

      this.booking = res.data;
      switch (paymentGateway) {
        case "scan":
          const { payments, price, id: businessId } = res.data;
          const [payment] = payments;
          const { id: orderId, attach: orderInfo, amount } = payment;
          const paymentRes = await sendPaymentToSunmi({ amount, orderId, businessId, orderInfo });
          if (paymentRes.resultCode !== "T00") {
            throw new Error(`${paymentRes.resultCode}: ${paymentRes.resultMsg}`);
          }
          await updatePayment({ id: orderId, paid: true });
          this.extendForm.confirm = false;
          break;
        case "cash":
          openDrawer();
          this.extendForm.confirm_payment = true;
          break;
        case "card":
          this.extendForm.confirm_payment = true;
          break;
        case "credit":
          this.extendForm.confirm = false;
          this.extendForm.confirm_payment = false;
          break;
      }
    },
    async startService() {
      const { id } = this.booking;
      this.startServiceForm.loading = true;
      const [err, res] = await helpers.runAsync(updateBooking({ id, status: "IN_SERVICE" }));
      this.startServiceForm.loading = false;

      if (err) {
        return;
      }
      this.startServiceForm.confirm = false;
      this.getBooking({ id: this.booking.id });
    },
    async refundBooking() {
      const { id } = this.booking;
      this.refundForm.loading = true;
      const [err, res] = await helpers.runAsync(updateBooking({ id, status: "CANCELED" }));
      this.refundForm.loading = false;
      if (err) {
        return;
      }
      this.refundForm.confirm = false;
      await this.getBooking({ id });
    },
    async handleRefundManual(item) {
      this.refundManualForm.payment = item;
      this.refundManualForm.confirm = true;
    },
    async refundBookingManual() {
      const { id, gateway, amount, original } = this.refundManualForm.payment;
      this.refundManualForm.loading = true;

      if (gateway == "scan") {
        const sunmiRefundResult = await refundPaymentToSunmi({ amount, oriOrderId: original });
        if (sunmiRefundResult.resultCode !== "T00") {
          throw new Error("退款失败：" + JSON.stringify(sunmiRefundResult.resultMsg));
        }
      }
      const [err, res] = await helpers.runAsync(updatePayment({ id, paid: true }));
      this.refundManualForm.loading = false;

      if (err) {
        return;
      }

      this.refundManualForm.confirm = false;
      this.getBooking({ id: this.booking.id });
    },
    async handlePayManual(item) {
      this.payManuallForm.payment = item;
      this.payManuallForm.confirm = true;
    },
    async payBookingManual() {
      const { id } = this.payManuallForm.payment;
      this.payManuallForm.loading = true;
      const [err, res] = await helpers.runAsync(updatePayment({ id, paid: true }));
      this.payManuallForm.loading = false;

      if (err) {
        return;
      }
      this.payManuallForm.confirm = false;
      this.getBooking({ id: this.booking.id });
    },
    async updateExtendPrice() {
      if (this.extendForm.loading_price || !this.booking.id || this.booking.hours >= 3) return;
      this.extendForm.loading_price = true;
      const { extendPaymentGateway: paymentGateway, extendHours: hours } = this;
      const [err, res] = await helpers.runAsync(getBookingPrice({ ...this.booking, hours }));
      this.extendForm.loading_price = false;
      if (err) {
        return;
      }
      this.extendForm.price = res.data.price - this.booking.price;
    },
    async getBooking({ id }) {
      const res = await getBooking({ id });
      this.booking = res.data;
      const {
        customer: { id: customerId }
      } = res.data;
      const res1 = await getUser({ id: customerId });
      this.customer = res1.data;
      this.checkInForm.bandIds = res.data.bandIds;
      if (["IN_SERVICE"].includes(this.booking.status) && this.booking.hours) {
        this.updateExtendPrice();
      }
    },
    async comfirmPayment() {
      this.extendForm.loading_confirmPayment = true;
      const { payments } = this.booking;
      const [payment] = payments;
      const { id } = payment;
      const [err, res] = await helpers.runAsync(updatePayment({ paid: true, id }));
      this.extendForm.loading_confirmPayment = false;

      if (err) {
        return;
      }
      this.extendForm.confirm_payment = false;
      this.extendForm.confirm = false;
      this.getBooking({ id: this.booking.id });
    }
  }
};
</script>

<style lang="stylus" scoped>
.v-data-table
  >>> td, >>> th
    padding 6px 8px
    height auto
  >>> .v-data-table__progress > th
    padding 0
</style>
