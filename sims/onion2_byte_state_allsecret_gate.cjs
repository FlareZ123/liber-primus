'use strict';

/**
 * Exact all-secret GP29 one-tap capacity bound for the 2014 onion-2
 * archived 256-byte source, treating equal source bytes as a shared
 * stationary cipher state.
 *
 * For each source byte value b, every F29 previous-ciphertext coefficient
 * a_b and every arbitrary secret 29-way substitution pi_b are permitted:
 * P_i = pi_b((C_i + a_b*C_(i-1)) mod29).
 * All 256 key-phase alignments, global and page-local clocks, are exhausted.
 * First glyph of each of the 55 pages is allowed to decode arbitrarily.
 * Run: node sims/onion2_byte_state_allsecret_gate.cjs
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const {nativeGP} = require('./thirteen_dot_grid_8phase_allkey_capacity.cjs');
const {scanNativeWindows, rankedCumulative} =
  require('./thirteen_dot_grid_feedback_topk_gate.cjs');

const ROOT = path.resolve(__dirname, '..');
/** @param {string} relative */
const read = relative => fs.readFileSync(path.join(ROOT, relative), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const record = JSON.parse(read('resources/cicada2014-onion2-timing.json'));
const source = Array.from(Buffer.from(record.final_hex, 'hex'));
const pages = corpus.pages.filter(p => p.page < 56 && p.indices.length)
  .map(p => p.indices);
assert.equal(pages.length, 55);
assert.equal(pages.flat().length, 12956);
assert.equal(source.length, 256);
assert.equal(crypto.createHash('sha256')
  .update(Buffer.from(source)).digest('hex'), record.final_bytes_sha256);
const MOD = 29;
const W = pages.flat().length;
const mod = n => ((n % MOD) + MOD) % MOD;

/**
 * Every page's first glyph is deliberately free for an upper bound. At all
 * subsequent positions, each period-256 source phase has original C_i and
 * C_(i-1) pairs. A single byte value may recur at many source positions.
 * @param {number[][]} cipher
 * @param {'global'|'page'} clock
 */
function phaseHistograms(cipher, clock) {
  const phase = Array.from({length: 256},
    () => Array.from({length: MOD}, () => new Uint16Array(MOD)));
  let global = 0;
  for (const page of cipher) {
    for (let i = 0; i < page.length; i++, global++) {
      if (i === 0) continue;
      const t = (clock === 'global' ? global : i) % 256;
      for (let a = 0; a < MOD; a++)
        phase[t][a][mod(page[i] + a * page[i - 1])]++;
    }
  }
  return phase;
}

/**
 * Pointwise envelope U[k], k=0..29. For each source phase shift and byte
 * state, maximize top-k residual mass over all 29 hidden coefficients;
 * an arbitrary secret GP29 permutation can align those k frequent input
 * types with any fixed k plaintext rune types. All states choose separately.
 *
 * This is exact for the enlarged model that permits the 55 initial glyphs
 * to be arbitrary, and therefore a valid upper bound for a true bijection
 * with any physical-page initial-state convention.
 *
 * @param {number[][]} cipher
 * @param {'global'|'page'} clock
 */
function allSecretCapacity(cipher, clock) {
  const phase = phaseHistograms(cipher, clock);
  const upper = new Int32Array(MOD + 1);
  let best12Phase = -1, worst12Phase = -1;
  let best12 = -1, worst12 = Number.POSITIVE_INFINITY;
  const phase12 = [];
  for (let shift = 0; shift < 256; shift++) {
    const states = Array.from({length: 256},
      () => Array.from({length: MOD}, () => new Uint16Array(MOD)));
    for (let t = 0; t < 256; t++) {
      const target = states[source[(t + shift) % 256]];
      for (let a = 0; a < MOD; a++) {
        const from = phase[t][a], to = target[a];
        for (let r = 0; r < MOD; r++) to[r] += from[r];
      }
    }
    const current = new Int32Array(MOD + 1);
    for (const state of states) {
      const best = new Int32Array(MOD + 1);
      for (const counts of state) {
        const sorted = Array.from(counts).sort((x, y) => y - x);
        let mass = 0;
        for (let k = 1; k <= MOD; k++) {
          mass += sorted[k - 1];
          if (mass > best[k]) best[k] = mass;
        }
      }
      for (let k = 1; k <= MOD; k++) current[k] += best[k];
    }
    // Enlarge the model by allowing all 55 page-initial symbols to belong
    // to the arbitrarily chosen target set of k GP symbols.
    for (let k = 1; k <= MOD; k++) {
      const cap = current[k] + cipher.length;
      if (cap > upper[k]) upper[k] = cap;
    }
    const cap12 = current[12] + cipher.length;
    phase12.push(cap12);
    if (cap12 > best12) { best12 = cap12; best12Phase = shift; }
    if (cap12 < worst12) { worst12 = cap12; worst12Phase = shift; }
  }
  assert.equal(upper[MOD], cipher.flat().length);
  return {upper: Array.from(upper), best12, best12Phase, worst12,
    worst12Phase, mean12: phase12.reduce((s, x) => s + x, 0) / 256,
    phases: 256, byteStates: new Set(source).size};
}

/** @param {number} seed */
function seededKey(seed) {
  let state = seed >>> 0;
  /** @returns {number} */
  function random() {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  }
  return Array.from({length: 256}, () => {
    const pi = Array.from({length: MOD}, (_, i) => i);
    for (let i = MOD - 1; i > 0; i--) {
      const j = random() % (i + 1);
      [pi[i], pi[j]] = [pi[j], pi[i]];
    }
    const inverse = new Array(MOD);
    pi.forEach((v, i) => { inverse[v] = i; });
    return {a: random() % MOD, pi, inverse};
  });
}
/**
 * Full original-layout reversible planted cipher under one frozen source
 * byte state, phase, and secret key. The same physical-page reset rule is
 * used in encryption and decryption.
 * @param {number[][]} input
 * @param {ReturnType<typeof seededKey>} key
 * @param {'global'|'page'} clock
 * @param {number} shift
 * @param {boolean} inverse
 */
function transform(input, key, clock, shift, inverse) {
  let global = 0;
  return input.map(page => {
    const output = new Array(page.length);
    output[0] = page[0];
    global++;
    for (let i = 1; i < page.length; i++, global++) {
      const b = source[((clock === 'global' ? global : i) + shift) % 256];
      const row = key[b];
      if (inverse) {
        output[i] = row.pi[mod(page[i] + row.a * page[i - 1])];
      } else {
        output[i] = mod(row.inverse[page[i]] - row.a * output[i - 1]);
      }
    }
    return output;
  });
}
function main() {
  const gates = {
    global: allSecretCapacity(pages, 'global'),
    page: allSecretCapacity(pages, 'page')
  };
  assert.equal(gates.global.best12, 9157);
  assert.equal(gates.global.best12Phase, 35);
  assert.equal(gates.page.best12, 9137);
  assert.equal(gates.page.best12Phase, 30);
  const controlPaths = {
    Shakespeare: 'resources/control/shakespeare_first300k.txt',
    Gibran: 'resources/control/gibran_prophet_58585.txt',
    Emerson: 'resources/control/emerson_essays_2944.txt'
  };
  const references = {};
  for (const [name, filename] of Object.entries(controlPaths)) {
    const plain = nativeGP(read(filename));
    references[name] = scanNativeWindows(plain, W, gates.global.upper);
    assert.equal(references[name].compatibleWindows, 0);
  }
  assert.deepEqual(Object.values(references).map(r => r.minimumTop12),
    [9651, 9897, 9986]);
  const native = nativeGP(read(controlPaths.Shakespeare))
    .slice(25000, 25000 + W);
  const planted = [];
  let cursor = 0;
  for (const page of pages) {
    planted.push(native.slice(cursor, cursor + page.length));
    cursor += page.length;
  }
  assert.equal(cursor, W);
  const secret = seededKey(0x33012103);
  const encrypted = transform(planted, secret, 'global', 17, false);
  const recovered = transform(encrypted, secret, 'global', 17, true);
  assert.deepEqual(recovered, planted);
  assert.deepEqual(transform(recovered, secret, 'global', 17, false),
    encrypted);
  const originalWrongKey = transform(pages, secret, 'global', 17, true);
  assert.deepEqual(transform(originalWrongKey, secret, 'global', 17, false),
    pages);
  return {
    evidence: 'all-secret exact source-state capacity on original LP2',
    inputRunes: W, sourceBytes: source.length,
    unrestrictedGP29MappingsPerDistinctSourceByte:
      gates.global.byteStates,
    global: {
      allPhaseTop12Max: gates.global.best12,
      selectedPhaseOnlyForBound: gates.global.best12Phase,
      allPhaseTop12Min: gates.global.worst12,
      allPhaseTop12Mean: gates.global.mean12
    },
    pageLocal: {
      allPhaseTop12Max: gates.page.best12,
      selectedPhaseOnlyForBound: gates.page.best12Phase,
      allPhaseTop12Min: gates.page.worst12,
      allPhaseTop12Mean: gates.page.mean12
    },
    references, nativePlant: {
      inputRunes: W, exactRecovered: recovered.flat().length,
      exactReencrypted: encrypted.flat().length,
      trueTop12: rankedCumulative(native)[12],
      originalWrongKeyRoundtrip: pages.flat().length
    },
    interpretation: 'All one-tap per-byte-state secret coefficients, all ' +
      'byte-state GP29 permutations, and 256 source phases fail the ' +
      'source-native top12 necessary condition for either book-global ' +
      'or physical-page-reset period256 clocks. No original key or ' +
      'unknown plaintext is recovered.'
  };
}
if (require.main === module) console.log(JSON.stringify(main(), null, 2));
module.exports = {allSecretCapacity, seededKey, transform, main};
