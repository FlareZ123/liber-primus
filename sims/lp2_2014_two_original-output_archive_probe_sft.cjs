'use strict';
/**
 * #1109: exact, original-IRC-linked 2014 solver-output source acquisition.
 * Targets two unrecovered 2014 p0 solver-file IDs and 2014 same-host archive
 * positive control; entirely read-only, never runs any downloaded program.
 *
 * Node 22; manual GitHub Actions only:
 * node sims/lp2_2014_two_original-output_archive_probe_sft.cjs --network
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');

const SOURCE_URL = 'https://raw.githubusercontent.com/cicada-solvers/neuroretransmit-cicada/main/irc-logs/%23cicadasolvers.freenode.log';
const ORIGINAL_BYTES = 18487233;
const ORIGINAL_BLOB = 'bdd277c14f94c34b5ae714cd00c238065beeed4e';
const targets = [
  {line:174324, url:'http://d.pr/lvT7/5eqt1FrD', label:'may-2014-direct-crib-image'},
  {line:204064, url:'https://www.sendspace.com/file/k7ufm0', label:'june-2014-p0-file'}
];
const control='http://www.publico.pt/';
/** @param {Buffer} bytes @returns {string} */
function gitBlob(bytes) {
  return crypto.createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');
}
/** @param {string} u */
function schemes(u) {
  return [...new Set([u, u.replace(/^http:/,'https:'),u.replace(/^https:/,'http:')])];
}
/** @param {string} url */
async function get(url) {
  try {
    const response = await fetch(url,{redirect:'follow',signal:AbortSignal.timeout(20000),
      headers:{'user-agent':'LP2-2014-original-historical-link-acquisition/1.0'}});
    const body = Buffer.from(await response.arrayBuffer());
    return {status:response.status,headers:{type:response.headers.get('content-type')},
      body,finalUrl:response.url};
  } catch(error) {
    return {status:null,body:Buffer.alloc(0),error:String(error),finalUrl:url};
  }
}
/** @param {string} url @param {string} from @param {string} to */
function arquivoUrl(url,from,to) {
  const u=new URL('https://arquivo.pt/wayback/cdx');
  for(const [key,v] of Object.entries({url,from,to,output:'json',limit:'100'}))u.searchParams.set(key,v);
  return u.href;
}
/** @param {string} url */
function iaUrl(url) {
  const u=new URL('https://web.archive.org/cdx/search/cdx');
  for(const [key,v] of Object.entries({url,output:'json',from:'2014',to:'2016',
    filter:'statuscode:200',collapse:'timestamp:4'}))u.searchParams.set(key,v);
  return u.href;
}
/** @param {Buffer} bytes */
function isHtml(bytes) {
  return /(?:<!doctype html|<html|<head)/i.test(bytes.subarray(0,1600).toString('latin1'));
}
/** @param {string} url @param {Buffer} bytes @param {string} kind */
function details(url,bytes,kind) {
  return {url,kind,size:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),
    html:isHtml(bytes),preview:bytes.subarray(0,700).toString('utf8')};
}
/** @param {string} label @param {Buffer} bytes */
function preserve(label,bytes) {
  const dir='irc2014-archived-outputs';
  fs.mkdirSync(dir,{recursive:true});
  const dest=dir+'/'+label+'.bin';
  const lock=dest+'.lock';
  const fd=fs.openSync(lock,'wx');
  try{
    const tmp=dest+'.'+process.pid+'.tmp';
    fs.writeFileSync(tmp,bytes,{flag:'wx'});
    fs.renameSync(tmp,dest);
  }finally{
    fs.closeSync(fd);
    fs.unlinkSync(lock);
  }
  return dest;
}
/** @param {{line:number,url:string,label:string}} target */
async function probe(target) {
  const findings=[];
  for(const url of schemes(target.url)) {
    const endpoints=[{provider:'arquivo',query:arquivoUrl(url,'2014','2016')},
      {provider:'wayback',query:iaUrl(url)}];
    for(const endpoint of endpoints){
      const r=await get(endpoint.query);
      const b=r.body.toString('utf8').slice(0,20000);
      let records=[];
      try {
        const parsed=endpoint.provider==='arquivo'?
          b.split(/\r?\n/).filter(Boolean).flatMap(line=>{try {const item=JSON.parse(line);return Array.isArray(item)?item:[item]}catch{return []}}):JSON.parse(b);
        if(endpoint.provider==='arquivo'){
          records=Array.isArray(parsed)?parsed:Array.isArray(parsed?.results)?parsed.results:parsed&&typeof parsed==='object'?[parsed]:[];
        } else if(Array.isArray(parsed)) {
          const [keys,...rows]=parsed;
          if(Array.isArray(keys))records=rows.map(row=>Object.fromEntries(keys.map((key,i)=>[key,row[i]])));
        }
      } catch { /* Explicit parse status is returned, not interpreted as no captures. */ }
      const x={provider:endpoint.provider,url,status:r.status,bytes:r.body.length,
        records:records.slice(0,20).map(y=>({timestamp:y.timestamp,url:y.original||y.url,
          status:y.statuscode||y.status,mime:y.mimetype||y.mime,digest:y.digest})),
        parseOk:records.length>0||(/^\s*(?:\[\s*\]|\{\s*\})\s*$/.test(b)),
        error:r.error,excerpt:records.length?undefined:b.slice(0,180)};
      findings.push(x);
      for(const p of x.records.slice(0,3)) {
        if(!p.timestamp||!p.url)continue;
        const playback=endpoint.provider==='arquivo'?
          'https://arquivo.pt/noFrame/replay/'+p.timestamp+'id_/'+p.url:
          'https://web.archive.org/web/'+p.timestamp+'id_/'+p.url;
        const got=await get(playback);
        const md=details(playback,got.body,'replayed historical file');
        x.replay={...md,status:got.status,error:got.error};
        if(got.status===200&&!md.html&&got.body.length>0&&got.body.length<=500000){
          const safe=target.label+'-'+endpoint.provider+'-'+(/https:/.test(url)?'https':'http');
          x.replay.retained=preserve(safe,got.body);
        }
      }
    }
  }
  return {target,findings};
}
async function main() {
  assert.equal(targets.length,2);
  assert.equal(targets[0].line,174324);
  assert.equal(targets[1].line,204064);
  assert.equal(gitBlob(Buffer.from('test')),'30d74d258442c7c65512eafab474568dd706c430');
  console.log('SELFTEST source IDs, request constructors, Git blob: PASS');
  if(!process.argv.includes('--network'))return;
  const response=await get(SOURCE_URL);
  assert.equal(response.status,200,'original IRC source HTTP');
  assert.equal(response.body.length,ORIGINAL_BYTES,'original source size');
  assert.equal(gitBlob(response.body),ORIGINAL_BLOB,'original source Git blob');
  const original=response.body.toString('latin1').split(/\r?\n/);
  for(const target of targets) {
    assert(original[target.line-1].includes(target.url),'source exact ID L'+target.line);
    console.log('ORIGINAL_CONTEXT',JSON.stringify({line:target.line,text:original[target.line-1],
      preceding:original[target.line-2],following:original[target.line]}));
  }
  const controlR=await get(arquivoUrl(control,'2014','2014'));
  const controlText=controlR.body.toString('utf8');
  console.log('CONTROL',JSON.stringify({url:control,status:controlR.status,
    first:controlText.slice(0,240),size:controlR.body.length}));
  for(const target of targets)console.log('TARGET',JSON.stringify(await probe(target)));
}
main().catch(error=>{console.error(error.stack||String(error));process.exitCode=1});
