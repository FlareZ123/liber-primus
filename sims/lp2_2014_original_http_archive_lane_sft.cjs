'use strict';

/**
 * Original-era 2014–2016 raw HTTP archive positive-control and Cicada-target gate.
 * Public Arquivo.pt CDX and Archive-It CDX only. No Tor connection.
 * Authoritative API descriptions:
 * https://github.com/arquivo/pwa-technologies/wiki/URL-search:-CDX-server-API
 * https://support.archive-it.org/hc/en-us/articles/115001790023-Access-Archive-It-s-Wayback-index-with-the-CDX-C-API
 */
const { createHash } = require('node:crypto');

const arquivo = [
  {url: 'http://www.publico.pt/',from:'2014',to:'2014',control:true},
  {url: 'http://www.sapo.pt/',from:'2014',to:'2014',control:true},
  {url: 'http://ky2khlqdf7qdznac.onion.to/',from:'2014',to:'2014'},
  {url: 'http://ky2khlqdf7qdznac.onion.to/',from:'2015',to:'2015'},
  {url: 'http://ky2khlqdf7qdznac.onion.link/',from:'2014',to:'2016'},
  {url: 'http://ky2khlqdf7qdznac.tor2web.org/',from:'2014',to:'2016'},
  {url: 'http://ky2khlqdf7qdznac.onion.city/',from:'2014',to:'2016'},
  {url: 'http://ky2khlqdf7qdznac.onion.cab/',from:'2014',to:'2016'},
  {url: 'http://ky2khlqdf7qdznac.onion.sh/',from:'2014',to:'2016'},
  {url: 'http://ky2khlqdf7qdznac.onion.ly/',from:'2014',to:'2016'}
];

const archiveit = [
  {collection:'8232',url:'https://twitter.com/internetarchive/',from:'2016',to:'2016',control:true},
  {collection:'4399',url:'http://archive-it.org/',from:'2014',to:'2014',control:true},
  {collection:'4399',url:'http://ky2khlqdf7qdznac.onion.to/',from:'2014',to:'2016'},
  {collection:'8232',url:'http://ky2khlqdf7qdznac.onion.to/',from:'2014',to:'2016'}
];

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
/** @param {Uint8Array} payload */
function base32Sha1(payload) {
  const bytes = createHash('sha1').update(payload).digest();
  let bits=0, acc=0, result='';
  for(const byte of bytes) {
    acc=(acc<<8)|byte;bits+=8;
    while(bits>=5) {bits-=5;result+=alphabet[(acc>>>bits)&31];}
  }
  if(bits)result+=alphabet[(acc<<(5-bits))&31];
  return result;
}
/** @param {string} addr */
async function fetchText(addr) {
  try {
    const r=await fetch(addr,{signal:AbortSignal.timeout(20000)});
    const body=(await r.text()).slice(0,50000);
    return {status:r.status,body,bodySize:body.length};
  } catch(e){return {error:String(e)};}
}
/** @param {string} url */
function parsedArquivo(url) {
  return url.split(/\r?\n/).filter(Boolean).flatMap(line=>{
    try {
      const data=JSON.parse(line);
      return Array.isArray(data) ? [] : [data];
    } catch(e){return [];}
  });
}
/** @param {string} text */
function parsedArchiveIt(text) {
  return text.split(/\r?\n/).filter(line=>line&&!line.startsWith(' CDX')&&!line.startsWith('urlkey')).map(line=>{
    const p=line.trim().split(' ');
    return {timestamp:p[1],url:p[2],mime:p[3],status:p[4],digest:p[5],file:p[p.length-1]};
  });
}
/** @param {{url:string,from:string,to:string,control?:boolean}} item */
async function checkArquivo(item) {
  const endpoint=new URL('https://arquivo.pt/wayback/cdx');
  for(const [k,v] of Object.entries({url:item.url,from:item.from,to:item.to,output:'json',limit:'12'}))
    endpoint.searchParams.set(k,v);
  const response=await fetchText(endpoint.href);
  const records=response.body?parsedArquivo(response.body):[];
  const summary={provider:'arquivo',query:item,...{status:response.status,error:response.error},records:records.map(r=>({url:r.url,time:r.timestamp,status:r.status,mime:r.mime,digest:r.digest,collection:r.collection,filename:r.filename})),rawLength:response.bodySize};
  if(item.control) {
    const chosen=records.find(r=>String(r.status)==='200' && String(r.mime).startsWith('text/'));
    if(chosen) {
      const replay='https://arquivo.pt/noFrame/replay/'+chosen.timestamp+'id_/'+chosen.url;
      try {
        const r=await fetch(replay,{signal:AbortSignal.timeout(22000)});
        const bytes=new Uint8Array(await r.arrayBuffer());
        summary.controlReplay={status:r.status,bytes:bytes.length,sha1base32:base32Sha1(bytes),cdxDigest:chosen.digest,match:base32Sha1(bytes)===chosen.digest,replay};
      }catch(e){summary.controlReplay={error:String(e),replay};}
    } else summary.controlReplay={error:'No 200 text capture among returned records'};
  }
  console.log(JSON.stringify(summary));
}
async function checkArchiveIt(item) {
  const endpoint=new URL('https://wayback.archive-it.org/'+item.collection+'/timemap/cdx');
  for(const [k,v] of Object.entries({url:item.url,from:item.from,to:item.to,fl:'timestamp,original,mimetype,statuscode,digest,filename',filter:'statuscode:200'}))
    endpoint.searchParams.set(k,v);
  const response=await fetchText(endpoint.href);
  const entries=response.body?parsedArchiveIt(response.body):[];
  console.log(JSON.stringify({provider:'archive-it',query:item,status:response.status,error:response.error,excerpt:response.status===200?undefined:response.body?.slice(0,200),records:entries.slice(0,10),rawLength:response.bodySize}));
}
(async()=>{
  console.log('original-archive-cdx-gate '+new Date().toISOString());
  for(const item of arquivo)await checkArquivo(item);
  for(const item of archiveit)await checkArchiveIt(item);
})().catch(e=>{console.error(e);process.exitCode=1;});
