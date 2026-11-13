'use strict';
/**
 * Source-prior: solved LP2 p56 Euler-totient key for initial primes.
 * New reversible consumer: key_i = 2^phi(prime_i) mod 29, feed into
 * GP29 ciphertext-difference multiplicative inverse.
 * Three source-visible clocks, no fitted phases or candidate keys.
 * Run: node sims/lp2_gf29_delta_p56_totient_group_source_sft.cjs
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
/** @param {string} p @returns {string} */
const read = p => fs.readFileSync(path.join(root,p), 'utf8');
const db = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const original = read('resources/liber-primus/lp2-transcription.txt');
const vocab = read('resources/control/english_wordfreq_textblob.txt');
const tokens = db.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
const rune = new Map(db.runes.map((s,i)=>[s,i]));
/** @param {number} n @returns {number} */
const mod = n => (n%29+29)%29;
/** @param {number} v @returns {number} */
function inv(v) {
  assert(v > 0 && v < 29);
  for (let x=1; x<29; x++) if (x*v%29===1) return x;
  throw Error('missing inverse');
}
/** @param {string} word @returns {number[] | null} */
function gp(word) {
  const w=word.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U')
    .replace(/K/g,'C').replace(/Z/g,'S').replace(/ING/g,'NG')
    .replace(/IO/g,'IA');
  const out=[];
  for(let i=0; i<w.length;) {
    const t=tokens.find(x=>w.startsWith(x.t,i));
    if(!t)return null;
    out.push(t.i);
    i+=t.t.length;
  }
  return out;
}
const lex=new Set();
for (const m of vocab.matchAll(/^([a-z]+) (\d+)$/gm)) {
  const v=gp(m[1]);if(v)lex.add(v.join(','));
}
assert.equal(lex.size,29058);
const roots=new Set(Array.from({length:28},(_,k)=>2**0));
const powers=Array.from({length:28},(_,k)=>Number((BigInt(2)**BigInt(k))%BigInt(29)));
assert.equal(new Set(powers).size,28,'2 must generate GF29 units');
const maxCount=12956;
const primes=[];
for(let p=2;primes.length<maxCount;p++) {
  let prime=true;for(let d=2;d*d<=p;d++){if(p%d===0){prime=false;break;}}
  if(prime)primes.push(p);
}
assert.deepEqual(primes.slice(0,5),[2,3,5,7,11]);
const keys=primes.map(p=>powers[(p-1)%28]);
assert.deepEqual(keys.slice(0,5),[2,4,16,6,5]);
let p=0,words=[],word=[];
/** Flush at genuine printed word boundary. */
function end(){if(word.length){words.push(word);word=[];}}
for(const ch of original) {
  if(rune.has(ch))word.push({page:p>=50?p+1:p,c:rune.get(ch)});
  else if('-.$&§'.includes(ch))end();
  else if(ch==='%')p++;
}
end();
const originalWords=words.filter(w=>w[0].page<=55);
assert.equal(originalWords.length,2896);
const actualOriginal=originalWords.flat().map(x=>x.c);
assert.equal(actualOriginal.length,12956);
for(const page of db.pages.filter(p=>p.page<56))assert.deepEqual(
  originalWords.flat().filter(x=>x.page===page.page).map(x=>x.c),page.indices);
const chapters=[[0,2],[3,7],[8,14],[15,22],[23,26],
  [27,32],[33,39],[40,53],[54,55]];
const chapterOf=new Map();
chapters.forEach(([a,b],i)=>{for(let p=a;p<=b;p++)chapterOf.set(p,i);});
/** @param {number[]} seq @returns {number} */
function ioc(seq) {
  const hist=Array(29).fill(0);seq.forEach(x=>hist[x]++);
  return hist.reduce((s,f)=>s+f*(f-1),0)/(seq.length*(seq.length-1));
}
const results=[];
for (const clock of ['page','chapter','book']) {
  const pageDecoded=new Map();
  let cursor=0,chapter=-1;
  for (const page of db.pages.filter(x=>x.page<56)) {
    if(clock==='page')cursor=0;
    if(clock==='chapter'&&chapter!==chapterOf.get(page.page)){
      cursor=0;chapter=chapterOf.get(page.page);
    }
    let prev=0;
    pageDecoded.set(page.page,page.indices.map(c=>{
      const k=keys[cursor++];
      const d=mod(c-prev);prev=c;
      return mod(d*inv(k)-1);
    }));
  }
  const offsets=new Map();
  const decodedWords=originalWords.map(w=>w.map(x=>{
    const i=offsets.get(x.page)||0;offsets.set(x.page,i+1);
    return pageDecoded.get(x.page)[i];
  }));
  const stream=decodedWords.flat();
  assert.equal(stream.length,12956);
  let allHits=0,longHits=0;
  for(const w of decodedWords){
    const v=w.join(',');
    if(lex.has(v)){
      allHits++;
      if(w.length>=6)longHits++;
    }
  }
  // Exact source-input full forward replay.
  let cursor2=0,c2=-1;
  for(const page of db.pages.filter(p=>p.page<56)){
    if(clock==='page')cursor2=0;
    if(clock==='chapter'&&c2!==chapterOf.get(page.page)){
      cursor2=0;c2=chapterOf.get(page.page);
    }
    let prev=0;
    const forward=pageDecoded.get(page.page).map(v=>{
      const c=mod(prev+keys[cursor2++]*(v+1));prev=c;return c;
    });
    assert.deepEqual(forward,page.indices);
  }
  results.push({clock,ioc:+ioc(stream).toFixed(6),
    nativeEnglishWords:allHits,nativeEnglishWordsLen6Plus:longHits,
    prefix:stream.slice(0,36).map(x=>db.translit[x]).join(' ')});
}
const solved=db.pages[57].indices.concat(gp('each'));
let prev=0;const encoded=solved.map((x,i)=>{prev=mod(prev+keys[i]*(x+1));return prev;});
prev=0;const decoded=encoded.map((c,i)=>{
  const p=mod(mod(c-prev)*inv(keys[i])-1);prev=c;return p;});
assert.deepEqual(decoded,solved);
console.log(JSON.stringify({source:'original solved p56 prime totient numbers, first prime2 as GF29 primitive root',
  rule:'K_n=powmod(2, prime_n-1,29), P_n=(delta_n/K_n)-1 mod29',
  originalIoc:+ioc(actualOriginal).toFixed(6),originalRunes:actualOriginal.length,
  printedWords:originalWords.length,results,positivePlant:{n:decoded.length,exact:true}},null,2));
