const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000/?v=client_login');
  await new Promise(r => setTimeout(r, 2000));
  const rootHtml = await page.$eval('#root', el => el.innerHTML);
  console.log("ROOT child count:", rootHtml.length);
  await browser.close();
})();
