'use strict';
/**
 * All-secret word-local arithmetic-ramp GP29 inverse SFT on the original
 * 2,896-word LP2 transcription and 29,157-entry native-GP English register.
 *
 * Proposed reversible family for every printed word, with independently
 * selected secret keys per word:
 * C[i] = a*P[i] + b + c*i mod 29, a in {1,...,28}, b,c in {0,...,28}.
 *
 * Its second finite differences satisfy D2(C)=a*D2(P) mod29.
 * Dividing the entire nonzero difference vector by its first nonzero
 * entry eliminates the multiplier and every possible secret b,c exactly.
 * Windows 11 / Node.js 22, CommonJS, standard libraries only.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {encodeSourceNativeGP} = require('./lp2_native_gp_source_orthography_sft.cjs');
const root = path.join(__dirname, '..');
/** @param {string} p */
function read(p) {return fs.readFileSync(path.join(root, p), 'utf8');}
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const runeIndex = new Map(gp.runes.map((g,i)=>[g,i]));
const wordsRegex = new RegExp('[' + gp.runes.join('') + ']+', 'gu');
const original = (read('resources/lp2-transcription.txt').split('%').slice(0,55).join('%')
  .replace(/\/\r?\n/g, '').replace(/[\r\n%]/g, '').match(wordsRegex) || [])
  .map(w => Array.from(w, x => runeIndex.get(x)));
assert.equal(original.length, 2896);
assert.equal(original.flat().length, 12956);
const dict = read('resources/control/english_wordfreq_textblob.txt')
  .split(/\r?\n/).filter(x=>/^[a-z]+ \d+$/.test(x))
  .map(x=>({word:x.split(' ')[0], gp:encodeSourceNativeGP(x.split(' ')[0])}));
assert.equal(dict.length,29157);
/** @param {number} v */
const inv = v => {
  assert(Number.isInteger(v) && v > 0 && v < 29);
  for(let a=1;a<29;a++) if(a*v%29===1) return a;
  throw Error('noninvertible GF29 scalar');
};
/** @param {number[]} x */
const signature = x => {
  assert(x.length>=3);
  const d = x.slice(2).map((v,i) => (v-2*x[i+1]+x[i]+58)%29);
  const k = d.find(v => v!==0);
  const scale = k===undefined ? 0:inv(k);
  return x.length + ':' + d.map(v => v*scale%29).join(',');
};
const knownByLength = new Map();
const sigMap = new Map();
for(const item of dict) {
  const n = item.gp.length;
  if (n < 8 || n > 14) continue;
  if (!knownByLength.has(n)) knownByLength.set(n,[]);
  knownByLength.get(n).push(item);
  const sig=signature(item.gp);
  if(!sigMap.has(sig))sigMap.set(sig,[]);
  sigMap.get(sig).push(item.word);
}
const originalSummary=[];
let total=0,matches=0,planted=0;
for(let n=8;n<=14;n++) {
  const all = original.filter(w=>w.length===n);
  const hits = all.filter(w=>sigMap.has(signature(w)));
  const source=knownByLength.get(n);
  assert.ok(source && source.length>0);
  for(let i=0;i<all.length;i++) {
    const plain=source[(17*i+n)%source.length].gp;
    const a=1+(i*11+n)%28, b=(i*7+n*2)%29, c=(i*5+n*3)%29;
    const ciphertext=plain.map((p,j)=>(a*p+b+c*j)%29);
    assert.equal(signature(ciphertext),signature(plain));
    const invA=inv(a), recovered=ciphertext.map((x,j)=>(invA*((x-b-c*j)%29+29*29))%29);
    assert.deepEqual(recovered,plain);
    assert.ok(sigMap.has(signature(ciphertext)));
    planted++;
  }
  originalSummary.push({runeLength:n,originalWords:all.length,compatibleAnySecretRamp:hits.length,
    originalWithoutNativeDictionaryRamp:hits.length? all.length-hits.length:all.length,
    nativeDictionaryWords:source.length});
  total+=all.length;matches+=hits.length;
}
assert.equal(total,343);
assert.equal(matches,0);
assert.equal(planted,343);
assert.deepEqual(originalSummary.map(r=>r.originalWords),[156,78,52,32,18,4,3]);
console.log(JSON.stringify({
  status:'PASS',
  originalRunes:12956,originalWords:2896,sourceNativeDictionary:dict.length,
  family:'word-local all-secret invertible GP29 affine arithmetic ramp',
  secretParameters:'every word independently chooses a nonzero multiplier a, intercept b, and step c',
  invariant:'second differences normalized by the first nonzero entry',
  originalLongWords:total,originalWordsAdmittingSomeSecretRampToSourceNativeEnglish:matches,
  exactNativeGPEncryptedWordControlsRecovered:planted,
  lengths:originalSummary,
  conclusion:'Conditional exclusion for intact 8-14-rune words and frozen 29,157-entry GP-native English register. Does not test a nonlinear/word-varying within-word pad, moved spaces, or an absent plaintext register.'
},null,2));
