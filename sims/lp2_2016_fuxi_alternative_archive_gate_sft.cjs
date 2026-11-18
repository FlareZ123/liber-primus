'use strict';

/**
 * Issue #1436: exact 11 Jun 2016 Fu-Xi first-hand source acquisition.
 * New independent lanes after the Wayback/2018-CC negative or inconclusive
 * probe in lp2_2016_fuxi_original_archive_sft.cjs:
 *  - Arquivo.pt 2014-18 URL CDX and full-text indices
 *  - contemporaneous 2016/2017 Common Crawl captures
 *  - authenticated Calypne 2016 forum page as a positive HTTP control.
 *
 * Index nonmatches are not proof of original HTTP-body absence.
 * Run: node sims/lp2_2016_fuxi_alternative_archive_gate_sft.cjs
 * Windows Node.js 22, CommonJS, read-only. No downloaded code executed.
 */
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const target='https://7a35090f.io/topic/16/irc-cicadasolvers-08-05-2016-user-fu-xi';
const stamp=()=>new Date().toISOString();
const sha256=x=>crypto.createHash('sha256').update(x).digest('hex');
const sourceURI='http://calypne.boards.net/thread/53/supposed-decoded-liber-primus';

/** @param {string} label @param {string} uri @returns {Promise<{status:number,body:string,url:string}|null>} */
async function fetchRecord(label,uri){
 try{
  const res=await fetch(uri,{signal:AbortSignal.timeout(17000),redirect:'follow',headers:{'User-Agent':'LiberPrimusSourceAudit/1.0'}});
  const body=await res.text();
  console.log('SOURCE '+JSON.stringify({label,status:res.status,requested:uri,finalURL:res.url,bytes:Buffer.byteLength(body),sha256:sha256(body),prefix:body.slice(0,700).replace(/\s+/g,' ')}));
  return {status:res.status,body,url:res.url};
 }catch(e){console.log('ERROR '+JSON.stringify({label,error:String(e)}));return null;}
}

/** @param {string} label @param {string} uri */
async function checkArquivoCDX(label,uri){
 const u=new URL('https://arquivo.pt/wayback/cdx');
 for(const [k,v] of Object.entries({url:uri,from:'2015',to:'2018',output:'json',matchType:'prefix',limit:'40'}))u.searchParams.set(k,v);
 const r=await fetchRecord('arquivo-cdx-'+label,u.toString());
 if(!r||r.status!==200)return;
 const lines=r.body.split(/\r?\n/).filter(Boolean);
 const records=lines.flatMap(line=>{
   try{
    const j=JSON.parse(line);
    if(Array.isArray(j))return j.length>0&&Array.isArray(j[0])?[]:[];
    return [{url:j.url||'',timestamp:j.timestamp||'',status:j.status||'',mime:j.mime||'',source:j.collection||'',digest:j.digest||''}];
   }catch{return [];}
 });
 console.log('CDX_PARSED '+JSON.stringify({label,records:records.slice(0,30),count:records.length,rawLines:lines.length}));
}

/** @param {string} query */
async function checkArquivoText(query){
 const u=new URL('https://arquivo.pt/textsearch');
 for(const [k,v] of Object.entries({q:query,from:'20150101',to:'20181231235959',maxItems:'12',itemsPerSite:'3'}))u.searchParams.set(k,v);
 const r=await fetchRecord('arquivo-text-'+query,u.toString());
 if(!r||r.status!==200)return;
 try{
  const j=JSON.parse(r.body);
  console.log('TEXT_PARSED '+JSON.stringify({q:query,estimated:j.estimated_nr_results,items:(j.response_items||[]).map(x=>({url:x.originalURL,timestamp:x.tstamp,snippet:x.snippet?.slice(0,450),archive:x.linkToArchive}))}));
 }catch{console.log('TEXT_PARSE_FAIL '+query);}
}

/** @param {string} identifier @param {string} original */
async function checkCC(identifier,original){
 const u=new URL('https://index.commoncrawl.org/'+identifier+'-index');
 u.searchParams.set('url',original);
 u.searchParams.set('output','json');
 const r=await fetchRecord('cc-'+identifier+'-'+(original===target?'https':'http'),u.toString());
 if(!r||r.status!==200)return;
 for(const line of r.body.split(/\r?\n/).filter(Boolean).slice(0,8)){
  try{
   const j=JSON.parse(line);console.log('CC_RECORD '+JSON.stringify({id:identifier,url:j.url,timestamp:j.timestamp,filename:j.filename,offset:j.offset,length:j.length,status:j.status,mime:j.mime,digest:j.digest}));
  }catch{}
 }
}

async function main(){
 console.log('BEGIN '+JSON.stringify({time:stamp(),target,scope:'independent exact-URL archival indices'}));
 await fetchRecord('positive-current-Calypne',sourceURI);
 for(const [label,url] of [
  ['exact-http',target.replace('https:','http:')],
  ['exact-https',target],
  ['topic16-http','http://7a35090f.io/topic/16/'],
  ['topic16-https','https://7a35090f.io/topic/16/']
 ])await checkArquivoCDX(label,url);
 for(const q of [
  '"irc-cicadasolvers-08-05-2016-user-fu-xi"',
  '"7a35090f.io"',
  '"Fu-Xi" "cicadasolvers"'
 ])await checkArquivoText(q);
 const idx=['CC-MAIN-2016-18','CC-MAIN-2016-26','CC-MAIN-2016-36','CC-MAIN-2017-04','CC-MAIN-2017-13'];
 for(const id of idx)for(const scheme of ['https:','http:'])await checkCC(id,target.replace('https:',scheme));
 console.log('END '+stamp());
}
main().catch(e=>{console.error(e);process.exitCode=1;});
