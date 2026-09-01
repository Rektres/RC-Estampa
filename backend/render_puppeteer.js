const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 5200, height: 3200, deviceScaleFactor: 2 });
  
  const htmlPath = 'file://' + path.resolve(__dirname, 'render_er_4k.html');
  console.log('Opening:', htmlPath);
  await page.goto(htmlPath, { waitUntil: 'networkidle0' });
  
  // Wait for mermaid svg to render
  await page.waitForSelector('svg');
  await new Promise(r => setTimeout(r, 2000));
  
  const outputPath = path.resolve(__dirname, '..', 'RC_Estampa_Diagrama_ER_Puppeteer.png');
  const element = await page.$('body');
  await element.screenshot({ path: outputPath });
  
  console.log('Screenshot saved to:', outputPath);
  await browser.close();
})();
