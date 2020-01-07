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
    test: {
      a: "a",
      b: "b",
    },
  },
  computed: {
    testComputed(scope) {
      console.log("scope", scope)
      debugger
      return this.bbb + "asd"
    },
  },
  methods: {
    onLoad() {
      console.log("aaa", this)
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
      console.log("loasd")
    },
  },
})


