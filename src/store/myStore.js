const state = {
  ccc: 'ccc',
  ddd: 'ddd',
};


const getters = {
  ccc: (state) => {
    return state.ccc;
  },
  ddd: (state) => {
    return state.ddd;
  },
};

const setters = {
  ccc: (state, payload) => {
    state.ccc = payload;
  },
  ddd: (state, payload) => {
    state.ddd = payload;
  },
};

module.exports = {
  state,
  getters,
  setters,
};




