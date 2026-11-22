'use strict';

/**
 * Single frozen original-source p15 16-prime AES128 key / p27 pointer-to-p55
 * eight-address nonce inverse. No key, IV, phase, page or language-based tuning.
 * SFT: node sims/lp2_p15prime16_p27pointer8_p55_aes128_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {decode, encrypt} = require('./mirror_jpeg_pad.cjs');
const {train, encode} = require('./grid_keyskip_viterbi.cjs');
const ROOT=path.join(__dirname, '..');

const g=JSON.parse(fs.readFileSync(path.join(ROOT,'resources/liber-primus/lp2-grid-256.json'),'utf8'));
const c=JSON.parse(fs.readFileSync(path.join(ROOT,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const bytes=Buffer.from(g.pages.flatMap((p)=>p.tokens).map((s)=>
  60*g.alphabet.indexOf(s[0])+g.alphabet.indexOf(s[1])));
assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

const p15FibonacciPrimes=[2,3,5,7,13,23,43,79,149,263,463,829,1481,2593,4507,7817];
const sourceKey=Buffer.from(p15FibonacciPrimes.map((p)=>p%256));
const sourcePath=[43];
for(let i=0;i<7;i++)sourcePath.push(bytes[sourcePath.at(-1)]);
assert.deepEqual(sourcePath,[43,73,79,82,201,74,205,76]);
const nonce=Buffer.from(sourcePath);
const iv=Buffer.concat([nonce,Buffer.alloc(8)]);
const original=c.pages.find((page)=>page.page===55).indices;
assert.equal(original.length,76);
assert.equal(c.prime[c.translit.indexOf('P')],43);

const text=fs.readFileSync(path.join(ROOT,'resources/control/shakespeare_first300k.txt'),'utf8');
const lm=train(text.slice(0,80000));
const heldout=encode(text.slice(120000)).slice(0,original.length);
assert.equal(heldout.length,76);

/** @param {Buffer} key @param {number} length */
function pad(key,length) {
  const aes=crypto.createCipheriv('aes-128-ctr',key,iv);
  return Uint8Array.from(Buffer.concat([aes.update(Buffer.alloc(3*length+10)),aes.final()]),x=>x%29);
}
/** @param {number[]} runes */
function ic(runes) {
  const f=Array(29).fill(0);
  for(const n of runes)f[n]++;
  return f.reduce((a,b)=>a+b*(b-1),0)/(runes.length*(runes.length-1));
}
/** @param {number} seed */
function rng(seed){
  let s=seed>>>0;
  return ()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return (s>>>0)/4294967296;};
}
/** @param {Buffer} key @param {number} seed */
function shuffle(key,seed) {
  const out=Buffer.from(key),next=rng(seed);
  for(let i=out.length-1;i>0;i--){const j=Math.floor(next()*(i+1));[out[i],out[j]]=[out[j],out[i]];}
  return out;
}
const stream=pad(sourceKey,original.length);
const results=[];
for(const sign of [-1,1]) {
  const value=decode(original,stream,0,sign,lm);
  const raw=original.map((v,i)=>((v-sign*stream[i])%29+29)%29);
  const controls=[];
  for(let i=0;i<16;i++) {
    const wrong=pad(shuffle(sourceKey,0x20133010+i*311),original.length);
    controls.push(decode(original,wrong,0,sign,lm).perRune);
  }
  results.push({sign,rawIc:ic(raw),skipScore:value.perRune,skipCount:value.skips,
    skipIc:ic(value.plain),rawPrefix:raw.slice(0,45).map(i=>c.translit[i]).join(''),
    skipPrefix:value.plain.slice(0,45).map(i=>c.translit[i]).join(''),
    wrongMean:controls.reduce((a,b)=>a+b,0)/controls.length,
    wrongMax:Math.max(...controls),
    sourceRankOf17:1+controls.filter(x=>x>=value.perRune).length});
}
const plant=encrypt(heldout,stream,0,1,0x33011403);
const recovered=decode(plant.cipher,stream,0,1,lm);
const exact=heldout.filter((v,i)=>recovered.plain[i]===v).length;
assert.ok(exact>=0.83*76);
console.log(JSON.stringify({
  hypothesis:'p15 prime(Fibonacci+1) outward spiral modulo256 16 AES128 key bytes; p27 P/P43 to original p55 76 pointer path of 8 addresses as CTR nonce; GP29 byte-mod29 anti-repeat 0-2 retries',
  sourceKeyHex:sourceKey.toString('hex'),nonceHex:nonce.toString('hex'),
  originalPage:55,originalRunes:76,observed:results,
  nativePlant:{skips:plant.skips,decodeSkips:recovered.skips,recovered:exact,rate:exact/76,score:recovered.perRune}
},null,2));
console.log('PASS source-selected multi-artifact AES receiver and positive GP native plant');
