import puppeteer from "puppeteer";

async function measureSections() {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1440,900"]
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto("http://localhost:3847/", { waitUntil: "networkidle0" });

    const sections = await page.evaluate(() => {
      const ids = [
        "cinematic-scroll-track",
        "academy",
        "programs",
        "journey",
        "fleet",
        "facilities",
        "why-choose-us",
        "stories",
        "faq",
        "admissions",
        "footer"
      ];

      return ids.map(id => {
        let el = id === "cinematic-scroll-track" ? document.querySelector("." + id) : (id === "footer" ? document.querySelector("footer") : document.getElementById(id));
        if (!el) return { id, exists: false };
        const rect = el.getBoundingClientRect();
        return {
          id,
          exists: true,
          offsetTop: el.offsetTop,
          offsetHeight: el.offsetHeight,
          rectHeight: rect.height,
          rectTop: rect.top
        };
      });
    });

    console.log("Sections inventory:", JSON.stringify(sections, null, 2));

  } finally {
    await browser.close();
  }
}

measureSections().catch(console.error);
