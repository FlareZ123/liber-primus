"use strict";

/**
 * Exact all-secret-alphabet capacity gate for original LP2 singleton words.
 *
 * Model: every canonical ciphertext word of one rune is one plaintext GP
 * letter, belonging to a predeclared k-symbol vocabulary (A/I when k=2).
 * At each public key phase an arbitrary, unknown *bijective* GP29 alphabet
 * maps plaintext runes to ciphertext runes. Reuse that alphabet for all
 * words in its phase; the phase is the whole-word ordinal within a chosen
 * book, $-section, or physical page scope. No plaintext-frequency
 * estimation, source-key fitting, or ciphertext-generated key is used.
 *
 * Run: node sims/singleton_word_key_capacity.cjs
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const {parseLP2Words} = require("./lp2_word_pages.cjs");

const ROOT = path.resolve(__dirname, "..");
const MOD = 29;
const SOURCE = fs.readFileSync(path.join(ROOT,
  "resources/lp2-transcription.txt"), "utf8");
const CORPUS = JSON.parse(fs.readFileSync(path.join(ROOT,
  "resources/liber-primus/lp2-corpus.json"), "utf8"));
const RUNES = new Map(CORPUS.runes.map((rune, index) => [rune, index]));

/**
 * Preserve complete words across page and printed-line wraps; $ and
 * punctuation close a word. Each complete word is assigned to the page
 * of its first rune. No external English tokenizer is involved.
 * @param {string} raw Canonical 55-rune-bearing-page transcript.
 */
function parseWords(raw) {
  const source = raw.split("%").slice(0, 55).join("%");
  const words = [];
  const ordinals = {
    book: new Map(), section: new Map(), page: new Map()
  };
  let page = 0, section = 0, runes = [], startPage = 0;
  let lastRunePage = 0, startSection = 0, runeCount = 0;

  function finish() {
    if (!runes.length) return;
    const keys = {book: 0, section: startSection, page: startPage};
    const word = {indices: runes, page: startPage,
      endPage: lastRunePage, section: startSection};
    for (const [scope, key] of Object.entries(keys)) {
      const count = ordinals[scope].get(key) || 0;
      word[scope + "Ordinal"] = count;
      ordinals[scope].set(key, count + 1);
    }
    words.push(word);
    runes = [];
  }

  for (const ch of source) {
    if (RUNES.has(ch)) {
      if (!runes.length) {
        startPage = page;
        startSection = section;
      }
      runes.push(RUNES.get(ch));
      lastRunePage = page;
      runeCount++;
    } else if (ch === "%") {
      page++;
    } else if (ch === "/" || /\s/u.test(ch)) {
      // Physical line and page wraps are not word separators.
    } else {
      finish();
      if (ch === "$") section++;
    }
  }
  finish();
  const official = parseLP2Words(raw);
  assert.equal(runeCount, 12956);
  assert.equal(words.length, 2896);
  assert.equal(words.filter(w => w.page !== w.endPage).length, 32);
  assert.equal(page, 54);
  assert.deepEqual(words.map(w => w.indices.length),
    official.words.map(w => w.length));
  assert.deepEqual(words.map(w => w.page),
    official.words.map(w => w.startPage));
  return {words, runeCount, source};
}

/**
 * @param {object} word Word from parseWords
 * @param {"book"|"section"|"page"} scope
 * @param {number} period Positive word-ordinal phase period
 */
function state(word, scope, period) {
  const group = scope === "book" ? 0 : word[scope];
  return String(group) + ":" + (word[scope + "Ordinal"] % period);
}

/**
 * The rowwise top-k sum is an exact maximum over every unknown bijection:
 * a bijection can send the selected k plaintext singleton values onto
 * precisely the k most frequent observed output labels in this state.
 * @param {object[]} words Canonical word records
 * @param {"book"|"section"|"page"} scope
 * @param {number} period Positive word ordinal period
 * @param {number} k Number of admitted plaintext singleton values, 1..29
 */
function capacity(words, scope, period, k = 2) {
  assert.ok(Number.isInteger(k) && k >= 1 && k <= MOD);
  assert.ok(Number.isInteger(period) && period >= 1);
  const byState = new Map();
  let samples = 0;
  for (const word of words) {
    if (word.indices.length !== 1) continue;
    samples++;
    const key = state(word, scope, period);
    const histogram = byState.get(key) || new Uint16Array(MOD);
    histogram[word.indices[0]]++;
    byState.set(key, histogram);
  }
  let covered = 0;
  const violations = [];
  for (const [key, hist] of byState) {
    const sorted = [...hist].sort((a, b) => b - a);
    const max = sorted.slice(0, k).reduce((a, b) => a + b, 0);
    const count = sorted.reduce((a, b) => a + b, 0);
    covered += max;
    if (count !== max) violations.push({key,
      samples: count, distinct: sorted.filter(n => n).length,
      forced: count - max});
  }
  return {samples, states: byState.size, covered,
    forcedExceptions: samples - covered, violatingStates: violations};
}

/**
 * If every key epoch may cover at most k different singleton output runes,
 * the greedy contiguous partition minimizes extra key epochs. Rekeys can
 * occur anywhere between successive singleton words.
 * @param {object[]} words
 * @param {"book"|"section"|"page"} scope
 * @param {number} k
 */
function minimumRekeys(words, scope, k = 2) {
  const byScope = new Map();
  for (const w of words) {
    if (w.indices.length !== 1) continue;
    const key = scope === "book" ? 0 : w[scope];
    if (!byScope.has(key)) byScope.set(key, []);
    byScope.get(key).push(w.indices[0]);
  }
  let additional = 0;
  for (const values of byScope.values()) {
    let seen = new Set();
    for (const value of values) {
      if (!seen.has(value) && seen.size === k) {
        additional++;
        seen = new Set();
      }
      seen.add(value);
    }
  }
  return additional;
}

/** @param {number} seed Nonzero uint32 seed. */
function rng(seed) {
  let state = seed >>> 0;
  assert.ok(state);
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

/** @param {() => number} random */
function permutation(random) {
  const out = Array.from({length: MOD}, (_, i) => i);
  for (let i = MOD - 1; i > 0; i--) {
    const j = random() % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * An independent, truly invertible 12,956-rune GP29 encryption controls
 * this exact test with arbitrary unknown key per word-ordinal phase.
 * Every planted one-rune word is GP A or I; other symbols are arbitrary.
 * @param {object[]} words
 * @param {"book"|"section"|"page"} scope
 * @param {number} period
 */
function positiveControl(words, scope, period) {
  const random = rng((0x49a1c017 + period * 997 +
    {book: 0, section: 1, page: 2}[scope]) >>> 0);
  const tables = new Map();
  const artificial = [];
  let recovered = 0, singleton = 0;
  for (const word of words) {
    const key = state(word, scope, period);
    if (!tables.has(key)) tables.set(key, permutation(random));
    const table = tables.get(key);
    const original = word.indices.length === 1
      ? [random() % 2 ? 24 : 10]
      : word.indices.map(() => random() % MOD);
    const encrypted = original.map(index => table[index]);
    for (let i = 0; i < original.length; i++) {
      assert.equal(table.indexOf(encrypted[i]), original[i]);
      recovered++;
    }
    if (word.indices.length === 1) singleton++;
    artificial.push({...word, indices: encrypted});
  }
  const gate = capacity(artificial, scope, period, 2);
  assert.equal(gate.forcedExceptions, 0);
  assert.equal(singleton, 83);
  assert.equal(recovered, 12956);
  return {scope, period, plantedSingletonWords: singleton,
    keyStates: tables.size, inverseRuneMatches: recovered,
    forcedExceptions: gate.forcedExceptions};
}

function main() {
  const {words, source, runeCount} = parseWords(SOURCE);
  const singleton = words.filter(w => w.indices.length === 1);
  assert.equal(singleton.length, 83);
  assert.equal(new Set(singleton.map(w => w.indices[0])).size, 28);

  const scopes = {};
  for (const scope of ["book", "section", "page"]) {
    const bounds = {};
    for (const k of [1, 2, 3, 4]) {
      const r = capacity(words, scope, 1, k);
      bounds[String(k)] = {
        admitted: r.covered, forcedExceptions: r.forcedExceptions
      };
    }
    const firstPermittedPeriod = Array.from({length: 256},
      (_, i) => i + 1).find(period =>
      capacity(words, scope, period, 2).forcedExceptions === 0);
    assert.ok(firstPermittedPeriod);
    scopes[scope] = {
      staticAlphabet: bounds,
      minimumExtraKeyEpochs: minimumRekeys(words, scope, 2),
      firstPermittedWordPhasePeriod: firstPermittedPeriod,
      selectedPhases: Object.fromEntries([1, 2, 3, 5, 6, 23, 29, 53, 79]
        .map(p => [String(p),
          capacity(words, scope, p, 2).forcedExceptions])),
      violatingFixedKeyGroups: capacity(words, scope, 1, 2)
        .violatingStates
    };
  }
  assert.deepEqual(["book", "section", "page"].map(scope =>
    scopes[scope].staticAlphabet["2"].forcedExceptions), [73, 57, 13]);
  assert.deepEqual(["book", "section", "page"].map(scope =>
    scopes[scope].firstPermittedWordPhasePeriod), [130, 28, 6]);
  assert.deepEqual(["book", "section", "page"].map(scope =>
    scopes[scope].minimumExtraKeyEpochs), [40, 34, 10]);
  const plants = [
    positiveControl(words, "book", 23),
    positiveControl(words, "section", 23),
    positiveControl(words, "page", 5)
  ];
  const output = {
    classification: "Exact conditional all-hidden-alphabet exclusion, no plaintext",
    sourceSHA256: crypto.createHash("sha256").update(SOURCE).digest("hex"),
    sourceRunes: runeCount, words: words.length, singleton: singleton.length,
    singletonCipherSymbols: 28,
    assumedNativePlaintextSingletonAlphabet: [10, 24],
    scopes, plants,
    qualification: "Assumes original one-rune words are one-rune plaintext words from a fixed k-symbol vocabulary and one alphabet per specified public word-ordinal key phase; variable segmentation, state keyed by ciphertext, insertions, and unconstrained rekeys are not excluded."
  };
  console.log(JSON.stringify(output, null, 2));
  return output;
}

if (require.main === module) main();
module.exports = {parseWords, state, capacity, minimumRekeys, positiveControl, main};
