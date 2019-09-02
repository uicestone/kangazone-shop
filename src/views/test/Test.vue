<template lang="pug">

    div
        p {{msg}}


</template>

<script>
  export default {
    name: "Test",
    data() {
      return {
        msg: "哈哈"
      }
    },
    created(){
      this.showAndroidToast()
    },
    mounted() {
      //将要给原生调用的方法挂载到 window 上面
      window.callJsFunction = this.callJsFunction
    },
    methods: {
      callJsFunction(str) {
        this.msg = str;
        return "js调用成功"
      },
      showAndroidToast() {
        $App.jsCallAndroid("")
      }
    }
  };
</script>

<style scoped>

</style>
