const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure().errorText));
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  
  const content = await page.content();
  console.log("ROOT HTML length:", content.length);
  const rootHtml = await page.$eval('#root', el => el.innerHTML);
  console.log("ROOT child count:", rootHtml.length > 0 ? "HAS CONTENT" : "EMPTY");
  
  await browser.close();
})();
