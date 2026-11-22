'use strict';

// GP29 word-local five-phase equality fingerprint: full-register test.
// No key search, no guessed plaintext, no corpus or image mutation.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {encodeSourceNativeGP} = require('./lp2_native_gp_source_orthography_sft.cjs');
const root = path.join(__dirname, '..');
const read = filename => fs.readFileSync(path.join(root, filename), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const source = read('resources/lp2-transcription.txt');
const index = new Map(gp.runes.map((rune, i) => [rune, i]));
const regex = new RegExp('[' + gp.runes.join('') + ']+', 'gu');
const rawWords = source.split('%').slice(0, 55).join('%')
  .replace(/\/\r?\n/g, '').replace(/[\r\n%]/g, '').match(regex) || [];
const original = rawWords.map(word => Array.from(word, rune => index.get(rune)));
assert.equal(original.length, 2896);
assert.equal(original.reduce((s, word) => s + word.length, 0), 12956);
const long = original.filter(word => word.length >= 10 && word.length <= 14);
assert.deepEqual(Array.from({length:5}, (_, i) => long.filter(w => w.length === 10+i).length),
  [52, 32, 18, 4, 3]);
assert.equal(long.length, 109);

/** Equality-invariant fingerprint under five independent bijective phase maps.
 * @param {number[]} word
 * @returns {string}
 */
function signature(word) {
  const phases = [];
  for (let phase = 0; phase < 5; phase++) {
    const labels = new Map(), pattern = [];
    for (let i = phase; i < word.length; i += 5) {
      const glyph = word[i];
      if (!labels.has(glyph)) labels.set(glyph, labels.size);
      pattern.push(labels.get(glyph));
    }
    phases.push(pattern.join(''));
  }
  return word.length + ':' + phases.join('|');
}
const dictionary = read('resources/control/english_wordfreq_textblob.txt')
  .split(/\r?\n/).filter(line => /^[a-z]+ \d+$/.test(line))
  .map(line => {
    const [word, frequency] = line.split(' ');
    return {word, frequency:Number(frequency), symbols:encodeSourceNativeGP(word)};
  });
assert.equal(dictionary.length, 29157);
const frequency = new Map(), widthMass = new Map(), candidates = new Map();
for (const entry of dictionary) {
  const sig = signature(entry.symbols), width = entry.symbols.length;
  frequency.set(sig, (frequency.get(sig) || 0) + entry.frequency);
  widthMass.set(width, (widthMass.get(width) || 0) + entry.frequency);
  const matches = candidates.get(sig) || [];
  matches.push(entry.word);
  candidates.set(sig, matches);
}
/** @param {number[]} word */
function logMass(word) {
  return Math.log(((frequency.get(signature(word)) || 0) + 0.1) /
    ((widthMass.get(word.length) || 0) + 0.1));
}
const counts = long.map(word => (candidates.get(signature(word)) || []).length);
assert.equal(counts.filter(x => x === 0).length, 0);
assert.equal(counts.filter(x => x <= 25).length, 12);
const fullCandidateBits = counts.reduce((sum, n) => sum + Math.log2(n), 0);
assert.ok(Math.abs(fullCandidateBits - 920.3010035120542) < 1e-9);
// Source word positions are printed-word-continuous across original page wraps.
let runeOffset = 0;
const heldout = [];
for (const word of original) {
  if (runeOffset >= 9640 && word.length >= 10 && word.length <= 14)
    heldout.push((candidates.get(signature(word)) || []).length);
  runeOffset += word.length;
}
assert.equal(runeOffset, 12956);
assert.equal(heldout.length, 28);
const heldoutCandidateBits = heldout.reduce((sum, n) => sum + Math.log2(n), 0);
assert.ok(Math.abs(heldoutCandidateBits - 245.0867073857201) < 1e-9);
// The independently normalized Vulgate corpus supplies a non-English register.
// Its 0-9/A-S characters denote 0..28 in *native GP29* order, not ASCII.
const latinAlphabet = '0123456789ABCDEFGHIJKLMNOPQRS';
const latin = read('resources/control/latin-vulgate-gp-wholewords.txt')
  .split(/\r?\n/).filter(line => /^[0-9A-S]+$/.test(line))
  .map(line => Array.from(line, char => latinAlphabet.indexOf(char)));
assert.equal(latin.length, 39835);
const latinSignatures = new Map();
for (const word of latin) {
  const sig = signature(word);
  latinSignatures.set(sig, (latinSignatures.get(sig) || 0) + 1);
}
const latinMatchCounts = long.map(word => latinSignatures.get(signature(word)) || 0);
assert.equal(latinMatchCounts.filter(n => n > 0).length, 107);
assert.equal(latinMatchCounts.filter(n => n === 0).length, 2);
assert.deepEqual(long.map((word, i) => word.length === 14 ? latinMatchCounts[i] : null)
  .filter(n => n !== null), [4, 9, 41]);
const sourceScore = long.reduce((s, word) => s + logMass(word), 0);
assert.ok(Math.abs(sourceScore + 165.1231311587109) < 1e-8);
const sparse = long.map((word, i) => ({word, i, names:candidates.get(signature(word))}))
  .filter(item => item.word.length === 14 && item.names.length <= 2);
assert.deepEqual(sparse.map(item => item.names), [
  ['sequestrectomy'], ['inframaxillary', 'metempsychosis'],
]);

let state = 0x33011090;
/** @returns {number} */
function random32() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return state >>> 0;
}
const lengths = [10, 11, 12, 13, 14];
const sourceCounts = new Map(lengths.map(l => [l, long.filter(w => w.length === l).length]));
const references = [
  ['Shakespeare', 'resources/control/shakespeare_first300k.txt'],
  ['Gibran', 'resources/control/gibran_prophet_58585.txt'],
  ['Emerson', 'resources/control/emerson_essays_2944.txt'],
];
const controls = [];
for (const [name, file] of references) {
  const groups = new Map(lengths.map(l => [l, []]));
  const text = read(file).toUpperCase();
  for (const token of text.match(/[A-Z]+/g) || []) {
    const word = encodeSourceNativeGP(token);
    if (groups.has(word.length)) groups.get(word.length).push(logMass(word));
  }
  const samples = 6000, scores = [];
  for (let trial = 0; trial < samples; trial++) {
    let sum = 0;
    for (const length of lengths) {
      const pool = groups.get(length);
      assert.ok(pool.length);
      for (let i = 0; i < sourceCounts.get(length); i++)
        sum += pool[random32() % pool.length];
    }
    scores.push(sum);
  }
  const mean = scores.reduce((s, x) => s+x, 0) / samples;
  const sd = Math.sqrt(scores.reduce((s, x) => s+(x-mean)**2, 0) / (samples-1));
  const lower = scores.filter(x => x <= sourceScore).length;
  controls.push({
    name, population: Object.fromEntries(lengths.map(l => [l, groups.get(l).length])),
    nullMean:mean, nullSD:sd, sourceZ:(sourceScore-mean)/sd,
    matchedLowerTail:(lower+1)/(samples+1),
  });
}
// A hidden phase-specific nonaffine substitution preserves the exact pattern.
const plant = encodeSourceNativeGP('METEMPSYCHOSIS');
const bijections = Array.from({length:5}, (_, phase) =>
  Array.from({length:29}, (_, x) => (11*x+7*phase)%29));
const cipher = plant.map((symbol, i) => bijections[i%5][symbol]);
assert.equal(signature(cipher), signature(plant));
console.log(JSON.stringify({
  originalLongWords: long.length, originalLongRuneCounts:[52,32,18,4,3],
  dictionaryEntries:dictionary.length, sourceSumLogMass:sourceScore,
  latinNativeCorpusWords:latin.length,
  originalLongWordsWithLatinFivePhaseSignature:latinMatchCounts.filter(n=>n>0).length,
  latinSameSignatureLength14:long.map((word,i)=>word.length===14?latinMatchCounts[i]:null)
    .filter(n=>n!==null),
  sourceMissingSignatures:counts.filter(x=>x===0).length,
  sourceAtMost25Candidates:counts.filter(x=>x<=25).length,
  fullIndependentWordCandidateBits:fullCandidateBits,
  originalP40to55LongWords:heldout.length,
  heldoutIndependentWordCandidateBits:heldoutCandidateBits,
  sourceLen14Constrained:sparse.map(item=>item.names),
  nativeControls:controls, exactPositivePatternPreserved:true,
  recoveredUnknownPlaintext:0,
}, null, 2));
