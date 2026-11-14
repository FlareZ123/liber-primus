'use strict';
/**
 * Original LP2 GP29 word-state multiplicity lower bound.
 * SFT: node sims/lp2_wordstate_minimum_keycount_sft.cjs
 * Reads pinned original ciphertext and five native-language control registers.
 * No fitted cipher, candidate original plaintext, or hidden key is inferred.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = p => fs.readFileSync(path.join(__dirname, '..', p), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const runeToIndex = new Map(gp.runes.map((r, i) => [r, i]));
const rx = new RegExp('[' + gp.runes.join('') + ']+', 'gu');
const physicalText = read('resources/lp2-transcription.txt')
  .split('%').slice(0, 55).join('%').replace(/\/\r?\n/g, '').replace(/[\r\n%]/g, '');
const original = (physicalText.match(rx) || [])
  .map(w => [...w].map(r => runeToIndex.get(r)).join(','));
const length = w => w.split(',').length;
assert.equal(original.length, 2896);
assert.equal(original.reduce((s, w) => s + length(w), 0), 12956);
const chapterEnds = [729, 1874, 3603, 5506, 6527, 7960, 9640, 12648, 12956];
let offset = 0;
const eligible = original.map((w, i) => {
  const start = offset;
  offset += length(w);
  const chapter = chapterEnds.findIndex(e => e > start);
  assert(chapter >= 0 && offset <= chapterEnds[chapter]);
  return { w, length: length(w), chapter, wordIndex: i };
}).filter(x => x.length <= 10);
assert.equal(eligible.length, 2839);
assert.deepEqual(Array.from({ length: 9 }, (_, i) =>
  eligible.filter(x => x.chapter === i).length), [156,250,371,428,223,318,373,656,64]);

const nativePaths = [
  'resources/control/shakespeare_first300k.txt',
  'resources/control/gibran_prophet_58585.txt',
  'resources/control/emerson_essays_2944.txt',
  'resources/control/beowulf_oe_gp_profile_corrected.json',
  'resources/control/latin-vulgate-gp-wholewords.txt',
];
const tokens = gp.translit.map((s, i) => ({ s, i })).sort((a, b) => b.s.length - a.s.length);
function encode(text) {
  return (text.toUpperCase().match(/[A-Z]+/g) || []).map(word => {
    const w = word.replace(/QU/g, 'CW').replace(/V/g, 'U')
      .replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
    const out = [];
    for (let i = 0; i < w.length;) {
      if (w.startsWith('ING', i)) { out.push(21); i += 3; continue; }
      if (w.startsWith('IO', i)) { out.push(27); i += 2; continue; }
      const t = tokens.find(x => w.startsWith(x.s, i));
      assert(t, 'source word has no GP encoding');
      out.push(t.i);
      i += t.s.length;
    }
    return out.join(',');
  });
}
const native = nativePaths.slice(0, 3).map(p => encode(read(p)));
const old = JSON.parse(read(nativePaths[3]));
let pos = 0;
native.push(old.allSourceGpWordLengths.map(m => {
  const word = [...old.sourceGpBase29.slice(pos, pos + m)]
    .map(r => old.positiveControlAlphabet.indexOf(r)).join(',');
  pos += m;
  return word;
}));
assert.equal(pos, 48012);
const alphabet = '0123456789ABCDEFGHIJKLMNOPQRS';
native.push(read(nativePaths[4]).split(/\r?\n/)
  .filter(w => w && !w.trimStart().startsWith('#'))
  .map(w => [...w].map(c => alphabet.indexOf(c)).join(',')));
assert.deepEqual(native.map(x => x.length), [55407, 15733, 77932, 10885, 39835]);

/**
 * Each observed (plaintext word, ciphertext word) requires some deterministic
 * codebook state. One state can map a given plaintext word to only one
 * ciphertext word. For a bijective codebook, one ciphertext word can also
 * decode to only one plaintext word in the same state. Therefore the
 * maximum distinct left/right neighbor degree is a lower bound on K.
 * With freely chosen per-occurrence states it is tight by bipartite
 * edge-coloring, but this ignores extra actual state-transition constraints.
 */
function minimumStates(pairs) {
  const byPlain = new Map();
  const byCipher = new Map();
  for (const [plain, cipher] of pairs) {
    if (!byPlain.has(plain)) byPlain.set(plain, new Set());
    if (!byCipher.has(cipher)) byCipher.set(cipher, new Set());
    byPlain.get(plain).add(cipher);
    byCipher.get(cipher).add(plain);
  }
  let left = 0, right = 0;
  for (const set of byPlain.values()) left = Math.max(left, set.size);
  for (const set of byCipher.values()) right = Math.max(right, set.size);
  return { minStates: Math.max(left, right), plainDegree: left, cipherDegree: right };
}

let state = 0x43816233;
function random() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return (state >>> 0) / 4294967296;
}
const trials = 1000;
const summaries = [];
let positive = null;
for (let sourceIndex = 0; sourceIndex < native.length; sourceIndex++) {
  const pools = Array.from({ length: 11 }, (_, l) =>
    native[sourceIndex].filter(w => length(w) === l));
  assert(pools.slice(1).every(p => p.length));
  let min = Infinity, max = 0, sum = 0, atMost29 = 0, atMost58 = 0;
  const chapter8 = { min: Infinity, max: 0, sum: 0, atMost29: 0 };
  for (let trial = 0; trial < trials; trial++) {
    const pairs = eligible.map(x => [
      pools[x.length][Math.floor(random() * pools[x.length].length)], x.w]);
    const k = minimumStates(pairs).minStates;
    min = Math.min(min, k);
    max = Math.max(max, k);
    sum += k;
    if (k <= 29) atMost29++;
    if (k <= 58) atMost58++;
    const chapterPairs = pairs.filter((_, i) => eligible[i].chapter === 7);
    const c = minimumStates(chapterPairs).minStates;
    chapter8.min = Math.min(chapter8.min, c);
    chapter8.max = Math.max(chapter8.max, c);
    chapter8.sum += c;
    if (c <= 29) chapter8.atMost29++;
  }
  summaries.push({
    source: nativePaths[sourceIndex],
    originalWordPositions: eligible.length,
    trials, min, max, mean: sum / trials, atMost29, atMost58,
    chapter40to53: { min: chapter8.min, max: chapter8.max,
      mean: chapter8.sum / trials, atMost29: chapter8.atMost29 },
  });

  // Independently constructed 29-state, lossless, length-preserving planted
  // whole-word Caesar codebook. Exact original word lengths are respected.
  if (sourceIndex === 0) {
    const plain = eligible.map((x, i) =>
      pools[x.length][(i * 73 + x.length * 11) % pools[x.length].length]);
    const shift = (word, k) => word.split(',').map(v =>
      (Number(v) + k + 29) % 29).join(',');
    const cipher = plain.map((w, i) => shift(w, i % 29));
    assert.deepEqual(cipher.map((w, i) => shift(w, 29 - (i % 29))), plain);
    const witness = minimumStates(plain.map((w, i) => [w, cipher[i]]));
    assert(witness.minStates <= 29);
    positive = { positions: plain.length, originalLengthMatch: true,
      stateCount: 29, exactDecoded: plain.length, observedMinStates: witness.minStates };
  }
}
assert(summaries.every(x => x.atMost29 === 0));
console.log(JSON.stringify({
  class: 'independent word-length-matched native-language controls',
  hypotheses: 'deterministic per-entry-state length-preserving word codebooks; global shared state names',
  originalWords: original.length,
  originalRunes: 12956,
  testedOriginalWordPositions: eligible.length,
  excludedOriginalLengths: [11, 12, 13, 14],
  sourceSeed: '0x43816233',
  positive29StatePlant: positive,
  controls: summaries,
  recoveredUnknownPlaintext: 0,
}, null, 2));
