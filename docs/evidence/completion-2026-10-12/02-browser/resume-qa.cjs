// Retry only the failed immutable, isolated fixture build. Never a real-data server.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{spawnSync,spawn}=require('node:child_process');
const runId='completion-03',root=path.join(process.cwd(),'scratch',`qa-${runId}`),manifestPath=path.join(root,'manifest.json');
const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
if(manifest.runId!==runId || manifest.buildExitCode!==1 || !manifest.protectedUnchanged || manifest.port!==3107 || manifest.workspace!==path.join(root,'workspace'))throw new Error('Only failed owned QA fixture can be resumed');
for(const file of manifest.sourceFiles){if(crypto.createHash('sha256').update(fs.readFileSync(path.join(manifest.workspace,file.path))).digest('hex')!==file.sha256)throw new Error('Immutable source mismatch');}
const env={};for(const key of ['PATH','Path','SystemRoot','WINDIR','ComSpec','PATHEXT','TEMP','TMP','USERPROFILE','APPDATA','LOCALAPPDATA'])if(process.env[key])env[key]=process.env[key];
Object.assign(env,{NODE_ENV:'production',TOPICA_DB_PATH:path.join(root,'fixture.db'),TOPICA_DATA_DIR:root,TOPICA_BACKUP_DIR:path.join(root,'backups'),TOPICA_UPLOAD_DIR:path.join(manifest.workspace,'public','qa-uploads',runId),TOPICA_UPLOAD_URL_PREFIX:`/qa-uploads/${runId}`,TOPICA_NEXT_DIST_DIR:manifest.distDir,TOPICA_QA_TSCONFIG:manifest.tsconfig,TOPICA_QA_MODE:'true',TOPICA_QA_SOURCE_ROOT:manifest.workspace,STUB_NOTIFICATIONS:'true',TELEGRAM_DISABLED:'true',ADMIN_INITIAL_PASSWORD:'',ADMIN_SESSION_SECRET:crypto.randomBytes(32).toString('hex'),NEXT_PUBLIC_SITE_URL:'http://localhost:3107'});
const next=path.join(manifest.workspace,'node_modules','next','dist','bin','next');
const result=spawnSync(process.execPath,[next,'build','--webpack'],{cwd:manifest.workspace,env,stdio:'inherit'});
manifest.retry={exitCode:result.status,signal:result.signal,at:new Date().toISOString(),hypothesis:'Previous target mkdir now succeeds in an independent Node process; retry once for transient directory creation failure'};
if(result.status===0){manifest.buildExitCode=0;manifest.buildId=fs.readFileSync(path.join(manifest.workspace,manifest.distDir,'BUILD_ID'),'utf8').trim();}
fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2));
if(result.status!==0)process.exit(result.status||1);
const server=spawn(process.execPath,[next,'start','-p','3107','-H','localhost'],{cwd:manifest.workspace,env,stdio:'inherit'});
process.on('SIGINT',()=>server.kill('SIGINT'));process.on('SIGTERM',()=>server.kill('SIGTERM'));server.on('exit',code=>process.exitCode=code||0);
/* eslint @typescript-eslint/no-require-imports: "off" -- Standalone Node CommonJS evidence runner. */
