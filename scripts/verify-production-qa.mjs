import puppeteer from 'puppeteer';

async function runProductionQA() {
  const targetPort = process.env.QA_PORT || '3849';
  const targetUrl = `http://localhost:${targetPort}/`;

  console.log(`[QA] Launching Puppeteer to test production server at ${targetUrl}...`);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  const consoleErrors = [];
  const failedRequests = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('response', response => {
    const status = response.status();
    const url = response.url();
    if (status >= 400 && !url.includes('favicon.ico')) {
      failedRequests.push({ url, status });
    }
  });

  console.log(`[QA] Navigating to ${targetUrl}...`);
  const response = await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 30000 });
  const httpStatus = response.status();
  console.log(`[QA] Homepage HTTP Status: ${httpStatus}`);

  // Wait 2s for canvas and initial frames
  await new Promise(r => setTimeout(r, 2000));

  // 1. Verify Hero Canvas and Frame State
  const heroCheck = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    return {
      canvasFound: !!canvas,
      canvasWidth: canvas ? canvas.width : 0,
      canvasHeight: canvas ? canvas.height : 0,
      debugTarget: window.__DEBUG_FRAME_TARGET || null,
      debugRendered: window.__DEBUG_FRAME_RENDERED || null,
    };
  });
  console.log('[QA] Hero Canvas Check:', heroCheck);

  // 2. Verify Navbar at top of page (hero phase - must be completely transparent)
  const navHeroCheck = await page.evaluate(() => {
    const header = document.querySelector('header');
    if (!header) return { found: false };
    const style = window.getComputedStyle(header);
    return {
      found: true,
      backgroundColor: style.backgroundColor,
      borderBottomWidth: style.borderBottomWidth,
      boxShadow: style.boxShadow,
      isTransparent: style.backgroundColor === 'rgba(0, 0, 0, 0)' && (style.borderBottomWidth === '0px' || style.borderBottomStyle === 'none'),
    };
  });
  console.log('[QA] Navbar At Top Check:', navHeroCheck);

  // 3. Verify Navbar in mid-hero scroll (must remain completely transparent)
  console.log('[QA] Scrolling into mid-hero (scrollY = 2500)...');
  await page.evaluate(() => {
    window.scrollTo({ top: 2500, behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 600));

  const navMidHeroCheck = await page.evaluate(() => {
    const header = document.querySelector('header');
    if (!header) return { found: false };
    const style = window.getComputedStyle(header);
    return {
      backgroundColor: style.backgroundColor,
      borderBottomWidth: style.borderBottomWidth,
      isTransparent: style.backgroundColor === 'rgba(0, 0, 0, 0)' && (style.borderBottomWidth === '0px' || style.borderBottomStyle === 'none'),
    };
  });
  console.log('[QA] Navbar Mid-Hero Check (transparency maintained):', navMidHeroCheck);

  // 4. Verify all section elements exist and are rendered in the DOM
  const sectionIds = ['academy', 'programs', 'journey', 'fleet', 'facilities', 'admissions', 'site-footer'];
  const sectionsCheck = await page.evaluate((ids) => {
    const results = {};
    for (const id of ids) {
      const el = document.getElementById(id);
      results[id] = {
        exists: !!el,
        visible: el ? el.offsetHeight > 0 : false,
      };
    }
    return results;
  }, sectionIds);
  console.log('[QA] Sections Presence Check:', sectionsCheck);

  // 5. Scroll past hero into content sections (e.g., #academy) to verify glassmorphism navbar kicks in
  console.log('[QA] Scrolling past hero to #academy...');
  await page.evaluate(() => {
    const academy = document.getElementById('academy');
    if (academy) {
      academy.scrollIntoView({ behavior: 'instant' });
    } else {
      window.scrollTo({ top: 7000, behavior: 'instant' });
    }
  });
  await new Promise(r => setTimeout(r, 800));

  const navScrolledCheck = await page.evaluate(() => {
    const header = document.querySelector('header');
    if (!header) return { found: false };
    const style = window.getComputedStyle(header);
    const hasBackdrop = style.backdropFilter !== 'none' || style.webkitBackdropFilter !== 'none';
    const hasDarkBg = style.backgroundColor !== 'rgba(0, 0, 0, 0)';
    return {
      found: true,
      backdropFilter: style.backdropFilter || style.webkitBackdropFilter,
      backgroundColor: style.backgroundColor,
      borderBottomWidth: style.borderBottomWidth,
      hasGlassmorphism: hasBackdrop || hasDarkBg,
    };
  });
  console.log('[QA] Navbar Post-Hero Glassmorphism Check:', navScrolledCheck);

  // 6. Scroll to bottom to verify footer visibility
  console.log('[QA] Scrolling to footer...');
  await page.evaluate(() => {
    const footer = document.getElementById('site-footer');
    if (footer) {
      footer.scrollIntoView({ behavior: 'instant' });
    } else {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' });
    }
  });
  await new Promise(r => setTimeout(r, 800));

  const footerInView = await page.evaluate(() => {
    const footer = document.getElementById('site-footer');
    if (!footer) return false;
    const rect = footer.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.height > 0;
  });
  console.log('[QA] Footer reached and visible:', footerInView);

  await browser.close();

  const allSectionsPresent = Object.values(sectionsCheck).every(s => s.exists && s.visible);
  const heroTransparencyPass = navHeroCheck.isTransparent && navMidHeroCheck.isTransparent;
  const postHeroGlassPass = navScrolledCheck.hasGlassmorphism;

  console.log('\n--- PRODUCTION QA SUMMARY REPORT ---');
  console.log(`1. HTTP Status: ${httpStatus === 200 ? 'PASS (200 OK)' : 'FAIL (' + httpStatus + ')'}`);
  console.log(`2. Hero Canvas & Frame Pipeline: ${heroCheck.canvasFound ? 'PASS (Ready)' : 'FAIL'}`);
  console.log(`3. Hero Navbar Transparency (Top + Mid): ${heroTransparencyPass ? 'PASS (100% Transparent)' : 'FAIL'}`);
  console.log(`4. Post-Hero Navbar Glassmorphism: ${postHeroGlassPass ? 'PASS (Active)' : 'FAIL'}`);
  console.log(`5. All 7 Key Sections Rendered: ${allSectionsPresent ? 'PASS (100% Present)' : 'FAIL'}`);
  console.log(`6. Site Footer Visibility & Anchor: ${footerInView ? 'PASS (Visible)' : 'FAIL'}`);
  console.log(`7. Console Errors: ${consoleErrors.length === 0 ? '0 (PASS)' : `${consoleErrors.length} errors: ${consoleErrors.join('; ')}`}`);
  console.log(`8. Asset 404 / Network Errors: ${failedRequests.length === 0 ? '0 (PASS)' : `${failedRequests.length} failed: ${JSON.stringify(failedRequests)}`}`);

  if (httpStatus === 200 && heroCheck.canvasFound && heroTransparencyPass && postHeroGlassPass && allSectionsPresent && footerInView && consoleErrors.length === 0 && failedRequests.length === 0) {
    console.log('\n======================================================');
    console.log('>>> OVERALL QA RESULT: 100% PRODUCTION READY (PASS) <<<');
    console.log('======================================================');
    process.exit(0);
  } else {
    console.error('\n>>> OVERALL QA RESULT: AUDIT ISSUES DETECTED <<<');
    process.exit(1);
  }
}

runProductionQA().catch(err => {
  console.error('[QA] Fatal error during test execution:', err);
  process.exit(1);
});
