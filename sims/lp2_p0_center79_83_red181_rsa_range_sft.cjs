'use strict';

/**
 * Original-source small RSA test selected by p0 source-visible markers:
 * - first chapter 729 runes -> 27x27, center NG prime79 and left OE prime83;
 * - p0 red title GP0 sum181, a possible public exponent;
 * - p0 black body 249=3*83 -> 83 fixed-width base29 ciphertext triples;
 * - original pair of 180-degree crosses selects forward/reversed directions.
 *
 * The direct RSA fixed-width decoder is rejected on a necessary range gate,
 * before language: many source-original ciphertext triple integers exceed n.
 *
 * Windows Node22:
 * node sims/lp2_p0_center79_83_red181_rsa_range_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,'resources','liber-primus',name),'utf8');
const corpus=JSON.parse(read('lp2-corpus.json'));
const grid=JSON.parse(read('lp2-grid-256.json'));
const {parseLP2Words}=require('./lp2_word_pages.cjs');
const originalChapter=corpus.pages.slice(0,3).flatMap(p=>p.indices);
const words=parseLP2Words(read('lp2-transcription.txt'),3).words;
const firstPage=corpus.pages[0].indices;
const red=firstPage.slice(0,13);
const black=firstPage.slice(13);
const p=corpus.prime[originalChapter[364]];
const q=corpus.prime[originalChapter[363]];
const n=p*q;
const phi=(p-1)*(q-1);
const e=red.reduce((sum,x)=>sum+x,0);
const d=3145;
assert.deepEqual([p,q,n,phi,e,d],[79,83,6557,6396,181,3145]);
assert.equal((e*d)%phi,1);
assert.equal(originalChapter.length,729);
assert.equal(words.length,158);
assert.equal(black.length,249);
assert.equal(black.length/3,q);
assert.equal(grid.bytes[249],158);
assert.equal(grid.bytes[158],249);

/** @param {number} base @param {number} exponent @param {number} modulus @returns {number} */
function powerMod(base,exponent,modulus) {
  let v=BigInt(base),result=1n,x=BigInt(exponent),m=BigInt(modulus);
  while(x>0n) {
    if(x&1n)result=result*v%m;
    v=v*v%m;
    x>>=1n;
  }
  return Number(result);
}

/** @param {number[]} runes @returns {number[]} */
function triples(runes) {
  assert.equal(runes.length%3,0);
  const out=[];
  for(let i=0;i<runes.length;i+=3)out.push(
    runes[i]*29*29+runes[i+1]*29+runes[i+2]);
  return out;
}

/** @param {number} x @returns {number[]} */
function encodeTriple(x) {
  assert.ok(x>=0&&x<n);
  return [Math.floor(x/841),Math.floor(x%841/29),x%29];
}

const candidates=[
  {orientation:'original printed black-body order',seq:black},
  {orientation:'180-degree reversed black-body order',seq:black.slice().reverse()}
].map(({orientation,seq})=>{
  const c=triples(seq);
  const invalid=c.map((x,i)=>({block:i,value:x})).filter(x=>x.value>=n);
  return {orientation,blocks:c.length,valid:c.length-invalid.length,
    invalid:invalid.length,firstInvalid:invalid.slice(0,8),
    rangeGatePass:invalid.length===0};
});
assert.deepEqual(candidates.map(x=>[x.blocks,x.valid,x.invalid]),[
  [83,20,63],[83,23,60]
]);
assert.ok(candidates.every(x=>!x.rangeGatePass));

// Positive plant: 83 pairs of authentic solved original p57 GP plaintext,
// encrypted as textbook fixed-width RSA with exactly the same p,q,e and
// three-digit base29 ciphertext renderer. This verifies the range rule
// and the exact private inverse on 166 original-language GP symbols.
const solved=corpus.pages.find(p=>p.page===57).indices;
const plantPlain=Array.from({length:166},(_,i)=>solved[i%solved.length]);
const m=Array.from({length:83},(_,i)=>29*plantPlain[2*i]+plantPlain[2*i+1]);
assert.ok(m.every(v=>v<841));
const enc=m.map(v=>powerMod(v,e,n));
const plantedRunes=enc.flatMap(encodeTriple);
assert.equal(plantedRunes.length,249);
assert.equal(triples(plantedRunes).filter(v=>v>=n).length,0);
const recovered=triples(plantedRunes).map(c=>powerMod(c,d,n));
assert.deepEqual(recovered,m);
assert.deepEqual(recovered.flatMap(v=>[Math.floor(v/29),v%29]),plantPlain);

console.log(JSON.stringify({
  classification:'necessary original-cipher range gate excludes fixed 83x3 base29 RSA blocks with source-selected p79 q83 exponent181; no plaintext',
  source:{chapterRunes729:originalChapter.length,chapterWords158:words.length,
    p0Red13:red.length,p0RedGP0:e,p0Black249:black.length,
    sourcePrimeCenter79:p,sourcePrimeLeft83:q},
  rsa:{n,phi,e,d,plaintextDigitsPerBlock:2,ciphertextDigitsPerBlock:3},
  original:candidates,
  plantedNativePositive:{runes:plantPlain.length,blocks:83,
    cipherRunes:plantedRunes.length,decodedRuneMatches:166},
  decision:'canonical fixed-width RSA cipher residues must be in [0,n); both source-visible reading orders violate this in a majority of ciphertext blocks, before any English interpretation',
  limitations:'rejects only this particular fully source-derived textbook RSA framing, not arbitrary re-framing, padding, or unrelated unknown LP2 ciphers'
},null,2));
