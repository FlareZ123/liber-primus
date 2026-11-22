'use strict';

/**
 * Source-frozen original LP2 test of one Jung Red Book running-key hypothesis.
 * Windows 11 / Node.js 22; read-only, no dependencies.
 *
 * The 19-word excerpt was published in 2009 (Liber Secundus, OB 41).
 * This is an analyst-selected possible receiver, not a Cicada instruction.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'),
  'utf8',
));

const quote = [
  'The circumference of outer life should be made smaller.',
  'Much more secrecy, solitary fires, fire, caverns, dark wide forests.',
].join(' ');
const glyphs = corpus.translit.map((text, index) => ({ text, index }))
  .sort((a, b) => b.text.length - a.text.length);
const normalized = quote.toUpperCase().replace(/[^A-Z]/g, '')
  .replace(/V/g, 'U').replace(/K/g, 'C').replace(/Q/g, 'CW');

/** @param {string} text @returns {number[]} */
function encodeGP(text) {
  const result = [];
  for (let offset = 0; offset < text.length;) {
    const glyph = glyphs.find((g) => text.startsWith(g.text, offset));
    assert.ok(glyph, `Unencodable excerpt character at ${offset}`);
    result.push(glyph.index);
    offset += glyph.text.length;
  }
  return result;
}
/** @param {number} n @returns {number} */
function mod29(n) {
  return ((n % 29) + 29) % 29;
}
/**
 * Literal plaintext F (index 0) emits F and consumes no key symbol.
 * @param {number[]} plain @param {number[]} key @param {number} sign
 * @returns {number[]}
 */
function encrypt(plain, key, sign) {
  const out = [];
  let clock = 0;
  for (const p of plain) {
    if (p === 0) {
      out.push(0);
    } else {
      assert.ok(clock < key.length);
      out.push(mod29(p + sign * key[clock]));
      clock++;
    }
  }
  return out;
}
/**
 * Retains every distinct key-consumption state, thereby preserving all
 * feasible literal-F interpretations of ciphertext index 0.
 * @param {number[]} cipher @param {number[]} key @param {number} sign
 * @returns {{failure: number|null, states: Map<number, number[]>}}
 */
function strictInverse(cipher, key, sign) {
  /** @type {Map<number, number[]>} */
  let states = new Map([[0, []]]);
  for (let i = 0; i < cipher.length; i++) {
    /** @type {Map<number, number[]>} */
    const next = new Map();
    for (const [clock, plain] of states) {
      if (cipher[i] === 0) next.set(clock, plain.concat(0));
      assert.ok(clock < key.length);
      const p = mod29(cipher[i] - sign * key[clock]);
      if (p !== 0) next.set(clock + 1, plain.concat(p));
    }
    if (!next.size) return { failure: i, states: next };
    states = next;
  }
  return { failure: null, states };
}

const key = encodeGP(normalized);
const original = corpus.pages[55].indices;
const control = corpus.pages[57].indices.slice(0, original.length);
assert.equal(original.length, 76);
assert.equal(control.length, 76);
assert.equal(key.length, 98);
assert.deepEqual(key.slice(0, 4), [2, 18, 5, 10]);
assert.deepEqual(original.slice(0, 4), [21, 25, 19, 10]);

for (const sign of [1, -1]) {
  const originalInverse = strictInverse(original, key, sign);
  assert.equal(originalInverse.states.size, 0);
  assert.equal(originalInverse.failure, sign === 1 ? 3 : 50);

  // Actual solved p57 runes are a true independent source-language plant.
  const plantedCipher = encrypt(control, key, sign);
  const plantedInverse = strictInverse(plantedCipher, key, sign);
  assert.equal(plantedInverse.failure, null);
  assert.ok(plantedInverse.states.size > 0);
  for (const candidate of plantedInverse.states.values()) {
    assert.deepEqual(encrypt(candidate, key, sign), plantedCipher);
  }
  process.stdout.write(JSON.stringify({
    direction: sign,
    originalFirstImpossibleRune: originalInverse.failure,
    plantedRuneCount: plantedCipher.length,
    plantedViableClockStates: plantedInverse.states.size,
  }) + '\n');
}
process.stdout.write('Jung OB41 p55 frozen GP29 strict-F consumer rejected; solved GP control passes.\n');
