class photoAnm {
  constructor(obj) {
    // console.log(obj)
    this.mold = '';
    this.titleInTime = 3000;
    this.titleOutTime = 3000;
    this.photoInTime = 3000;
    this.photoOutTime = 3000;
    this.autoPlay = true;
    this.photoInFunTimeout = '';
    this.photoOutFunTimeout = '';
    if (obj) {
      for (var item in obj) {
        this[item] = obj[item];
      }
    }
    console.log(this);
    this.globalTimeout;//全局计时器
    this.globalIsAddTimeout = true;//全局判断是否继续计时
    this.animationTimes; //记录动画下一步执行的时间点
  }

  get titleInFun() {
    return this._titleInFun;
  }

  set titleInFun(callback) {
    this._titleInFun = callback;
    return this;
  }

  get titleOutFun() {
    return this._titleOutFun;
  }

  set titleOutFun(callback) {
    this._titleOutFun = callback;
    return this;
  }

  get photoInFun() {
    return this._photoInFun;
  }

  set photoInFun(callback) {
    this._photoInFun = callback;
    return this;
  }

  get photoOutFun() {
    return this._photoOutFun;
  }

  set photoOutFun(callback) {
    this._photoOutFun = callback;
    return this;
  }

  albumTitleIn(albumTitle1Anm) {
    // console.log(`第${this.mold}个模板titleIn执行`)
    if (this.titleInFun) {
      this.titleInFun();
    }
    this.animationTimes = this.getTimestamp(this.titleInTime);
    this.setGlobalTimeout('albumTitleOut');
  }

  albumTitleOut() {
    // console.log(`第${this.mold}个模板titleOut执行`)
    if (this.titleOutFun) {
      this.titleOutFun();
    }
    this.animationTimes = this.getTimestamp(this.titleOutTime);
    this.setGlobalTimeout('animationIn');
  }

  animationIn() {
    var _this = this;
    // console.log(`第${this.mold}个模板photoIn执行`)
    if (this.photoInFun) {
      this.photoInFun();
      // this.photoInFunTimeout = setTimeout(() => {
      //   _this.photoInFun();
      // }, 0)
    }
    // return;
    if (!this.autoPlay) {
      return;
    }
    this.animationTimes = this.getTimestamp(this.photoInTime);
    this.setGlobalTimeout('animationOut');
  }

  animationOut() {
    var _this = this;
    // console.log(`第${this.mold}个模板photoOut执行`)
    if (this.photoOutFun) {
      this.photoOutFun();
      // this.photoOutFunTimeout = setTimeout(() => {
      //   _this.photoOutFun();
      // }, 0)
    }
    if (!this.autoPlay) {
      return;
    }
    this.animationTimes = this.getTimestamp(this.photoOutTime);
    this.setGlobalTimeout('animationIn');
  }

  setGlobalTimeout(fun) {
    var _this = this;
    clearTimeout(this.globalTimeout);//??
    this.globalIsAddTimeout = true;
    var currentTime = new Date().getTime(); //当前时间戳Timestamps
    if (this.animationTimes > 0 && currentTime >= this.animationTimes) {
      this.animationTimes = 0;
      this.globalIsAddTimeout = false;
      switch (fun) {
        case 'albumTitleIn':
          this.albumTitleIn();
          break;
        case 'albumTitleOut':
          this.albumTitleOut();
          break;
        case 'animationIn':
          this.animationIn();
          break;
        case 'animationOut':
          this.animationOut();
          break;
        default:
          break;
      }
    }
    if (this.globalIsAddTimeout) {
      // console.log('globalTimeout')
      this.globalTimeout = setTimeout(function () {
        _this.setGlobalTimeout(fun);
      }, 1000);
    }
  }

  clearPhotoAnm() {
    console.log(`第${this.mold}个模板清除动画`);
    clearTimeout(this.globalTimeout);
    // clearTimeout(this.photoInFunTimeout);
    // clearTimeout(this.photoOutFunTimeout);
    this.globalIsAddTimeout = false;
    this.animationTimes = 0;
  }

  getTimestamp(time) {
    time = parseInt(time);
    if (time > 0) {
      return new Date().getTime() + parseInt(time);
    } else {
      return new Date().getTime();
    }
  }
}

exports.photoAnm = photoAnm;
