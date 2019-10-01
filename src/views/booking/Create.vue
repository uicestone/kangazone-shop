<template lang="pug">
  div.flex.flex-column
    v-app-bar.flex-none(color="secondary")
      v-app-bar-nav-icon(@click="handleBack")
        v-icon mdi-chevron-left
      v-toolbar-title 创建/选择预约
    v-container.flex.justify-center.items-center.flex-1
      div
        //- 搜索用户
        div(v-if="step == 'searchUser'" )
          v-card.py-4.px-7
            v-form(ref="searchUserForm" @submit.native.prevent)
              v-autocomplete(
                label="手机号" 
                :clearable="!searchUserForm.user.id"
                :disabled="!!searchUserForm.user.id"
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
                  v-show="searchUserForm.bookings.length > 0"
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
          v-card.py-4.px-7.mt-2(v-if="$_.get(searchUserForm, 'user.id')")
            div(v-if="!searchUserForm.user.cardNo && searchUserForm.user.credit")
              v-text-field(label="绑定会员卡" v-model="searchUserForm.cardNo" required :rules="[v => !!v || '请输入卡号']" clearable type="number")
              v-btn(color="primary" :disabled="!searchUserForm.cardNo" :loading="searchUserForm.bindCard_loading" @click="handleBindCardNo") 绑定卡号
            div
              v-text-field(label="余额" hide-details  v-model="searchUserForm.user.credit || 0"  disabled)
              v-btn(color="primary" block @click="step = 'topup'") 充值
        //- 充值                     
        v-card.py-4.px-7(v-if="step=='topup'")
          v-bottom-navigation.mt-2(v-model="topupForm.depositLevel" grow icons-and-text style="box-shadow:none")
            v-btn(v-for="item in configs.depositLevels" :key="item.price" :value="item.price")
              span.text-2xl ￥{{item.price}}
          v-divider
          v-bottom-navigation.mt-2(v-model="topupForm.paymentGateway" grow icons-and-text  style="box-shadow:none")
            v-btn(v-for="item in createBookingForm.paymentGateways" :key="item.value" :value="item.value")
              span {{item.label}}
              v-icon {{item.icon}}
          v-btn.mt-4(color="primary" block @click="handleTopup" :loading="topupForm.loading") 确认充值
          v-bottom-sheet(v-model="topupForm.confirm" persistent)
            v-sheet.px-10.flex.items-center(height="100px")
              div.w-full
                div.mr-5.text-lg.my-0
                  span.text-orange-600 ￥{{topupForm.depositLevel}}元
                v-btn.w-full(block color="primary"  @click="comfirmTopupPayment" :loading="topupForm.loading_confirm") 确认收款完成
        //- 创建用户
        v-form(v-model="createUserForm.valid" ref="createUserForm" v-if="step == 'createUser'" @submit.native.prevent)
          v-card.py-4.px-7
            v-text-field(label="手机号" v-model="createUserForm.mobile" required :rules="[v => !!v || '请输入手机号']" clearable type="number")
            v-text-field(label="用户名" v-model="createUserForm.username" :rules="[v => !!v || '请输入用户名']" clearable)
            v-radio-group(row v-model="createUserForm.gender")
              v-radio(label="男" value="1")
              v-radio(label="女" value="2")
            div
              v-btn(color="primary" :disabled="!createUserForm.valid" @click="createUser") 保存用户
        //- 创建订单
        v-card.py-4.px-7(v-if="step == 'createBooking'")
          v-form(v-model="createBookingForm.valid" ref="createBookingForm"  @submit.native.prevent)
            .flex
              div.items-between.flex.flex-column(style="flex:2")
                v-text-field(label="手机号" hide-details  v-model="createBookingForm.user.mobile" required disabled :rules="[v => !!v || '请输入手机号']")
                v-text-field(label="余额" hide-details  v-model="createBookingForm.user.credit || 0"  disabled type="number")
                v-menu
                  template(v-slot:activator="{on}")
                    v-text-field(label="选择日期" hide-details v-on="on"  v-model="createBookingForm.form.date")
                  v-date-picker(v-model="createBookingForm.form.date")
              div.pl-5.items-between.flex.flex-column(style="flex:3;width:70%")
                v-slider.flex.items-center(value.sync="createBookingForm.form.membersCount" :disabled="createBookingForm.fixedMembersCount"  @change="i => createBookingForm.form.membersCount=i" max=5 min=1 ticks="always" tick-size="4" hide-details)
                  template(v-slot:label)
                    p.w-12 人数
                  template(v-slot:append)
                    v-text-field.mt-0.pt-0(v-model="createBookingForm.form.membersCount" hide-details single-line type="number" style="width: 60px")
                v-slider.flex.items-center(value.sync="createBookingForm.form.socksCount"  @change="i => createBookingForm.form.socksCount=i" max=5 min=0 ticks="always" tick-size="4" hide-details)
                  template(v-slot:label)
                    p.w-12 袜子数
                  template(v-slot:append)
                    v-text-field.mt-0.pt-0(v-model="createBookingForm.form.socksCount" hide-details single-line type="number" style="width: 60px")
                v-btn-toggle.mt-4(v-model="createBookingForm.form.hours"  mandatory)
                  v-btn.px-5(:value=0 text :disabled="createBookingForm.fixedHours") 体验券
                  v-btn.px-5(:value=1 text :disabled="createBookingForm.fixedHours") 1小时
                  v-btn.px-5(:value=2 text :disabled="createBookingForm.fixedHours") 2小时
                  v-btn.px-5(:value=3 text :disabled="createBookingForm.fixedHours") 3小时
                v-select(:items="coupons" clearable label="优惠" item-text="name" :item-value="i => i" v-model="createBookingForm.coupon")
                //- v-checkbox(v-model="createBookingForm.form.useCoupon" label="体验券" hide-details)
            v-bottom-navigation.mt-2(v-model="createBookingForm.form.paymentGateway" grow icons-and-text v-if="paymentGateway !== 'credit'" style="box-shadow:none")
              v-btn(v-for="item in createBookingForm.paymentGateways" :key="item.value" :value="item.value")
                span {{item.label}}
                v-icon {{item.icon}}
            div.flex.mt-3.justify-space-between.align-end
              div.mr-5.text-lg.my-0
                span.text-orange-600 ￥{{createBookingForm.price}}元
                span.ml-2.text-orange-400.text-sm 会员卡: {{creditPrice}}元 / 现场支付: {{createBookingForm.price-creditPrice}}元
              v-btn(color="primary" :disabled="!createBookingForm.valid"  @click="createBooking" :loading="createBookingForm.loading_createBooking || this.createBookingForm.loading_price") 创建订单
            v-bottom-sheet(v-model="createBookingForm.confirm" persistent)
              v-sheet.px-10.flex.items-center(height="100px")
                div.w-full
                  div.mr-5.text-lg.my-0
                    span.text-orange-600 ￥{{createBookingForm.price}}元
                    span.ml-2.text-orange-400.text-sm 会员卡: {{creditPrice}}元 / 现场支付: {{createBookingForm.price-creditPrice}}元
                  v-btn.w-full(block color="primary"  @click="comfirmPayment" :loading="createBookingForm.loading_confirm") 确认收款完成
        //- 签到
        v-form(v-model="checkInForm.valid" ref="checkInForm" v-if="step == 'checkIn'" @submit.native.prevent)
          v-card.py-4.px-7
            v-text-field(v-for="(item, index) in checkInForm.booking.membersCount" :key="index" :label="`玩家${index+1}手环号`" v-model="checkInForm.bandIds[index]"  required :rules="[v => !!v || '请点击后用读卡器识别手环号']")
            v-btn(color="primary" :disabled="!checkInForm.valid" @click="handleCheckIn" :loading="checkInForm.loading") 绑定手环并打印小票
            v-btn.ml-2(color="warning" @click="handlePrintBookingOnly") 仅打印小票


</template>

<script>
import { signup, User } from "../../services";
import { findUser, updateUser, userDeposit, getUser } from "../../services/user";
import { sync } from "vuex-pathify";
import { findBookings, createBooking, updateBooking, getBookingPrice } from "../../services/booking";
import { moment } from "../../utils/moment";
import { config } from "../../../config";
import { sendPaymentToSunmi, updatePayment, openDrawer, bookingPrint } from "../../services/payment";
import { _ } from "../../utils/lodash";
const { $App } = window;

export default {
  data() {
    return {
      today: moment().format("YYYY-MM-DD"),
      step: "searchUser",
      topupForm: {
        confirm: false,
        loading_confirm: false,
        depositLevel: 1000,
        paymentGateway: "scan",
        loading: false,
        payment: {}
      },
      searchUserForm: {
        user: {
          id: "",
          mobile: "",
          credit: 0,
          cardNo: 0
        },
        bookings: [],
        bookings_loading: false,
        bindCard_loading: false,
        cardNo: null,
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
          socksCount: 0,
          paymentGateway: "scan",
          useCoupon: false
        },
        user: {
          mobile: "",
          credit: 0
        },
        coupon: {},
        fixedHours: false,
        fixedMembersCount: false,
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
        valid: false,
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
      if (this.createBookingForm.user.credit > this.createBookingForm.price || this.createBookingForm.form.hours == 0) {
        return "credit";
      }
      return this.createBookingForm.form.paymentGateway;
    },
    configs: sync("configs"),
    currentStore: sync("store/currentStore"),
    userValid() {
      if (!this.searchUserForm.user) return false;
      return this.searchUserForm.user.mobile;
    },
    creditPrice() {
      const price = _.get(this, "createBookingForm.price", 0);
      const credit = _.get(this, "createBookingForm.user.credit", 0);
      return Math.min(price, credit);
    },
    coupons() {
      return this.configs.coupons.filter(i => {
        const { validFrom, validTill } = i;
        return moment().isBetween(moment(validFrom).subtract(1, "day"), moment(validTill), "days", true);
      });
    }
  },
  watch: {
    "createBookingForm.form": {
      async handler(newVal, oldVal) {
        if (!oldVal || this.createBookingForm.loading_price) return;
        this.createBookingForm.loading_price = true;
        let { type, date, checkInAt, membersCount, socksCount, hours } = this.createBookingForm.form;
        const { id: customerId } = this.createBookingForm.user;
        const { slug } = this.createBookingForm.coupon || {};
        const { paymentGateway } = this;
        const res = await getBookingPrice({
          store: this.currentStore.id,
          type,
          date,
          hours,
          coupon: slug,
          customer: customerId,
          checkInAt: moment().format("HH:mm"),
          membersCount,
          socksCount,
          useCredit: paymentGateway == "credit",
          paymentGateway
        }).catch(err => {
          this.createBookingForm.loading_price = false;
        });
        this.createBookingForm.price = res.data.price;
        this.createBookingForm.loading_price = false;
      },
      immediate: true,
      deep: true
    },
    "createBookingForm.coupon"(val) {
      const { fixedHours, fixedMembersCount, hours, membersCount } = val || {};
      this.createBookingForm.form.hours = hours || 1;
      this.createBookingForm.form.membersCount = membersCount || 1;
      this.createBookingForm.fixedHours = fixedHours || false;
      this.createBookingForm.fixedMembersCount = fixedMembersCount || false;
    },
    async "searchUserForm.searchText"(val) {
      const { searchText, loading } = this.searchUserForm;
      if (loading || !searchText) return;
      this.searchUserForm.loading = true;
      const res = await findUser({ keyword: searchText }).catch(err => {
        this.searchUserForm.loading = false;
      });
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
    async refreshSearchUser() {
      this.step = "searchUser";
      const { id } = this.searchUserForm.user;
      if (!id) return;
      const res = await getUser({ id });
      this.searchUserForm.user = res.data;
      this.searchUserForm.searchText = res.data.mobile;
    },
    async handleTopup() {
      const { paymentGateway, depositLevel } = this.topupForm;
      const { id } = this.searchUserForm.user;
      this.topupForm.loading = true;
      const { data: payment } = await userDeposit({ id, depositLevel, paymentGateway }).catch(err => {
        this.topupForm.loading = false;
      });
      this.topupForm.payment = payment;
      this.topupForm.loading = false;
      switch (paymentGateway) {
        case "scan":
          const { id: orderId, attach: orderInfo, amount } = payment;
          const paymentRes = await sendPaymentToSunmi({ amount, orderId, businessId: orderId, orderInfo });
          if (paymentRes.resultCode !== "T00") {
            throw new Error(`${paymentRes.resultCode}: ${paymentRes.resultMsg}`);
          }
          await updatePayment({ id: orderId, paid: true });
          this.refreshSearchUser();
          break;
        case "cash":
          openDrawer();
          this.topupForm.confirm = true;
          break;
        case "card":
          this.topupForm.confirm = true;
          break;
      }
    },
    async comfirmTopupPayment() {
      this.topupForm.loading_confirm = true;
      const { id } = this.topupForm.payment;
      const res = await updatePayment({ paid: true, id }).catch(err => {
        this.topupForm.loading_confirm = false;
      });
      this.topupForm.loading_confirm = false;
      this.topupForm.confirm = false;
      this.refreshSearchUser();
    },
    async handleBindCardNo() {
      this.searchUserForm.bindCard_loading = true;
      const { cardNo } = this.searchUserForm;
      const { id } = this.searchUserForm.user;
      const res = await updateUser({ cardNo, id }).catch(err => {
        this.searchUserForm.bindCard_loading = false;
      });
      this.searchUserForm.user.cardNo = res.data.cardNo;
      this.searchUserForm.bindCard_loading = false;
    },
    goCreateUser() {
      Object.assign(this.createUserForm, { mobile: "", username: "", gender: "male" });
      this.step = "createUser";
    },
    async createBookingFromSearchUser() {
      this.createBookingForm.user = this.searchUserForm.user;
      this.step = "createBooking";
    },
    async createUser() {
      const { mobile, username, gender } = this.createUserForm;
      const res = await signup({ username, gender, mobile });
      this.searchUserForm.user = res.data;
      this.refreshSearchUser();
    },
    goCheckIn(booking) {
      this.checkInForm.booking = booking;
      this.step = "checkIn";
    },
    async createBooking() {
      this.createBookingForm.loading_createBooking = true;
      let { type, date, checkInAt, membersCount, socksCount, hours } = this.createBookingForm.form;
      const { id: customerId } = this.createBookingForm.user;
      const { slug } = this.createBookingForm.coupon || {};
      const { paymentGateway } = this;
      const res = await createBooking({
        store: this.currentStore.id,
        type,
        date,
        hours,
        coupon: slug,
        customer: customerId,
        checkInAt: moment().format("HH:mm:ss"),
        membersCount,
        socksCount,
        useCredit: true,
        paymentGateway: paymentGateway == "credit" ? null : paymentGateway
      }).catch(error => {
        this.createBookingForm.loading_createBooking = false;
      });
      this.createBookingForm.loading_createBooking = false;
      this.createBookingForm.newBooking = res.data;

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
          return this.goCheckIn(this.createBookingForm.newBooking);
        case "cash":
          openDrawer();
          this.createBookingForm.confirm = true;
          break;
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
      const res = await updateBooking({ id, bandIds });
      await bookingPrint({ id }).catch(err => {
        this.checkInForm.loading = false;
      });
      this.checkInForm.loading = false;
      this.$router.push({ name: "bookingDetail", params: { id } });
    },
    async handlePrintBookingOnly() {
      const {
        booking: { id }
      } = this.checkInForm;
      await bookingPrint({ id });
      this.$router.push({ name: "bookingDetail", params: { id } });
    },
    async comfirmPayment() {
      this.createBookingForm.loading_confirm = true;
      const {
        newBooking: { payments }
      } = this.createBookingForm;
      const [payment] = payments;
      const { id } = payment;
      const res = await updatePayment({ paid: true, id }).catch(err => {
        this.createBookingForm.loading_confirm = false;
      });
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