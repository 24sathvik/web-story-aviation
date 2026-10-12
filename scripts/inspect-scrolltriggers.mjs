import puppeteer from "puppeteer";

async function inspectScrollTriggers() {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1440,900"]
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    await page.goto("http://localhost:3847/", { waitUntil: "networkidle0" });
    await new Promise(r => setTimeout(r, 1500));

    const triggerData = await page.evaluate(() => {
      // Access ScrollTrigger instances from GSAP
      const gsap = window.gsap;
      const ScrollTrigger = window.ScrollTrigger;
      
      const pinSpacers = Array.from(document.querySelectorAll(".pin-spacer")).map(ps => ({
        className: ps.className,
        style: ps.getAttribute("style"),
        height: ps.offsetHeight,
        childTag: ps.firstElementChild ? ps.firstElementChild.tagName : null,
        childId: ps.firstElementChild ? ps.firstElementChild.id : null,
        childClass: ps.firstElementChild ? ps.firstElementChild.className : null
      }));

      // Check if any element covers the footer
      const footer = document.querySelector("footer");
      const footerRect = footer ? footer.getBoundingClientRect() : null;

      // Scroll through page and check footer reachability
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

      return {
        pinSpacers,
        footerRect,
        maxScroll,
        docHeight: document.documentElement.scrollHeight,
        bodyHeight: document.body.offsetHeight,
        mainHeight: document.querySelector("main") ? document.querySelector("main").offsetHeight : null
      };
    });

    console.log("ScrollTrigger & Pin Inspection:", JSON.stringify(triggerData, null, 2));

  } finally {
    await browser.close();
  }
}

inspectScrollTriggers().catch(console.error);
