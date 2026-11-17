"use strict";
/**
 * Original-source, bounded no-modulus 2016 "words / numbers / direction" gate.
 * One-based absolute word ordinal = GP prime sum of current printed rune word.
 * This is a hypothesis, not a first-party authenticated addressing instruction.
 * @module lp2_2016_absolute_wordprime_map_direct_inverse_sft
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
/** @param {string} p @returns {string} */
function read(p) { return fs.readFileSync(path.join(ROOT, p), "utf8"); }
/** @param {number} x @returns {number} */
function mod29(x) { return ((x % 29) + 29) % 29; }
/** @param {number[]} xs @returns {number} */
function ioc(xs) {
  const f = Array(29).fill(0);
  for (const x of xs) f[x]++;
  return f.reduce((n, x) => n + x * (x - 1), 0) / (xs.length * (xs.length - 1));
}
/**
 * The canonical page transcription uses hyphens, periods, paragraph, segment
 * and chapter marks to separate words. Line/page wraps do not break words.
 * @param {string} raw
 * @param {Map<string, number>} indices
 * @param {number[]} primes
 * @returns {{ vals: number[], sum: number, start: number }[]}
 */
function parseWords(raw, indices, primes) {
  const words = [];
  let vals = [], start = 0, runeCount = 0;
  function flush() {
    if (vals.length) words.push({
      vals, sum: vals.reduce((n, i) => n + primes[i], 0), start
    });
    vals = [];
  }
  for (const ch of raw) {
    if (indices.has(ch)) {
      if (!vals.length) start = runeCount;
      vals.push(indices.get(ch));
      runeCount++;
    } else if ("-.&$§".includes(ch)) flush();
  }
  flush();
  assert.equal(runeCount, 13136);
  return words;
}
/**
 * @param {{sum:number}[]} words
 * @param {number} seed 0-based
 * @returns {{all: number[], cycle: number[], tail: number[]}}
 */
function pointerPath(words, seed) {
  const seen = new Map(), list = [];
  let at = seed;
  while (!seen.has(at)) {
    seen.set(at, list.length);
    list.push(at);
    at = words[at].sum - 1;
    assert.ok(at >= 0 && at < words.length);
  }
  const split = seen.get(at);
  return { all: list, tail: list.slice(0, split), cycle: list.slice(split) };
}
/**
 * Exact feasible key-consumption positions of historical plaintext-F-transparent
 * inverse. A ciphertext F may be either bypassed plaintext F, or an encrypted
 * non-F output. Every encrypted plaintext F is forbidden.
 * @param {number[]} cipher
 * @param {number[]} key
 * @param {number} sign
 */
function fTransparent(cipher, key, sign) {
  let states = new Set([0]), maxStates = 1;
  for (let i = 0; i < cipher.length; i++) {
    const next = new Set();
    for (const consumed of states) {
      if (cipher[i] === 0) next.add(consumed);
      if (mod29(cipher[i] + sign * key[consumed % key.length]) !== 0)
        next.add(consumed + 1);
    }
    states = next;
    maxStates = Math.max(maxStates, states.size);
    if (!states.size) return { legal: false, failAt: i, maxStates, states };
  }
  return { legal: true, failAt: null, maxStates, states };
}
/**
 * @param {number[]} plain
 * @param {number[]} key
 * @param {number} sign
 */
function encryptF(plain, key, sign) {
  const out = [];
  let consumed = 0;
  for (const p of plain) {
    if (p === 0) out.push(0);
    else { out.push(mod29(p - sign * key[consumed % key.length])); consumed++; }
  }
  return { out, consumed };
}
function main() {
  const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
  const alpha = new Map(corpus.runes.map((ch, i) => [ch, i]));
  const words = parseWords(
    read("resources/liber-primus/lp2-transcription.txt"),
    alpha, corpus.prime
  );
  assert.equal(words.length, 2941);
  assert.equal(words.filter(w => w.start < 12956).length, 2896);
  assert.deepEqual(words.slice(0, 2).map(w => w.sum), [347, 315]);
  assert.equal(words[2894].sum, 129); // p55 terminal DJU
  assert.equal(words[2895].sum, 159); // p55 terminal BEI
  assert.equal(Math.max(...words.map(w => w.sum)), 933);

  // Fixed points / cycle lengths / basin sizes of the complete absolute map.
  const basin = new Map();
  for (let i = 0; i < words.length; i++) {
    const cycle = pointerPath(words, i).cycle;
    const signature = [...cycle].sort((a, b) => a - b).join(",");
    if (!basin.has(signature)) basin.set(signature, {
      cycle: cycle.length, runes: cycle.reduce((n, j) => n + words[j].vals.length, 0), nodes: 0
    });
    basin.get(signature).nodes++;
  }
  const basins = [...basin.values()].sort((a, b) => b.nodes - a.nodes);
  assert.deepEqual(basins, [
    { cycle: 37, runes: 186, nodes: 2240 },
    { cycle: 1, runes: 9, nodes: 412 },
    { cycle: 2, runes: 9, nodes: 208 },
    { cycle: 3, runes: 12, nodes: 81 }
  ]);

  const body = corpus.pages.slice(0, 3).flatMap(p => p.indices).slice(13);
  const positive = corpus.pages[57].indices;
  assert.equal(body.length, 716);
  assert.equal(positive.length, 95);
  assert.ok(Math.abs(ioc(positive) - 0.06270996640537514) < 1e-12);
  const outcomes = [];
  for (let seed = 0; seed < 2; seed++) {
    const path = pointerPath(words, seed);
    assert.equal(path.cycle.length, 37);
    assert.equal(path.all.length, seed === 0 ? 49 : 50);
    for (const part of ["all", "cycle"]) {
      for (const register of ["runes", "prime-sum"]) {
        const nodes = path[part];
        const key = register === "runes"
          ? nodes.flatMap(i => words[i].vals)
          : nodes.map(i => words[i].sum % 29);
        for (const sign of [-1, 1]) {
          // 2014 simple additive GP29 inverse; constant phase zero.
          const decoded = body.map((c, i) => mod29(c + sign * key[i % key.length]));
          const encoded = positive.map((p, i) => mod29(p - sign * key[i % key.length]));
          assert.deepEqual(encoded.map((c, i) => mod29(c + sign * key[i % key.length])), positive);
          const synthetic = encryptF(positive, key, sign);
          const syntheticPaths = fTransparent(synthetic.out, key, sign);
          assert.ok(syntheticPaths.legal && syntheticPaths.states.has(synthetic.consumed));
          const originalF = fTransparent(body, key, sign);
          assert.equal(originalF.legal, false);
          outcomes.push({
            seed: seed + 1, part, register, sign, keyLength: key.length,
            allConsumingIoC: ioc(decoded), transparentFFailAt: originalF.failAt,
            transparentFMaxStates: originalF.maxStates
          });
        }
      }
    }
  }
  assert.equal(outcomes.length, 16);
  assert.ok(outcomes.every(o => o.transparentFFailAt <= 247));
  assert.ok(outcomes.every(o => o.allConsumingIoC < 0.036));
  const best = [...outcomes].sort((a, b) => b.allConsumingIoC - a.allConsumingIoC)[0];
  assert.ok(Math.abs(best.allConsumingIoC - 0.03560964175489315) < 1e-12);
  console.log(JSON.stringify({
    input: "original LP2 17.jpg-74.jpg canonical transcription",
    wordCount: words.length, maxGPPrimeSum: 933, basins,
    titleSums: [347, 315], unknownBodyRunes: body.length,
    p0BodyIoC: ioc(body), p57ClearIoC: ioc(positive), best,
    frozenCandidates: outcomes,
    decision: "No intact original p0-body inverse under these 16 direct consumers; no source-selected decryption"
  }, null, 2));
}
if (require.main === module) main();
module.exports = { parseWords, pointerPath, fTransparent, encryptF, main };
