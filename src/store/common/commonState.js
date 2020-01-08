import {imitateModel} from "./util/index"


const globalData = {
  model: wx.getStorageSync('model'),
  test: "",
};


const getters = {
  model: async (commit) => {
    const model = imitateModel()
    commit('model', model);
    return model;
  },
}


const setters = {};


export default {
  globalData,
  getters,
  setters,
};
