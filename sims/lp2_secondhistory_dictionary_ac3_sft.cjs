"use strict";

/**
 * Finite native-English dictionary feasibility for all-secret two-cipher-rune
 * feedback: C[i] = S[C[i-2],C[i-1]][P[i]] with 841 unknown GP29 bijections.
 *
 * This is a NECESSARY constraint, not a decipherment: each repeated observable
 * ciphertext triple must represent the same plaintext rune, while different
 * successor glyphs in one predecessor-state row require distinct plaintext.
 * The result tests all 29,157 source-native dictionary words against every
 * printed original word boundary without fitting any source plaintext.
 *
 * Single runnable test (Node 22):
 *   node sims/lp2_secondhistory_dictionary_ac3_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {encodeSourceNativeGP} =
  require("./lp2_native_gp_source_orthography_sft.cjs");

const root = path.join(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const pattern = new RegExp("[" + corpus.runes.join("") + "]+", "gu");
const text = read("resources/liber-primus/lp2-transcription.txt")
  .split("%").slice(0, 55).join("")
  .replace(/\/\r?\n/g, "").replace(/[\r\n]/g, "");
const ciphertextWords = [...text.matchAll(pattern)].map(match =>
  Array.from(match[0], x => runeIndex.get(x)));
const ciphertext = corpus.pages.slice(0, 56).flatMap(p => p.indices);
assert.equal(ciphertextWords.length, 2896);
assert.equal(ciphertext.length, 12956);
assert.deepEqual(ciphertextWords.flat(), ciphertext);

const lexicon = Array.from({length: 32}, () => []);
let dictionaryWords = 0;
for (const line of read("resources/control/english_wordfreq_textblob.txt").split(/\r?\n/)) {
  if (!/^[a-z]+ \d+$/.test(line)) continue;
  const word = line.split(" ")[0];
  const runes = encodeSourceNativeGP(word);
  if (runes.length < 32) lexicon[runes.length].push({word, runes});
  dictionaryWords++;
}
assert.equal(dictionaryWords, 29157);

const pageStarts = new Set();
let n = 0;
for (const p of corpus.pages.slice(0, 56)) {
  pageStarts.add(n);
  n += p.indices.length;
}
assert.equal(n, 12956);

/**
 * Recover all source-visible predecessor rows for the unchanged word lengths.
 * The first two symbols on each physical page are free IVs.
 * @param {number[]} stream
 * @returns {{positions:{id:number,j:number}[],length:number}[]}
 */
function wordRelations(stream) {
  assert.equal(stream.length, ciphertext.length);
  const result = [];
  let cursor = 0;
  for (const original of ciphertextWords) {
    const positions = [];
    for (let j = 0; j < original.length; j++) {
      const i = cursor + j;
      if (i < 2 || pageStarts.has(i) || pageStarts.has(i - 1)) continue;
      positions.push({
        id: (stream[i - 2] * 29 + stream[i - 1]) * 29 + stream[i],
        j
      });
    }
    result.push({positions, length: original.length});
    cursor += original.length;
  }
  assert.equal(cursor, stream.length);
  return result;
}

/** @param {number[]} stream @param {boolean} positive */
function test(stream, positive = false, plaintextWords = null) {
  const words = wordRelations(stream);
  const uses = new Uint16Array(29 ** 3);
  for (const {positions} of words) {
    for (const id of new Set(positions.map(p => p.id))) uses[id]++;
  }
  const domains = words.map(({positions, length}) =>
    lexicon[length].filter(item => {
      const same = new Map();
      for (const {id, j} of positions) {
        const current = same.get(id);
        if (current !== undefined && current !== item.runes[j]) return false;
        same.set(id, item.runes[j]);
      }
      return true;
    }));
  assert(domains.every(d => d.length), "All source words have native candidates");

  const initiallyAllowed = domains.reduce((s, d) => s + d.length, 0);
  const fullMask = (1 << 29) - 1;
  let iterations = 0;
  let removed = 0;
  let supports = [];
  while (true) {
    iterations++;
    supports = Array.from({length: 29 ** 3},
      (_, id) => uses[id] > 1 ? fullMask : 0);
    for (let wi = 0; wi < words.length; wi++) {
      const cells = words[wi].positions.filter(({id}) => uses[id] > 1);
      if (!cells.length) continue;
      const local = new Map(cells.map(({id}) => [id, 0]));
      for (const item of domains[wi])
        for (const {id, j} of cells)
          local.set(id, local.get(id) | (1 << item.runes[j]));
      for (const [id, mask] of local) supports[id] &= mask;
    }
    let roundRemoved = 0;
    for (let wi = 0; wi < words.length; wi++) {
      const cells = words[wi].positions.filter(({id}) => uses[id] > 1);
      if (!cells.length) continue;
      const old = domains[wi];
      domains[wi] = old.filter(item =>
        cells.every(({id, j}) => (supports[id] & (1 << item.runes[j])) !== 0));
      roundRemoved += old.length - domains[wi].length;
      assert(domains[wi].length,
        "Global dictionary equality contradiction in word " + wi);
    }
    removed += roundRemoved;
    if (!roundRemoved) break;
    assert(iterations < 20, "Arc propagation convergence");
  }

  // A single row in the secret 29-symbol substitution must admit a
  // one-to-one assignment from all its observed output glyphs to GP runes.
  function hasMatching(masks) {
    const assigned = Array(29).fill(-1);
    function augment(i, seen) {
      for (let rune = 0; rune < 29; rune++) {
        if (!(masks[i] & (1 << rune)) || seen[rune]) continue;
        seen[rune] = true;
        if (assigned[rune] < 0 || augment(assigned[rune], seen)) {
          assigned[rune] = i;
          return true;
        }
      }
      return false;
    }
    return masks.every((_, i) => augment(i, Array(29).fill(false)));
  }

  let states = 0;
  let observedTokens = 0;
  let matchingRows = 0;
  let forcedSingletons = 0;
  for (let state = 0; state < 29 ** 2; state++) {
    const ids = [];
    for (let output = 0; output < 29; output++) {
      const id = state * 29 + output;
      if (uses[id]) ids.push(id);
    }
    if (!ids.length) continue;
    states++;
    observedTokens += ids.length;
    const masks = ids.map(id => supports[id] || fullMask);
    forcedSingletons += masks.filter(mask => (mask & (mask - 1)) === 0).length;
    if (hasMatching(masks)) matchingRows++;
  }
  assert.equal(states, matchingRows, "At least one row violates injectivity");

  if (positive) {
    assert(plaintextWords !== null && plaintextWords.length === words.length);
    for (let wi = 0; wi < words.length; wi++)
      assert(domains[wi].some(item => item.word === plaintextWords[wi]),
        "Cipher-positive planted original dictionary item survives AC3");
  }

  return {
    originalPrintedWords: words.length,
    originalRunes: stream.length,
    lexicon: dictionaryWords,
    distinctRepeatedTripleVariables: Array.from(uses).filter(x => x > 1).length,
    observedTripleVariables: observedTokens,
    stateRows: states,
    matchingRows,
    forcedSingletons,
    initialCandidateAssignments: initiallyAllowed,
    remainingCandidateAssignments: domains.reduce((s, d) => s + d.length, 0),
    removedCandidateAssignments: removed,
    arcConsistencyPasses: iterations,
    originalCipherIndependentPlaintextRecovered: false
  };
}

const original = test(ciphertext);
assert.deepEqual([
  original.distinctRepeatedTripleVariables,
  original.observedTripleVariables,
  original.stateRows, original.matchingRows,
  original.forcedSingletons, original.initialCandidateAssignments,
  original.remainingCandidateAssignments, original.arcConsistencyPasses
], [2473, 9886, 840, 840, 0, 6236512, 6114176, 3]);

// Plant exactly one source-native dictionary word per original word slot.
// Encrypt with 841 genuinely invertible, fixed predecessor-pair GP29 rows.
// At each original physical page start the first two runes are copied IVs.
const selected = ciphertextWords.map((word, i) => {
  const choices = lexicon[word.length];
  return choices[(i * 131 + 17) % choices.length];
});
const plain = selected.flatMap(item => item.runes);
assert.equal(plain.length, 12956);
const synthetic = plain.slice();
let inverseVerified = 0;
for (let i = 0; i < synthetic.length; i++) {
  if (pageStarts.has(i) || pageStarts.has(i - 1)) continue;
  const state = synthetic[i - 2] * 29 + synthetic[i - 1];
  const shift = (13 * state + 9) % 29;
  synthetic[i] = (7 * plain[i] + shift) % 29;
  assert.equal(25 * ((synthetic[i] - shift + 29) % 29) % 29, plain[i]);
  inverseVerified++;
}
assert.equal(inverseVerified, 12846);
const control = test(synthetic, true, selected.map(item => item.word));
console.log(JSON.stringify({
  classification: "All-secret two-history native lexicon test, neither plaintext nor key recovered",
  hypothesis: "C[i]=S[C[i-2],C[i-1]][P[i]], one secret bijection for each observed predecessor pair",
  original, positiveControl: {
    nativeWordLengthMatchedBook: true,
    independentlyReversibleSymbols: inverseVerified,
    ...control
  },
  limitation: "Arc consistency and row matching are necessary, not sufficient, for one globally coherent decoding; this negative-contradiction test does not select historical author intent."
}, null, 2));
