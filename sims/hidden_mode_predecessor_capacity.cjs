"use strict";
/**
 * Exact book-wide hidden-mode predecessor-S-box capacity test on original LP2.
 *
 * Cipher family C[t] = S[mode[t]][C[t-1]][P[t]], t>0 within each page,
 * where each of the M book-wide S-box rows is a 29-symbol permutation and
 * mode[t] may be chosen adversarially. Each page initial is unconstrained.
 * For a fixed plaintext symbol, each previous ciphertext rune permits at
 * most M distinct ciphertext successors. Hence the sharp original-input
 * capacity is 55 + sum_x (M largest counts in row n[x,*]).
 *
 * A word-length-matched solved-Cicada GP source provides a conditional
 * language-register falsification with a rigorous Chernoff upper tail.
 * Positive original-cipher witness and planted authentic-source inverse
 * test the mathematics without implying any recovered unknown plaintext.
 *
 * Run: node sims/hidden_mode_predecessor_capacity.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {createHash} = require("node:crypto");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");

const root = path.resolve(__dirname, "..");
const load = relative => fs.readFileSync(path.join(root, relative), "utf8");
const rawCorpus = load("resources/liber-primus/lp2-corpus.json");
const corpus = JSON.parse(rawCorpus);
const pages = corpus.pages.filter(p => p.status === "unsolved" && p.indices.length)
  .map(p => p.indices);
const pageLengths = pages.map(p => p.length);
const printedLengths = parseSharedCorpus().words.map(w => w.length);
const N = pageLengths.reduce((a, b) => a + b, 0);
assert.equal(pages.length, 55);
assert.equal(N, 12956);
assert.equal(printedLengths.length, 2896);
assert.equal(printedLengths.reduce((a, b) => a + b), N);
const E = corpus.translit.indexOf("E");
assert.equal(E, 18);

/** @param {number} seed @returns {() => number} */
function rng(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

/** @param {number[][]} book */
function transitionCounts(book) {
  const rows = Array.from({length: 29}, () => Array(29).fill(0));
  for (const page of book) for (let i = 1; i < page.length; i++)
    rows[page[i - 1]][page[i]]++;
  return rows;
}

/**
 * Exact maximum occurrences of any specified plaintext rune across all
 * M book-wide predecessor-conditioned permutations and any mode path.
 * @param {number[][]} rows
 * @param {number} modes
 * @param {number} initialCount
 */
function capacity(rows, modes, initialCount) {
  assert.ok(Number.isInteger(modes) && modes >= 1 && modes <= 29);
  return initialCount + rows.reduce((sum, row) =>
    sum + row.slice().sort((a, b) => b - a)
      .slice(0, modes).reduce((a, b) => a + b, 0), 0);
}

/** Exact reusable witness: construct S-box rows, modes and plaintext. */
function originalWitness(book, modes, target) {
  const counts = transitionCounts(book);
  const forward = Array.from({length: modes}, () =>
    Array.from({length: 29}, () => Array(29).fill(-1)));
  const inverse = Array.from({length: modes}, () =>
    Array.from({length: 29}, () => Array(29).fill(-1)));
  const favoured = Array.from({length: 29}, () => []);
  for (let previous = 0; previous < 29; previous++) {
    const order = Array.from({length: 29}, (_, i) => i)
      .sort((a, b) => counts[previous][b] - counts[previous][a] || a - b);
    favoured[previous] = order.slice(0, modes);
    for (let mode = 0; mode < modes; mode++) {
      const top = order[mode];
      forward[mode][previous][target] = top;
      inverse[mode][previous][top] = target;
      let plain = 0;
      for (const cipher of Array.from({length: 29}, (_, i) => i)) {
        if (cipher === top) continue;
        while (plain === target) plain++;
        forward[mode][previous][plain] = cipher;
        inverse[mode][previous][cipher] = plain;
        plain++;
      }
    }
  }
  const plaintext = [], chosenModes = [];
  let count = 0;
  for (const page of book) {
    const decoded = [target], modesHere = [0];
    count++;
    for (let i = 1; i < page.length; i++) {
      const previous = page[i - 1], current = page[i];
      const mode = Math.max(0, favoured[previous].indexOf(current));
      const plain = inverse[mode][previous][current];
      decoded.push(plain);
      modesHere.push(mode);
      if (plain === target) count++;
      assert.equal(forward[mode][previous][plain], current);
    }
    plaintext.push(decoded);
    chosenModes.push(modesHere);
  }
  assert.equal(count, capacity(counts, modes, book.length));
  return {count, plaintext, chosenModes, forward, inverse};
}

/** Author-native solved GP words; identical normalization to EA source tests. */
function nativeWords() {
  const lines = load("resources/liber-primus/lp1-plaintext-reference.txt")
    .split(/\r?\n/u).filter(line => {
      const s = line.trim();
      return !s.startsWith("#") && !s.startsWith("[") &&
        !/^[0-9a-f]{25,}$/iu.test(s);
    });
  const token = new Map(corpus.translit.map((s, i) => [s, i]));
  const words = lines.join(" ").match(/[A-Za-z]+/gu) || [];
  return words.map(raw => {
    const s = raw.toUpperCase().replace(/QU/g, "CW")
      .replace(/V/g, "U").replace(/K/g, "C").replace(/Z/g, "S");
    const encoded = [];
    for (let i = 0; i < s.length;) {
      const pair = token.get(s.slice(i, i + 2));
      if (pair !== undefined) {
        encoded.push(pair); i += 2;
      } else {
        const single = token.get(s[i]);
        assert.notEqual(single, undefined);
        encoded.push(single); i++;
      }
    }
    return encoded;
  }).filter(w => w.length);
}

function sourceModel() {
  const words = nativeWords();
  assert.equal(words.length, 796);
  const buckets = new Map();
  for (const w of words) {
    if (!buckets.has(w.length)) buckets.set(w.length, []);
    buckets.get(w.length).push(w);
  }
  const lengthCounts = new Map();
  for (const n of printedLengths)
    lengthCounts.set(n, (lengthCounts.get(n) || 0) + 1);
  let mean = 0, variance = 0;
  for (const [n, draws] of lengthCounts) {
    const pool = buckets.get(n);
    assert.ok(pool && pool.length);
    const occurrences = pool.map(w => w.filter(x => x === E).length);
    const mu = occurrences.reduce((a, b) => a + b, 0) / pool.length;
    const v = occurrences.reduce((a, b) => a + (b - mu) ** 2, 0) / pool.length;
    mean += draws * mu;
    variance += draws * v;
  }
  assert.equal(words.flat().filter(x => x === 28).length, 21);
  return {words, buckets, lengthCounts, mean, sd: Math.sqrt(variance)};
}

/**
 * Pr(native-E <= cutoff) <= inf(t<0) exp(log E[e^(tX)] - t*cutoff).
 * Independent uniformly sampled native words with exact printed word lengths.
 * @param {ReturnType<typeof sourceModel>} model
 * @param {number} cutoff
 */
function chernoffLowerTail(model, cutoff) {
  const loss = t => {
    let sum = -t * cutoff;
    for (const [length, draws] of model.lengthCounts) {
      const pool = model.buckets.get(length);
      const avg = pool.reduce((acc, w) =>
        acc + Math.exp(t * w.filter(x => x === E).length), 0) / pool.length;
      sum += draws * Math.log(avg);
    }
    return sum;
  };
  let lo = -2, hi = 0;
  for (let i = 0; i < 100; i++) {
    const left = lo + (hi - lo) / 3;
    const right = hi - (hi - lo) / 3;
    if (loss(left) < loss(right)) hi = right;
    else lo = left;
  }
  const tilt = (lo + hi) / 2;
  return {tilt, upperBound: Math.exp(loss(tilt))};
}

/** Source-native two-mode encrypt/decrypt/reencrypt positive control. */
function nativePlant(model) {
  const random = rng(0x22023301);
  const plain = [];
  for (const length of printedLengths) {
    const bucket = model.buckets.get(length);
    plain.push(...bucket[random() % bucket.length]);
  }
  assert.equal(plain.length, N);
  const forward = Array.from({length: 2}, () =>
    Array.from({length: 29}, () => {
      const row = Array.from({length: 29}, (_, i) => i);
      for (let i = 28; i > 0; i--) {
        const j = random() % (i + 1);
        [row[i], row[j]] = [row[j], row[i]];
      }
      return row;
    }));
  const inverse = forward.map(mode => mode.map(row => {
    const inverted = Array(29).fill(-1);
    for (let i = 0; i < 29; i++) inverted[row[i]] = i;
    return inverted;
  }));
  const cipher = [], decoded = [];
  const modes = [];
  let offset = 0;
  for (const len of pageLengths) {
    const c = [plain[offset]], p = [plain[offset]], state = [0];
    for (let i = 1; i < len; i++) {
      const mode = random() % 2, prev = c[i - 1];
      const v = forward[mode][prev][plain[offset + i]];
      c.push(v);
      p.push(inverse[mode][prev][v]);
      state.push(mode);
    }
    cipher.push(c); decoded.push(p); modes.push(state);
    offset += len;
  }
  assert.deepEqual(decoded.flat(), plain);
  for (let j = 0; j < cipher.length; j++) for (let i = 1; i < cipher[j].length; i++)
    assert.equal(forward[modes[j][i]][cipher[j][i - 1]][decoded[j][i]], cipher[j][i]);
  const eCount = plain.filter(x => x === E).length;
  const cap = capacity(transitionCounts(cipher), 2, 55);
  assert.ok(cap >= eCount);
  return {sourceE: eCount, twoModeCapacity: cap, roundTrip: N};
}

function main() {
  const rows = transitionCounts(pages);
  const capacities = [1, 2, 3, 4].map(m => capacity(rows, m, 55));
  assert.deepEqual(capacities, [769, 1414, 2026, 2619]);
  const witness = originalWitness(pages, 2, E);
  assert.equal(witness.count, 1414);
  const source = sourceModel();
  const tail = chernoffLowerTail(source, capacities[1]);
  const positive = nativePlant(source);
  return {
    claim: "Conditional two-hidden-mode global predecessor-S-box exclusion; no LP2 plaintext recovered",
    sourceSha256: createHash("sha256").update(rawCorpus).digest("hex"),
    original: {pages: 55, runes: N, transitions: N - 55,
      capacitiesByModes: capacities, tightTwoModeWitnessE: witness.count,
      confirmedForwardReencryption: N},
    nativeSolvedSource: {wordTypes: source.words.length,
      lengthMatchedDraws: printedLengths.length,
      expectedE: source.mean, sdE: source.sd,
      ECeiling: capacities[1],
      lowerTailChernoff: tail},
    positiveControl: positive,
    sparseOverrides: {baseOneModeMaxE: capacities[0],
      requiredOverridesAtSourceMean: Math.ceil(source.mean - capacities[0]),
      sourceMeaning: "Override must be genuinely different from book-wide base bijective row"},
    scope: "Book-wide M static predecessor-rune bijections and arbitrary hidden mode selection; page heads unconstrained. Page-specific rows, longer state, extra transforms, or atypical GP source can evade."
  };
}
if (require.main === module) console.log(JSON.stringify(main(), null, 2));
module.exports = {transitionCounts, capacity, originalWitness, nativeWords,
  sourceModel, chernoffLowerTail, nativePlant, main};
