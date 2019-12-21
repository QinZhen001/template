
const pageOnshowBh = require('../pageOnshowBh.js');

const detailContentBh = require('../detailContentBh.js');

const recommendListBh = require('../recommendListBh.js');

const authorInfoBh = require('../authorInfoBh.js');

const adBh = require('../adBh.js');

const toDetailBh = require('../toDetailBh.js');

const toAuthorBh = require('../toAuthorBh.js');

const holidayStateBh = require('../holidayStateBh.js');

const dealHtmlDataBh = require('../dealHtmlDataBh.js');

const pageonPageScrollBh = require('../pageonPageScrollBh.js');

module.exports = Behavior({
  behaviors: [pageOnshowBh,detailContentBh,recommendListBh,authorInfoBh,adBh,toDetailBh,toAuthorBh,holidayStateBh,dealHtmlDataBh,pageonPageScrollBh,],
})
