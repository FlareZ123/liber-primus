'use strict';

/**
 * Reconstruct the 361-entry prime/gap sequence reported for Cicada's 2013
 * remote "primes" command, correct the 133/331 indexing convention, and test
 * the exact sequence as a fixed direct-GP29 additive key on original LP2.
 *
 * Source limitation: the omitted-prime list is a secondary historical
 * transcription, not an authenticated capture or server implementation.
 *
 * Run: node sims/telnet2013_prime_gap361_gate.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const pages = corpus.pages.filter(page =>
  page.page <= 55 && page.status === 'unsolved' && page.indices.length
).map(page => page.indices);
const MOD = 29;

function mod(value, modulus) {
  return ((value % modulus) + modulus) % modulus;
}

function primesInRange(lower, upperExclusive) {
  const out = [];
  for (let n = lower; n < upperExclusive; n++) {
    let prime = true;
    for (let d = 2; d * d <= n; d++) {
      if (n % d === 0) {
        prime = false;
        break;
      }
    }
    if (prime) out.push(n);
  }
  return out;
}

const missing = primesInRange(73, 1224);
assert.equal(missing.length, 180);
assert.equal(missing[0], 73);
assert.equal(missing.at(-1), 1223);

// S = gap(71,73), p21, gap(p21,p22), p22, ..., p200, gap(p200,p201).
const sequence = [missing[0] - 71];
for (let i = 0; i < missing.length; i++) {
  const next = i + 1 < missing.length ? missing[i + 1] : 1229;
  sequence.push(missing[i], next - missing[i]);
}
assert.equal(sequence.length, 361);
assert.equal(sequence[0], 2);
assert.equal(sequence.at(-1), 6);
assert.equal(sequence[132], 6);   // one-based position 133
assert.equal(sequence[133], 449); // zero-based offset 133
assert.equal(sequence[330], 6);   // one-based position 331
assert.equal(sequence[331], 1109);// zero-based offset 331

function primeOrdinal(value) {
  return primesInRange(2, value + 1).length;
}
assert.equal(primeOrdinal(449), 87);
assert.equal(primeOrdinal(1109), 186);

const key = sequence.map(value => mod(value, MOD));

function ioc(values) {
  const counts = new Uint32Array(MOD);
  for (const value of values) counts[value]++;
  const n = values.length;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) /
    (n * (n - 1));
}

function decodeOriginal(sign, clock) {
  const out = [];
  let global = 0;
  for (const page of pages) {
    for (let local = 0; local < page.length; local++, global++) {
      const offset = clock === 'page' ? local : global;
      out.push(mod(page[local] + sign * key[offset % key.length], MOD));
    }
  }
  return out;
}

function encodeControl(plainPages, sign, clock) {
  const out = [];
  let global = 0;
  for (const page of plainPages) {
    const cipherPage = [];
    for (let local = 0; local < page.length; local++, global++) {
      const offset = clock === 'page' ? local : global;
      cipherPage.push(mod(page[local] - sign * key[offset % key.length], MOD));
    }
    out.push(cipherPage);
  }
  return out;
}

function decodePages(cipherPages, sign, clock) {
  const out = [];
  let global = 0;
  for (const page of cipherPages) {
    const plainPage = [];
    for (let local = 0; local < page.length; local++, global++) {
      const offset = clock === 'page' ? local : global;
      plainPage.push(mod(page[local] + sign * key[offset % key.length], MOD));
    }
    out.push(plainPage);
  }
  return out;
}

function gpEncode(english) {
  const tokens = corpus.translit.map((token, index) => [token, index])
    .sort((a, b) => b[0].length - a[0].length);
  const out = [];
  for (const raw of english.toUpperCase().match(/[A-Z]+/g) || []) {
    const word = raw.replaceAll('QU', 'CW').replaceAll('V', 'U')
      .replaceAll('K', 'C').replaceAll('Z', 'S');
    for (let i = 0; i < word.length;) {
      const match = tokens.find(([token]) => word.startsWith(token, i));
      assert.ok(match, 'No GP token at ' + word.slice(i));
      out.push(match[1]);
      i += match[0].length;
    }
  }
  return out;
}

function run() {
  assert.equal(pages.length, 55);
  const total = pages.reduce((sum, page) => sum + page.length, 0);
  assert.equal(total, 12956);
  const original = pages.flat();
  const rawIoC = ioc(original);
  const models = [];
  for (const clock of ['page', 'continuous']) {
    for (const sign of [-1, 1]) {
      const decoded = decodeOriginal(sign, clock);
      models.push({clock, sign, ioc: ioc(decoded)});
    }
  }

  const english = fs.readFileSync(
    path.join(ROOT, 'resources/control/shakespeare_first300k.txt'), 'utf8');
  const language = gpEncode(english).slice(0, total);
  assert.equal(language.length, total);
  const plainPages = [];
  let cursor = 0;
  for (const page of pages) {
    plainPages.push(language.slice(cursor, cursor + page.length));
    cursor += page.length;
  }
  const positive = [];
  for (const clock of ['page', 'continuous']) {
    const cipher = encodeControl(plainPages, -1, clock);
    const recovered = decodePages(cipher, -1, clock).flat();
    assert.deepEqual(recovered, language);
    positive.push({clock, exactRecovered: recovered.length, ioc: ioc(recovered)});
  }

  const expected = [
    {clock: 'page', sign: -1, ioc: 0.034491326460880746},
    {clock: 'page', sign: 1, ioc: 0.03447049771759632},
    {clock: 'continuous', sign: -1, ioc: 0.034481853434043724},
    {clock: 'continuous', sign: 1, ioc: 0.03446681574867476}
  ];
  for (let i = 0; i < expected.length; i++) {
    assert.equal(models[i].clock, expected[i].clock);
    assert.equal(models[i].sign, expected[i].sign);
    assert.ok(Math.abs(models[i].ioc - expected[i].ioc) < 1e-12);
  }

  return {
    source: 'Secondary transcription of the 2013 remote primes output; not authenticated server code',
    missingPrimeCount: missing.length,
    gapCount: 181,
    sequenceLength: sequence.length,
    sequenceStart: sequence.slice(0, 12),
    sequenceEnd: sequence.slice(-8),
    selectors: {
      zeroBased133: sequence[133],
      zeroBased331: sequence[331],
      oneBased133: sequence[132],
      oneBased331: sequence[330],
      primeOrdinals: {449: primeOrdinal(449), 1109: primeOrdinal(1109)},
      rowMajor19x19ZeroBased: {
        133: [Math.floor(133 / 19), 133 % 19],
        331: [Math.floor(331 / 19), 331 % 19]
      }
    },
    original: {
      pages: pages.length,
      runes: total,
      ioc: rawIoC,
      uniformReference: 1 / MOD,
      fixedDirectGP29Models: models
    },
    positiveControl: positive,
    decision: 'No original LP2 plaintext from the fixed phase-zero direct-GP29 use of this 361-value sequence.'
  };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(run(), null, 2) + '\n');
}

module.exports = {primesInRange, sequence, key, ioc, decodeOriginal, run};
