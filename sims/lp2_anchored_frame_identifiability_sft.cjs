"use strict";

/**
 * Single-file test: original LP2 word-frame identifiability with fixed stops,
 * page-carry words, and four authentic apostrophe anchors.
 * Run in Node.js 22 from any working directory.
 * Only reads the repository's pinned source transcript.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const source = fs.readFileSync(
  path.join(__dirname, "..", "resources", "lp2-transcription.txt"), "utf8");
const unknown = source.split("%").slice(0, 55).join("%");
const RUNE = /[\u16a0-\u16ff]/u;

/**
 * Parse authentic printed words. Page and line wraps are non-delimiters.
 * Every non-rune symbol except "-" and wrapping is a fixed hard stop,
 * including visible decimal digits. Carried words retain two page IDs.
 * @param {string} raw
 * @returns {{words:Array<object>,blocks:Array<object>,runeCount:number,pageCount:number}}
 */
function parse(raw) {
  const words = [];
  let page = 0;
  let group = 0;
  let pos = 0;
  let active = null;
  function finish() {
    if (active !== null) {
      words.push({...active, end: pos, length: pos - active.start});
      active = null;
    }
  }
  for (const c of raw) {
    if (RUNE.test(c)) {
      if (active === null) active = {start: pos, startPage: page, group};
      pos++;
      active.endPage = page;
    } else if (c === "%") {
      page++;
    } else if (c === "/" || /\s/u.test(c)) {
      // Page and line wraps do not terminate words.
    } else if (c === "-") {
      finish();
    } else {
      finish();
      group++;
    }
  }
  finish();
  const blocks = [];
  let last = null;
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    if (w.startPage !== w.endPage) {
      last = null; // Fix every word spanning a physical page boundary.
      continue;
    }
    if (last === null || last.group !== w.group ||
        last.page !== w.startPage || last.lastIndex !== i - 1) {
      last = {start: w.start, page: w.startPage,
        group: w.group, ids: [], lastIndex: i};
      blocks.push(last);
    }
    last.ids.push(i);
    last.lastIndex = i;
  }
  return {words, blocks, runeCount: pos, pageCount: page + 1};
}

/** @param {number} n @returns {bigint[]} */
function factorials(n) {
  const out = [1n];
  for (let i = 1; i <= n; i++) out[i] = out[i - 1] * BigInt(i);
  return out;
}

/**
 * Exact distinct orderings of a length multiset, n! / product(count_i!).
 * @param {number[]} ids
 * @param {object[]} words
 * @param {bigint[]} fact
 * @returns {bigint}
 */
function permutations(ids, words, fact) {
  const counts = new Map();
  for (const id of ids) {
    const length = words[id].length;
    counts.set(length, (counts.get(length) || 0) + 1);
  }
  let denominator = 1n;
  for (const count of counts.values()) denominator *= fact[count];
  return fact[ids.length] / denominator;
}

/** @param {bigint} value @returns {number} */
function log2BigInt(value) {
  const bits = value.toString(2);
  const take = Math.min(53, bits.length);
  return Math.log2(Number.parseInt(bits.slice(0, take), 2)) + bits.length - take;
}

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n, k) {
  if (k < 0 || k > n) return 0n;
  const m = Math.min(k, n - k);
  let result = 1n;
  for (let i = 1; i <= m; i++) {
    result = result * BigInt(n - m + i) / BigInt(i);
  }
  return result;
}

/**
 * Exact multiset-permutation probability, evaluated in floating point.
 * Word lengths are shuffled within an immutable punctuation/page block.
 * The apostrophe is at the boundary preceding one final suffix rune.
 * Derivation: condition on which matching-length word occupies the endpoint;
 * the k earlier distinct-token set is uniform among C(n-1,k) subsets.
 * @param {number[]} lengths
 * @param {number} endpoint 1-based boundary offset from block start
 * @param {number} length Exact target word length (3 or 4)
 * @returns {number}
 */
function apostropheMatchProbability(lengths, endpoint, length) {
  const n = lengths.length;
  const count = lengths.filter(x => x === length).length;
  if (count === 0 || endpoint < length) return 0;
  const others = lengths.slice();
  others.splice(others.indexOf(length), 1);
  const target = endpoint - length;
  const dp = Array.from({length: n},
    () => Array.from({length: target + 1}, () => 0n));
  dp[0][0] = 1n;
  let seen = 0;
  for (const l of others) {
    seen++;
    for (let k = seen; k >= 1; k--) {
      for (let sum = target; sum >= l; sum--) {
        dp[k][sum] += dp[k - 1][sum - l];
      }
    }
  }
  let sum = 0;
  for (let k = 0; k < n; k++) {
    sum += Number(dp[k][target]) / Number(choose(n - 1, k));
  }
  return count / n * sum;
}

/**
 * Map changed word lengths to absolute source rune boundaries within
 * the original fixed noncarried blocks, retaining all hard stops.
 * @param {{words:Array<object>,blocks:Array<object>}} book
 * @param {number[]} lengths
 * @returns {Map<number, {start:number,end:number}>}
 */
function boundaryMap(book, lengths) {
  const out = new Map();
  for (const block of book.blocks) {
    let pos = block.start;
    for (const id of block.ids) {
      out.set(id, {start: pos, end: pos + lengths[id]});
      pos += lengths[id];
    }
    const last = book.words[block.ids[block.ids.length - 1]];
    assert.equal(pos, last.end, "Hard stop or page boundary moved");
  }
  return out;
}

const book = parse(unknown);
assert.equal(book.pageCount, 55);
assert.equal(book.runeCount, 12956);
assert.equal(book.words.length, 2896);
assert.equal(book.words.filter(w => w.startPage !== w.endPage).length, 32);
assert.equal(book.blocks.reduce((n, b) => n + b.ids.length, 0), 2864);

const sites = [
  {page: 4, tick: 1110, prefix: 3, word: "MXI'W"},
  {page: 21, tick: 5138, prefix: 2, word: "AEO'Y"},
  {page: 35, tick: 8515, prefix: 2, word: "PE'T"},
  {page: 41, tick: 10089, prefix: 3, word: "XLJ'C"}
];
const anchored = new Set();
const siteEvidence = [];
for (const site of sites) {
  const id = book.words.findIndex(w => w.start <= site.tick && site.tick < w.end);
  assert(id >= 0);
  const w = book.words[id];
  assert.equal(w.startPage, site.page);
  assert.equal(w.endPage, site.page);
  assert.equal(w.length, site.prefix + 1);
  assert.equal(w.start, site.tick - site.prefix);
  assert.equal(w.end, site.tick + 1);
  anchored.add(id);
  const block = book.blocks.find(b => b.ids.includes(id));
  assert(block);
  const lengths = block.ids.map(i => book.words[i].length);
  const probability = apostropheMatchProbability(
    lengths, site.tick + 1 - block.start, w.length);
  siteEvidence.push({page: site.page, originalWord: site.word,
    blockWords: lengths.length, sameContractionShapeProbability: probability});
}
assert.deepEqual([...anchored], [242, 1158, 1912, 2265]);

const maxSize = Math.max(...book.blocks.map(b => b.ids.length));
const fact = factorials(maxSize);
let unguarded = 1n;
let guardPreserved = 1n;
const segments = [];
for (const block of book.blocks) {
  unguarded *= permutations(block.ids, book.words, fact);
  let segment = [];
  for (const id of block.ids) {
    if (anchored.has(id)) {
      if (segment.length) segments.push(segment);
      segment = [];
    } else {
      segment.push(id);
    }
  }
  if (segment.length) segments.push(segment);
}
let movable = 0;
let immovable = 0;
for (const ids of segments) {
  const ways = permutations(ids, book.words, fact);
  guardPreserved *= ways;
  if (ways > 1n) movable += ids.length;
  else immovable += ids.length;
}
const bits = log2BigInt(guardPreserved);
assert(Math.abs(bits - 5584.117962312674) < 1e-9);

// Construct a distinct framing while retaining all original rune values,
// hard stops, 32 page carries, and the four complete apostrophe words.
const originalLengths = book.words.map(w => w.length);
const alternativeLengths = originalLengths.slice();
let witness = null;
for (const ids of segments) {
  if (witness) break;
  for (let j = 1; j < ids.length; j++) {
    if (originalLengths[ids[0]] !== originalLengths[ids[j]]) {
      const first = ids[0], second = ids[j];
      [alternativeLengths[first], alternativeLengths[second]] =
        [alternativeLengths[second], alternativeLengths[first]];
      witness = {wordIndices: [first, second],
        lengths: [originalLengths[first], originalLengths[second]]};
      break;
    }
  }
}
assert(witness, "Expected a distinct, key-controlled frame");
const changed = boundaryMap(book, alternativeLengths);
const original = boundaryMap(book, originalLengths);
assert.notDeepEqual(changed.get(witness.wordIndices[0]),
  original.get(witness.wordIndices[0]));
for (const id of anchored) assert.deepEqual(changed.get(id), original.get(id));

// Authentic solved LP2 p57 positive: a known clockwise frame rotation
// is recoverable without inspecting any GP rune values. This proves only
// invertibility when the framing rule is given.
const solved = parse(source.split("%").at(-1));
assert.equal(solved.runeCount, 95);
const clear = solved.words.map(w => w.length);
const framed = clear.slice();
for (const block of solved.blocks) {
  const ids = block.ids;
  if (ids.length > 1) {
    const values = ids.map(i => clear[i]);
    const rotated = [values.at(-1), ...values.slice(0, -1)];
    ids.forEach((id, j) => { framed[id] = rotated[j]; });
  }
}
boundaryMap(solved, framed);
const recovered = framed.slice();
for (const block of solved.blocks) {
  const ids = block.ids;
  if (ids.length > 1) {
    const values = ids.map(i => framed[i]);
    const unrotated = [...values.slice(1), values[0]];
    ids.forEach((id, j) => { recovered[id] = unrotated[j]; });
  }
}
assert.deepEqual(recovered, clear);
boundaryMap(solved, recovered);

const joint = siteEvidence.reduce(
  (p, entry) => p * entry.sameContractionShapeProbability, 1);
assert(Math.abs(joint - 0.0001675642707209625) < 1e-12);

console.log(JSON.stringify({
  type: "source-conditioned-framing-identifiability",
  input: "resources/lp2-transcription.txt",
  unknownRunes: book.runeCount,
  unknownWords: book.words.length,
  pageCarriesPreserved: 32,
  hardStopAndPageBlocks: book.blocks.length,
  apostropheWordsFixed: sites.map(s => s.word),
  unrestrictedWithinBlockLog2Layouts: log2BigInt(unguarded),
  apostropheAnchoredLog2Layouts: bits,
  movableNoncarryWords: movable,
  fixedUnanchoredNoncarryWords: immovable,
  counterexample: witness,
  exactConditionalNull: {
    sites: siteEvidence,
    jointProbability: joint,
    independentBlocks: true
  },
  authenticP57Positive: {runes: solved.runeCount,
    exactBoundaryRecovery: true},
  unknownCipherPlaintextRecovered: false
}, null, 2));
console.log("PASS: fixed source constraints, exact combinatorics, original-frame witness, native positive");
