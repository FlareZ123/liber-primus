"use strict";
/**
 * Cicada LP1 p05 duplicate-word residual (10 runes) as original LP2 table
 * caption key. This tests a new source-led operand, distinct from the 66-rune
 * unique-word tape and full 76-rune tape tested by Agent43.
 *
 * Run on Windows 11, Node 22:
 * node sims/lp2_p05_duplicate10_p49_strictf_original_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");

/** @param {string} rel */
function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

const book = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const lp1 = read("resources/transcriptions/lp1_wulfic_canonical.txt");
const byRune = new Map(book.runes.map((rune, i) => [rune, i]));
const anchor = "272-138-";
assert.equal(lp1.indexOf(anchor), lp1.lastIndexOf(anchor));
assert.ok(lp1.includes(anchor));
const square = lp1.slice(lp1.indexOf(anchor)).split(/\r?\n/).slice(0, 5)
  .map(line => line.replace(/\/$/, "").split("-"));
assert.deepEqual(square.map(row => row.length), [5, 5, 5, 5, 5]);
const words = square.flat().filter(token => !/^\d+$/.test(token));
assert.equal(words.length, 13);
const duplicateWords = words.filter((word, index) => words.indexOf(word) !== index);
assert.deepEqual(duplicateWords.map(word => [...word].map(c => book.translit[byRune.get(c)]).join("")),
  ["UOID", "AETHEREAL"]);
const duplicateKey = duplicateWords.flatMap(word => [...word].map(ch => byRune.get(ch)));
assert.deepEqual(duplicateKey, [1, 3, 10, 23, 25, 2, 18, 4, 28, 20]);
assert.equal(duplicateKey.length, 10);
assert.equal(words.reduce((n, word) => n + [...word].length, 0), 76);
assert.equal([...new Set(words)].reduce((n, word) => n + [...word].length, 0), 66);

const p49 = book.pages[49].indices;
const before = book.pages[48].indices.slice(-72).concat(p49);
const after = book.pages[51].indices.concat(book.pages[52].indices.slice(0, 78));
const joined = before.concat(after);
assert.deepEqual([p49.length, before.length, after.length, joined.length], [66, 138, 170, 308]);
const spans = [
  ["p49 fragment", p49],
  ["complete preceding sentence", before],
  ["complete following sentence", after],
  ["two complete flanking sentences, uninterrupted clock", joined],
];

/** @param {number} n */
const m29 = n => ((n % 29) + 29) % 29;

/** @param {number[]} xs */
function ioc(xs) {
  const bins = Array(29).fill(0);
  for (const x of xs) bins[x]++;
  return bins.reduce((acc, n) => acc + n * (n - 1), 0) / (xs.length * (xs.length - 1));
}

/** @param {number[]} xs */
const letters = xs => xs.map(x => book.translit[x]).join("");

/**
 * Complete all-mask decoder for the **known solved-p56 plaintext-F rule**.
 * A hypothetical plaintext F must be transmitted as ciphertext F, without
 * consuming a key symbol. A ciphertext F can also be a keyed non-F symbol.
 * State tracks key position modulo its 10-symbol period; no mask is guessed.
 *
 * @param {number[]} text
 * @param {number[]} key
 * @param {number} sign  plaintext := ciphertext + sign * key mod 29
 */
function strictF(text, key, sign) {
  let active = new Set([0]);
  let firstImpossible = null;
  /** @type {number[][]} */
  const statesByIndex = [];
  for (let i = 0; i < text.length; i++) {
    const next = new Set();
    for (const phase of active) {
      const plain = m29(text[i] + sign * key[phase]);
      if (plain !== 0) next.add((phase + 1) % 10);
      if (text[i] === 0) next.add(phase);
    }
    active = next;
    statesByIndex.push([...active].sort((a, b) => a - b));
    if (active.size === 0) {
      firstImpossible = i;
      break;
    }
  }
  return {firstImpossible, survivingKeyPhases: [...active].sort((a, b) => a - b),
    statesByIndex};
}

/**
 * A source-native encoder, used only for a positive control to verify the
 * strictF search can retain the correct phase at each known input rune.
 *
 * @param {number[]} plaintext
 * @param {number[]} key
 * @param {number} sign
 */
function strictFPlant(plaintext, key, sign) {
  const cipher = [], phases = [];
  let consumed = 0;
  for (const plain of plaintext) {
    if (plain === 0) cipher.push(0);
    else {
      cipher.push(m29(plain - sign * key[consumed % key.length]));
      consumed++;
    }
    phases.push(consumed % key.length);
  }
  const checked = strictF(cipher, key, sign);
  assert.equal(checked.firstImpossible, null, "source-native planted text must survive");
  assert.equal(checked.statesByIndex.length, plaintext.length);
  for (let i = 0; i < phases.length; i++)
    assert.ok(checked.statesByIndex[i].includes(phases[i]), "true planted clock not retained");
  return {sourceRunes: plaintext.length, originalFCount: plaintext.filter(x => x === 0).length};
}

const sample = Array.from({length: joined.length}, (_, i) =>
  book.pages[57].indices[i % book.pages[57].indices.length]);
assert.equal(sample.length, 308);
const result = [];
for (const [representation, rawKey] of [
  ["GP ordinal", duplicateKey],
  ["GP prime", duplicateKey.map(i => book.prime[i] % 29)],
  ["GP prime totient", duplicateKey.map(i => (book.prime[i] - 1) % 29)],
]) for (const reversed of [false, true]) for (const sign of [-1, 1]) {
  const key = reversed ? rawKey.slice().reverse() : rawKey;
  strictFPlant(sample, key, sign);
  const data = spans.map(([name, text]) => {
    const decoded = text.map((c, i) => m29(c + sign * key[i % key.length]));
    assert.deepEqual(decoded.map((p, i) =>
      m29(p - sign * key[i % key.length])), text);
    const strict = strictF(text, key, sign);
    return {
      span: name, originalCipherF: text.filter(c => c === 0).length,
      plainIoC: +ioc(decoded).toFixed(9),
      firstImpossible: strict.firstImpossible,
      possibleEndPhases: strict.survivingKeyPhases,
      first48Plain: letters(decoded.slice(0, 48))
    };
  });
  assert.ok(data[3].firstImpossible !== null, "All full 308-rune original keyed branches must fail");
  assert.ok(data[2].firstImpossible !== null, "All post-table 170-rune phase-zero branches must fail");
  result.push({representation, reversed, sign, sourcePositive: true, realOriginal: data});
}
assert.equal(result.length, 12);
const preSurvivors = result.filter(x => x.realOriginal[1].firstImpossible === null)
  .map(x => ({representation: x.representation, reversed: x.reversed, sign: x.sign,
    possibleEndPhases: x.realOriginal[1].possibleEndPhases}));
assert.deepEqual(preSurvivors,
  [{representation: "GP prime totient", reversed: true, sign: -1, possibleEndPhases: [4, 6]}]);

console.log(JSON.stringify({
  evidence: "Original LP1 p05 13 magic-square rune-word cells: 76 runes; 11 first unique cells: 66; last-occurrence duplicate cells: 10",
  key: "Printed duplicate words UOID AETHEREAL in their actual rune spellings",
  sourcePositions: {beforeTable: [48, 49], afterTable: [51, 52]},
  directModel: "key repeating every ten source GP symbols, both signs, 3 published numeric representations, original and reverse tape",
  strictF: "Known solved-p56 plaintext F transmitted as ciphertext F, with no key consumption; exhaustive key-phase branching at every cipher F",
  result, preSurvivors,
  conclusion: "One 138-rune preceding-sentence model is algebraically possible; all 12 original 170-rune post-table and uninterrupted 308-rune variants contradict strict F. No GP29 prose recovered."
}, null, 2));
