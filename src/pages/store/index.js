import {xhw, xhwApi} from "@xhw/core"
// const {xhw, xhwApi} = require("../../core/index")

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
      return this.bbb + " store computed"
    },
  },
  methods: {
    changeStore() {
      const round = Math.ceil(Math.random() * 10);
      this.$store.set("bbb", `更改会影响到test页面${round}`)
      debugger
    },
  },
})


