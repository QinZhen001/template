class lzRandom {
  constructor() {
    this.randomTimeout;//全局计时器
    this.randomIsAddTimeout = true;//全局判断是否继续计时
    this.goTime = 0;
  }

  get randomTime() {
    return this._randomTime;
  }

  set randomTime(time) {
    // console.log('randomTime', time)
    this._randomTime = parseInt(time) > 0 ? parseInt(time) : 3000;
    this.goTime = new Date().getTime() + this._randomTime;
    this.randomIsAddTimeout = true;
    this.setRandomTimeout();
    return this;
  }

  get randomFun() {
    return this._randomFun;
  }

  set randomFun(callback) {
    this._randomFun = callback;
    return this;
  }

  setRandomTimeout() {
    // console.log('setRandomTimeout', this._randomTime)
    var _this = this;
    clearTimeout(this.randomTimeout);
    this.randomIsAddTimeout = true;
    var currentTime = new Date().getTime(); //当前时间戳Timestamps
    if (this.goTime > 0 && currentTime >= this.goTime) {
      this.goTime = currentTime + this._randomTime;
      if (this._randomFun) {
        this._randomFun();
      }
    }
    if (this.randomIsAddTimeout) {
      this.randomTimeout = setTimeout(function () {
        _this.setRandomTimeout();
      }, 1000);
    }
  }

  clearLzRandom() {
    // console.log('clearLzRandom')
    clearTimeout(this.randomTimeout);
    this.randomIsAddTimeout = false;
    this._randomTime = 0;
    this.goTime = 0;
  }

}

exports.lzRandom = lzRandom;