'use strict';

/**
 * SFT: source-forward AES schedule/round-state gate on the LP2 pp49-51 grid.
 * Reference: NIST FIPS 197, Algorithms 1 and 2 (2023 editorial update).
 * Run: node sims/lp2_grid_aes_schedule_round_state_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const RCON = [0, 1, 2, 4, 8, 16, 32, 64, 128, 27, 54];
/** @param {number} a @param {number} b @returns {number} */
function mul(a, b) {
  let v = 0;
  for (let i = 0; i < 8; i++) {
    if (b & 1) v ^= a;
    const hi = a & 128;
    a = (a << 1) & 255;
    if (hi) a ^= 27;
    b >>= 1;
  }
  return v;
}
/** @param {number} a @param {number} n @returns {number} */
function power(a, n) {
  let v = 1;
  while (n) {
    if (n & 1) v = mul(v, a);
    a = mul(a, a);
    n >>= 1;
  }
  return v;
}
/** @param {number} x @param {number} n @returns {number} */
function rol(x, n) { return ((x << n) | (x >> (8 - n))) & 255; }
const SBOX = Uint8Array.from({ length: 256 }, (_, i) => {
  const x = i ? power(i, 254) : 0;
  return x ^ rol(x, 1) ^ rol(x, 2) ^ rol(x, 3) ^ rol(x, 4) ^ 99;
});
/** @param {Buffer|Uint8Array} key @returns {Buffer} */
function expand(key) {
  const nk = key.length / 4, nr = nk + 6;
  assert([4, 6, 8].includes(nk));
  const w = Buffer.alloc(16 * (nr + 1));
  Buffer.from(key).copy(w);
  for (let i = nk; i < 4 * (nr + 1); i++) {
    let t = Array.from(w.subarray(4 * (i - 1), 4 * i));
    if (i % nk === 0) {
      t = [SBOX[t[1]], SBOX[t[2]], SBOX[t[3]], SBOX[t[0]]];
      t[0] ^= RCON[i / nk];
    } else if (nk === 8 && i % nk === 4) {
      t = t.map(v => SBOX[v]);
    }
    for (let j = 0; j < 4; j++) w[4 * i + j] = w[4 * (i - nk) + j] ^ t[j];
  }
  return w;
}
/** @param {Buffer|Uint8Array} s @returns {Buffer} */
function shiftSub(s) {
  const v = Buffer.alloc(16);
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++)
    v[r + 4 * c] = SBOX[s[r + 4 * ((c + r) % 4)]];
  return v;
}
/** @param {Buffer|Uint8Array} s @returns {Buffer} */
function mix(s) {
  const v = Buffer.alloc(16);
  for (let c = 0; c < 4; c++) {
    const i = 4 * c, a = s.subarray(i, i + 4);
    v[i] = mul(a[0], 2) ^ mul(a[1], 3) ^ a[2] ^ a[3];
    v[i + 1] = a[0] ^ mul(a[1], 2) ^ mul(a[2], 3) ^ a[3];
    v[i + 2] = a[0] ^ a[1] ^ mul(a[2], 2) ^ mul(a[3], 3);
    v[i + 3] = mul(a[0], 3) ^ a[1] ^ a[2] ^ mul(a[3], 2);
  }
  return v;
}
/** @param {Buffer|Uint8Array} a @param {Buffer|Uint8Array} b @returns {Buffer} */
function bxor(a, b) { return Buffer.from(a.map((v, i) => v ^ b[i])); }
/** @param {Buffer|Uint8Array} state @param {boolean} final @returns {Buffer} */
function core(state, final) {
  const t = shiftSub(state);
  return final ? t : mix(t);
}
/** @param {Buffer} key @param {Buffer} pt @returns {Buffer[]} */
function trace(key, pt) {
  const w = expand(key), nr = key.length / 4 + 6;
  const states = [bxor(pt, w.subarray(0, 16))];
  for (let r = 1; r <= nr; r++)
    states.push(bxor(core(states[r - 1], r === nr), w.subarray(16 * r, 16 * (r + 1))));
  return states;
}
/** @param {Buffer} data @param {number} nk @returns {object} */
function scheduleGate(data, nk) {
  const length = 16 * (nk + 7);
  let matches = 0, bestBytes = -1, bestOffset = -1, maxPrefix = 0;
  for (let at = 0; at + length <= data.length; at++) {
    const predicted = expand(data.subarray(at, at + nk * 4));
    let good = 0, prefix = 0, open = true;
    for (let j = 0; j < length; j++) {
      const ok = predicted[j] === data[at + j];
      if (ok) good++;
      if (ok && open) prefix++;
      else open = false;
    }
    if (good > bestBytes) { bestBytes = good; bestOffset = at; }
    if (prefix > maxPrefix) maxPrefix = prefix;
    if (good === length) matches++;
  }
  return { bits: nk * 32, scheduleLength: length, windows: data.length - length + 1,
    exact: matches, bestBytes, bestOffset, maxPrefix };
}
/**
 * Exact FIPS key expansion word equations for three consecutive inferred round keys.
 * @param {Buffer} words 48 bytes of adjacent round keys
 * @param {number} nk
 * @param {number} round first true AES round index, >=1
 * @returns {number} contradictory bytes
 */
function scheduleErrors(words, nk, round) {
  let errors = 0;
  for (let j = nk; j < 12; j++) {
    const i = 4 * round + j;
    const prev = Array.from(words.subarray(4 * (j - 1), 4 * j));
    let t = prev;
    if (i % nk === 0) {
      t = [SBOX[prev[1]], SBOX[prev[2]], SBOX[prev[3]], SBOX[prev[0]]];
      t[0] ^= RCON[i / nk];
    } else if (nk === 8 && i % nk === 4) t = prev.map(v => SBOX[v]);
    for (let b = 0; b < 4; b++)
      if ((words[4 * j + b] ^ words[4 * (j - nk) + b]) !== t[b]) errors++;
  }
  return errors;
}
/**
 * Exhaust consecutive four-state AES post-round trajectories: all byte phases,
 * block starts, and legal round numbers. No independent keys are fitted.
 * @param {Buffer} data @param {number} nk @returns {object}
 */
function stateGate(data, nk) {
  const nr = nk + 6;
  let tested = 0, exact = 0, minErrors = Infinity, best = null;
  for (let shift = 0; shift < 16; shift++) {
    const n = Math.floor((data.length - shift) / 16);
    for (let block = 0; block + 3 < n; block++) {
      const s = Array.from({ length: 4 }, (_, j) =>
        data.subarray(shift + 16 * (block + j), shift + 16 * (block + j + 1)));
      for (let round = 1; round <= nr - 2; round++) {
        const keys = Buffer.alloc(48);
        for (let j = 0; j < 3; j++)
          bxor(s[j + 1], core(s[j], round + j === nr)).copy(keys, 16 * j);
        const errors = scheduleErrors(keys, nk, round);
        tested++;
        if (errors < minErrors) { minErrors = errors; best = { shift, block, round }; }
        if (errors === 0) exact++;
      }
    }
  }
  return { bits: nk * 32, tested, exact, minimumContradictoryBytes: minErrors, best };
}
/** @param {number} length @returns {Buffer} */
function noise(length) {
  const b = Buffer.alloc(length);
  for (let i = 0; i < length; i++)
    b[i] = crypto.createHash('sha256').update('LP2-AES-control-' + Math.floor(i / 32)).digest()[i % 32];
  return b;
}
function positiveControls() {
  assert.equal(SBOX[0], 0x63);
  assert.equal(SBOX[0x53], 0xed);
  assert.equal(SBOX[255], 0x16);
  const pt = Buffer.from('00112233445566778899aabbccddeeff', 'hex');
  const vectors = [
    ['000102030405060708090a0b0c0d0e0f', '69c4e0d86a7b0430d8cdb78070b4c55a'],
    ['000102030405060708090a0b0c0d0e0f1011121314151617', 'dda97ca4864cdfe06eaf70a0ec0d7191'],
    ['000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f', '8ea2b7ca516745bfeafc49904b496089'],
  ];
  return vectors.map(([keyHex, ctHex]) => {
    const key = Buffer.from(keyHex, 'hex'), nk = key.length / 4, nr = nk + 6;
    const ref = crypto.createCipheriv('aes-' + (nk * 32) + '-ecb', key, null);
    ref.setAutoPadding(false);
    const expected = Buffer.from(ctHex, 'hex');
    assert.deepEqual(Buffer.concat([ref.update(pt), ref.final()]), expected);
    const states = trace(key, pt), w = expand(key);
    assert.deepEqual(states[nr], expected, 'NIST ciphertext must match reconstructed trace');
    if (nk === 4) assert.equal(w.subarray(16, 32).toString('hex'), 'd6aa74fdd2af72fadaa678f1d6ab76fe');
    const plantSchedule = noise(256);
    w.copy(plantSchedule, nk === 8 ? 16 : 23);
    assert(scheduleGate(plantSchedule, nk).exact > 0);
    const plantStates = noise(256);
    for (let j = 0; j < 4; j++) states[j].copy(plantStates, 32 + 16 * j);
    assert(stateGate(plantStates, nk).exact > 0);
    const derived = Buffer.concat(Array.from({ length: 3 }, (_, j) =>
      bxor(states[j + 1], core(states[j], false))));
    assert.deepEqual(derived, w.subarray(16, 64));
    assert.equal(scheduleErrors(derived, nk, 1), 0);
    return { bits: nk * 32, ciphertext: ctHex, scheduleAndRoundPlantsDetected: true };
  });
}
function run() {
  const source = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../resources/liber-primus/base60-grid.json'), 'utf8'));
  assert.deepEqual(source.page_row_counts, [10, 13, 9]);
  assert.equal(source.rows.length, 32);
  assert.equal(source.byte_rows.length, 32);
  const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
  assert.equal(source.alphabet, alphabet);
  const b = [];
  for (let r = 0; r < 32; r++) {
    assert.equal(source.rows[r].length, 8);
    assert.equal(source.byte_rows[r].length, 8);
    for (let c = 0; c < 8; c++) {
      const token = source.rows[r][c];
      assert.equal(token.length, 2);
      const v = 60 * alphabet.indexOf(token[0]) + alphabet.indexOf(token[1]);
      assert(v >= 0 && v <= 255);
      assert.equal(v, source.byte_rows[r][c]);
      b.push(v);
    }
  }
  const bytes = Buffer.from(b);
  const sha = crypto.createHash('sha256').update(bytes).digest('hex');
  assert.equal(sha, '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
  const controls = positiveControls();
  const schedules = [4, 6, 8].map(n => scheduleGate(bytes, n));
  const roundStates = [4, 6, 8].map(n => stateGate(bytes, n));
  for (const result of [...schedules, ...roundStates]) assert.equal(result.exact, 0);
  console.log(JSON.stringify({ source: 'LP2 physical pp49-51, forward 32x8 row-major, conditional base60',
    bytes: bytes.length, sha256: sha, controls, schedules, roundStates }, null, 2));
}
run();
