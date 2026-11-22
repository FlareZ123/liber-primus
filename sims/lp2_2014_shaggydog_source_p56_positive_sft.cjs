'use strict';
/**
 * Original July 30, 2014 modified-rcrypto source-positive p56 replay.
 * Exact input Pastebin SHA, original JPEG-derived rune indices, original
 * plaintext-F sentinel, prime-minus-one key. No untrusted Python execution.
 * Node.js 22 CommonJS, manual GitHub Actions only.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const BOOK=JSON.parse(fs.readFileSync(path.join(__dirname,'..','resources','liber-primus','lp2-corpus.json'),'utf8'));
const source={
  uri:'https://pastebin.com/raw/8cStVBG9',
  bytes:209,
  sha256:'b54b043583fcf3c7e3c7d55e103af99b8b346bd35eb3b1fa23d5b490cdd81435'
};
const aliases=new Map([['C/K','C'],['IA/IO','IA'],['(I)NG','NG']]);
const mod=n=>(n%29+29)%29;
/** @param {number} needed */
function primes(needed){
  const arr=[];
  for(let n=2;arr.length<needed;n++){
    if(arr.every(p=>p*p>n||n%p!==0))arr.push(n);
  }
  return arr;
}
/** @param {string} sourceText */
function parseHistorical(sourceText){
  return sourceText.trim().split(/[.\-]/).filter(Boolean).map(x=>{
    if(x==='{F}')return -2;
    const spelling=aliases.get(x)||x;
    const v=BOOK.translit.indexOf(spelling);
    assert(v>=0,'Unrecognized period GP spelling '+x);
    return v;
  });
}
/** @param {string} english */
function native(english){
  const choices=BOOK.translit.map((v,i)=>({v,i})).sort((a,b)=>b.v.length-a.v.length);
  return english.trim().split(/\s+/).flatMap(word=>{
    const result=[];
    for(let i=0;i<word.length;){
      const hit=choices.find(c=>word.startsWith(c.v,i));
      assert(hit,'Unparseable plain GP orthography '+word.slice(i));
      result.push(hit.i);
      i+=hit.v.length;
    }
    return result;
  });
}
/** @param {number[]} historical */
function decode(historical){
  const p=primes(historical.length);
  let clock=0;
  const out=[];
  for(const value of historical){
    if(value===-2){out.push(0);continue;}
    out.push(mod(value-(p[clock++]-1)));
  }
  return {out,clock};
}
/** @returns {Promise<void>} */
async function main(){
  assert.deepEqual(parseHistorical('F-IA/IO-C/K-(I)NG-{F}'),[0,27,5,21,-2]);
  assert.equal(mod(-1),28);
  console.log('SELFTEST PASS: period labels, transparent F, GP29 modular arithmetic');
  if(process.argv.includes('--selftest'))return;
  const response=await fetch(source.uri,{signal:AbortSignal.timeout(30000)});
  assert.equal(response.status,200,'2014 original p56 source');
  const body=Buffer.from(await response.arrayBuffer());
  assert.equal(body.length,source.bytes,'Original p56-source bytes');
  assert.equal(crypto.createHash('sha256').update(body).digest('hex'),source.sha256,'Original p56-source SHA');
  const historical=parseHistorical(body.toString('utf8'));
  const canonical=BOOK.pages.find(x=>x.page===56).indices;
  assert.equal(historical.length,canonical.length,'Original p56 rune count');
  assert.equal(historical.filter(x=>x===-2).length,1,'One transparent F');
  for(let i=0;i<historical.length;i++)
    assert.equal(historical[i]<0?0:historical[i],canonical[i],'Original source/native p56 rune at '+i);
  const {out,clock}=decode(historical);
  const plaintext='AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE';
  const exact=native(plaintext);
  assert.deepEqual(out,exact,'All 85 original rune positions match known authenticated p56 plaintext');
  // Re-encryption with the same original key and the source-selected F.
  const prime=primes(clock);
  let t=0;
  for(let i=0;i<historical.length;i++){
    if(historical[i]===-2){assert.equal(exact[i],0);continue;}
    assert.equal(mod(exact[i]+prime[t++]-1),canonical[i],'Forward original p56 re-encryption at '+i);
  }
  console.log('ORIGINAL_2014_P56_PASS '+JSON.stringify({
    source:source.uri,sourceSha:source.sha256,sourceBytes:source.bytes,
    canonicalPhysicalPage:56,runes:canonical.length,transparentFPositions:historical.map((x,i)=>x===-2?i:-1).filter(i=>i>=0),
    primeConsumed:clock,matched:out.length,reencryptionMatched:out.length,
    first30GP:out.slice(0,30).map(v=>BOOK.translit[v]).join('-'),
    result:'Source-original participant p56 method reproducible; no unknown p0-p55 key is provided by this control'
  }));
}
main().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
