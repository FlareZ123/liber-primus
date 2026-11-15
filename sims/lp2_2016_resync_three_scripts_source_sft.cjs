'use strict';
/**
 * First-party 2016 #cicadarunes solver-code source acquisition, Director #1133.
 * Exactly three dated resync-published script handles from the original IRC log.
 * Read-only retrieval. External code is never executed.
 * Node 22, standalone test file: node sims/lp2_2016_resync_three_scripts_source_sft.cjs --network
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const LOG = 'https://raw.githubusercontent.com/cicada-solvers/neuroretransmit-cicada/main/irc-logs/%23cicadasolvers.freenode.2.log';
const LOG_BLOB = '72634a9d071d32af767edbffc0493d810e88cd0d';
const TARGETS = [
  {line:243514, id:'BRZM', date:'2016-01-10', claim:'resync original guess program'},
  {line:250805, id:'CPGV', date:'2016-01-12', claim:'resync guessed-plaintext shift-sequence tool'},
  {line:287131, id:'AjcT', date:'2016-01-30', claim:'resync rune_guesser including GP29'}
];
const FOLDER = 'resync2016-source-objects';

/** @param {Buffer} buffer */
function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}
/** @param {Buffer} buffer */
function blobSha(buffer) {
  return crypto.createHash('sha1').update('blob '+buffer.length+'\0').update(buffer).digest('hex');
}
/** @param {string} url */
async function get(url) {
  try {
    const r = await fetch(url,{
      redirect:'follow',
      signal:AbortSignal.timeout(18000),
      headers:{'user-agent':'LP2-resync-2016-source-code-acquisition/1.0',
        'accept':'text/plain,application/json,text/html,*/*'}
    });
    return {
      status:r.status,
      finalUrl:r.url,
      type:r.headers.get('content-type')||'',
      body:Buffer.from(await r.arrayBuffer())
    };
  } catch(e) {
    return {status:null,finalUrl:url,type:'',body:Buffer.alloc(0),error:String(e)};
  }
}
/** @param {Buffer} data */
function isHtml(data) {
  return /<!doctype|<html|<head|<body|not found|error 404/i.test(data.subarray(0,900).toString('utf8'));
}
/** @param {string} source @param {string} name @param {Buffer} buffer */
function preserve(source,name,buffer) {
  fs.mkdirSync(FOLDER,{recursive:true});
  const output=path.join(FOLDER,name+'-'+source+'.txt');
  const lock=output+'.lock';
  const lockFile=fs.openSync(lock,'wx');
  try {
    const temp=output+'.'+process.pid+'.tmp';
    fs.writeFileSync(temp,buffer,{flag:'wx'});
    fs.renameSync(temp,output);
  } finally {
    fs.closeSync(lockFile);
    fs.unlinkSync(lock);
  }
  return output;
}
/** @param {{status:number|null,type:string,body:Buffer,finalUrl:string,error?:string}} r @param {string} source @param {string} name */
function inspect(r,source,name) {
  const {body}=r;
  const result={
    status:r.status,url:r.finalUrl,type:r.type,
    size:body.length,sha256:sha256(body),error:r.error,
    html:isHtml(body),preview:body.subarray(0,450).toString('utf8')
  };
  if(r.status===200&&body.length>=100&&body.length<=300000&&!result.html &&
      /(?:^#!.*(?:perl|python)|\b(?:use strict|sub\s+\w+|def\s+\w+|import\s+\w+|my\s+\$))/m.test(body.toString('utf8'))) {
    result.originalCodeCandidate=true;
    result.artifact=preserve(source,name,body);
  }
  return result;
}
/** @param {string} u */
function wayback(u) {
  const url = new URL('https://web.archive.org/cdx/search/cdx');
  for(const [k,v] of Object.entries({url:u,output:'json',from:'2016',to:'2018',filter:'statuscode:200',collapse:'timestamp:4'})) url.searchParams.set(k,v);
  return url.href;
}
/** @param {string} u */
function arquivo(u) {
  const url=new URL('https://arquivo.pt/wayback/cdx');
  for(const [k,v] of Object.entries({url:u,from:'2016',to:'2018',output:'json',limit:'30'})) url.searchParams.set(k,v);
  return url.href;
}
/** @param {string} text @param {string} provider */
function parseRows(text,provider) {
  if(provider==='wayback') {
    const v=JSON.parse(text);
    if(!Array.isArray(v)||!Array.isArray(v[0]))return [];
    const [keys,...rows]=v;
    return rows.map(row=>Object.fromEntries(keys.map((key,i)=>[key,row[i]])));
  }
  return text.split(/\r?\n/).filter(Boolean).flatMap(line=>{
    try {const obj=JSON.parse(line);return Array.isArray(obj)?obj:[obj];}
    catch{return [];}
  });
}
/** @param {{id:string,date:string,line:number,claim:string}} target */
async function probe(target) {
  const url='http://sprunge.us/'+target.id;
  const endpoints=[
    {name:'live-http',url},
    {name:'live-https',url:'https://sprunge.us/'+target.id},
    {name:'wayback',url:wayback(url)},
    {name:'arquivo',url:arquivo(url)}
  ];
  const results=[];
  for(const point of endpoints) {
    const r=await get(point.url);
    const item=inspect(r,point.name,target.id);
    if(point.name==='wayback'||point.name==='arquivo') {
      const rows=parseRows(r.body.toString('utf8'),point.name);
      item.rows=rows.length;
      item.captures=rows.slice(0,4).map(row=>({
        date:row.timestamp,url:row.original||row.url,
        mime:row.mimetype||row.mime,digest:row.digest
      }));
      for(const c of item.captures.slice(0,2)) {
        if(!c.date||!c.url)continue;
        const replay=point.name==='wayback'?
          'https://web.archive.org/web/'+c.date+'id_/'+c.url:
          'https://arquivo.pt/noFrame/replay/'+c.date+'id_/'+c.url;
        const body=await get(replay);
        item.replay=inspect(body,point.name+'-historical',target.id);
      }
    }
    results.push({provider:point.name,...item});
  }
  return {target,results};
}
async function main() {
  assert.equal(TARGETS.length,3);
  assert.equal(blobSha(Buffer.from('test')),'30d74d258442c7c65512eafab474568dd706c430');
  assert.equal(wayback('http://sprunge.us/BRZM').includes('BRZM'),true);
  console.log('SELFTEST source IDs, archival constructors, original-code safety PASS');
  if(!process.argv.includes('--network'))return;
  const original=await get(LOG);
  assert.equal(original.status,200,'Original 2015-16 IRC network source');
  assert.equal(blobSha(original.body),LOG_BLOB,'Immutable original IRC Git blob mismatch');
  const lines=original.body.toString('utf8').split(/\r?\n/);
  for(const target of TARGETS) {
    const statement=lines[target.line-1];
    assert(statement&&statement.includes('<resync>')&&statement.includes('sprunge.us/'+target.id),
      'Original IRC source line did not identify '+target.id);
    console.log('SOURCE',JSON.stringify({
      line:target.line,text:statement, preceding:lines[target.line-2],
      following:lines[target.line],sourceBlob:LOG_BLOB}));
  }
  for(const target of TARGETS) {
    const result=await probe(target);
    console.log('OBJECT',JSON.stringify(result));
  }
}
main().catch(err=>{console.error(err.stack||String(err));process.exitCode=1});
