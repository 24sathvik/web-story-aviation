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

  await page.goto("http://localhost:3847/", { waitUntil: "domcontentloaded" });
  await new Promise((r) => setTimeout(r, 2000));

  // Capture hero frame at scroll progress 0.25
  await page.evaluate(() => {
    window.scrollTo(0, 1500);
  });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "hero_verified_frame_1500px.png") });

  // Capture hero frame at scroll progress 0.50
  await page.evaluate(() => {
    window.scrollTo(0, 3000);
  });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "hero_verified_frame_3000px.png") });

  // Reverse back to 500px
  await page.evaluate(() => {
    window.scrollTo(0, 500);
  });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "hero_verified_reverse_500px.png") });

  await browser.close();
  console.log("Hero verification frames captured!");
}

run().catch(console.error);
