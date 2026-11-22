'use strict';
/**
 * Single runnable source-typed test of p50 base60 bit0 lag1/lag5 GF29
 * field-unit inverse. No fitted secret, no changed original rune or word.
 * Work from original 256 printed p50 cells and complete LP2 p0-55 stream.
 * Node.js22 / CommonJS:
 *   node sims/lp2_p50_bit0_fieldunit_dualtap_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root,p),'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const transcript = read('resources/liber-primus/lp2-transcription.txt');
const C = gp.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
const BYTE = grid.bytes;
assert.equal(C.length,12956);
assert.equal(BYTE.length,256);
assert.equal(grid.alphabet,'0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx');
const m29 = n => ((n%29)+29)%29;
const inverse = Array(29).fill(0);
for(let i=1;i<29;i++){
  inverse[i] = Array.from({length:28},(_,k)=>k+1).find(k=>i*k%29===1);
  assert.equal(i*inverse[i]%29,1);
}
const originalWords = transcript.split('%').slice(0,55).join('%')
  .replace(/\/\s*\n/g,'').replace(/[\r\n%]/g,'')
  .match(/[\u16A0-\u16FF]+/gu) || [];
const oneRunePositions=[];
let total=0;
for(const word of originalWords) {
  if([...word].length===1)oneRunePositions.push(total);
  total += [...word].length;
}
assert.equal(total,C.length);
assert.equal(originalWords.length,2896);
assert.equal(oneRunePositions.length,83);
const aRune=gp.translit.indexOf('A'), iRune=gp.translit.indexOf('I');
assert.equal(aRune,24);
assert.equal(iRune,10);
const solvedP57=gp.pages.find(p=>p.page===57).indices;
assert.equal(solvedP57.length,95);
const positive=Array.from({length:C.length},(_,i)=>solvedP57[i%95]);

/**
 * The entirely source-fixed candidate (key phase is at physical g-1):
 * lag=1 if B[(g-1+phase) mod256] even, else lag=5.
 * unit K=(B mod28)+1 in GF29; EA (GP index28) maps to zero step.
 * C[g]=C[g-lag]+sign*K*(P[g]+1) mod29.
 * @param {number[]} source
 * @param {number} phase
 * @param {1|-1} sign
 */
function encrypt(source,phase,sign) {
  const out=[];
  for(let i=0;i<source.length;i++){
    const b=BYTE[(i-1+phase+256)%256];
    const lag=(b&1)===0?1:5;
    const prev=i>=lag?out[i-lag]:0;
    out.push(m29(prev+sign*(b%28+1)*(source[i]+1)));
  }
  return out;
}
/** @param {number[]} source @param {number} phase @param {1|-1} sign */
function decrypt(source,phase,sign) {
  return source.map((c,i)=>{
    const b=BYTE[(i-1+phase+256)%256];
    const lag=(b&1)===0?1:5;
    const prev=i>=lag?source[i-lag]:0;
    return m29(sign*(c-prev)*inverse[b%28+1]-1);
  });
}
/** @param {number[]} x */
function ioc(x) {
  const hist=new Array(29).fill(0);
  for(const r of x)hist[r]++;
  return hist.reduce((n,v)=>n+v*(v-1),0)/(x.length*(x.length-1));
}
const originalP49End = gp.pages.filter(p=>p.page<=49).reduce((s,p)=>s+p.indices.length,0);
assert.equal(originalP49End,12114);
const resetPhase = (256 - originalP49End%256)%256;
assert.equal(resetPhase,174);
const cases=[];
for(const phase of [0,resetPhase])for(const sign of [-1,1]) {
  const implanted=encrypt(positive,phase,sign);
  assert.deepEqual(decrypt(implanted,phase,sign),positive,
    'authentic solved GP p57 positive plant, full length');
  const plain=decrypt(C,phase,sign);
  assert.deepEqual(encrypt(plain,phase,sign),C,
    'original 12,956 runes exactly forward-replayed');
  const allowed=oneRunePositions.filter(i=>plain[i]===aRune||plain[i]===iRune).length;
  const countEA=plain.filter(v=>v===28).length;
  assert(allowed<=7 && countEA>=260 && countEA<=300);
  const score=ioc(plain);
  assert(score<0.04,'original unrelated non-native plaintext must not be promoted');
  cases.push({
    keyPhase:phase, sign, originalRunes:C.length,
    originalUnknownIoC:score, nativeSolvedPositiveIoC:ioc(positive),
    oneRuneWords:83, legalEnglishAI:allowed,
    impossibleSingleRuneWords:83-allowed,
    impliedEAcount:countEA,
    first80Runes:plain.slice(0,80).map(p=>gp.translit[p]).join(' '),
    originalRecipherExact:true, solvedNativePlantExact:true
  });
}
console.log(JSON.stringify({
  input:'Canonical original LP2 p0-55 12,956 GP29 runes, 2,896 complete words; source p49-51 256-cell base60 byte table',
  sourceFirstPartyClock:{
    p49RedTenDotAfterOriginalGlobalRune:originalP49End,
    p49MarkPhaseMod256:originalP49End%256,
    originalWholeBookPhase:0,
    literalMarkStartedPhase:resetPhase,
    p56TenDotControl:'Original solved p56 prime-totient key continues over its red ten-dot; separate source-gate script'
  },
  candidate:'D[g]=(C[g]-C[g-lag]) mod29; P[g]=sign*D[g]*inv(B[g-1]%28+1)-1; lag=1 for p50 byte even, 5 otherwise; previous values are ciphertext.',
  cases,
  decision:'All four fully source-parameterized unit-field two-tap variants have random-like GP29 IoC and at least 76 impossible standalone English words on the 83 original singleton positions. The byte-source parity association is not an independently readable cipher.'
},null,2));
