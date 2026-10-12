import puppeteer from "puppeteer";
import path from "path";

const ARTIFACTS_DIR = "C:/Users/HP/.gemini/antigravity-ide/brain/9384a28f-bcd7-4418-9e76-b85935b9f03a";

async function main() {
  console.log("Launching browser for Phase 7.3 verification...");
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
    await new Promise(r => setTimeout(r, 1500));

    // Helper to inspect header
    const getHeaderStyles = async () => {
      return await page.evaluate(() => {
        const h = document.querySelector("header");
        if (!h) return null;
        const cs = window.getComputedStyle(h);
        return {
          scrollY: window.scrollY,
          backgroundColor: cs.backgroundColor,
          borderBottomWidth: cs.borderBottomWidth,
          borderBottomColor: cs.borderBottomColor,
          backdropFilter: cs.backdropFilter,
          boxShadow: cs.boxShadow,
          className: h.className
        };
      });
    };

    // 1. Hero start (scrollY = 0)
    console.log("1. Inspecting Hero start...");
    const h1 = await getHeaderStyles();
    console.log("Hero Start Header:", JSON.stringify(h1, null, 2));
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "phase73_01_hero_start.png") });

    // 2. Early hero scrolling (scrollY = 1200)
    console.log("2. Early hero scrolling (scrollY = 1200)...");
    await page.evaluate(() => window.scrollTo({ top: 1200, behavior: "instant" }));
    await new Promise(r => setTimeout(r, 600));
    const h2 = await getHeaderStyles();
    console.log("Early Hero Header:", JSON.stringify(h2, null, 2));
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "phase73_02_hero_early.png") });

    // 3. Middle of the hero (scrollY = 2600)
    console.log("3. Middle of the hero (scrollY = 2600)...");
    await page.evaluate(() => window.scrollTo({ top: 2600, behavior: "instant" }));
    await new Promise(r => setTimeout(r, 600));
    const h3 = await getHeaderStyles();
    console.log("Middle Hero Header:", JSON.stringify(h3, null, 2));
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "phase73_03_hero_middle.png") });

    // 4. Final portion of the hero (scrollY = 4500)
    console.log("4. Final portion of the hero (scrollY = 4500)...");
    await page.evaluate(() => window.scrollTo({ top: 4500, behavior: "instant" }));
    await new Promise(r => setTimeout(r, 600));
    const h4 = await getHeaderStyles();
    console.log("Final Hero Header:", JSON.stringify(h4, null, 2));
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "phase73_04_hero_final.png") });

    // 5. First section after the hero (#academy)
    console.log("5. First section after hero (#academy)...");
    await page.evaluate(() => {
      const el = document.getElementById("academy");
      if (el) el.scrollIntoView({ behavior: "instant" });
    });
    // Add extra 200px to be well into Academy
    await page.evaluate(() => window.scrollBy({ top: 250, behavior: "instant" }));
    await new Promise(r => setTimeout(r, 800));
    const h5 = await getHeaderStyles();
    console.log("After Hero (#academy) Header:", JSON.stringify(h5, null, 2));
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "phase73_05_after_hero_academy.png") });

    // 6. Reverse scrolling back into the hero (scrollY = 2500)
    console.log("6. Reverse scrolling back into the hero (scrollY = 2500)...");
    await page.evaluate(() => window.scrollTo({ top: 2500, behavior: "instant" }));
    await new Promise(r => setTimeout(r, 800));
    const h6 = await getHeaderStyles();
    console.log("Reverse Scroll Back into Hero Header:", JSON.stringify(h6, null, 2));
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "phase73_06_hero_reverse.png") });

    // 7. Footer restoration check at the actual bottom of the page
    console.log("7. Scrolling to the actual bottom to verify Footer...");
    await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
    await new Promise(r => setTimeout(r, 1200));

    const footerDetails = await page.evaluate(() => {
      const f = document.querySelector("footer");
      if (!f) return { exists: false };
      const rect = f.getBoundingClientRect();
      const links = Array.from(f.querySelectorAll("a")).map(a => ({
        label: a.textContent.trim(),
        href: a.getAttribute("href")
      }));
      return {
        exists: true,
        id: f.id,
        inViewport: rect.top < window.innerHeight && rect.bottom > 0,
        rect: {
          top: rect.top,
          bottom: rect.bottom,
          height: rect.height
        },
        linksCount: links.length,
        links: links.slice(0, 6)
      };
    });
    console.log("Footer verification at bottom:", JSON.stringify(footerDetails, null, 2));

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "phase73_07_footer_restored_bottom.png") });
    console.log("Captured phase73_07_footer_restored_bottom.png");

    // 8. Mobile verification (390x844)
    console.log("8. Mobile viewport verification...");
    await page.setViewport({ width: 390, height: 844 });
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "phase73_08_mobile_hero_transparent.png") });

    await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "phase73_09_mobile_footer_restored.png") });

    console.log("All Phase 7.3 verification screenshots captured successfully!");

  } finally {
    await browser.close();
  }
}

main().catch(err => {
  console.error("Verification error:", err);
  process.exit(1);
});
