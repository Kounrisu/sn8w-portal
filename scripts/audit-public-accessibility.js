async page => {
  const base = await page.evaluate(() => location.origin);
  if (base === 'http://127.0.0.1:4201') {
    // The local preview uses the same public catalogue and images as production.
    for (const pattern of [base + '/api/projects.php*', base + '/images/projects/**']) {
      await page.route(pattern, async route => {
        const response = await page.request.get(route.request().url().replace(base, 'https://sn8w.com'));
        await route.fulfill({response});
      });
    }
  }
  const routes = ['/', '/projects', '/behind-the-scenes', '/login', '/accessibilite', '/plan-du-site', '/workshop', '/parametres-accessibilite'];
  const results = [];
  await page.setViewportSize({width:1440,height:1000});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto(base);
  const saved = await page.evaluate(() => ({language:localStorage.getItem('sn8w-lang'),theme:localStorage.getItem('sn8w-theme'),prefs:localStorage.getItem('sn8w-a11y-prefs')}));
  try {
    for (const lang of ['fr','en']) {
      for (const theme of ['frost','squirrel','contrast']) {
        await page.evaluate(({lang,theme}) => {
          localStorage.setItem('sn8w-lang',lang);
          localStorage.setItem('sn8w-theme',theme);
          localStorage.setItem('sn8w-a11y-prefs',JSON.stringify({motion:'reduced'}));
        },{lang,theme});
        for (const route of routes) {
          await page.goto(base + route);
          await page.locator('main h1').waitFor();
          if (route === '/' || route === '/projects') await page.locator('sn8w-project-card').first().waitFor();
          await page.evaluate(async () => { await document.fonts.ready; window.scrollTo({top:document.body.scrollHeight,behavior:'instant'}); });
          await page.waitForTimeout(250);
          await page.evaluate(() => window.scrollTo({top:0,behavior:'instant'}));
          await page.addScriptTag({path:'output/audit-tools/node_modules/axe-core/axe.min.js'});
          const audit = await page.evaluate(async () => {
            const r = await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','best-practice']}});
            return {
              version:r.testEngine.version,
              violations:r.violations.map(v=>({id:v.id,impact:v.impact,help:v.help,nodes:v.nodes.map(n=>({target:n.target,html:n.html,summary:n.failureSummary}))})),
              incomplete:r.incomplete.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),
              passes:r.passes.map(p=>p.id),
              title:document.title,language:document.documentElement.lang,
              overflow:document.documentElement.scrollWidth > innerWidth,
            };
          });
          results.push({route,lang,theme,...audit});
        }
      }
    }
  } finally {
    await page.evaluate(saved => {
      for (const [key,value] of [['sn8w-lang',saved.language],['sn8w-theme',saved.theme],['sn8w-a11y-prefs',saved.prefs]]) {
        if (value === null) localStorage.removeItem(key); else localStorage.setItem(key,value);
      }
    },saved);
  }
  return {base,viewport:{width:1440,height:1000},browser:await page.context().browser().version(),results};
}
