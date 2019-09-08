<template lang="pug">
  div
    v-app-bar(color="secondary")
      v-app-bar-nav-icon(@click="handleBack")
        v-icon mdi-chevron-left
      v-toolbar-title 创建/选择预约
    v-container.flex.justify-center.items-center.h-content
      v-card.py-3.px-10.mx-10(width="600px")
        div
          v-form(ref="searchUserForm" v-if="step == 'searchUser'")
            v-autocomplete(
              label="手机号" 
              clearable
              autofocus
              hide-no-data
              v-model="searchUserForm.user" 
              :search-input.sync="searchUserForm.searchText"
              :loading="searchUserForm.loading"
              :items="searchUserForm.items"
              item-text="mobile"
              :item-value="item => item"
              required)
            div.flex.justify-center.align-center
              v-btn(color="primary" dark v-if="!userValid" @click="goCreateUser") 创建用户
              v-overflow-btn.mr-4(
                type="number"
                :loading="searchUserForm.bookings_loading" 
                :items="searchUserForm.bookings" 
                label="已预约签到" 
                dense
                color="primary"
                v-if="userValid"
                :item-text="getDropDownText"
                :item-value="i => i"
                @change="goCheckIn"
              ) 
              v-btn(color="accent"  v-if="userValid" @click="createBookingFromSearchUser") 创建新预约
          v-form(v-model="createUserForm.valid" ref="createUserForm" v-if="step == 'createUser'")
            v-text-field(label="手机号" v-model="createUserForm.mobile" required :rules="[v => !!v || '请输入手机号']" clearable type="number")
            v-text-field(label="用户名" v-model="createUserForm.username" :rules="[v => !!v || '请输入用户名']" clearable)
            v-radio-group(row v-model="createUserForm.gender")
              v-radio(label="男" value="1")
              v-radio(label="女" value="2")
            div
              v-btn(color="primary" :disabled="!createUserForm.valid" @click="createBookingFromCreaetUser") 保存用户并创建预约
          v-form(v-model="createBookingForm.valid" ref="createBookingForm" v-if="step == 'createBooking'")
            v-text-field(label="手机号" v-model="createBookingForm.user.mobile" required disabled :rules="[v => !!v || '请输入手机号']")
            v-menu
              template(v-slot:activator="{on}")
                v-text-field(label="选择日期" v-on="on"  v-model="createBookingForm.form.date")
              v-date-picker(v-model="createBookingForm.form.date")
            v-slider.flex.items-center(value.sync="createBookingForm.form.membersCount" @change="i => createBookingForm.form.membersCount=i" max=5 min=1 ticks="always" tick-size="4" hide-details)
              template(v-slot:label)
                p.w-12 人数
              template(v-slot:append)
                v-text-field.mt-0.pt-0(v-model="createBookingForm.form.membersCount" hide-details single-line type="number" style="width: 60px")
            v-slider.flex.items-center(value.sync="createBookingForm.form.socksCount" @change="i => createBookingForm.form.socksCount=i" max=5 min=1 ticks="always" tick-size="4" hide-details)
              template(v-slot:label)
                p.w-12 袜子数
              template(v-slot:append)
                v-text-field.mt-0.pt-0(v-model="createBookingForm.form.socksCount" hide-details single-line type="number" style="width: 60px")
            v-btn-toggle.my-4(v-model="createBookingForm.form.hours" mandatory)
              v-btn.px-10(:value=1 text) 1小时
              v-btn.px-10(:value=2 text) 2小时
              v-btn.px-10(:value=3 text) 3小时

            v-bottom-navigation(v-model="createBookingForm.form.paymentGateway" grow icons-and-text v-if="paymentGateway !== 'credit'")
                v-btn(v-for="item in createBookingForm.paymentGateways" :key="item.value")
                  span {{item.label}}
                  v-icon {{item.icon}}
            div.flex.mt-8.justify-center.items-center
              span.mr-5.text-orange-600.text-lg ￥{{createBookingForm.price}}
              v-btn(color="primary" :disabled="!createBookingForm.valid || createBookingForm.price =='0'"  @click="createBooking" :loading="createBookingForm.loading_createBooking || this.createBookingForm.loading_price") 创建订单
              v-bottom-sheet(v-model="createBookingForm.confirm" persistent)
                v-sheet.px-10.flex.items-center(height="100px")
                  v-btn.w-full(block color="primary"  @click="comfirmPayment" :loading="createBookingForm.loading_confirm") 确认收款完成

          v-form(v-model="checkInForm.valid" ref="checkInForm" v-if="step == 'checkIn'")
            v-text-field(v-for="(item, index) in checkInForm.booking.membersCount" :key="index" :label="`玩家${index+1}手环号`" v-model="checkInForm.bandIds[index]"  required :rules="[v => !!v || '请点击后用读卡器识别手环号']")
            v-btn(color="primary" :disabled="!checkInForm.valid" @click="handleCheckIn" :loading="checkInForm.loading") 绑定手环

</template>

<script>
import { signup, User } from "../../services";
import { findUser } from "../../services/user";
import { sync } from "vuex-pathify";
import { findBookings, createBooking, updateBooking, getBookingPrice } from "../../services/booking";
import { moment } from "../../utils/moment";
import { config } from "../../../config";
import { sendPaymentToSunmi, updatePayment } from "../../services/payment";

export default {
  data() {
    return {
      today: moment().format("YYYY-MM-DD"),
      step: "searchUser",
      searchUserForm: {
        user: {
          id: "",
          mobile: ""
        },
        bookings: null,
        bookings_loading: false,
        searchText: "",
        loading: false,
        items: []
      },
      createUserForm: {
        valid: false,
        mobile: "",
        username: "",
        gender: 1,
        loading: false
      },
      createBookingForm: {
        form: {
          type: "play",
          date: moment().format("YYYY-MM-DD"),
          hours: 1,
          membersCount: 1,
          socksCount: 1,
          paymentGateway: 0
        },
        user: {
          mobile: ""
        },
        price: 0,
        confirm: false,
        loading_price: false,
        loading_confirm: false,
        loading_createBooking: false,
        paymentGateways: [
          { label: "扫码支付", value: "scan", icon: "mdi-qrcode" },
          { label: "现金支付", value: "cash", icon: "mdi-wallet" },
          { label: "刷卡支付", value: "card", icon: "mdi-credit-card" }
        ],
        newBooking: {}
      },
      checkInForm: {
        loading: false,
        booking: {
          membersCount: 1
        },
        bandIds: []
      }
    };
  },
  computed: {
    paymentGateway() {
      if (this.createBookingForm.user.credit > this.createBookingForm.price) {
        return "credit";
      }
      return this.createBookingForm.paymentGateways[this.createBookingForm.form.paymentGateway].value;
    },
    configs: sync("configs"),
    currentStore: sync("store/currentStore"),
    userValid() {
      if (!this.searchUserForm.user) return false;
      return this.searchUserForm.user.mobile;
    }
  },
  watch: {
    "createBookingForm.form": {
      async handler(newVal, oldVal) {
        if (!oldVal || this.createBookingForm.loading_price) return;
        this.createBookingForm.loading_price = true;
        let { type, date, hours, checkInAt, membersCount, socksCount } = this.createBookingForm.form;
        const { id: customerId } = this.createBookingForm.user;

        const { paymentGateway } = this;
        const res = await getBookingPrice({
          store: this.currentStore.id,
          type,
          date,
          hours,
          customer: customerId,
          checkInAt: moment().format("HH:mm"),
          membersCount,
          socksCount,
          useCredit: paymentGateway == "credit",
          paymentGateway
        });
        this.createBookingForm.price = res.data.price;
        this.createBookingForm.loading_price = false;
      },
      immediate: true,
      deep: true
    },
    async "searchUserForm.searchText"(val) {
      const { searchText, loading } = this.searchUserForm;
      if (loading || !searchText) return;
      this.searchUserForm.loading = true;
      const res = await findUser({ keyword: searchText });
      this.searchUserForm.items = res.data;
      this.searchUserForm.loading = false;
    },
    async "searchUserForm.user"(val) {
      const { bookings_loading } = this.searchUserForm;
      if (bookings_loading || !val) return;
      this.searchUserForm.bookings_loading = true;
      //TODO: store id
      let res;
      if (config.IS_PROD) {
        res = await findBookings({ customer: val.id, date: this.today, store: this.currentStore.id, status: "BOOKED" });
      } else {
        res = await findBookings({ customer: val.id });
      }
      this.searchUserForm.bookings = res.data;
      this.searchUserForm.bookings_loading = false;
    }
  },
  methods: {
    goCreateUser() {
      Object.assign(this.createUserForm, { mobile: "", username: "", gender: "male" });
      this.step = "createUser";
    },
    async createBookingFromSearchUser() {
      this.createBookingForm.user = this.searchUserForm.user;
      this.step = "createBooking";
    },
    async createBookingFromCreaetUser() {
      const { mobile, username, gender } = this.createUserForm;
      const res = await signup({ username, gender, mobile });
      this.createBookingForm.user = res.data;
      this.step = "createBooking";
    },
    goCheckIn(booking) {
      this.checkInForm.booking = booking;
      this.step = "checkIn";
    },
    async createBooking() {
      this.createBookingForm.loading_createBooking = true;
      let { type, date, hours, checkInAt, membersCount, socksCount } = this.createBookingForm.form;
      const { id: customerId } = this.createBookingForm.user;
      const { paymentGateway } = this;
      const res = await createBooking({
        store: this.currentStore.id,
        type,
        date,
        hours,
        customer: customerId,
        checkInAt: moment().format("HH:mm"),
        membersCount,
        socksCount,
        useCredit: true,
        paymentGateway: paymentGateway == "credit" ? null : paymentGateway
      });
      this.createBookingForm.loading_createBooking = false;
      this.createBookingForm.newBooking = res.data;

      switch (paymentGateway) {
        case "scan":
          const { payments, price, id: businessId } = res.data;
          const [payment] = payments;
          const { id: orderId, attach: orderInfo } = payment;
          const paymentRes = await sendPaymentToSunmi({ amount: String(price), orderId, businessId, orderInfo });
          if (paymentRes.resultCode !== "T00") {
            throw new Error(`${paymentRes.resultCode}: ${paymentRes.resultMsg}`);
          }
          return this.goCheckIn(this.createBookingForm.newBooking);
        case "cash":
        case "card":
          this.createBookingForm.confirm = true;
          break;
        case "credit":
          return this.goCheckIn(this.createBookingForm.newBooking);
      }
    },
    async handleCheckIn() {
      this.checkInForm.loading = true;
      const {
        booking: { id },
        bandIds
      } = this.checkInForm;
      const res = await updateBooking({ id, bandIds, status: "IN_SERVICE" });
      const booking = res.data;
      this.checkInForm.loading = false;
      this.$router.push({ name: "bookingDetail", params: { id: booking.id } });
    },
    async comfirmPayment() {
      this.createBookingForm.loading_confirm = true;
      const {
        newBooking: { payments }
      } = this.createBookingForm;
      const [payment] = payments;
      const { id } = payment;
      const res = await updatePayment({ paid: true, id });
      this.createBookingForm.loading_confirm = false;
      this.createBookingForm.confirm = false;
      this.goCheckIn(this.createBookingForm.newBooking);
    },
    getDropDownText(i) {
      return `${i.checkInAt}-${i.hours}小时-${i.membersCount}人`;
    },
    handleBack() {
      if (this.step == "searchUser") {
        return this.$router.go(-1);
      }
      this.step = "searchUser";
    }
  }
};
</script>

<style>
</style>