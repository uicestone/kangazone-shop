<template lang="pug">
  div
    v-app-bar( color="#6A76AB" dark)
      v-app-bar-nav-icon(@click="$router.go(-1)")
        v-icon mdi-chevron-left
      v-toolbar-title 创建订单
    v-container.flex.justify-center.items-center.h-screen
      v-card
        v-toolbar(flat color="grey lighten-4" dense v-if="step !== 0")
          v-btn(icon @click="step = 0")
            v-icon mdi-arrow-left
        div.p-10
          v-form(ref="searchUserForm" v-if="step == 0")
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
                item-value="id"
                @change="goChecIn"
                ) 
          v-form(v-model="createUserForm.valid" ref="createUserForm" v-if="step == 1")
            v-text-field(label="手机号" v-model="createUserForm.mobile" required :rules="[v => !!v || '请输入手机号']" clearable)
            v-text-field(label="用户名" v-model="createUserForm.username" required :rules="[v => !!v || '请输入用户名']" clearable)
            v-radio-group(row v-model="createUserForm.gender" required)
              v-radio(label="男" value="1")
              v-radio(label="女" value="2")
            div
              v-btn(color="primary" :disabled="!createUserForm.valid" @click="createBookingFromCreaetUser") 创建预约
          v-form(v-model="createBookingForm.valid" ref="createBookingForm" v-if="step == 2")
            v-text-field(label="手机号" v-model="createBookingForm.mobile" required disabled)
            v-select(label="类型" v-model="createBookingForm.type" :items="configs.bookingTypes" item-text="label" item-value="value")
            v-menu
              template(v-slot:activator="{on}")
                v-text-field(label="选择日期" v-on="on"  v-model="createBookingForm.date")
              v-date-picker(v-model="createBookingForm.date")
            v-text-field(label="人数" v-model="createBookingForm.membersCount" required :rules="[v => !!v || '请输入人数']")
            v-text-field(label="时长" v-model="createBookingForm.hours" required :rules="[v => !!v || '请输入时长']")
            v-text-field(label="袜子数" v-model="createBookingForm.socksCount" required :rules="[v => !!v || '请输入袜子数']")
            div
              v-btn(color="primary" :disabled="!createBookingForm.valid" :loading="createBookingForm.loading" @click="handleBooking") 收款
          v-form(v-model="checkInForm.valid" ref="checkInForm" v-if="step == 3")
            v-text-field(label="手环号" v-model="createBookingForm.bandCode" required disabled)
          


</template>

<script>
import { signup, User } from "../../services";
import { findUser } from "../../services/user";
import { sync } from "vuex-pathify";
import { findBookings } from "../../services/booking";
import { moment } from "../../utils/moment";
import { config } from "../../../config";

export default {
  data() {
    return {
      today: moment().format("YYYY-MM-DD"),
      step: 0,
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
        type: "play",
        date: moment().format("YYYY-MM-DD"),
        hours: 1,
        mobile: "",
        membersCount: 1,
        socksCount: 1,
        loading: false
      },
      checkInForm: {
        bookingId: "",
        bandCode: ""
      }
    };
  },
  computed: {
    configs: sync("configs"),
    userValid() {
      if (!this.searchUserForm.user) return false;
      return this.searchUserForm.user.mobile;
    }
  },
  watch: {
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
        res = await findBookings({ customer: val.id, date: this.today });
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
      this.step = 1;
    },
    async createBookingFromSearchUser() {
      this.createBookingForm.mobile = this.searchUserForm.user.mobile;
      this.step = 2;
    },
    async createBookingFromCreaetUser() {
      const { mobile, username, gender } = this.createUserForm;
      const res = await signup({ username, gender, mobile });
      this.createBookingForm.mobile = this.createUserForm.mobile;
      this.step = 2;
    },
    goChecIn(bookingId) {
      this.checkInForm.bookingId = bookingId;
      this.step = 3;
    },
    handleBooking() {
      this.createBookingForm.loading = true;
    },
    getDropDownText(i) {
      return `${i.checkInAt}-${i.hours}小时-${i.membersCount}人`;
    }
  }
};
</script>

<style>
</style>