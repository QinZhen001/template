/**
 * 缓存桶配置文件
 * action: 自定义函数
 *    success: 成功的回调 (需要传入要放进缓存桶的数组,一般为响应的数据数组,传入的数据尽可能大)
 *    fail：失败的回调 (需传入失败信息)
 * minimum: 桶中数据的最小值(数据小于这个值会自动填充) (非必填)
 * filter: 用做数据去重的过滤器函数，判断是否需要此条数据，需要则return (非必填)
 *    item：当前的数据
 *    array：去重数组
 *
 *  bucketConfig中的key为桶的名字 (建议以名词命名)
 */

const bucketConfig = {
  testList: {
    action: async (success, fail) => {

    },
    minimum: 5,
    filter: (item, curReadMap, globalReadMap) => {
      let id = String(item.article_id);
      let num = globalReadMap.get(id);
      if (!num || num < 1) {
        return item;
      }
    },
  },
};


module.exports = bucketConfig;
