'use strict';

/**
 * Frozen historical two-step LP2 candidate:
 * 2015 participant's prime-subtract-and-difference D (or documented second
 * difference E), then the **exact 2014 solved 14-column row permutation**
 * followed by the authentically solved p56 GP29 phi(prime) F-transparent cipher.
 *
 * Source tests on original LP2 p0-2 black body and whole p3-7 holdout.
 * No variable key/phase, language ranking, fitted transposition, or skip mask.
 * Re-run under Windows 11 / Node22 from repository root:
 *   node sims/lp2_2015_prime_delta_2014col14_phi_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, '..',
  'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const mod = v => ((v % 29) + 29) % 29;
const order = [2, 8, 9, 1, 12, 13, 11, 4, 5, 7, 3, 0, 6, 10];
const prime = [];
for (let p = 2; prime.length < 2400; p += 1) {
  if (prime.every(q => q * q > p || p % q !== 0)) prime.push(p);
}
assert.equal(corpus.runes.length, 29);
assert.equal(order.length, 14);
assert.equal(new Set(order).size, 14);

/** @param {number} first @param {number} last @returns {number[]} */
function chapter(first, last) {
  const pages = corpus.pages.filter(p => p.page >= first && p.page <= last);
  return pages.flatMap(p => p.indices);
}
/** @param {number[]} cipher @returns {number[]} */
function difference(cipher) {
  let prev = mod(-prime[0]);
  return cipher.map((c, i) => {
    const s = mod(c - prime[i + 1]);
    const d = mod(s - prev);
    prev = s;
    return d;
  });
}
/** @param {number[]} d @returns {number[]} */
function undifference(d) {
  let prev = mod(-prime[0]);
  return d.map((di, i) => {
    prev = mod(prev + di);
    return mod(prev + prime[i + 1]);
  });
}
/** @param {number[]} d @returns {number[]} */
function differenceAgain(d) {
  return d.map((v, i) => mod(v - (i ? d[i - 1] : 0)));
}
/** @param {number[]} e @returns {number[]} */
function integrateOnce(e) {
  let prev = 0;
  return e.map(v => (prev = mod(prev + v)));
}

/**
 * The actual 2014 solution rearranged source **columns** but read the
 * resulting 14-column grid **across rows**, not vertically. Thus it is an
 * exact within-each-row permutation, naturally ragged at the final row.
 * @param {number[]} xs
 * @returns {number[]}
 */
function historical14(xs) {
  const out = [];
  for (let i = 0; i < xs.length; i += 14) {
    const row = xs.slice(i, i + 14);
    for (const j of order) if (j < row.length) out.push(row[j]);
  }
  assert.equal(out.length, xs.length);
  return out;
}
/** @param {number[]} xs @returns {number[]} */
function inverseHistorical14(xs) {
  const out = [];
  for (let i = 0; i < xs.length; i += 14) {
    const length = Math.min(14, xs.length - i);
    const rows = new Array(length);
    const indices = order.filter(j => j < length);
    for (let k = 0; k < indices.length; k += 1) {
      rows[indices[k]] = xs[i + k];
    }
    out.push(...rows);
  }
  return out;
}
/**
 * Historical known ciphertext, 5x14, from 2014 Stage10 account:
 * expected plaintext starts GOOD WORK and yields an onion hostname.
 */
const oldCipher = 'IDGTKUMLOOARWOERTHISUTETLHUTIATSLLOUIMNITELNJ7TFYVOIUAUSNOCO5JI4MEODZZ';
const oldClear = 'GOODWORKULTIMATETRUTHISTHEULTIMATEILLUSIONJOINUSATFV7LYUCMEOZZD5J4ONIO';
assert.equal(oldCipher.length, 70);
assert.equal(historical14([...oldCipher].map(x => x.charCodeAt(0)))
  .map(x => String.fromCharCode(x)).join(''), oldClear);
assert.deepEqual(inverseHistorical14([...oldClear].map(x => x.charCodeAt(0))),
  [...oldCipher].map(x => x.charCodeAt(0)));

/**
 * Exact p56 F-conditional inverse feasibility. The key clock advances only
 * on plaintext != F. States are consumed-key counts; different histories
 * reaching the same count have equivalent futures and can be merged.
 * @param {number[]} cipher
 * @param {1|-1} sign
 * @returns {number}
 */
function furthestF(cipher, sign) {
  let states = [0];
  for (let i = 0; i < cipher.length; i += 1) {
    const next = [];
    const seen = new Set();
    for (const used of states) {
      if (cipher[i] === 0 && !seen.has(used)) {
        next.push(used);
        seen.add(used);
      }
      const p = mod(cipher[i] - sign * (prime[used] - 1));
      if (p !== 0 && !seen.has(used + 1)) {
        next.push(used + 1);
        seen.add(used + 1);
      }
    }
    if (!next.length) return i;
    states = next;
  }
  return cipher.length;
}
/**
 * Historical F bypass strict forward encoder.
 * @param {number[]} plain
 * @param {1|-1} sign
 * @returns {number[]}
 */
function encodeF(plain, sign) {
  let consumed = 0;
  return plain.map(p => p === 0 ? 0 :
    mod(p + sign * (prime[consumed++] - 1)));
}
function ioc(xs) {
  const f = Array(29).fill(0);
  xs.forEach(v => f[v] += 1);
  return f.reduce((a, v) => a + v * (v - 1), 0) /
    (xs.length * (xs.length - 1));
}
const full = chapter(0, 2);
assert.equal(full.length, 729);
const first = difference(full);
assert.deepEqual(undifference(first), full);
assert.equal(first.slice(1).filter((v, j) => v === first[j]).length, 40);
const second = differenceAgain(first);
assert.deepEqual(integrateOnce(second), first);
assert.equal(second.filter(v => v === 0).length, 40);
assert.equal(second.length, 729);

const clear95 = corpus.pages.find(p => p.page === 57).indices;
assert.equal(clear95.length, 95);
const jobs = [
  {name: 'p0-p2-title13-body716', original: full, cut: 13},
  {name: 'p3-p7-independent-whole-chapter', original: chapter(3, 7), cut: 0}
];
const outcomes = [];
for (const job of jobs) {
  const d = difference(job.original);
  const e = differenceAgain(d);
  assert.deepEqual(undifference(d), job.original);
  assert.deepEqual(integrateOnce(e), d);
  for (const [register, tape] of [['D', d], ['E', e]]) {
    const prefix = tape.slice(0, job.cut);
    const body = tape.slice(job.cut);
    const shifted = historical14(body);
    assert.deepEqual(inverseHistorical14(shifted), body);
    const transformedIoc = ioc(shifted);
    for (const sign of [1, -1]) {
      const furthest = furthestF(shifted, sign);
      // Full two-stage plant: encode a source-native 95-rune clear GP
      // repeated across the entire target body under the same F policy;
      // undo both transposition and the original 2015 prime-delta rule.
      const planted = body.map((_, i) => clear95[i % clear95.length]);
      const plantShifted = encodeF(planted, sign);
      const plantTape = [...prefix, ...inverseHistorical14(plantShifted)];
      const syntheticOriginal = undifference(register === 'D' ?
        plantTape : integrateOnce(plantTape));
      const reforwardD = difference(syntheticOriginal);
      const reforwardRegister = register === 'D' ?
        reforwardD : differenceAgain(reforwardD);
      const reforwardShifted = historical14(reforwardRegister.slice(job.cut));
      assert.deepEqual(reforwardShifted, plantShifted);
      assert.equal(furthestF(reforwardShifted, sign), planted.length);
      // Plant's known literal F skip count ensures exact authentic forward.
      const record = {name: job.name, register, sign,
        originalRunes: job.original.length, titleRunes: job.cut,
        testedBodyRunes: shifted.length, firstImpossibleIndex: furthest,
        transformedIoC: transformedIoc,
        nativePlantRecovered: planted.length,
        fullOriginalReplay: true};
      outcomes.push(record);
      console.log(JSON.stringify(record));
    }
  }
}
assert.equal(outcomes.length, 8);
assert.ok(outcomes.every(x => x.firstImpossibleIndex < x.testedBodyRunes));
console.log(JSON.stringify({
  status: 'PASS', historical2015RepeatedD: 40,
  originalSourceModelsRejected: outcomes.length,
  historically2014Solved14Columns: true,
  allNativePlantRoundTrips: true,
  verdict: 'Exact historic 2015-D/E + authentic 2014 col14 + p56 phi F-bypass receiver fails on original GP29, no source-selected continuation'
}));
