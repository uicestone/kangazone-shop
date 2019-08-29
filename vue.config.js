module.exports = {
  css: {
    loaderOptions: {
      postcss: {
        plugins: [
          require("tailwindcss")("./tailwind.js"),
          // require("postcss-pxtorem")({
          //   rootValue: 50,
          //   propWhiteList: [],
          //   minPixelValue: 2
          // }),
          require("autoprefixer")()
        ]
      }
    }
  }
};
