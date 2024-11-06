const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const proxies = [
  'http://proxy1.example.com:8080',
  'http://proxy2.example.com:8080',
  'http://proxy3.example.com:8080',
  'http://proxy4.example.com:8080',
  'http://proxy5.example.com:8080'
];

const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
  'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15'
];

async function moveMouse(page) {
  const {width, height} = await page.viewport();
  for (let i = 0; i < 5; i++) {
    await page.mouse.move(
      Math.random() * width,
      Math.random() * height,
      { steps: 25 }
    );
  }
}

async function automateSession(url, proxy, userAgent) {
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      `--proxy-server=${proxy}`,
      '--start-maximized'
    ]
  });
  
  const page = await browser.newPage();
  await page.setUserAgent(userAgent);
  await page.setViewport({ width: 1366, height: 768 });

  try {
    await page.goto(url);
    
    // First mouse movement
    await moveMouse(page);
    
    // Wait 1 minute
    await page.waitForTimeout(60000);
    
    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Second mouse movement
    await moveMouse(page);
    
    // Wait 1 minute
    await page.waitForTimeout(60000);
    
    // Smooth scroll to top
    await page.evaluate(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
    
    await page.waitForTimeout(2000);
    await browser.close();
    
  } catch (error) {
    console.error('Error during session:', error);
    await browser.close();
  }
}

async function main() {
  const url = 'https://example.com'; // Replace with your target URL
  
  while (true) {
    const sessions = proxies.map((proxy, index) => 
      automateSession(url, proxy, userAgents[index])
    );
    
    await Promise.all(sessions);
    console.log('Completed one round, starting next...');
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
}

main().catch(console.error);