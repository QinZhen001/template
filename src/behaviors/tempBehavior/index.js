
const pageOnshowBh = require('../pageOnshowBh.js');

const bannerBh = require('../bannerBh.js');

const tabBarBh = require('../tabBarBh.js');

const homeListBh = require('../homeListBh.js');

const adBh = require('../adBh.js');

const toDetailBh = require('../toDetailBh.js');

const toAuthorBh = require('../toAuthorBh.js');

const pageOnLoadBh = require('../pageOnLoadBh.js');

module.exports = Behavior({
  behaviors: [pageOnshowBh,bannerBh,tabBarBh,homeListBh,adBh,toDetailBh,toAuthorBh,pageOnLoadBh,],
})
