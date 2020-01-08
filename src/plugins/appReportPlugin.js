
function timeount() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(true)
    }, 10000)
  })
}

const nativeHook = {
  onLaunch: async function (option) {
    console.log("plugin onLaunch", option)
    await timeount()
  },
};


export default function appReportPlugin() {
  return {
    name: 'launch',
    nativeHook: nativeHook,
    custom: {
      xxx: function () {
        console.log("xxx", this)
      },
      asd: () => {
        console.log("asd", this)
      },
    },
  };
};

