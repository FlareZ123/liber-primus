'use strict';

/**
 * Bounded original-input test of a source-concatenated RC4 candidate.
 *
 * Frozen hypothesis: the 256 original p49-p51 table bytes encrypt the full
 * 76 p55 GP29 + 85 p56 GP29 + 95 clear p57 GP29 terminal register, with RC4
 * key made from archived 2014 delivery-page <title>133</title> / id="331".
 *
 * This is an unselected cipher hypothesis, not an authenticated solution.
 * No external packages, downloads, writes, or parameter fitting.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

function load(relativePath) {
  return JSON.parse(fs.readFileSync(
    path.resolve(__dirname, '..', 'resources', 'liber-primus', relativePath),
    'utf8'
  ));
}

/**
 * Deterministic RC4 byte keystream (the classical 256-state KSA+PRGA).
 * @param {string} textKey ASCII text key
 * @param {number} count byte count
 * @returns {number[]}
 */
function stream(textKey, count) {
  const state = Array.from({ length: 256 }, (_, i) => i);
  const key = Array.from(Buffer.from(textKey, 'ascii'));
  let j = 0;
  for (let i = 0; i < 256; i += 1) {
    j = (j + state[i] + key[i % key.length]) & 255;
    [state[i], state[j]] = [state[j], state[i]];
  }
  let i = 0;
  j = 0;
  const output = [];
  for (let t = 0; t < count; t += 1) {
    i = (i + 1) & 255;
    j = (j + state[i]) & 255;
    [state[i], state[j]] = [state[j], state[i]];
    output.push(state[(state[i] + state[j]) & 255]);
  }
  return output;
}

const corpus = load('lp2-corpus.json');
const table = load('lp2-grid-256.json').pages.flatMap((p) => p.bytes);
const p55 = corpus.pages[55].indices;
const p56 = corpus.pages[56].indices;
const p57 = corpus.pages[57].indices;
assert.equal(p55.length, 76);
assert.equal(p56.length, 85);
assert.equal(p57.length, 95);
assert.equal(p55.length + p56.length + p57.length, 256);
assert.equal(table.length, 256);

for (const [key, expectedMatches, expectedOutOfAlphabet] of [
  ['133331', 0, 86],
  ['331133', 1, 84]
]) {
  const keystream = stream(key, table.length);
  const output = table.map((b, i) => b ^ keystream[i]);
  const last = output.slice(161);
  const matches = last.filter((value, i) => value === p57[i]).length;
  const outOfAlphabet = last.filter((value) => value >= 29).length;
  assert.equal(matches, expectedMatches);
  assert.equal(outOfAlphabet, expectedOutOfAlphabet);

  const positive = Array.from({ length: 256 }, (_, i) => p57[i % p57.length]);
  const planted = positive.map((b, i) => b ^ keystream[i]);
  assert.deepEqual(planted.map((b, i) => b ^ keystream[i]), positive);
  assert.deepEqual(planted.map((b, i) => b ^ keystream[i]).slice(161),
    positive.slice(161));

  console.log(JSON.stringify({
    key,
    receiver: 'p49-p51 registered 256-byte table',
    terminalClearControl: 'p57 original 95 GP ordinal runes',
    exactKnownRuneMatches: matches,
    totalKnownRunes: p57.length,
    outputsOutsideGP29: outOfAlphabet,
    originalP55Prefix: output.slice(0, 16),
    originalP57Prefix: last.slice(0, 16),
    fullyPlanted256RunesPass: true
  }));
}
console.log('PASS: The two archived source-order ASCII RC4 keys do not decode the known p57 tail.');
