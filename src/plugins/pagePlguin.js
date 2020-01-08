function timeount() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(true)
    }, 10000)
  })
}

const nativeHook = {
  onLoad: async function (option) {
    console.log("plugin onLoad 11112222", this)
    await timeount()
  },
};


export default function appReportPlugin() {
  return {
    name: 'page1',
    nativeHook: nativeHook,
    custom: {
      page1: () => {
      },
    },
  };
};


module.exports = appReportPlugin;
