
export default function (config) {
  const bucketControl = BucketControl.getInstance(config);
  return {
    name: 'bucket',
    custom: {
      add: bucketControl.add,
      addRead: bucketControl.addRead,
      remove: bucketControl.remove,
      choose: bucketControl.choose,
      delAll: bucketControl.delAll,
      delRead: bucketControl.delRead,
    },
  };
};

