const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('response', response => {
    if (response.status() === 404) {
      console.log('404:', response.url());
    }
  });

  try {
    await page.goto('http://localhost:3000', { waitUntil: 'load', timeout: 10000 });
  } catch (e) {
    console.log(e.message);
  }
  
  const content = await page.content();
  console.log("ROOT child count:", await page.$eval('#root', el => el.children.length));
  
  await browser.close();
})();
