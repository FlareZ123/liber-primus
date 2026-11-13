'use strict';

/**
 * Original LP2 ciphertext test of a possible historical CPython 2.7 PRNG seed:
 * the literal 512-bit digest printed on authenticated solved LP2 page p56.
 *
 * Scope: two exact digest-endian integers × original book/page/visual-chapter
 * reset clocks × four original CPython output projections × two +/- signs ×
 * direct GP29 or GP28 predecessor-excluding gap transport = 96 configurations.
 *
 * Source-derived material fixes each 512-bit seed, but NO Cicada instruction
 * selects the PRNG consumer, symbolic reduction, or unknown-page reset. A
 * synthetic exact-key plant is an implementation control, not a cipher proof.
 *
 * Replay on Node.js 22:
 *   node sims/anend_hash_python27_longseed_original_sft.cjs
 *
 * CPython2.7 long-int MT19937 init_by_array is reused from the independent
 * 2016 long-seed original SFT, including its known Python 2.7 output vectors.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { MT } = require('./lp2_2016_linechar_python27_longseed_original_sft.cjs');
const { encode } = require('./grid_keyskip_viterbi.cjs');

const root = path.resolve(__dirname, '..');
/** @param {string} name @returns {string} */
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const manifest = JSON.parse(read('resources/cicada2014-archive-hash-manifest.json'));
const sourcePages = corpus.pages.filter((p) => p.page < 56 && p.indices.length);
const cipher = sourcePages.flatMap((p) => p.indices);
const sectionIntervals = [[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
const chapters = sectionIntervals.map(([from,to]) =>
  sourcePages.filter((p) => p.page >= from && p.page <= to).flatMap((p) => p.indices));
const clocks = {
  book: [cipher],
  page: sourcePages.map((p) => p.indices),
  chapter: chapters
};
assert.equal(cipher.length, 12956);
assert.equal(sourcePages.length, 55);
assert.equal(chapters.length, 9);
assert.deepEqual(chapters.map((a) => a.length), [729,1145,1729,1903,1021,1433,1680,3008,308]);
assert.match(manifest.targetHex, /^[0-9a-f]{128}$/i);

const seeds = {
  printed_big_endian: BigInt('0x' + manifest.targetHex),
  byte_reversed_little_endian:
    BigInt('0x' + manifest.targetHex.match(/../g).reverse().join(''))
};
const projections = ['bits5','float53','scale32','mod32'];
const mod = (n, width) => ((n % width) + width) % width;
const rawQuadgrams = read('resources/control/duko_round27_english_quadgrams.txt');
const quadgrams = new Map();
let mass = 0;
for (const line of rawQuadgrams.trim().split(/\r?\n/)) {
  const [token, countText] = line.trim().split(/\s+/);
  if (countText) {
    const count = Number(countText);
    assert(Number.isSafeInteger(count) && count > 0);
    quadgrams.set(token, count);
    mass += count;
  }
}

/** @typedef {{seedName:string,clock:string,projection:string,sign:number,format:string}} Mode */
/** @param {Mode} mode @returns {number[]} */
function decrypt(mode) {
  const groups = clocks[mode.clock];
  const result = [];
  for (const group of groups) {
    const rng = new MT(seeds[mode.seedName]);
    let previous = -1;
    for (let i = 0; i < group.length; i++) {
      const current = group[i];
      if (mode.format === 'direct29') {
        result.push(mod(current + mode.sign * rng.draw(29, mode.projection), 29));
      } else {
        assert.equal(mode.format, 'gap28');
        if (i === 0 || current === previous) {
          result.push(-1);
        } else {
          const rank = mod(current - previous, 29) - 1;
          assert(rank >= 0 && rank < 28);
          result.push(mod(rank + mode.sign * rng.draw(28, mode.projection), 28));
        }
      }
      previous = current;
    }
  }
  assert.equal(result.length, cipher.length);
  return result;
}

/** @param {number[]} values @returns {number} */
function englishScore(values) {
  const words = values.filter((value) => value >= 0)
    .map((value) => corpus.translit[value]).join('').replace(/[^A-Z]/g, '');
  assert(words.length > 4);
  let logSum = 0;
  for (let i = 0; i <= words.length - 4; i++) {
    const fragment = words.slice(i, i + 4);
    logSum += Math.log10((quadgrams.get(fragment) || 0.01) / mass);
  }
  return logSum / (words.length - 3);
}

/** @param {number[]} values @returns {number} */
function ioc(values) {
  const count = Array(29).fill(0);
  for (const value of values) if (value >= 0) count[value]++;
  const n = count.reduce((a,b) => a+b, 0);
  return count.reduce((a,b) => a+b*(b-1), 0) / (n*(n-1));
}
const trainLength = sourcePages.filter((p) => p.page < 28)
  .reduce((sum, page) => sum + page.indices.length, 0);
const configs = [];
for (const seedName of Object.keys(seeds)) {
  for (const clock of Object.keys(clocks)) {
    for (const projection of projections) {
      for (const sign of [-1, 1]) {
        for (const format of ['direct29', 'gap28']) {
          configs.push({ seedName, clock, projection, sign, format });
        }
      }
    }
  }
}
assert.equal(configs.length, 96);
const ranked = configs.map((mode) => {
  const output = decrypt(mode);
  return {
    ...mode,
    training_quadgram: englishScore(output.slice(0, trainLength)),
    frozen_heldout_quadgram: englishScore(output.slice(trainLength)),
    decoded_ioc: ioc(output),
    prefix_gp: output.slice(0,30)
      .map((value) => value < 0 ? '_' : corpus.translit[value]).join('')
  };
}).sort((a,b) => b.training_quadgram - a.training_quadgram);
const best = ranked[0];
assert.equal(best.seedName, 'printed_big_endian');
assert.equal(best.clock, 'book');
assert.equal(best.projection, 'scale32');
assert.equal(best.sign, -1);
assert.equal(best.format, 'direct29');
assert.ok(Math.abs(best.training_quadgram - (-7.430070599472119)) < 1e-9);
assert.ok(Math.abs(best.frozen_heldout_quadgram - (-7.527808349402072)) < 1e-9);

/** Plant true native GP plaintext using the known full 512-bit key and inverse. */
function plant() {
  const plain = encode(read('resources/control/shakespeare_first300k.txt')).slice(0, cipher.length);
  assert.equal(plain.length, cipher.length);
  const rng = new MT(seeds.printed_big_endian);
  const ciphertext = plain.map((p) => mod(p + rng.draw(29, 'scale32'), 29));
  const decoder = new MT(seeds.printed_big_endian);
  const recovered = ciphertext.map((c) => mod(c - decoder.draw(29, 'scale32'), 29));
  assert.deepEqual(recovered, plain);
  const encoder = new MT(seeds.printed_big_endian);
  assert.deepEqual(recovered.map((p) => mod(p + encoder.draw(29, 'scale32'), 29)), ciphertext);
  const wrong = new MT(seeds.byte_reversed_little_endian);
  const wrongDecoded = ciphertext.map((c) => mod(c - wrong.draw(29, 'scale32'), 29));
  assert.notDeepEqual(wrongDecoded, plain);
  return {
    original_native_runes: plain.length,
    native_heldout_score: englishScore(plain.slice(trainLength)),
    exact_recovered_original_runes: recovered.length,
    exact_reencrypted_original_runes: ciphertext.length,
    wrong_source_key_mismatches: plain.filter((p,i) => p !== wrongDecoded[i]).length
  };
}

function run() {
  const positive = plant();
  const raw = {
    entire_quadgram: englishScore(cipher),
    training_quadgram: englishScore(cipher.slice(0,trainLength)),
    heldout_quadgram: englishScore(cipher.slice(trainLength)),
    ioc: ioc(cipher)
  };
  assert.ok(best.frozen_heldout_quadgram < raw.heldout_quadgram);
  const results = {
    status: 'NEGATIVE, ONE SOURCE-SEED HYPOTHESIS ONLY',
    source: 'Original p56 printed 128-hex digest, exact original unknown 12956 GP29 runes',
    source_sha512_hex: manifest.targetHex,
    original_cipher_run_count: cipher.length,
    train_pages: '0–27', heldout_pages: '28–55', train_runes: trainLength,
    exact_seed_endian_hypotheses: Object.keys(seeds),
    parameter_modes_tested: ranked.length,
    raw,
    best_training_mode: best,
    best_heldout_overall_postselected_diagnostic:
      [...ranked].sort((a,b) => b.frozen_heldout_quadgram-a.frozen_heldout_quadgram)[0],
    original_heldout_top_training_modes: ranked.slice(0,5),
    source_native_positive: positive,
    conclusion: 'No original unknown plaintext; the full 512-bit p56 hash supplies no direct CPython2.7 GP29/GP28 decoder under the 96 declared transforms. Synthetic plant establishes only implementation correctness.'
  };
  process.stdout.write(JSON.stringify(results, null, 2) + '\n');
  return results;
}
if (require.main === module) run();
module.exports = { decrypt, englishScore, run };
