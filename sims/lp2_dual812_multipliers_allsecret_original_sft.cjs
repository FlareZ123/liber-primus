"use strict";
/**
 * All-key finite obstruction for an original LP2 dual-unit multiplicative
 * cipher in which each plaintext rune chooses one fixed GP29 dual-unit
 * multiplier, with independent secret 29-entry tables on every physical page.
 *
 * The 812-unit pair representation and source candidate generator 19+13ε
 * are documented in im-results/lp2-dual812-fullring-nonunit-completion.md.
 * Here the new fact is overlap: u_i=(C_i-C_(i-1))+C_(i-1)ε, so for two
 * consecutive unequal transitions u_(i+1)*u_i^{-1} is fully observed.
 *
 * Windows Node.js 22 / CommonJS SFT:
 * node sims/lp2_dual812_multipliers_allsecret_original_sft.cjs
 * The SFT is read-only and imports no third-party dependencies.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const source = JSON.parse(fs.readFileSync(path.join(__dirname, "..",
  "resources", "liber-primus", "lp2-corpus.json"), "utf8"));

const P = 29;
const mod = (x) => ((x % P) + P) % P;
/** @param {number} a @returns {number} */
function inverse(a) {
  assert.ok(a > 0 && a < P);
  for (let k = 1; k < P; k++) {
    if (mod(a * k) === 1) return k;
  }
  throw new Error("nonunit inversion");
}
/** @typedef {{a:number,b:number}} Dual */
/** @param {Dual} l @param {Dual} r @returns {Dual} */
function multiply(l, r) {
  return {a: mod(l.a * r.a), b: mod(l.a * r.b + l.b * r.a)};
}
/** @param {number} x @param {number} y @returns {Dual} */
function ringPair(x, y) {
  return {a: mod(y - x), b: x};
}
/**
 * Exact unique multiplier taking one overlapping unequal pair to the next.
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @returns {Dual|null}
 */
function observedMultiplier(x, y, z) {
  const first = ringPair(x, y), second = ringPair(y, z);
  if (!first.a || !second.a) return null;
  const alpha = mod(second.a * inverse(first.a));
  const beta = mod((second.b - alpha * first.b) * inverse(first.a));
  const multiplier = {a: alpha, b: beta};
  assert.deepEqual(multiply(multiplier, first), second);
  // Overlapping-pair consistency fixes beta after alpha, previous x and d.
  assert.equal(beta, mod(1 + (1 - alpha) * x * inverse(first.a)));
  return multiplier;
}
/** @param {Dual} m @returns {number} */
function unitCode(m) {return P * m.a + m.b;}
/** @param {number[]} numbers @returns {number} */
function ioc(numbers) {
  const f = new Uint32Array(28);
  for (const d of numbers) {assert.ok(d >= 0 && d < 28); f[d]++;}
  return f.reduce((s, v) => s + v * (v - 1), 0) /
    (numbers.length * (numbers.length - 1));
}

// Any state (x,y), x!=y, permits exactly 28 overlap-compatible units,
// including 1+epsilon as the only unit valid at *every* possible state.
// There are 27*29+1=784 distinct permissible multipliers across all states.
const allUnits = new Set();
for (let x = 0; x < P; x++) {
  for (let d = 1; d < P; d++) {
    const y = mod(x + d);
    const legal = new Set();
    for (let z = 0; z < P; z++) {
      const m = observedMultiplier(x, y, z);
      if (z === y) assert.equal(m, null);
      else {assert.ok(m !== null); legal.add(unitCode(m)); allUnits.add(unitCode(m));}
    }
    assert.equal(legal.size, 28);
  }
}
assert.equal(allUnits.size, 784);
for (let alpha = 1; alpha < P; alpha++) {
  for (let beta = 0; beta < P; beta++) {
    assert.equal(allUnits.has(P * alpha + beta),
      alpha === 1 ? beta === 1 : true);
  }
}

const pages = source.pages.filter((p) => p.page <= 55 && p.indices.length);
assert.equal(pages.length, 55);
assert.equal(pages.reduce((s, p) => s + p.indices.length, 0), 12956);

const generator = {a: 19, b: 13};
const observed = new Set();
const pageEvidence = [];
const ratioPow = new Int16Array(28);
const ratioLog = new Int16Array(P).fill(-1);
let element = 1;
for (let k = 0; k < 28; k++) {
  assert.equal(ratioLog[element], -1);
  ratioLog[element] = k;
  ratioPow[k] = element;
  element = mod(element * 19);
}
assert.equal(element, 1);

let sourceTriples = 0;
let exceptionalTriples = 0;
let generatorMatches = 0;
let generatorOverlapFeasible = 0;
const ratioSymbols = [];
for (const p of pages) {
  const symbols = p.indices;
  const local = new Set();
  let eligible = 0;
  let excluded = 0;
  for (let i = 1; i + 1 < symbols.length; i++) {
    const x = symbols[i - 1], y = symbols[i], z = symbols[i + 1];
    const before = ringPair(x, y), after = ringPair(y, z);
    const mul = observedMultiplier(x, y, z);
    if (!mul) {excluded++; exceptionalTriples++; continue;}
    local.add(unitCode(mul));
    observed.add(unitCode(mul));
    eligible++;
    sourceTriples++;
    ratioSymbols.push(ratioLog[mul.a]);
    assert.ok(ratioLog[mul.a] >= 0);
    if (mod((generator.a - 1) * x + (generator.b - 1) * before.a) === 0)
      generatorOverlapFeasible++;
    if (multiply(generator, before).a === after.a &&
        multiply(generator, before).b === after.b)
      generatorMatches++;
  }
  // Even an arbitrary per-page, unknown 29-entry GP29->unit table would
  // expose no more than 29 distinct multipliers. Every page exceeds 29.
  assert.ok(local.size > 29, "page "+p.page+" excludes 29-entry table");
  pageEvidence.push({
    page: p.page, runes: symbols.length,
    legalTriples: eligible, distinctUnitMultipliers: local.size,
    pairsWithNonunit: excluded
  });
}
assert.equal(sourceTriples, 12676);
assert.equal(exceptionalTriples, 170);
assert.equal(observed.size, 784);
assert.equal(generatorOverlapFeasible, 437);
assert.equal(generatorMatches, 14);
assert.equal(Math.min(...pageEvidence.map((p) => p.distinctUnitMultipliers)), 60);
assert.equal(Math.max(...pageEvidence.map((p) => p.distinctUnitMultipliers)), 228);
assert.ok(Math.abs(ioc(ratioSymbols) - 0.035709433659284376) < 1e-12);

/* A genuinely clear p57 GP29 source plant demonstrates the only fully
   reversible path here: a STATE-CONDITIONED 28-choice unit multiplier.
   Its 95 authentic symbols happen all to be 0..27, so no nonunit reset is
   needed. Its multiplier is alpha=19^P and beta is derived from state. */
const clear = source.pages.find((p) => p.page === 57);
assert.ok(clear && clear.indices.length === 95);
assert.ok(clear.indices.every((value) => value >= 0 && value < 28));
const planted = [13, 14];
for (const token of clear.indices) {
  const x = planted[planted.length - 2];
  const y = planted[planted.length - 1];
  const d = mod(y - x);
  const next = mod(y + d * ratioPow[token]);
  const mul = observedMultiplier(x, y, next);
  assert.ok(mul);
  assert.equal(ratioLog[mul.a], token);
  planted.push(next);
}
const recovered = [];
for (let i = 2; i < planted.length; i++) {
  const mul = observedMultiplier(planted[i - 2], planted[i - 1], planted[i]);
  assert.ok(mul);
  recovered.push(ratioLog[mul.a]);
}
assert.deepEqual(recovered, clear.indices);
assert.equal(planted.length, 97);

const result = {
  originalRunes: 12956,
  originalCipherPages: 55,
  consecutiveUnequalPairTriples: sourceTriples,
  triplesTouchingNonunit: exceptionalTriples,
  allLegalOverlapMultipliers: allUnits.size,
  originalDistinctMultipliers: observed.size,
  pageDistinctMultiplierMinimum: 60,
  pageDistinctMultiplierMaximum: 228,
  sourceGenerator: generator,
  sourceGeneratorOverlapCompatibleTriples: generatorOverlapFeasible,
  sourceGeneratorExactTransitions: generatorMatches,
  ratioLogGp28IndexOfCoincidence: ioc(ratioSymbols),
  genuineP57Gp28PlantRecovered: recovered.length,
  conclusion: "Every source page independently excludes all secret fixed 29-symbol-to-dual-unit multiplier tables. A changing-state 28-choice ratio remains possible only with a separate authored reset/escape rule."
};
console.log(JSON.stringify(result, null, 2));
