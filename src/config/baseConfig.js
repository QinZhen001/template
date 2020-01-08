import devConfig from "./devConfig"
import proConfig from "./proConfig"

let baseConfig = {
  appId: "",
  clientVersion: "2.2.9", //版本号
  identification: "item91",
  env: "dev",
};

switch (baseConfig.env) {
  case "dev":
    baseConfig = {...baseConfig, ...devConfig};
    break;
  case "prod":
    baseConfig = {...baseConfig, ...proConfig};
    break;
}


export default baseConfig

