import commonState from './common/commonState';
import userState from "./user/userState"

/**
 * 注意时序，后面的会覆盖前面状态
 */
export default {
  commonState,
  userState,
};

