import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\9384a28f-bcd7-4418-9e76-b85935b9f03a';

async function audit() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1344, height: 723, deviceScaleFactor: 1 });

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  const failedRequests = [];
  page.on('requestfailed', req => {
    failedRequests.push({ url: req.url(), failure: req.failure()?.errorText });
  });

  console.log('Navigating to http://localhost:3847 ...');
  await page.goto('http://localhost:3847', { waitUntil: 'networkidle2', timeout: 30000 });
  await page.evaluate(() => new Promise(r => setTimeout(r, 1500)));

  // Collect section layout and bounding data
  const layout = await page.evaluate(() => {
    const sections = [
      { name: 'Hero (ScrollTrack)', sel: '.cinematic-scroll-track' },
      { name: 'AcademyIntroduction', sel: '#academy' },
      { name: 'TrainingPrograms', sel: '#programs' },
      { name: 'TrainingJourney', sel: '#journey' },
      { name: 'FleetSection', sel: '#fleet' },
      { name: 'FacilitySection', sel: '#facilities' },
      { name: 'ProofSection', sel: '#why-choose-us' },
      { name: 'StoriesSection', sel: '#stories' },
      { name: 'FAQSection', sel: '#faq' },
      { name: 'AdmissionsTransition', sel: '#admissions' },
      { name: 'Footer', sel: '#site-footer' }
    ];

    return sections.map(s => {
      const el = document.querySelector(s.sel);
      if (!el) return { name: s.name, sel: s.sel, exists: false };
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return {
        name: s.name,
        sel: s.sel,
        exists: true,
        offsetTop: el.offsetTop,
        offsetHeight: el.offsetHeight,
        top: Math.round(rect.top + window.scrollY),
        height: Math.round(rect.height),
        zIndex: style.zIndex,
        position: style.position
      };
    });
  });

  console.log('Layout audit:', JSON.stringify(layout, null, 2));

  // Capture snapshots of each section
  const checkpoints = [
    { name: 'phase74_audit_01_hero_start', scrollY: 0 },
    { name: 'phase74_audit_02_hero_end', scrollY: 4200 },
    { name: 'phase74_audit_03_hero_to_academy', scrollY: 4800 },
    { name: 'phase74_audit_04_academy_intro', scrollY: 5600 },
    { name: 'phase74_audit_05_programs_pinned', scrollY: 7400 },
    { name: 'phase74_audit_06_journey_horizontal', scrollY: 10200 },
    { name: 'phase74_audit_07_fleet_aircraft', scrollY: 13500 },
    { name: 'phase74_audit_08_facility_tunnel', scrollY: 16800 },
    { name: 'phase74_audit_09_proof_metrics', scrollY: 19800 },
    { name: 'phase74_audit_10_faq_accordion', scrollY: 22800 },
    { name: 'phase74_audit_11_admissions_cta', scrollY: 24800 },
    { name: 'phase74_audit_12_footer_bottom', scrollY: 26246 }
  ];

  for (const cp of checkpoints) {
    await page.evaluate((y) => window.scrollTo(0, y), cp.scrollY);
    await page.evaluate(() => new Promise(r => setTimeout(r, 600)));
    const outPath = path.join(ARTIFACT_DIR, `${cp.name}.png`);
    await page.screenshot({ path: outPath });
    console.log(`Saved screenshot ${cp.name} at scrollY=${cp.scrollY}`);
  }

  // Audit navbar properties at hero and post-hero
  const navStates = await page.evaluate(() => {
    window.scrollTo(0, 0);
    const nav = document.querySelector('header');
    const heroNav = nav ? {
      bg: window.getComputedStyle(nav).backgroundColor,
      borderBottomWidth: window.getComputedStyle(nav).borderBottomWidth,
      backdropFilter: window.getComputedStyle(nav).backdropFilter
    } : null;

    window.scrollTo(0, 5600);
    const postHeroNav = nav ? {
      bg: window.getComputedStyle(nav).backgroundColor,
      borderBottomWidth: window.getComputedStyle(nav).borderBottomWidth,
      backdropFilter: window.getComputedStyle(nav).backdropFilter
    } : null;

    return { heroNav, postHeroNav };
  });

  console.log('Navbar audit:', JSON.stringify(navStates, null, 2));
  console.log('Console errors:', consoleErrors.length, consoleErrors);
  console.log('Failed requests:', failedRequests.length, failedRequests);

  await browser.close();

  fs.writeFileSync(
    path.join(process.cwd(), 'phase74_audit_data.json'),
    JSON.stringify({ layout, navStates, consoleErrors, failedRequests }, null, 2)
  );
  console.log('Audit complete.');
}

audit().catch(console.error);
