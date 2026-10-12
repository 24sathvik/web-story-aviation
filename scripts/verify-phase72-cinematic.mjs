import puppeteer from "puppeteer";
import path from "path";

const ARTIFACTS_DIR = "C:/Users/HP/.gemini/antigravity-ide/brain/9384a28f-bcd7-4418-9e76-b85935b9f03a";

async function main() {
  console.log("Launching browser for Phase 7.2 Cinematic verification...");
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1440,900"]
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    page.on("console", msg => {
      if (msg.type() === "error") console.error("PAGE LOG ERROR:", msg.text());
    });

    console.log("Navigating to http://localhost:3847/...");
    await page.goto("http://localhost:3847/", { waitUntil: "networkidle0", timeout: 30000 });
    await new Promise(r => setTimeout(r, 1200));

    // Scroll to #academy entrance
    console.log("Scrolling into Academy Introduction 3D section...");
    await page.evaluate(() => {
      const el = document.getElementById("academy");
      if (el) el.scrollIntoView({ behavior: "instant" });
    });
    await new Promise(r => setTimeout(r, 800));

    // Scroll down 400px into the 3D camera travel of #academy
    await page.evaluate(() => window.scrollBy({ top: 400, behavior: "instant" }));
    await new Promise(r => setTimeout(r, 600));

    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, "phase72_08_academy_3d_flight_camera.png"),
      fullPage: false
    });
    console.log("Saved screenshot: phase72_08_academy_3d_flight_camera.png");

    // Scroll further into focal plane hold phase
    await page.evaluate(() => window.scrollBy({ top: 500, behavior: "instant" }));
    await new Promise(r => setTimeout(r, 600));

    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, "phase72_09_academy_glass_telemetry.png"),
      fullPage: false
    });
    console.log("Saved screenshot: phase72_09_academy_glass_telemetry.png");

    console.log("Cinematic screenshots captured successfully!");
  } finally {
    await browser.close();
  }
}

main().catch(err => {
  console.error("Verification error:", err);
  process.exit(1);
});
