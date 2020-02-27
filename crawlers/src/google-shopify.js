/**
 * 在无头浏览器自动填写表单并提交
 */
const puppeteer = require("puppeteer");
const { readFile, saveFile, processLine, appendFile } = require("../utils/file.js");
const sleep = require("../utils/sleep.js");
const defaultUserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.70 Safari/537.36"
const _ = require('lodash')

let agentList = []
let domainList = []
let allLinks = []
let allCateCount = 0
let readyCateCount = 0
const keywordPrefix = "site:myshopify.com ";
const url_search_num =
  "https://${tld}/search?hl=${lang}&q=${query}&num=${num}&btnG=Google+Search";
const url_next_page_num =
  "https://${tld}/search?hl=${lang}&q=${query}&num=${num}&start=${start}";
const url_search_num_lr =
  "https://${tld}/search?lr=${langrestrict}&q=${query}&num=${num}&btnG=Google+Search";
const url_next_page_num_lr =
  "https://${tld}/search?lr=${langrestrict}&q=${query}&num=${num}&start=${start}";

const langArr = ['en', 'nl', 'de', 'pt-BR'] // 界面结果显示的语言
const lrArr = ['lang_en', 'lang_nl', 'lang_de', 'lang_pt']      // 限制搜索结果的语言

let codeFlag = false
const get_random_user_agent = function() {
  const seed = Math.floor(Math.random() * agentList.length)
  return agentList[seed]
}

const randomDomain = function() {
  return domainList[Math.floor(Math.random() * domainList.length)]
}

const readCategory = async function() {
  const categories = await readFile("./aliexpress-catergories.json");
  // console.log(categories);
  const cateMap = new Map();
  
  categories.forEach((category, index) => {
    category.children.forEach((subCate, subIdx) => {
      subCate.children.forEach((thirdCate) => {
        allCateCount++
        if (thirdCate.state !== 'finished') {
          const keyArr = [category.text, subCate.text, thirdCate.text]
          cateMap.set(keyArr, [])
        } else {
          readyCateCount++
        }
      })
    })
  })
  console.log('\nallCateCount: ', allCateCount)
  console.log('\n Has Finished: ', Number(readyCateCount * 100/allCateCount).toFixed(2) + '%')
  return cateMap
};

const getCategoryFileName = function(keyArr) {
  const fName = `./data/google-shopify/${keyArr[0]}-${keyArr[1]}-${keyArr[2].replace('/', '-')}.txt`
  return fName
}

const modifyCategoryState = async function(path, many) {
  const categories = await readFile("./aliexpress-catergories.json");
  categories.forEach((category, index) => {
    if (category.text === path[0]) {
      category.children.forEach((subCate, subIdx) => {
        if (subCate.text === path[1]) {
          subCate.children.forEach((thirdCate) => {
            if (thirdCate.text === path[2]) {
              thirdCate.state = 'finished'
              thirdCate.many = many
              readyCateCount++
              console.log(new Date())
              console.log('\n Has Finished: ', Number(readyCateCount * 100/allCateCount).toFixed(2) + '%')
            }
          })
        }
      })
    }
  })
  await saveFile(categories, "./aliexpress-catergories.json");
}

const quote_plus = function(query) {
  return encodeURIComponent(query).replace(/%20/g, "+");
};

const log = async function(content) {
  await saveFile(content, 'console.log')
}

const template = function(str, vars) {
  Object.keys(vars).forEach(key => {
    const value = vars[key]
    str = str.replace("${" + key + "}", value)
  })
  return str
};

const randomSleep = async function() {
  const ms = Math.floor(Math.random() * 10) + 60 // 60 ~ 70s
  await sleep(ms * 1000)
}

const googleSearch = async function(
  page,
  query,
  tld = "www.google.com",
  lang,
  langrestrict,
  start = 0,
  stop = 700,
  num = 100
) {
  query = quote_plus(keywordPrefix + query);
  codeFlag = false // 每次请求一个关键字 都置false
  let count = 0 // Count the number of links yielded.
  let url;

  // Prepare the URL of the first request.
  if (start) {
    if (langrestrict) {
      url = template(url_next_page_num_lr, { query, tld, start, num, langrestrict });
    } else {
      url = template(url_next_page_num, { query, tld, start, num, lang });
    }
  } else {
    if (langrestrict) {
      url = template(url_search_num_lr, { query, tld, start, num, langrestrict });
    } else {
      url = template(url_search_num, { query, tld, start, num, lang });
    }
  }
  
  console.log('url', url);
  while (start < stop) {
    // 地址栏输入网页地址
    await page.goto(url, {
      waitUntil: "networkidle2" // 等待网络状态为空闲的时候才继续执行
    });
    
    let aLinks = await page.evaluate(() => {
      let as = [...document.querySelectorAll("a")];
      const fas = as.filter(a => {
        const hasShopify = /([^/]+.myshopify.com)/.test(a.href.trim())
        const isSearch = decodeURIComponent(a.href).indexOf('site:myshopify.com') > -1 || a.href.indexOf('search') > -1
        return hasShopify && !isSearch
      })
      return fas.map(a => {
        return /([^/]+.myshopify.com)/.exec(a.href.trim())[0]
      })
    });

    
    // End if there are no more results. TODO review this logic, not sure if this is still true!
    // 10 是经验值
    if (aLinks.length < 10) {
      const html = await page.content()
      if (html.indexOf('unusual traffic') > -1) {
        console.log('[-] Google又要你输验证码啦...')
        codeFlag = true
      }
      break;
    }

    allLinks = allLinks.concat(aLinks);
    // saveFile(allLinks, 'console.log')
    count += aLinks.length;

    console.log('count: ', count);
    
    // Prepare the URL for the next request.
    start += num;
    url = template(url_next_page_num, { query, tld, start, num, lang });
    await randomSleep()
  }
};

(async (url, path) => {
  // 读取userAgent
  agentList =  await processLine("./user_agents.txt");
  // console.log('userAgent', agentList);
  domainList = await processLine("./domain.txt");
  // console.log('domain', domainList);
  let browser
  let page
  // 启动浏览器
  
  browser = await puppeteer.launch({
    args: [
      // '--proxy-server=121.232.194.163:9000',
       '--no-sandbox=','--disable-setuid-sandbox'
    ],
    // 关闭无头模式，方便我们看到这个无头浏览器执行的过程
    headless: true
  });
  // 打开页面
  page = await browser.newPage();
  // 设置浏览器视窗
  page.setViewport({
    width: 1376,
    height: 768
  });
  await page.setDefaultNavigationTimeout(0);

  const iterateCate = async function() {
    // 读取商家category
    let endFlag = false
    // 迭代三次，防止网络超时
    for await(let i of [1, 2, 3]) {
      if (endFlag) {
        return
      }
      const cateMap = await readCategory()
      try {
	      const reverseKeys = _.reverse([...cateMap.keys()])
        for (let key of reverseKeys) {
          // 更改UserAgent
          const agent = get_random_user_agent()
          console.log('\nuserAgent: ', agent)
          await page.setUserAgent(agent);
          const rdomain = randomDomain()
          console.log('\ndomain: ', rdomain)
          await googleSearch(page, key[2], rdomain, null, lrArr[0]);
          if (allLinks.length > 0 && !codeFlag) {
            await saveFile(allLinks, getCategoryFileName(key));
            await appendFile(allLinks, 'result.txt');
            await modifyCategoryState(key, allLinks.length)
          }
          allLinks = []
          if (codeFlag) {
            // await sleep(600000)
            break
          }
          await sleep(90000) // 休息1.5min
        }
        endFlag = true
        console.log('finally end...')
      } catch (err) {
        endFlag = false
        console.log('error 时间：', new Date())
        console.error(err)
      }
    }
  }
  
  try {
    await iterateCate()
  } catch(e) {
    console.error(e)
  }
  await page.close()
  // 不关闭浏览器，看看效果
  await browser.close();
})()
