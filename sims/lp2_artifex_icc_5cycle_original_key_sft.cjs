'use strict';

/**
 * Original LP2 Artifex ICC profile as a fixed, repeated GP29 additive key.
 * Source: original 17.jpg APP2, 2576-byte ICC body (not the 14-byte wrapper).
 * This tests the exact 5*2576 = 12880 p0-p54 rune-length equality.
 *
 * Run: node sims/lp2_artifex_icc_5cycle_original_key_sft.cjs
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));
const jpg = fs.readFileSync(path.join(root, 'resources', 'liber-primus', '17.jpg'));
const digest = b => crypto.createHash('sha256').update(b).digest('hex');

/**
 * @param {Buffer} input
 * @returns {Buffer}
 */
function extractICC(input) {
  assert.equal(input.readUInt16BE(0), 0xffd8);
  let pos = 2, result = null;
  while (pos + 4 < input.length) {
    assert.equal(input[pos], 0xff);
    while (input[pos] === 0xff) pos++;
    const marker = input[pos++];
    if (marker === 0xda || marker === 0xd9) break;
    const length = input.readUInt16BE(pos);
    const payload = input.subarray(pos + 2, pos + length);
    if (marker === 0xe2 && payload.subarray(0, 12).toString('ascii') === 'ICC_PROFILE\0') {
      assert.equal(result, null);
      assert.equal(payload[12], 1);
      assert.equal(payload[13], 1);
      result = payload.subarray(14);
    }
    pos += length;
  }
  assert.ok(result);
  assert.equal(result.length, 2576);
  assert.equal(digest(result), '942e0f66212eb8ad252706559da5007d893d7350652704f8d115d5e6074479d0');
  return result;
}

const profile = extractICC(jpg);
const sourcePages = corpus.pages.filter(page => page.page <= 54);
assert.equal(sourcePages.length, 55);
assert.equal(sourcePages.find(page => page.page === 50).indices.length, 0);
const original = sourcePages.flatMap(page => page.indices);
assert.equal(original.length, 12880);
assert.equal(original.length, 5 * profile.length);
assert.equal(corpus.pages.find(page => page.page === 55).indices.length, 76);
assert.equal(original.length + 76, 12956);

/**
 * @param {number[]} values
 * @returns {number}
 */
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}
/**
 * Source-prescribed GP29 add/subtract using raw ICC bytes reduced modulo29.
 * @param {boolean} pageReset Whether key clock resets at original page boundaries
 * @param {number} sign
 * @returns {number[]}
 */
function decodeOriginal(pageReset, sign) {
  let clock = 0;
  const out = [];
  for (const page of sourcePages) {
    if (pageReset) clock = 0;
    for (const ciphertext of page.indices) {
      const key = profile[clock % profile.length] % 29;
      out.push((ciphertext + sign * key + 29) % 29);
      clock++;
    }
  }
  return out;
}

/** @param {number[]} values */
const gp = values => values.map(i => corpus.translit[i]).join('');
const known = corpus.pages.find(page => page.page === 57).indices;
assert.equal(known.length, 95);
assert.ok(ioc(known) > 0.06);
// End-to-end cipher plant using a genuinely solved native-GP page as plaintext.
const planted = known.map((p, i) => (p + profile[i] % 29) % 29);
const recovered = planted.map((c, i) => (c - profile[i] % 29 + 29) % 29);
assert.deepEqual(recovered, known);
const tests = [];
for (const pageReset of [false, true]) {
  for (const sign of [-1, 1]) {
    const output = decodeOriginal(pageReset, sign);
    assert.equal(output.length, original.length);
    let index = 0, clock = 0;
    for (const page of sourcePages) {
      if (pageReset) clock = 0;
      for (const cipher of page.indices) {
        const key = profile[clock % profile.length] % 29;
        assert.equal((output[index] - sign * key + 29) % 29, cipher);
        index++; clock++;
      }
    }
    tests.push({
      keyClock: pageReset ? 'reset_each_printed_page' : 'continuous_five_cycles',
      sign,
      sourceRuneCount: output.length,
      ioc: ioc(output),
      first30NativeGp: gp(output.slice(0, 30)),
      final30NativeGp: gp(output.slice(-30)),
      sampleLength95Ioc: ioc(output.slice(0, 95))
    });
  }
}
console.log(JSON.stringify({
  sourceImage: 'resources/liber-primus/17.jpg',
  iccProfileSize: profile.length,
  iccProfileSha256: digest(profile),
  p0through54Runes: original.length,
  p55Runes: 76,
  originalIoc: ioc(original),
  solvedP57NativeGpIoc: ioc(known),
  authenticP57PlantExact: true,
  forwardReconstructionExact: true,
  results: tests
}, null, 2));
