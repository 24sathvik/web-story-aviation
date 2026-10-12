import puppeteer from "puppeteer";

async function profileSlowScroll() {
  console.log("Launching profiler for slow scroll inspection...");
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1440,900"]
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    await page.goto("http://localhost:3847/", { waitUntil: "networkidle0" });
    await new Promise(r => setTimeout(r, 1500));

    console.log("Simulating very slow scrolling (1-3px increments over 150 steps)...");
    const frameSamples = [];

    // Scroll slowly in 2px increments
    for (let i = 0; i < 150; i++) {
      await page.evaluate(() => {
        window.scrollBy({ top: 3, behavior: "instant" });
      });
      // Short delay between scroll events (typical slow wheel/trackpad pace)
      await new Promise(r => setTimeout(r, 20));

      if (i % 10 === 0) {
        const stats = await page.evaluate(() => {
          const win = window;
          return {
            scrollY: window.scrollY,
            target: win.__DEBUG_FRAME_TARGET,
            rendered: win.__DEBUG_FRAME_RENDERED,
            cacheSize: win.__DEBUG_CACHE_SIZE,
            hits: win.__DEBUG_HITS,
            misses: win.__DEBUG_MISSES,
            evictions: win.__DEBUG_EVICTIONS,
            queued: win.__DEBUG_LOAD_QUEUE,
            inFlight: win.__DEBUG_IN_FLIGHT
          };
        });
        frameSamples.push(stats);
      }
    }

    console.log("Slow scroll sample results:", JSON.stringify(frameSamples, null, 2));

    // Also test fast scrub to frame 120 and then very slow reverse scrub
    console.log("Scrubbing to 2000px, then slow reverse scrub...");
    await page.evaluate(() => window.scrollTo({ top: 2000, behavior: "instant" }));
    await new Promise(r => setTimeout(r, 800));

    const reverseSamples = [];
    for (let i = 0; i < 50; i++) {
      await page.evaluate(() => window.scrollBy({ top: -3, behavior: "instant" }));
      await new Promise(r => setTimeout(r, 20));
      if (i % 10 === 0) {
        const stats = await page.evaluate(() => {
          const win = window;
          return {
            scrollY: window.scrollY,
            target: win.__DEBUG_FRAME_TARGET,
            rendered: win.__DEBUG_FRAME_RENDERED,
            cacheSize: win.__DEBUG_CACHE_SIZE,
            hits: win.__DEBUG_HITS,
            misses: win.__DEBUG_MISSES,
            evictions: win.__DEBUG_EVICTIONS
          };
        });
        reverseSamples.push(stats);
      }
    }

    console.log("Reverse slow scroll results:", JSON.stringify(reverseSamples, null, 2));

  } finally {
    await browser.close();
  }
}

profileSlowScroll().catch(console.error);
