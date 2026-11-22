"use strict";

/**
 * Exact original LP2 DH6-affine-echo as a possible reserved plaintext-rune
 * transport: test all 29 reserved symbols using a genuinely reversible code.
 * English letter-position priors are pinned to independent source texts.
 *
 * The 2013 signed DH example motivates T(x)=(24-2x) mod29, six places back
 * within each authentic printed word, but does not command this model.
 *
 * Run with Node.js 22 from the repository root. Read only, no dependencies.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");
const ROOT = path.resolve(__dirname, "..");
/** @param {string} relative */
const read = relative => fs.readFileSync(path.join(ROOT, relative), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const sourceWords = parseSharedCorpus().words;
const runeIndex = new Map(gp.runes.map((r, i) => [r, i]));
const original = gp.pages.filter(p => p.page < 56 && p.indices.length)
  .flatMap(p => p.indices);
assert.equal(original.length, 12956);
assert.equal(sourceWords.length, 2896);

/** @param {number} x */
function T(x) {
  return (24 - 2 * x + 58) % 29;
}
/** @param {number[]} p @param {number} reserved */
function encrypt(p, reserved) {
  const c = p.slice(0, 6);
  for (let j = 6; j < p.length; j++) {
    const exceptional = T(c[j - 6]);
    if (p[j] === reserved) c.push(exceptional);
    else {
      const rank = p[j] - Number(p[j] > reserved);
      c.push(rank + Number(rank >= exceptional));
    }
  }
  return c;
}
/** @param {number[]} c @param {number} reserved */
function decrypt(c, reserved) {
  const p = c.slice(0, 6);
  for (let j = 6; j < c.length; j++) {
    const exceptional = T(c[j - 6]);
    if (c[j] === exceptional) p.push(reserved);
    else {
      const rank = c[j] - Number(c[j] > exceptional);
      p.push(rank + Number(rank >= reserved));
    }
  }
  return p;
}

const words = [];
let streamOffset = 0;
for (const item of sourceWords) {
  const c = Array.from(item.runes, r => {
    const value = runeIndex.get(r);
    assert.notEqual(value, undefined);
    return value;
  });
  assert.deepEqual(c, original.slice(streamOffset, streamOffset + c.length));
  words.push({c, page: item.startPage});
  streamOffset += c.length;
}
assert.equal(streamOffset, 12956);
const events = [];
for (const {c, page} of words) {
  for (let j = 6; j < c.length; j++) {
    events.push({
      page, length: c.length, position: j,
      hit: Number(c[j] === T(c[j - 6]))
    });
  }
}
assert.equal(events.length, 1290);
assert.equal(events.reduce((a, e) => a + e.hit, 0), 80);

// The normal GP29 orthography used for solved-page language controls.
const tokens = gp.translit.map((label, index) => ({label, index}))
  .sort((a, b) => b.label.length - a.label.length);
/** @param {string} latin */
function encodeWord(latin) {
  const word = latin.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const indices = [];
  for (let i = 0; i < word.length;) {
    if (word.startsWith("ING", i)) {
      indices.push(21);
      i += 3;
    } else if (word.startsWith("IO", i)) {
      indices.push(27);
      i += 2;
    } else {
      const match = tokens.find(t => word.startsWith(t.label, i));
      assert(match, "Unmapped GP source word " + word);
      indices.push(match.index);
      i += match.label.length;
    }
  }
  return indices;
}
assert.deepEqual(encodeWord("FOLLOWING"), [0, 3, 20, 20, 3, 7, 21]);

/** @type {Map<string,{counts:Uint32Array,total:number}>} */
const table = new Map();
const background = new Float64Array(29);
let backgroundTotal = 0;
const nativeTexts = [
  "resources/control/shakespeare_first300k.txt",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/emerson_essays_2944.txt"
].map(read);
for (const text of nativeTexts) {
  for (const word of text.toUpperCase().match(/[A-Z]+/g) || []) {
    const encoded = encodeWord(word);
    for (let j = 0; j < encoded.length; j++) {
      const key = encoded.length + ":" + j;
      let slot = table.get(key);
      if (!slot) {
        slot = {counts: new Uint32Array(29), total: 0};
        table.set(key, slot);
      }
      slot.counts[encoded[j]]++;
      slot.total++;
      background[encoded[j]]++;
      backgroundTotal++;
    }
  }
}
const prior = Array.from(background, x => x / backgroundTotal);
/** @param {number} length @param {number} position @param {number} symbol */
function probability(length, position, symbol) {
  const slot = table.get(length + ":" + position);
  if (!slot) return prior[symbol];
  const concentration = Math.max(15, slot.total / 10);
  return (slot.counts[symbol] + concentration * prior[symbol])
    / (slot.total + concentration);
}
/** @param {number} symbol @param {boolean} train */
function score(symbol, train) {
  let eligible = 0, hits = 0, expected = 0, ll = 0;
  for (const e of events) {
    if ((e.page < 40) !== train) continue;
    const p = probability(e.length, e.position, symbol);
    eligible++;
    hits += e.hit;
    expected += p;
    ll += e.hit ? Math.log(p) : Math.log1p(-p);
  }
  const rate = hits / eligible;
  const baseline = hits * Math.log(rate)
    + (eligible - hits) * Math.log1p(-rate);
  return {eligible, hits, expected, logLikelihood: ll, delta: ll - baseline};
}
const evaluated = gp.translit.map((label, symbol) => ({
  label, symbol, train: score(symbol, true), holdout: score(symbol, false)
})).sort((a, b) => b.train.delta - a.train.delta);
const first = evaluated[0];
assert.equal(first.symbol, 20); // L is the *weakest* train failure.
assert.equal(first.train.eligible, 953);
assert.equal(first.train.hits, 60);
assert.equal(first.holdout.eligible, 337);
assert.equal(first.holdout.hits, 20);
assert(evaluated.every(r => r.train.delta < 0));
assert(first.holdout.delta < 0);
assert(Math.abs(first.train.delta + 1.90148) < 0.00002);
assert(Math.abs(first.holdout.delta + 3.72314) < 0.00002);

// A full 29-way word-local bijection is explicit, so a correct key can
// roundtrip even when the original decoded text is meaningless.
for (let reserved = 0; reserved < 29; reserved++) {
  for (const {c} of words) {
    assert.deepEqual(encrypt(decrypt(c, reserved), reserved), c);
  }
}

// Source-native positive: independently picked Gibran words of exactly the
// printed original long-word lengths, with three unrelated marker choices.
const byLength = new Map();
for (const latin of nativeTexts[1].toUpperCase().match(/[A-Z]+/g) || []) {
  const p = encodeWord(latin);
  if (p.length >= 7) {
    if (!byLength.has(p.length)) byLength.set(p.length, []);
    byLength.get(p.length).push(p);
  }
}
const position = new Map();
let plantedRunes = 0;
let plantedHits = {};
for (const reserved of [0, 15, 20]) {
  position.clear();
  let hits = 0;
  for (const {c} of words) {
    if (c.length < 7) continue;
    const pool = byLength.get(c.length);
    assert(pool && pool.length > 0, "Missing matched GP-native word length " + c.length);
    const i = position.get(c.length) || 0;
    position.set(c.length, i + 1);
    const plain = pool[i % pool.length];
    const cipher = encrypt(plain, reserved);
    assert.deepEqual(decrypt(cipher, reserved), plain);
    for (let j = 6; j < plain.length; j++) {
      assert.equal(cipher[j] === T(cipher[j - 6]), plain[j] === reserved);
      hits += Number(cipher[j] === T(cipher[j - 6]));
    }
    if (reserved === 0) plantedRunes += plain.length;
  }
  plantedHits[gp.translit[reserved]] = hits;
}
console.log(JSON.stringify({
  original: {words: words.length, runes: original.length,
    opportunities: events.length, echoes: 80},
  ranking: evaluated.map(({label, symbol, train, holdout}) =>
    ({label, symbol, trainDelta: train.delta, holdoutDelta: holdout.delta})),
  best: first,
  sourceF: evaluated.find(r => r.symbol === 0),
  sourceS: evaluated.find(r => r.symbol === 15),
  positive: {nativeRunes: plantedRunes, markerHits: plantedHits}
}, null, 2));
console.log("PASS: no one fixed GP29 plaintext symbol explains all signed-DH6 echo sites.");
