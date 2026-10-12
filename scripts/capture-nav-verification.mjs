import puppeteer from "puppeteer";
import path from "path";

const ARTIFACT_DIR = "C:/Users/HP/.gemini/antigravity-ide/brain/9384a28f-bcd7-4418-9e76-b85935b9f03a";

async function run() {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  console.log("Navigating to http://localhost:3847/...");
  await page.goto("http://localhost:3847/", { waitUntil: "domcontentloaded" });
  await new Promise((r) => setTimeout(r, 3500));

  // 1. Navigation over opening hero sky
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "nav_verified_desktop_hero.png") });

  // 2. Navigation over mid-progression
  await page.evaluate(() => window.scrollTo(0, 2000));
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "nav_verified_desktop_mid.png") });

  // 3. Navigation on mobile viewport
  await page.setViewport({ width: 390, height: 844 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "nav_verified_mobile_top.png") });

  await browser.close();
  console.log("Navigation verification screenshots captured!");
}

run().catch(console.error);
