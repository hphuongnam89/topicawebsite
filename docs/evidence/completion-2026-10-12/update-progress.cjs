/* eslint @typescript-eslint/no-require-imports: "off" -- Sequential evidence-backed bookkeeping. */
const fs=require('node:fs'),path=require('node:path');
const base=process.cwd(), evidence='docs/evidence/completion-2026-10-12';
const read=file=>JSON.parse(fs.readFileSync(path.join(base,file),'utf8'));
const manifest=read(`${evidence}/final-build-manifest.json`), review=read(`${evidence}/source-review.json`), workflow=read(`${evidence}/08-workflow/workflow-results.json`), ui=read(`${evidence}/09-ui/results.json`);
if(manifest.buildExitCode!==0 || !review.sourceMatchesBuild || workflow.rows.some(row=>row.status!=='pass') || workflow.pageErrors.length || ui.rows.filter(row=>row.template).length!==36 || ui.rows.some(row=>row.template&&(row.axeViolations.length||row.metrics.scrollWidth>row.metrics.viewport||row.metrics.brokenImages.length)))throw new Error('Evidence gate failed');
for(const file of ['01-form/full-tests-5.log','01-form/lint-6.log','01-form/typecheck-9.log','08-workflow/command.log','08-workflow/capture-command.log'])if(!fs.readFileSync(path.join(base,evidence,file),'utf8').trim().endsWith('exit_code=0'))throw new Error(`Missing successful command: ${file}`);
const updates={
R00:['in_progress','New immutable source/build and delta from morning captured; complete inventory still open.'],
R01:['in_progress','User explicitly authorized out-of-sandbox build/Chromium after EPERM; isolated scratch fixture/stub and protected helpers verified. Node22 and parallel deployment not verified.'],
R02:['in_progress','DB+uploads bundle/restore implemented; 4 fixture fault cases pass. Disk-full/permissions/offsite/production RPO-RTO not_run.'],
R03:['in_progress','User permits existing data/topicauni.edu.vn; source reconciliation D01-D08 added, CSV retained as historical inventory. No business reviewer confirmation.'],
R04:['in_progress','Single live organization DTO updates contact consumers; managed archive neutralizes fallback. Source conflicts hotline roles/Da Nang address remain; previous verified scope was technical only.'],
R05:['in_progress','Source-backed fees/scholarships corrected, unsupported commitments removed; duration/126-credit/cohort facts still need review. Previous technical verified is not whole business-contract verification.'],
R06:['in_progress','Fake download claims/default testimonials removed; document schema gates public records. Real file/MIME/bytes/rights inventory not complete, so previous technical verified is narrowed.'],
R11:['in_progress','Hero image/message split, lower short form and neutral current admissions state; actual desktop/mobile screenshots reviewed, no research/design approval.'],
R12:['in_progress','Live program directory/detail mapping, stable IDs and archive suppression tested; actual curriculum/track facts still need confirmation.'],
R13:['in_progress','Tuition/admission consumes effective CMS DTO; neutral missing round/docs; official source reconciliation applied, business gate open.'],
R15:['in_progress','Browser real fixture submit/retry/dedupe/consent/rate/body/error focus pass; optional schema and server success event aligned. Process-local limit and notification outbox/status remain.'],
R16:['in_progress','Revision/publication/domain DTO integration tested with fixtures, legacy mutations gated; real legacy import dry-run/review not_run.'],
R17:['verified','Technical default editor/admin matrix, negative APIs, fresh role checks, CAS/audit rollback and private five-minute preview tested; actual browser workflow passes. Business matrix/UAT still unaccepted.'],
R18:['implemented','UTC [start,end), no resurrection and warm localhost publication/expiry tested (+531/+521ms); production staging timing/day-end convention not confirmed.'],
R19:['in_progress','Domain workbench, load by ID, version conflict handling, draft/preview/review/schedule and responsive drawer added; mobile browser/axe pass. JSON auxiliary fields, domain preview, media/dashboard and five-task UAT remain.'],
R21:['in_progress','Effective public/search/category/sitemap/program/tuition/contact consumers integrated; archive suppresses fallback, sitemap beyond100 regression tested. Real data migration/cross-page content review remains.'],
R22:['in_progress','33 test files/216 pass/1 not_run hardlink; actual Chromium workflow and 36 UI/axe scans, failures-before/fixes-after retained. Full crawl/CI/performance remains.'],
R23:['in_progress','Nine template x four viewport actual scans plus CMS mobile axe have zero violations in selected tags; reviewed screenshots and fixed nav/mobile/contrast defects. T06/T07/T09, real devices and Lighthouse/CWV not_run.'],
R24:['in_progress','Local production-build regression package exists, no P0/P1 observed in tested scenarios after fixes. Staging/reviewer/manual full matrix and UAT not_run; no release candidate acceptance.'],
R26:['in_progress','CMS.md corrected from WordPress to SQLite; storage and analytics contracts/handoff delivered. Named operator training/production rehearsal not_run.'],
R27:['in_progress','Safe route/metadata events and server-only persisted form success verified, no raw search/PII. Form-start/error/download/session/bot/denominator/dashboard incomplete; no funnel claim.'],
R29:['in_progress','Evening report/evidence and sequential progress reconciled; no accepted task/whole-project completion claim.'],
};
const file=path.join(base,'docs/agent-execution/progress.json'),progress=read('docs/agent-execution/progress.json');
for(const task of progress.tasks){
  if(!updates[task.id])continue;
  const [status,note]=updates[task.id];
  task.status=status;task.owner='Codex';
  task.source_version=`${manifest.runId}; build ${manifest.buildId}; dirty source fingerprint ${manifest.sourceFingerprint}`;
  task.evidence=[...new Set([...task.evidence,`${evidence}/HANDOFF.md`,`${evidence}/final-build-manifest.json`])];
  const dated=`12/10 evening completion: ${note}`;
  if(!task.notes.includes(dated))task.notes.push(dated);
  task.checks=[...new Set([...task.checks,'completion-07: scoped checks/evidence in HANDOFF.md; not whole-task acceptance'])];
}
fs.writeFileSync(file,JSON.stringify(progress,null,2)+'\n');
console.log(JSON.stringify({updated:Object.keys(updates),counts:progress.tasks.reduce((counts,task)=>(counts[task.status]=(counts[task.status]||0)+1,counts),{})}));
