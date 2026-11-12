'use strict';
/**
 * One-ID source recovery for missing 2013 first-onion PRIMES paste xGY4pbHV.
 * Windows Node.js 22, source endpoints fixed before retrieval, no local copies
 * of third-party material. Outputs hashes and bounded source excerpts only.
 */
const crypto=require('node:crypto');

/** @param {string} url */
async function fetchOne(url){
  try{
    const r=await fetch(url,{signal:AbortSignal.timeout(18000),redirect:'follow',
      headers:{'User-Agent':'LiberPrimus 2013-original-source-recovery'}});
    const b=Buffer.from(await r.arrayBuffer());
    const s=b.toString('utf8');
    return {status:r.status,url:r.url,bytes:b.length,
      sha256:crypto.createHash('sha256').update(b).digest('hex'),
      first:s.slice(0,900),last:s.slice(-650),
      numberCount:(s.match(/\b\d+\b/g)||[]).length};
  }catch(error){return{status:'unavailable',url,error:String(error).slice(0,180)}}
}
(async()=>{
  const endpoints=[
    'https://pastebin.com/raw/xGY4pbHV',
    'https://pastebin.com/xGY4pbHV',
    'https://archive.org/wayback/available?url=http%3A%2F%2Fpastebin.com%2FxGY4pbHV&timestamp=20130114',
    'https://web.archive.org/cdx/search/cdx?url=pastebin.com%2FxGY4pbHV&output=json&filter=statuscode%3A200',
    'https://web.archive.org/cdx/search/cdx?url=pastebin.com%2Fraw.php%3Fi%3DxGY4pbHV&output=json&filter=statuscode%3A200'
  ];
  const sources=await Promise.all(endpoints.map(fetchOne));
  console.log(JSON.stringify({target:'xGY4pbHV (2013 PRIMES transcript only)',sources},null,2));
})().catch(error=>{console.error(error);process.exitCode=1;});
