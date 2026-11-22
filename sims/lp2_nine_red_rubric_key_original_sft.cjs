"use strict";

/**
 * Source-visible LP2 red-heading as cyclic GP29 section key.
 * One frozen key at each of nine original illustrated chapter starts.
 * Windows Node22 CommonJS, no writes or network. Exact original inputs.
 *
 * Motivation: the historical solved Cicada GP29 Vigenere ciphertext uses
 * a source keyword, while the manuscript prints the local rubric in red.
 * The speculative transfer uses each exact red rubric's own rune values,
 * in printed order, starting at the immediately following black rune.
 * Includes plain additive both signs and historical plaintext-F bypass.
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, "..",
  "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const ink = JSON.parse(fs.readFileSync(path.join(__dirname, "..",
  "resources", "liber-primus", "lp2-ink-annotations.json"), "utf8"));
const CHAPTER_STARTS = [0, 3, 8, 15, 23, 27, 33, 40, 54, 56];
const K = 29;

function ioc(indices) {
  const counts = new Int32Array(K);
  for (const idx of indices) counts[idx]++;
  return K * counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (indices.length * (indices.length - 1));
}

/**
 * @param {number[]} body
 * @param {number[]} key
 * @param {1|-1} sign
 */
function decryptDirect(body, key, sign) {
  return body.map((c, i) => ((c + sign * key[i % key.length]) % K + K) % K);
}

/**
 * @param {number[]} plain
 * @param {number[]} key
 * @param {1|-1} sign
 */
function encryptTransparent(plain, key, sign) {
  let pos = 0;
  return plain.map((p) => {
    if (p === 0) return 0;
    const c = ((p + sign * key[pos % key.length]) % K + K) % K;
    pos++;
    return c;
  });
}

/**
 * Preserve every valid ciphertext-to-plaintext legal cursor.
 * A literal GP F (0) is transparent in the independently solved p56.
 *
 * @param {number[]} ciphertext
 * @param {number[]} key
 * @param {1|-1} sign
 * @returns {{survived:boolean,firstImpossible:number,states:number}}
 */
function reachableTransparent(ciphertext, key, sign) {
  let states = new Set([0]);
  for (let i = 0; i < ciphertext.length; i++) {
    const c = ciphertext[i];
    const next = new Set();
    for (const pos of states) {
      if (c === 0) next.add(pos);
      const p = ((c - sign * key[pos]) % K + K) % K;
      if (p !== 0) next.add((pos + 1) % key.length);
    }
    if (!next.size) return {
      survived: false, firstImpossible: i, states: 0
    };
    states = next;
  }
  return { survived: true, firstImpossible: null, states: states.size };
}

const data = [];
let totalRunes = 0;
let everyPlant = true;
const native = corpus.pages[57].indices;
assert.equal(native.length, 95);
assert.equal(ink.pages.find(p => p.page === 57).red_spans[0].length, 7);
for (let j = 0; j < 9; j++) {
  const start = CHAPTER_STARTS[j];
  const end = CHAPTER_STARTS[j + 1];
  const pages = corpus.pages.filter(p => p.page >= start && p.page < end);
  const annotation = ink.pages.find(p => p.page === start);
  let cursor = 0;
  const key = [];
  for (const span of annotation.red_spans || []) {
    if (span.start !== cursor) break;
    const expected = pages[0].indices.slice(cursor, cursor + span.length);
    assert.equal(expected.map(i => corpus.runes[i]).join(""), span.runes);
    key.push(...expected);
    cursor += span.length;
  }
  assert.ok(key.length >= 8);
  const body = pages.flatMap(p => p.indices).slice(cursor);
  assert.equal(body.length, pages.reduce((s, p) => s + p.indices.length, 0) - key.length);
  totalRunes += key.length + body.length;

  const minus = decryptDirect(body, key, -1);
  const plus = decryptDirect(body, key, +1);
  for (const sign of [-1, +1]) {
    const plant = native.map((p, k) =>
      ((p + sign * key[k % key.length]) % K + K) % K);
    const inverted = decryptDirect(plant, key, -sign);
    assert.deepEqual(inverted, native);
    const authentic = encryptTransparent(native, key, sign);
    const recovered = reachableTransparent(authentic, key, sign);
    assert.equal(recovered.survived, true);
    everyPlant &&= recovered.survived;
  }
  data.push({
    chapter: "p" + start + "-" + (end - 1),
    headingLen: key.length, bodyRunes: body.length,
    originalScaledIoC: ioc(body),
    directSubScaledIoC: ioc(minus),
    directAddScaledIoC: ioc(plus),
    transparentKeyPlus: reachableTransparent(body, key, +1),
    transparentKeyMinus: reachableTransparent(body, key, -1),
    prefixSub: minus.slice(0, 20).map(i=>corpus.runes[i]).join(""),
    prefixAdd: plus.slice(0, 20).map(i=>corpus.runes[i]).join("")
  });
}
assert.equal(totalRunes, 12956);
const allSub = data.map(r=>r.directSubScaledIoC);
const allAdd = data.map(r=>r.directAddScaledIoC);
assert.ok(allSub.every(v=>v<1.05), "Observed direct subtraction must remain nonlinguistic");
assert.ok(allAdd.every(v=>v<1.05), "Observed direct addition must remain nonlinguistic");
assert.ok(data.every(r=>!r.transparentKeyPlus.survived && !r.transparentKeyMinus.survived),
  "Known F-transparent inverse must be unreachable on every original chapter");
assert.ok(everyPlant);
console.log(JSON.stringify({
  source: "original LP2 corpus and original red ink annotations",
  runes: totalRunes, chapters: 9, nativeGPControlScaledIoC: ioc(native),
  keySource: "contiguous red starting rubric per illustrated chapter",
  tested: "GP29 additive ± and all legal plaintext-F transparent inverses",
  original: data,
  positive: "all 9 x both-sign additive + F-transparent 95-rune native p57 plants pass"
}, null, 2));
console.log("PASS: no original chapter accepted F-transparent rubric-key inverse");
