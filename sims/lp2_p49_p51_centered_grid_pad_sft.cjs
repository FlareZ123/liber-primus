'use strict';
/**
 * Source-centred p49/p51 flank / 256-cell p49-p51 grid direct-pad gate.
 * Run: node sims/lp2_p49_p51_centered_grid_pad_sft.cjs
 * Independent hypothesis, not a historical cipher claim.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const load = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const corpus = load('resources/liber-primus/lp2-corpus.json');
const grid = load('resources/liber-primus/lp2-grid-256.json');
const lp1 = fs.readFileSync(path.join(root, 'resources/liber-primus/lp1-plaintext-reference.txt'), 'utf8');
/** @param {number} v */
const mod = (v) => ((v % 29) + 29) % 29;
/** @param {number} page */
const runes = (page) => corpus.pages.find((p) => p.page === page).indices;
/** @param {number[]} a */
const ioc = (a) => {
  const counts = Array(29).fill(0);
  for (const v of a) counts[v]++;
  return counts.reduce((s, n) => s + n * (n - 1), 0) / (a.length * (a.length - 1));
};
// Treat the interrupted p49/p51 rune passage as one 158-rune stream.
// The full table's 256 bytes leave (256 - 158)/2 = 49 bytes on each side.
assert.equal(grid.bytes.length, 256);
assert.equal(runes(49).length, 66);
assert.equal(runes(51).length, 92);
const cipher = [...runes(49), ...runes(51)];
const offset = (grid.bytes.length - cipher.length) / 2;
assert.equal(cipher.length, 158);
assert.equal(offset, 49);
const keyMaps = {
  Q: grid.bytes.map((b) => Math.floor(b / 29)),
  R: grid.bytes.map((b) => b % 29),
};
// Construct a completely external GP29 language proxy from the known LP1 text.
// The editorial ASCII reference is normalised, skipping headings/comments,
// bracketed editor notes, numeric-looking rows and unsupported Latin letters.
const tokens = corpus.translit.map((s, i) => [s, i])
  .sort((a, b) => b[0].length - a[0].length);
const source = [];
for (const line of lp1.split(/\r?\n/)
  .filter((v) => v && !/^\s*[\[#]/.test(v) && !/^\s*\d+\s/.test(v))) {
  const text = line.toUpperCase().replace(/\([^)]*\)/g, '');
  for (let i = 0; i < text.length;) {
    const hit = tokens.find(([s]) => text.startsWith(s, i));
    if (hit) {
      source.push(hit[1]);
      i += hit[0].length;
    } else {
      i++;
    }
  }
}
assert.equal(source.length, 3052);
const pair = new Uint32Array(29 ** 2);
const triple = new Uint32Array(29 ** 3);
for (let i = 2; i < source.length; i++) {
  const j = 29 * source[i - 2] + source[i - 1];
  pair[j]++;
  triple[29 * j + source[i]]++;
}
/** @param {number[]} seq */
const trigram = (seq) => {
  let sum = 0;
  for (let i = 2; i < seq.length; i++) {
    const j = 29 * seq[i - 2] + seq[i - 1];
    sum += Math.log((triple[29 * j + seq[i]] + 0.05) / (pair[j] + 29 * 0.05));
  }
  return sum / (seq.length - 2);
};
/** @param {number[]} c @param {number[]} key @param {number} start @param {number} sign */
const decrypt = (c, key, start, sign) =>
  c.map((v, i) => mod(v + sign * key[(start + i) % 256]));
const outcomes = {};
for (const [label, key] of Object.entries(keyMaps)) {
  const controls = [];
  for (let shift = 0; shift < 256; shift++) {
    for (const sign of [-1, 1]) {
      controls.push({shift, sign, score: trigram(decrypt(cipher, key, shift, sign))});
    }
  }
  controls.sort((a, b) => b.score - a.score);
  outcomes[label] = {};
  for (const sign of [-1, 1]) {
    const seq = decrypt(cipher, key, offset, sign);
    const match = controls.find((v) => v.shift === offset && v.sign === sign);
    const rank = controls.indexOf(match) + 1;
    outcomes[label][sign === -1 ? 'minus' : 'plus'] = {
      ioc: ioc(seq), trigram: match.score, rankOf512: rank,
      firstPageIoc: ioc(seq.slice(0, 66)),
      secondPageIoc: ioc(seq.slice(66)),
    };
    // The corresponding planted native-GP stream must invert exactly.
    const plant = source.slice(0, cipher.length);
    const encrypted = plant.map((v, i) => mod(v - sign * key[(offset + i) % 256]));
    assert.deepEqual(decrypt(encrypted, key, offset, sign), plant);
  }
}
assert.ok(outcomes.Q.plus.ioc > ioc(cipher));
assert.ok(outcomes.Q.plus.trigram < trigram(cipher));
assert.equal(outcomes.Q.plus.rankOf512, 495);
assert.equal(outcomes.Q.minus.rankOf512, 444);
assert.equal(outcomes.R.plus.rankOf512, 384);
assert.equal(outcomes.R.minus.rankOf512, 392);
console.log(JSON.stringify({
  sourcePages: [49, 51], cipherLength: cipher.length, gridLength: grid.bytes.length,
  centredOffset: offset, lp1ProxyTokens: source.length,
  raw: {ioc: ioc(cipher), trigram: trigram(cipher)},
  sourceCentredPadOutcomes: outcomes, independentNativePlant: '158/158 recovered'
}, null, 2));
