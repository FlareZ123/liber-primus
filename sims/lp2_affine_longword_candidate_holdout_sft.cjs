'use strict';
/**
 * Original p13 and p25 fourteen-rune affine-crib candidate controls.
 * Run as one CommonJS SFT in the repository (Node.js 22):
 * node sims/lp2_affine_longword_candidate_holdout_sft.cjs
 * These are fitted candidates, not recovered LP2 plaintext.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {encodeSourceNativeGP} = require('./lp2_native_gp_source_orthography_sft.cjs');
const root = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const index = new Map(gp.runes.map((r, i) => [r, i]));
const runeRE = new RegExp('[' + gp.runes.join('') + ']+', 'gu');
const trans = read('resources/lp2-transcription.txt').split('%')
  .slice(0, 55).join('%').replace(/\/\r?\n/g, '')
  .replace(/[\r\n%]/g, '');
const words = (trans.match(runeRE) || [])
  .map(w => Array.from(w, r => index.get(r)));
assert.equal(words.length, 2896);
assert.equal(words.reduce((n, w) => n + w.length, 0), 12956);
const mod = x => ((x % 29) + 29) % 29;
const inverse = x => {
  for (let i = 1; i <= 28; i++) if (i * x % 29 === 1) return i;
  throw Error('no field inverse');
};
/**
 * Find exact GP29 affine five-back parameters for candidate word, with
 * first five original ciphertext cells arbitrary and five word-local K.
 * @param {number[]} c Original ciphertext word
 * @param {number[]} p Hypothesized word in GP29
 */
function fit(c, p) {
  assert.equal(c.length, 14);
  assert.equal(p.length, 14);
  const result = [];
  for (let B = 0; B < 29; B++) {
    for (let A = 1; A < 29; A++) {
      const ok = [10,11,12,13].every(j =>
        mod(c[j]-(B+1)*c[j-5]+B*c[j-10]) ===
          mod(A*(p[j]-p[j-5])));
      if (!ok) continue;
      const K = [5,6,7,8,9].map(j =>
        mod(c[j]-A*p[j]-B*c[j-5]));
      for (let j = 5; j < 14; j++) assert.equal(
        mod(A*p[j]+K[j % 5]+B*c[j-5]), c[j]);
      result.push({A,B,K,IV:c.slice(0,5)});
    }
  }
  return result;
}
const c13=words[754],c25=words[1353],c43=words[2341];
assert.equal(c13.map(x=>gp.runes[x]).join(''), 'ᛒᚷᛞᛉᛗᛒᛉᚳᛝᚦᚣᛞᚫᛠ');
assert.equal(c25.map(x=>gp.runes[x]).join(''), 'ᛠᛁᛡᚦᛝᚾᛖᚾᚠᚩᛗᛖᚣᚪ');
assert.equal(c43.map(x=>gp.runes[x]).join(''), 'ᛏᚠᛄᚱᚹᚠᛋᚾᚹᛄᛖᛒᚢᚦ');
assert.equal(c13.includes(0), false);
const previous=words[753];
assert.equal(previous.map(x=>gp.runes[x]).join(''), 'ᚻᛚᚦᛝᛖᛗᚱ');
const dictionary = read('resources/control/english_wordfreq_textblob.txt')
  .split(/\r?\n/).filter(s => /^[a-z]+ \d+$/.test(s))
  .map(s => s.split(' ')[0]);
assert.equal(dictionary.length, 29157);
const sourceSuffix = (A,B,K) => [5,6].map(j =>
  mod(inverse(A)*(previous[j]-K[j%5]-B*previous[j-5])));
const countedSuffix = suffix => dictionary.filter(w => {
  const p=encodeSourceNativeGP(w);
  return p.length===7 && p[5]===suffix[0] && p[6]===suffix[1];
}).length;
const pEnglish=encodeSourceNativeGP('UNSUCCESSFULLY');
const english=fit(c13,pEnglish);
assert.deepEqual(english.map(({A,B,K})=>({A,B,K})),[
  {A:5,B:18,K:[5,19,9,13,8]}
]);
assert.equal(pEnglish.includes(0),true);
const forced=sourceSuffix(english[0].A,english[0].B,english[0].K);
assert.deepEqual(forced,[3,12]); // O EO
assert.equal(countedSuffix(forced),0);
const pSurname=encodeSourceNativeGP('NEUENSCHWANDER');
const proper=fit(c13,pSurname);
assert.deepEqual(proper.map(({A,B,K})=>({A,B,K})),[
  {A:13,B:19,K:[21,9,15,12,25]}
]);
const latinDigits='0123456789ABCDEFGHIJKLMNOPQRS';
const latinWord='5391I9I419G51I';
assert(read('resources/control/latin-vulgate-gp-wholewords.txt')
  .split(/\r?\n/).includes(latinWord));
const pLatin=Array.from(latinWord,ch=>latinDigits.indexOf(ch));
assert.deepEqual(fit(c25,pLatin).map(({A,B})=>[A,B]),[[26,6]]);
console.log(JSON.stringify({
  interpretation:'postselected exact word fits, no authenticated plaintext',
  sourceWords:words.length,sourceRunes:12956,
  p13C:gp.translit.filter(Boolean).length,
  englishCandidate:{word:'UNSUCCESSFULLY',...english[0],
    plaintextContainsF:true,originalCipherContainsF:false,
    earlierSevenRuneWordEnd:forced.map(i=>gp.translit[i]),
    native29157PreviousWordCount:countedSuffix(forced)},
  otherCandidate:{word:'NEUENSCHWANDER',...proper[0]},
  latinSourceCandidate:{word:'CONUENERUNTQUE',gp:latinWord,
    parameters:fit(c25,pLatin)},
},null,2));
