const puppeteer = require("puppeteer");
const fs = require("fs");

async function runTest() {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  
  // Set viewport to a standard desktop size
  await page.setViewport({ width: 1920, height: 1080 });

  console.log("Navigating to http://localhost:3847/...");
  await page.goto("http://localhost:3847/", { waitUntil: "domcontentloaded" });

  // Wait for initial render
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const samples = [];
  let isScrolling = true;

  // Polling loop
  const poll = async () => {
    while (isScrolling) {
      const data = await page.evaluate(() => {
        const win = window;
        return {
          timestamp: performance.now(),
          scrollY: window.scrollY,
          maxScroll: document.documentElement.scrollHeight - window.innerHeight,
          globalProgress: win.__DEBUG_PROGRESS || 0,
          targetFrame: win.__DEBUG_FRAME_TARGET || 1,
          renderedFrame: win.__DEBUG_FRAME_RENDERED || 1,
        };
      });
      samples.push(data);
      await new Promise((resolve) => setTimeout(resolve, 16)); // ~60fps polling
    }
  };

  const pollPromise = poll();

  console.log("Starting continuous smooth scroll...");
  
  // Perform smooth scroll
  await page.evaluate(async () => {
    return new Promise((resolve) => {
      let currentScroll = 0;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const step = maxScroll / (90); // 90 frames of scroll ~ 1.5 seconds at 60fps

      function stepScroll() {
        currentScroll += step;
        window.scrollTo(0, currentScroll);
        
        if (currentScroll < maxScroll) {
          requestAnimationFrame(stepScroll);
        } else {
          // Wait a bit at the end
          setTimeout(resolve, 1000);
        }
      }
      
      requestAnimationFrame(stepScroll);
    });
  });

  isScrolling = false;
  await pollPromise;

  await browser.close();
  
  // Process samples
  if (samples.length === 0) {
    console.log("No samples collected.");
    return;
  }

  const startTime = samples[0].timestamp;
  let missingFrames = 0;
  let largestJump = 0;
  let longestFreezeMs = 0;
  let uniqueFrames = new Set();
  
  let currentFreezeStart = startTime;
  let lastRenderedFrame = samples[0].renderedFrame;

  const formattedSamples = samples.map(s => {
    const t = ((s.timestamp - startTime) / 1000).toFixed(3);
    
    uniqueFrames.add(s.renderedFrame);
    
    // Jump calculation
    const jump = s.renderedFrame - lastRenderedFrame;
    if (jump > largestJump) largestJump = jump;
    
    // Freeze calculation
    if (s.renderedFrame === lastRenderedFrame && s.targetFrame !== lastRenderedFrame) {
        const freezeDuration = s.timestamp - currentFreezeStart;
        if (freezeDuration > longestFreezeMs) {
            longestFreezeMs = freezeDuration;
        }
    } else {
        currentFreezeStart = s.timestamp;
    }
    
    lastRenderedFrame = s.renderedFrame;

    return `${t}s | scrollY=${Math.round(s.scrollY)} | target=${s.targetFrame} | rendered=${s.renderedFrame} | progress=${s.globalProgress.toFixed(4)}`;
  });

  console.log("--- SAMPLES (subset) ---");
  console.log(formattedSamples.slice(0, 10).join("\n"));
  console.log("...");
  console.log(formattedSamples.slice(-10).join("\n"));

  console.log("\n--- STATISTICS ---");
  console.log(`Total Samples: ${samples.length}`);
  console.log(`Unique Frames Rendered: ${uniqueFrames.size} / 240`);
  console.log(`Largest Frame Jump: ${largestJump}`);
  console.log(`Longest Render Freeze: ${Math.round(longestFreezeMs)}ms`);
  
  const minRendered = Math.min(...Array.from(uniqueFrames));
  const maxRendered = Math.max(...Array.from(uniqueFrames));
  console.log(`Rendered Range: ${minRendered} -> ${maxRendered}`);
  
  fs.writeFileSync("continuity-results.txt", formattedSamples.join("\n"));
}

runTest().catch(console.error);
