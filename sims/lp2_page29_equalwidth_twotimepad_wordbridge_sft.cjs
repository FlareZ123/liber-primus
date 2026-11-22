"use strict";
/**
 * LP2 GP29 29-page-offset common-pad original-word bridge exclusion.
 *
 * This tests two length-equal physical page pairs in the 58-page/29-rune
 * manuscript without guessing any keystream: pages 13/42 and 19/48.
 *
 * Model: C_a[t] = sign*P_a[t] + K[t] + offset_a (mod 29);
 *        C_b[t] = sign*P_b[t] + K[t] + offset_b (mod 29).
 * A completely arbitrary shared K[t] cancels. Both arithmetic signs and
 * every relative constant offset are admitted. Printed GP word lengths are
 * assumed to be plaintext word lengths, with no cross-page fragment charged.
 *
 * Node.js 22 CommonJS; complete single-file test on checked-in sources.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
/** @param {string} p @returns {string} */
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const source = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/lp2-transcription.txt").split("%");
const runeIndex = new Map(source.runes.map((rune, i) => [rune, i]));
const gp = source.translit.map((name, index) => ({name, index}))
  .sort((a, b) => b.name.length - a.name.length);

assert.equal(source.pages.length, 58);
assert.equal(runeIndex.size, 29);
assert.deepEqual([source.pages[13].indices.length, source.pages[42].indices.length,
  source.pages[19].indices.length, source.pages[48].indices.length],
[272, 272, 271, 271]);

/** @param {number} v @returns {number} */
const mod29 = v => ((v % 29) + 29) % 29;

/**
 * Source-native 29-rune lexicon. Include both conventional greedy digraph
 * spelling and permissive historical ING/IO reductions for every entry.
 * @param {string} input
 * @param {boolean} historical
 * @returns {number[]|null}
 */
function encode(input, historical) {
  let word = input.toUpperCase().replace(/QU/g, "CW")
    .replace(/[KQ]/g, "C").replace(/V/g, "U").replace(/Z/g, "S");
  if (historical) word = word.replace(/ING/g, "NG").replace(/IO/g, "IA");
  const out = [];
  for (let i = 0; i < word.length;) {
    const letter = gp.find(s => word.startsWith(s.name, i));
    if (!letter) return null;
    out.push(letter.index);
    i += letter.name.length;
  }
  return out;
}

const rawDictionary = read("resources/control/english_wordfreq_textblob.txt");
const types = new Map();
for (const line of rawDictionary.split(/\r?\n/)) {
  const found = /^([a-z]+)\s+\d+$/.exec(line);
  if (!found) continue;
  for (const historical of [false, true]) {
    const word = encode(found[1], historical);
    if (!word || word.length > 14) continue;
    if (!types.has(word.length)) types.set(word.length, new Map());
    types.get(word.length).set(word.join(","), word);
  }
}
const dictionary = new Map([...types].map(([length, group]) =>
  [length, [...group.values()]]));
assert(dictionary.get(8).length > 4500);

/**
 * Preserve original page-local rune positions and word separators. Remove
 * the first and final fragment on every page even if complete, so an unknown
 * cross-page carry can never be mistaken for a complete native word.
 * @param {number} physical
 * @returns {{start:number,length:number}[]}
 */
function completeInteriorWords(physical) {
  assert(physical !== 50);
  const section = transcription[physical < 50 ? physical : physical - 1];
  const output = [];
  let offset = 0;
  let start = 0;
  let length = 0;
  /** @returns {void} */
  function finish() {
    if (length) output.push({start, length});
    length = 0;
  }
  const decoded = [];
  for (const character of section) {
    const index = runeIndex.get(character);
    if (index !== undefined) {
      if (!length) start = offset;
      length++;
      offset++;
      decoded.push(index);
    } else if ("-.$&§".includes(character)) {
      finish();
    }
  }
  finish();
  assert.deepEqual(decoded, source.pages[physical].indices);
  return output.filter(word => word.start > 0
    && word.start + word.length < decoded.length);
}

/**
 * Maximal rune-index overlaps among original complete interior words.
 * @param {number} pA
 * @param {number} pB
 * @returns {{start:number,width:number,aLen:number,bLen:number,aSkip:number,bSkip:number}[]}
 */
function overlapWords(pA, pB) {
  const output = [];
  for (const a of completeInteriorWords(pA)) {
    for (const b of completeInteriorWords(pB)) {
      const start = Math.max(a.start, b.start);
      const end = Math.min(a.start + a.length, b.start + b.length);
      if (end - start < 4) continue;
      output.push({start, width: end - start,
        aLen: a.length, bLen: b.length,
        aSkip: start - a.start, bSkip: start - b.start});
    }
  }
  return output.sort((a, b) => b.width - a.width || a.start - b.start);
}

/**
 * For each overlapping original word pair, look up ALL secret-free
 * compatible relative page offsets, with every native dictionary pair
 * and both fixed arithmetic signs. The dictionary test is necessary only;
 * cross-bridge consistency can further restrict a surviving hypothesis.
 *
 * @param {number[]} a Source positional tape A
 * @param {number[]} b Source positional tape B
 * @param {ReturnType<typeof overlapWords>} spans
 * @param {1|-1} sign
 * @returns {{start:number,width:number,aLen:number,bLen:number,shifts:number[]}[]}
 */
function compatibleSpans(a, b, spans, sign) {
  assert.equal(a.length, b.length);
  const out = [];
  for (const span of spans) {
    const {start, width, aLen, bLen, aSkip, bSkip} = span;
    const candidatesB = dictionary.get(bLen) || [];
    const substringsB = new Set(candidatesB.map(w =>
      w.slice(bSkip, bSkip + width).join(",")));
    const delta = Array.from({length: width}, (_, i) =>
      mod29(a[start + i] - b[start + i]));
    const shifts = [];
    for (let s = 0; s < 29; s++) {
      let plausible = false;
      for (const word of dictionary.get(aLen) || []) {
        const required = word.slice(aSkip, aSkip + width).map((value, i) =>
          mod29(value - sign * delta[i] + s));
        if (substringsB.has(required.join(","))) {
          plausible = true;
          break;
        }
      }
      if (plausible) shifts.push(s);
    }
    out.push({start, width, aLen, bLen, shifts});
  }
  return out;
}

/** @param {ReturnType<typeof compatibleSpans>} tests @returns {number[]} */
function possibleGlobalShifts(tests) {
  return Array.from({length: 29}, (_, i) => i)
    .filter(s => tests.every(t => t.shifts.includes(s)));
}

/**
 * Use untouched lexical words to plant a complete positive under arbitrary
 * K[t], with independent page offset on B, covering ALL original interior
 * word lengths and every matched overlap.
 *
 * @param {number} physical
 * @param {number} salt
 * @returns {number[]}
 */
function plantedPlaintext(physical, salt) {
  const n = source.pages[physical].indices.length;
  const out = Array(n).fill(0);
  const words = completeInteriorWords(physical);
  for (let j = 0; j < words.length; j++) {
    const word = words[j], choices = dictionary.get(word.length);
    assert(choices && choices.length);
    const chosen = choices[(word.start * 41 + j * 11 + salt) % choices.length];
    for (let i = 0; i < word.length; i++) out[word.start + i] = chosen[i];
  }
  return out;
}

function main() {
  const pairs = [[13, 42], [19, 48]];
  for (const [pA, pB] of pairs) {
    const a = source.pages[pA].indices;
    const b = source.pages[pB].indices;
    const spans = overlapWords(pA, pB);
    assert(spans.length >= 18);
    const results = {};
    for (const sign of [1, -1]) {
      const tests = compatibleSpans(a, b, spans, sign);
      const impossible = tests.filter(t => !t.shifts.length);
      const global = possibleGlobalShifts(tests);
      assert.equal(global.length, 0);
      assert(impossible.length >= 2);
      results[sign] = {global, impossible: impossible.map(t => ({
        start: t.start, width: t.width, aLen: t.aLen, bLen: t.bLen
      }))};
    }

    const plainA = plantedPlaintext(pA, 91);
    const plainB = plantedPlaintext(pB, 173);
    for (const sign of [1, -1]) {
      // Asymmetric arbitrary page offset: b has +5; key is changing.
      const key = Array.from({length: a.length}, (_, i) =>
        mod29(7 * i + i * i + 3));
      const cipherA = plainA.map((v, i) => mod29(key[i] + sign * v));
      const cipherB = plainB.map((v, i) => mod29(key[i] + sign * v + 5));
      const tests = compatibleSpans(cipherA, cipherB, spans, sign);
      const expectedShift = sign === 1 ? 24 : 5;
      assert(tests.every(t => t.shifts.includes(expectedShift)));
      assert(possibleGlobalShifts(tests).includes(expectedShift));
      // The exact same synthetic first-party plaintext must re-encrypt.
      for (let i = 0; i < a.length; i++) {
        assert.equal(mod29(cipherA[i] - key[i] - sign * plainA[i]), 0);
        assert.equal(mod29(cipherB[i] - key[i] - sign * plainB[i]), 5);
      }
    }
    console.log(JSON.stringify({
      pages: [pA, pB], lengths: [a.length, b.length],
      interiorWords: [completeInteriorWords(pA).length,
        completeInteriorWords(pB).length],
      wordBridgesAtLeast4: spans.length,
      plus: results[1], minus: results[-1],
      plant: "PASS both directions, arbitrary changing pad, unknown page offset"
    }, null, 2));
  }
  console.log("PASS: two exact-width p↔p+29 page pairs; no original keyless" +
    " common-pad word solution under any constant offset or arithmetic sign");
  console.log("No unknown plaintext, original key or final destination recovered");
}
main();
