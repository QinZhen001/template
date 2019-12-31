import {isNumber, isString, logger} from "../../shared/util"

const CONSOLE_LEVEL = {
  1: "log",
  2: "debug",
  3: "info",
  4: "warn",
  5: "error",
}


const LEVELS = []

for (let key in CONSOLE_LEVEL) {
  LEVELS.push(CONSOLE_LEVEL[key])
}


function noop() {

}


// --------------------------------------------------------

function _getFinLevel(level) {
  if (isNumber(level)) {
    let finLevel = CONSOLE_LEVEL[level]
    if (!finLevel) {
      throw new Error(logger(`$consoleLevel ${level} is not exist`))
    }
    return finLevel
  } else if (isString(level)) {
    if (LEVELS.indexOf(level) === -1) {
      throw new Error(logger(`$consoleLevel ${level} is not exist`))
    }
    return level
  } else {
    throw new Error(logger(`$consoleLevel need a string or number`))
  }
}


// ------------------------------------------------------------

export function initConsole(vm) {
  let level = vm.$consoleLevel
  if (!level) {
    return
  }
  level = _getFinLevel(level)
  const levelIndex = LEVELS.indexOf(level)
  for (let i = 0; i < LEVELS.length; i++) {
    if (i < levelIndex) {
      console[LEVELS[i]] = noop
    }
  }
}
