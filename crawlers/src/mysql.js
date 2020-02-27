const mysql = require("mysql");
const _ = require("lodash");
const { readFile } = require("../utils/file.js");
const IS_WW_SHIP = true;
const langArr = ['en']
const QUERY = "site:myshopify.com worldwide shipping ";

// const IS_WW_SHIP = false;
// const langArr = ['en', 'nl', 'de', 'pt']
// const QUERY = "site:myshopify.com ";

const getCategoryFileName = function(keyArr, lang = "en") {
  const path = `${keyArr[0]}-${keyArr[1]}-${keyArr[2].replace("/", "-")}`;
  return {
    keyword: keyArr[2],
    fName: `./data/collect/collect.${lang}${IS_WW_SHIP ? '.wwship' : ''}/google-shopify/${path}.txt`
  };
};

const readCategory = async function(lang) {
  const fName = `./data/collect/collect.${lang}${IS_WW_SHIP ? '.wwship' : ''}/aliexpress-catergories.json`;
  const categories = await readFile(fName);
  // console.log(categories);
  const cateArr = [];

  categories.forEach((category, index) => {
    category.children.forEach((subCate, subIdx) => {
      subCate.children.forEach(thirdCate => {
        const keyArr = [category.text, subCate.text, thirdCate.text];
        cateArr.push(keyArr);
      });
    });
  });
  return cateArr;
};

const getConnectPool = function () {
  const pool = mysql.createPool({
    connectionLimit : 10,
    host: "localhost",
    user: "root",
    password: "xiaoxudoo@126",
    database: "google_shopify"
  });

  return pool
};



(async function() {
  try {
    const pool = getConnectPool()

    const queryPromise = function(query, options = {}) {
      return new Promise((resolve, reject) => {
        pool.query(query, options, function(error, results, fields) {
          if (error) {
            reject(error);
          }
          resolve({ results, fields });
        });
      });
    };

    const sqlDomain = async function() {
      for await (let lang of langArr) {
        const cateArr = await readCategory(lang);
        for await (const cates of cateArr) {
          const { keyword, fName } = getCategoryFileName(cates, lang);
          console.log(fName)
          const domainList = await readFile(fName);
          // 每一条数据都插入mysql
          const options = {
            domain: '',
            first_category_name: cates[0],
            second_category_name: cates[1],
            third_category_name: cates[2],
            keyword: QUERY + keyword,
            is_ww_ship: IS_WW_SHIP,
            hl: lang
          }
          for await (let domain of domainList) {
            options.domain = domain
            // console.log(options)
            await queryPromise('INSERT INTO shopify_domain SET ?', options)
          }
        }
      }
    }

    const sqlCategory = async function() {
      const categories = await readFile('./aliexpress-catergories.json.origin');
      let i = -1, j = -1, k = -1;
      for await (let firstCate of categories) {
        i++;
        for await (let subCate of firstCate.children) {
          j++;
          for await (let thirdCate of subCate.children) {
            k++;
            const options = {
              first_level_id: i,
              first_level_name: firstCate.text,
              second_level_id: j,
              second_level_name: subCate.text,
              third_level_id: k,
              third_level_name: thirdCate.text
            }
            await queryPromise('INSERT INTO aliexpress_category SET ?', options)
          }
        }
      }
    }

    console.log("start ", new Date().toLocaleString());
    const start = new Date().getTime();

    // await sqlDomain()

    await sqlCategory()

    const end = new Date().getTime();
    console.log("end ", new Date().toLocaleString());
    console.log("spend time: ", end - start);
  } catch (err) {
    console.log(err);
  }
})();
