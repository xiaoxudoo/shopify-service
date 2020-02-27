const _ = require("lodash");
const {
  readFile,
  saveFile,
  appendFile
} = require("../utils/file.js");

const allResultFile = "./data/google-shopify-rank/all-result.txt";
const allUniqResultFile = "./data/google-shopify-rank/all-result-uniq.txt";

const getCategoryFileName = function(keyArr) {
  const path = `${keyArr[0]}-${keyArr[1]}-${keyArr[2].replace("/", "-")}`;
  return {
    fName: `./data/google-shopify/${path}.txt`,
    newfName: `./data/google-shopify-rank/${path}.txt`
  };
};

const readCategory = async function() {
  const categories = await readFile("./aliexpress-catergories.json");
  // console.log(categories);
  const cateArr = [];

  categories.forEach((category, index) => {
    category.children.forEach((subCate, subIdx) => {
      subCate.children.forEach(thirdCate => {
        const keyArr = [category.text, subCate.text, thirdCate.text];
        if (thirdCate.state === 'finished') {
          cateArr.push(keyArr);
        }
      });
    });
  });
  return cateArr;
};

const calcFreqence = function(list) {
  const listLength = list.length;
  const countMap = new Map();
  for (let i = 0; i < listLength; i++) {
    if (countMap.has(list[i])) {
      countMap.set(list[i], countMap.get(list[i]) + 1)
    } else {
      countMap.set(list[i], 1)
    }
  }
  const newList = []
  for (let [key, value] of countMap) {
    newList.push(`${key} : ${value}/${listLength}`)
  }
  return newList
}

const generateUniqFile = async function() {
  const allResultList = await readFile(allResultFile);
  const allUniqResultList = calcFreqence(allResultList)
  console.log("allResult length: ", allResultList.length);
  console.log("allUniqResult length: ", allUniqResultList.length);
  await saveFile(allUniqResultList, allUniqResultFile);
};

(async function() {
  try {
    console.log("start ", new Date().toLocaleString());
    const start = new Date().getTime();
    // 初始化
    await saveFile([], allResultFile);

    const cateArr = await readCategory();
    for await (const cates of cateArr) {
      const { fName, newfName } = getCategoryFileName(cates);
      const list = await readFile(fName);
      const newList = calcFreqence(list)
      await saveFile(newList, newfName);
      await appendFile(list, allResultFile);
    }

    await generateUniqFile()

    console.log("end ", new Date().toLocaleString());
    const end = new Date().getTime();
    console.log("spend time: ", end - start);
  } catch (err) {
    console.log(err);
  }
})();
