'use strict';

/**
 * Original-cipher page-reset keystream collision control.
 *
 * Source: resources/liber-primus/lp2-corpus.json.
 * Run: node sims/lp2_full_corpus_page_position_collision_sft.cjs
 *
 * A common page-position-dependent bijection (including an unknown shared
 * additive pad) preserves equality at each fixed page-local rune offset.
 * Circular-shift nulls preserve each physical page's rune counts and
 * within-page structure but destroy cross-page phase alignment.
 *
 * The pairwise maximum is calibrated across all source pages simultaneously:
 * a best-looking pair selected after inspection is not a preregistered test.
 *
 * @returns {void}
 */
function main() {
  const assert = require('node:assert/strict');
  const fs = require('node:fs');
  const path = require('node:path');
  const sourcePath = path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json');
  const corpus = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
  /** @type {{page:number, a:number[], n:number, frequency:Int32Array}[]} */
  const pages = corpus.pages
    .filter((p) => p.page <= 55 && p.indices.length > 0)
    .map((p) => {
      const frequency = new Int32Array(29);
      for (const x of p.indices) frequency[x]++;
      return { page: p.page, a: p.indices, n: p.indices.length, frequency };
    });
  assert.equal(pages.length, 55);

  const maxLength = Math.max(...pages.map((p) => p.n));

  /**
   * @param {number[]} shifts Zero-based physical-page rune rotations.
   * @param {{page:number,a:number[],n:number}[]} inputs
   * @returns {{matches:number,pairs:number,rate:number}}
   */
  function pooledCollisions(shifts, inputs) {
    let matches = 0;
    let pairs = 0;
    for (let pos = 0; pos < maxLength; pos++) {
      const histogram = new Int32Array(29);
      let n = 0;
      for (let k = 0; k < inputs.length; k++) {
        const p = inputs[k];
        if (pos >= p.n) continue;
        histogram[p.a[(pos + shifts[k]) % p.n]]++;
        n++;
      }
      pairs += n * (n - 1) / 2;
      for (const f of histogram) matches += f * (f - 1) / 2;
    }
    return { matches, pairs, rate: matches / pairs };
  }

  /** @type {{i:number,j:number,n:number,p:number}[]} */
  const pairTests = [];
  for (let i = 0; i < pages.length; i++) {
    for (let j = i + 1; j < pages.length; j++) {
      const a = pages[i];
      const b = pages[j];
      const n = Math.min(a.n, b.n);
      if (n < 200) continue;
      let expected = 0;
      for (let x = 0; x < 29; x++) expected += a.frequency[x] * b.frequency[x];
      pairTests.push({ i, j, n, p: expected / (a.n * b.n) });
    }
  }

  /**
   * @param {number[]} shifts
   * @returns {{z:number, pages:[number,number], matches:number, n:number}}
   */
  function maxPairZ(shifts) {
    let best = { z: -Infinity, pages: [0, 0], matches: 0, n: 0 };
    for (const { i, j, n, p } of pairTests) {
      const a = pages[i];
      const b = pages[j];
      let matches = 0;
      for (let t = 0; t < n; t++) {
        matches += a.a[(shifts[i] + t) % a.n] === b.a[(shifts[j] + t) % b.n] ? 1 : 0;
      }
      const z = (matches - n * p) / Math.sqrt(n * p * (1 - p));
      if (z > best.z) best = { z, pages: [a.page, b.page], matches, n };
    }
    return best;
  }

  let seed = 0x33012026;
  /** @returns {number} Unsigned 32-bit fixed-state random variate. */
  function random32() {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return seed >>> 0;
  }

  /** @returns {number[]} */
  function randomShifts() {
    return pages.map((p) => random32() % p.n);
  }

  const zeros = pages.map(() => 0);
  const observed = pooledCollisions(zeros, pages);
  assert.equal(observed.matches, 10751);
  assert.equal(observed.pairs, 311132);
  const selected = maxPairZ(zeros);
  assert.deepEqual(selected.pages, [28, 42]);
  assert.equal(selected.matches, 21);
  assert.equal(selected.n, 269);

  const globalNull = [];
  for (let iteration = 0; iteration < 1000; iteration++) {
    globalNull.push(pooledCollisions(randomShifts(), pages).rate);
  }
  const maxPairNull = [];
  for (let iteration = 0; iteration < 400; iteration++) {
    maxPairNull.push(maxPairZ(randomShifts()).z);
  }
  const average = (a) => a.reduce((sum, v) => sum + v, 0) / a.length;
  const globalMean = average(globalNull);
  const globalSd = Math.sqrt(average(globalNull.map((v) => (v - globalMean) ** 2)));
  const globalUpper = (1 + globalNull.filter((v) => v >= observed.rate).length) / (globalNull.length + 1);
  const pairUpper = (1 + maxPairNull.filter((v) => v >= selected.z).length) / (maxPairNull.length + 1);

  // Transparent positive control: native p57 clear rune distribution,
  // independent cleartext samples, and one common secret rune shift per offset.
  // A common unknown bijection at each position preserves the collision rate.
  const clear = corpus.pages[57].indices;
  const pad = Array.from({ length: maxLength }, () => random32() % 29);
  const planted = pages.map((p) => {
    const a = Array.from({ length: p.n }, (_, pos) => (clear[random32() % clear.length] + pad[pos]) % 29);
    return { page: p.page, a, n: p.n };
  });
  const positive = pooledCollisions(zeros, planted);
  assert.ok(positive.rate > 0.05, 'positive known-plaintext control was not detected');
  assert.ok(observed.rate < 0.04, 'observed original unexpectedly concentrated; re-examine hypothesis');

  console.log('LP2 page-position shared-bijection source gate: PASS');
  console.log(`Original: rune-bearing pages=${pages.length}, same-position rune pairs=${observed.matches}/${observed.pairs}, rate=${observed.rate.toFixed(8)}`);
  console.log(`Circular-shift null (1000): mean=${globalMean.toFixed(8)} sd=${globalSd.toFixed(8)} upper-tail=${globalUpper.toFixed(5)}`);
  console.log(`Max among ${pairTests.length} page pairs (overlap >=200): p${selected.pages[0]}/p${selected.pages[1]}, ${selected.matches}/${selected.n}, z=${selected.z.toFixed(4)}`);
  console.log(`Full-family circular-shift null (400): mean=${average(maxPairNull).toFixed(4)} upper-tail=${pairUpper.toFixed(5)}`);
  console.log(`p57-distribution common-pad positive control: ${positive.rate.toFixed(8)} (original ${observed.rate.toFixed(8)})`);
  console.log('Scope: no evidence for one common page-position bijective pad across all pages;');
  console.log('this does not exclude different keys on different pages or nonbijective stateful ciphers.');
}

main();
