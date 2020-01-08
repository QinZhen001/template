function timeount() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(true)
    }, 3000)
  })
}

const nativeHook = {
  onLaunch: async function (option) {
    console.log("plugin onLaunch  222222", option)
  },
};


function appReportPlugin() {
  return {
    name: 'launch2',
    nativeHook: nativeHook,
    inject: {
      ccc: () => {
        console.log("inject aaa")
      },
    },
    custom: {
      custom1: function () {
        console.log("custom1")
      },
      custom2: function () {
        console.log("custom2")
      },
    },
  };
};


module.exports = appReportPlugin;
