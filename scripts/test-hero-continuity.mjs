import puppeteer from "puppeteer";

async function run() {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  console.log("Navigating to http://localhost:3847/ for Hero Continuity Test...");
  await page.goto("http://localhost:3847/", { waitUntil: "domcontentloaded" });
  await new Promise((r) => setTimeout(r, 2000));

  const samples = [];
  let isSampling = true;

  const poll = async () => {
    while (isSampling) {
      const data = await page.evaluate(() => {
        const win = window;
        return {
          t: performance.now(),
          scrollY: window.scrollY,
          progress: win.__DEBUG_PROGRESS || 0,
          target: win.__DEBUG_FRAME_TARGET || 1,
          rendered: win.__DEBUG_FRAME_RENDERED || 1,
          cache: win.__DEBUG_CACHE_SIZE || 0,
        };
      });
      samples.push(data);
      await new Promise((r) => setTimeout(r, 25)); // ~40Hz sampling
    }
  };

  const pollPromise = poll();

  // 1. Slow scroll through Hero (0 to 4500px over 4.5 seconds = ~1000px/s)
  console.log("Phase 1: Slow continuous scroll through hero track...");
  await page.evaluate(async () => {
    return new Promise((resolve) => {
      let y = 0;
      const targetY = 4500;
      const totalSteps = 180; // 3 seconds at 60fps
      const step = targetY / totalSteps;
      let count = 0;

      function stepScroll() {
        y += step;
        window.scrollTo(0, y);
        count++;
        if (count < totalSteps) {
          requestAnimationFrame(stepScroll);
        } else {
          resolve();
        }
      }
      requestAnimationFrame(stepScroll);
    });
  });

  await new Promise((r) => setTimeout(r, 1000));

  // 2. Reverse scroll back to 0
  console.log("Phase 2: Reverse scroll back to top...");
  await page.evaluate(async () => {
    return new Promise((resolve) => {
      let y = window.scrollY;
      const totalSteps = 120;
      const step = y / totalSteps;
      let count = 0;

      function stepScroll() {
        y -= step;
        window.scrollTo(0, Math.max(0, y));
        count++;
        if (count < totalSteps) {
          requestAnimationFrame(stepScroll);
        } else {
          resolve();
        }
      }
      requestAnimationFrame(stepScroll);
    });
  });

  await new Promise((r) => setTimeout(r, 1000));

  isSampling = false;
  await pollPromise;
  await browser.close();

  const uniqueFrames = new Set(samples.map((s) => s.rendered));
  const maxTarget = Math.max(...samples.map((s) => s.target));
  const maxRendered = Math.max(...samples.map((s) => s.rendered));
  const minRendered = Math.min(...samples.map((s) => s.rendered));

  console.log("\n=== HERO CONTINUITY RESULTS ===");
  console.log(`Total Samples: ${samples.length}`);
  console.log(`Unique Frames Rendered: ${uniqueFrames.size}`);
  console.log(`Target Range: 1 -> ${maxTarget}`);
  console.log(`Rendered Range: ${minRendered} -> ${maxRendered}`);
  console.log(`Cache peak: ${Math.max(...samples.map((s) => s.cache))}`);
  console.log("Sample head:", samples.slice(0, 5));
  console.log("Sample mid:", samples.slice(Math.floor(samples.length / 2), Math.floor(samples.length / 2) + 5));
  console.log("Sample tail:", samples.slice(-5));
}

run().catch(console.error);
