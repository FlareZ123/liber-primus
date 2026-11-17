"use strict";

// Original-input finite test: word-graph 23-cycle as an additive GP29 key.
// The heading selects two seeds; transparent plaintext-F uses the authentic
// p56 consumption rule. These decoder proposals are conditional, not authored.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { parseLP2Words } = require("./lp2_word_pages.cjs");

/** @type {{runes:string[],prime:number[],pages:{page:number,indices:number[]}[]}} */
const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const text = fs.readFileSync(path.join(__dirname, "..", "resources", "lp2-transcription.txt"), "utf8");
const { words } = parseLP2Words(text, 3);
const index = new Map(corpus.runes.map((r, i) => [r, i]));

/** @param {string} runes */
function primeSum(runes) {
  return [...runes].reduce((sum, r) => {
    assert(index.has(r));
    return sum + corpus.prime[index.get(r)];
  }, 0);
}
assert.equal(words.length, 158);
assert.equal(words.reduce((sum, w) => sum + w.length, 0), 729);
assert.equal(words[0].length + words[1].length, 13);
const body = words.slice(2);
const sums = body.map(w => primeSum(w.runes));
const next = sums.map(s => s % 156);
const firstSeed = primeSum(words[0].runes) % 156;
const secondSeed = primeSum(words[1].runes) % 156;
assert.deepEqual([firstSeed, secondSeed], [35, 3]);
assert.equal(body.length, 156);

/** @param {number} seed */
function trace(seed) {
  const seen = new Map();
  const history = [];
  let state = seed;
  while (!seen.has(state)) {
    seen.set(state, history.length);
    history.push(state);
    state = next[state];
  }
  const split = seen.get(state);
  return { tail: history.slice(0, split), cycle: history.slice(split) };
}

const first = trace(firstSeed);
const second = trace(secondSeed);
assert.deepEqual(first.tail.map(i => i + 1), [36, 56, 113]);
assert.equal(first.cycle.length, 23);
assert.equal(second.tail.length, 0);
assert.equal(second.cycle.length, 23);
assert.equal(second.cycle[0], 3);
const sequences = {
  firstFull: first,
  firstCycle: { tail: [], cycle: first.cycle },
  secondCycle: second
};
assert.equal(Math.max(...sums), 618);
assert(sums.every(s => Math.floor(s / 156) <= 3));

/** @param {number} v */
const mod = v => ((v % 29) + 29) % 29;
/**
 * @param {number} cursor Non-F key-symbol clock
 * @param {{tail:number[],cycle:number[]}} sequence
 * @param {"sum"|"quotient"} mode
 */
function keyAt(cursor, sequence, mode) {
  const j = cursor < sequence.tail.length
    ? sequence.tail[cursor]
    : sequence.cycle[(cursor - sequence.tail.length) % sequence.cycle.length];
  return mode === "sum" ? sums[j] % 29 : Math.floor(sums[j] / 156);
}
/**
 * Enumerate every legally possible F-transparent key clock.
 * Cipher F can be an unconsumed plaintext F or a consumed non-F.
 * @param {number[]} ciphertext
 * @param {{tail:number[],cycle:number[]}} sequence
 * @param {"sum"|"quotient"} mode
 * @param {-1|1} sign
 */
function reach(ciphertext, sequence, mode, sign) {
  let states = new Set([0]);
  let maxStates = 1;
  for (let i = 0; i < ciphertext.length; i++) {
    const nextStates = new Set();
    for (const cursor of states) {
      const candidate = mod(ciphertext[i] + sign * keyAt(cursor, sequence, mode));
      if (candidate !== 0) nextStates.add(cursor + 1);
      if (ciphertext[i] === 0) nextStates.add(cursor);
    }
    states = nextStates;
    maxStates = Math.max(maxStates, states.size);
    if (states.size === 0) return { firstDead: i, maxStates };
  }
  return { legal: true, endStates: states.size, maxStates };
}
/** @param {number[]} clear @param {{tail:number[],cycle:number[]}} sequence @param {"sum"|"quotient"} mode @param {-1|1} sign */
function encryptPlant(clear, sequence, mode, sign) {
  let cursor = 0;
  return clear.map(value => value === 0 ? 0 : mod(value - sign * keyAt(cursor++, sequence, mode)));
}
const opening = corpus.pages.slice(0, 3).flatMap(page => page.indices).slice(13);
const holdout = corpus.pages.slice(40, 54).flatMap(page => page.indices);
const clear = corpus.pages.find(page => page.page === 57).indices;
assert.deepEqual([opening.length, holdout.length, clear.length], [716, 3008, 95]);

// The selected 23 body words contain exactly 119 runes. Isolated red triads
// on physical pages 3 and 39 begin at local rune offset 119; this motivates
// testing the two complete 119-rune prefixes with a 119-rune cycle-word pad.
/** @param {number[]} cipher @param {number[]} key @param {-1|1} sign */
function reachTape(cipher, key, sign) {
  let states = new Set([0]);
  for (let pos = 0; pos < cipher.length; pos++) {
    const advanced = new Set();
    for (const cursor of states) {
      const p = mod(cipher[pos] + sign * key[cursor]);
      if (p !== 0) advanced.add(cursor + 1);
      if (cipher[pos] === 0) advanced.add(cursor);
    }
    states = advanced;
    if (states.size === 0) return { firstDead: pos };
  }
  return { legal: true, endStates: states.size };
}
/** @param {number[]} plain @param {number[]} key @param {-1|1} sign */
function plantTape(plain, key, sign) {
  let cursor = 0;
  return plain.map(p => p === 0 ? 0 : mod(p - sign * key[cursor++]));
}
const red119Target = [
  corpus.pages.find(p => p.page === 3).indices.slice(0, 119),
  corpus.pages.find(p => p.page === 39).indices.slice(0, 119)
];
assert.deepEqual(red119Target.map(x => x.length), [119, 119]);
const tapeOutcomes = [];
for (const [seed, sequence] of Object.entries({
  firstCycle: first.cycle,
  secondCycle: second.cycle
})) {
  const ordinalTape = sequence.flatMap(j => [...body[j].runes].map(r => index.get(r)));
  assert.equal(ordinalTape.length, 119);
  for (const [value, tape] of Object.entries({
    ordinal: ordinalTape,
    primeMod29: ordinalTape.map(j => corpus.prime[j] % 29)
  })) {
    for (const sign of [-1, 1]) {
      const a = reachTape(red119Target[0], tape, sign);
      const b = reachTape(red119Target[1], tape, sign);
      const positive = reachTape(plantTape(clear, tape, sign), tape, sign);
      assert.equal(positive.legal, true);
      assert.equal(b.legal, undefined);
      tapeOutcomes.push({
        seed, value, sign,
        p3FirstDead: a.firstDead ?? null,
        p3LegalPaths: a.endStates ?? 0,
        p39FirstDead: b.firstDead,
        plantedP57Legal: positive.legal
      });
    }
  }
}
assert.deepEqual(tapeOutcomes.map(x => x.p3FirstDead), [54, 51, null, 10, 41, 0, 109, 5]);
assert.deepEqual(tapeOutcomes.map(x => x.p39FirstDead), [6, 25, 31, 3, 82, 7, 22, 7]);

const output = [];
for (const [sequenceName, sequence] of Object.entries(sequences)) {
  for (const mode of ["sum", "quotient"]) {
    for (const sign of [-1, 1]) {
      const source = reach(opening, sequence, mode, sign);
      const independent = reach(holdout, sequence, mode, sign);
      const positive = reach(encryptPlant(clear, sequence, mode, sign), sequence, mode, sign);
      assert.equal(source.legal, undefined);
      assert.equal(independent.legal, undefined);
      assert.equal(positive.legal, true);
      output.push({
        sequenceName, mode, sign,
        openingFirstDead: source.firstDead,
        holdoutFirstDead: independent.firstDead,
        originalSourcePrefixDecoded: source.firstDead,
        plantedP57Legal: positive.legal,
        maxStates: source.maxStates
      });
    }
  }
}
assert.deepEqual(output.map(r => r.openingFirstDead),
  [21, 25, 0, 113, 27, 162, 7, 59, 100, 126, 108, 113]);
assert.deepEqual(output.map(r => r.holdoutFirstDead),
  [16, 94, 39, 95, 102, 88, 64, 83, 130, 71, 64, 83]);
console.log(JSON.stringify({
  result: "12 source-derived candidates have zero legal complete F-transparent inverses; 12/12 source-shaped controls legal",
  headingPrimeSums: [347, 315],
  bodyWords: 156,
  sourceCycleLength: 23,
  openingRunes: opening.length,
  holdoutRunes: holdout.length,
  outcomes: output,
  selectedRuneTape119: tapeOutcomes
}, null, 2));
