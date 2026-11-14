'use strict';
/** Source-constrained historical file availability checks. Node22 CommonJS. */
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const candidates=[
 ['170825','http://pastebin.com/R01rN7ZX'],
 ['189407','http://pastebin.com/LHTRYZjv'],
 ['189409','http://pastebin.com/Cv2yHt1K'],
 ['216930','http://pastebin.com/M5BccDpT'],
 ['228764','http://pastebin.com/isa7Hh1x'],
 ['229866','http://pastebin.com/BgYrwudm'],
 ['229869','http://pastebin.com/6jznh1UD'],
 ['198541','http://pastebin.com/kRHEVgjj'],
 ['212616','http://sprunge.us/PBPT'],
 ['229457','https://github.com/cluosh/cicada_toolset/blob/master/runeaylze/rcrypto.py']
];
/** @param {string} url @param {number} ms */
async function request(url,ms=12000){
 try{
  const r=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0 (research, public history)'},signal:AbortSignal.timeout(ms),redirect:'follow'});
  const body=Buffer.from(await r.arrayBuffer());
  return {status:r.status,final:r.url,mime:r.headers.get('content-type'),size:body.length,
   sha256:crypto.createHash('sha256').update(body).digest('hex'),
   sample:body.toString('utf8',0,Math.min(body.length,1800))};
 }catch(e){return {error:String(e).slice(0,220)};}
}
/** @param {string} url */
function routes(url){
 const web=url.replace(/^http:/,'https:');
 const cdx='https://web.archive.org/cdx/search/cdx?url='+encodeURIComponent(url)+'&output=json&filter=statuscode%3A200&collapse=timestamp%3A4';
 const ia='https://web.archive.org/web/20140801000000id_/'+url;
 const direct=url.includes('pastebin.com/')?'https://pastebin.com/raw/'+url.split('/').pop():url.includes('github.com/cluosh/')?'https://raw.githubusercontent.com/cluosh/cicada_toolset/master/runeaylze/rcrypto.py':web;
 return [['direct',direct],['cdx',cdx],['wayback',ia]];
}
async function main(){
 assert.equal(candidates.length,10);
 assert(routes(candidates[0][1])[0][1]==='https://pastebin.com/raw/R01rN7ZX');
 console.log('PASS ten historically pinned URL origins and routes');
 if(process.argv.includes('--selftest'))return;
 for(const [line,url] of candidates){
  console.log('===SOURCE L'+line+' '+url);
  const checks=await Promise.all(routes(url).map(async ([kind,link])=>({kind,link,...await request(link)})));
  for(const x of checks)console.log('RESULT '+JSON.stringify(x));
 }
}
main().catch(e=>{console.error(e);process.exitCode=1;});
