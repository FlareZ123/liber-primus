'use strict';
/**
 * Test original LP2 anti-repeat-escape bijection and one complete
 * p50 modulo-28 source-key consumer. Not source-authenticated.
 *
 * Motivation: original LP2 uses 29 GP rune symbols but contains only
 * 86 adjacent repeated runes in 12,956 originals. A 29-symbol Markov
 * coder can encode 28 ordinary plaintext values as the ordered set
 * of all GP runes except the previous ciphertext rune, with a 29th
 * escape plaintext value 28 encoded by repeating the preceding rune.
 * This is an EXACT 29-to-29 reversible transducer with no search.
 *
 * Original p50 32x8 byte table supplies a fixed cyclic 256-entry key
 * modulo 28, absolute GP clock starts at original p0 rune0 and
 * continues over physical pages without reset or numerical-page count.
 * Test the two arithmetic GP mod28 directions, no shifts or phases.
 *
 * Windows Node.js 22:
 *   node sims/lp2_rank_exclusion_p50_mod28_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = path.resolve(__dirname, '..');
const json = name => JSON.parse(fs.readFileSync(path.join(base, name),'utf8'));
const corpus=json('resources/liber-primus/lp2-corpus.json');
const grid=json('resources/liber-primus/lp2-grid-256.json');
const pages=corpus.pages.filter(p=>p.page<=55);
const ciphertext=pages.flatMap(p=>p.indices);
const table=grid.pages.flatMap(p=>p.bytes);
assert.equal(pages.length,56);
assert.equal(ciphertext.length,12956);
assert.equal(table.length,256);
assert(table.every(x=>x>=0&&x<256));
const key=table.map(v=>v%28);
/** @param {number[]} a @returns {number} */
function ioc(a) {
 const count=Array.from({length:29},(_,x)=>a.filter(v=>v===x).length);
 return count.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));
}
/**
 * Keyless rank-exclusion bijection. The first rune encodes itself, a
 * neutral anchor without a previous ciphertext symbol.
 * For all later positions: forbidden previous rune; rank 0..27
 * sorted ascending, rank 28 is a literal-repeat escape.
 * @param {number[]} cipher @returns {number[]}
 */
function unrank(cipher){
 return cipher.map((c,i)=>{
  if(i===0)return c;
  const previous=cipher[i-1];
  return c===previous?28:c>previous?c-1:c;
 });
}
/** @param {number[]} plain @returns {number[]} */
function rerank(plain){
 const out=[];
 for(let i=0;i<plain.length;i++){
  if(i===0){out.push(plain[0]);continue;}
  const rank=plain[i],prev=out[i-1];
  out.push(rank===28?prev:rank>=prev?rank+1:rank);
 }
 return out;
}
/**
 * @param {number[]} source
 * @param {1|-1} sign
 * @returns {number[]}
 */
function decode(source,sign){
 const values=unrank(source);
 return values.map((v,i)=>i===0||v===28?v:(v+sign*key[i%256]+56)%28);
}
/**
 * @param {number[]} plain
 * @param {1|-1} sign
 * @returns {number[]}
 */
function encode(plain,sign){
 const values=plain.map((p,i)=>i===0||p===28?p:(p-sign*key[i%256]+56)%28);
 return rerank(values);
}
const direct=unrank(ciphertext);
assert.deepEqual(rerank(direct),ciphertext);
assert.equal(direct.filter(x=>x===28).length,86);
assert(Math.abs(ioc(direct)-0.03528010981020525)<0.00001);
// Keyless GP28 register is near-uniform and cannot become natural
// GP native prose through any secret stationary alphabet permutation,
// since IoC is invariant under all 29! such permutations.
const clearReference=corpus.pages.find(p=>p.page===57).indices;
assert.equal(clearReference.length,95);
assert(ioc(clearReference)>0.06);
const sample=Array.from({length:12956},(_,i)=>clearReference[i%clearReference.length]);
sample[5]=28; // explicitly plant rare repeat/escape symbol.
const positives=[];
const results=[];
const p55start=ciphertext.length - corpus.pages.find(p=>p.page===55).indices.length;
assert.equal(p55start,12880);
for(const sign of [-1,1]){
 const input=encode(sample,sign);
 assert.equal(input.length,sample.length);
 assert.deepEqual(decode(input,sign),sample);
 assert(input.some((v,i)=>i>0&&v===input[i-1]));
 const decoded=decode(ciphertext,sign);
 assert.deepEqual(encode(decoded,sign),ciphertext);
 const p0=decoded.slice(0,pages[0].indices.length);
 const p55=decoded.slice(p55start);
 results.push({
  sign,globalDecodedIoc:ioc(decoded),p0Runes:p0.length,
  p0DecodedIoc:ioc(p0),p55Runes:p55.length,p55DecodedIoc:ioc(p55),
  p0First20:p0.slice(0,20).map(i=>corpus.translit[i]).join(' '),
  p55First30:p55.slice(0,30).map(i=>corpus.translit[i]).join(' '),
  fullReencryption:true
 });
 positives.push({sign,originalLength:sample.length,exercisedEscape:true,exact:sample.length});
}
assert(results.every(x=>x.globalDecodedIoc<0.04));
assert(results.every(x=>x.p0DecodedIoc<0.04&&x.p55DecodedIoc<0.04));
console.log(JSON.stringify({
  status:'PASS: keyless anti-repeat rank code is exact but no native GP plaintext; one complete p50 mod28 consumer fails',
  original: {runes:ciphertext.length,adjacentDuplicates:86,
    directRegisterIoc:ioc(direct),nativeSolvedP57Ioc:ioc(clearReference)},
  source: {numericP50KeyBytes:table.length,keyModulus:28,
    zeroOrigin:'original p0 rune0, continuous full LP2 rune tape',p55Start:p55start},
  completeOriginalDecoders:results,
  solvedP57NativeGpPlants:positives,
  caveat:'Mathematical inverse is defined for any ciphertext; duplicate count alone does not authenticate this coding rule or the p50 key.'
},null,2));
