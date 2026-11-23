'use strict';
// Native LP2 p0..55 all-secret 840-phase substitution gate.
// Run offline on Windows Node22: node sims/lp2_h840_allsecret_phase_permutation_ioc_sft.cjs
// Historical selector: signed BASE29 3301 = [3,26,24] polynomial H,
// primitive GF(29^2) generator has exact order 840.
// ANY injective 840-period rune-by-rune output permutation preserves equality
// for rune pairs from the same phase, independently of 29*840 secret key bytes.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
/** @param {string} name @returns {string} */
function read(name) {
  return fs.readFileSync(path.join(ROOT,name),'utf8');
}
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const alphabet=corpus.runes;
assert.equal(alphabet.length,29);
const original=[...read('resources/liber-primus/lp2-transcription.txt')]
  .filter(c=>alphabet.includes(c)).slice(0,12956).map(c=>alphabet.indexOf(c));
assert.equal(original.length,12956);
const nativeBooks=['I','II','III'].map(x=>
  read('resources/external/2013-book-of-law-'+x+'.txt')).join('\n');
const tokens=corpus.translit.map((token,index)=>({token,index}))
  .sort((a,b)=>b.token.length-a.token.length);
/** GP transliteration used in authentic Cicada sources (V=U,K=C);
 * bare punctuation and decimal section numbers contribute no cipher rune.
 * @param {string} source
 * @returns {number[]}
 */
function encodeNative(source) {
  const text=source.toUpperCase().replaceAll('V','U').replaceAll('K','C');
  const result=[];
  for(let i=0;i<text.length;) {
    const found=tokens.find(x=>text.startsWith(x.token,i));
    if(found) {
      result.push(found.index);
      i+=found.token.length;
    } else i++;
  }
  return result;
}
const native=encodeNative(nativeBooks);
assert.equal(native.length,21611);
/** Exactly enumerate all equal-rune pairs sharing one clock phase.
 * For C_i=pi_(i%period)(P_i), any permutation pi preserves this invariant.
 * @param {number[]} runes
 * @param {number} period
 * @returns {{matches:number,pairs:number,rate:number}}
 */
function samePhaseEquality(runes,period) {
  let matches=0,pairs=0;
  for(let phase=0;phase<period;phase++) {
    const counts=new Array(29).fill(0);
    let length=0;
    for(let j=phase;j<runes.length;j+=period) {
      counts[runes[j]]++;
      length++;
    }
    pairs+=length*(length-1)/2;
    matches+=counts.reduce((sum,n)=>sum+n*(n-1)/2,0);
  }
  return {matches,pairs,rate:matches/pairs};
}
const period=840;
const observed=samePhaseEquality(original,period);
assert.deepEqual({matches:observed.matches,pairs:observed.pairs},
  {matches:3277,pairs:93540});
const windows=[];
const offsets=[0,961,1923,2885,3846,4808,5770,6731,7693,8655];
const expectedMatches=[5781,5831,5789,5821,5853,5840,5854,5897,5888,5799];
for(let i=0;i<offsets.length;i++) {
  const offset=offsets[i];
  const source=native.slice(offset,offset+original.length);
  assert.equal(source.length,original.length);
  const witness=samePhaseEquality(source,period);
  assert.equal(witness.pairs,93540);
  assert.equal(witness.matches,expectedMatches[i]);
  assert.ok(witness.rate>0.06);
  windows.push({sourceOffset:offset,...witness});
}
const clear57=corpus.pages.find(p=>p.page===57);
assert.ok(clear57);
const clearNumbers=clear57.indices;
function ioc(x) {
  const counts=new Array(29).fill(0);
  for(const n of x)counts[n]++;
  return counts.reduce((sum,n)=>sum+n*(n-1),0)/(x.length*(x.length-1));
}
const originalIoc=ioc(original),clearIoc=ioc(clearNumbers);
assert.ok(originalIoc<0.04&&clearIoc>0.06);
// Source-native 12,956-rune *positive* under a source-fixed 840-phase key.
// A different arbitrary substitution may be used independently each phase;
// even this deliberately varied phase key preserves all 93,540 equality pairs.
const sourcePlain=native.slice(0,12956);
const phaseShifts=Array.from({length:period},(_,j)=>(17*j*j+3*j+11)%29);
const testCipher=sourcePlain.map((p,i)=>
  (p+phaseShifts[i%period])%29);
const synthetic=samePhaseEquality(testCipher,period);
assert.deepEqual(synthetic,samePhaseEquality(sourcePlain,period));
assert.equal(synthetic.matches,5781);
assert.ok(observed.rate<0.04);
console.log(JSON.stringify({
  source:'signed 2013 BASE29 H / original LP2 12,956 rune register',
  fieldClockOrder:period,
  originalUnknown:observed,
  nativeLongControls:windows,
  nativeSolvedP57Ioc:clearIoc,
  nativePositiveEncryptedPhaseEquality:synthetic,
  originalGlobalIoc:originalIoc,
  consequence:'all-secret PERIOD840 bijective per-phase GP29 mono-rune output is incompatible with standard GP-native English'
},null,2));
