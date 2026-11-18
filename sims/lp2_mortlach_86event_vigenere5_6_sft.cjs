'use strict';

/**
 * The historical mortlach 2016 repeated-rune event stream, frozen 5/6-period
 * additive Vigenere best-key attack with a GP-native trigram scorer.
 *
 * Source: original LP2 p0-55 runes and independently solved LP1 native text.
 * Test: node sims/lp2_mortlach_86event_vigenere5_6_sft.cjs
 * A passed screen is not a plaintext claim; inspect the entire decoded stream.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const base = path.join(__dirname, '..');
const source = JSON.parse(fs.readFileSync(path.join(base, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const solved = JSON.parse(fs.readFileSync(path.join(base, 'resources', 'external', 'relikd-solved-gp29-native-v1.json'), 'utf8'));
const map = new Map(source.runes.map((r, i) => [r, i]));
const text = solved.sections.flatMap((s) =>
  Array.from(s.source_text).filter((r) => map.has(r)).map((r) => map.get(r)));
const ciphertext = source.pages.filter((p) => p.page <= 55).flatMap((p) => p.indices);
const events = [];
for (let i = 1; i < ciphertext.length; i++) {
  if (ciphertext[i] === ciphertext[i - 1]) events.push(ciphertext[i]);
}
assert.equal(ciphertext.length, 12956);
assert.equal(events.length, 86);
assert.equal(text.length, 2979);
assert.deepEqual(events.slice(79, 82), [7, 7, 7]);

const uni = new Float64Array(29).fill(0.2);
const bigram = new Float64Array(29 ** 2).fill(0.03);
const trigram = new Float64Array(29 ** 3).fill(0.001);
for (let i = 0; i < text.length; i++) {
  uni[text[i]]++;
  if (i) bigram[29 * text[i - 1] + text[i]]++;
  if (i > 1) trigram[841 * text[i - 2] + 29 * text[i - 1] + text[i]]++;
}
const uLog = uni.map((v) => Math.log(v / text.length));
const bLog = bigram.map((v) => Math.log(v / text.length));
const tLog = trigram.map((v) => Math.log(v / text.length));
/** @param {number} x @returns {number} */
const mod = (x) => (x % 29 + 29) % 29;
/** @param {number[]} c @param {number[]} key @returns {number[]} */
const decode = (c, key) => c.map((x, i) => mod(x - key[i % key.length]));
/** @param {number[]} p @returns {number} */
function score(p) {
  let s = 0;
  for (let i = 0; i < p.length; i++) {
    s += 0.15 * uLog[p[i]];
    if (i) s += 0.22 * bLog[29 * p[i - 1] + p[i]];
    if (i > 1) s += 0.63 * tLog[841 * p[i - 2] + 29 * p[i - 1] + p[i]];
  }
  return s / p.length;
}
/**
 * Fixed-restart greedy coordinate hill climb over all 29 digits in each phase.
 * This is a nonexhaustive search over keys (not an exclusion of all keys).
 * @param {number[]} c
 * @param {number} width
 * @returns {{score: number, key: number[], plain: number[]}}
 */
function attack(c, width) {
  let seed = 0x3301a503;
  const rand = () => {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return (seed >>> 0) / 4294967296;
  };
  let top = { score: -Infinity, key: [], plain: [] };
  for (let n = 0; n < 105; n++) {
    const key = Array.from({length: width}, () => Math.floor(rand() * 29));
    let current = score(decode(c, key));
    for (let round = 0; round < 13; round++) {
      let changed = false;
      for (let j = 0; j < width; j++) {
        let best = key[j];
        let bestScore = current;
        for (let k = 0; k < 29; k++) {
          if (k === key[j]) continue;
          const attempt = key.slice();
          attempt[j] = k;
          const value = score(decode(c, attempt));
          if (value > bestScore) {
            bestScore = value;
            best = k;
          }
        }
        if (bestScore > current) {
          key[j] = best;
          current = bestScore;
          changed = true;
        }
      }
      if (!changed) break;
    }
    if (current > top.score) top = {score: current, key: key.slice(), plain: decode(c, key)};
  }
  return top;
}
const known = source.pages.find((p) => p.page === 57).indices.slice(0, 86);
const seed6 = [15, 8, 18, 3, 6, 19];
const output = { originalEventCount: events.length, originalSourceRunes: ciphertext.length, referenceRunes: text.length, genuineSolvedP57Score: score(known), widths: [] };
for (const width of [5, 6]) {
  const key = seed6.slice(0, width);
  const planted = known.map((v, i) => mod(v + key[i % width]));
  const recovered = attack(planted, width);
  assert.deepEqual(recovered.key, key, 'planted GP-native p57 key must be fully recovered');
  assert.deepEqual(recovered.plain, known);
  const actual = attack(events, width);
  assert(actual.score < -7.0, 'Unexpectedly language-like original channel: inspect candidate');
  output.widths.push({
    width, plantedKeyRecoveredExactly: true,
    originalBestScore: actual.score,
    originalBestKey: actual.key,
    originalBestPlaintextTranslit: actual.plain.map((v) => source.translit[v]).join(''),
    originalNativeDecodedGPIndices: actual.plain
  });
}
console.log(JSON.stringify(output, null, 2));
