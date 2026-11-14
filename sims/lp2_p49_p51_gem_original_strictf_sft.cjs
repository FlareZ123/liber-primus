'use strict';

/**
 * Original LP2 table GEM → immediately adjacent rune pages (p49, p51).
 * Self-contained Node.js 22 SFT. Run from any working directory:
 * node sims/lp2_p49_p51_gem_original_strictf_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..', 'resources', 'liber-primus');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'lp2-corpus.json'), 'utf8'));
const grid = JSON.parse(fs.readFileSync(path.join(root, 'lp2-grid-256.json'), 'utf8'));
const byteValues = grid.bytes;
const gp = corpus.translit;
const page = (n) => corpus.pages.find((x) => x.page === n).indices;

/** @param {number} cell One-based original row-major table cell. @returns {number} */
function nextTableCell(cell) {
  const byte = byteValues[cell - 1];
  const d = Math.floor(byte / 29) + 1;
  const dr = { 1: 1, 2: 1, 3: 1, 4: 0, 5: 0, 6: 0, 7: -1, 8: -1, 9: -1 }[d];
  const dc = { 1: -1, 2: 0, 3: 1, 4: -1, 5: 0, 6: 1, 7: -1, 8: 0, 9: 1 }[d];
  const row = Math.floor((cell - 1) / 8) + dr;
  const col = (cell - 1) % 8 + dc;
  assert.ok(row >= 0 && row < 32 && col >= 0 && col < 8);
  return row * 8 + col + 1;
}

assert.equal(byteValues.length, 256);
assert.deepEqual([119, 127, 128].map((i) => byteValues[i - 1]), [35, 163, 193]);
assert.deepEqual([119, 127, 128].map(nextTableCell), [127, 128, 119]);
const key = [119, 127, 128].map((i) => byteValues[i - 1] % 29);
assert.deepEqual(key, [6, 18, 19]);
assert.equal(key.map((i) => gp[i]).join(''), 'GEM');

/** @typedef {{ clock: number, plain: number[], bypasses: number[] }} State */
/**
 * The original LP1/p56 rule is: plaintext F (GP index 0) emits F without
 * consuming the key; all other plaintexts emit (plain + key) mod 29.
 * A ciphertext F can be a literal F or an encrypted non-F.
 *
 * @param {number[]} ciphertext
 * @param {number} phase
 * @returns {{ firstImpossible: number|null, candidates: State[] }}
 */
function inverse(ciphertext, phase) {
  /** @type {State[]} */
  let states = [{ clock: phase, plain: [], bypasses: [] }];
  for (let i = 0; i < ciphertext.length; i += 1) {
    const c = ciphertext[i];
    /** @type {State[]} */
    const next = [];
    for (const state of states) {
      if (c === 0) {
        next.push({
          clock: state.clock,
          plain: [...state.plain, 0],
          bypasses: [...state.bypasses, i]
        });
      }
      const p = (c - key[state.clock] + 29) % 29;
      if (p !== 0) {
        next.push({
          clock: (state.clock + 1) % key.length,
          plain: [...state.plain, p],
          bypasses: state.bypasses
        });
      }
    }
    if (next.length === 0) return { firstImpossible: i, candidates: [] };
    states = next;
  }
  return { firstImpossible: null, candidates: states };
}

/** @param {number[]} plaintext @param {number} phase @returns {number[]} */
function forward(plaintext, phase) {
  let clock = phase;
  return plaintext.map((p) => {
    if (p === 0) return 0;
    const c = (p + key[clock]) % 29;
    clock = (clock + 1) % key.length;
    return c;
  });
}

const p49 = page(49);
const p51 = page(51);
assert.equal(p49.length, 66);
assert.equal(p51.length, 92);
assert.deepEqual(p49.flatMap((v, i) => v === 0 ? [i] : []), [3, 33]);
assert.deepEqual(p51.flatMap((v, i) => v === 0 ? [i] : []), [3, 57, 60, 91]);

const sourceP57 = page(57);
assert.equal(sourceP57.length, 95);
for (let phase = 0; phase < 3; phase += 1) {
  const ciphertext = forward(sourceP57, phase);
  const recovered = inverse(ciphertext, phase);
  assert.equal(recovered.firstImpossible, null);
  assert.ok(recovered.candidates.some((s) => s.plain.join(',') === sourceP57.join(',')));
  assert.deepEqual(forward(sourceP57, phase), ciphertext);
  console.log('PLANTED_ORIGINAL_P57', JSON.stringify({
    phase, sourceRuneCount: sourceP57.length,
    recoveredWholeSource: true, legalInversePaths: recovered.candidates.length
  }));
}

for (const [name, data, expected] of [
  ['p49', p49, [1, 25, 25]],
  ['p51', p51, [38, 38, 24]],
  ['p49+table+p51', [...p49, ...p51], [1, 25, 25]]
]) {
  const failures = [0, 1, 2].map((phase) => inverse(data, phase));
  assert.deepEqual(failures.map((f) => f.firstImpossible), expected);
  assert.ok(failures.every((f) => f.candidates.length === 0));
  console.log('ORIGINAL_SOURCE_NEGATIVE', JSON.stringify({
    region: name, runeCount: data.length,
    earliestImpossibleZeroBasedByGEMPhase: expected,
    fullLegalInverses: 0
  }));
}
console.log('PASS: source GEM, three planted controls, both original adjacent pages, cross-table clock.');
