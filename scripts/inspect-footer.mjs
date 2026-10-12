import puppeteer from "puppeteer";

async function inspectFooter() {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1440,900"]
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    await page.goto("http://localhost:3847/", { waitUntil: "networkidle0" });

    // Inspect footer
    const footerInfo = await page.evaluate(() => {
      const f = document.querySelector("footer");
      if (!f) return { exists: false };
      const cs = window.getComputedStyle(f);
      const rect = f.getBoundingClientRect();
      const docHeight = document.documentElement.scrollHeight;
      return {
        exists: true,
        rect: {
          top: rect.top,
          bottom: rect.bottom,
          left: rect.left,
          right: rect.right,
          width: rect.width,
          height: rect.height
        },
        display: cs.display,
        visibility: cs.visibility,
        opacity: cs.opacity,
        zIndex: cs.zIndex,
        position: cs.position,
        overflow: cs.overflow,
        docHeight,
        parentElement: f.parentElement ? f.parentElement.tagName : null,
        prevSibling: f.previousElementSibling ? {
          tag: f.previousElementSibling.tagName,
          id: f.previousElementSibling.id,
          rect: f.previousElementSibling.getBoundingClientRect()
        } : null
      };
    });

    console.log("Footer Info at top of page:", JSON.stringify(footerInfo, null, 2));

    // Scroll to the very bottom
    await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
    await new Promise(r => setTimeout(r, 1000));

    const footerAtBottom = await page.evaluate(() => {
      const f = document.querySelector("footer");
      if (!f) return null;
      const rect = f.getBoundingClientRect();
      return {
        scrollY: window.scrollY,
        maxScroll: document.documentElement.scrollHeight - window.innerHeight,
        rect: {
          top: rect.top,
          bottom: rect.bottom,
          height: rect.height,
          inViewport: rect.top < window.innerHeight && rect.bottom > 0
        }
      };
    });

    console.log("Footer Info after scrolling to bottom:", JSON.stringify(footerAtBottom, null, 2));

    await page.screenshot({ path: "C:/Users/HP/.gemini/antigravity-ide/brain/9384a28f-bcd7-4418-9e76-b85935b9f03a/inspect_footer_bottom.png" });
    console.log("Captured inspect_footer_bottom.png");

  } finally {
    await browser.close();
  }
}

inspectFooter().catch(console.error);
