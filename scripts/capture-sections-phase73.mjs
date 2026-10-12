import puppeteer from "puppeteer";
import path from "path";

const ARTIFACTS_DIR = "C:/Users/HP/.gemini/antigravity-ide/brain/9384a28f-bcd7-4418-9e76-b85935b9f03a";

async function main() {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1440,900"]
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    await page.goto("http://localhost:3847/", { waitUntil: "networkidle0" });
    await new Promise(r => setTimeout(r, 1200));

    // 1. Training Programs
    console.log("Scrolling to Training Programs...");
    await page.evaluate(() => {
      const el = document.getElementById("programs");
      if (el) el.scrollIntoView({ behavior: "instant" });
    });
    await page.evaluate(() => window.scrollBy({ top: 350, behavior: "instant" }));
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "phase73_10_training_programs_cinematic.png") });

    // 2. Modern Fleet section
    console.log("Scrolling to Fleet Section...");
    await page.evaluate(() => {
      const el = document.getElementById("fleet");
      if (el) el.scrollIntoView({ behavior: "instant" });
    });
    await page.evaluate(() => window.scrollBy({ top: 400, behavior: "instant" }));
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "phase73_11_fleet_section_cinematic.png") });

    // 3. Facilities section with Three.js tunnel
    console.log("Scrolling to Facilities Section...");
    await page.evaluate(() => {
      const el = document.getElementById("facilities");
      if (el) el.scrollIntoView({ behavior: "instant" });
    });
    await page.evaluate(() => window.scrollBy({ top: 350, behavior: "instant" }));
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "phase73_12_facilities_threejs_tunnel.png") });

    console.log("Captured all cinematic lower sections!");

  } finally {
    await browser.close();
  }
}

main().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
