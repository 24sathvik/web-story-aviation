import puppeteer from "puppeteer";
import path from "path";

const ARTIFACT_DIR = "C:/Users/HP/.gemini/antigravity-ide/brain/9384a28f-bcd7-4418-9e76-b85935b9f03a";

async function run() {
  console.log("Launching Puppeteer for comprehensive master homepage tour...");
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  console.log("Navigating to http://localhost:3847/...");
  await page.goto("http://localhost:3847/", { waitUntil: "domcontentloaded" });

  // Wait 3.5s for initial assets and frames to settle
  await new Promise((r) => setTimeout(r, 3500));

  const tourPoints = [
    { name: "tour_01_hero_opening.png", selector: null, y: 0, desc: "Scene A: Aircraft Hero Opening" },
    { name: "tour_02_hero_flight.png", selector: null, y: 3000, desc: "Scene A: Mid-Flight Hero Scrub" },
    { name: "tour_03_academy.png", selector: "#academy", desc: "Scene B: Academy Introduction & Spatial Typography" },
    { name: "tour_04_programs.png", selector: "#programs", desc: "Scene C: Training Programmes Active View" },
    { name: "tour_05_journey.png", selector: "#journey", desc: "Scene D: Horizontal Training Journey Sequence" },
    { name: "tour_06_fleet.png", selector: "#fleet", desc: "Scene D: Modern Fleet Presentation" },
    { name: "tour_07_facilities.png", selector: "#facilities", desc: "Scene E: Flight Simulation & Campus Facilities" },
    { name: "tour_08_proof.png", selector: "#why-choose-us", desc: "Scene E: Verified Standards & Philosophy" },
    { name: "tour_08b_stories_faq.png", selector: "#faq", desc: "Scene E: Stories & Real Admissions FAQ" },
    { name: "tour_09_admissions.png", selector: "#admissions", desc: "Scene F: Admissions Transition" },
    { name: "tour_09b_footer.png", selector: "footer", desc: "Scene F: Branded Footer" },
  ];

  for (const pt of tourPoints) {
    console.log(`Navigating to ${pt.desc} (${pt.name})...`);
    await page.evaluate((point) => {
      if (point.selector) {
        const el = document.querySelector(point.selector);
        if (el) {
          el.scrollIntoView({ behavior: "instant", block: "start" });
          return;
        }
      }
      window.scrollTo(0, point.y || 0);
    }, pt);

    await new Promise((r) => setTimeout(r, 1200));

    const outPath = path.join(ARTIFACT_DIR, pt.name);
    await page.screenshot({ path: outPath });
    console.log(`Saved screenshot: ${outPath}`);
  }

  // Mobile drawer test
  console.log("Testing mobile menu drawer opening...");
  await page.setViewport({ width: 390, height: 844 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise((r) => setTimeout(r, 1000));
  
  // Click mobile hamburger button
  const hamburgerBtn = await page.$('header button[aria-label="Open navigation menu"]');
  if (hamburgerBtn) {
    await hamburgerBtn.click();
    await new Promise((r) => setTimeout(r, 600));
    const drawerPath = path.join(ARTIFACT_DIR, "tour_10_mobile_drawer_open.png");
    await page.screenshot({ path: drawerPath });
    console.log(`Saved mobile drawer screenshot: ${drawerPath}`);
  }

  await browser.close();
  console.log("Master homepage tour complete!");
}

run().catch(console.error);
