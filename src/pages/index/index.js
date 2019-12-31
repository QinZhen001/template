const {xhw, xhwApi} = require("../../core/index")
const pagePlguin = require("../../plugins/pagePlguin")
const pagePlguin2 = require("../../plugins/pagePlguin2")


function consume() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({
        aaa: "aaa",
        bbb: {
          xxx: "xxx",
        },
      })
    }, 3000)
  })
}

xhw.pageComponent({
  data: {
    foo: {
      bar: {
        a: ['a', 'b'],
        b: 2,
        c: ['x', 'y'],
        e: 100, // deleted
      },
    },
    buzz: 'world',
  },
  methods: {
    preLoad(data) {
      console.log("index preLoad", data, this)
      debugger
    },
    onLoad() {
      console.log("onLoad", this.$store.get())
    },
    onShow() {
      console.log("onShow", this)
    },
    onHide() {
      console.log("onHide")
    },
    onUnload() {
      console.log("onUnload")
    },
    testNormalRequest() {
      console.log("testNormalRequest")
      xhw.request("testNormal")
    },
    testWaitRequest() {
      console.log("testWaitRequest")
      xhw.request("testWait").then(res => console.log("testWait1", res))
      xhw.request("testWait").then(res => console.log("testWait2", res))
      xhw.request("testWait").then(res => console.log("testWait3", res))
      xhw.request("testWait").then(res => console.log("testWait4", res))
      xhw.request("testWait").then(res => console.log("testWait5", res))
    },
    testQueueRequest() {
      console.log("testQueueRequest")
      xhw.request("testQueue").then(res => console.log("testQueue1", res))
      xhw.request("testQueue").then(res => console.log("testQueue2", res))
      xhw.request("testQueue").then(res => console.log("testQueue3", res))
      xhw.request("testQueue").then(res => console.log("testQueue4", res))
      xhw.request("testQueue").then(res => console.log("testQueue5", res))
    },
    testRetry() {
      xhw.request("testRetry").then(
        res => console.log("testRetry", res),
        res => {
          console.log("testRetry rejjjjj", res)
        })
    },
    async testPreloadSync() {
      let res = await xhwApi.navigateTo({
        url: "/pages/test/index",
        preGet: {
          aaa: "aaa",
          bbb: "bbb",
        },
      })
      console.log("testPreloadSync success", res)
    },
    async testPreloadAsync() {
      let res = await xhwApi.navigateTo({
        url: "/pages/test/index",
        preGet: async () => {
          return consume()
        },
      })
      console.log("testPreloadAsync success", res)
    },
    commitState() {
      this.$store.set("model", "ttt")
    },
    getStateSync() {
      let model = this.$store.get("model")
      console.log("getStateSync model", model)
    },
    async getStateAsync() {
      let openId = await this.$store.getAsync("openId")
      console.log("getStateAsync openId", openId)
    },
    testConsole() {
      console.log("loglogloglog")
      console.debug("debugdebugdebugdebug")
      console.info("infoinfovinfo")
      console.warn("warnwarnwarnv")
      console.error("errorerrorverrorerror")
    },
    testDiff() {
      this.$diff({
        foo: {
          bar: {
            a: ['a'],
            b: 2,
            c: ['x', 'y', 'z'],
            d: 'Hello, world!',
          },
        },
        buzz: 'fizz',
      }, () => {
        console.log("setData success")
      })
    },
  },
  plugins: [pagePlguin],
})


// xhw.page({
//   onLoad() {
//     console.log("onLoad11111", this.$launch)
//     this.$launch.xxx()
//   },
//   onShow() {
//     console.log("onShow", this)
//   },
//   plugins: [
//     pagePlguin,
//     pagePlguin2,
//   ],
// })
