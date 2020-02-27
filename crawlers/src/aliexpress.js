/**
 * 在无头浏览器自动填写表单并提交
 */
const puppeteer = require("puppeteer");
const cheerio = require('cheerio');
const { saveFile } = require("../utils/file.js");
const sleep = require("../utils/sleep.js");
const categories = [];

const hoverCategory = async function(cls, page) {
  const selector = '.' + cls.replace(/\s/, '.')
  console.log(selector);
  await page.hover(selector);
  await sleep(1000);
};

(async (url) => {
  // 启动浏览器
  const browser = await puppeteer.launch({
    // 关闭无头模式，方便我们看到这个无头浏览器执行的过程
    headless: false
  });
  // 打开页面
  const page = await browser.newPage();
  // 设置浏览器视窗
  page.setViewport({
    width: 1376,
    height: 768
  });

  await page.setDefaultNavigationTimeout(0);
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.70 Safari/537.36');

  // 地址栏输入网页地址
  await page.goto(url, {
    waitUntil: "networkidle2" // 等待网络状态为空闲的时候才继续执行
  });

  await Promise.race([sleep(6000), page.waitForSelector('.close-layer')])
  if (page.$('.close-layer')) {
    page.click('.close-layer')
  }

  const clClasss = await page.evaluate(() => {
    let cl = [...document.querySelectorAll(".categories-list-box .cl-item")];
    return cl.map(c => {
      return c.className
    });
  });

  for (const cl of clClasss) {
    await hoverCategory(cl, page)
  }

  let content = await page.content();
  const $ = cheerio.load(content);
  
  $('.categories-list-box .cl-item').map(function (index, ele) {
    const link = $(ele).find('.cate-name a')
    const node = {
      text: link.text(),
      href: link.attr('href'),
      children: []
    }
    $(ele).find('.sub-cate .sub-cate-items').map(function (subindex, subele) {
      const sublink = $(subele).find('dt > a')
      const subNode = {
        text: sublink.text(),
        href: sublink.attr('href'),
        children: []
      }
      $(subele).find('dd > a').map(function(tindex, tele) {
        console.log($(tele).text())
        subNode.children.push({
          text: $(tele).text(),
          href: $(tele).attr('href'),
          children: []
        })
      })
      node.children.push(subNode)
    })
    categories.push(node)
  })

  // console.log(sectionDom)
  await saveFile(categories, './aliexpress-catergories.json')


  // await browser.close();
})('https://www.aliexpress.com/')

