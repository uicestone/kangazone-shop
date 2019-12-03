<template lang="pug">
  .flex.flex-column
    v-app-bar.flex-none(color="secondary")
      v-app-bar-nav-icon(@click="handleBack")
        v-icon mdi-chevron-left
      v-toolbar-title 创建/选择预约
    v-container.flex.justify-center.items-center.flex-1.py-0
      .flex-1
        //- 搜索用户
        .flex.justify-center.flex-row-reverse(v-if="step == 'searchUser'" )
          v-card.py-4.px-7.ml-2(style="flex:3;max-width:55%")
            v-form(ref="searchUserForm" @submit.native.prevent)
              v-text-field(label="昵称" v-if="searchUserForm.user.name" v-model="searchUserForm.user.name" disabled autocomplete="off") 
              v-autocomplete(
                autocomplete="off"
                :label="$_.get(searchUserForm,'user.id') ? '手机号' : '部分匹配的 手机号/昵称/卡号'" 
                :clearable="!$_.get(searchUserForm,'user.id')"
                :disabled="!!$_.get(searchUserForm,'user.id')"
                autofocus
                hide-no-data
                noFilter
                v-model="searchUserForm.user" 
                :search-input.sync="searchUserForm.searchText"
                :loading="searchUserForm.loading"
                :items="searchUserForm.items"
                item-text="mobile"
                :item-value="item => item"
                required)
              .flex.justify-center.align-center
                v-btn(color="primary" dark v-if="!userValid" @click="goCreateUser") 创建新用户
                v-overflow-btn.mr-4(
                  type="number"
                  v-show="searchUserForm.bookings.length > 0"
                  :loading="searchUserForm.bookings_loading" 
                  :items="searchUserForm.bookings" 
                  label="已预约签到" 
                  dense
                  color="primary"
                  v-if="userValid && (searchUserForm.user.idCardNo || !searchUserForm.user.cardType || searchUserForm.user.isForeigner)"
                  :item-text="getDropDownText"
                  :item-value="i => i"
                  @change="goCheckIn"
                ) 
                v-btn(color="primary" :block="!searchUserForm.bookings.length" v-if="userValid && (searchUserForm.user.idCardNo || !searchUserForm.user.cardType || searchUserForm.user.isForeigner)" @click="createBookingFromSearchUser") 创建新预约
              .flex(v-if="userValid && !searchUserForm.user.idCardNo && searchUserForm.user.cardType && !searchUserForm.user.isForeigner")
                v-text-field(label="身份证号" v-model="createUserForm.idCardNo" autocomplete="off" v-if="!createUserForm.isForeigner") 
                v-select(label="国籍" v-model="createUserForm.country" :items="countries" v-if="createUserForm.isForeigner")
                v-checkbox(label="外籍" v-model="createUserForm.isForeigner" style="width:85px") 
              v-btn(color="primary" block v-if="userValid && !searchUserForm.user.idCardNo && searchUserForm.user.cardType && !searchUserForm.user.isForeigner" @click="updateUser")
                span(v-if="!createUserForm.isForeigner") 补录身份证号
                span(v-else) 完善国籍信息
          v-card.py-4.px-7(v-if="$_.get(searchUserForm, 'user.id')" style="flex:2")
            div.flex(v-if="!searchUserForm.user.cardNo && (searchUserForm.user.codes.length || searchUserForm.user.credit)" style="align-items:center")
              v-text-field(label="绑定会员卡" v-model="searchUserForm.cardNo" required :rules="[v => !!v || '请输入卡号']" clearable type="number" autocomplete="off")
              v-btn(small color="primary" :disabled="!searchUserForm.cardNo" :loading="searchUserForm.bindCard_loading" @click="handleBindCardNo") 绑定卡号
            div
              p(v-if="searchUserForm.user.freePlay" style="opacity:0.5;text-align:left") 本人畅玩至{{searchUserForm.user.freePlayTo.substr(0,10)}}
              .flex
                v-text-field(label="卡号" v-if="searchUserForm.user.cardNo" v-model="searchUserForm.user.cardNo" disabled autocomplete="off") 
                v-text-field(label="余额" v-model="searchUserForm.user.credit || 0"  disabled autocomplete="off")
              v-select(:items="searchUserForm.user.codes" clearable :label="`${searchUserForm.user.codes.filter(c => !c.used).length}次券码可用`" :item-text="i => `${i.title} ID: ${$_.get(i,'id','').substr(-6).toUpperCase()}`" :item-disabled="i => i.used")
              v-btn(color="primary" block @click="step = 'topup'") 充值
        //- 充值                     
        v-card.py-4.px-7(v-if="step=='topup'")
          v-btn-toggle.deposit-levels.mt-2.flex.flex-wrap.justify-center(v-model="topupForm.depositLevel" group)
            v-btn(v-for="item in configs.depositLevels" :key="item.slug" :value="item" style="width:33%")
              span.text-2xl ￥{{item.price}}
              br
              span.text-lg(v-if="item.rewardCredit") 送 {{item.rewardCredit}}
              span.text-lg(v-else) {{item.desc}}
          v-divider.mt-2
          .flex.mt-2.align-center
            v-bottom-navigation.flex-1.mt-2(v-model="topupForm.paymentGateway" grow icons-and-text  style="box-shadow:none")
              v-btn(v-for="item in createBookingForm.paymentGateways" :key="item.value" :value="item.value")
                span {{item.label}}
                v-icon {{item.icon}}
            v-btn.flex-1(color="primary" @click="handleTopup" :loading="topupForm.loading") 确认充值
          v-bottom-sheet(v-model="topupForm.confirm" persistent)
            v-sheet.px-10.flex.items-center(height="100px")
              .w-full
                .mr-5.text-lg.my-0
                  span.text-orange-600 ￥{{topupForm.depositLevel.price}}元
                v-btn.w-full(block color="primary"  @click="comfirmTopupPayment" :loading="topupForm.loading_confirm") 确认收款完成
        //- 创建用户
        v-form(v-model="createUserForm.valid" ref="createUserForm" v-if="step == 'createUser'" @submit.native.prevent)
          v-card.flex.flex-wrap.py-4.px-7
            v-text-field(class="w-1/2" label="完整的手机号" v-model="createUserForm.mobile" required :rules="[v => !!v || '请输入手机号']" clearable type="number" autocomplete="off")
            v-text-field(class="w-1/2" label="客人的姓名或昵称" v-model="createUserForm.username" :rules="[v => !!v || '请输入用户名']" clearable autocomplete="off")
            v-text-field(class="w-1/2" label="身份证号*" v-model="createUserForm.idCardNo" clearable autocomplete="off")
            v-radio-group(class="w-1/2" row v-model="createUserForm.gender")
              v-radio(label="男" :value="1")
              v-radio(label="女" :value="2")
              v-radio(label="未知" :value="0")
            v-btn(block color="primary" :disabled="!createUserForm.valid" @click="createUser") 保存客人
        //- 创建订单
        v-card.py-4.px-7(v-if="step == 'createBooking'")
          v-form(v-model="createBookingForm.valid" ref="createBookingForm"  @submit.native.prevent)
            .flex
              .flex.flex-column(style="width:30%")
                v-btn-toggle.flex(mandatory style="width:100%")
                  v-btn.px-0(text style="flex-grow:2") 手机号：{{ createBookingForm.user.mobile }}
                  v-btn.px-0(text style="flex-grow:1") 余额：{{ createBookingForm.user.credit || 0 }}
                v-btn-toggle.select-hours.mt-4.flex(v-model="createBookingForm.form.hours" mandatory style="width:100%")
                  v-btn.flex-1(:value=1 text :disabled="createBookingForm.fixedHours") 1小时
                  v-btn.flex-1(:value=2 text :disabled="createBookingForm.fixedHours") 2小时
                  v-btn.flex-1(:value=3 text :disabled="createBookingForm.fixedHours") 3小时
                  v-btn.flex-1(:value=0 text :disabled="createBookingForm.fixedHours") 畅玩
                v-menu.mt-2(hide-details)
                  template(v-slot:activator="{on}")
                    v-text-field(label="选择日期" hide-details v-on="on"  v-model="createBookingForm.form.date" autocomplete="off" style="height:20px")
                  v-date-picker(v-model="createBookingForm.form.date")
              .pl-5.items-between.flex.flex-column(style="flex:3;width:70%")
                v-slider.flex.items-center(value.sync="createBookingForm.form.membersCount" :disabled="createBookingForm.fixedMembersCount" @change="i => createBookingForm.form.membersCount=i" max=5 min=1 ticks="always" tick-size="4" hide-details)
                  template(v-slot:label)
                    p.w-12 成人数
                  template(v-slot:append)
                    v-text-field.mt-0.pt-0(v-model="createBookingForm.form.membersCount" hide-details single-line type="number" style="width: 60px" autocomplete="off")
                v-slider.flex.items-center(value.sync="createBookingForm.form.kidsCount" :disabled="createBookingForm.fixedMembersCount" @change="i => createBookingForm.form.kidsCount=i" max=5 min=0 ticks="always" tick-size="4" hide-details)
                  template(v-slot:label)
                    p.w-12 儿童数
                  template(v-slot:append)
                    v-text-field.mt-0.pt-0(v-model="createBookingForm.form.kidsCount" hide-details single-line type="number" style="width: 60px" autocomplete="off")
                v-slider.flex.items-center(value.sync="createBookingForm.form.socksCount" @change="i => createBookingForm.form.socksCount=i" max=5 min=0 ticks="always" tick-size="4" hide-details)
                  template(v-slot:label)
                    p.w-12 袜子数
                  template(v-slot:append)
                    v-text-field.mt-0.pt-0(v-model="createBookingForm.form.socksCount" hide-details single-line type="number" style="width: 60px" autocomplete="off")
                .flex.items-center
                  v-select(v-if="createBookingForm.useCode" :items="createBookingForm.user.codes" clearable hide-details label="券码" :item-text="i => `${i.title} ID: ${$_.get(i,'id','').substr(-6).toUpperCase()}`" :item-value="i => i" :item-disabled="i => i.used" v-model="createBookingForm.code")                
                  v-select(v-else :items="coupons" hide-details clearable label="优惠" item-text="name" :item-value="i => i" v-model="createBookingForm.coupon")
                  v-switch.ml-2(v-model="createBookingForm.useCode" label="" hide-details)
            .flex(style="margin-top:14px;margin-bottom:-4px;min-height:60px")
              v-bottom-navigation.mr-2.mt-1(v-model="createBookingForm.form.paymentGateway" grow icons-and-text v-if="createBookingForm.price > 0 && paymentGateway !== 'credit'" style="box-shadow:none;flex:1")
                v-btn.px-0(v-for="item in createBookingForm.paymentGateways" :key="item.value" :value="item.value")
                  span {{item.label}}
                  v-icon {{item.icon}}
              .flex.mt-0.justify-end.align-end(style="height:56px")
                .mr-5.text-lg.my-0
                  span.text-orange-600 收款 ￥{{createBookingForm.price}}
                  .text-orange-400.text-sm 会员卡: ￥{{creditPrice}} / 现场支付: ￥{{createBookingForm.price-creditPrice}}
                v-btn(color="primary" :disabled="!createBookingForm.valid"  @click="createBooking" :loading="createBookingForm.loading_createBooking || this.createBookingForm.loading_price") 创建订单
            v-bottom-sheet(v-model="createBookingForm.confirm" persistent)
              v-sheet.px-10.flex.items-center(height="100px")
                .w-full
                  .mr-5.text-lg.my-0
                    span.text-orange-600 ￥{{createBookingForm.price}}元
                    span.ml-2.text-orange-400.text-sm 会员卡: {{creditPrice}}元 / 现场支付: {{createBookingForm.price-creditPrice}}元
                  v-btn.w-full(block color="primary"  @click="comfirmPayment" :loading="createBookingForm.loading_confirm") 确认收款完成
        //- 签到
        v-form(v-model="checkInForm.valid" ref="checkInForm" v-if="step == 'checkIn'" @submit.native.prevent)
          v-card.py-4.px-7
            v-text-field(autocomplete="off" v-for="(item, index) in checkInForm.booking.membersCount + checkInForm.booking.kidsCount" :key="index" :label="`玩家${index+1}手环号`" v-model="checkInForm.bandIds[index]" required :rules="[v => !!v || '请点击后用读卡器识别手环号', v => v && v.length === 10 || '请确保手环编号为10位数']")
            v-btn(color="primary" :disabled="!checkInForm.valid" @click="handleCheckIn" :loading="checkInForm.loading") 绑定手环并打印小票
            //- v-btn.ml-2(color="warning" @click="handlePrintBookingOnly") 仅打印小票


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
import { helpers } from "../../utils/helper";
const { $App } = window;

export default {
  data() {
    return {
      today: moment().format("YYYY-MM-DD"),
      step: "searchUser",
      topupForm: {
        confirm: false,
        loading_confirm: false,
        depositLevel: {},
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
        gender: 0,
        loading: false
      },
      createBookingForm: {
        form: {
          type: "play",
          date: moment().format("YYYY-MM-DD"),
          hours: 1,
          membersCount: 1,
          kidsCount: 0,
          socksCount: 0,
          paymentGateway: "scan"
        },
        user: {
          mobile: "",
          credit: 0
        },
        coupon: {},
        code: {},
        useCode: false,
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
      },
      countries: ["日本", "韩国", "澳大利亚", "美国", "加拿大", "新加坡", "泰国", "马来西亚", "印度", "英国", "德国", "法国", "意大利"]
    };
  },
  computed: {
    paymentGateway() {
      if (this.createBookingForm.user.credit > this.createBookingForm.price) {
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
    "createUserForm.idCardNo"(val) {
      if (val.length === 18) {
        this.createUserForm.gender = val.substr(16, 1) % 2 === 1 ? 1 : 2;
      }
    },
    "createBookingForm.useCode"() {
      if (this.createBookingForm.coupon.slug) {
        this.createBookingForm.coupon = {};
      }
      if (this.createBookingForm.code.id) {
        this.createBookingForm.code = {};
      }
    },
    "createBookingForm.form": {
      async handler(newVal, oldVal) {
        if (!oldVal) return;
        clearTimeout(this.getPriceTimeout);
        this.getPriceTimeout = this.updatePrice();
      },
      immediate: true,
      deep: true
    },
    "createBookingForm.code"(val) {
      const { hours, id, membersCount, kidsCount } = val || {};
      this.createBookingForm.form.hours = id ? hours || 0 : 1;
      this.createBookingForm.form.membersCount = membersCount;
      this.createBookingForm.form.kidsCount = kidsCount;
      this.createBookingForm.fixedHours = id ? true : false;
      if (val) {
        this.createBookingForm.form.membersCount = val.membersCount || 1;
      }
      this.updatePrice();
    },
    "createBookingForm.coupon"(val) {
      const { fixedHours, fixedMembersCount, hours, membersCount, slug } = val || {};
      this.createBookingForm.form.hours = slug ? hours || 0 : 1;
      this.createBookingForm.form.membersCount = membersCount || 1;
      this.createBookingForm.fixedHours = fixedHours || false;
      this.createBookingForm.fixedMembersCount = fixedMembersCount || false;
      this.updatePrice();
    },
    async "searchUserForm.searchText"(val) {
      const { searchText, loading } = this.searchUserForm;
      if (loading || !searchText || searchText.length < 4) return;
      this.searchUserForm.loading = true;
      const [err, res] = await helpers.runAsync(findUser({ keyword: searchText }));
      this.searchUserForm.loading = false;

      if (err) {
        return (this.searchUserForm.loading = false);
      }
      // console.log(res.data);
      this.searchUserForm.items = res.data;
    },
    async "searchUserForm.user"(val) {
      const { bookings_loading } = this.searchUserForm;
      if (bookings_loading || !val) return;
      this.searchUserForm.bookings_loading = true;
      //TODO: store id
      let res;
      // if (config.IS_PROD) {
      res = await findBookings({ customer: val.id, date: this.today, store: this.currentStore.id, status: "BOOKED" });
      // } else {
      //   res = await findBookings({ customer: val.id });
      // }
      this.searchUserForm.bookings = res.data;
      this.searchUserForm.bookings_loading = false;
    }
  },
  beforeMount() {
    this.parseQuery();
  },
  methods: {
    async parseQuery() {
      const { userId } = this.$route.query;
      if (userId) {
        const { data: user } = await getUser({ id: userId });
        this.searchUserForm.user = user;
      }
    },
    async updatePrice() {
      if (this.createBookingForm.loading_price) return;
      this.createBookingForm.loading_price = true;
      let { type, date, checkInAt, membersCount, kidsCount, socksCount, hours } = this.createBookingForm.form;
      const { id: customerId } = this.createBookingForm.user;
      const { slug } = this.createBookingForm.coupon || {};
      const { id: code } = this.createBookingForm.code || {};

      const { paymentGateway } = this;

      const [err, res] = await helpers.runAsync(
        getBookingPrice({
          store: this.currentStore.id,
          type,
          date,
          hours,
          code,
          coupon: slug,
          customer: customerId,
          checkInAt: moment().format("HH:mm"),
          membersCount,
          kidsCount,
          socksCount,
          useCredit: paymentGateway == "credit",
          paymentGateway
        })
      );
      this.createBookingForm.loading_price = false;
      if (err) {
        return (this.createBookingForm.loading_price = false);
      }
      this.createBookingForm.price = res.data.price;
    },
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
      const [err, { data: payment }] = await helpers.runAsync(userDeposit({ id, depositLevel, paymentGateway }));
      this.topupForm.loading = false;
      if (err) {
        return;
      }
      this.topupForm.payment = payment;
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
      const [err, res] = await helpers.runAsync(updatePayment({ paid: true, id }));
      this.topupForm.loading_confirm = false;
      if (err) {
        return;
      }

      this.topupForm.confirm = false;
      this.refreshSearchUser();
    },
    async handleBindCardNo() {
      this.searchUserForm.bindCard_loading = true;
      const { cardNo } = this.searchUserForm;
      const { id } = this.searchUserForm.user;
      const [err, res] = await helpers.runAsync(updateUser({ cardNo, id }));
      this.searchUserForm.bindCard_loading = false;
      if (err) {
        return;
      }
      this.searchUserForm.user.cardNo = res.data.cardNo;
    },
    goCreateUser() {
      Object.assign(this.createUserForm, { mobile: "", username: "", gender: 0 });
      this.step = "createUser";
    },
    async createBookingFromSearchUser() {
      this.createBookingForm.user = this.searchUserForm.user;
      this.step = "createBooking";
    },
    async createUser() {
      const { mobile, username, gender, idCardNo } = this.createUserForm;
      const res = await signup({ username, gender, mobile, idCardNo });
      this.searchUserForm.user = res.data;
      this.refreshSearchUser();
    },
    async updateUser() {
      const { id } = this.searchUserForm.user;
      const { idCardNo, isForeigner, country } = this.createUserForm;
      const res = await updateUser({ id, idCardNo, isForeigner, country });
      this.searchUserForm.user = res.data;
      this.refreshSearchUser();
    },
    goCheckIn(booking) {
      this.checkInForm.booking = booking;
      this.step = "checkIn";
    },
    async createBooking() {
      this.createBookingForm.loading_createBooking = true;
      let { type, date, checkInAt, membersCount, kidsCount, socksCount, hours } = this.createBookingForm.form;
      const { id: customerId } = this.createBookingForm.user;
      const { slug } = this.createBookingForm.coupon || {};
      const { id: code } = this.createBookingForm.code || {};
      const { paymentGateway } = this;
      const [err, res] = await helpers.runAsync(
        createBooking({
          store: this.currentStore.id,
          type,
          date,
          hours,
          code,
          coupon: slug,
          customer: customerId,
          checkInAt: moment().format("HH:mm:ss"),
          membersCount,
          kidsCount,
          socksCount,
          useCredit: true,
          paymentGateway: paymentGateway == "credit" ? null : paymentGateway
        })
      );
      this.createBookingForm.loading_createBooking = false;
      if (err) {
        return;
      }
      const { payments, price, id: businessId } = res.data;
      const [payment] = payments.filter(p => !["coupon", "code"].includes(p.gateway));
      this.createBookingForm.newBooking = res.data;
      if (!payment) {
        return this.goCheckIn(this.createBookingForm.newBooking);
      }

      switch (paymentGateway) {
        case "scan":
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

      const [err, res] = await helpers.runAsync(updateBooking({ id, bandIds }));
      this.checkInForm.loading = false;
      if (err) {
        return (this.checkInForm.loading = false);
      }

      await bookingPrint({ id });
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

      const [err, res] = await helpers.runAsync(updatePayment({ paid: true, id }));
      this.createBookingForm.loading_confirm = false;
      if (err) {
        return;
      }

      this.createBookingForm.confirm = false;
      this.goCheckIn(this.createBookingForm.newBooking);
    },
    getDropDownText(i) {
      return `${i.checkInAt}-${i.hours ? i.hours + "小时" : "畅玩"}-${i.membersCount}人`;
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

<style scoped>
* >>> .v-input--switch label {
  width: 2em;
}
* >>> .deposit-levels .v-btn__content {
  display: block;
}
* >>> .deposit-levels.v-btn-toggle > .v-btn.v-size--default {
  height: 70px !important;
}
</style>
