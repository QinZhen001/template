import {isFunction, logger} from "../util/index"

function _check(name, rule) {
  if (!name) {
    throw new Error(logger(`filter need a name`))
  }
  if (!rule) {
    throw new Error(logger(`filter need a rule`))
  }
  if (!isFunction(rule)) {
    throw new Error(logger(`filter rule is not a function`))
  }
}

class Filter {
  constructor({name, rule}) {
    _check(name, rule)
    this.name = name
    this.rule = rule
  }
}
