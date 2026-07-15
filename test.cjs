const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const html = fs.readFileSync('dist/index.html', 'utf8');

const dom = new JSDOM(html, { runScripts: "dangerously", resources: "usable", url: "http://localhost/" });
dom.window.onerror = function(message, source, lineno, colno, error) {
  console.log("ERROR:", message, error);
};
dom.window.addEventListener('load', () => {
  setTimeout(() => {
    console.log("ROOT CONTENT:", dom.window.document.getElementById('root').innerHTML.substring(0, 200));
  }, 2000);
});
