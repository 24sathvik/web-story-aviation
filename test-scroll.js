const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  // Set viewport to 1080p
  await page.setViewport({ width: 1920, height: 1080 });
  
  console.log("Navigating to http://localhost:3847/...");
  await page.goto('http://localhost:3847/');

  // Wait for DebugOverlay to appear
  await page.waitForSelector('[data-debug="global"]');

  const getDebugStats = async () => {
    return await page.evaluate(() => {
      const getVal = (id) => {
        const el = document.querySelector(`[data-debug="${id}"]`);
        return el ? el.textContent : null;
      };
      return {
        scrollY: getVal('scroll-y'),
        maxScroll: getVal('max-scroll'),
        global: getVal('global'),
        targetFrame: getVal('frame-target'),
        renderedFrame: getVal('frame-rendered'),
        lenisVelocity: getVal('lenis-velocity')
      };
    });
  };

  console.log("\n--- INIT ---");
  console.log(await getDebugStats());

  console.log("\n--- SCROLL TO 25% ---");
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight * 0.25));
  await new Promise(r => setTimeout(r, 1000));
  console.log(await getDebugStats());

  console.log("\n--- SCROLL TO 50% ---");
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight * 0.50));
  await new Promise(r => setTimeout(r, 1000));
  console.log(await getDebugStats());

  console.log("\n--- SCROLL TO 75% ---");
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight * 0.75));
  await new Promise(r => setTimeout(r, 1000));
  console.log(await getDebugStats());

  console.log("\n--- SCROLL TO BOTTOM ---");
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await new Promise(r => setTimeout(r, 2000));
  console.log(await getDebugStats());

  // Physical scroll simulation
  console.log("\n--- WHEEL SCROLL SIMULATION ---");
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 1000));
  
  for (let i = 0; i < 20; i++) {
    await page.mouse.wheel({ deltaY: 500 });
    await new Promise(r => setTimeout(r, 100));
  }
  await new Promise(r => setTimeout(r, 1000));
  console.log(await getDebugStats());

  await browser.close();
})();
