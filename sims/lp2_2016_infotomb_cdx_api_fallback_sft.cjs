'use strict';
/**
 * Bounded Common Crawl CDX API fallback for the InfoTomb temporary paths.
 * The raw cluster.idx gate already covered CC-MAIN-2016-44 and -50, but its
 * range lookup was uncertified for the other 2016 collections. This queries
 * the public per-crawl CDXJ API for the source-derived /tmp/208771 prefix,
 * then classifies the three exact pathnames. It also queries two generic
 * known-site controls and the same-host 4gq25 carrier. Node.js 22.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const crypto = require('node:crypto');

const OUT = 'infotomb-temp-path-recovery';
const COLLECTIONS = [
  'CC-MAIN-2016-07','CC-MAIN-2016-18','CC-MAIN-2016-22',
  'CC-MAIN-2016-26','CC-MAIN-2016-30','CC-MAIN-2016-36',
  'CC-MAIN-2016-40','CC-MAIN-2016-44','CC-MAIN-2016-50'
];
const PREFIX_QUERY = {id:'temp-path-prefix',url:'infotomb.com/tmp/208771',matchType:'prefix'};
const CANDIDATE_PATHS = [
  {id:'object',path:'/tmp/208771'},
  {id:'thumbnail',path:'/tmp/208771.thumb.jpg'},
  {id:'text-companion',path:'/tmp/208771_text'}
];
const CONTROLS = [
  {id:'example-com',url:'https://example.com/',matchType:'exact'},
  {id:'commoncrawl-org',url:'https://commoncrawl.org/',matchType:'exact'},
  {id:'known-carrier',url:'infotomb.com/4gq25.jpg',matchType:'exact'}
];
const sha256 = b => crypto.createHash('sha256').update(b).digest('hex');
const blobSha1 = b => crypto.createHash('sha1').update(Buffer.from('blob '+b.length+'\0')).update(b).digest('hex');

function save(name,buf) {
  const p=path.join(OUT,name);
  fs.mkdirSync(path.dirname(p),{recursive:true});
  fs.writeFileSync(p,buf);
}
function saveJson(name,obj) {
  save(name,Buffer.from(JSON.stringify(obj,null,2)+'\n'));
}
function wait(ms) {
  return new Promise(resolve=>setTimeout(resolve,ms));
}
async function request(url,headers) {
  let last=null;
  const delays=[1000,2000,4000,8000];
  for(let attempt=0;attempt<5;attempt++) {
    try {
      const r=await fetch(url,{
        headers:Object.assign({'user-agent':'Liber-Primus-InfoTomb-CDXJ-fallback/1.0'},headers||{}),
        redirect:'follow',
        signal:AbortSignal.timeout(45000)
      });
      const body=Buffer.from(await r.arrayBuffer());
      if([429,500,502,503,504].includes(r.status)&&attempt<4) {
        await wait(delays[attempt]);
        continue;
      }
      return {status:r.status,url:r.url,headers:Object.fromEntries(r.headers.entries()),body};
    } catch(e) {
      last=String(e);
      if(attempt<4) await wait(delays[attempt]);
    }
  }
  return {status:null,url,headers:{},body:Buffer.alloc(0),error:last};
}
function parseJsonLines(text) {
  const lines=text.split(/\r?\n/).filter(Boolean);
  const records=[];
  for(const line of lines) {
    try { records.push(JSON.parse(line)); }
    catch(e) { return {records,error:'Invalid CDXJ JSON line: '+String(e),excerpt:line.slice(0,500)}; }
  }
  return {records};
}
function classifyCandidate(record) {
  let u;
  try { u=new URL(record.url); } catch { return null; }
  if(u.hostname.toLowerCase()!=='infotomb.com') return null;
  if(!u.pathname.startsWith('/tmp/208771')) return null;
  const exact=CANDIDATE_PATHS.find(x=>x.path===u.pathname);
  return {
    id:exact?exact.id:'prefix-variant',
    url:record.url,
    pathname:u.pathname,
    query:u.search,
    exact_path:!!exact,
    exact_url:!!exact&&!u.search&&['http:','https:'].includes(u.protocol),
    timestamp:record.timestamp,
    status:String(record.status||record.statuscode||''),
    mime:record.mime||record.mimetype||null,
    digest:record.digest||null,
    length:record.length||null,
    filename:record.filename||null,
    offset:record.offset||null,
    urlkey:record.urlkey||null
  };
}
function isCompleteQuery(query) {
  if(query.status===200) return !query.parse_error&&!query.truncated;
  return query.status===404&&/No Captures found for:/.test(query.response_excerpt||'');
}
function hasPositiveControl(query) {
  return !!query&&query.status===200&&!query.parse_error&&!query.truncated&&
    (query.records||[]).some(r=>String(r.status||r.statuscode)==='200');
}
async function queryIndex(collection,query) {
  const params=new URLSearchParams({
    url:query.url,
    matchType:query.matchType,
    output:'json',
    fl:'urlkey,timestamp,url,status,mime,digest,length,filename,offset',
    limit:'1000'
  });
  const url='https://index.commoncrawl.org/'+collection+'-index?'+params.toString();
  const r=await request(url);
  const out={collection,id:query.id,query_url:url,status:r.status,final_url:r.url,error:r.error};
  if(r.body.length) {
    out.response_bytes=r.body.length;
    if(r.status===200) {
      const parsed=parseJsonLines(r.body.toString('utf8'));
      out.records=parsed.records;
      if(parsed.error) { out.parse_error=parsed.error; out.parse_excerpt=parsed.excerpt; }
      out.truncated=parsed.records.length>=1000;
    } else {
      out.response_excerpt=r.body.toString('utf8').slice(0,1000);
      out.no_captures=r.status===404&&/No Captures found for:/.test(out.response_excerpt);
      if(out.no_captures) { out.records=[]; out.truncated=false; }
    }
  } else if(r.status===200) {
    out.records=[];
    out.truncated=false;
  }
  return out;
}
function parseWarc(warc) {
  const sep=Buffer.from('\r\n\r\n');
  const warcEnd=warc.indexOf(sep);
  if(warcEnd<0) throw new Error('Missing WARC header boundary');
  const httpStart=warc.indexOf(Buffer.from('HTTP/'),warcEnd+4);
  if(httpStart<0) throw new Error('Missing embedded HTTP response');
  const httpEnd=warc.indexOf(sep,httpStart);
  if(httpEnd<0) throw new Error('Missing embedded HTTP header boundary');
  const headers=warc.subarray(httpStart,httpEnd).toString('latin1');
  const m=headers.match(/(?:^|\r\n)Content-Length:\s*(\d+)/i);
  const start=httpEnd+4;
  const end=m?Math.min(warc.length,start+Number(m[1])):warc.length;
  return {headers,payload:warc.subarray(start,end)};
}
async function preserveWarc(collection,record,id) {
  const start=Number(record.offset),length=Number(record.length);
  if(!record.filename||!Number.isSafeInteger(start)||!Number.isSafeInteger(length)||length<=0)
    return {id,collection,error:'Missing or invalid WARC pointer',record};
  const url='https://data.commoncrawl.org/'+record.filename;
  const r=await request(url,{range:'bytes='+start+'-'+(start+length-1)});
  if(r.status!==206) return {id,collection,url,status:r.status,error:r.error||'Expected HTTP 206',headers:r.headers};
  const rel='commoncrawl-api/'+id+'-'+collection+'-'+String(record.timestamp||'unknown');
  save(rel+'.warc.gz',r.body);
  let warc;
  try { warc=zlib.gunzipSync(r.body); }
  catch(e) { return {id,collection,url,error:'WARC gzip failed: '+String(e),compressed_bytes:r.body.length}; }
  save(rel+'.warc',warc);
  let parsed;
  try { parsed=parseWarc(warc); }
  catch(e) { return {id,collection,url,error:String(e),warc_bytes:warc.length}; }
  save(rel+'.body',parsed.payload);
  return {
    id,collection,url,status:r.status,warc_bytes:warc.length,payload_bytes:parsed.payload.length,
    payload_sha256:sha256(parsed.payload),payload_git_blob_sha1:blobSha1(parsed.payload),
    http_headers:parsed.headers,payload_excerpt:parsed.payload.subarray(0,1000).toString('utf8'),
    saved:rel
  };
}
async function main() {
  const started=new Date().toISOString();
  const collections=[];
  for(const collection of COLLECTIONS) {
    const prefix=await queryIndex(collection,PREFIX_QUERY);
    const controls=[];
    for(const control of CONTROLS) controls.push(await queryIndex(collection,control));
    const candidateRecords=(prefix.records||[]).map(classifyCandidate).filter(Boolean);
    const commoncrawlControl=controls.find(c=>c.id==='commoncrawl-org');
    const genericControlPass=hasPositiveControl(commoncrawlControl);
    collections.push({
      collection,
      prefix_query:prefix,
      candidate_records:candidateRecords,
      controls,
      generic_control_pass:genericControlPass,
      complete:isCompleteQuery(prefix)&&genericControlPass
    });
    await wait(250);
  }
  const hits=[];
  for(const c of collections) {
    for(const r of c.candidate_records) {
      if(r.exact_path&&r.status==='200') {
        const source=(c.prefix_query.records||[]).find(x=>x.url===r.url&&String(x.timestamp)===String(r.timestamp));
        if(source) hits.push({collection:c.collection,record:source,id:r.id});
      }
    }
  }
  const retrieved=[];
  for(const h of hits) retrieved.push(await preserveWarc(h.collection,h.record,h.id));
  const complete=collections.every(c=>c.complete&&c.generic_control_pass);
  const noCandidate=collections.every(c=>c.candidate_records.length===0);
  const result={
    task:'Common Crawl CDX API fallback for exact InfoTomb temporary-path sidecar',
    started,finished:new Date().toISOString(),
    collections:COLLECTIONS,
    prefix_query:PREFIX_QUERY,
    exact_candidate_paths:CANDIDATE_PATHS,
    controls:CONTROLS,
    collection_results:collections,
    retrieved_http200_candidates:retrieved,
    all_collection_queries_complete:complete,
    no_candidate_path_records:noCandidate,
    candidate_record_count:collections.reduce((n,c)=>n+c.candidate_records.length,0),
    candidate_http200_count:hits.length,
    interpretation:complete&&noCandidate
      ?'No records for the three source-named temporary paths or their path-prefix variants were returned by the nine 2016 Common Crawl CDX indexes; per-index generic positive controls passed. This is a bounded index-coverage negative, not proof that the files never existed or were never publicly served.'
      :hits.length
        ?'At least one candidate-path HTTP-200 record exists; inspect preserved WARC payloads before interpreting it.'
        :'Common Crawl CDX API coverage remains incomplete or a candidate-path record requires inspection; do not claim archive absence.'
  };
  saveJson('commoncrawl-api-fallback.json',result);
  console.log(JSON.stringify({
    all_collection_queries_complete:complete,
    no_candidate_path_records:noCandidate,
    candidate_record_count:result.candidate_record_count,
    candidate_http200_count:hits.length,
    collections:collections.map(c=>({
      collection:c.collection,complete:c.complete,generic_control_pass:c.generic_control_pass,
      prefix_status:c.prefix_query.status,prefix_records:c.prefix_query.records?.length||0,
      candidate_records:c.candidate_records,
      controls:c.controls.map(x=>({id:x.id,status:x.status,records:x.records?.length||0,error:x.error||x.parse_error}))
    })),
    retrieved_http200_candidates:retrieved,
    interpretation:result.interpretation
  },null,2));
}
function selftest() {
  const fixture=[
    JSON.stringify({urlkey:'com,infotomb)/tmp/208771',timestamp:'20160109171430',url:'http://infotomb.com/tmp/208771',status:'200'}),
    JSON.stringify({urlkey:'com,infotomb)/tmp/208771_text',timestamp:'20160109171430',url:'https://infotomb.com/tmp/208771_text',status:'200'})
  ].join('\n');
  const parsed=parseJsonLines(fixture);
  assert.equal(parsed.records.length,2);
  assert.equal(classifyCandidate(parsed.records[0]).id,'object');
  assert.equal(classifyCandidate(parsed.records[1]).id,'text-companion');
  assert.equal(classifyCandidate({url:'http://infotomb.com/tmp/208771.thumb.jpg',status:'200'}).id,'thumbnail');
  assert.equal(classifyCandidate({url:'http://infotomb.com/tmp/208771_text?x=1',status:'200'}).exact_url,false);
  assert.equal(classifyCandidate({url:'http://infotomb.com/tmp/208772',status:'200'}),null);
  assert.equal(isCompleteQuery({status:404,response_excerpt:'{"message":"No Captures found for: infotomb.com/tmp/208771"}'}),true);
  assert.equal(isCompleteQuery({status:404,response_excerpt:'{"message":"Invalid query"}'}),false);
  assert.equal(isCompleteQuery({status:503,response_excerpt:'upstream unavailable'}),false);
  assert.equal(hasPositiveControl({status:200,records:[{status:'200'}]}),true);
  assert.equal(hasPositiveControl({status:200,records:[{status:'301'}]}),false);
  assert.equal(COLLECTIONS.length,9);
  console.log('PASS: CDXJ parsing, exact path classification, no-capture 404 semantics and nine-collection inventory');
}
if(process.argv.includes('--selftest')) selftest();
else main().catch(e=>{console.error(e&&e.stack||e);process.exitCode=1;});
