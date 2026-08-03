const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('console', (msg) => console.log('CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', (err) => console.log('PAGEERROR:', err.message));

  await page.goto('http://localhost:8081', { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise((r) => setTimeout(r, 3000));

  console.log('TITLE:', await page.title());
  console.log('URL:', page.url());

  const bodyText = await page.evaluate(() => document.body.innerText.slice(0, 800));
  console.log('BODY TEXT SNIPPET:', bodyText);

  await page.screenshot({ path: '__tmp_01-initial.png' });

  await browser.close();
})().catch((e) => {
  console.error('SCRIPT ERROR:', e);
  process.exit(1);
});
