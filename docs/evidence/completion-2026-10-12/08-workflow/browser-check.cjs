// Local QA only. Synthetic accounts/data; no production DB or external delivery.
/* eslint @typescript-eslint/no-require-imports: "off" -- Standalone Node CommonJS evidence runner. */
const fs = require('node:fs');
const path = require('node:path');
const {createRequire} = require('node:module');
const dependency = createRequire(path.join(process.cwd(),'package.json'));
const {chromium, expect} = dependency('@playwright/test');
const {DatabaseSync} = require('node:sqlite');
const AxeBuilder = dependency('@axe-core/playwright').default;
const runId=process.env.TOPICA_QA_RUN_ID;
if(!runId || !/^[a-zA-Z0-9-]+$/.test(runId))throw new Error('Known QA run required');
const root=path.join(process.cwd(),'scratch',`qa-${runId}`);
const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8'));
if(manifest.runId!==runId || manifest.port!==3107 || manifest.buildExitCode!==0 || !manifest.protectedUnchanged)throw new Error('Invalid isolated QA build');
const accounts=JSON.parse(fs.readFileSync(path.join(root,'private-auth.json'),'utf8'));
const output=__dirname, rows=[], errors=[];
const url=`http://localhost:${manifest.port}`;
const db=new DatabaseSync(path.join(root,'fixture.db'));
async function main(){
  const browser=await chromium.launch();
  const context=await browser.newContext({viewport:{width:390,height:900},reducedMotion:'reduce'});
  const page=await context.newPage();
  page.on('pageerror',error=>errors.push(error.message));
  async function check(name,task){try{await task();rows.push({name,status:'pass',at:new Date().toISOString()});}catch(error){rows.push({name,status:'fail',message:String(error.message).slice(0,1800)});throw error;}}
  async function login(target,role){
    const account=accounts.find(row=>row.role===role);
    const response=await target.request.post(`${url}/api/admin/auth/login`,{headers:{Origin:url},data:{username:account.username,password:account.password}});
    expect(response.status()).toBe(200);
    await target.goto(`${url}/admin/content`);
    await expect(target.getByRole('heading',{name:'Nội dung & phê duyệt',exact:true})).toBeVisible();
  }
  try{
    await check('QA noindex boundary',async()=>{const response=await page.goto(`${url}/lien-he/`);expect(response.headers()['x-robots-tag']).toBe('noindex, nofollow');});
    await check('empty form focuses first field and reports program/consent',async()=>{
      await page.getByRole('button',{name:'Đăng ký tư vấn miễn phí'}).click();
      await expect(page.locator('[name="fullName"]')).toBeFocused();
      await expect(page.locator('[name="program"]')).toHaveAttribute('aria-invalid','true');
      await expect(page.locator('[name="consent"]')).toHaveAttribute('aria-invalid','true');
      await page.screenshot({path:path.join(output,'form-invalid-390.png'),fullPage:true});
    });
    await check('network retry preserves input and idempotency key; one lead and one success event',async()=>{
      await page.locator('[name="fullName"]').fill('QA Fixture Learner');
      await page.locator('[name="phone"]').fill('0900000000');
      await page.locator('[name="program"]').selectOption('undecided');
      await page.locator('[name="consent"]').check();
      let failedKey;
      await page.route('**/api/public/lead',async route=>{failedKey=route.request().postDataJSON().idempotency_key;await route.abort('failed');},{times:1});
      await page.getByRole('button',{name:'Đăng ký tư vấn miễn phí'}).click();
      await expect(page.locator('[name="phone"]')).toHaveValue('0900000000');
      const sent=page.waitForRequest(request=>request.url().endsWith('/api/public/lead'));
      await page.getByRole('button',{name:'Đăng ký tư vấn miễn phí'}).click();
      const request=await sent;
      expect(request.postDataJSON().idempotency_key).toBe(failedKey);
      await expect(page.getByRole('heading',{name:'Gửi yêu cầu tư vấn thành công!'})).toBeVisible();
      const duplicate=await page.request.post(`${url}/api/public/lead`,{headers:{Origin:url},data:request.postDataJSON()});
      expect((await duplicate.json()).duplicate).toBe(true);
      expect(db.prepare('SELECT COUNT(*) AS n FROM leads').get().n).toBe(1);
      expect(db.prepare("SELECT COUNT(*) AS n FROM analytics_events WHERE event_name='form_submit'").get().n).toBe(1);
      const lead=db.prepare('SELECT consent,source,program,consent_at FROM leads LIMIT 1').get();
      expect(lead.consent).toBe(1);expect(lead.program).toBe('undecided');expect(lead.source).toBe('/lien-he');expect(lead.consent_at).toBeTruthy();
      await page.screenshot({path:path.join(output,'form-success-390.png'),fullPage:true});
    });
    await check('server rejects missing consent, bounds size and rate limits',async()=>{
      const noConsent=await page.request.post(`${url}/api/public/lead`,{headers:{Origin:url,'x-real-ip':'qa-no-consent'},data:{fullname:'QA Fixture',phone:'0900000001'}});
      expect(noConsent.status()).toBe(422);
      const huge=await page.request.post(`${url}/api/public/lead`,{headers:{Origin:url,'x-real-ip':'qa-large'},data:{notes:'x'.repeat(18000)}});expect(huge.status()).toBe(413);
      for(let i=0;i<5;i++)await page.request.post(`${url}/api/public/lead`,{headers:{Origin:url,'x-real-ip':'qa-rate'},data:{}});
      const limited=await page.request.post(`${url}/api/public/lead`,{headers:{Origin:url,'x-real-ip':'qa-rate'},data:{}});expect(limited.status()).toBe(429);expect(limited.headers()['retry-after']).toBeTruthy();
      expect(db.prepare('SELECT COUNT(*) AS n FROM leads').get().n).toBe(1);
    });
    await check('editor permissions exclude lead/users/homepage and dashboard PII',async()=>{
      await login(page,'editor');
      const geometry=await page.locator('main').boundingBox();expect(geometry.width).toBeGreaterThan(340);
      await page.getByRole('button',{name:'Mở menu quản trị'}).click();
      await expect(page.getByRole('dialog',{name:'Điều hướng quản trị'})).toBeVisible();
      await expect(page.locator('main')).toHaveAttribute('inert','');
      await page.keyboard.press('Escape');
      await expect(page.getByRole('button',{name:'Mở menu quản trị'})).toBeFocused();
      await expect(page.locator('main')).not.toHaveAttribute('inert','');
      for(const route of ['leads','users','homepage'])expect((await page.request.get(`${url}/api/admin/${route}`)).status()).toBe(403);
      await page.goto(`${url}/admin`);await expect(page).toHaveURL(/\/admin\/content/);await expect(page.getByText('QA Fixture Learner')).toHaveCount(0);
    });
    let revision, preview;
    await check('editor creates draft and submits from mobile CMS UI',async()=>{
      await page.getByLabel('Loại nội dung').selectOption('page');
      await page.getByLabel(/^Mã nội dung/).fill('qa-page');
      await page.getByLabel('Tên bản sửa').fill('QA page revision');
      await page.getByLabel('Tiêu đề',{exact:true}).fill('QA Published Page');
      await page.getByLabel('Đường dẫn',{exact:true}).fill('qa-completion-page');
      await page.getByLabel('Nội dung',{exact:true}).fill('QA-only content for workflow verification.');
      const saved=page.waitForResponse(response=>response.url().endsWith('/api/admin/revisions')&&response.request().method()==='POST');
      await page.getByRole('button',{name:'Lưu thành bản nháp mới'}).click();
      const response=await saved;expect(response.status()).toBe(201);revision=(await response.json()).revision;
      await page.getByRole('button',{name:'Gửi duyệt',exact:true}).click();
      await expect(page.getByRole('heading',{name:/Bản v1 · Chờ duyệt/})).toBeVisible();
      await page.screenshot({path:path.join(output,'cms-editor-review-390.png'),fullPage:true});
      const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
      fs.writeFileSync(path.join(output,'cms-editor-axe.json'),JSON.stringify(axe,null,2));
      expect(axe.violations).toEqual([]);
      expect((await page.request.get(`${url}/qa-completion-page`)).status()).toBe(404);
    });
    await check('preview is private, bound to revision/user, and direct editor publish is forbidden',async()=>{
      const response=await page.request.get(`${url}/api/admin/revisions/${revision.id}/preview`);expect(response.status()).toBe(200);preview=(await response.json()).url;
      await page.goto(url+preview);await expect(page.getByRole('heading',{name:'QA Published Page',exact:true})).toBeVisible();
      await page.screenshot({path:path.join(output,'cms-preview-390.png'),fullPage:true});
      const anon=await browser.newContext();const absent=await anon.request.get(url+preview);expect(await absent.text()).not.toContain('QA-only content for workflow verification.');await anon.close();
      const current=(await(await page.request.get(`${url}/api/admin/revisions`)).json()).revisions.find(row=>row.id===revision.id);
      const forbidden=await page.request.patch(`${url}/api/admin/revisions/${revision.id}`,{headers:{Origin:url},data:{action:'publish',expectedUpdatedAt:current.updated_at}});expect(forbidden.status()).toBe(403);
    });
    const admin=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'}), adminPage=await admin.newPage();
    await check('admin approves and publishes exact revision through CMS UI',async()=>{
      await login(adminPage,'admin');await adminPage.getByRole('button',{name:/QA page revision/}).click();
      await adminPage.getByRole('button',{name:'Duyệt',exact:true}).click();
      await expect(adminPage.getByRole('button',{name:'Công bố / đặt lịch'})).toBeVisible();
      await adminPage.getByRole('button',{name:'Công bố / đặt lịch'}).click();
      await expect(adminPage.getByRole('heading',{name:/Bản v1 · Đã công bố/})).toBeVisible();
      await adminPage.screenshot({path:path.join(output,'cms-admin-published-1440.png'),fullPage:true});
      const publicResponse=await context.request.get(`${url}/qa-completion-page`);expect(publicResponse.status()).toBe(200);expect(await publicResponse.text()).toContain('QA-only content for workflow verification.');
      expect(await(await context.request.get(`${url}/sitemap.xml`)).text()).toContain('/qa-completion-page');
    });
    await check('archive immediately removes detail and sitemap without static resurrection',async()=>{
      await adminPage.getByRole('button',{name:'Lưu trữ',exact:true}).click();
      await expect(adminPage.getByRole('heading',{name:/Bản v1 · Lưu trữ/})).toBeVisible();
      expect((await context.request.get(`${url}/qa-completion-page`)).status()).toBe(404);
      expect(await(await context.request.get(`${url}/sitemap.xml`)).text()).not.toContain('/qa-completion-page');
    });
    await check('scheduled publication and expiry work with warm requests within 60 seconds',async()=>{
      const created=await adminPage.request.post(`${url}/api/admin/revisions`,{headers:{Origin:url},data:{entityType:'page',entityId:'qa-scheduled',title:'QA scheduled revision',payload:{title:'QA Scheduled Page',slug:'qa-scheduled-page',content_html:'QA scheduled body'},baseRevisionId:0}});expect(created.status()).toBe(201);
      let row=(await created.json()).revision;
      for(const action of ['submit_review','approve']){const response=await adminPage.request.patch(`${url}/api/admin/revisions/${row.id}`,{headers:{Origin:url},data:{action,expectedUpdatedAt:row.updated_at}});expect(response.status()).toBe(200);row=(await response.json()).revision;}
      const start=Date.now()+10000,end=start+10000;
      const response=await adminPage.request.patch(`${url}/api/admin/revisions/${row.id}`,{headers:{Origin:url},data:{action:'publish',expectedUpdatedAt:row.updated_at,publishAt:new Date(start).toISOString(),expireAt:new Date(end).toISOString()}});expect(response.status()).toBe(200);
      for(let i=0;i<3;i++)expect((await context.request.get(`${url}/qa-scheduled-page`)).status()).toBe(404);
      await new Promise(resolve=>setTimeout(resolve,Math.max(0,start-Date.now()+500)));
      expect((await context.request.get(`${url}/qa-scheduled-page`)).status()).toBe(200);const seenStart=Date.now();
      await new Promise(resolve=>setTimeout(resolve,Math.max(0,end-Date.now()+500)));
      expect((await context.request.get(`${url}/qa-scheduled-page`)).status()).toBe(404);const seenEnd=Date.now();
      rows.push({name:'measured scheduling offsets',status:'pass',startOffsetMs:seenStart-start,endOffsetMs:seenEnd-end,conditions:'localhost production build; repeated warm requests; not production SLA'});
    });
    await admin.close();
    await check('privacy: URL queries and arbitrary analytics metadata are not persisted',async()=>{
      await page.goto(`${url}/tim-kiem?q=fixture%40example.invalid`);await page.waitForTimeout(500);
      const raw=db.prepare('SELECT path FROM page_views').all();expect(raw.every(row=>!row.path.includes('?')&&!row.path.includes('@'))).toBe(true);
      const forbidden=await page.request.post(`${url}/api/public/events`,{headers:{Origin:url},data:{eventName:'cta_click',pagePath:'/',metadata:{nested:{email:'fixture@example.invalid'}}}});expect(forbidden.status()).toBe(422);
    });
    expect(errors).toEqual([]);
  }finally{
    fs.writeFileSync(path.join(output,'workflow-results.json'),JSON.stringify({runId,buildId:manifest.buildId,sourceFingerprint:manifest.sourceFingerprint,fixtureOnly:true,outbound:'stubbed',rows,pageErrors:errors},null,2));
    db.close();await browser.close();
  }
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
