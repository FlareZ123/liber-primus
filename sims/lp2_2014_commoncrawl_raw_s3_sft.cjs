'use strict';

/**
 * 2014 source-named Liber Primus archive recovery, independent raw S3 CDXJ.
 * The public Common Crawl query endpoint can fail while raw indexed files remain
 * accessible. This performs remote byte-range searches on the sorted cluster.idx
 * then resolves gzip-compressed CDX blocks for exact source-selected URLs.
 *
 * Node 22; --selftest runs offline. Zero discoveries are conclusive only when
 * index metadata, range reads, and CDX positive controls all succeed.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const zlib=require('node:zlib');
const crypto=require('node:crypto');
const BASE='https://data.commoncrawl.org/cc-index/collections/';
const COLLECTIONS=['CC-MAIN-2014-23','CC-MAIN-2014-35','CC-MAIN-2014-41',
  'CC-MAIN-2014-49','CC-MAIN-2014-52','CC-MAIN-2015-06','CC-MAIN-2015-22'];
const TARGETS=[
  {url:'https://shadow-code.org/onion7.zip',key:'org,shadow-code)/onion7.zip',
    origin:'2014-05-02T14:53Z Freenode'},
  {url:'http://terrafant.asia/cicada/onion7.zip',key:'asia,terrafant)/cicada/onion7.zip',
    origin:'2014-05-09T00:56Z Freenode'},
  {url:'http://pastebin.com/5w5VC696',key:'com,pastebin)/5w5vc696',
    origin:'2014-05-02T14:46Z Freenode'}
];
const OUTPUT='mirror-2014-original-recovery/commoncrawl-raw-index.json';
/** @param {string} s */
function row(s){
  const cols=s.split('\t');
  if(cols.length<4)throw Error('Invalid cluster.idx row '+s.slice(0,100));
  return {key:cols[0].split(' ')[0],object:cols[1],offset:Number(cols[2]),length:Number(cols[3])};
}
/** @param {string} s */
function cdx(s) {
  const pos=s.indexOf('{');
  return pos>=0?JSON.parse(s.slice(pos)):null;
}
/** @param {string} file @param {string} contents */
function atomic(file,contents){
  fs.mkdirSync(path.dirname(file),{recursive:true});
  const lock=file+'.lock',fd=fs.openSync(lock,'wx');
  try{
    const temp=file+'.'+crypto.randomBytes(8).toString('hex')+'.tmp';
    fs.writeFileSync(temp,contents,{flag:'wx'});fs.renameSync(temp,file);
  }finally{fs.closeSync(fd);fs.unlinkSync(lock);}
}
function selftest(){
  const r=row('org,shadow-code)/onion7.zip 20140502123456\tcdx-00042.gz\t12345\t30000\t42');
  assert.deepEqual(r,{key:'org,shadow-code)/onion7.zip',object:'cdx-00042.gz',offset:12345,length:30000});
  assert.equal(cdx('org,shadow-code)/onion7.zip 20140502123456 {"urlkey":"org,shadow-code)/onion7.zip","status":"200"}').status,'200');
  assert.equal(cdx('abc'),null);
  const b=zlib.gzipSync(Buffer.from('hello'));
  assert.equal(zlib.gunzipSync(b).toString(),'hello');
  assert.equal(TARGETS.length,3);
  console.log('Raw S3 archive index/CDX parsing SFT: PASS');
}
/** @param {string} u @param {number|null} start @param {number|null} end */
async function http(u,start=null,end=null){
  const headers={ 'user-agent':'LP2-original-2014-raw-index-source/1.0'};
  if(start!==null && end!==null)headers.Range='bytes='+start+'-'+end;
  let latest;
  for(let trial=0;trial<2;trial++){
    try{
      const r=await fetch(u,{headers,redirect:'follow',signal:AbortSignal.timeout(26000)});
      if(start!==null && r.status!==206)
        return {status:r.status,error:'Range requested but response is not partial: '+r.status,
          length:r.headers.get('content-length')};
      if(!r.ok)return {status:r.status,error:'HTTP '+r.status};
      const size=Number(r.headers.get('content-length')||0);
      if(size>400000)return {status:r.status,error:'Safety cap for single read: '+size};
      const data=Buffer.from(await r.arrayBuffer());
      if(data.length>400000)return {status:r.status,error:'Range payload too large'};
      return {status:r.status,data};
    }catch(e){latest=String(e);}
  }
  return {error:latest};
}
/** @param {string} u */
async function head(u){
  try{
    const r=await fetch(u,{method:'HEAD',signal:AbortSignal.timeout(25000)});
    return {status:r.status,bytes:Number(r.headers.get('content-length')||0),
      range:r.headers.get('accept-ranges')};
  }catch(e){return {error:String(e)};}
}
/** @param {Buffer} data @param {number} start */
function fullLines(data,start){
  const txt=data.toString('utf8');
  const lines=txt.split('\n');
  if(start!==0)lines.shift();
  lines.pop();
  return lines.filter(Boolean);
}
/** @param {string} obj @param {number} size @param {string} target */
async function locate(obj,size,target){
  let lo=0,hi=size-1,rounds=0;
  const checks=[];
  while(hi-lo>100000&&rounds<28){
    const mid=Math.floor((lo+hi)/2);
    const end=Math.min(size-1,mid+12000);
    const r=await http(obj,mid,end);
    if(r.error)return {error:r.error,checks,rounds};
    const lines=fullLines(r.data,mid);
    if(!lines.length)return {error:'No full index rows in byte-range',checks,rounds};
    const point=row(lines[0]);
    checks.push({mid,first_key:point.key});
    if(point.key<=target)lo=mid;
    else hi=mid;
    rounds++;
  }
  let begin=Math.max(0,lo-120000), end=Math.min(size-1,hi+120000);
  const candidates=[];
  for(let offset=begin;offset<=end;offset+=240000){
    const stop=Math.min(end,offset+239999);
    const r=await http(obj,offset,stop);
    if(r.error)return {error:r.error,checks,rounds};
    candidates.push(...fullLines(r.data,offset).map(row));
  }
  const eligible=candidates.filter(x=>x.key<=target);
  const floor=eligible.length?eligible.at(-1):null;
  return {floor,rounds,checks:checks.slice(-4),sample_keys:[
    candidates[0]?.key,candidates.at(-1)?.key],sample_size:candidates.length,
    searched_bytes:[begin,end]};
}
/** @param {string} objectUrl @param {{offset:number,length:number}} item */
async function block(objectUrl,item){
  if(item.length>400000||item.length<10)return {error:'Abnormal source block length '+item.length};
  const r=await http(objectUrl,item.offset,item.offset+item.length-1);
  if(r.error)return {error:r.error};
  try{
    const plain=zlib.gunzipSync(r.data).toString('utf8');
    const records=plain.split(/\r?\n/).filter(Boolean).map(cdx).filter(Boolean);
    return {records:records.filter(x=>x.urlkey).map(x=>({
      urlkey:x.urlkey,url:x.url,status:x.status,mime:x.mime,
      timestamp:x.timestamp,filename:x.filename,offset:x.offset,length:x.length
    })),total:records.length};
  }catch(e){return {error:'Cannot decompress/parse CDX shard '+String(e)};}
}
async function main(){
  if(process.argv.includes('--selftest'))return selftest();
  const started=new Date().toISOString();
  const collections=process.argv.includes('--full')?COLLECTIONS:COLLECTIONS.slice(0,2);
  const output={schema:1,source:'source-named May2014 Freenode original mirror archive',
    docs:'https://commoncrawl.org/cdxj-index',started,collections,targets:TARGETS,findings:[]};
  for(const collection of collections){
    const root=BASE+collection+'/indexes/';
    const info=await head(root+'cluster.idx');
    const record={collection,cluster:info,searches:[]};
    output.findings.push(record);
    console.log(collection+' index status='+info.status+' bytes='+info.bytes+' error='+(info.error||''));
    if(info.status!==200||!info.bytes)continue;
    for(const t of TARGETS){
      const located=await locate(root+'cluster.idx',info.bytes,t.key);
      const finding={target:t.key,locate:located};
      record.searches.push(finding);
      if(!located.floor){console.log(collection+' '+t.key+' no floor '+(located.error||''));continue;}
      const x=located.floor;
      const b=await block(root+x.object,x);
      finding.block={object:x.object,offset:x.offset,length:x.length,...b};
      finding.matches=(b.records||[]).filter(r=>r.urlkey===t.key);
      finding.block={object:x.object,offset:x.offset,length:x.length,total:b.total,error:b.error,
        first_key:b.records?.[0]?.urlkey,last_key:b.records?.at(-1)?.urlkey};
      console.log(collection+' '+t.key+' block='+b.total+' matches='+finding.matches.length+
        ' error='+(b.error||''));
    }
  }
  output.finished=new Date().toISOString();
  atomic(OUTPUT,JSON.stringify(output,null,2)+'\n');
  console.log('Report '+OUTPUT);
}
main().catch(e=>{console.error(e);process.exitCode=1;});
