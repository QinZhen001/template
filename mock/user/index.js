const info = require("./template/info")
const openId = require("./template/openId")

module.exports = {
  info: {
    type: "POST",
    template: info,
  },
  openId: {
    type: "POST",
    template: openId,
  },
}
