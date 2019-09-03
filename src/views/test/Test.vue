<template lang="pug">
  v-container
    v-card.p-10
      v-form
        v-text-field(label="应用类型" v-model="form.appType" clearable)
        v-text-field(label="应用包名" v-model="form.appId" clearable)
        v-text-field(label="交易类型" v-model="form.transType" clearable)
        v-text-field(label="交易金额" v-model="form.amount" clearable)
        v-text-field(label="Saas软件订单号" v-model="form.orderId" clearable)
        v-text-field(label="商品信息" v-model="form.orderInfo" clearable)
        v-text-field(label="支付吗" v-model="form.payCode" clearable)
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
      form: {
        appType: "01",
        appId: "com.kangazone.shop",
        transType: "00",
        amount: "1",
        orderId: "1234",
        orderInfo: "1234",
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
    sendJSMessage(str) {
      this.msg = str;
      return "js调用成功";
    },
    debug() {
      const { form } = this;
      $App.jsCallAndroid(JSON.stringify(form));
    }
  }
};
</script>

<style scoped>
</style>
