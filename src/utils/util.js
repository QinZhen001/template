// 标准化数据
// tableData为 请求返回的数据
function normalizeTableList(tableData) {
  let dataList = tableData.data_list;
  let domainImage = tableData.domain_image;
  domainImage = domainImage.split(';');
  console.log('domainImage', domainImage.length, domainImage)
  let obj = {};
  for (let i in domainImage) {
    if (domainImage[i]) {
      let imgKey = domainImage[i].slice(1, domainImage[i].search(':') - 1);
      let imgVal = domainImage[i].slice(domainImage[i].search(':') + 1, domainImage[i].length);
      obj[imgKey] = imgVal;
    }
  }
  for (let i = 0; i < dataList.length; i++) {
    dataList[i].rp = true;
    dataList[i].pos = i + 1;
//        dataList[i].screen = screen;
    let imageList = dataList[i].image_list;
    for (let item in imageList) {
      if (imageList[item]) {
        let img = imageList[item].slice(imageList[item].search('}') + 1, imageList[item].length);
        if (img.indexOf('?') > -1) {
          img = img.slice(0, img.indexOf('?'))
        }
        imageList[item] = obj[imageList[item].slice(1, imageList[item].search('}'))] + img;
      }
    }
    // console.log('imageList', imageList)
  }
  console.log('dataList', dataList)
  return tableData
}

export {
  normalizeTableList
}