
const pageOnshowBh = require('../pageOnshowBh.js');

const authorInfoBh = require('../authorInfoBh.js');

const authorListBh = require('../authorListBh.js');

const adBh = require('../adBh.js');

const toDetailBh = require('../toDetailBh.js');

module.exports = Behavior({
  behaviors: [pageOnshowBh,authorInfoBh,authorListBh,adBh,toDetailBh,],
})
