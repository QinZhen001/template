import XhwRequest from "./xhwRequest"
import {extend} from "../shared/util"

function createInstance() {
  console.log("createInstance createInstance")
  const context = new XhwRequest()
  const instance = XhwRequest.prototype.request.bind(context)
  extend(instance, context)
  return instance
}


export const request = createInstance()


