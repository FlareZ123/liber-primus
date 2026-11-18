"use strict";

/**
 * SFT: p57 SURFACE -> 67th prime 331 -> original 2014 wrapper id331
 * -> title133 -> exact fixed-weight 31-of-256 state width.
 *
 * Run:
 *   node sims/lp2_surface331_title133_red13_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
/** @param {string} p */
const read = p => fs.readFileSync(path.join(root, p), "utf8");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const solved = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const html = read("resources/historical/stage11-2014-index.html");

const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));

/** @param {string} text */
function words(text) {
  return (text.replace(/\/\s*/gu, "").match(/[\u16A0-\u16FF]+/gu) || [])
    .map(word => [...word].map(rune => {
      const v = runeIndex.get(rune);
      assert.notEqual(v, undefined);
      return v;
    }));
}

/** @param {number[]} w */
function translit(w) {
  return w.map(v => corpus.translit[v]).join("");
}

/** @param {number[]} w */
function gp0(w) {
  return w.reduce((sum, v) => sum + v, 0);
}

/** @param {number} n */
function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d += 1) {
    if (n % d === 0) return false;
  }
  return true;
}

/** @param {number} n */
function nthPrime(n) {
  let count = 0;
  for (let value = 2; ; value += 1) {
    if (!isPrime(value)) continue;
    count += 1;
    if (count === n) return value;
  }
}

/** @param {number} n @param {number} k */
function choose(n, k) {
  if (k < 0 || k > n) return 0n;
  let kk = Math.min(k, n - k);
  let out = 1n;
  for (let i = 1; i <= kk; i += 1) {
    out = out * BigInt(n - kk + i) / BigInt(i);
  }
  return out;
}

/** @param {bigint} x */
function bitLength(x) {
  return x.toString(2).length;
}

const p57 = solved.sections.find(section => section.name === "p57_parable");
assert.ok(p57);
const clear = words(p57.source_text).map(w => ({
  text: translit(w),
  gp0: gp0(w),
}));
const surface = clear.find(row => row.text === "SURFACE");
assert.ok(surface);
assert.equal(surface.gp0, 67);
assert.equal(nthPrime(surface.gp0), 331);

assert.equal((html.match(/<div id="331">/g) || []).length, 1);
assert.equal((html.match(/<title>133<\/title>/g) || []).length, 1);
assert.equal((html.match(/<img src="\d+\.jpg">/g) || []).length, 58);

// Structural wrapper integers outside the sequential image filenames.
const htmlWithoutImages = html.replace(/<img src="\d+\.jpg">/g, "");
const structuralNumbers = [...htmlWithoutImages.matchAll(/\b\d+\b/g)]
  .map(match => Number(match[0]));
assert.deepEqual(structuralNumbers.sort((a, b) => a - b), [133, 331]);

const structuralSet = new Set(structuralNumbers);
const clearStructuralHits = clear
  .map(row => ({...row, primeOfGp0: nthPrime(row.gp0)}))
  .filter(row => structuralSet.has(row.primeOfGp0));
assert.deepEqual(clearStructuralHits, [{
  text: "SURFACE",
  gp0: 67,
  primeOfGp0: 331,
}]);

let redRunes = 0;
let red13 = 0;
let black13 = 0;
for (const page of ink.pages) {
  for (const span of page.red_spans || []) redRunes += [...span.runes].length;
  for (const [, dots, color] of page.large_punctuation || []) {
    if (dots !== 13) continue;
    if (color === "red") red13 += 1;
    if (color === "black") black13 += 1;
  }
}
assert.deepEqual({redRunes, red13, black13}, {
  redRunes: 225,
  red13: 30,
  black13: 1,
});
const events = redRunes + red13 + black13;
const marks = red13 + black13;
assert.equal(events, 256);
assert.equal(marks, 31);
const stateBits = bitLength(choose(events, marks) - 1n);
assert.equal(stateBits, 133);

console.log(JSON.stringify({
  status: "PASS: SURFACE prime-lifts uniquely to wrapper id331; title133 equals fixed-weight state width",
  clearRoute: {
    word: surface.text,
    gp0: surface.gp0,
    nthPrime: nthPrime(surface.gp0),
  },
  wrapper: {
    structuralNumbers,
    imageCount: 58,
    uniqueClearWordPrimeLiftHits: clearStructuralHits,
  },
  red13State: {
    redRunes,
    red13,
    black13,
    events,
    marks,
    stateBits,
  },
  caveat: "This selects the historical wrapper and motivates fixed-weight enumeration; it does not by itself authenticate the downstream Tor-v2 host.",
}, null, 2));
