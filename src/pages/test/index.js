const {xhw, xhwApi} = require("../../core/index")

function consume() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({
        test: {
          a: "a",
          b: "b",
        },
      })
    }, 3000)
  })
}


xhw.pageComponent({
  use: [
    "fff",
    "bbb",
  ],
  data: {
    bbb: "同名会被store覆盖",
  },
  computed: {
    testComputed(scope) {
      console.log("scope", scope)
      debugger
      return this.bbb + " computed"
    },
  },
  methods: {
    onLoad() {
      console.log("onLoad", this)
      debugger
    },
    onShow() {
      this.setData({
        test: JSON.stringify(this.data.test),
      })
    },
    preLoad(data) {
      console.log("test page preLoad", data)
      debugger
    },
    onUnload() {
      console.log("test onUnload")
    },
    preLoadNB() {
      debugger
      console.log("preLoadNB")
      xhwApi.navigateBack({
        // preGet: async () => {
        //   return consume()
        // },
        preGet: {
          aaa: "aaa",
        },
      })
    },
    changeStore() {
      const round = Math.ceil(Math.random() * 10);
      this.$store.set("bbb", `更改bbb${round}`)
      debugger
    },
    navToStore() {
      console.log("navToStore")
      wx.navigateTo({
        url: "/pages/store/index",
      })
    },
  },
})


