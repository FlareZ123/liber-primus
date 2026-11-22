'use strict';

/**
 * Original-source LP2 p39 quadratic Hénon keystream with p56 transparent-F.
 *
 * Run from repository root: node sims/lp2_p39_henon_keystream_fskip_sft.cjs
 * Requires only Node 22 built-ins; reads the unmodified canonical source.
 * This is a fixed mathematical model test, not a recovered historical cipher.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));
const MOD = 29;

/** @param {number} n @returns {number} */
function mod(n) {
  return ((n % MOD) + MOD) % MOD;
}

/** @param {number} x @returns {number} */
function quadratic(x) {
  return mod(27 + 5 * x + 15 * x * x);
}

/**
 * Finite-field invertible Hénon map (u,v) -> (v,Q(v)-u).
 * @param {number} u
 * @param {number} v
 * @returns {[number, number]}
 */
function nextState(u, v) {
  return [v, mod(quadratic(v) - u)];
}

/**
 * An authentic plaintext F (index 0) emits under the same current key,
 * but does not advance the key, mirroring the established p56 clock.
 * Encrypted non-F may itself result in displayed F: do not conflate them.
 * @param {number[]} ciphertext
 * @param {number} seed0
 * @param {number} seed1
 * @param {-1|1} sign
 * @returns {number[]}
 */
function decrypt(ciphertext, seed0, seed1, sign) {
  const out = new Array(ciphertext.length);
  let u = seed0;
  let v = seed1;
  for (let i = 0; i < ciphertext.length; i++) {
    const p = mod(ciphertext[i] + sign * u);
    out[i] = p;
    if (p !== 0) [u, v] = nextState(u, v);
  }
  return out;
}

/**
 * Fully reversible companion encoder.
 * @param {number[]} plaintext
 * @param {number} seed0
 * @param {number} seed1
 * @param {-1|1} sign
 * @returns {number[]}
 */
function encrypt(plaintext, seed0, seed1, sign) {
  const out = new Array(plaintext.length);
  let u = seed0;
  let v = seed1;
  for (let i = 0; i < plaintext.length; i++) {
    out[i] = mod(plaintext[i] - sign * u);
    if (plaintext[i] !== 0) [u, v] = nextState(u, v);
  }
  return out;
}

/** @param {number[]} a @returns {number} */
function ioc(a) {
  const freq = new Array(MOD).fill(0);
  for (const x of a) freq[x]++;
  return freq.reduce((total, n) => total + n * (n - 1), 0) / (a.length * (a.length - 1));
}

/**
 * An exact full-key search over both signs and all 29^2 ordered IVs.
 * @param {number[]} cipher
 * @returns {{score:number, seed0:number,seed1:number,sign:-1|1}}
 */
function maximize(cipher) {
  let best = {score:-1,seed0:-1,seed1:-1,sign:1};
  for (let a = 0; a < MOD; a++) {
    for (let b = 0; b < MOD; b++) {
      for (const sign of /** @type {const} */ ([-1, 1])) {
        const score = ioc(decrypt(cipher, a, b, sign));
        if (score > best.score) best = {score,seed0:a,seed1:b,sign};
      }
    }
  }
  return best;
}

function main() {
  assert.equal(corpus.runes.length, MOD);
  const p57 = corpus.pages.find(p => p.page === 57).indices;
  assert.equal(p57.length, 95);
  for (const sign of /** @type {const} */ ([-1, 1])) {
    const planted = encrypt(p57, 27, 5, sign);
    assert.deepEqual(decrypt(planted, 27, 5, sign), p57);
    assert.deepEqual(encrypt(decrypt(planted, 27, 5, sign), 27, 5, sign), planted);
    // Wrong IV must not accidentally recover the original source.
    assert.notDeepEqual(decrypt(planted, 27, 6, sign), p57);
  }

  // This is an invertible permutation on 29^2 states; count every orbit.
  const visited = new Uint8Array(MOD * MOD);
  const lengths = [];
  for (let state = 0; state < visited.length; state++) {
    if (visited[state]) continue;
    let current = state;
    let length = 0;
    do {
      assert.equal(visited[current], 0);
      visited[current] = 1;
      const [u, v] = nextState(Math.floor(current / MOD), current % MOD);
      current = u * MOD + v;
      length++;
    } while (current !== state);
    lengths.push(length);
  }
  assert.equal(lengths.length, 29);
  assert.equal(Math.max(...lengths), 140);
  assert.equal(lengths.reduce((a, b) => a + b, 0), MOD * MOD);
  console.log('Fixed Q(x)=27+5x+15x^2: 29 invertible state cycles, maximum key period 140.');

  const sections = [
    {start:40,end:54,red:8,n:3000,expected:0.03481871735022785},
    {start:54,end:56,red:9,n:299,expected:0.039595070817714524}
  ];
  for (const section of sections) {
    const all = corpus.pages.slice(section.start, section.end).flatMap(p => p.indices);
    const cipher = all.slice(section.red);
    assert.equal(cipher.length, section.n);
    const best = maximize(cipher);
    assert.ok(Math.abs(best.score - section.expected) < 1e-13);
    const recovered = decrypt(cipher, best.seed0, best.seed1, best.sign);
    assert.deepEqual(encrypt(recovered, best.seed0, best.seed1, best.sign), cipher);
    console.log(JSON.stringify({
      original_physical_pages:`${section.start}-${section.end - 1}`,
      black_runes:cipher.length,
      original_ioc:ioc(cipher),
      tested_models:29*29*2,
      max_decoded_ioc:best.score,
      maximizing_IV:[best.seed0,best.seed1],
      sign:best.sign,
      first_40_transliterations:recovered.slice(0,40).map(i=>corpus.translit[i]).join(' ')
    }));
  }
  console.log('PASS: native p57 plants; complete 1682-model original search per chapter; forward source reconstruction.');
}

main();
