import puppeteer from 'puppeteer';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\9384a28f-bcd7-4418-9e76-b85935b9f03a';

async function verify() {
  console.log('Launching browser for Phase 7.4 verification...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  console.log('Navigating to http://localhost:3847/ ...');
  await page.goto('http://localhost:3847/', { waitUntil: 'networkidle0', timeout: 30000 });
  await page.evaluate(() => new Promise(r => setTimeout(r, 1500)));

  // Helper function to inspect header styles
  const getHeaderStyles = async () => {
    return await page.evaluate(() => {
      const h = document.querySelector('header');
      if (!h) return null;
      const cs = window.getComputedStyle(h);
      return {
        scrollY: window.scrollY,
        backgroundColor: cs.backgroundColor,
        borderBottomWidth: cs.borderBottomWidth,
        backdropFilter: cs.backdropFilter,
        boxShadow: cs.boxShadow
      };
    });
  };

  // 1. Hero Start (scrollY = 0)
  console.log('1. Verifying Hero Start...');
  const navHeroStart = await getHeaderStyles();
  console.log('Hero Start Nav:', navHeroStart);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'phase74_01_hero_start.png') });

  // 2. Hero Middle (scrollY = 2600)
  console.log('2. Verifying Hero Middle...');
  await page.evaluate(() => window.scrollTo({ top: 2600, behavior: 'instant' }));
  await page.evaluate(() => new Promise(r => setTimeout(r, 600)));
  const navHeroMid = await getHeaderStyles();
  console.log('Hero Mid Nav:', navHeroMid);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'phase74_02_hero_middle.png') });

  // 3. Hero-to-Academy Transition (scrollY = 4300)
  console.log('3. Verifying Hero to Academy Transition...');
  await page.evaluate(() => window.scrollTo({ top: 4300, behavior: 'instant' }));
  await page.evaluate(() => new Promise(r => setTimeout(r, 600)));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'phase74_03_hero_to_academy_transition.png') });

  // 4. AcademyIntroduction Focal Hold (scrollY = 5200)
  console.log('4. Verifying AcademyIntroduction Focal Hold...');
  await page.evaluate(() => window.scrollTo({ top: 5200, behavior: 'instant' }));
  await page.evaluate(() => new Promise(r => setTimeout(r, 800)));
  const navPostHero = await getHeaderStyles();
  console.log('Post-Hero Nav at Academy:', navPostHero);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'phase74_04_academy_introduction_refined.png') });

  // 5. TrainingPrograms with Syllabus HUD (scrollY = 6800)
  console.log('5. Verifying TrainingPrograms with Syllabus HUD...');
  await page.evaluate(() => window.scrollTo({ top: 6800, behavior: 'instant' }));
  await page.evaluate(() => new Promise(r => setTimeout(r, 800)));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'phase74_05_training_programs_syllabus.png') });

  // 6. TrainingJourney Non-Colliding Layout (scrollY = 9400)
  console.log('6. Verifying TrainingJourney Non-Colliding Layout...');
  await page.evaluate(() => window.scrollTo({ top: 9400, behavior: 'instant' }));
  await page.evaluate(() => new Promise(r => setTimeout(r, 800)));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'phase74_06_training_journey_separated.png') });

  // 7. FleetSection with Hangar Telemetry (scrollY = 12600)
  console.log('7. Verifying FleetSection with Hangar Telemetry...');
  await page.evaluate(() => window.scrollTo({ top: 12600, behavior: 'instant' }));
  await page.evaluate(() => new Promise(r => setTimeout(r, 800)));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'phase74_07_fleet_telemetry_refined.png') });

  // 8. FacilitySection with Luminous 3D Corridor (scrollY = 15800)
  console.log('8. Verifying FacilitySection with Luminous 3D Corridor...');
  await page.evaluate(() => window.scrollTo({ top: 15800, behavior: 'instant' }));
  await page.evaluate(() => new Promise(r => setTimeout(r, 800)));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'phase74_08_facility_3d_corridor_refined.png') });

  // 9. AdmissionsTransition & Restored Footer (scroll to bottom)
  console.log('9. Verifying Admissions & Restored Footer...');
  const bottomScroll = await page.evaluate(() => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' });
    return window.scrollY;
  });
  await page.evaluate(() => new Promise(r => setTimeout(r, 800)));
  const footerRect = await page.evaluate(() => {
    const f = document.querySelector('#site-footer');
    if (!f) return null;
    const r = f.getBoundingClientRect();
    return {
      top: r.top,
      bottom: r.bottom,
      height: r.height,
      inViewport: r.top < window.innerHeight && r.bottom > 0
    };
  });
  console.log('Footer Rect at bottom (scrollY=' + bottomScroll + '):', footerRect);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'phase74_09_admissions_footer_flow.png') });

  // 10. Mobile Responsiveness Test (390 x 844)
  console.log('10. Verifying Mobile Layout...');
  await page.setViewport({ width: 390, height: 844 });
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.evaluate(() => new Promise(r => setTimeout(r, 600)));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'phase74_10_mobile_hero.png') });

  await page.evaluate(() => window.scrollTo({ top: 7200, behavior: 'instant' }));
  await page.evaluate(() => new Promise(r => setTimeout(r, 600)));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'phase74_11_mobile_journey.png') });

  await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }));
  await page.evaluate(() => new Promise(r => setTimeout(r, 600)));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'phase74_12_mobile_footer.png') });

  console.log('Console Errors:', consoleErrors);
  await browser.close();
  console.log('Verification Complete.');
}

verify().catch(console.error);
