'use strict';

/**
 * Source-frozen GP29 original-cipher test for the p27/p55 wing bookend.
 * Run from the repository root with Node.js; reads only bundled source files.
 *
 * Assumptions tested:
 *  - 14 visible-rune positions per page-local clock cycle.
 *  - The two source-identical six-rune bookends at offsets 28 and 70
 *    are plaintext "OUR OWN", a phrase independently preserved in p57.
 *  - Either an affine Fibonacci key stream, or a simple affine period-14
 *    stream whose first six phase keys are fixed from the crib.
 * No unknown-page decoded text is used to fit a model.
 *
 * @returns {void}
 */
function main() {
  const assert = require('node:assert/strict');
  const fs = require('node:fs');
  const path = require('node:path');

  /** @type {{ runes: string[], translit: string[], pages: {page:number,indices:number[]}[] }} */
  const corpus = JSON.parse(fs.readFileSync(path.join('resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
  const byPage = (/** @type {number} */ n) => {
    const p = corpus.pages.find(x => x.page === n);
    assert.ok(p, 'Missing physical page ' + n);
    return p.indices;
  };
  const mod = (/** @type {number} */ n) => ((n % 29) + 29) % 29;
  /** @type {number[]} */
  const original = [23, 11, 1, 17, 18, 10]; // "DJU BEI"
  /** @type {number[]} */
  const known = [3, 1, 4, 3, 7, 9]; // "OUR OWN"

  for (const [page, start] of [[27, 28], [55, 70]]) {
    assert.deepEqual(byPage(page).slice(start, start + 6), original);
    assert.equal(start % 14, 0);
  }
  assert.ok(byPage(57).join(',').includes(known.join(',')), 'Known original p57 phrase is missing');
  assert.equal(byPage(55).length, 76);
  assert.equal(byPage(27).length, 234);

  // C_i = a * P_i + K_i, where a is any scalar in GF(29).
  // If K follows Fibonacci, the zero plain residual at indices 0..2
  // forces the same zero ciphertext residual at 0..2, regardless of a.
  const residual = (/** @type {number[]} */ x, /** @type {number} */ i) =>
    mod(x[i + 2] - x[i + 1] - x[i]);
  const rP = residual(known, 0);
  const rC = residual(original, 0);
  assert.equal(rP, 0);
  assert.equal(rC, 25);
  assert.notEqual(rC, rP);

  // Verify a genuinely encrypted native GP29 phrase passes the same invariant.
  const plantA = 9;
  const plantK = [3, 8];
  for (let i = 2; i < known.length; i++) plantK.push(mod(plantK[i - 1] + plantK[i - 2]));
  const plantC = known.map((p, i) => mod(plantA * p + plantK[i]));
  for (let i = 0; i < known.length - 2; i++) {
    assert.equal(residual(plantC, i), mod(plantA * residual(known, i)));
  }

  // For a general phase-14 affine stream, six phase keys are uniquely
  // determined by the crib for a specified multiplier. The other eight
  // phases remain UNKNOWN; never treat '?' output as plaintext.
  const page55First = byPage(55)[0];
  const page27First = byPage(27).slice(0, 3);
  const read = (/** @type {number[]} */ x) => x.map(v => corpus.translit[v]).join('');
  const expected = new Map([[1, ['EAOF', 'U']], [28, ['WEAH', 'C']], [14, ['JYEO', 'W']]]);
  /** @type {{slope:number, page27:string, page55:string}[]} */
  const nativeSingletonCandidates = [];
  for (let a = 1; a <= 28; a++) {
    const inverse = Array.from({ length: 28 }, (_, i) => i + 1).find(v => mod(a * v) === 1);
    assert.ok(inverse);
    const keys = original.map((v, i) => mod(v - a * known[i]));
    const decodedRune = (/** @type {number} */ v, /** @type {number} */ phase) =>
      mod(inverse * mod(v - keys[phase]));
    const prediction55 = read([decodedRune(page55First, 0)]);
    const prediction27 = read(page27First.map((v, i) => decodedRune(v, i)));
    const recipher = known.map((v, i) => mod(a * v + keys[i]));
    assert.deepEqual(recipher, original);
    if (expected.has(a)) assert.deepEqual([prediction27, prediction55], expected.get(a));
    if (prediction55 === 'A' || prediction55 === 'I') {
      nativeSingletonCandidates.push({slope:a, page27:prediction27, page55:prediction55});
    }
    if (expected.has(a) || prediction55 === 'A' || prediction55 === 'I') {
      console.log(`affine slope ${a}: phase-0..5 keys=${keys.join(',')} ; p27 first complete word=${prediction27}; p55 first complete word=${prediction55}`);
    }
  }
  assert.deepEqual(nativeSingletonCandidates, [
    {slope:8, page27:'BDE', page55:'I'},
    {slope:22, page27:'TNB', page55:'A'},
  ]);
  console.log(`native A/I singleton slopes: ${JSON.stringify(nativeSingletonCandidates)}`);
  console.log(`original p27:28 / p55:70 both phase 0 mod14; page-local 14-rune register`);
  console.log(`known crib OUR OWN first-three GF29 Fibonacci residual = ${rP}; original DJU BEI residual = ${rC}`);
  console.log('Fibonacci-affine crib rejected for every GF29 scalar; planted affine-Fibonacci control passed.');
  console.log('Among all 28 nonzero affine slopes, only a=8/22 yields an A/I singleton; both yield a p27 first word that is not native English.');
  console.log('All-secret phase14 affine + OUR OWN crib + preserved native-English word segmentation fails; no unknown LP2 plaintext or key.');
}

main();
