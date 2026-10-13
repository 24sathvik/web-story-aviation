import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

async function verifyTerrain() {
  console.log('[Terrain QA] Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  console.log('[Terrain QA] Navigating to http://localhost:3847/ ...');
  await page.goto('http://localhost:3847/', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));

  // 1. Scroll to Training Programs (#programs)
  console.log('[Terrain QA] Navigating to #programs...');
  await page.evaluate(() => {
    const el = document.getElementById('programs');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await new Promise(r => setTimeout(r, 1500));

  const programsTerrainCheck = await page.evaluate(() => {
    const section = document.getElementById('programs');
    const canvas = section?.querySelector('canvas');
    return {
      sectionFound: !!section,
      canvasFound: !!canvas,
      canvasWidth: canvas ? canvas.width : 0,
      canvasHeight: canvas ? canvas.height : 0
    };
  });
  console.log('[Terrain QA] Programs Terrain Check:', programsTerrainCheck);
  await page.screenshot({ path: 'terrain_programs_start.png' });

  // Scroll through #programs to test scroll reactivity
  console.log('[Terrain QA] Scrolling inside #programs...');
  await page.evaluate(() => {
    window.scrollBy({ top: 800, behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'terrain_programs_mid.png' });

  // 2. Scroll to Proof Section (#why-choose-us)
  console.log('[Terrain QA] Navigating to #why-choose-us...');
  await page.evaluate(() => {
    const el = document.getElementById('why-choose-us');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await new Promise(r => setTimeout(r, 1500));

  const proofTerrainCheck = await page.evaluate(() => {
    const section = document.getElementById('why-choose-us');
    const canvas = section?.querySelector('canvas');
    return {
      sectionFound: !!section,
      canvasFound: !!canvas,
      canvasWidth: canvas ? canvas.width : 0,
      canvasHeight: canvas ? canvas.height : 0
    };
  });
  console.log('[Terrain QA] Proof Terrain Check:', proofTerrainCheck);
  await page.screenshot({ path: 'terrain_proof_view.png' });

  // 3. Scroll to Admissions Section (#admissions)
  console.log('[Terrain QA] Navigating to #admissions...');
  await page.evaluate(() => {
    const el = document.getElementById('admissions');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await new Promise(r => setTimeout(r, 1500));

  const admissionsTerrainCheck = await page.evaluate(() => {
    const section = document.getElementById('admissions');
    const canvas = section?.querySelector('canvas');
    return {
      sectionFound: !!section,
      canvasFound: !!canvas,
      canvasWidth: canvas ? canvas.width : 0,
      canvasHeight: canvas ? canvas.height : 0
    };
  });
  console.log('[Terrain QA] Admissions Terrain Check:', admissionsTerrainCheck);
  await page.screenshot({ path: 'terrain_admissions_view.png' });

  // 4. Test reverse scroll
  console.log('[Terrain QA] Testing reverse scroll back to top...');
  await page.evaluate(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 1000));

  await browser.close();

  console.log('\n--- TERRAIN VERIFICATION SUMMARY ---');
  console.log(`Programs 3D Terrain: ${programsTerrainCheck.canvasFound ? 'PASS' : 'FAIL'}`);
  console.log(`Proof 3D Terrain: ${proofTerrainCheck.canvasFound ? 'PASS' : 'FAIL'}`);
  console.log(`Admissions 3D Terrain: ${admissionsTerrainCheck.canvasFound ? 'PASS' : 'FAIL'}`);
  console.log(`Console Errors: ${consoleErrors.length === 0 ? '0 (PASS)' : `${consoleErrors.length} errors: ${consoleErrors.join('; ')}`}`);

  if (programsTerrainCheck.canvasFound && proofTerrainCheck.canvasFound && admissionsTerrainCheck.canvasFound && consoleErrors.length === 0) {
    console.log('>>> ALL TERRAIN BACKGROUND TESTS PASSED <<<');
    process.exit(0);
  } else {
    process.exit(1);
  }
}

verifyTerrain().catch(e => {
  console.error('[Terrain QA] Fatal error:', e);
  process.exit(1);
});
