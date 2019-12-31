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
  methods: {
    onLoad() {
      console.log("test onLoad")
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
  },
})


