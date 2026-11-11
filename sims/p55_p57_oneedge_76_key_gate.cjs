'use strict';

/**
 * Source-constrained p57 -> p55 one-boundary-rune stripping key test.
 * Solved p57: 95 runes = 7-rune title + 19 body words (88 runes).
 * Keep the title, remove one first or last rune from each body word: 76.
 *
 * Apply the resulting exact 76-rune key to original p55 (76 runes) under
 * direct GP29 additive and anti-doublet GP28 rank / primitive-root-log
 * constructions. Each orientation/sign is explicitly enumerated once.
 *
 * Run from repo root: node sims/p55_p57_oneedge_76_key_gate.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} p */
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const raw = read('resources/lp2-transcription.txt');
const lp1 = read('resources/liber-primus/lp1-plaintext-reference.txt');
/** @param {number} a @param {number} b */
const mod = (a, b) => ((a % b) + b) % b;
/** @param {number[]} seq */
function ioc(seq) {
  const frequencies = Array(29).fill(0);
  for (const value of seq) frequencies[value]++;
  return frequencies.reduce((sum, n) => sum + n * (n - 1), 0)
    / (seq.length * (seq.length - 1));
}
/** @param {string} text */
function tokenize(text) {
  const tokens = corpus.translit.map((s, i) => ({s, i}))
    .sort((a, b) => b.s.length - a.s.length);
  const output = [];
  for (const word of text.replace(/^#.*$/gm, ' ').toUpperCase().match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      const match = tokens.find((item) => word.startsWith(item.s, i));
      if (match) {
        output.push(match.i);
        i += match.s.length;
      } else {
        i++;
      }
    }
  }
  return output;
}
/** @param {number[]} plain @param {number[]} key @param {number} sign */
function gp29Encrypt(plain, key, sign) {
  return plain.map((p, i) => mod(p - sign * key[i], 29));
}
/** @param {number[]} cipher @param {number[]} key @param {number} sign */
function gp29Decrypt(cipher, key, sign) {
  return cipher.map((c, i) => mod(c + sign * key[i], 29));
}
const powers = [];
const logs = Array(29).fill(-1);
for (let i = 0, value = 1; i < 28; i++, value = (value * 15) % 29) {
  assert.equal(logs[value], -1);
  powers.push(value);
  logs[value] = i;
}
assert.equal(new Set(powers).size, 28);
/** @param {number[]} plaintext @param {number[]} key @param {string} rank @param {number} sign */
function gp28Encrypt(plaintext, key, rank, sign) {
  let last = 0;
  const ciphertext = [];
  for (let i = 0; i < plaintext.length; i++) {
    const p = plaintext[i];
    const step = p === 28 ? 0
      : rank === 'ordinal' ? 1 + mod(p - sign * (key[i] % 28), 28)
      : powers[mod(p - sign * (key[i] % 28), 28)];
    last = mod(last + step, 29);
    ciphertext.push(last);
  }
  return ciphertext;
}
/** @param {number[]} ciphertext @param {number[]} key @param {string} rank @param {number} sign */
function gp28Decrypt(ciphertext, key, rank, sign) {
  let last = 0;
  const plaintext = [];
  for (let i = 0; i < ciphertext.length; i++) {
    const delta = mod(ciphertext[i] - last, 29);
    last = ciphertext[i];
    plaintext.push(delta === 0 ? 28 : mod(
      (rank === 'ordinal' ? delta - 1 : logs[delta]) + sign * (key[i] % 28), 28
    ));
  }
  return plaintext;
}

const page55 = corpus.pages.find((p) => p.page === 55);
const page57 = corpus.pages.find((p) => p.page === 57);
assert.equal(page55.indices.length, 76);
assert.equal(page57.indices.length, 95);
assert.equal(corpus.pages.filter((p) => p.page <= 55)
  .reduce((sum, p) => sum + p.indices.length, 0), 12956);

const runeLookup = new Map(corpus.runes.map((r, i) => [r, i]));
const split = raw.split('%');
const originalWords = (split[56].replace(/\/\s*/gu, '').match(/[\u16A0-\u16FF]+/gu) || [])
  .map((word) => Array.from(word).map((r) => runeLookup.get(r)));
assert.equal(originalWords.length, 20);
assert.equal(originalWords[0].length, 7);
assert.equal(originalWords.slice(1).flat().length, 88);
assert.deepEqual(originalWords.flat(), page57.indices);
const keyCandidates = {
  'remove-first': originalWords[0].concat(...originalWords.slice(1).map((w) => w.slice(1))),
  'remove-last': originalWords[0].concat(...originalWords.slice(1).map((w) => w.slice(0, -1))),
};
assert(Object.values(keyCandidates).every((k) => k.length === 76));

const native = tokenize(lp1);
assert.equal(native.length, 3504);
let nativeMin = Infinity;
for (let i = 0; i + 76 <= native.length; i++) {
  nativeMin = Math.min(nativeMin, ioc(native.slice(i, i + 76)));
}
assert(Math.abs(nativeMin - 0.0456140350877193) < 1e-12);
const plant = native.slice(0, 76);
plant[19] = 28; // Force explicit transparent-repeat sentinel positive control.

const results = [];
for (const [name, key] of Object.entries(keyCandidates)) {
  for (const sign of [-1, 1]) {
    const out = gp29Decrypt(page55.indices, key, sign);
    assert.deepEqual(gp29Encrypt(out, key, sign), page55.indices);
    assert.deepEqual(gp29Decrypt(gp29Encrypt(plant, key, sign), key, sign), plant);
    results.push({key: name, cipher: 'GP29 additive', sign, ioc: ioc(out),
      prefix: out.slice(0, 30).map((i) => corpus.translit[i]).join(' ')});
  }
  for (const rank of ['ordinal', 'log15']) for (const sign of [-1, 1]) {
    const out = gp28Decrypt(page55.indices, key, rank, sign);
    assert.deepEqual(gp28Encrypt(out, key, rank, sign), page55.indices);
    assert.deepEqual(gp28Decrypt(gp28Encrypt(plant, key, rank, sign), key, rank, sign), plant);
    results.push({key: name, cipher: 'GP28 ' + rank + ' differential', sign,
      ioc: ioc(out), prefix: out.slice(0, 30).map((i) => corpus.translit[i]).join(' ')});
  }
}
assert.equal(results.length, 12);
assert(results.every((x) => x.ioc < nativeMin));
console.log(JSON.stringify({
  p57TitleRunes: 7,
  p57BodyWords: 19,
  p57BodyRunes: 88,
  derivedKeyRunes: 76,
  p55Runes: 76,
  p55RawIoC: ioc(page55.indices),
  p55AdjacentRepeatCount: page55.indices.filter((x, i, a) => i && x === a[i - 1]).length,
  nativeReferenceRunes: native.length,
  native76WindowCount: native.length - 75,
  native76MinimumIoC: nativeMin,
  highestOriginalIoC: Math.max(...results.map((r) => r.ioc)),
  completeExactOriginalAndPlantRoundtrips: 12,
  results,
  conclusion: 'No recovered ordinary GP29 plaintext or authenticated p55 cipher.',
}, null, 2));
