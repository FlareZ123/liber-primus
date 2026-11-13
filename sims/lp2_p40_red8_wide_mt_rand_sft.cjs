'use strict';

/**
 * Original LP2 p40–53 red8 wide-integer RAND-seed gate.
 * Run: node sims/lp2_p40_red8_wide_mt_rand_sft.cjs
 *
 * Python-2.7-compatible MT19937 integer seeding and 53-bit random().
 * Historic RAND/BASE29 are inspiration, not an authenticated LP2 instruction.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const load = name => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const corpus = load('resources/liber-primus/lp2-corpus.json');
const vectors = load('resources/control/duko_round27_vectors.json');

class PythonMT {
  /** @param {bigint} seed */
  constructor(seed) {
    assert(seed >= 0n);
    this.state = new Array(624);
    this.state[0] = 19650218;
    for (let i = 1; i < 624; i++) {
      const p = this.state[i - 1];
      this.state[i] = (Math.imul(1812433253, p ^ (p >>> 30)) + i) >>> 0;
    }
    const words = [];
    let remaining = seed;
    do {
      words.push(Number(remaining & 0xffffffffn));
      remaining >>= 32n;
    } while (remaining > 0n);
    let i = 1, j = 0;
    for (let k = Math.max(624, words.length); k > 0; k--) {
      const p = this.state[i - 1];
      this.state[i] = ((this.state[i] ^ Math.imul(p ^ (p >>> 30), 1664525)) + words[j] + j) >>> 0;
      if (++i >= 624) { this.state[0] = this.state[623]; i = 1; }
      if (++j >= words.length) j = 0;
    }
    for (let k = 623; k > 0; k--) {
      const p = this.state[i - 1];
      this.state[i] = ((this.state[i] ^ Math.imul(p ^ (p >>> 30), 1566083941)) - i) >>> 0;
      if (++i >= 624) { this.state[0] = this.state[623]; i = 1; }
    }
    this.state[0] = 0x80000000;
    this.position = 624;
  }

  /** @returns {number} Python's next unsigned 32-bit tempered word */
  next() {
    if (this.position >= 624) {
      for (let i = 0; i < 624; i++) {
        const y = (this.state[i] & 0x80000000) | (this.state[(i + 1) % 624] & 0x7fffffff);
        this.state[i] = (this.state[(i + 397) % 624] ^ (y >>> 1) ^ ((y & 1) ? 0x9908b0df : 0)) >>> 0;
      }
      this.position = 0;
    }
    let y = this.state[this.position++];
    y ^= y >>> 11;
    y ^= (y << 7) & 0x9d2c5680;
    y ^= (y << 15) & 0xefc60000;
    y ^= y >>> 18;
    return y >>> 0;
  }

  /** @returns {number} Python random.random() exact 53-bit float */
  random() {
    const a = this.next() >>> 5, b = this.next() >>> 6;
    return (a * 67108864 + b) / 9007199254740992;
  }
}

// Independent verified Python-2.7 vectors: do not trust a synthetic roundtrip alone.
for (const record of vectors.seed_vectors.filter(v => v.seed <= 1)) {
  const mt = new PythonMT(BigInt(record.seed));
  const observed = Array.from({length: record.ks128.length}, () => Math.floor(mt.random() * 29));
  assert.deepEqual(observed, record.ks128, 'Python MT seed ' + record.seed);
}

const source = corpus.pages.filter(p => p.page >= 40 && p.page <= 53)
  .flatMap(p => p.indices);
assert.equal(source.length, 3008);
const red = source.slice(0, 8);
assert.deepEqual(red, [0, 9, 19, 26, 6, 23, 25, 8]);
const body = source.slice(8);
assert.equal(body.length, 3000);
const seed = red.reduce((v, d) => v * 29n + BigInt(d), 0n);
assert.equal(seed, 5761677436n);
assert(seed > 0xffffffffn); // Prior 2^32 searches did not contain this integer.

const GP = n => ((n % 29) + 29) % 29;
/** @param {number[]} input */
function ioc(input) {
  const counts = Array(29).fill(0);
  for (const n of input) counts[n]++;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0)
    / (input.length * (input.length - 1));
}
/** @param {string} codec @param {bigint} initial */
function makePad(codec, initial) {
  const mt = new PythonMT(initial);
  return Array.from({length: body.length}, () => {
    const u = mt.random();
    return codec === 'direct-gp29' ? Math.floor(u * 29) : Math.floor(u * 256) % 29;
  });
}
const native = corpus.pages.find(p => p.page === 57).indices;
assert.equal(native.length, 95);
const plant = Array.from({length: body.length}, (_, i) => native[i % native.length]);
const cases = [];
for (const codec of ['direct-gp29', 'rand-byte256-mod29']) {
  const pad = makePad(codec, seed);
  const wrongPad = makePad(codec, seed + 1n);
  for (const sign of [-1, 1]) {
    const output = body.map((value, i) => GP(value + sign * pad[i]));
    const encode = text => text.map((value, i) => GP(value - sign * pad[i]));
    assert.deepEqual(encode(output), body);
    const plantedCipher = encode(plant);
    assert.deepEqual(plantedCipher.map((v,i) => GP(v + sign * pad[i])), plant);
    assert.notDeepEqual(plantedCipher.map((v,i) => GP(v + sign * wrongPad[i])), plant);
    cases.push({
      codec, decode_sign: sign, original_ioc: ioc(body), decoded_ioc: ioc(output),
      decoded_gp_prefix: output.slice(0, 80).map(n => corpus.translit[n]).join(''),
      replay_original: true, recovered_native_plant: true, wrong_seed_rejected: true
    });
  }
}
assert.deepEqual(cases.map(x => x.decoded_ioc), [
  0.034438812937645884, 0.03443081027009003,
  0.03448016005335112, 0.03444503723463377
]);
console.log(JSON.stringify({
  source: 'LP2 p40-53 original 3008 GP29 symbols, red8 + body3000',
  wide_base29_seed: seed.toString(),
  independent_seed0_and_seed1_python27_vectors: 'PASS',
  models: cases,
  conclusion: 'No native-GP29 plaintext from the source-selected wide-seed direct RAND pad'
}, null, 2));
