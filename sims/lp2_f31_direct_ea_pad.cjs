"use strict";
/**
 * Direct GP28/EA test for the F31-ordered 32-byte red-fragment key.
 * The marker→fragment mapping is defined in lp2_f31_fragment_key_inverse.cjs.
 * This tests only raw/reversed F31 key order, three natural clocks, two
 * byte→mod-28 projections, and both signs. EA is a transparent zero-step:
 * repeated ciphertext symbols decode to GP symbol 28 and consume no key byte.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { train, encode } = require('./grid_keyskip_viterbi.cjs');
const { originalFragments, f31Mapping } = require('./lp2_f31_fragment_key_inverse.cjs');

const ROOT = path.resolve(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const pages = corpus.pages.filter(p => p.page < 56);
const C = pages.flatMap(p => p.indices);
const { bounds } = originalFragments();
const { keyByLabel, rowForFragment } = f31Mapping();
assert.equal(C.length, 12956);
assert.equal(bounds[28], C.length);
assert.equal(rowForFragment.length, 32);

const MOD = 29, EA = 28, ROOT15 = 15;
const mod = (x, n) => (x % n + n) % n;
const log = new Array(29).fill(-1), pow = new Array(28);
for (let i = 0, v = 1; i < 28; i++, v = mod(ROOT15 * v, 29)) {
  log[v] = i;
  pow[i] = v;
}
assert.equal(new Set(pow).size, 28);

const pageOf = new Array(C.length);
let cursor = 0;
for (const page of pages) {
  for (let i = 0; i < page.indices.length; i++) pageOf[cursor + i] = page.page;
  cursor += page.indices.length;
}
assert.equal(cursor, C.length);
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
const keyOrders = [
  ['raw-f31', Buffer.from(keyByLabel)],
  ['reverse-f31', Buffer.from(keyByLabel).reverse()]
];
const clocks = ['global', 'page', 'fragment'];
const projections = ['mod', 'scale'];
const signs = [-1, 1];

function project(byte, projection) {
  return projection === 'mod' ? byte % 28 : Math.floor(28 * byte / 256);
}
function resetAt(i, clock, previousPage, fragment) {
  if (clock === 'page') return pageOf[i] !== previousPage;
  if (clock === 'fragment') return i === bounds[fragment + 1];
  return false;
}
function decode(input, key, clock, sign, projection) {
  const output = new Array(input.length);
  let previousCipher = -1, keyPos = 0, previousPage = -1, fragment = 0;
  for (let i = 0; i < input.length; i++) {
    while (fragment < 27 && i >= bounds[fragment + 1]) {
      fragment++;
      if (clock === 'fragment') { previousCipher = -1; keyPos = 0; }
    }
    if (clock === 'page' && pageOf[i] !== previousPage) {
      previousCipher = -1; keyPos = 0;
    }
    previousPage = pageOf[i];
    const c = input[i];
    if (previousCipher < 0) {
      output[i] = c;
    } else if (c === previousCipher) {
      output[i] = EA;
    } else {
      const k = project(key[keyPos % key.length], projection);
      output[i] = mod(log[mod(c - previousCipher, MOD)] - sign * k, 28);
      keyPos++;
    }
    previousCipher = c;
  }
  return output;
}
function encrypt(plain, key, clock, sign, projection) {
  const output = new Array(plain.length);
  let previousCipher = -1, keyPos = 0, previousPage = -1, fragment = 0;
  for (let i = 0; i < plain.length; i++) {
    while (fragment < 27 && i >= bounds[fragment + 1]) {
      fragment++;
      if (clock === 'fragment') { previousCipher = -1; keyPos = 0; }
    }
    if (clock === 'page' && pageOf[i] !== previousPage) {
      previousCipher = -1; keyPos = 0;
    }
    previousPage = pageOf[i];
    const p = plain[i];
    let c;
    if (previousCipher < 0) c = p;
    else if (p === EA) c = previousCipher;
    else {
      const k = project(key[keyPos % key.length], projection);
      c = mod(previousCipher + pow[mod(p + sign * k, 28)], MOD);
      keyPos++;
    }
    output[i] = c;
    previousCipher = c;
  }
  return output;
}

function main() {
  const variants = [];
  for (const [keyName, key] of keyOrders)
    for (const clock of clocks)
      for (const projection of projections)
        for (const sign of signs) {
          const decoded = decode(C, key, clock, sign, projection);
          assert.deepEqual(encrypt(decoded, key, clock, sign, projection), C);
          variants.push({
            key: keyName, clock, projection, sign,
            trainIoC: normalizedIoC(decoded, 0, trainStop),
            heldoutIoC: normalizedIoC(decoded, trainStop, C.length),
            trainEnglishGP: languageScore(decoded.slice(0, trainStop)),
            heldoutEnglishGP: languageScore(decoded.slice(trainStop)),
            prefix: decoded.slice(0, 64).map(x => corpus.translit[x]).join('')
          });
        }
  const bestTraining = variants.slice().sort((a, b) =>
    b.trainEnglishGP - a.trainEnglishGP).slice(0, 12);
  const bestHeldout = variants.slice().sort((a, b) =>
    b.heldoutEnglishGP - a.heldoutEnglishGP).slice(0, 12);

  // Exact positive control with held-out English mapped to GP.
  const plantKey = keyOrders[0][1];
  const plantCipher = encrypt(nativePlant, plantKey, 'fragment', 1, 'mod');
  const recovered = decode(plantCipher, plantKey, 'fragment', 1, 'mod');
  assert.deepEqual(recovered, nativePlant);

  const output = {
    classification: 'F31-permuted red32 direct key under root-15 transparent-EA inverse; hypothesis screen only',
    source: {
      redFragmentLengthsOrderedByF31Label: [...keyByLabel],
      keyHex: Buffer.from(keyByLabel).toString('hex'),
      fragmentToGridRowLabels: rowForFragment,
      trainStop: trainStop, totalRunes: C.length,
      resetBoundaries: bounds.slice(0, 29)
    },
    tested: {
      models: variants.length, keyOrders: keyOrders.map(x => x[0]),
      clocks, projections, signs, period: 32,
      keyAdvancesOnlyOnNonEA: true, rowOrKeyPermutationSearch: false
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
      encryptedEnglishGP: languageScore(plantCipher)
    },
    status: 'No plaintext claim; compare both held-out language score and IoC to raw'
  };
  process.stdout.write(JSON.stringify(output, null, 2) + '\n');
  return output;
}
if (require.main === module) main();
module.exports = { decode, encrypt, main };
