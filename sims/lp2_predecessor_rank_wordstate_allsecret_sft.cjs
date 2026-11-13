'use strict';

/**
 * An original-cipher SFT for predecessor-excluding GP29 transport with
 * arbitrary secret 28-rank alphabets keyed by page/word-length/word-position.
 * No source plaintext, decoder key or destination is asserted.
 *
 * Run from Windows Node.js 22:
 *   node sims/lp2_predecessor_rank_wordstate_allsecret_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
/** @param {string} name @returns {string} */
const read = (name) => fs.readFileSync(path.join(ROOT, name), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const glyphIndex = new Map(corpus.runes.map((rune, i) => [rune, i]));
const originalPages = corpus.pages.slice(0, 56);
const original = originalPages.flatMap((p) => p.indices);
const written = read('resources/liber-primus/lp2-transcription.txt')
  .split('%').slice(0, 55).join('').replace(/[\r\n/]/g, '');
const words = written.split(/[-.&$§\s]+/u)
  .map((s) => [...s].filter((r) => glyphIndex.has(r))
    .map((r) => glyphIndex.get(r)))
  .filter((w) => w.length !== 0);
assert.equal(words.length, 2896);
assert.equal(original.length, 12956);
assert.equal(words.reduce((sum, w) => sum + w.length, 0), original.length);
assert.deepEqual(words.flat(), original);

const page = new Uint8Array(original.length);
const pageFirst = new Uint8Array(original.length);
let cursor = 0;
for (const item of originalPages) {
  if (item.indices.length === 0) continue;
  pageFirst[cursor] = 1;
  for (let i = 0; i < item.indices.length; i += 1) {
    page[cursor + i] = item.page;
  }
  cursor += item.indices.length;
}
assert.equal(cursor, original.length);

/** @typedef {{word:number, length:number, pos:number, page:number, rank:number}} Site */
/** @type {Site[]} */
const sites = [];
cursor = 0;
for (let wi = 0; wi < words.length; wi += 1) {
  const word = words[wi];
  for (let j = 0; j < word.length; j += 1) {
    const glyph = original[cursor];
    const prev = cursor === 0 ? -1 : original[cursor - 1];
    const eligible = pageFirst[cursor] === 0 && glyph !== prev;
    sites.push({
      word: wi, length: word.length, pos: j, page: page[cursor],
      rank: eligible ? glyph - Number(glyph > prev) : -1,
    });
    cursor += 1;
  }
}
assert.equal(sites.length, original.length);
assert.equal(sites.filter((s) => s.rank >= 0).length, 12815);
const keys = {
  length: (s) => String(s.length),
  lengthPosition: (s) => s.length + ':' + s.pos,
  pageLengthPosition: (s) => s.page + ':' + s.length + ':' + s.pos,
};

/**
 * Count exact ordered equal-symbol pairs in every source-fixed key epoch.
 * The plaintext/ciphertext symbol equality is invariant to all secret
 * per-epoch bijections, regardless of the chosen 28-letter ordering.
 * @param {number[]} symbols
 * @param {(site:Site)=>string} stateKey
 * @returns {{equal:number,pairs:number,rate:number,cap:number,buckets:number}}
 */
function score(symbols, stateKey) {
  assert.equal(symbols.length, sites.length);
  /** @type {Map<string, Uint32Array>} */
  const buckets = new Map();
  for (let i = 0; i < sites.length; i += 1) {
    if (sites[i].rank < 0) continue;
    const key = stateKey(sites[i]);
    let freq = buckets.get(key);
    if (!freq) {
      freq = new Uint32Array(29);
      buckets.set(key, freq);
    }
    freq[symbols[i]] += 1;
  }
  let equal = 0;
  let pairs = 0;
  let cap = 0;
  for (const counts of buckets.values()) {
    let n = 0;
    let max = 0;
    for (const c of counts) {
      equal += c * (c - 1);
      n += c;
      max = Math.max(max, c);
    }
    pairs += n * (n - 1);
    cap += max;
  }
  return { equal, pairs, rate: equal / pairs, cap, buckets: buckets.size };
}
const originalRanks = sites.map((s) => s.rank);
const observed = Object.fromEntries(Object.entries(keys)
  .map(([name, key]) => [name, score(originalRanks, key)]));
assert.deepEqual(
  [observed.length.equal, observed.length.pairs, observed.length.cap,
    observed.lengthPosition.equal, observed.lengthPosition.pairs,
    observed.lengthPosition.cap, observed.pageLengthPosition.equal,
    observed.pageLengthPosition.pairs, observed.pageLengthPosition.cap],
  [675130, 18903834, 604, 157450, 4415902, 841, 2900, 83190, 3884],
);
assert.equal(observed.pageLengthPosition.buckets, 3017);

// Historical source-calibrated ING and IO runic contractions; J is folded
// to I only in the positive 28-letter transport experiment below.
const digraph = { TH: 2, NG: 21, EO: 12, OE: 22, AE: 25, IA: 27, EA: 28,
  ING: 21, IO: 27 };
const single = { A: 24, B: 17, C: 5, D: 23, E: 18, F: 0, G: 6, H: 8,
  I: 10, J: 10, K: 5, L: 20, M: 19, N: 9, O: 3, P: 13, Q: 5,
  R: 4, S: 15, T: 16, U: 1, V: 1, W: 7, X: 14, Y: 26, Z: 15 };
/** @param {string} word @returns {number[]} */
function encodeEnglish(word) {
  const output = [];
  for (let i = 0; i < word.length; i += 1) {
    const three = digraph[word.slice(i, i + 3)];
    if (three !== undefined) {
      output.push(three);
      i += 2;
      continue;
    }
    const two = digraph[word.slice(i, i + 2)];
    if (two !== undefined) {
      output.push(two);
      i += 1;
    } else {
      output.push(single[word[i]]);
    }
  }
  return output;
}
/** @param {string} file @returns {Map<number, number[][]>} */
function controlWords(file) {
  const letters = read(file).toUpperCase().match(/[A-Z]+/g);
  /** @type {Map<number, number[][]>} */
  const byLength = new Map();
  for (const text of letters) {
    const gp = encodeEnglish(text);
    const pool = byLength.get(gp.length) || [];
    pool.push(gp);
    byLength.set(gp.length, pool);
  }
  for (const word of words) assert.ok(byLength.has(word.length));
  return byLength;
}
/** @param {number} seed */
function randomizer(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}
/** @param {Map<number,number[][]>} pools @param {()=>number} random */
function plantWords(pools, random) {
  return words.map((w) => {
    const pool = pools.get(w.length);
    return pool[random() % pool.length];
  });
}
/** @param {number[][]} plant */
function flattenPlant(plant) {
  return sites.map((s) => plant[s.word][s.pos]);
}
const references = [
  ['Shakespeare', 'resources/control/shakespeare_first300k.txt'],
  ['Gibran', 'resources/control/gibran_prophet_58585.txt'],
  ['Emerson', 'resources/control/emerson_essays_2944.txt'],
];
const findings = [];
for (let i = 0; i < references.length; i += 1) {
  const [author, file] = references[i];
  const pools = controlWords(file);
  const random = randomizer(0x330100 + i);
  const lows = Object.fromEntries(Object.keys(keys).map((k) => [k, Infinity]));
  for (let n = 0; n < 100; n += 1) {
    const sample = flattenPlant(plantWords(pools, random));
    for (const [id, key] of Object.entries(keys)) {
      const test = score(sample, key);
      lows[id] = Math.min(lows[id], test.rate);
    }
  }
  for (const [id, low] of Object.entries(lows)) {
    assert.ok(low > observed[id].rate * 1.7, author + ' ' + id);
  }
  findings.push({ author, minRates: lows });
}

// Fully reversible 28-rank plant: page first glyphs are public IVs,
// and source-original repeat sites are openly identified marker exceptions.
// Every other planted English GP glyph is transported by a newly random
// 28-symbol bijection for its page × printed-word-length × position key.
const shakespeare = controlWords(references[0][1]);
const english = flattenPlant(plantWords(shakespeare, randomizer(0x38198401)));
const allowed = Array.from({ length: 29 }, (_, i) => i).filter((i) => i !== 11);
const plaintext = new Array(original.length);
const cipher = new Array(original.length);
const reversed = new Array(original.length);
const plantedRanks = new Array(original.length);
const secret = new Map();
const random = randomizer(0x38011984);
let recovered = 0;
for (let i = 0; i < sites.length; i += 1) {
  const s = sites[i];
  if (pageFirst[i]) {
    cipher[i] = original[i];
    plaintext[i] = 11;
    reversed[i] = 11;
    plantedRanks[i] = -1;
    continue;
  }
  if (s.rank < 0) {
    cipher[i] = cipher[i - 1];
    plaintext[i] = 11;
    reversed[i] = 11;
    plantedRanks[i] = -1;
    continue;
  }
  const id = keys.pageLengthPosition(s);
  let permutation = secret.get(id);
  if (!permutation) {
    permutation = Array.from({ length: 28 }, (_, j) => j);
    for (let j = 27; j > 0; j -= 1) {
      const k = random() % (j + 1);
      [permutation[j], permutation[k]] = [permutation[k], permutation[j]];
    }
    secret.set(id, permutation);
  }
  const index = allowed.indexOf(english[i]);
  assert.ok(index >= 0);
  const codedRank = permutation[index];
  const prev = cipher[i - 1];
  cipher[i] = codedRank + Number(codedRank >= prev);
  assert.notEqual(cipher[i], prev);
  const returnedRank = cipher[i] - Number(cipher[i] > prev);
  assert.equal(returnedRank, codedRank);
  plantedRanks[i] = returnedRank;
  reversed[i] = allowed[permutation.indexOf(returnedRank)];
  plaintext[i] = english[i];
  assert.equal(reversed[i], plaintext[i]);
  recovered += 1;
}
assert.deepEqual(reversed, plaintext);
assert.equal(recovered, 12815);
assert.deepEqual(score(plantedRanks, keys.pageLengthPosition),
  score(plaintext, keys.pageLengthPosition));

console.log(JSON.stringify({
  source: { pages: 55, words: words.length, runes: original.length,
    rankSites: recovered, unconstrained: original.length - recovered },
  observed, englishControls: findings,
  positivePlant: { decryptedRankSites: recovered, fullRoundtrip: true,
    equalPairs: score(plantedRanks, keys.pageLengthPosition).equal },
}, null, 2));
