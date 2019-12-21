/*
 * 这里的命令外面要加"" 是为了避免路径中出现空格
 * https://www.cnblogs.com/Onlyou/p/4357522.html
 */
const cmd = require('node-cmd');
const path = require('path')

const cliConfig = require('../config/userConfig')

const distPath = path.resolve(__dirname, '../dist')

if (!cliConfig.cliPath || !/cli$/.test(cliConfig.cliPath)) {
  console.log('请正确配置cliConfig中的cliPath!')
} else {
  let command = `"${cliConfig.cliPath}" --build-npm ${distPath}`
  cmd.run(command)
}


