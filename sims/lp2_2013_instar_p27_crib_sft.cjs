'use strict';
/**
 * Source-frozen 2013 "THE INSTAR EMERGENCE" -> LP2 p27 red0 known-crib gate.
 * No phrase tuning, offset search, punctuation repair or F skip optimization.
 * Run: node sims/lp2_2013_instar_p27_crib_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = name => JSON.parse(fs.readFileSync(
  path.join(__dirname,'..','resources','liber-primus',name),'utf8'));
const corpus = source('lp2-corpus.json');
const ink = source('lp2-ink-annotations.json');
const dictionary = corpus.translit.map((token,index)=>({token,index}))
  .sort((a,b)=>b.token.length-a.token.length);

/** @param {string} words @returns {number[]} */
function gp(words) {
  const out=[];
  const normalized=words.toUpperCase().replaceAll('V','U').replaceAll('K','C');
  for(const word of normalized.split(/\s+/)) {
    for(let i=0;i<word.length;) {
      const found=dictionary.find(x=>word.startsWith(x.token,i));
      assert.ok(found,'missing GP symbol in '+word.slice(i));
      out.push(found.index);i+=found.token.length;
    }
  }
  return out;
}
/** @param {number} page @returns {number[]} */
function redHead(page) {
  const record=ink.pages.find(x=>x.page===page);
  const span=record.red_spans.find(x=>x.length>=17);
  const p=corpus.pages.find(x=>x.page===page);
  assert.equal(span.runes,[...p.indices.slice(span.start,span.start+span.length)]
    .map(x=>corpus.runes[x]).join(''));
  return p.indices.slice(span.start,span.start+span.length);
}
/** @param {number[]} C @param {number[]} P @returns {number[]} */
function impliedKey(C,P) {
  assert.equal(C.length,P.length);
  return C.map((c,i)=>(c-P[i]+29)%29);
}
/** @param {number[]} key @param {number} period @returns {number[]} */
function failedPeriodPositions(key,period) {
  const conflicts=[];
  for(let i=period;i<key.length;i++) if(key[i]!==key[i%period]) conflicts.push(i);
  return conflicts;
}
/** @param {number[]} source @param {number[]} expected @returns {number} */
function matches(source,expected) {
  return source.reduce((n,s,i)=>n+Number(s===expected[i]),0);
}

const crib=gp('THE INSTAR EMERGENCE');
const divinity=gp('DIVINITY');
assert.deepEqual(crib,[2,18,10,9,15,16,24,4,18,19,18,4,6,18,9,5,18]);
assert.equal(divinity.length,8);
const red27=redHead(27);
const red53=redHead(53);
assert.equal(red27.length,19);
assert.equal(red53.length,51);
const observations=[{page:27,C:red27.slice(0,17)},{page:53,C:red53.slice(0,17)}]
  .map(({page,C})=>{
    const key=impliedKey(C,crib);
    const periods=Array.from({length:14},(_,i)=>{
      const period=i+1, conflicts=failedPeriodPositions(key,period);
      return {period,conflicts:conflicts.length,first:conflicts[0]??null};
    });
    return {
      page,
      impliedKey:key,
      periodicSuccess:periods.filter(x=>x.conflicts===0).map(x=>x.period),
      allPeriods:periods,
      AtbashPlus3Matches:matches(C.map(c=>(31-c)%29),crib),
      historicalDIVINITYMatches:matches(
        C.map((c,i)=>(c-divinity[i%8]+29)%29),crib)
    };
  });

assert.deepEqual(observations[0].periodicSuccess,[]);
assert.deepEqual(observations[1].periodicSuccess,[]);
assert.deepEqual(observations[0].allPeriods.map(x=>x.conflicts),
  [16,15,13,13,12,10,10,9,8,7,5,5,4,3]);
assert.deepEqual(observations[1].allPeriods.map(x=>x.conflicts),
  [16,15,14,13,12,11,10,9,8,7,6,5,4,3]);
assert.equal(observations[0].AtbashPlus3Matches,1);
assert.equal(observations[1].AtbashPlus3Matches,1);
assert.equal(observations[0].historicalDIVINITYMatches,0);
assert.equal(observations[1].historicalDIVINITYMatches,0);

// GP-native original-length, fixed-phrase, published eight-symbol-key
// positive plant; its 17-token prefix must expose the exact period8.
const plantedCipher=crib.map((p,i)=>(p+divinity[i%8])%29);
const plantedKey=impliedKey(plantedCipher,crib);
assert.deepEqual(plantedKey.slice(0,8),divinity);
assert.deepEqual(failedPeriodPositions(plantedKey,8),[]);
assert.deepEqual(plantedCipher.map((c,i)=>(c-divinity[i%8]+29)%29),crib);

// Independent historically solved LP1 Atbash+3 operator plant.
const atbash3Plant=crib.map(p=>(31-p)%29);
assert.deepEqual(atbash3Plant.map(c=>(31-c)%29),crib);

if(require.main===module) console.log(JSON.stringify({
  source:'2013 761.MP3 ID3 title THE INSTAR EMERGENCE; original LP2 p27 and p53 red spans',
  originalRed27GP19:red27,
  originalRed27WithheldOffsets17And18:red27.slice(17,19),
  originalRed53GP17:red53.slice(0,17),
  tests:observations,
  positivePlants:{DIVINITY8:true,AtbashPlus3:true},
  result:'REJECTED: no exact period1..14 or published fixed decoder; no withheld prediction',
  status:'PASS'
},null,2));
module.exports={gp,impliedKey,failedPeriodPositions};
