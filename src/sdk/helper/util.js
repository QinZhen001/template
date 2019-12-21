function isPainObject(obj) {
  // 区分数组和对象的情况
  return Object.prototype.toString.call(obj) === '[object Object]';
}


function getPlatform() {
  return new Promise((resolve, reject) => {
    let phoneInfo = wx.getStorageSync('phoneInfo');
    if (phoneInfo && phoneInfo.platform_) {
      resolve(phoneInfo.platform_);
    }
    wx.getSystemInfo({
      success: res => {
        const systemInfo = res.system.split(' ');
        if (systemInfo.length) {
          let platform_ = systemInfo[0];
          resolve(platform_);
        } else {
          reject(res);
        }
      },
      fail: rej => reject(rej),
    });
  });
}


/**
 * string => array[]
 * @param str
 * @returns {Array}
 */
function stringToBytes(str) {
  let ch;
  let st;
  let re = [];
  for (let i = 0; i < str.length; i++) {
    ch = str.charCodeAt(i); // get char
    st = []; // set up "stack"
    do {
      st.push(ch & 0xFF); // push byte to stack
      ch = ch >> 8; // shift value down by 1 byte
    }
    while (ch);
    re = re.concat(st.reverse());
  }
  return re;
}


module.exports = {
  isPainObject,
  getPlatform,
  stringToBytes,
};