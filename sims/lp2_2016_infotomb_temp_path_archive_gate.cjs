'use strict';
/**
 * Exact-path archive gate for the three filesystem names exposed by the
 * 2016-01-09 InfoTomb response. Tests only literal /tmp/ URL forms under
 * HTTP and HTTPS; it does not assume these server paths were public URLs.
 * Queries Wayback CDX and nine 2016 Common Crawl collections. Node 22.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const crypto = require('node:crypto');

const OUT = 'infotomb-temp-path-recovery';
const BASE = 'https://data.commoncrawl.org/cc-index/collections/';
const COLLECTIONS = [
  'CC-MAIN-2016-07','CC-MAIN-2016-18','CC-MAIN-2016-22',
  'CC-MAIN-2016-26','CC-MAIN-2016-30','CC-MAIN-2016-36',
  'CC-MAIN-2016-40','CC-MAIN-2016-44','CC-MAIN-2016-50'
];
const TARGETS = [
  {id:'object',surt:'com,infotomb)/tmp/208771',urls:['http://infotomb.com/tmp/208771','https://infotomb.com/tmp/208771']},
  {id:'thumbnail',surt:'com,infotomb)/tmp/208771.thumb.jpg',urls:['http://infotomb.com/tmp/208771.thumb.jpg','https://infotomb.com/tmp/208771.thumb.jpg']},
  {id:'text-companion',surt:'com,infotomb)/tmp/208771_text',urls:['http://infotomb.com/tmp/208771_text','https://infotomb.com/tmp/208771_text']},
  {id:'known-carrier-control',surt:'com,infotomb)/4gq25.jpg',urls:['http://infotomb.com/4gq25.jpg','https://infotomb.com/4gq25.jpg'],control:true}
];

const CANDIDATES = [
  {id:'object-http',url:'http://infotomb.com/tmp/208771'},
  {id:'object-https',url:'https://infotomb.com/tmp/208771'},
  {id:'thumbnail-http',url:'http://infotomb.com/tmp/208771.thumb.jpg'},
  {id:'thumbnail-https',url:'https://infotomb.com/tmp/208771.thumb.jpg'},
  {id:'text-http',url:'http://infotomb.com/tmp/208771_text'},
  {id:'text-https',url:'https://infotomb.com/tmp/208771_text'}
];
const CONTROLS = [
  {id:'carrier-http',url:'http://infotomb.com/4gq25.jpg'},
  {id:'carrier-https',url:'https://infotomb.com/4gq25.jpg'}
];
const sha256 = b => crypto.createHash('sha256').update(b).digest('hex');
const blobSha1 = b => crypto.createHash('sha1').update(Buffer.from('blob '+b.length+'\0')).update(b).digest('hex');
function save(name,buf){const p=path.join(OUT,name);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,buf);}
function saveJson(name,obj){save(name,Buffer.from(JSON.stringify(obj,null,2)+'\n'));}
async function request(url,headers){
 let last=null;
 for(let n=0;n<4;n++){
  try{
   const r=await fetch(url,{headers:Object.assign({'user-agent':'Liber-Primus-InfoTomb-temp-path-gate/1.0'},headers||{}),redirect:'follow',signal:AbortSignal.timeout(25000)});
   const body=Buffer.from(await r.arrayBuffer());
   if([429,500,502,503,504].includes(r.status)&&n<3){await new Promise(ok=>setTimeout(ok,500*(n+1)));continue;}
   return {status:r.status,url:r.url,headers:Object.fromEntries(r.headers.entries()),body};
  }catch(e){last=String(e);if(n<3)await new Promise(ok=>setTimeout(ok,500*(n+1)));}
 }
 return {status:null,url,headers:{},body:Buffer.alloc(0),error:last};
}
function parseWayback(s){return JSON.parse(s).map(x=>({timestamp:String(x[0]),original:String(x[1]),mimetype:String(x[2]),statuscode:String(x[3]),digest:String(x[4]),length:Number(x[5])}));}
function parseCC(s){return s.split(/\r?\n/).filter(Boolean).map(x=>JSON.parse(x));}
function parseWarc(b){
 const sep=Buffer.from('\r\n\r\n'), a=b.indexOf(sep);
 if(a<0)throw Error('missing WARC header boundary');
 const h=b.indexOf(Buffer.from('HTTP/'),a+4), z=h<0?-1:b.indexOf(sep,h);
 if(h<0||z<0)throw Error('missing embedded HTTP response');
 const headers=b.subarray(h,z).toString('latin1'), m=headers.match(/(?:^|\r\n)Content-Length:\s*(\d+)/i);
 const start=z+4, end=m?Math.min(b.length,start+Number(m[1])):b.length;
 return {headers,payload:b.subarray(start,end)};
}
async function limit(items,n,fn){
 const out=new Array(items.length);let k=0;
 await Promise.all(Array.from({length:n},async()=>{while(k<items.length){const i=k++;out[i]=await fn(items[i]);}}));
 return out;
}
async function queryWayback(x){
 const p=new URLSearchParams({url:x.url,output:'json',matchType:'exact',fl:'timestamp,original,mimetype,statuscode,digest,length'});
 const q='https://web.archive.org/cdx/search/cdx?'+p.toString(),r=await request(q);
 const o={id:x.id,url:x.url,query:q,status:r.status,final_url:r.url,error:r.error};
 if(r.body.length){o.excerpt=r.body.toString('utf8').slice(0,8000);if(r.status===200){try{o.records=parseWayback(r.body.toString('utf8'));}catch(e){o.parse_error=String(e);}}}
 return o;
}
async function headIndex(url){
  let last=null;
  for(let n=0;n<4;n++){
    try{
      const r=await fetch(url,{method:'HEAD',headers:{'user-agent':'Liber-Primus-InfoTomb-temp-path-gate/1.0'},redirect:'follow',signal:AbortSignal.timeout(30000)});
      return {status:r.status,url:r.url,headers:Object.fromEntries(r.headers.entries())};
    }catch(e){last=String(e);if(n<3)await new Promise(ok=>setTimeout(ok,500*(n+1)));}
  }
  return {status:null,url,headers:{},error:last};
}
async function ranged(url,start,end){
  const r=await request(url,{range:'bytes='+start+'-'+end});
  if(r.error)return r;
  if(r.status!==206)return {error:'Expected HTTP 206 for byte range; received '+r.status,status:r.status,headers:r.headers,url:r.url,body:Buffer.alloc(0)};
  return r;
}
function clusterRow(line){
  const cols=line.split('\t');
  if(cols.length<4)throw new Error('Malformed cluster row: '+line.slice(0,120));
  return {key:cols[0].split(' ')[0],object:cols[1],offset:Number(cols[2]),length:Number(cols[3])};
}
function cdxRecord(line){
  const pos=line.indexOf('{');
  if(pos<0)return null;
  const meta=line.slice(0,pos).trim().split(/\s+/);
  const record=JSON.parse(line.slice(pos));
  if(!record.urlkey)record.urlkey=meta[0];
  if(!record.timestamp)record.timestamp=meta[1];
  return record;
}
function fullLines(buf,start){
  const lines=buf.toString('utf8').split('\n');
  if(start!==0)lines.shift();
  lines.pop();
  return lines.filter(Boolean);
}
async function locateCluster(indexUrl,size,target){
  let lo=0,hi=size-1,rounds=0;
  const probes=[];
  while(hi-lo>100000&&rounds<32){
    const mid=Math.floor((lo+hi)/2),end=Math.min(size-1,mid+12000);
    const response=await ranged(indexUrl,mid,end);
    if(response.error)return {error:response.error,probes,rounds};
    const lines=fullLines(response.body,mid);
    if(!lines.length)return {error:'No complete cluster rows in range',probes,rounds};
    const point=clusterRow(lines[0]);
    probes.push({mid,key:point.key});
    if(point.key<=target)lo=mid;else hi=mid;
    rounds++;
  }
  const begin=Math.max(0,lo-120000),end=Math.min(size-1,hi+120000),rows=[];
  for(let offset=begin;offset<=end;offset+=240000){
    const stop=Math.min(end,offset+239999),response=await ranged(indexUrl,offset,stop);
    if(response.error)return {error:response.error,probes,rounds};
    rows.push(...fullLines(response.body,offset).map(clusterRow));
  }
  rows.sort((a,b)=>a.offset-b.offset);
  const eligible=rows.filter(row=>row.key<=target);
  const floor=eligible.length?eligible[eligible.length-1]:null;
  const next=rows.find(row=>row.key>target);
  const firstKey=rows[0]&&rows[0].key,lastKey=rows.length&&rows[rows.length-1].key;
  const before=begin===0&&!!firstKey&&target<firstKey;
  const after=end===size-1&&!!lastKey&&target>lastKey;
  const exactFloor=!!floor&&floor.key===target;
  return {floor,next_key:next?next.key:null,certified:before||after||exactFloor||!!next,
    outside_range:before?'before':after?'after':null,
    rounds,probes:probes.slice(-5),scanned_range:[begin,end],candidate_rows:rows.length,
    first_key:firstKey,last_key:lastKey};
}
async function readCdxBlock(collection,indexRow){
  if(indexRow.length<10||indexRow.length>400000)return {error:'Unexpected CDX block length '+indexRow.length};
  const url=BASE+collection+'/indexes/'+indexRow.object;
  const response=await ranged(url,indexRow.offset,indexRow.offset+indexRow.length-1);
  if(response.error)return {error:response.error};
  try{
    const text=zlib.gunzipSync(response.body).toString('utf8');
    const records=text.split(/\r?\n/).filter(Boolean).map(cdxRecord).filter(Boolean);
    return {records,count:records.length};
  }catch(e){return {error:'CDX gzip/parse failed: '+String(e)};}
}
async function preserveWarc(collection,record,targetId){
  const relative='commoncrawl/'+targetId+'-'+collection+'-'+record.timestamp;
  const url='https://data.commoncrawl.org/'+record.filename;
  const response=await ranged(url,Number(record.offset),Number(record.offset)+Number(record.length)-1);
  if(response.error)return {error:response.error,url,status:response.status};
  save(relative+'.warc.gz',response.body);
  let warc;
  try{warc=zlib.gunzipSync(response.body);}catch(e){return {error:'WARC gzip failed: '+String(e),compressed_bytes:response.body.length};}
  save(relative+'.warc',warc);
  let parsed;
  try{parsed=parseWarc(warc);}catch(e){return {error:String(e),warc_bytes:warc.length};}
  save(relative+'.body',parsed.payload);
  return {url,status:response.status,warc_bytes:warc.length,payload_bytes:parsed.payload.length,
    payload_sha256:sha256(parsed.payload),payload_git_blob_sha1:blobSha1(parsed.payload),
    http_headers:parsed.headers,saved:relative};
}
async function commonCrawlAudit(){
  const findings=[];
  for(const collection of COLLECTIONS){
    const indexUrl=BASE+collection+'/indexes/cluster.idx';
    const head=await headIndex(indexUrl);
    const size=Number(head.headers&&head.headers['content-length']||0);
    const item={collection,cluster_head:{status:head.status,bytes:size,url:head.url,error:head.error},searches:[]};
    findings.push(item);
    if(head.status!==200||!size){item.error='Index metadata unavailable; no absence claim.';continue;}
    item.searches=await limit(TARGETS,2,async target=>{
      const located=await locateCluster(indexUrl,size,target.surt);
      const search={id:target.id,surt:target.surt,locate:located,certified:false,matches:[],warc:[]};
      if(located.certified&&located.outside_range){
        search.certified=true;search.certified_no_match=true;search.outside_range=located.outside_range;return search;
      }
      if(located.error||!located.floor||!located.certified){search.error='Cluster lookup not certified; no absence claim.';return search;}
      const block=await readCdxBlock(collection,located.floor);
      search.block={object:located.floor.object,offset:located.floor.offset,length:located.floor.length,
        count:block.count,error:block.error,first_key:block.records&&block.records[0]&&block.records[0].urlkey,
        last_key:block.records&&block.records[block.records.length-1]&&block.records[block.records.length-1].urlkey};
      if(block.error)return search;
      const records=block.records||[];
      const validRange=!!records.length&&search.block.first_key<=target.surt&&search.block.last_key>=target.surt;
      search.block.valid_key_range=validRange;
      const matches=records.filter(record=>record.urlkey===target.surt&&target.urls.includes(record.url));
      search.matches=matches.map(record=>({timestamp:record.timestamp,url:record.url,status:record.status,
        mime:record.mime,digest:record.digest,length:record.length,filename:record.filename,
        offset:record.offset}));
      search.certified=validRange&&located.certified;
      search.certified_no_match=search.certified&&matches.length===0;
      for(const record of matches.filter(r=>String(r.status)==='200').slice(0,3))
        search.warc.push(await preserveWarc(collection,record,target.id));
      return search;
    });
  }
  return findings;
}
async function retrieveWayback(x,rec){
 const u='https://web.archive.org/web/'+rec.timestamp+'id_/'+rec.original,r=await request(u);
 const o={id:x.id,timestamp:rec.timestamp,url:rec.original,mimetype:rec.mimetype,status:r.status,final_url:r.url,headers:r.headers,error:r.error};
 if(r.body.length){o.bytes=r.body.length;o.sha256=sha256(r.body);o.git_blob_sha1=blobSha1(r.body);
  const ext=rec.mimetype==='image/jpeg'?'.jpg':rec.mimetype==='image/png'?'.png':'.bin';
  save('wayback/'+x.id+'-'+rec.timestamp+ext,r.body);
  if(/^text\//i.test(rec.mimetype))o.text=r.body.toString('utf8').slice(0,3000);
 }
 return o;
}
async function main(){
 const started=new Date().toISOString();
 const wayback=await limit(CANDIDATES.concat(CONTROLS),4,queryWayback);
 const ccItems=[];for(const x of CANDIDATES)for(const collection of COLLECTIONS)ccItems.push({...x,collection});
 const commoncrawl=await limit(ccItems,5,queryCC);
 const wbHits=[];for(const x of CANDIDATES){const q=wayback.find(y=>y.id===x.id);for(const rec of (q?.records||[]).filter(y=>y.statuscode==='200').slice(0,3))wbHits.push({x,rec});}
 const ccHits=[];for(const x of CANDIDATES)for(const q of commoncrawl.filter(y=>y.id===x.id)){for(const rec of (q.records||[]).filter(y=>String(y.status)==='200').slice(0,1))ccHits.push({x:{...x,collection:q.collection},rec});}
 const retrievedWayback=await limit(wbHits,3,z=>retrieveWayback(z.x,z.rec));
 const retrievedCC=await limit(ccHits,3,z=>retrieveCC(z.x,z.rec));
 const controlPass=wayback.filter(x=>x.id.startsWith('carrier-')).some(x=>(x.records||[]).some(r=>r.statuscode==='200'&&(r.timestamp==='20160116224659'||r.timestamp==='20160109171430')));
 const count=wbHits.length+ccHits.length;
 const result={
  task:'Exact InfoTomb /tmp/208771 companion-path archival acquisition',
  started,finished:new Date().toISOString(),candidate_urls:CANDIDATES,known_carrier_controls:CONTROLS,
  commoncrawl_collections:COLLECTIONS,wayback,commoncrawl,retrieved_wayback:retrievedWayback,retrieved_commoncrawl:retrievedCC,
  known_carrier_wayback_control_passed:controlPass,candidate_archive_capture_count:count,
  interpretation:count?'At least one exact candidate URL has an archived HTTP-200 record; inspect retrieved bytes before interpretation.':
   controlPass?'No exact candidate HTTP-200 capture found in the tested Wayback and 2016 Common Crawl indexes; this bounds public archival recovery for the six tested URL forms.':
   'Negative is inconclusive because the known-carrier Wayback positive control did not pass.'
 };
 saveJson('result.json',result);
 console.log(JSON.stringify({
  known_carrier_wayback_control_passed:controlPass,
  wayback:wayback.map(x=>({id:x.id,status:x.status,count:(x.records||[]).length,error:x.error})),
  commoncrawl:commoncrawl.map(x=>({id:x.id,collection:x.collection,status:x.status,count:(x.records||[]).length,error:x.error})),
  retrieved_wayback:retrievedWayback.map(x=>({id:x.id,timestamp:x.timestamp,status:x.status,bytes:x.bytes,sha256:x.sha256})),
  retrieved_commoncrawl:retrievedCC.map(x=>({id:x.id,collection:x.collection,status:x.status,payload_bytes:x.payload_bytes,sha256:x.payload_sha256,error:x.error||x.parse_error})),
  candidate_archive_capture_count:count,interpretation:result.interpretation
 },null,2));
}
async function main(){
 const started=new Date().toISOString();
 const wayback=await limit(CANDIDATES.concat(CONTROLS),4,queryWayback);
 const commoncrawl=await commonCrawlAudit();
 const wbHits=[];
 for(const x of CANDIDATES){
  const q=wayback.find(y=>y.id===x.id);
  for(const rec of (q?.records||[]).filter(y=>y.statuscode==='200').slice(0,3))wbHits.push({x,rec});
 }
 const retrievedWayback=await limit(wbHits,3,z=>retrieveWayback(z.x,z.rec));
 const ccSearches=commoncrawl.flatMap(c=>c.searches||[]);
 const ccHits=ccSearches.filter(s=>!TARGETS.find(t=>t.id===s.id)?.control)
   .flatMap(s=>(s.matches||[]).filter(m=>String(m.status)==='200'));
 const retrievedCC=commoncrawl.flatMap(c=>(c.searches||[]).flatMap(s=>s.warc||[]));
 const controlPass=wayback.filter(x=>x.id.startsWith('carrier-')).some(x=>(x.records||[]).some(r=>r.statuscode==='200'&&(r.timestamp==='20160116224659'||r.timestamp==='20160109171430')));
 const ccControlPass=ccSearches.filter(s=>s.id==='known-carrier-control').some(s=>(s.matches||[]).some(m=>String(m.status)==='200'));
 const waybackComplete=CANDIDATES.every(x=>wayback.some(y=>y.id===x.id&&y.status===200));
 const commoncrawlComplete=commoncrawl.length===COLLECTIONS.length&&commoncrawl.every(c=>
  c.cluster_head.status===200&&c.searches.length===TARGETS.length&&c.searches.every(s=>s.certified===true));
 const count=wbHits.length+ccHits.length;
 const result={
  task:'Exact InfoTomb /tmp/208771 companion-path archival acquisition',
  started,finished:new Date().toISOString(),candidate_urls:CANDIDATES,known_carrier_controls:CONTROLS,
  commoncrawl_collections:COLLECTIONS,wayback,commoncrawl,retrieved_wayback:retrievedWayback,retrieved_commoncrawl:retrievedCC,
  known_carrier_wayback_control_passed:controlPass,known_carrier_commoncrawl_control_passed:ccControlPass,
  candidate_wayback_queries_complete:waybackComplete,commoncrawl_queries_complete:commoncrawlComplete,
  candidate_archive_capture_count:count,
  interpretation:count?'At least one exact candidate URL has an archived HTTP-200 record; inspect retrieved bytes before interpretation.':
   controlPass&&waybackComplete&&commoncrawlComplete
    ?'No exact candidate HTTP-200 capture found in the complete Wayback and raw Common Crawl CDXJ coverage for the six tested URL forms.'
    :controlPass&&waybackComplete
      ?'No exact candidate Wayback capture found; raw Common Crawl coverage is incomplete, so no combined archive absence claim is justified.'
      :'Archive negative is inconclusive because the known-carrier Wayback control or candidate Wayback coverage did not pass.'
 };
 saveJson('result.json',result);
 console.log(JSON.stringify({
  known_carrier_wayback_control_passed:controlPass,known_carrier_commoncrawl_control_passed:ccControlPass,
  candidate_wayback_queries_complete:waybackComplete,commoncrawl_queries_complete:commoncrawlComplete,
  wayback:wayback.map(x=>({id:x.id,status:x.status,count:(x.records||[]).length,error:x.error})),
  commoncrawl:commoncrawl.map(c=>({collection:c.collection,head:c.cluster_head.status,
   searches:(c.searches||[]).map(s=>({id:s.id,certified:s.certified,no_match:s.certified_no_match,
    matches:(s.matches||[]).length,error:s.error||s.block?.error}))})),
  retrieved_wayback:retrievedWayback.map(x=>({id:x.id,timestamp:x.timestamp,status:x.status,bytes:x.bytes,sha256:x.sha256})),
  retrieved_commoncrawl:retrievedCC,candidate_archive_capture_count:count,interpretation:result.interpretation
 },null,2));
}
function selftest(){
 assert.equal(CANDIDATES.length,6);
 assert.deepEqual(CANDIDATES.map(x=>x.url),[
 'http://infotomb.com/tmp/208771','https://infotomb.com/tmp/208771',
 'http://infotomb.com/tmp/208771.thumb.jpg','https://infotomb.com/tmp/208771.thumb.jpg',
 'http://infotomb.com/tmp/208771_text','https://infotomb.com/tmp/208771_text']);
 const w=parseWayback(JSON.stringify([['20160109171430','http://infotomb.com/tmp/208771_text','text/plain','200','ABC','42']]));
 assert.equal(w[0].statuscode,'200');
 const row=clusterRow('com,infotomb)/tmp/208771\tcluster-1.gz\t100\t200');
 assert.deepEqual(row,{key:'com,infotomb)/tmp/208771',object:'cluster-1.gz',offset:100,length:200});
 const cdx=cdxRecord('com,infotomb)/tmp/208771 20160109171430 {"status":"200","url":"http://infotomb.com/tmp/208771"}');
 assert.equal(cdx.urlkey,'com,infotomb)/tmp/208771');
 assert.equal(cdx.timestamp,'20160109171430');
 assert.deepEqual(parseWarc(Buffer.from('WARC/1.0\r\nWARC-Type: response\r\n\r\nHTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: 3\r\n\r\nabc')).payload,Buffer.from('abc'));
 assert.equal(sha256(Buffer.from('abc')).length,64);
 console.log('PASS: exact URL inventory, Wayback parsing, raw CDXJ parsing and WARC extraction');
}

if(process.argv.includes('--selftest'))selftest();else main().catch(e=>{console.error(e);process.exitCode=1;});
