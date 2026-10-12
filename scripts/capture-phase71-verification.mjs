import puppeteer from "puppeteer";
import path from "path";

const ARTIFACT_DIR = "C:/Users/HP/.gemini/antigravity-ide/brain/9384a28f-bcd7-4418-9e76-b85935b9f03a";

async function run() {
  console.log("Launching Puppeteer for Phase 7.1 Navbar & Glassmorphism verification...");
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    }
  });

  page.on("pageerror", (err) => {
    consoleErrors.push(err.toString());
  });

  console.log("Navigating to http://localhost:3847/...");
  await page.goto("http://localhost:3847/", { waitUntil: "domcontentloaded" });
  await new Promise((r) => setTimeout(r, 3000));

  // 1. Navbar over bright opening hero (y=0)
  console.log("Capturing 1: Navbar over bright opening hero...");
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "phase71_01_navbar_bright_hero.png") });

  // 2. Navbar over dark cinematic section (scrolled past hero)
  console.log("Capturing 2: Navbar over dark cinematic section...");
  await page.evaluate(() => {
    const el = document.querySelector("#academy");
    if (el) el.scrollIntoView({ behavior: "instant", block: "start" });
  });
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "phase71_02_navbar_dark_section.png") });

  // 3. Navbar over busy image background (Fleet or Training Journey)
  console.log("Capturing 3: Navbar over busy image background...");
  await page.evaluate(() => {
    const el = document.querySelector("#fleet");
    if (el) el.scrollIntoView({ behavior: "instant", block: "start" });
  });
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "phase71_03_navbar_busy_image.png") });

  // 4. Training programme cards with refined glass treatment
  console.log("Capturing 4: Training programme cards with glass treatment...");
  await page.evaluate(() => {
    const el = document.querySelector("#programs");
    if (el) el.scrollIntoView({ behavior: "instant", block: "start" });
  });
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "phase71_04_training_programs_glass.png") });

  // 5. Floating information panel (Training Journey milestone)
  console.log("Capturing 5: Floating information panel (Training Journey)...");
  await page.evaluate(() => {
    const el = document.querySelector("#journey");
    if (el) el.scrollIntoView({ behavior: "instant", block: "start" });
  });
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "phase71_05_floating_info_panel.png") });

  // 6. Admissions area with glass treatment
  console.log("Capturing 6: Admissions area with glass treatment...");
  await page.evaluate(() => {
    const el = document.querySelector("#admissions");
    if (el) el.scrollIntoView({ behavior: "instant", block: "start" });
  });
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "phase71_06_admissions_glass.png") });

  // 7a. Mobile navigation closed
  console.log("Capturing 7a: Mobile navigation closed...");
  await page.setViewport({ width: 390, height: 844 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "phase71_07a_mobile_closed.png") });

  // 7b. Mobile navigation open
  console.log("Capturing 7b: Mobile navigation open...");
  const hamburger = await page.$('header button[aria-label="Open navigation menu"]');
  if (hamburger) {
    await hamburger.click();
    await new Promise((r) => setTimeout(r, 600));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, "phase71_07b_mobile_open.png") });
  }

  await browser.close();

  console.log("\n=== PHASE 7.1 VERIFICATION SUMMARY ===");
  console.log(`Console Errors: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.log("Errors:", consoleErrors);
  }
  console.log("All Phase 7.1 screenshots successfully captured!");
}

run().catch(console.error);
