"use strict";
/**
 * Source-fixed F31 fragment→grid-row mapping used as a per-fragment 8-byte pad.
 *
 * Each of the 32 source fragments is paired with exactly one row of the
 * 32×8 table. The 13-dot marker labels are 13^j mod31 for the 30 red marks,
 * 0 for the black mark, and 31 for the leading fragment sentinel. The assigned
 * row repeats within its fragment. Test only the transparent-EA root-15
 * register, the linear exclusion register, and the simple GP29 additive
 * control. No row, key, or permutation search is performed.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { train, encode } = require('./grid_keyskip_viterbi.cjs');
const { originalFragments, f31Mapping } = require('./lp2_f31_fragment_key_inverse.cjs');

const ROOT = path.resolve(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/base60-grid.json'));
const pages = corpus.pages.filter(p => p.page < 56);
const C = pages.flatMap(p => p.indices);
const { bounds } = originalFragments();
const { rowForFragment } = f31Mapping();
assert.equal(C.length, 12956);
assert.equal(bounds[28], C.length);
assert.equal(rowForFragment.length, 32);
assert.equal(grid.byte_rows.length, 32);
assert(grid.byte_rows.every(row => row.length === 8));

const MOD = 29, EA = 28, ROOT15 = 15;
const mod = (x, n) => (x % n + n) % n;
const log = new Array(29).fill(-1), pow = new Array(28);
for (let i = 0, v = 1; i < 28; i++, v = mod(ROOT15 * v, 29)) {
  log[v] = i;
  pow[i] = v;
}
assert.equal(new Set(pow).size, 28);
const trainStop = bounds[18];
assert.equal(trainStop, 6546);
const shakespeare = read('resources/control/shakespeare_first300k.txt');
const lm = train(shakespeare.slice(0, 200000));
const nativePlant = encode(shakespeare.slice(205000)).slice(0, C.length);
assert.equal(nativePlant.length, C.length);

function languageScore(runes) {
  if (!runes.length) return -Infinity;
  let score = lm.unigram[runes[0]];
  if (runes.length > 1) score += lm.bigram[runes[0] * 29 + runes[1]];
  for (let i = 2; i < runes.length; i++)
    score += lm.trigram[(runes[i - 2] * 29 + runes[i - 1]) * 29 + runes[i]];
  return score / runes.length;
}
function normalizedIoC(runes, start, end) {
  const counts = new Uint32Array(29);
  for (let i = start; i < end; i++) counts[runes[i]]++;
  const n = end - start;
  let sum = 0;
  for (const count of counts) sum += count * (count - 1);
  return 29 * sum / (n * (n - 1));
}
function project(byte, projection, period) {
  return projection === 'mod' ? byte % period : Math.floor(period * byte / 256);
}
const families = ['add', 'exclude', 'exp'];
const projections = ['mod', 'scale'];
const signs = [-1, 1];

/** Per-fragment row pad; each fragment resets both the register and pad clock. */
function transform(input, family, sign, projection, encodeMode) {
  const output = new Array(input.length);
  for (let f = 0; f < 28; f++) {
    const start = bounds[f], end = bounds[f + 1];
    const row = grid.byte_rows[rowForFragment[f]];
    let previousCipher = -1, keyPos = 0;
    for (let i = start; i < end; i++) {
      const value = input[i];
      const period = family === 'add' ? 29 : 28;
      const key = project(row[keyPos % 8], projection, period);
      let next;
      if (family === 'add') {
        next = mod(value + (encodeMode ? -1 : 1) * sign * key, 29);
        keyPos++;
      } else if (previousCipher < 0) {
        next = value;
      } else if (family === 'exp') {
        if (encodeMode) {
          next = value === EA ? previousCipher :
            mod(previousCipher + pow[mod(value + sign * key, 28)], 29);
          if (value !== EA) keyPos++;
        } else {
          next = value === previousCipher ? EA :
            mod(log[mod(value - previousCipher, 29)] - sign * key, 28);
          if (value !== previousCipher) keyPos++;
        }
      } else if (encodeMode) {
        next = value === EA ? previousCipher :
          mod(previousCipher + 1 + mod(value + sign * key, 28), 29);
        if (value !== EA) keyPos++;
      } else {
        next = value === previousCipher ? EA :
          mod(mod(value - previousCipher - 1, 29) - sign * key, 28);
        if (value !== previousCipher) keyPos++;
      }
      output[i] = next;
      if (family !== 'add') previousCipher = encodeMode ? next : value;
    }
  }
  return output;
}

function main() {
  const variants = [];
  for (const family of families)
    for (const sign of signs)
      for (const projection of projections) {
        const decoded = transform(C, family, sign, projection, false);
        assert.deepEqual(transform(decoded, family, sign, projection, true), C);
        variants.push({
          family, sign, projection,
          trainIoC: normalizedIoC(decoded, 0, trainStop),
          heldoutIoC: normalizedIoC(decoded, trainStop, C.length),
          trainEnglishGP: languageScore(decoded.slice(0, trainStop)),
          heldoutEnglishGP: languageScore(decoded.slice(trainStop)),
          prefix: decoded.slice(0, 64).map(x => corpus.translit[x]).join('')
        });
      }
  const bestTraining = variants.slice().sort((a, b) =>
    b.trainEnglishGP - a.trainEnglishGP);
  const bestHeldout = variants.slice().sort((a, b) =>
    b.heldoutEnglishGP - a.heldoutEnglishGP);

  const plantMode = { family: 'exp', sign: 1, projection: 'mod' };
  const encrypted = transform(nativePlant, plantMode.family, plantMode.sign,
    plantMode.projection, true);
  const recovered = transform(encrypted, plantMode.family, plantMode.sign,
    plantMode.projection, false);
  assert.deepEqual(recovered, nativePlant);

  const output = {
    classification: 'F31-labelled 32-fragment→32-row map; each 8-byte row used as its fragment pad',
    source: {
      originalRunes: C.length, gridRows: grid.byte_rows.length,
      rowForFragment, rowBytesByFragment: rowForFragment.map(i => grid.byte_rows[i]),
      trainStop, fragmentBoundaries: bounds.slice(0, 29)
    },
    tested: {
      models: variants.length, families, signs, projections,
      padBytes: 8, padRepeatsWithinFragment: true,
      registerAndPadReset: 'at each 13-dot-defined fragment',
      rowOrKeyPermutationSearch: false
    },
    raw: {
      englishGP: languageScore(C),
      trainIoC: normalizedIoC(C, 0, trainStop),
      heldoutIoC: normalizedIoC(C, trainStop, C.length)
    },
    bestTraining, bestHeldout,
    positiveControl: {
      runes: nativePlant.length, exactRecovered: recovered.length,
      plaintextEnglishGP: languageScore(nativePlant),
      recoveredEnglishGP: languageScore(recovered),
      encryptedEnglishGP: languageScore(encrypted)
    },
    status: 'No plaintext claim; this is the direct one-row-per-fragment interpretation of the 32×8 table'
  };
  process.stdout.write(JSON.stringify(output, null, 2) + '\n');
  return output;
}
if (require.main === module) main();
module.exports = { transform, main };
