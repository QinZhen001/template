import {imitateModel} from "./util/index"


const state = {
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
  state,
  getters,
  setters,
};
