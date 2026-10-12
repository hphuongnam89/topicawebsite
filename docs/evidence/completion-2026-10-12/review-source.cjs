/* eslint @typescript-eslint/no-require-imports: "off" -- Standalone Node CommonJS evidence runner. */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {execFileSync} = require('node:child_process');
const base=process.cwd(), runId=process.env.TOPICA_QA_RUN_ID;
if(!runId || !/^[a-zA-Z0-9-]+$/.test(runId))throw new Error('QA run required');
const output=__dirname;
const manifest=JSON.parse(fs.readFileSync(path.join(base,'scratch',`qa-${runId}`,'manifest.json'),'utf8'));
if(manifest.buildExitCode!==0 || !manifest.protectedUnchanged)throw new Error('Verified build required');
const morning=JSON.parse(fs.readFileSync(path.join(base,'docs/evidence/overnight-2026-10-12/04-restore-workspace/qa-final-manifest.json'),'utf8'));
const old=new Map(morning.sourceFiles.map(row=>[row.path,row]));
const changed=[], mismatches=[];
let patch='';
for(const file of manifest.sourceFiles){
  const actual=crypto.createHash('sha256').update(fs.readFileSync(path.join(base,file.path))).digest('hex');
  if(actual!==file.sha256)mismatches.push(file.path);
  const before=old.get(file.path);old.delete(file.path);
  if(before?.sha256===file.sha256)continue;
  changed.push({path:file.path,before:before?.sha256||null,after:file.sha256});
  if(!/\.(tsx?|mjs|cjs|json|css)$/.test(file.path))continue;
  if(before){
    try {patch+=execFileSync('git',['diff','--no-index','--ignore-space-at-eol','--',path.join(morning.workspace,file.path),path.join(base,file.path)],{encoding:'utf8',stdio:['ignore','pipe','ignore']});}
    catch(error){if(error.status!==1)throw error;patch+=error.stdout||'';}
  }else patch+=`\nNEW FILE: ${file.path}\n${fs.readFileSync(path.join(base,file.path),'utf8')}\n`;
}
const report={runId,at:new Date().toISOString(),baseline:morning.sourceFingerprint,sourceFingerprint:manifest.sourceFingerprint,buildId:manifest.buildId,sourceMatchesBuild:mismatches.length===0,mismatches,changed,removed:[...old.keys()],scope:'App/config/script snapshot only; excludes production DB/env/uploads/backups. Original Git tree already dirty; delta is from immutable morning snapshot, not HEAD.'};
fs.writeFileSync(path.join(output,'source-review.json'),JSON.stringify(report,null,2));
fs.writeFileSync(path.join(output,'source-delta.patch'),patch);
fs.writeFileSync(path.join(output,'final-build-manifest.json'),JSON.stringify(manifest,null,2));
fs.writeFileSync(path.join(output,'git-status.txt'),execFileSync('git',['status','--short'],{encoding:'utf8'}));
console.log(JSON.stringify({runId,files:manifest.sourceFiles.length,changed:changed.length,removed:old.size,sourceMatchesBuild:report.sourceMatchesBuild,buildId:manifest.buildId,fingerprint:manifest.sourceFingerprint}));
if(mismatches.length)process.exitCode=1;
