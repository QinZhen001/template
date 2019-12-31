import testBehavior from "../../behaviors/testBehavior"

const {xhw} = require("../../core/index")


xhw.component({
  behaviors: [testBehavior],
  created() {
    console.log("advert component created", this)
  },
})
