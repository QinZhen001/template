const car = require("./template/car")
const apple = require("./template/apple")

module.exports = {
  car: {
    type: "post",
    template: car,
  },
  apple: {
    type: "post",
    template: apple,
  },
}
