'use strict';

/**
 * Exact 2014 source-addressed mirror recovery for Liber Primus Stage11.
 * Internet Archive/Arquivo are accessed read-only. No guessed paths.
 * Historical screenshots or new mirror content are untrusted until dated
 * original bytes and archive provenance can be pinned.
 *
 * Run: node sims/lp2_2014_original_zip_mirror_recovery.cjs
 * Builtin Node 22 only. Optional --selftest for plant/parser controls.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');

const mirrors=[
  'https://shadow-code.org/onion7.zip',
  'http://terrafant.asia/cicada/onion7.zip',
];
const archives=['wayback','arquivo'];
const archivedYears={from:'2014',to:'2026'};
const maxBytes=80*1024*1024;

/** @param {Buffer} b */
function sha(b){return crypto.createHash('sha256').update(b).digest('hex');}
/** @param {Buffer} b */
function isZip(b){return b.length>=4 && b.subarray(0,4).equals(Buffer.from([0x50,0x4b,0x03,0x04]));}
/** @param {string} f @param {Buffer|string} data */
function writeAtomicLocked(f,data){
  const lock=f+'.lock', fd=fs.openSync(lock,'wx');
  try {
    const temp=f+'.'+process.pid+'.tmp';
    fs.writeFileSync(temp,data,{flag:'wx'});
    fs.renameSync(temp,f);
  } finally {fs.closeSync(fd);fs.unlinkSync(lock);}
}
/** @param {string} url @param {boolean} allowBinary */
async function get(url,allowBinary=false){
  try{
    const response=await fetch(url,{
      signal:AbortSignal.timeout(22000),
      redirect:'follow',
      headers:{'user-agent':'LP2-2014-Mirror-Recovery/1 (source-directed archival research)'}
    });
    const n=Number(response.headers.get('content-length')||0);
    if(n>maxBytes) return {status:response.status,url:response.url,tooLarge:n};
    const b=Buffer.from(await response.arrayBuffer());
    if(b.length>maxBytes) return {status:response.status,url:response.url,tooLarge:b.length};
    const entry={status:response.status,url:response.url,bytes:b.length,sha256:sha(b),zip:isZip(b),
      contentType:response.headers.get('content-type')||''};
    if(allowBinary && response.ok && isZip(b)) entry.buffer=b;
    else if(b.length<1000000) entry.body=b.toString('utf8');
    return entry;
  } catch(e){return {error:String(e)};}
}
/** @param {string} source @param {string} u */
function indexUrl(source,u){
  if(source==='wayback'){
    const q=new URL('https://web.archive.org/cdx/search/cdx');
    q.searchParams.set('url',u);q.searchParams.set('output','json');
    q.searchParams.set('filter','statuscode:200');
    q.searchParams.set('from',archivedYears.from);
    q.searchParams.set('to',archivedYears.to);
    q.searchParams.set('collapse','timestamp:6');
    return q.toString();
  }
  const q=new URL('https://arquivo.pt/wayback/cdx');
  q.searchParams.set('url',u);q.searchParams.set('output','json');
  q.searchParams.set('from',archivedYears.from);
  q.searchParams.set('to',archivedYears.to);q.searchParams.set('limit','150');
  return q.toString();
}
/** @param {string} source @param {string} raw */
function records(source,raw){
  if(source==='wayback'){
    const table=JSON.parse(raw);
    assert(Array.isArray(table),'Wayback table array');
    if(!table.length)return [];
    const heads=table[0].map(s=>s.toLowerCase());
    return table.slice(1).map(row=>Object.fromEntries(row.map((v,i)=>[heads[i],v])));
  }
  return raw.split(/\r?\n/).filter(Boolean).map(JSON.parse);
}
function selftest(){
  assert(isZip(Buffer.from('504b0304','hex')));
  assert(!isZip(Buffer.from('<html>')));
  const wb='[["timestamp","original","statuscode"],["20140502","http://x/y","200"]]';
  assert.deepEqual(records('wayback',wb),[{timestamp:'20140502',original:'http://x/y',statuscode:'200'}]);
  assert.equal(records('arquivo','{"timestamp":"20140502145100","status":200}\n').length,1);
  assert.equal(mirrors.length,2);
  console.log('SFT ZIP signature, archive index parsing, frozen source URLs: PASS');
}
async function main(){
  selftest();
  if(process.argv.includes('--selftest'))return;
  const out=path.join(process.cwd(),'mirror-2014-original-recovery');
  fs.mkdirSync(out,{recursive:true});
  const results=[],indexCache=[];
  // Archive index control prevents false negative when the service is down.
  for(const archive of archives){
    const control=indexUrl(archive,'http://www.sapo.pt/');
    const controlResult=await get(control);
    indexCache.push({source:archive,url:control,status:controlResult.status,error:controlResult.error,
      nBytes:controlResult.bytes,parseable:!!controlResult.body});
  }
  for(const u of mirrors){
    const row={original:u,indices:[]};
    for(const archive of archives){
      const api=indexUrl(archive,u),q=await get(api);
      const record={source:archive,request:api,index:{status:q.status,error:q.error,nBytes:q.bytes}};
      if(q.body){
        try{record.records=records(archive,q.body).slice(0,150);
            record.index.count=record.records.length;}
        catch(e){record.index.parseError=String(e);record.index.bodyHead=q.body.slice(0,300);}
      }
      const good=(record.records||[]).filter(x=>String(x.statuscode||x.status)==='200');
      const probes=[];
      for(const c of good.slice(0,3)){
        const timestamp=c.timestamp,original=c.original||c.url||u;
        const replay=archive==='wayback'?
          'https://web.archive.org/web/'+timestamp+'id_/'+original:
          'https://arquivo.pt/wayback/'+timestamp+'id_/'+original;
        const a=await get(replay,true);
        const b=a.buffer;delete a.buffer;delete a.body;
        if(b){const filename='recovered-'+archive+'-'+timestamp+'.zip';
          writeAtomicLocked(path.join(out,filename),b);a.localFile=filename;}
        probes.push({timestamp,original,requested:replay,result:a});
      }
      record.replays=probes;
      row.indices.push(record);
    }
    results.push(row);
  }
  const report={schema:1,purpose:'May 2014 named participant mirror ZIP exact archive retrieval',
    evidence:'IRC 2014 May 02 14:53 shadow-code.org/onion7.zip; May09 terrafant.asia/cicada/onion7.zip',
    sourceLog:'neuroretransmit/cicada #cicadasolvers.freenode.log GitSHA1 bdd277c14f94c34b5ae714cd00c238065beeed4e',
    archivedYears,controls:indexCache,results,
    interpretation:'Missing index or failed HTTP is inconclusive; restored ZIP may be a participant-created copy, not an author-selected key.'};
  writeAtomicLocked(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report,null,2));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
