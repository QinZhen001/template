const {addReport} = require('./monitor');
const sendkv = require('./statistics');
const xhwGetJson = require('./xhwGetJson');
const xhwRequest = require('./xhwRequest');
const xhwKeyRequest = require('./xhwKeyRequest');
const xhwShare = require("./xhwShare");
const xhwDecryptOptions = require('./xhwDecryptOptions');
const xhwRedirectTo = require('./xhwRedirectTo');
const xhwNavigateTo = require('./xhwNavigateTo');
const xhwReLaunch = require("./xhwReLaunch");

const customFunc = {
  addReport,
  sendkv,
  xhwGetJson,
  xhwRequest,
  xhwKeyRequest,
  xhwShare,
  xhwDecryptOptions,
  xhwRedirectTo,
  xhwNavigateTo,
  xhwReLaunch,
};


module.exports = customFunc;