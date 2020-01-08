import {getOpenIdByRequest} from "./util/index";


const globalData = {
  openId: wx.getStorageSync('openId'),
  sessionId: '',
  isLogin: false,
  sex: 'man',
};

const viewData = {
  aaa: "aaa",
  bbb: "bbb",
  ccc: {
    ddd: "ddd",
    eee: [1, 2, 3, {
      xxx: "xxx",
    }],
  },
  fff: [{aa: 11}, {aa: 22}, {aa: 33}, {aa: 44}],
}

const getters = {
  isLogin: (state) => {
    return state.isLogin;
  },
  sex: (state) => {
    return state.sex;
  },
  openId: async (commit) => {
    const openId = await getOpenIdByRequest()
    commit('openId', openId);
    return openId;
  },
  sessionId: async (commit) => {
    let sessionId = null;
    try {
    } catch (e) {
      console.error(e);
    }
    commit('sessionId', sessionId);
    return sessionId;
  },
};

const setters = {
  isLogin: (state, payload) => {
    state.isLogin = payload;
  },
  sex: (state, payload) => {
    state.sex = payload;
  },
  openId: (state, payload) => {
    state.openId = payload;
  },
  sessionId: (state, payload) => {
    state.sessionId = payload;
  },
};

export default {
  viewData,
  globalData,
  getters,
  setters,
};




