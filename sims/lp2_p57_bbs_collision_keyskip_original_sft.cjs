/**
 * One narrow original-LP2 BBS + collision-rejection keyskip inverse.
 *
 * The original 2013 source supplies three PARABLE clause primes
 * 1031, 1229, 1259. Only the 1031*1259 Blum modulus and remaining
 * seed 1229 are tested here; NO phase scans or arbitrary seed hunting.
 * Uses the existing exact hidden-consumption Viterbi from the project.
 *
 * Run: node sims/lp2_p57_bbs_collision_keyskip_original_sft.cjs
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { encode } = require('./grid_keyskip_viterbi.cjs');
const { viterbi } = require('./parable_mod29_periodic_collision_viterbi.cjs');

const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const unknown = gp.pages.filter(p => p.page <= 55);
const firstPages = [0, 1, 5].map(page => gp.pages.find(p => p.page === page));
const N = 1031 * 1259, SEED = 1229, PERIOD = 612;
assert.equal(N * SEED, 1595277641);
assert.deepEqual(firstPages.map(p => p.indices.length), [262, 266, 263]);

/** @param {number} initial @param {string} projection */
function keyArray(initial, projection) {
  let state = initial === 0 ? SEED : (SEED * SEED) % N;
  const start = state;
  const output = [];
  for (let i = 0; i < PERIOD; i++) {
    if (projection === 'residue' || projection === 'high-residue') {
      state = state * state % N;
      output.push(projection === 'residue' ? state % 29 :
        Math.floor(state / 29) % 29);
      continue;
    }
    let value = 0;
    for (let j = 0; j < 5; j++) {
      state = state * state % N;
      const bit = state % 2;
      value = projection === 'bit-msb'
        ? value * 2 + bit : value + bit * (2 ** j);
    }
    if (value < 29) output.push(value);
  }
  assert.equal(state, start, 'exact source BBS return at 612 states/blocks');
  assert.ok(output.length >= 500);
  return output;
}

/**
 * A reproducible, authentic-source-register English control message,
 * encrypted with exactly one permitted collision-triggered pad rejection
 * per rune. The decoded output must independently recover the message.
 *
 * @param {number[]} plaintext
 * @param {number[]} key
 * @param {number} sign
 */
function plant(plaintext, key, sign) {
  let state = 0x3301761 >>> 0;
  const rng = () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
  const out = [];
  let phase = 0, prev = -1, skips = 0;
  for (const plain of plaintext) {
    let c = (plain + sign * key[phase % key.length] + 29) % 29;
    if (prev >= 0 && c === prev && rng() < 0.81) {
      phase++;
      skips++;
      c = (plain + sign * key[phase % key.length] + 29) % 29;
    }
    prev = c;
    out.push(c);
    phase++;
  }
  return { cipher: out, skips };
}

const sourceText = read('resources/control/shakespeare_first300k.txt');
const withheldNative = encode(sourceText.slice(220000, 238000));
assert.ok(withheldNative.length > 262);
const keys = [];
for (const initial of [0, 1]) {
  for (const projection of ['residue', 'high-residue', 'bit-msb', 'bit-lsb']) {
    keys.push({ initial: initial === 0 ? 'seed' : 'seed-squared',
      projection, key: keyArray(initial, projection) });
  }
}
assert.equal(keys.length, 8);
const selectedKey = keys.find(k =>
  k.initial === 'seed-squared' && k.projection === 'bit-msb');
const clear = withheldNative.slice(0, 262);
const planted = plant(clear, selectedKey.key, 1);
const positive = viterbi(planted.cipher, selectedKey.key, 1);
const matching = positive.plaintext.filter((p, i) => p === clear[i]).length;

const originals = [];
for (const { initial, projection, key } of keys) {
  for (const sign of [-1, 1]) {
    const pages = firstPages.map(page => {
      const result = viterbi(page.indices, key, sign);
      return {page: page.page, n:page.indices.length,
        perRune:result.perRune, skips:result.skips,
        sample:result.plaintext.slice(0, 65)
          .map(x => gp.translit[x]).join('')};
    });
    originals.push({initial,projection,sign,meanScore:
      pages.reduce((s,p)=>s+p.perRune*p.n,0)/
      pages.reduce((s,p)=>s+p.n,0),pages});
  }
}
originals.sort((a,b)=>b.meanScore-a.meanScore);
assert.equal(originals.length, 16);
assert.ok(originals.every(r=>r.pages.every(p=>Number.isFinite(p.perRune))));
const report = {
  source:'2013 761.MP3 p57 prime-factors two-prime BBS hidden collision keys',
  modulus:N,seed:SEED,originalPages:[0,1,5],
  sourceOutputPeriods:keys.map(k=>
    ({start:k.initial,projection:k.projection,period:k.key.length})),
  synthetic: {length:clear.length,trueSkipped:planted.skips,
    recoveredSkipped:positive.skips,correctPlaintextSymbols:matching,
    fraction:matching/clear.length,score:positive.perRune},
  sourceResults:originals,
  interpretation:'No result counts as plaintext without independently readable, reversible original output',
};
console.log(JSON.stringify(report,null,2));
