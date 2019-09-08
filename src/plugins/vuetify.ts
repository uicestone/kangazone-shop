import Vue from "vue";
import Vuetify from "vuetify/lib";
import zhHans from "vuetify/src/locale/zh-Hans";

Vue.use(Vuetify);

export default new Vuetify({
  lang: {
    locales: { zhHans },
    current: "zh-Hans"
  },
  icons: {
    iconfont: "mdi"
  },
  theme: {
    dark: true,
    themes: {
      dark: {
        primary: "#E08631",
        secondary: "#361936",
        accent: "#F2BF42"
      }
    }
  }
  // breakpoint: {
  //   thresholds: {
  //     xs: 170,
  //     sm: 270,
  //     md: 400,
  //     lg: 640
  //   },
  //   scrollBarWidth: 24
  // }
});
