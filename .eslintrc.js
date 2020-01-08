module.exports = {
  'extends': [
    'standard',
  ],
  'parserOptions': {
    'ecmaVersion': 9,
    'ecmaFeatures': {
      'jsx': false,
    },
    'sourceType': 'module',
  },
  'env': {
    'es6': true,
    'node': true,
  },
  'plugins': [
    'import',
    'node',
    'promise',
  ],
  'rules': {
    'semi': 0,
    'prefer-promise-reject-errors': 0,
    'no-undef': 1, //不能有未定义的变量
    'promise/always-return': 0,
    'object-shorthand': 0,
    'default-case': 0, //switch的default
    'quotes': 0,
    'import/no-extraneous-dependencies': 0,
    'no-unused-expressions': 0, //没有使用的表达式
    'guard-for-in': 0, //for-in 循环
    'no-restricted-syntax': 0,
    'no-prototype-builtins': 0,
    'dot-notation': 0,
    'comma-spacing': [2, {
      "before": false,
      "after": true,
    }], //控制逗号前后的空格
    'no-unused-vars': 0,
    'no-return-await': 0,
    'eqeqeq': 0,
    'import/no-cycle': 0,
    'spaced-comment': 0,
    'no-multi-spaces': 1, //多余的空格
    "no-multiple-empty-lines": [1, {
      "max": 2,
    }], //空行最多不能超过2行
    'object-curly-spacing': 0, //大括号内是否允许不必要的空格
    'eol-last': 0, //文件末尾强制换行
    'no-loop-func': 0, //禁止在循环中使用函数（如果没有引用外部变量不形成闭包就可以）
    'no-trailing-spaces': 1, //一行结束后面不要有空格
    'consistent-return': 0, //return 后面是否允许省略
    'new-cap': 0, //函数名首行大写必须使用new方式调用，首行小写必须用不带new方式调用
    // allow async-await
    'generator-star-spacing': 0,
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    'space-before-function-paren': 0,
    'arrow-parens': 'off',
    'comma-dangle': [
      'error',
      'only-multiline',
    ],
    'complexity': 0,
    'func-names': 'off',
    'global-require': 'off',
    'handle-callback-err': [
      'error',
      '^(err|error)$',
    ],
    'import/no-unresolved': [
      'error',
      {
        'caseSensitive': true,
        'commonjs': true,
        'ignore': ['^[^.]'],
      },
    ],
    'import/prefer-default-export': 'off',
    'linebreak-style': 'off',
    'no-catch-shadow': 'error',
    'no-continue': 'off',
    'no-div-regex': 'warn',
    'no-else-return': 'off',
    'no-param-reassign': 'off',
    'no-plusplus': 'off',
    'no-shadow': 'off',
    'no-multi-assign': 'off',
    'no-underscore-dangle': 'off',
    'node/no-deprecated-api': 'error',
    'node/process-exit-as-throw': 'error',
    'operator-linebreak': [
      'error',
      'after',
      {
        'overrides': {
          ':': 'before',
          '?': 'before',
        },
      },
    ],
    'prefer-arrow-callback': 'off',
    'prefer-destructuring': 'off',
    'prefer-template': 'off',
    'promise/catch-or-return': 'off',
    "no-use-before-define": 'off', //未定义前不能使用
    'object-curly-newline': 'off',
    'quote-props': [
      1,
      'as-needed',
      {
        'unnecessary': true,
      },
    ],
    "camelcase": 2, // 驼峰法命名
    // "consistent-this": [2, "self"], //this别名
    // "indent": [2, 4], //缩进风格，强制4个空格
    // "vars-on-top": 2, //var必须放在作用域顶部
  },
  'globals': {
    'global': true,
    'window': true,
    'document': true,
    'App': true,
    'Page': true,
    'Component': true,
    'Behavior': true,
    'wx': true,
    'getCurrentPages': true,
  },
};
