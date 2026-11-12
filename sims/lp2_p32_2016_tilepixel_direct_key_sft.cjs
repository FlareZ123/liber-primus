#!/usr/bin/env node
"use strict";

/**
 * Source-locked original-cipher p32 ↔ signed 2016 JPEG 11×11 tile-key gate.
 *
 * Human route: the p32 top row/left column GP primes exactly partition the
 * signed 563×569 carrier canvas. Only literal center RGB and whole-tile mean
 * are read, each converted through either common byte→GP29 map (mod29 or
 * floor(byte*29/256)). Test both additive directions on the complete original
 * 121-rune page, with no key origin, phase, fitted traversal or image filter.
 *
 * Reproducer: node sims/lp2_p32_2016_tilepixel_direct_key_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const decodeJpeg = require("./vendor/jpeg-js-decoder.cjs");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const pixels = decodeJpeg(
  fs.readFileSync(path.join(root, "resources", "historical", "cicada2016-4gq25.jpg")),
  {useTArray: true, formatAsRGBA: false, maxResolutionInMP: 2}
);
const source = corpus.pages[32].indices;
assert.equal(source.length, 121);
assert.deepEqual([pixels.width, pixels.height], [563, 569]);
assert.equal(pixels.data.length, 563 * 569 * 3);

/**
 * @param {number[]} x
 * @returns {number[]}
 */
function cumulative(x) {
  const a = [0];
  for (const z of x) a.push(a[a.length - 1] + z);
  return a;
}

/**
 * @param {number} x
 * @returns {number}
 */
const mod29 = x => ((x % 29) + 29) % 29;

/**
 * @param {number[]} seq
 * @returns {number}
 */
function ioc(seq) {
  const n = seq.length;
  const counts = Array(29).fill(0);
  for (const x of seq) counts[x]++;
  return counts.reduce((acc, m) => acc + m * (m - 1), 0) / (n * (n - 1));
}

/**
 * @param {string} input
 * @returns {number[]}
 */
function gpEncode(input) {
  const tokens = corpus.translit.map((token, index) => ({token, index})).sort((a, b) => b.token.length - a.token.length);
  const clean = input.toUpperCase().replaceAll("K", "C").replaceAll("Q", "C")
    .replaceAll("V", "U").replaceAll("Z", "S").replace(/[^A-Z]/gu, "");
  const out = [];
  for (let p = 0; p < clean.length;) {
    const token = tokens.find(t => clean.startsWith(t.token, p));
    assert.ok(token, "GP transliteration failed");
    out.push(token.index);
    p += token.token.length;
  }
  return out;
}

/**
 * @param {number[]} text
 * @returns {(seq:number[]) => number}
 */
function trainTrigram(text) {
  const tri = new Map();
  const bi = new Map();
  for (let i = 2; i < text.length; i++) {
    const b = text[i - 2] * 29 + text[i - 1];
    const t = b * 29 + text[i];
    tri.set(t, (tri.get(t) || 0) + 1);
    bi.set(b, (bi.get(b) || 0) + 1);
  }
  return seq => {
    let score = 0;
    for (let i = 2; i < seq.length; i++) {
      const b = seq[i - 2] * 29 + seq[i - 1];
      score += Math.log(((tri.get(b * 29 + seq[i]) || 0) + 0.1) /
        ((bi.get(b) || 0) + 29 * 0.1));
    }
    return score / (seq.length - 2);
  };
}

const weights = source.map(i => corpus.prime[i]);
const xe = cumulative(weights.slice(0, 11));
const ye = cumulative(Array.from({length: 11}, (_, row) => weights[row * 11]));
assert.equal(xe.at(-1), 563);
assert.equal(ye.at(-1), 569);
assert.deepEqual(weights.slice(0, 11), [73, 5, 101, 19, 101, 3, 43, 107, 13, 19, 79]);
assert.deepEqual(Array.from({length: 11}, (_, i) => weights[i * 11]),
  [73, 23, 5, 23, 79, 59, 53, 79, 59, 109, 7]);

const center = [];
const mean = [];
for (let row = 0; row < 11; row++) {
  for (let col = 0; col < 11; col++) {
    const xmid = Math.floor((xe[col] + xe[col + 1] - 1) / 2);
    const ymid = Math.floor((ye[row] + ye[row + 1] - 1) / 2);
    const k = 3 * (ymid * pixels.width + xmid);
    center.push(Math.round((pixels.data[k] + pixels.data[k + 1] + pixels.data[k + 2]) / 3));
    let sum = 0;
    let count = 0;
    for (let y = ye[row]; y < ye[row + 1]; y++) {
      for (let x = xe[col]; x < xe[col + 1]; x++) {
        const i = 3 * (y * pixels.width + x);
        sum += pixels.data[i] + pixels.data[i + 1] + pixels.data[i + 2];
        count += 3;
      }
    }
    mean.push(Math.round(sum / count));
  }
}
assert.equal(center.length, 121);
assert.equal(mean.length, 121);
for (const k of center.concat(mean)) assert.ok(k >= 0 && k <= 255);

const shakespeare = gpEncode(fs.readFileSync(
  path.join(root, "resources", "control", "shakespeare_first300k.txt"), "utf8"));
assert.ok(shakespeare.length > 180000);
const score = trainTrigram(shakespeare.slice(0, 140000));
const independentEnglish = shakespeare.slice(160000, 160121);
const baseline = {
  original: {ioc: ioc(source), trigram: score(source)},
  heldoutEnglish: {ioc: ioc(independentEnglish), trigram: score(independentEnglish)}
};

const findings = [];
for (const [channel, bytes] of Object.entries({center, mean})) {
  for (const [reducer, convert] of Object.entries({
    mod29: byte => byte % 29,
    scaled29: byte => Math.floor(byte * 29 / 256)
  })) {
    const key = bytes.map(convert);
    assert.equal(key.length, source.length);
    const synthetic = independentEnglish.map((p, i) => mod29(p + key[i]));
    const plant = synthetic.map((c, i) => mod29(c - key[i]));
    assert.deepEqual(plant, independentEnglish, "source-native p32 length positive plant");
    for (const sign of [-1, +1]) {
      const plaintext = source.map((c, i) => mod29(c + sign * key[i]));
      const check = plaintext.map((p, i) => mod29(p - sign * key[i]));
      assert.deepEqual(check, source);
      findings.push({
        channel, reducer, sign,
        ioc: ioc(plaintext), trigram: score(plaintext),
        prefix: plaintext.slice(0, 28).map(i => corpus.translit[i]).join("")
      });
    }
  }
}
findings.sort((a, b) => b.trigram - a.trigram);
console.log(JSON.stringify({type: "signed2016-tile-pixel-p32-direct-source-key", originalPage: 32,
  imagePixels: [563, 569], sourceRunes: source.length, baseline,
  candidates: findings, plantRunchars: independentEnglish.length, allRoundTrips: true}, null, 2));
