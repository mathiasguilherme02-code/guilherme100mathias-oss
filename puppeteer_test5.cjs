const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000/?v=produtos');
  await new Promise(r => setTimeout(r, 2000));
  const rootHtml = await page.$eval('#root', el => el.innerHTML);
  console.log("ROOT child count:", rootHtml.length);
  if (rootHtml.length > 0) {
    console.log("ROOT CONTENT:", rootHtml.substring(0, 500));
  }
  await browser.close();
})();
