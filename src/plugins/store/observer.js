import {isArray, isFunction, isInArray, isObject, nan} from "./util";
import {arrMethods, triggerStr} from "./constant";


function _getRootName(prop, path) {
  if (path === '#') {
    return prop
  }
  return path.split('-')[1]
}

/**
 * 在需要的观察的数据中的每一层数据都添加$observeProps
 * $observeProps中包含：$observerPath
 */
class Observer {
  // constructor() {
  // }

  observe(target, callback) {
    if (isArray(target)) {
      if (!target.length) {
        this.track(target)
      } else {
        this.mock(target)
      }
    }
    if (isObject(target) && !Object.keys(target).length) {
      this.track(target)
    }
    let eventPropArr = []
    for (let prop in target) {
      if (target.hasOwnProperty(prop)) {
        if (callback) {
          eventPropArr.push(prop)
          this.watch(target, prop)
        }
      }
    }

    if (!this.propertyChangedHandler) {
      this.propertyChangedHandler = []
      this.propertyChangedHandler.push({
        // 默认all为false
        all: false,
        propChanged: callback,
        eventPropArr: eventPropArr,
      })
    }
  }

  track(obj, prop, path) {
    if (obj.$observeProps) {
      return
    }
    Object.defineProperty(obj, "$observeProps", {
      configurable: true,
      enumerable: false,
      writable: true,
      value: {},
    })
    if (path) {
      obj.$observeProps.$observerPath = path + '-' + prop
    } else {
      if (prop) {
        obj.$observeProps.$observerPath = '#' + '-' + prop
      } else {
        // path 和 prop 都不存在  (根目录)
        obj.$observeProps.$observerPath = '#'
      }
    }
  }

  mock(target) {
    const self = this
    arrMethods.forEach(item => {
      // 需要修改的方法
      if (new RegExp('\\b' + item + '\\b').test(triggerStr)) {
        target[item] = function () {
          // 原数组
          const old = Array.prototype.slice.call(this, 0)
          // 原数组经过函数计算结果
          const result = Array.prototype[item].apply(this, Array.prototype.slice.call(arguments))
          for (let cprop in this) {
            if (this.hasOwnProperty(cprop) && !isFunction(this[cprop])) {
              // 再次设置监听 (当执行到这里时$observeProps.$observerPath已经存在了)
              self.watch(this, cprop, this.$observeProps.$observerPath)
            }
          }
          // 派发通知
          self.onPropertyChanged(
            `Array-${item}`, this, old, this, this.$observeProps.$observerPath,
          )
          return result
        }
      }
    })
  }

  watch(target, prop, path) {
    if (prop === '$observeProps' || prop === '$observer') return
    if (isFunction(target[prop])) return
    if (!target.$observeProps) {
      Object.defineProperty(target, "$observeProps", {
        configurable: true,
        enumerable: false,
        writable: true,
        value: {},
      })
    }
    target.$observeProps.$observerPath = path || "#"
    const self = this
    // todo 是否有必要
    // todo 把观测值放入$observeProps
    const currentValue = (target.$observeProps[prop] = target[prop])
    // 核心
    Object.defineProperty(target, prop, {
      get: function () {
        // this 指向target
        return this.$observeProps[prop]
      },
      set: function (newVal) {
        const old = this.$observeProps[prop]
        if (old !== newVal) {
          // 赋新值
          this.$observeProps[prop] = newVal
          // 派发更新
          self.onPropertyChanged(
            prop, newVal, old, this, this.$observeProps.$observerPath,
          )
        }
      },
    })

    if (isObject(currentValue)) {
      if (isArray(currentValue)) {
        if (!currentValue.length) {
          this.track(currentValue, prop, path)
        }
        this.mock(currentValue)
      } else if (!Object.keys.length) {
        this.track(currentValue, prop, path)
      }

      // 递归watch
      for (let cprop in currentValue) {
        if (currentValue.hasOwnProperty(cprop)) {
          const curPath = target.$observeProps.$observerPath + '-' + prop
          this.watch(currentValue, cprop, curPath)
        }
      }
    }
  }

  /**
   * 监听到prop发生改变
   * onPropertyChanged只在两个地方调用
   * 1.watch中的set
   * 2.调用改变数组的方法 (此时prop会带上Array-前缀)
   *
   */
  onPropertyChanged(prop, value, oldValue, target, path) {
    if (this.propertyChangedHandler && (!(nan(value) && nan(oldValue)))) {
      const rootName = _getRootName(prop, path)
      for (let handler of this.propertyChangedHandler) {
        if (
          handler.all ||
          isInArray(handler.eventPropArr, rootName) ||
          rootName.indexOf('Array-') === 0
        ) {
          // 触发外部方法
          handler.propChanged.call(target, prop, value, oldValue, path)
        }
      }
    }

    if (prop.indexOf('Array-') !== 0 && typeof value === 'object') {
      //改变的是数组中的元素 此时要重新watch
      this.watch(target, prop, target.$observeProps.$observerPath)
    }
  }
}
