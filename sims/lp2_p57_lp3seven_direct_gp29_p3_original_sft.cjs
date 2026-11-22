'use strict';

/**
 * Single source-typed seven-byte ASCII operand from p57 PARABLE7+13 dots
 * and p49-51 original 32x8 perimeter, one direct historical GP29 additive
 * receiver on original physical p3 (217 unchanged ciphertext runes).
 *
 * Candidate operation: each of seven ASCII key bytes mod29, repeated from
 * page start. Signed GP29 additive and p56-inspired literal-F GP28 transfer.
 * F=0 is a separate alphabet element rather than ciphertext-F skip.
 *
 * Source selects password-like operand, not this transfer operation.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const get=fp=>JSON.parse(fs.readFileSync(path.join(root,fp),'utf8'));
const grid=get('resources/liber-primus/base60-grid.json');
const gp=get('resources/liber-primus/lp2-corpus.json');
const ink=get('resources/liber-primus/lp2-ink-annotations.json');
const heading=ink.pages.find(p=>p.page===57);
assert(heading);
assert.deepEqual(heading.large_punctuation[0],[7,13,'red']);
assert.equal(heading.red_spans[0].length,7);
assert.equal(gp.pages[57].indices.slice(0,7)
 .map(i=>gp.translit[i]).join(''),'PARABLE');
const rows=grid.byte_rows,ring=[];
for(let col=0;col<8;col++)ring.push(rows[0][col]);
for(let row=1;row<32;row++)ring.push(rows[row][7]);
for(let col=6;col>=0;col--)ring.push(rows[31][col]);
for(let row=30;row>=1;row--)ring.push(rows[row][0]);
assert.equal(ring.length,76);
const key=ring.slice(heading.large_punctuation[0][1]-1,
 heading.large_punctuation[0][1]-1+heading.red_spans[0].length);
assert.equal(Buffer.from(key).toString('latin1'),'LP3lRA#');
const original=gp.pages[3].indices;
assert.equal(original.length,217);
const native=gp.pages[57].indices;
assert.equal(native.length,95);
const mod=(v,m)=>((v%m)+m)%m;
/** @param {number[]} src @param {number} sign
 * @param {boolean} preserveF */
function cipher(src,sign,preserveF){
 let k=0;
 return src.map(x=>{
  if(preserveF&&x===0)return 0;
  const m=preserveF?28:29,base=preserveF?x-1:x;
  const next=mod(base+sign*(key[k++%7]%m),m);
  return preserveF?next+1:next;
 });
}
/** @param {number[]} src */
function ioc(src){
 const f=Array(29).fill(0);
 src.forEach(x=>{assert(Number.isInteger(x)&&x>=0&&x<29);f[x]++});
 return f.reduce((s,n)=>s+n*(n-1),0)/(src.length*(src.length-1));
}
for(const preserveF of [false,true])for(const sign of [-1,1]){
 const decoded=cipher(original,sign,preserveF);
 assert.deepEqual(cipher(decoded,-sign,preserveF),original);
 const nativeCipher=cipher(native,-sign,preserveF);
 assert.deepEqual(cipher(nativeCipher,sign,preserveF),native);
 const head=decoded.slice(0,75).map(x=>gp.translit[x]);
 console.log(JSON.stringify({
  keyAscii:'LP3lRA#',keyRawBytes:key,keyMod29:key.map(x=>x%29),
  originalTargetPhysicalPage:3,originalCipherRunes:217,
  ring:preserveF?'gp28_preserveF':'gp29',
  sign,originalIoC:ioc(decoded),nativeP57IoC:ioc(native),
  originalFirst75RuneSpellings:head.join(' '),
  red16OriginalDecoded:decoded.slice(0,16).map(x=>gp.translit[x]).join(''),
  red3OriginalDecoded:decoded.slice(119,122).map(x=>gp.translit[x]).join('')
 }));
}
console.log('PASS source 7-character outer perimeter direct original p3 signed GP29/28 fully invertible, source p57 authentic controls');
