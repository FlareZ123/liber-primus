'use strict';

/**
 * An authentic source-key hypothesis: GIMP 2.8's dissolve implementation has
 * a fixed GRand/MT19937 seed 314159265, from which 4096 row seeds are produced.
 *
 * Screen the full PRNG output and the document-specific GIMP row streams as
 * additive modulo-29 candidates against LP2 page 7 and page 23. These two
 * pages carry byte-identical five-dot stencils in vertically mirrored form.
 *
 * The detector is calibrated on actual clear GP register from solved LP2 p57,
 * including a constructed correct-key encryption of the same authentic text.
 * This tests ONLY the explicit direct additive pad model, not other uses of
 * source image randomness, substitution modes or hidden key derivations.
 *
 * GIMP source algorithm: GIMP 2.8 paint_funcs.c, gr seed 314159265.
 * Upstream code and date: https://download.gimp.org/gimp/v2.8/
 * Independent source context: https://secra.tech/research/liber-primus-strongest-findings/
 *
 * Run: node sims/gimp_dissolve_directpad.cjs
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(
  ROOT, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const literarySource = fs.readFileSync(path.join(
  ROOT, 'resources/control/shakespeare_first300k.txt'), 'utf8');

/** A bit-exact 32-bit implementation of GLib's GRand MT19937 seed/output. */
class GRand {
  /** @param {number} seed uint32 */
  constructor(seed) {
    this.state = new Uint32Array(624);
    this.state[0] = seed >>> 0;
    for (let i = 1; i < 624; i++) {
      const prev = this.state[i - 1] ^ (this.state[i - 1] >>> 30);
      this.state[i] = (Math.imul(1812433253, prev) + i) >>> 0;
    }
    this.offset = 624;
  }

  /** @returns {number} uint32 */
  nextUint32() {
    if (this.offset === 624) {
      for (let i = 0; i < 624; i++) {
        const x = (this.state[i] & 0x80000000)
          | (this.state[(i + 1) % 624] & 0x7fffffff);
        this.state[i] = (this.state[(i + 397) % 624] ^ (x >>> 1)
          ^ ((x & 1) ? 0x9908b0df : 0)) >>> 0;
      }
      this.offset = 0;
    }
    let x = this.state[this.offset++];
    x ^= x >>> 11;
    x ^= (x << 7) & 0x9d2c5680;
    x ^= (x << 15) & 0xefc60000;
    x ^= x >>> 18;
    return x >>> 0;
  }
}

/** @param {number} seed @param {number} n @returns {number[]} */
function draws(seed, n) {
  const rng = new GRand(seed);
  return Array.from({length: n}, () => rng.nextUint32());
}

const expectedFirstRoot = [
  3721122731, 618219707, 807213306, 3144837749, 3447982176,
  3230631767, 755972506, 1398685501, 3196876378, 1337812403
];
const table = draws(314159265, 4096);
assert.deepEqual(table.slice(0, 10), expectedFirstRoot);
assert.deepEqual(draws(table[0], 10), [
  505524582, 4277517655, 1702989131, 912900261, 1432505218,
  4108960502, 2270003630, 316039421, 3830300054, 1862294014
]);

const tokens = corpus.translit.map((token, index) => ({token, index}))
  .sort((a, b) => b.token.length - a.token.length);

/**
 * @param {string} source
 * @returns {number[]}
 */
function encodeGP(source) {
  /** @type {number[]} */
  const result = [];
  const text = source.toUpperCase().replaceAll('QU', 'CW')
    .replaceAll('V', 'U').replaceAll('K', 'C')
    .replaceAll('Z', 'S').replaceAll('ING', 'NG');
  for (const word of text.split(/[^A-Z]+/)) {
    for (let offset = 0; offset < word.length;) {
      const found = tokens.find(({token}) => word.startsWith(token, offset));
      assert.ok(found, 'GP transliteration does not recognize: ' + word);
      result.push(found.index);
      offset += found.token.length;
    }
  }
  return result;
}

const reference = encodeGP(literarySource);
assert.ok(reference.length > 200000);

const pairs = new Int32Array(29 * 29);
const triples = new Int32Array(29 * 29 * 29);
for (let i = 2; i < reference.length; i++) {
  const j = 29 * reference[i - 2] + reference[i - 1];
  pairs[j]++;
  triples[29 * j + reference[i]]++;
}

/** @param {number[]} seq @returns {number} average GP log trigram */
function logScore(seq) {
  let s = 0;
  for (let i = 2; i < seq.length; i++) {
    const j = 29 * seq[i - 2] + seq[i - 1];
    s += Math.log((triples[29 * j + seq[i]] + 0.2)
      / (pairs[j] + 5.8));
  }
  return s / (seq.length - 2);
}

/** @param {number[]} seq @returns {number} */
function ioc(seq) {
  const histogram = new Int32Array(29);
  for (const item of seq) histogram[item]++;
  return histogram.reduce((s, n) => s + n * (n - 1), 0)
    / (seq.length * (seq.length - 1));
}

/**
 * Decrypt with source pad in original or mirror-reversed letter order.
 * @param {number[]} ciphertext
 * @param {number[]} rawKey
 * @param {number} offset
 * @param {number} sign either -1 or +1
 * @param {boolean} reversed
 * @returns {number[]}
 */
function transform(ciphertext, rawKey, offset, sign, reversed) {
  return ciphertext.map((c, i) => {
    const position = offset + (reversed ? ciphertext.length - 1 - i : i);
    return (c + 29 + sign * (rawKey[position] % 29)) % 29;
  });
}

/** @returns {object} */
function run() {
  const pages = [7, 23].map((number) => {
    const page = corpus.pages.find((p) => p.page === number);
    assert.ok(page && page.status === 'unsolved');
    return {number, ciphertext: page.indices};
  });
  const solved = corpus.pages.find((p) => p.page === 57);
  assert.ok(solved && solved.status === 'solved');
  const control = solved.indices;
  const plantedKey = draws(314159265, control.length);
  const encrypted = control.map((c, i) => (c + plantedKey[i] % 29) % 29);
  assert.deepEqual(transform(encrypted, plantedKey, 0, -1, false), control);
  const solvedScore = logScore(control);
  assert.ok(solvedScore > -3.0);
  const sources = [
    {name: 'root-MT-output', key: draws(314159265, 1000)},
    {name: 'row0-MT-output', key: draws(table[0], 1000)},
    {name: 'row7-MT-output', key: draws(table[7], 1000)},
    {name: 'row23-MT-output', key: draws(table[23], 1000)},
    {name: 'row56-MT-output', key: draws(table[56], 1000)}
  ];
  const scans = sources.map((source) => {
    /** @type {Array<{page:number,baseScore:number,best:object}>} */
    const pageResults = [];
    for (const page of pages) {
      /** @type {Array<{offset:number,sign:number,reversed:boolean,score:number,ioc:number}>} */
      const candidates = [];
      for (let offset = 0; offset <= 64; offset++) {
        for (const sign of [-1, 1]) {
          for (const reversed of [false, true]) {
            const decoded = transform(
              page.ciphertext, source.key, offset, sign, reversed);
            candidates.push({
              offset, sign, reversed,
              score: logScore(decoded),
              ioc: ioc(decoded)
            });
          }
        }
      }
      candidates.sort((a, b) => b.score - a.score);
      pageResults.push({
        page: page.number,
        runeCount: page.ciphertext.length,
        baseScore: logScore(page.ciphertext),
        best: candidates[0]
      });
    }
    return {source: source.name, pageResults};
  });
  const globalBest = Math.max(...scans.flatMap((scan) =>
    scan.pageResults.map((p) => p.best.score)));
  assert.ok(globalBest < -3.5,
    'A positive source-pad candidate requires independent verification');
  return {
    source: 'GIMP 2.8.10 GRand/MT19937 seed 314159265',
    fixedSeed: 314159265,
    tableEntries: table.length,
    firstRootOutputs: expectedFirstRoot,
    actualSolvedControl: {page: 57, runes: control.length,
      avgTrigramScore: solvedScore},
    plantedControl: {source: 'real GP solved plaintext',
      exactReencryption: true},
    trialContract: '2 physical pages x 5 exact source streams x 65 offsets x 2 signs x 2 directions',
    scans,
    interpretation: 'No readable plaintext or recovered LP2 key under the tested direct-pad model'
  };
}

if (require.main === module) console.log(JSON.stringify(run(), null, 2));

module.exports = {GRand, draws, encodeGP, logScore, transform, run};
