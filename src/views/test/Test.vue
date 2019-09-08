<template lang="pug">
  v-container
    v-card.p-10
      v-form
        v-select(label="交易类型" v-model="type" :items="items" item-text="label" item-value="value" @change="selectType")
        v-text-field(v-if="['refund','consume'].includes(type)" label="应用类型" v-model="form.appType" clearable)
        v-text-field(v-if="['refund','consume'].includes(type)" label="应用包名" v-model="form.appId" clearable)
        v-text-field(v-if="['refund','consume'].includes(type)" label="交易类型" v-model="form.transType" clearable)
        v-text-field(v-if="['refund','consume'].includes(type)" label="交易金额" v-model="form.amount" clearable)
        v-text-field(v-if="['refund','consume'].includes(type)" label="Saas软件订单号" v-model="form.orderId" clearable)
        v-text-field(v-if="['refund','consume'].includes(type)" label="Saas系统业务订单号" v-model="form.businessId" clearable)
        v-text-field(v-if="['refund'].includes(type)"  label="原收银台流水号" v-model="form.oriMisId" clearable)
        v-text-field(v-if="['refund'].includes(type)"  label="原Saas软件订单号" v-model="form.oriOrderId" clearable)
        v-text-field(v-if="['refund'].includes(type)"   label="原商户订单号" v-model="form.oriPlatformId" clearable)

        v-text-field(v-if="['consume'].includes(type)" label="商品信息" v-model="form.orderInfo" clearable)
        v-text-field(v-if="[,'consume'].includes(type)"  label="支付吗" v-model="form.payCode" clearable)
        v-checkbox(v-if="['refund','consume'].includes(type)" label="是否显示UI界面" v-model="form.config.processDisplay" clearable)
        v-checkbox(v-if="['refund','consume'].includes(type)" label="是否展示交易结果页" v-model="form.config.resultDisplay" clearable)
        v-checkbox(v-if="['refund','consume'].includes(type)" label="是否打印小票" v-model="form.config.printTicket" clearable)
        v-text-field(v-if="['refund','consume'].includes(type)" label="指定签购单上的退款订单号类型" v-model="form.config.printIdType" clearable)
        v-text-field(v-if="['refund','consume'].includes(type)" label="备注" v-model="form.config.remarks" clearable)
        v-btn(v-if="['refund','consume'].includes(type)" block color="primary" @click="debug") 测试
        v-btn.mt-5(v-if="['refund','consume'].includes(type)" block color="success" @click="debugDrawer") 打开钱箱
      p(v-if="['refund','consume'].includes(type)") {{msg}}

      v-text-field(v-if="['print'].includes(type)" label="venderId" v-model="printForm.venderId" clearable)
      v-text-field(v-if="['print'].includes(type)" label="内容" v-model="printForm.content" clearable)
      v-select(v-if="['print'].includes(type)" label="编码" v-model="printForm.encodingType" :items="printForm.encoding" clearable)
      v-btn.mt-5(v-if="['print'].includes(type)" block color="success" @click="print") 打印
      v-btn.mt-5(v-if="['print'].includes(type)" block color="warning" @click="getUSBDevices") 获取usb设备
      p(v-if="['print'].includes(type)") {{printForm.msg}}

      



</template>

<script>
import { _ } from "../../utils/lodash";
import { sendPaymentToSunmi } from "../../services/payment";
import EscPosEncoder from "@xinghe/esc-pos-encoder";
import { Buffer } from "buffer/";
import { encode } from "fast-gbk";

let encoder = new EscPosEncoder();

export default {
  name: "Test",
  data() {
    return {
      items: [{ value: "consume", label: "消费" }, { value: "refund", label: "退款" }, { value: "print", label: "打印" }],
      type: "consume",
      printForm: {
        venderId: "26728",
        msg: "",
        encodingType: "cp860",
        content: "1234abcd",
        encoding: [
          "cp437",
          "cp737",
          "cp850",
          "cp775",
          "cp852",
          "cp855",
          "cp857",
          "cp858",
          "cp860",
          "cp861",
          "cp862",
          "cp863",
          "cp864",
          "cp865",
          "cp866",
          "cp869",
          "cp936",
          "cp949",
          "cp950",
          "cp1252",
          "iso88596",
          "shiftjis",
          "windows1250",
          "windows1251",
          "windows1252",
          "windows1253",
          "windows1254",
          "windows1255",
          "windows1256",
          "windows1257",
          "windows1258"
        ]
      },
      form: {
        appType: "01",
        appId: "com.kangazone.shop",
        transType: "00",
        amount: "1",
        orderId: "1234",
        businessId: "1234",
        orderInfo: "1234",
        oriMisId: null,
        oriOrderId: null,
        oriPlatformId: null,
        payCode: null,
        config: {
          processDisplay: true,
          resultDisplay: true,
          printTicket: true,
          printIdType: null,
          remarks: null
        }
      },
      msg: "哈哈"
    };
  },
  created() {},
  mounted() {},
  methods: {
    getUSBDevices() {
      const res = $App.jsGetAllUSBDevices();
      this.printForm.msg = res;
    },
    print() {
      let result = encoder
        .initialize()
        .codepage(this.printForm.encodingType)
        .line(encode(this.printForm.content))
        .encode();
      console.log(encode(this.printForm.content));
      console.log(result);

      result = Buffer.from(result).toString("hex"); //?
      console.log(result);

      $App.jsPrint(this.printForm.venderId, result);
    },
    selectType(val) {
      if (val == "refund") {
        this.form.transType = "09";
      }
      if (val == "consume") {
        this.form.transType = "00";
      }
    },
    async debug() {
      let { amount, orderId, businessId } = this.form;
      const data = await sendPaymentToSunmi({ amount, orderId, businessId });
      this.msg = data;
    },
    debugDrawer() {
      $App.jsOpenDrawer();
    }
  }
};
</script>

<style scoped>
</style>
