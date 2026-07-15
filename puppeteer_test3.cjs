const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000');
  await new Promise(r => setTimeout(r, 3000));
  const rootHtml = await page.$eval('#root', el => el.innerHTML);
  console.log("ROOT child count:", rootHtml.length);
  if (rootHtml.length < 500) {
    console.log("ROOT CONTENT:", rootHtml);
  }
  await browser.close();
})();
