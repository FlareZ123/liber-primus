'use strict';
/**
 * All-secret word-local five-phase GF29 affine original-cipher gate.
 * For each complete word: C[i]=a*P[i]+b[i%5] mod29,
 * where a is any nonzero GF29 element and all five b are independent.
 * Lag-five differences cancel every unknown phase shift, and quotienting
 * their first nonzero element eliminates all 28 possible multipliers.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {encodeSourceNativeGP} = require('./lp2_native_gp_source_orthography_sft.cjs');
const base = path.join(__dirname, '..');
const text = file => fs.readFileSync(path.join(base, file), 'utf8');
const gp = JSON.parse(text('resources/liber-primus/lp2-corpus.json'));
const runeIndex = new Map(gp.runes.map((c, i) => [c, i]));
const regexp = new RegExp('[' + gp.runes.join('') + ']+', 'gu');
const source = text('resources/lp2-transcription.txt');
const original = (source.split('%').slice(0, 55).join('%')
  .replace(/\/\r?\n/g, '').replace(/[\r\n%]/g, '').match(regexp) || [])
  .map(w => Array.from(w, r => runeIndex.get(r)));
assert.equal(original.length, 2896);
assert.equal(original.flat().length, 12956);
const dictionary = text('resources/control/english_wordfreq_textblob.txt')
  .split(/\r?\n/).filter(line => /^[a-z]+ \d+$/.test(line))
  .map(line => {const word = line.split(' ')[0];return {word, gp:encodeSourceNativeGP(word)};});
assert.equal(dictionary.length, 29157);
/** @param {number} x @returns {number} */
function inverse(x) {
  assert(x > 0 && x < 29);
  for(let a=1;a<29;a++) if((a*x)%29===1) return a;
  throw new Error('non-invertible scalar');
}
/** @param {number[]} word @param {number} lag @returns {string} */
function affineSignature(word, lag=5) {
  const differences=word.slice(lag).map((c,i)=>(c-word[i]+29)%29);
  const first=differences.find(x=>x!==0);
  const scale=first===undefined?0:inverse(first);
  return word.length+':'+differences.map(x=>x*scale%29).join(',');
}
/** @param {number[]} word @param {number} lag @returns {string} */
function phaseBijectionSignature(word, lag=5) {
  const phases=[];
  for(let j=0;j<lag;j++){
    const seen=new Map(),pattern=[];
    for(let i=j;i<word.length;i+=lag){
      const c=word[i];if(!seen.has(c))seen.set(c,seen.size);
      pattern.push(seen.get(c));
    }
    phases.push(pattern.join(''));
  }
  return word.length+':'+phases.join('|');
}
const matched=new Set(dictionary.map(({gp:w})=>affineSignature(w)));
const bijections=new Set(dictionary.map(({gp:w})=>phaseBijectionSignature(w)));
const originalSummary=[10,11,12,13,14].map(length=>{
 const words=original.filter(w=>w.length===length);
 return {length,words:words.length,
  fivePhaseAffineWithoutEnglishMatch:words.filter(w=>!matched.has(affineSignature(w))).length,
  fivePhaseArbitraryBijectionWithoutEnglishMatch:words.filter(w=>!bijections.has(phaseBijectionSignature(w))).length};
});
assert.deepEqual(originalSummary.map(x=>[x.words,x.fivePhaseAffineWithoutEnglishMatch]),
 [[52,52],[32,32],[18,18],[4,4],[3,3]]);
assert.equal(originalSummary.reduce((n,x)=>n+x.fivePhaseArbitraryBijectionWithoutEnglishMatch,0),1);
// Native-source GP English plant at every original >=10 word-length slot.
const nativeByLength=new Map();
for(const item of dictionary){
 if(!nativeByLength.has(item.gp.length))nativeByLength.set(item.gp.length,[]);
 nativeByLength.get(item.gp.length).push(item.gp);
}
let syntheticWords=0,syntheticMatches=0,syntheticRecovered=0,ordinal=0;
for(const target of original.filter(w=>w.length>=10&&w.length<=14)){
 const candidates=nativeByLength.get(target.length);
 const plain=candidates[(ordinal*17+3)%candidates.length];
 const scalar=(ordinal*7+3)%28+1;
 const shifts=Array.from({length:5},(_,j)=>(ordinal*11+j*7)%29);
 const cipher=plain.map((v,i)=>(scalar*v+shifts[i%5])%29);
 const decoder=inverse(scalar);
 const recovered=cipher.map((v,i)=>(decoder*((v-shifts[i%5]+29)%29))%29);
 syntheticWords++;
 if(matched.has(affineSignature(cipher)))syntheticMatches++;
 if(recovered.every((x,i)=>x===plain[i]))syntheticRecovered++;
 assert.equal(affineSignature(cipher),affineSignature(plain));
 ordinal++;
}
assert.deepEqual([syntheticWords,syntheticMatches,syntheticRecovered],[109,109,109]);
console.log(JSON.stringify({
 hypothesis:'independent five-phase affine GP29 word keys',originalWords:original.length,
 originalRunes:original.flat().length,dictionary:dictionary.length,originalSummary,
 allSecretAffineLongWordMisses:originalSummary.reduce((n,x)=>n+x.fivePhaseAffineWithoutEnglishMatch,0),
 allSecretPhaseBijectionLongWordMisses:originalSummary.reduce((n,x)=>n+x.fivePhaseArbitraryBijectionWithoutEnglishMatch,0),
 positiveControl:{syntheticWords,syntheticMatches,syntheticRecovered},unknownPlaintextRecovered:0,
 limitations:'finite English register, unchanged segmentation and strict word-local five-phase affine keys'
},null,2));
