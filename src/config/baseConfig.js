const devConfig = require('./devConfig');
const proConfig = require('./proConfig');

let baseConfig = {
  appId: "",
  clientVersion: "2.2.9", //版本号
  identification: "lite95", //item标识
  model: "Nexus 5",
};

switch (baseConfig.env) {
  case "dev":
    baseConfig = {...baseConfig, ...devConfig};
    baseConfig.baseUrl = 'https://ydapidev.heywoodsminiprogram.com/api'
    break;
  case "dev2":
    baseConfig = {...baseConfig, ...devConfig};
    baseConfig.baseUrl = 'https://ydapidev2.heywoodsminiprogram.com/api'
    break;
  case "dev3":
    baseConfig = {...baseConfig, ...devConfig};
    baseConfig.baseUrl = 'https://ydapidev3.heywoodsminiprogram.com/api'
    break;
  case "dev4":
    baseConfig = {...baseConfig, ...devConfig};
    baseConfig.baseUrl = 'https://ydapidev4.heywoodsminiprogram.com/api'
    break;
  case "prod":
    baseConfig = {...baseConfig, ...proConfig};
    break;
  default:
    baseConfig = {...baseConfig, ...proConfig};
}

module.exports = baseConfig;
