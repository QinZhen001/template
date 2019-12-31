export default class InterceptorManager {
  constructor() {
    this.interceptors = []
  }

  /**
   *
   * @param resolved
   * @param rejected
   * @returns {number} 当前interceptor的index下标
   */
  use(resolved, rejected) {
    this.interceptors.push({
      resolved,
      rejected,
    })
    return this.interceptors.length - 1
  }

  forEach(fn) {
    this.interceptors.forEach(interceptor => {
      interceptor && fn(interceptor)
    })
  }

  eject(index) {
    if (this.interceptors[index]) {
      this.interceptors[index] = null
    }
  }
}
