import puppeteer from 'puppeteer';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\9384a28f-bcd7-4418-9e76-b85935b9f03a';

async function capture() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://localhost:3847/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1200));

  // 1. Academy focal hold at scrollY = 6000
  await page.evaluate(() => window.scrollTo({ top: 6000, behavior: 'instant' }));
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'phase74_13_academy_intro_focal_hold.png') });

  // 2. Training Journey horizontal cards in motion at scrollY = 10400
  await page.evaluate(() => window.scrollTo({ top: 10400, behavior: 'instant' }));
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'phase74_14_journey_cards_in_flight.png') });

  // 3. Facility section with Three.js corridor at scrollY = 17800
  await page.evaluate(() => window.scrollTo({ top: 17800, behavior: 'instant' }));
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'phase74_15_facility_luminous_corridor.png') });

  await browser.close();
  console.log('Capture complete.');
}

capture().catch(console.error);
