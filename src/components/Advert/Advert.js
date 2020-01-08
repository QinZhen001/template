import testBehavior from "../../behaviors/testBehavior"
import {xhw} from "@xhw/core"

// import {xhw} from "../../core/index"


xhw.component({
  behaviors: [testBehavior],
  created() {
    console.log("advert component created", this)
  },
})
