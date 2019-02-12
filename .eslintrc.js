module.exports = {
  root: true,
  globals: { wx: true },
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    browser: true
  },
  // https://github.com/feross/standard/blob/master/RULES.md#javascript-standard-style
  extends: 'standard',
  // required to lint *.wpy files
  plugins: [
    'html'
  ],
  settings: {
    'html/html-extensions': ['.html', '.wpy']
  },
  // add your custom rules here
  'rules': {
    'eqeqeq': 0,
    'spaced-comment': 0,
    'no-multi-spaces': 0,//多余的空格
    'no-multiple-empty-lines': 0, //多空行
    'object-curly-spacing': 0,//大括号内是否允许不必要的空格
    'semi': 0, //分号
    'eol-last': 0,//文件末尾强制换行
    "no-loop-func": 0,//禁止在循环中使用函数（如果没有引用外部变量不形成闭包就可以）
    "no-trailing-spaces": 0,//一行结束后面不要有空格
    "consistent-return": 0,//return 后面是否允许省略
    "new-cap": 0,//函数名首行大写必须使用new方式调用，首行小写必须用不带new方式调用
    // allow paren-less arrow functions
    'arrow-parens': 0,
    // allow async-await
    'generator-star-spacing': 0,
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    'space-before-function-paren': 0
  }
}
