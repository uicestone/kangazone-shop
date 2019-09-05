<template lang="pug">
  div
    v-app-bar( color="#6A76AB" dark)
      v-app-bar-nav-icon(@click="$router.go(-1)")
        v-icon mdi-chevron-left
      v-toolbar-title 创建订单
    v-container.flex.justify-center.items-center.h-screen
      v-card
        v-toolbar(flat color="grey lighten-4" dense v-if="step !== 'searchUser'")
          v-btn(icon @click="step = 'searchUser'")
            v-icon mdi-arrow-left
        div.p-10
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
              v-btn(color="blue-grey" dark v-if="!userValid" @click="goCreateUser") 创建用户
              v-btn(color="primary"  v-if="userValid" @click="createBookingFromSearchUser") 创建预约
              v-overflow-btn.ml-4.w-64(
                :loading="searchUserForm.bookings_loading" 
                :items="searchUserForm.bookings" 
                label="签到" 
                dense
                color="success"
                v-if="userValid"
                :item-text="getDropDownText"
                :item-value="i => i"
                @change="goCheckIn"
                ) 
          v-form(v-model="createUserForm.valid" ref="createUserForm" v-if="step == 'createUser'")
            v-text-field(label="手机号" v-model="createUserForm.mobile" required :rules="[v => !!v || '请输入手机号']" clearable)
            v-text-field(label="用户名" v-model="createUserForm.username" required :rules="[v => !!v || '请输入用户名']" clearable)
            v-radio-group(row v-model="createUserForm.gender" required)
              v-radio(label="男" value="1")
              v-radio(label="女" value="2")
            div
              v-btn(color="primary" :disabled="!createUserForm.valid" @click="createBookingFromCreaetUser") 创建预约
          v-form(v-model="createBookingForm.valid" ref="createBookingForm" v-if="step == 'createBooking'")
            v-text-field(label="手机号" v-model="createBookingForm.user.mobile" required disabled :rules="[v => !!v || '请输入手机号']")
            v-menu
              template(v-slot:activator="{on}")
                v-text-field(label="选择日期" v-on="on"  v-model="createBookingForm.form.date")
              v-date-picker(v-model="createBookingForm.form.date")
            v-text-field(label="人数" v-model="createBookingForm.form.membersCount" required :rules="[v => !!v || '请输入人数']")
            v-text-field(label="时长" v-model="createBookingForm.form.hours" required :rules="[v => !!v || '请输入时长']")
            v-text-field(label="袜子数" v-model="createBookingForm.form.socksCount" required :rules="[v => !!v || '请输入袜子数']")
            v-bottom-navigation(v-model="createBookingForm.form.paymentGateway" grow icons-and-text v-if="paymentGateway !== 'credit'")
                v-btn(v-for="item in createBookingForm.paymentGateways" :key="item.value")
                  span {{item.label}}
                  v-icon {{item.icon}}
            div.flex.mt-5.justify-center.items-center
              span.mr-5.text-orange-600.text-lg ￥{{createBookingForm.price}}
              v-btn(color="primary" :disabled="!createBookingForm.valid"  @click="createBooking" :loading="createBookingForm.loading_createBooking") 创建订单
              v-bottom-sheet(v-model="createBookingForm.confirm" persistent)
                v-sheet.px-10.flex.items-center(height="100px")
                  v-btn.w-full(block color="primary"  @click="comfirmPayment" :loading="createBookingForm.loading_confirm") 确认付款

          v-form(v-model="checkInForm.valid" ref="checkInForm" v-if="step == 'checkIn'")
            v-text-field(v-for="(item, index) in checkInForm.booking.membersCount" :key="index" :label="'手环号'+index" v-model="checkInForm.bandIds[index]"  required :rules="[v => !!v || '请输入手环号']")
            v-btn(:disabled="!checkInForm.valid" @click="handleCheckIn") 绑定手环

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
      step: "createBooking",
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
          mobile: "13122381930",
          credit: 200
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
        oldVal.loading_price = true;
        let { type, date, hours, checkInAt, membersCount, socksCount } = this.createBookingForm.form;
        const { paymentGateway } = this;
        const res = await getBookingPrice({
          store: this.currentStore.id,
          type,
          date,
          hours,
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
        res = await findBookings({ customer: val.id, date: this.today, store: this.currentStore.id });
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
      const { paymentGateway } = this;
      const res = await createBooking({
        store: this.currentStore.id,
        type,
        date,
        hours,
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
          return this.goCheckIn(this.createUserForm.newBooking);
        case "cash":
        case "card":
          this.createBookingForm.confirm = true;
          break;
        case "credit":
          return this.goCheckIn(this.createUserForm.newBooking);
      }
    },
    async handleCheckIn() {
      const {
        booking: { id },
        bandIds
      } = this.checkInForm;
      const res = await updateBooking({ id, bandIds, status: "IN_SERVICE" });
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
    }
  }
};
</script>

<style>
</style>