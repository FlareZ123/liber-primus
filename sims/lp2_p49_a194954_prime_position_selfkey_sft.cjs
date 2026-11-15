'use strict';

/**
 * A194954 prime-position self-key test for the original LP2 p49 caption.
 *
 * Hypothesis: use the 11 A194954 terms as one-based or zero-based positions
 * in p49's 66-rune fragment, extract those 11 GP29 symbols as a repeating
 * key, and apply direct additive GP29 decoding. Since 66 = 6*11, this gives
 * six exact periods on p49. The 138-rune pre-table and 170-rune post-table
 * complete sentences are the source-fixed train/holdout pair.
 *
 * This is a bounded negative, not a claim that A194954 is authenticated or
 * that all direction/index uses of the sequence have been tested.
 *
 * Run: node sims/lp2_p49_a194954_prime_position_selfkey_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const original = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const printed = read('resources/liber-primus/lp2-transcription.txt');
const spelling = read('resources/control/english_wordfreq_textblob.txt');
const runeMap = new Map(original.runes.map((r, i) => [r, i]));
const tokens = original.translit.map((token, i) => ({ token, i }))
  .sort((a, b) => b.token.length - a.token.length);

function encodeWord(word) {
  const normalized = word.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/K/g, 'C').replace(/Z/g, 'S')
    .replace(/ING/g, 'NG').replace(/IO/g, 'IA');
  const result = [];
  for (let i = 0; i < normalized.length;) {
    const item = tokens.find(({ token }) => normalized.startsWith(token, i));
    if (!item) return null;
    result.push(item.i);
    i += item.token.length;
  }
  return result.join(',');
}

const lex = new Map();
for (const line of spelling.match(/^[a-z]+\s+\d+$/gm) || []) {
  const [word, frequency] = line.split(/\s+/u);
  const encoded = encodeWord(word);
  if (encoded !== null) lex.set(encoded, (lex.get(encoded) || 0) + Number(frequency));
}
assert.equal(lex.size, 29058);
const lexicalScores = new Map([...lex.entries()]
  .map(([key, frequency]) => [key, Math.log1p(frequency)]));

function words(text) {
  return (text.replace(/\/\s*/gu, '').match(/[\u16A0-\u16FF]+/gu) || [])
    .map((word) => [...word].map((rune) => {
      const index = runeMap.get(rune);
      assert.notEqual(index, undefined);
      return index;
    }));
}

const parts = printed.split(/^\s*%\s*$/m);
const pre = words(parts[48].slice(parts[48].lastIndexOf('.') + 1) + parts[49]);
const post = words(parts[50] + parts[51].slice(0, parts[51].indexOf('.') + 1));
const page = (n) => original.pages.find((x) => x.page === n).indices;
assert.deepEqual(pre.flat(), page(48).slice(-72).concat(page(49)));
assert.deepEqual(post.flat(), page(51).concat(page(52).slice(0, 78)));
assert.equal(pre.length, 33);
assert.equal(pre.flat().length, 138);
assert.equal(post.length, 40);
assert.equal(post.flat().length, 170);
assert.equal(page(49).length, 66);
assert.equal(page(49).length, 6 * 11);

/* The 11 observed 2014 whitespace values equal the first 11 A194954 terms. */
const primePositions = [2, 3, 5, 7, 11, 13, 17, 23, 29, 31, 37];
const mod29 = (n) => ((n % 29) + 29) % 29;

/*
 * Natural, fixed clock models. The key origin is either p49's first rune or
 * the complete pre-table sentence. The 256-cell table is either consuming or
 * nonconsuming; a separate post-sentence reset is also included.
 *
 * p49-page origin: p48's 72-rune prefix gives pre phase 5; after p49's 66
 * runes the p51 phase is 0 (skip table) or 3 (consume 256 cells).
 * sentence origin: pre phase 0; p51 phase is 6 (skip) or 9 (consume).
 */
const models = [
  { name: 'page-origin/table-skip', prePhase: 5, postPhase: 0 },
  { name: 'page-origin/table-consume', prePhase: 5, postPhase: 3 },
  { name: 'sentence-origin/table-skip', prePhase: 0, postPhase: 6 },
  { name: 'sentence-origin/table-consume', prePhase: 0, postPhase: 9 },
  { name: 'independent-sentence-reset', prePhase: 0, postPhase: 0 }
];

function decodeWords(sourceWords, key, phase, sign) {
  let offset = phase;
  let score = 0;
  const matched = [];
  const decoded = [];
  for (const cipherWord of sourceWords) {
    const plainWord = cipherWord.map((value, i) =>
      mod29(value + sign * key[(offset + i) % 11]));
    offset += cipherWord.length;
    const encoded = plainWord.join(',');
    const frequency = lex.get(encoded);
    if (frequency === undefined) score -= 8;
    else {
      matched.push({
        word: plainWord.map((index) => original.translit[index]).join(''),
        frequency
      });
      score += Math.log1p(frequency);
    }
    decoded.push(plainWord.map((index) => original.translit[index]).join(''));
  }
  return { matched, score, decoded };
}

function indexOfCoincidence(values) {
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) || 0) + 1);
  const n = values.length;
  let numerator = 0;
  for (const count of counts.values()) numerator += count * (count - 1);
  return numerator / (n * (n - 1));
}

const results = [];
for (const base of [0, 1]) {
  const key = primePositions.map((position) => page(49)[position - base]);
  assert.equal(key.length, 11);
  for (const sign of [1, -1]) {
    for (const model of models) {
      const before = decodeWords(pre, key, model.prePhase, sign);
      const after = decodeWords(post, key, model.postPhase, sign);
      results.push({
        base, sign, model: model.name, key,
        pre: before, post: after,
        preIoC: indexOfCoincidence(pre.flat().map((x, i) =>
          mod29(x + sign * key[(i + model.prePhase) % 11]))),
        postIoC: indexOfCoincidence(post.flat().map((x, i) =>
          mod29(x + sign * key[(i + model.postPhase) % 11])))
      });
    }
  }
}

const bestPre = [...results].sort((a, b) => b.pre.score - a.pre.score)[0];
const bestPost = [...results].sort((a, b) => b.post.score - a.post.score)[0];
const maxPreMatches = Math.max(...results.map((x) => x.pre.matched.length));
const maxPostMatches = Math.max(...results.map((x) => x.post.matched.length));
const maxPreIoC = Math.max(...results.map((x) => x.preIoC));
const maxPostIoC = Math.max(...results.map((x) => x.postIoC));

assert.equal(results.length, 20);
assert.equal(maxPreMatches, 3);
assert.equal(maxPostMatches, 6);
assert.ok(Math.abs(bestPre.pre.score - (-228.86022735367067)) < 1e-9);
assert.ok(Math.abs(bestPost.post.score - (-247.80359644142723)) < 1e-9);

/* Verify the modular inverse on an independent planted 308-symbol control. */
const plantSource = page(57);
const plant = Array.from({ length: 308 }, (_, i) => plantSource[i % plantSource.length]);
for (const result of results) {
  for (const phase of [0, 3, 5, 6, 9]) {
    const encrypted = plant.map((value, i) =>
      mod29(value - result.sign * result.key[(i + phase) % 11]));
    const recovered = encrypted.map((value, i) =>
      mod29(value + result.sign * result.key[(i + phase) % 11]));
    assert.deepEqual(recovered, plant);
  }
}

const report = {
  source: {
    a194954ObservedValues: primePositions,
    authentication: 'The 2014 archived clear-signed message does not authenticate most trailing-space runs; see im-results/lp2-p49-a194954-whitespace-key-gate.md.',
    p49Runes: 66,
    period: 11,
    exactPeriodsOnP49: 6,
    completeBefore: { runes: 138, words: 33 },
    completeAfter: { runes: 170, words: 40 }
  },
  tested: {
    keyIndexing: ['zero-based', 'one-based'],
    additiveSigns: ['C+K mod29', 'C-K mod29'],
    clockModels: models.map((model) => model.name),
    totalFixedInverses: results.length,
    arbitraryPhaseSearch: false,
    arbitraryKeyFitting: false
  },
  bestPre: {
    keyIndexing: bestPre.base === 0 ? 'zero-based' : 'one-based',
    sign: bestPre.sign,
    clock: bestPre.model,
    key: bestPre.key,
    exactDictionaryWords: bestPre.pre.matched,
    matchedOf33: bestPre.pre.matched.length,
    score: bestPre.pre.score,
    decodedWords: bestPre.pre.decoded
  },
  bestPost: {
    keyIndexing: bestPost.base === 0 ? 'zero-based' : 'one-based',
    sign: bestPost.sign,
    clock: bestPost.model,
    key: bestPost.key,
    exactDictionaryWords: bestPost.post.matched,
    matchedOf40: bestPost.post.matched.length,
    score: bestPost.post.score,
    decodedWords: bestPost.post.decoded
  },
  maxima: {
    preMatches: maxPreMatches,
    postMatches: maxPostMatches,
    preIoC: maxPreIoC,
    postIoC: maxPostIoC
  },
  conclusion: 'The direct 11-symbol prime-position self-key does not recover either original complete sentence. The 2014 whitespace clue remains unauthenticated and this result does not exclude a distinct source-selected direction/index use.'
};
console.log(JSON.stringify(report, null, 2));
