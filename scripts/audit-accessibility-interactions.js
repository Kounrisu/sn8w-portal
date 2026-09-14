async page => {
  const base = await page.evaluate(() => location.origin);
  const routes = ['/', '/projects', '/behind-the-scenes', '/login', '/accessibilite', '/plan-du-site', '/workshop', '/parametres-accessibilite'];
  const layout = [];
  const checks = {};
  const saved = await page.evaluate(() => ({lang:localStorage.getItem('sn8w-lang'),theme:localStorage.getItem('sn8w-theme'),prefs:localStorage.getItem('sn8w-a11y-prefs')}));
  await page.emulateMedia({reducedMotion:'reduce'});
  try {
    await page.evaluate(() => {localStorage.setItem('sn8w-theme','frost');localStorage.removeItem('sn8w-a11y-prefs');});
    for (const lang of ['fr','en']) {
      await page.evaluate(lang => localStorage.setItem('sn8w-lang',lang),lang);
      for (const route of routes) {
        for (const mode of ['reflow','text200','spacing']) {
          await page.setViewportSize({width:mode === 'text200' ? 1280 : 320,height:1000});
          await page.goto(base + route);
          await page.locator('main h1').waitFor();
          if (route === '/' || route === '/projects') await page.locator('sn8w-project-card').first().waitFor();
          await page.evaluate(async () => {await document.fonts.ready;});
          if (mode === 'text200') await page.addStyleTag({content:'html { font-size: 200% !important; }'});
          if (mode === 'spacing') await page.addStyleTag({content:'* { line-height: 1.5 !important; letter-spacing: .12em !important; word-spacing: .16em !important; } p { margin-bottom: 2em !important; }'});
          const measurements = await page.evaluate(() => ({overflow:document.documentElement.scrollWidth > innerWidth,offenders:[...document.querySelectorAll('main *')].filter(el => el.getBoundingClientRect().right > innerWidth + 1 && getComputedStyle(el).position !== 'absolute').slice(0,5).map(el=>({tag:el.tagName,cls:el.className,text:el.textContent.slice(0,70)}))}));
          layout.push({lang,route,mode,...measurements});
        }
      }
    }
    await page.evaluate(() => localStorage.setItem('sn8w-lang','fr'));
    await page.setViewportSize({width:1440,height:1000});
    await page.goto(base + '/');
    await page.keyboard.press('Tab');
    checks.skipFirst = await page.locator('.skip-link').evaluate(el=>el === document.activeElement);
    await page.keyboard.press('Enter');
    checks.skipFocus = await page.evaluate(()=>document.activeElement.id === 'main');
    const summary = page.locator('.practice summary').first();
    await summary.focus(); await page.keyboard.press('Enter');
    checks.disclosure = await summary.evaluate(el=>el.parentElement.open);
    const cover = page.locator('.cover').first();
    await cover.focus(); await page.keyboard.press('Enter');
    const dialog = page.locator('dialog[open]');
    await dialog.waitFor();
    checks.dialogFocus = await dialog.evaluate(el=>el.contains(document.activeElement));
    checks.dialogTrap = true;
    for (let i=0;i<8;i++) {await page.keyboard.press('Tab');checks.dialogTrap &&= await dialog.evaluate(el=>el.contains(document.activeElement));}
    await page.keyboard.press('Escape');
    checks.dialogReturn = await cover.evaluate(el=>el === document.activeElement);
    await page.goto(base + '/projects');
    await page.locator('#project-search').fill('zzzz-no-match-2026');
    await page.locator('.empty').waitFor();
    checks.searchEmpty = await page.locator('.empty').isVisible();
    await page.locator('.clear-filters').click();
    checks.searchResetFocus = await page.locator('#project-search').evaluate(el=>el === document.activeElement && el.value === '');
    await page.goto(base + '/parametres-accessibilite');
    checks.motionFirst = await page.locator('.prefs__group').first().locator('input[name="motion"]').count() === 2;
    for (const name of ['motion','reading-font','color-theme']) {
      const active = page.locator(`input[name="${name}"]:checked`);
      const before = await active.getAttribute('value');
      await active.focus(); await page.keyboard.press('ArrowRight');
      checks[name+'Arrow'] = await page.locator(`input[name="${name}"]:checked`).getAttribute('value') !== before;
    }
    const beforeBold = await page.locator('.prefs__switch').getAttribute('aria-pressed');
    await page.locator('.prefs__switch').focus(); await page.keyboard.press('Space');
    await page.waitForTimeout(100);
    checks.boldToggle = await page.locator('.prefs__switch').getAttribute('aria-pressed') !== beforeBold;
    await page.emulateMedia({reducedMotion:'no-preference'});
    await page.locator('input[name="motion"][value="reduced"]').check();
    await page.waitForTimeout(200);
    const pixels = () => page.locator('canvas.starfield').evaluate(el => {
      const data=el.getContext('2d').getImageData(0,0,el.width,el.height).data;
      let hash=0; for(let i=0;i<data.length;i+=17) hash=(hash*31+data[i])|0;
      return hash;
    });
    const first = await pixels(); await page.waitForTimeout(300);
    checks.reducedCanvasStable = first === await pixels();
    await page.screenshot({path:'output/playwright/accessibility-settings-audited.png'});
    await page.goto(base + '/login');
    let loginRequests = 0;
    await page.route('**/api/login.php', async route => {
      loginRequests++;
      await route.fulfill({status:401,contentType:'application/json',body:JSON.stringify({error:'Invalid credentials'})});
    });
    await page.locator('button[type="submit"]').click();
    checks.requiredUsername = await page.locator('input[name="username"]').evaluate(el=>!el.validity.valid && el === document.activeElement);
    checks.noEmptySubmission = loginRequests === 0;
    await page.locator('input[name="username"]').fill('audit-test');
    await page.locator('input[name="password"]').fill('not-a-real-password');
    await page.locator('button[type="submit"]').click();
    await page.locator('[role="alert"]').waitFor();
    checks.loginErrorAnnounced = loginRequests === 1;
    await page.unroute('**/api/login.php');
    return {layout,checks};
  } finally {
    await page.evaluate(saved => {for(const [key,value] of [['sn8w-lang',saved.lang],['sn8w-theme',saved.theme],['sn8w-a11y-prefs',saved.prefs]]) {if(value === null) localStorage.removeItem(key);else localStorage.setItem(key,value);}},saved);
    await page.emulateMedia({reducedMotion:'no-preference'});
  }
}
