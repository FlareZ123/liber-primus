"use strict";
/**
 * Original-input exact language-free elimination of a deterministic
 * Parable-derived BBS pad + rejection-on-same-ciphertext transition.
 *
 * The P57 body clause sums (1259,1031,1229), also in 2013 ID3 product,
 * source a proposed BBS generator: N=1259*1031 and s=1229.
 * A non-EA GP token P in [0,27] proposes C=(P+K[j]) mod29.
 * If that proposal equals the preceding C, reject K[j] and draw K[j+1].
 * GP EA(28) emits repeated C; may consume or skip a key draw.
 * The first C glyph of each physical page is an independent transmitted IV,
 * which may consume or skip the key draw. Four byte/bit mappings used.
 *
 * All possible initial phases are scanned without fitting language/keys.
 * A chain is impossible as soon as its exact inverse has no valid key index.
 * The max-skip search is mathematically COMPLETE because K's longest cyclic
 * consecutive identical run is at most 3: skipped pad symbols must all equal
 * the same value. Plant encryptions must survive all 55 original page sizes.
 *
 * Run: node sims/parable_bbs_rejection_chain_original_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {toGematria} = require("./previous_cipher_sbox_invariant.cjs");
const root = path.resolve(__dirname, "..");
/** @param {string} name */
function read(name) {
  return fs.readFileSync(path.join(root, name), "utf8");
}
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const original = gp.pages.filter((p) => p.page <= 55 && p.indices.length);
assert.equal(original.length, 55);
assert.equal(original.reduce((n, p) => n + p.indices.length, 0), 12956);
const parable = gp.pages.find((p) => p.page === 57).indices;
let clauseAt = 0;
const exactP57Sums = [7,30,30,28].map((length) => {
  const value = parable.slice(clauseAt, clauseAt + length)
    .reduce((total, glyph) => total + gp.prime[glyph], 0);
  clauseAt += length;
  return value;
});
assert.deepEqual(exactP57Sums, [449, 1259, 1031, 1229]);
const sums = exactP57Sums.slice(1);
const modulus = sums[0] * sums[1];
assert.equal(modulus * sums[2], 1595277641);
let state = sums[2] ** 2 % modulus;
const states = [];
do {
  states.push(state);
  assert(states.length <= modulus);
  state = state * state % modulus;
} while (state !== states[0]);
assert.equal(states.length, 612);
const bits = states.map((s) => s & 1);
/** @param {number} a @param {number} b */
function gcd(a, b) {while (b) [a, b] = [b, a % b];return a;}
/** @param {number} width */
function pack(width) {
  return Array.from({length:612 / gcd(612, width)}, (_, i) => {
    let n = 0;
    for (let j = 0; j < width; j++)
      n = 2 * n + bits[(width * i + j) % 612];
    return n;
  });
}
const keyStreams = {
  state29:states.map((x) => x % 29),
  stateScaled29:states.map((x) => Math.floor(x * 29 / modulus)),
  fiveBits29:pack(5).map((x) => x % 29),
  eightBits29:pack(8).map((x) => x % 29)
};
/** @param {number} n */
function mod(n) {return (n % 29 + 29) % 29;}

/** @param {number[]} k */
function maxConstantRun(k) {
  let best = 1;
  for (let i = 0; i < k.length; i++) {
    let n = 1;
    while (n < k.length && k[(i + n) % k.length] === k[i]) n++;
    best = Math.max(best, n);
  }
  return best;
}

/**
 * @param {Set<number>} current
 * @param {number} previous
 * @param {number} cipher
 * @param {number[]} keys
 * @param {boolean} eaConsumes
 * @param {number} maxSkip
 */
function successors(current, previous, cipher, keys, eaConsumes, maxSkip) {
  const out = new Set(), n = keys.length;
  for (const first of current) {
    if (cipher === previous) {
      out.add((first + Number(eaConsumes)) % n);
      continue;
    }
    for (let skipped = 0; skipped <= maxSkip; skipped++) {
      const at = (first + skipped) % n;
      const p = mod(cipher - keys[at]);
      if (p === 28) continue;
      let allRejected = true;
      for (let j = 0; j < skipped; j++)
        if (mod(p + keys[(first + j) % n]) !== previous) {
          allRejected = false;
          break;
        }
      if (allRejected) out.add((at + 1) % n);
    }
  }
  return out;
}

/**
 * @param {number[][]} pageSymbols
 * @param {number[]} key
 * @param {boolean} eaConsumes
 * @param {boolean} ivConsumes
 * @param {"all"|"zero"} initial
 * @param {number} maxSkip
 */
function reach(pageSymbols, key, eaConsumes, ivConsumes, initial, maxSkip) {
  const n = key.length;
  let possible = new Set(initial === "all" ?
    Array.from({length:n}, (_, i) => i) : [0]);
  let pagesDone = 0;
  for (let pageIndex = 0; pageIndex < pageSymbols.length; pageIndex++) {
    const values = pageSymbols[pageIndex];
    if (pageIndex && ivConsumes)
      possible = new Set([...possible].map((i) => (i + 1) % n));
    for (let i = 1; i < values.length; i++) {
      possible = successors(possible, values[i - 1],
        values[i], key, eaConsumes, maxSkip);
      if (!possible.size)
        return {pagesDone, firstFailure:{
          physicalPage:original[pageIndex].page,
          runeIndex:i,
          firstGlyphOfPage:values[0]
        }, finalPhases:0};
    }
    pagesDone++;
  }
  return {pagesDone, firstFailure:null, finalPhases:possible.size};
}

/**
 * Exact forward encoder using independently supplied native plaintext.
 * The source key index is fixed at phase zero on the first rune-bearing page.
 * @param {number[][]} pageSymbols
 * @param {number[]} key
 * @param {boolean} eaConsumes
 * @param {boolean} ivConsumes
 */
function plant(pageSymbols, key, eaConsumes, ivConsumes) {
  const result = [];
  let j = 0, discarded = 0, eas = 0;
  for (let pageIndex = 0; pageIndex < pageSymbols.length; pageIndex++) {
    const plain = pageSymbols[pageIndex], cipher = [plain[0]];
    if (pageIndex && ivConsumes) j = (j + 1) % key.length;
    for (let i = 1; i < plain.length; i++) {
      const p = plain[i];
      if (p === 28) {
        cipher.push(cipher.at(-1));
        eas++;
        if (eaConsumes) j = (j + 1) % key.length;
        continue;
      }
      let c;
      do {
        c = mod(p + key[j]);
        j = (j + 1) % key.length;
        if (c === cipher.at(-1)) discarded++;
      } while (c === cipher.at(-1));
      cipher.push(c);
    }
    assert.equal(cipher.length, plain.length);
    result.push(cipher);
  }
  return {result, discarded, eaMarkers:eas, endingPhase:j};
}

const english = toGematria(read("resources/control/shakespeare_first300k.txt"));
assert(english.length >= 12956);
let at = 0;
const native = original.map((page) => {
  const group = english.slice(at, at + page.indices.length);
  at += page.indices.length;
  return group;
});
assert.equal(at, 12956);
const findings = [];
for (const [name, key] of Object.entries(keyStreams)) {
  const maxSkip = maxConstantRun(key);
  assert(maxSkip <= 3);
  for (const eaConsumes of [false, true])
    for (const ivConsumes of [false, true]) {
      const found = reach(original.map((p) => p.indices), key,
        eaConsumes, ivConsumes, "all", maxSkip);
      assert(found.firstFailure);
      assert(found.firstFailure.physicalPage <= 2);
      const positive = plant(native, key, eaConsumes, ivConsumes);
      const recovered = reach(positive.result, key,
        eaConsumes, ivConsumes, "zero", maxSkip);
      assert.equal(recovered.pagesDone, 55);
      assert.equal(recovered.firstFailure, null);
      findings.push({name, keyPeriod:key.length,
        longestCyclicEqualKeyRun:maxSkip, eaConsumes, ivConsumes,
        original:found,
        planted:{allNativePagesRecognized:true,
          originalShapeNativeRunes:12956, eaMarkers:positive.eaMarkers,
          rejectedKeyDraws:positive.discarded}});
    }
}
assert.equal(findings.length, 16);
console.log(JSON.stringify({
  source:{factors:sums,modulus,seed:sums[2],states:states.length},
  exactOriginalModelCount:findings.length,
  longestSuccessfulOriginalPrefixAtMostPhysicalPage:2,
  originalFullBookSurvivors:0,
  sourceNativePlantPositiveCount:findings.length,
  findings,
  interpretation:"All 16 exact language-free complete-book rejection transport candidates fail by physical p2, even with EVERY initial phase allowed. Other rejection rules, per-page unconstrained resets or untested key encodings are outside scope."
}, null, 2));
