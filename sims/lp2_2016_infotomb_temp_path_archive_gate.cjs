'use strict';
/**
 * Exact-path archive gate for the three filesystem names exposed by the
 * 2016-01-09 InfoTomb response. Tests only literal /tmp/ URL forms under
 * HTTP and HTTPS; it does not assume these server paths were public URLs.
 * Queries Wayback CDX and four 2016 Common Crawl collections. Node 22.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const crypto = require('node:crypto');

const OUT = 'infotomb-temp-path-recovery';
const COLLECTIONS = ['CC-MAIN-2016-07','CC-MAIN-2016-18','CC-MAIN-2016-22','CC-MAIN-2016-26'];
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
 return {error:last};
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
async function queryCC(x){
 const p=new URLSearchParams({url:x.url,output:'json',matchType:'exact'});
 const q='https://index.commoncrawl.org/'+x.collection+'-index?'+p.toString(),r=await request(q);
 const o={id:x.id,url:x.url,collection:x.collection,query:q,status:r.status,final_url:r.url,error:r.error};
 if(r.body.length){o.excerpt=r.body.toString('utf8').slice(0,6000);if(r.status===200){try{o.records=parseCC(r.body.toString('utf8'));}catch(e){o.parse_error=String(e);}}}
 return o;
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
async function retrieveCC(x,rec){
 const start=Number(rec.offset),end=start+Number(rec.length)-1,u='https://data.commoncrawl.org/'+rec.filename;
 const r=await request(u,{range:'bytes='+start+'-'+end});
 const o={id:x.id,collection:x.collection,timestamp:rec.timestamp,status:r.status,warc:rec.filename,offset:start,length:Number(rec.length),error:r.error};
 if(r.status===206){
  try{
   const warc=zlib.gunzipSync(r.body),p=parseWarc(warc);
   o.warc_bytes=warc.length;o.warc_sha256=sha256(warc);o.http_headers=p.headers;
   o.payload_bytes=p.payload.length;o.payload_sha256=sha256(p.payload);o.payload_git_blob_sha1=blobSha1(p.payload);
   save('commoncrawl/'+x.id+'-'+x.collection+'-'+rec.timestamp+'-warc.bin',warc);
   const ext=/image\/jpeg/i.test(p.headers)?'.jpg':/image\/png/i.test(p.headers)?'.png':'.bin';
   save('commoncrawl/'+x.id+'-'+x.collection+'-'+rec.timestamp+ext,p.payload);
   if(/text\//i.test(p.headers))o.text=p.payload.toString('utf8').slice(0,3000);
  }catch(e){o.parse_error=String(e);}
 }else if(r.body.length)o.response_excerpt=r.body.toString('utf8').slice(0,1000);
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
function selftest(){
 assert.equal(CANDIDATES.length,6);
 assert.deepEqual(CANDIDATES.map(x=>x.url),[
 'http://infotomb.com/tmp/208771','https://infotomb.com/tmp/208771',
 'http://infotomb.com/tmp/208771.thumb.jpg','https://infotomb.com/tmp/208771.thumb.jpg',
 'http://infotomb.com/tmp/208771_text','https://infotomb.com/tmp/208771_text']);
 const w=parseWayback(JSON.stringify([['20160109171430','http://infotomb.com/tmp/208771_text','text/plain','200','ABC','42']]));
 assert.equal(w[0].statuscode,'200');
 const c=parseCC(JSON.stringify({url:'http://infotomb.com/tmp/208771_text',status:'200',filename:'x.warc.gz',offset:'1',length:'10',timestamp:'20160109171430'}));
 assert.equal(c[0].status,'200');
 assert.deepEqual(parseWarc(Buffer.from('WARC/1.0\r\nWARC-Type: response\r\n\r\nHTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: 3\r\n\r\nabc')).payload,Buffer.from('abc'));
 assert.equal(sha256(Buffer.from('abc')).length,64);
 console.log('PASS: exact URL inventory, Wayback/CDXJ parsing and WARC extraction');
}
if(process.argv.includes('--selftest'))selftest();else main().catch(e=>{console.error(e);process.exitCode=1;});
