import puppeteer from "puppeteer";
import path from "path";

const ARTIFACTS_DIR = "C:/Users/HP/.gemini/antigravity-ide/brain/9384a28f-bcd7-4418-9e76-b85935b9f03a";

async function main() {
  console.log("Launching browser for Phase 7.2 Navbar verification...");
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1440,900"]
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    // Track console & errors
    page.on("console", msg => {
      if (msg.type() === "error") console.error("PAGE LOG ERROR:", msg.text());
    });

    console.log("Navigating to http://localhost:3847/...");
    await page.goto("http://localhost:3847/", { waitUntil: "networkidle0", timeout: 30000 });
    await new Promise(r => setTimeout(r, 1500));

    // 1. Scroll position zero
    const headerAtZero = await page.evaluate(() => {
      const h = document.querySelector("header");
      if (!h) return null;
      const cs = window.getComputedStyle(h);
      return {
        className: h.className,
        backgroundColor: cs.backgroundColor,
        borderBottomWidth: cs.borderBottomWidth,
        borderBottomColor: cs.borderBottomColor,
        backdropFilter: cs.backdropFilter,
        boxShadow: cs.boxShadow,
        scrollY: window.scrollY
      };
    });
    console.log("Header at scroll 0:", JSON.stringify(headerAtZero, null, 2));

    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, "phase72_01_navbar_zero_transparent.png"),
      fullPage: false
    });
    console.log("Saved screenshot: phase72_01_navbar_zero_transparent.png");

    // 2. Final portion of hero (e.g. scroll to 3800px, where hero is near frame 220-230)
    console.log("Scrolling to final portion of hero (scrollY ~ 3800)...");
    await page.evaluate(() => window.scrollTo({ top: 3800, behavior: "instant" }));
    await new Promise(r => setTimeout(r, 1000));

    const headerAtHeroEnd = await page.evaluate(() => {
      const h = document.querySelector("header");
      const cs = window.getComputedStyle(h);
      return {
        scrollY: window.scrollY,
        backgroundColor: cs.backgroundColor,
        borderBottomWidth: cs.borderBottomWidth,
        borderBottomColor: cs.borderBottomColor,
        boxShadow: cs.boxShadow,
        className: h.className
      };
    });
    console.log("Header at final portion of hero:", JSON.stringify(headerAtHeroEnd, null, 2));

    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, "phase72_02_navbar_final_hero.png"),
      fullPage: false
    });
    console.log("Saved screenshot: phase72_02_navbar_final_hero.png");

    // 3. First section after hero (#academy)
    console.log("Scrolling to #academy...");
    await page.evaluate(() => {
      const el = document.getElementById("academy");
      if (el) el.scrollIntoView({ behavior: "instant" });
    });
    await new Promise(r => setTimeout(r, 1000));

    const headerAtAcademy = await page.evaluate(() => {
      const h = document.querySelector("header");
      const cs = window.getComputedStyle(h);
      return {
        scrollY: window.scrollY,
        backgroundColor: cs.backgroundColor,
        borderBottomColor: cs.borderBottomColor,
        backdropFilter: cs.backdropFilter,
        boxShadow: cs.boxShadow,
        className: h.className
      };
    });
    console.log("Header at #academy:", JSON.stringify(headerAtAcademy, null, 2));

    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, "phase72_03_navbar_after_hero_glass.png"),
      fullPage: false
    });
    console.log("Saved screenshot: phase72_03_navbar_after_hero_glass.png");

    // 4. Dark cinematic section (e.g. #fleet or #facilities)
    console.log("Scrolling to #fleet...");
    await page.evaluate(() => {
      const el = document.getElementById("fleet");
      if (el) el.scrollIntoView({ behavior: "instant" });
    });
    await new Promise(r => setTimeout(r, 1000));

    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, "phase72_04_navbar_dark_section.png"),
      fullPage: false
    });
    console.log("Saved screenshot: phase72_04_navbar_dark_section.png");

    // 5. Reverse scrolling back to top
    console.log("Reverse scrolling back to scrollY = 0...");
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await new Promise(r => setTimeout(r, 1200));

    const headerAtTopAgain = await page.evaluate(() => {
      const h = document.querySelector("header");
      const cs = window.getComputedStyle(h);
      return {
        scrollY: window.scrollY,
        backgroundColor: cs.backgroundColor,
        borderBottomWidth: cs.borderBottomWidth,
        borderBottomColor: cs.borderBottomColor,
        boxShadow: cs.boxShadow,
        className: h.className
      };
    });
    console.log("Header back at top:", JSON.stringify(headerAtTopAgain, null, 2));

    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, "phase72_05_navbar_reverse_top.png"),
      fullPage: false
    });
    console.log("Saved screenshot: phase72_05_navbar_reverse_top.png");

    // 6. Mobile viewport (390x844) over hero
    console.log("Testing mobile viewport 390x844...");
    await page.setViewport({ width: 390, height: 844 });
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await new Promise(r => setTimeout(r, 1000));

    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, "phase72_06_mobile_hero_transparent.png"),
      fullPage: false
    });
    console.log("Saved screenshot: phase72_06_mobile_hero_transparent.png");

    // 7. Mobile opened menu
    console.log("Opening mobile navigation drawer...");
    const hamburger = await page.$("button[aria-label='Open navigation menu']");
    if (hamburger) {
      await hamburger.click();
      await new Promise(r => setTimeout(r, 600));
    }

    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, "phase72_07_mobile_menu_open.png"),
      fullPage: false
    });
    console.log("Saved screenshot: phase72_07_mobile_menu_open.png");

    console.log("All 7 acceptance test screenshots captured successfully!");
  } finally {
    await browser.close();
  }
}

main().catch(err => {
  console.error("Verification error:", err);
  process.exit(1);
});
