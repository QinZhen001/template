/**
 * 在precommit的钩子中检查系列名
 * 将不是 xiaoyin 系列的代码转成xiaoyin系列
 * (保证代码提交的一致性)
 */
const chalk = require("chalk");
const cmd = require('node-cmd');
const path = require('path');
const {seriesName} = require("../../src/common/js/globalData");


const defaultSeriesName = "xiaoyin";


if (seriesName !== defaultSeriesName) {
  console.log(chalk.blue(`[ pre-commit ] 将${seriesName}系列转成${defaultSeriesName}系列`));

  let command = `npm run build-theme -- -t ${defaultSeriesName}`;
  cmd.run(command);
}
