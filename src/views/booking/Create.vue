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
          v-form(ref="form0" v-if="step == 0")
            v-text-field(label="手机号" v-model="form0.mobile" required :rules="[v => !!v || '请输入手机号']")
            div.flex.justify-center
              v-btn(color="blue-grey" dark v-if="!userValid" @click="createUser") 创建用户
              v-btn(color="primary"  v-if="userValid" @click="createBookingFromStep0") 创建预约
              v-btn.ml-4(color="success" v-if="userValid" @click="createBookingFromStep0") 签到
          v-form(v-model="form1.valid" ref="form1" v-if="step == 1")
            v-text-field(label="手机号" v-model="form1.mobile" required :rules="[v => !!v || '请输入手机号']")
            v-text-field(label="用户名" v-model="form1.username" required :rules="[v => !!v || '请输入用户名']")
            v-radio-group(row v-model="form1.gender" required)
              v-radio(label="男" value="male")
              v-radio(label="女" value="femail")
            div
              v-btn(color="primary" :disabled="!form1.valid" @click="createBookingFromStep1") 创建预约
          v-form(v-model="form2.valid" ref="form2" v-if="step == 2")
            v-select(label="类型" v-model="form2.type" :items="bookingTypes" item-text="label" item-value="value")
            v-menu
              template(v-slot:activator="{on}")
                v-text-field(label="选择日期" v-on="on"  v-model="form2.date")
              v-date-picker(v-model="form2.date")
            v-text-field(label="人数" v-model="form2.membersCount" required :rules="[v => !!v || '请输入人数']")
            v-text-field(label="时长" v-model="form2.hours" required :rules="[v => !!v || '请输入时长']")
            v-text-field(label="袜子数" v-model="form2.socksCount" required :rules="[v => !!v || '请输入袜子数']")
            div
              v-btn(color="primary" :disabled="!form2.valid") 收款
          


</template>

<script>
import moment from "moment";

export default {
  data() {
    return {
      step: 0,
      form0: {
        mobile: ""
      },
      form1: {
        valid: false,
        mobile: "",
        username: "",
        gender: "male"
      },
      form2: {
        type: "play",
        date: moment().format("YYYY-MM-DD"),
        hours: 1,
        membersCount: 1,
        socksCount: 1
      },
      bookingTypes: [{ value: "play", label: "计时" }, { value: "party", label: "派对" }, { value: "group", label: "团建" }]
    };
  },
  computed: {
    userValid() {
      return this.form0.mobile;
    }
  },
  methods: {
    createUser() {
      Object.assign(this.form1, { mobile: "", username: "", gender: "male" });
      this.step = 1;
    },
    createBookingFromStep0() {
      this.step = 2;
    },
    createBookingFromStep1() {
      this.step = 2;
    }
  }
};
</script>

<style>
</style>