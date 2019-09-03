import { _ } from '../../utils/lodash';
<template lang="pug">
  v-container
    v-card.p-10
      v-form
        v-select(label="交易类型" v-model="type" :items="items" item-text="label" item-value="value" @change="selectType")
        v-text-field(label="应用类型" v-model="form.appType" clearable)
        v-text-field(label="应用包名" v-model="form.appId" clearable)
        v-text-field(label="交易类型" v-model="form.transType" clearable)
        v-text-field(label="交易金额" v-model="form.amount" clearable)
        v-text-field(label="Saas软件订单号" v-model="form.orderId" clearable)
        v-text-field(label="Saas系统业务订单号" v-model="form.businessId" clearable)
        v-text-field(v-if="type=='refund'" label="原收银台流水号" v-model="form.businessId" clearable)
        v-text-field(v-if="type=='refund'" label="原Saas软件订单号" v-model="form.oriOrderId" clearable)
        v-text-field(v-if="type=='refund'"  label="原商户订单号" v-model="form.oriPlatformId" clearable)

        v-text-field(v-if="type=='consume'" label="商品信息" v-model="form.orderInfo" clearable)
        v-text-field(v-if="type=='consume'"  label="支付吗" v-model="form.payCode" clearable)
        v-checkbox(label="是否显示UI界面" v-model="form.config.processDisplay" clearable)
        v-checkbox(label="是否展示交易结果页" v-model="form.config.resultDisplay" clearable)
        v-checkbox(label="是否打印小票" v-model="form.config.printTicket" clearable)
        v-text-field(label="指定签购单上的退款订单号类型" v-model="form.config.printIdType" clearable)
        v-text-field(label="备注" v-model="form.config.remarks" clearable)
        v-btn(block @click="debug") 测试
      p {{msg}}


</template>

<script>
export default {
  name: "Test",
  data() {
    return {
      items: [{ value: "consume", label: "消费" }, { value: "refund", label: "退款" }],
      type: "consume",
      form: {
        appType: "01",
        appId: "com.kangazone.shop",
        transType: "00",
        amount: "1",
        orderId: "1234",
        businessId: "12345",
        orderInfo: "1234",
        oriMisId: "1234",
        oriOrderId: "1234",
        oriPlatformId: "1234",
        payCode: "",
        config: {
          processDisplay: true,
          resultDisplay: true,
          printTicket: true,
          printIdType: "",
          remarks: ""
        }
      },
      msg: "哈哈"
    };
  },
  created() {},
  mounted() {
    //将要给原生调用的方法挂载到 window 上面
    window.sendJSMessage = this.sendJSMessage;
  },
  methods: {
    selectType(val) {
      if (val == "refund") {
        this.form.transType = "09";
      }
      if (val == "consume") {
        this.form.transType = "00";
      }
    },
    sendJSMessage(str) {
      this.msg = str;
      return "js调用成功";
    },
    debug() {
      let { form } = this;
      form = _.omitBy(form, _.isNil);
      form.config = _._.omitBy(form.config, _.isNil);
      $App.jsCallAndroid(JSON.stringify(form));
    }
  }
};
</script>

<style scoped>
</style>
