'use strict';

/**
 * SFT: original LP2 p55 conditional two-layer prime-totient gate.
 *
 * Hypothesis only: p50 tokens 1C / 1D / 1E could denote encryption depths
 * two / one / zero for physical scans 72.jpg / 73.jpg / 74.jpg.
 * The original historical p56 encoder is GP29 additive phi(prime) with
 * transparent plaintext F (zero): F bypasses the prime clock entirely.
 *
 * Test the uniquely specified depth-two extension, both independent layers
 * restarting at first prime 2. Preserve all 76 physical p55 rune values.
 * No candidate words or fitted cipher keys are used.
 *
 * Windows: node sims/lp2_terminal_cde_double_phi_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = JSON.parse(fs.readFileSync(path.resolve(
  __dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));

const table = JSON.parse(fs.readFileSync(path.resolve(
  __dirname, '..', 'resources', 'liber-primus', 'base60-grid.json'), 'utf8'));
assert.deepEqual([98, 112, 201].map(i => table.rows.flat()[i]),
  ['1C', '1D', '1E']);
assert.deepEqual([98, 112, 201].map(i => table.byte_rows.flat()[i]),
  [72, 73, 74], 'All three source-level filename pointers must be unchanged');

const mod29 = n => ((n % 29) + 29) % 29;

/** @param {number} needed @returns {number[]} */
function primeTotients(needed) {
  const limit = 12000;
  const composite = new Uint8Array(limit);
  const out = [];
  for (let p = 2; p < limit && out.length < needed; p += 1) {
    if (composite[p]) continue;
    out.push((p - 1) % 29);
    if (p * p < limit) {
      for (let k = p * p; k < limit; k += p) composite[k] = 1;
    }
  }
  assert.equal(out.length, needed);
  return out;
}

const key = primeTotients(500);

/**
 * @param {number[]} plain
 * @param {number} start
 * @returns {number[]}
 */
function encrypt(plain, start = 0) {
  let consumed = 0;
  return plain.map(p => p === 0 ? 0 : mod29(p + key[start + consumed++]));
}

/**
 * Enumerate all *legal* plaintext-F bypass choices in both consecutive layers,
 * merging states by their separate consumed-prime counts. This is an exact
 * reachability test, with no beam limit or language-model score.
 *
 * @param {number[]} cipher
 * @returns {{matched:number, firstImpossible:number|null, finalStates:number, counts:number[]}}
 */
function inverseTwoLayers(cipher) {
  let states = new Set(['0,0']);
  const counts = [];
  for (let i = 0; i < cipher.length; i += 1) {
    const C = cipher[i];
    const next = new Set();
    for (const state of states) {
      const [inner, outer] = state.split(',').map(Number);

      // The second layer emitted a literal F; its input must then be F.
      // The first layer may produce that F by bypass or encryption.
      if (C === 0) {
        next.add(inner + ',' + outer);
        if (mod29(-key[inner]) !== 0) {
          next.add((inner + 1) + ',' + outer);
        }
      }

      // Otherwise, the second layer consumed a prime key. Its input must
      // be non-F. The first layer must also consume a key to emit non-F.
      const intermediate = mod29(C - key[outer]);
      if (intermediate !== 0) {
        const p = mod29(intermediate - key[inner]);
        if (p !== 0) {
          next.add((inner + 1) + ',' + (outer + 1));
        }
      }
    }

    states = next;
    counts.push(states.size);
    if (!states.size) {
      return {matched: i, firstImpossible: i, finalStates: 0, counts};
    }
  }
  return {
    matched: cipher.length,
    firstImpossible: null,
    finalStates: states.size,
    counts
  };
}

/** @param {string} word @returns {number[]} */
function gpWord(word) {
  const tokens = source.translit.map((s, i) => ({s, i}))
    .sort((a,b) => b.s.length - a.s.length);
  const s = word.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/K/g, 'C').replace(/Z/g, 'S')
    .replace(/ING/g, 'NG').replace(/IO/g, 'IA');
  const out = [];
  for (let i = 0; i < s.length;) {
    const token = tokens.find(t => s.startsWith(t.s, i));
    assert.ok(token, 'Unencodable solved p56 plaintext');
    out.push(token.i);
    i += token.s.length;
  }
  return out;
}

const knownP56 = ('AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE ' +
  'THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE')
  .split(' ').flatMap(gpWord);
const originalP56 = source.pages[56].indices;
assert.equal(knownP56.length, 85);
assert.deepEqual(encrypt(knownP56), originalP56,
  'Independent original p56 known-cipher positive failed');

const p57Native = source.pages[57].indices.slice(0, 76);
const doublePlant = encrypt(encrypt(p57Native));
const positive = inverseTwoLayers(doublePlant);
assert.equal(positive.matched, 76);
assert.ok(positive.finalStates > 0,
  'Double-encryption source-native GP positive must be reachable');

const original = source.pages[55].indices;
assert.equal(original.length, 76);
const result = inverseTwoLayers(original);
assert.equal(result.matched, 39);
assert.equal(result.firstImpossible, 39);
assert.equal(result.counts[38], 1);
assert.equal(result.finalStates, 0);

console.log(JSON.stringify({
  model: 'two independent historical prime-totient additive layers, both starting at prime 2, plaintext-F transparent',
  source: 'resources/liber-primus/lp2-corpus.json',
  originalP56Positive: '85/85 exact ciphertext with literal-F bypass',
  nativeP57DoublePlant: '76/76 exact reachability',
  nativeP57DoublePlantFinalStates: positive.finalStates,
  originalP55Runes: original.length,
  originalP55FurthestViablePrefix: result.matched,
  firstImpossibleP55RuneZeroBased: result.firstImpossible,
  firstImpossibleP55RuneOneBased: result.firstImpossible + 1,
  precedingStateCount: result.counts[38],
  recoveredOriginalPlaintext: false,
  scope: 'Excludes only this conditional CDE depth-two phi-prime extension. CDE/scan navigation and layer depth are not author-authenticated.'
}, null, 2));
