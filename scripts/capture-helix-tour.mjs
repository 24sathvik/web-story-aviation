import puppeteer from "puppeteer";
import path from "path";

const ARTIFACT_DIR = "C:/Users/HP/.gemini/antigravity-ide/brain/9384a28f-bcd7-4418-9e76-b85935b9f03a";

async function run() {
  console.log("Launching Puppeteer browser...");
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  console.log("Navigating to http://localhost:3847/helix-preview...");
  await page.goto("http://localhost:3847/helix-preview", { waitUntil: "networkidle0" });

  // Wait 3s for WebGL scene, canvas textures and 3D meshes to settle
  await new Promise((r) => setTimeout(r, 3000));

  const waypoints = [
    { name: "calib_stage_a_overview.png", progress: 0.0, desc: "Stage A: Establishing Wide Overview" },
    { name: "calib_ch1_ground_school.png", progress: 0.22, desc: "Stage B: Ground School Focus (Front-Right)" },
    { name: "calib_ch2_simulators.png", progress: 0.48, desc: "Stage C: Simulator Labs Focus (Front-Left)" },
    { name: "calib_ch3_flight_training.png", progress: 0.74, desc: "Stage D: Flight Training Focus (Front-Right)" },
    { name: "calib_ch4_advanced_ops.png", progress: 0.92, desc: "Stage E: Advanced Operations Focus (Front-Left)" },
    { name: "calib_stage_f_finale.png", progress: 1.0, desc: "Stage F: Elevated Grand Finale Overview" },
  ];

  for (const wp of waypoints) {
    console.log(`Setting scroll progress to ${(wp.progress * 100).toFixed(1)}% for ${wp.desc}...`);
    await page.evaluate((targetProgress) => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo(0, maxScroll * targetProgress);
    }, wp.progress);

    // Wait for GSAP scrub to smoothly reach target
    await new Promise((r) => setTimeout(r, 1500));

    const outPath = path.join(ARTIFACT_DIR, wp.name);
    await page.screenshot({ path: outPath });
    console.log(`Saved screenshot: ${outPath}`);
  }

  // Reverse test: scroll back up to 0%
  console.log("Testing reverse scroll back to 0%...");
  await page.evaluate(() => {
    window.scrollTo(0, 0);
  });
  await new Promise((r) => setTimeout(r, 1500));
  const reversePath = path.join(ARTIFACT_DIR, "calib_reverse_0_percent.png");
  await page.screenshot({ path: reversePath });
  console.log(`Saved reverse screenshot: ${reversePath}`);

  await browser.close();
  console.log("Puppeteer capture tour complete!");
}

run().catch((err) => {
  console.error("Puppeteer script error:", err);
  process.exit(1);
});
