'use strict';
/**
 * Source-frozen original 2013 PRIMES paste xGY4pbHV retrieval and exact check.
 * Windows Node.js22 built-ins only. Preserves 1387-byte source via URL + SHA256,
 * without reproducing the full third-party transcript in the repository.
 */
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const SHA='591b3cf337c803eef76a16466fa6ebc711aa1f0a3b26d1520573abda89889a94';
/** @param {Buffer} b */
function digest(b){return crypto.createHash('sha256').update(b).digest('hex')}
/** @param {number} n */
function prime(n){
  if(n<2)return false;
  for(let d=2;d*d<=n;d++)if(n%d===0)return false;
  return true;
}
/** @param {string} url */
async function get(url){
  const r=await fetch(url,{signal:AbortSignal.timeout(20000),redirect:'follow',
    headers:{'User-Agent':'LiberPrimus original 2013-PRIMES source retrieval'}});
  return {status:r.status,url:r.url,b:Buffer.from(await r.arrayBuffer())};
}
async function main(){
  const raw=await get('https://pastebin.com/raw/xGY4pbHV');
  assert.equal(raw.status,200);
  assert.equal(raw.b.length,1387);
  assert.equal(digest(raw.b),SHA);
  const s=raw.b.toString('utf8');
  assert(s.startsWith('primes\r\n\r\n'),'Original source command header changed');
  const nums=s.replace(/^primes\s*/,'').trim().split(/\s+/).map(Number);
  assert(nums.every(n=>Number.isSafeInteger(n)));
  const all=Array.from({length:3300},(_,i)=>i+2).filter(prime);
  assert.equal(all.length,464);
  const target=all.slice(0,20).concat(all.slice(200));
  assert.equal(target.length,284);
  assert.deepEqual(nums,target,'Original noncontiguous 2013 PRIMES list');
  assert.equal(nums[19],71);
  assert.equal(nums[20],1229);
  assert.equal(nums[nums.length-1],3301);
  const spacing=[...s.matchAll(/(\d+)( {2,})(?=\d)/g)].map(m=>({
    after:Number(m[1]),spaces:m[2].length
  }));
  assert.deepEqual(spacing,[{after:29,spaces:2},{after:3257,spaces:2}]);
  const article=await get('https://pastebin.com/xGY4pbHV');
  const html=article.b.toString('utf8');
  const date=/(?:2013|2014|2015)[^\n<]{0,120}/.exec(html);
  const archived=await get('https://web.archive.org/web/20240610084106id_/https://pastebin.com/xGY4pbHV');
  const archiveText=archived.b.toString('utf8');
  console.log(JSON.stringify({
    original:{url:raw.url,bytes:raw.b.length,sha256:digest(raw.b),
      verifiedAllSourceIntegers:nums.length,allPrimesThrough3301:all.length,
      withheldPrimeOrdinals:'21..200 (180 primes, values 73..1223)',
      sourceDoubleSpaceAfter:spacing,end:nums.at(-1)},
    liveArticle:{url:article.url,status:article.status,htmlBytes:article.b.length,dateContext:date?.[0]??null},
    archive:{url:archived.url,status:archived.status,bytes:archived.b.length,
      sourceGapVisible:archiveText.includes('71 1229'),
      sourceDoubleSpacesVisible:archiveText.includes('29  31')},
    authorAttribution:'Unsigned solver-produced paste; it does not prove intentional omissions or an LP2 decryption operation.'
  },null,2));
}
main().catch(error=>{console.error(error);process.exitCode=1;});
