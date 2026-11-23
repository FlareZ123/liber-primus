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


// Source-visible nine physical LP2 chapter boundaries permit independent
// secret 840-phase alphabets and a full clock reset at each chapter.
// The invariant still holds *within* each source chapter: this generalizes
// the global no-go to nine independently secret key schedules.
const chapterPageStarts=[0,3,8,15,23,28,33,40,54,56];
const firstByPage={};
let cursor=0;
for(const page of corpus.pages) {
  firstByPage[page.page]=cursor;
  cursor+=page.runic_count;
}
assert.equal(firstByPage[56],12956);
const chapterStarts=chapterPageStarts.map(page=>firstByPage[page]);
assert.deepEqual(chapterStarts,
  [0,729,1874,3603,5506,6761,7960,9640,12648,12956]);
/** Count all within-same-chapter, within-same-840-phase equal pairs.
 * Every chapter may have a different arbitrary private 840×29 alphabet map.
 * @param {number[]} values
 */
function chapterResetPhaseEquality(values) {
  let matches=0,pairs=0;
  const chapterMatches=[];
  for(let c=0;c<chapterStarts.length-1;c++) {
    const window=values.slice(chapterStarts[c],chapterStarts[c+1]);
    const result=samePhaseEquality(window,period);
    matches+=result.matches;
    pairs+=result.pairs;
    chapterMatches.push(result.matches);
  }
  return {matches,pairs,rate:matches/pairs,chapterMatches};
}
const originalNine=chapterResetPhaseEquality(original);
assert.equal(originalNine.matches,267);
assert.equal(originalNine.pairs,8127);
assert.deepEqual(originalNine.chapterMatches,[0,4,31,48,12,12,28,132,0]);
const expectedNine=[478,520,466,506,492,474,484,498,483,494];
const nativeNine=offsets.map((offset,i)=>{
  const span=native.slice(offset,offset+12956);
  const result=chapterResetPhaseEquality(span);
  assert.equal(result.matches,expectedNine[i]);
  assert.equal(result.pairs,8127);
  assert.ok(result.rate>0.057);
  return {sourceOffset:offset,matches:result.matches,rate:result.rate};
});
const nativeNinePlant=native.slice(0,12956);
const chapterCipher=[];
for(let chapter=0;chapter<chapterStarts.length-1;chapter++) {
  for(let i=chapterStarts[chapter];i<chapterStarts[chapter+1];i++) {
    const phase=i-chapterStarts[chapter];
    const secretShift=(17*phase*phase+13*chapter+11*phase+5)%29;
    chapterCipher.push((nativeNinePlant[i]+secretShift)%29);
  }
}
assert.deepEqual(chapterResetPhaseEquality(chapterCipher),
  chapterResetPhaseEquality(nativeNinePlant));
console.log(JSON.stringify({
  hypothesis:'nine completely independent chapter-private 840-phase GP29 rune bijections',
  sourceChapterStarts:chapterStarts,
  sourceUnknownNine:originalNine,
  sourceNativeNine:nativeNine,
  fullLengthNineZoneNativePositive:chapterResetPhaseEquality(chapterCipher),
  decision:'no native GP29 Book-of-Law whole-book reading under any nine-zone 840-phase private-rune cipher'
},null,2));
