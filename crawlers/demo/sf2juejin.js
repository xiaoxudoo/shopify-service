const puppeteer = require("puppeteer");
const sleep = require("../utils/sleep.js");

// 以下拿掘金开刀,贡献私人测试账号
(async () => {
  const browser = await puppeteer.launch({ headless: false });

  const page = await browser.newPage();
  page.setViewport({
    width: 1376,
    height: 768,
  });

  /** 1. 到sf获取最新的前端文章 **/
  try {
    await page.goto("https://segmentfault.com/channel/frontend", {
      waitUntil: "networkidle2"
    });

    var SfFeArticleList = await page.evaluate(() => {
      var linklist = [
        ...document.querySelectorAll(".news-list .news__item-info a[target='_blank']")
      ];

      var textlist = [
        ...document.querySelectorAll(".news-list .news__item-info .news__item-title.mt0")
      ];


      return linklist.map((el, elindex) => {
        return { href: el.href.trim(), title: textlist[elindex].innerText };
      });
    });

    console.log("SfFeArticleList:", SfFeArticleList);

    await page.screenshot({ path: "./data/sf2juejin/sf.png", type: "png" });
  } catch (e) {
    console.log("sf err:", e);
  }

  /** 登录juejin **/
  try {
    await page.goto("https://juejin.im", {
      waitUntil: "networkidle2"
    });

    const login = await page.$(".login");
    await login.click();

    const loginPhoneOrEmail = await page.$("[name=loginPhoneOrEmail]");
    console.log("loginPhoneOrEmail:", loginPhoneOrEmail);
    await loginPhoneOrEmail.click();
    await page.type("[name=loginPhoneOrEmail]", "xiaoxudoo@126.com", { delay: 20 });

    var password = await page.$("[placeholder=请输入密码]");
    console.log("password:", password);
    await password.click();
    await page.type("[placeholder=请输入密码]", "xxd198935", { delay: 20 });

    var authLogin = await page.$(".panel .btn");
    console.log("authLogin:", authLogin);
    await authLogin.click();
  } catch (e) {}

  // /** 随机推荐一篇从sf拿来的文章到掘金 **/
  try {
    await sleep(1500);
    var seed = Math.floor(Math.random() * 11);
    var theArtile = SfFeArticleList[seed]; 
    // { href: "https://segmentfault.com/a/1190000021741914", title: "demo" }

    var add = await page.$(".main-nav .more .more-icon");
    await add.click();

    var addLink = await page.$(".more-list .item:nth-child(2)");
    await addLink.click();

    await sleep(200);

    var closeIcon = await page.$(".recommend-box .ion-close");
    await closeIcon.click();

    var shareUrl = await page.$(".entry-form-input .url-input");
    await shareUrl.click();
    await page.keyboard.type(theArtile.href, { delay: 20 });

    await page.keyboard.press("Tab");
    await page.keyboard.type(theArtile.title, { delay: 20 });

    await page.keyboard.press("Tab");
    await page.keyboard.type(theArtile.title, { delay: 20 });

    await page.evaluate(() => {
      let li = [
        ...document.querySelectorAll(".category-list-box .category-list .item")
      ];
      li.forEach(el => {
        if (el.innerText == "前端") el.click();
      });
    });

    var tagTitle = await page.$(".entry-form-input .tag-title-input");
    await tagTitle.click();
    await page.keyboard.type('JavaScript');
    await sleep(1000)

    var tag = await page.$(".tag-list-box .suggested-tag-list .tag");
    await tag.click();
    await sleep(2000)

    var submitBtn = await page.$(".entry-form-input .submit-btn");
    await submitBtn.click();
    // await page.click(".entry-form-input .submit-btn")
  } catch (e) {
    await page.screenshot({ path: "./data/sf2juejin/err.png", type: "png" });
  }

  await page.screenshot({ path: "./data/sf2juejin/done.png", type: "png" });
  // await page.close()
  // await browser.close()
})();
