import puppeteer from "puppeteer";
import path from "path";

const ARTIFACT_DIR = "C:/Users/HP/.gemini/antigravity-ide/brain/9384a28f-bcd7-4418-9e76-b85935b9f03a";

async function run() {
  console.log("Launching Puppeteer for homepage baseline capture...");
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  console.log("Navigating to http://localhost:3847/...");
  await page.goto("http://localhost:3847/", { waitUntil: "domcontentloaded" });

  // Wait 3s for initial load and hydration
  await new Promise((r) => setTimeout(r, 3000));

  const waypoints = [
    { name: "baseline_01_hero_top.png", scrollRatio: 0.0, desc: "Homepage Hero Top (Scroll 0%)" },
    { name: "baseline_02_hero_mid.png", scrollRatio: 0.12, desc: "Hero Mid Progression (Scroll 12%)" },
    { name: "baseline_03_hero_exit.png", scrollRatio: 0.22, desc: "Hero Exit / Section Transition (Scroll 22%)" },
    { name: "baseline_04_academy.png", scrollRatio: 0.35, desc: "Academy Introduction (Scroll 35%)" },
    { name: "baseline_05_programs.png", scrollRatio: 0.50, desc: "Training Programs / Journey (Scroll 50%)" },
    { name: "baseline_06_fleet_facilities.png", scrollRatio: 0.70, desc: "Fleet & Facilities (Scroll 70%)" },
    { name: "baseline_07_admissions_footer.png", scrollRatio: 0.95, desc: "Admissions & Footer (Scroll 95%)" },
  ];

  for (const wp of waypoints) {
    console.log(`Scrolling to ${(wp.scrollRatio * 100).toFixed(1)}% for ${wp.desc}...`);
    await page.evaluate((ratio) => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo(0, maxScroll * ratio);
    }, wp.scrollRatio);

    await new Promise((r) => setTimeout(r, 1200));

    const outPath = path.join(ARTIFACT_DIR, wp.name);
    await page.screenshot({ path: outPath });
    console.log(`Saved screenshot: ${outPath}`);
  }

  // Also capture mobile viewport at hero top
  console.log("Capturing mobile viewport baseline...");
  await page.setViewport({ width: 390, height: 844 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise((r) => setTimeout(r, 1000));
  const mobilePath = path.join(ARTIFACT_DIR, "baseline_08_mobile_top.png");
  await page.screenshot({ path: mobilePath });
  console.log(`Saved mobile screenshot: ${mobilePath}`);

  await browser.close();
  console.log("Homepage baseline capture complete!");
}

run().catch((err) => {
  console.error("Baseline capture error:", err);
  process.exit(1);
});
