"use strict";
/**
 * Original LP2 p7 residual x^2-8 root56 as the strict, source-canonical
 * two-rune GF(29^2) page-clock receiver, director issue #2309.
 *
 * A source-visible residual factor gives the extension-field ring.
 * Treat each *global* consecutive ciphertext rune pair as a+bX in
 * F29[X]/(X^2-8). For page p of its first rune, multiply by X^(-p).
 * Root sign is the only explicitly predeclared rival.
 *
 * This is a bounded **conditional** decoder. Neither the p7/p8 manuscript
 * nor a period-signed message has yet authorized a paired-rune cipher,
 * the page clock origin, or decoding via the extension-field generator.
 *
 * Windows 11 Node.js 22, CommonJS, no packages, no writes.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const data = JSON.parse(fs.readFileSync(path.join(root,
  "resources/liber-primus/lp2-corpus.json"), "utf8"));
const rawPages = data.pages.filter(p => p.page <= 55);
assert.equal(rawPages.length, 56);
assert.equal(rawPages.find(p => p.page === 50).indices.length, 0);
const M = 29;
const mod = n => (n % M + M) % M;

/** @typedef {[number, number]} F29Pair */
/** @param {F29Pair} a @param {F29Pair} b @returns {F29Pair} */
function mul(a, b) {
  return [mod(a[0] * b[0] + 8 * a[1] * b[1]),
    mod(a[0] * b[1] + a[1] * b[0])];
}
/** @param {F29Pair} a @param {number} n @returns {F29Pair} */
function power(a, n) {
  assert(Number.isSafeInteger(n) && n >= 0);
  let result = [1, 0];
  for (let x = a, k = n; k > 0; k = Math.floor(k / 2)) {
    if (k % 2) result = mul(result, x);
    x = mul(x, x);
  }
  return result;
}
const P = x => mod(11 + 26 * x + 8 * x ** 2 + 15 * x ** 3 + 2 * x ** 4);
for (let x = 0; x < M; x++) {
  const rhs = mod(2 * (x - 3) * (x - 4) * (x ** 2 - 8));
  assert.equal(mod(P(x) - x), rhs);
}
assert.deepEqual([0, 1], power([0, 1], 1));
assert.deepEqual(power([0, 1], 28), [28, 0]);
assert.deepEqual(power([0, 1], 56), [1, 0]);
assert.deepEqual(power([0, M - 1], 28), [28, 0]);
assert.deepEqual(power([0, M - 1], 56), [1, 0]);
for (const sign of [1, -1]) {
  const gen = [0, mod(sign)];
  for (let n = 1; n < 56; n++) {
    assert.notDeepEqual(power(gen, n), [1, 0], "generator must have period56");
  }
  for (let n = 0; n < 56; n++) {
    const factor = power(gen, n);
    // Use exact iterative finite-field recurrence (no overflowing powers).
    const slow = [1, 0];
    for (let i = 0; i < n; i++) {
      const next = mul(slow, gen);
      slow[0] = next[0]; slow[1] = next[1];
    }
    assert.deepEqual(factor, slow);
    assert.equal(Number(factor[0] === 0) + Number(factor[1] === 0), 1,
      "power of X must be a monomial matrix on rune pairs");
    // Encipher/decrypt on a synthetic arbitrary pair.
    const x = [7, 19];
    assert.deepEqual(mul(mul(x, power(gen, (56 - n) % 56)), factor), x);
  }
}

const ciphertext = [], originPage = [];
const pageStarts = new Map();
for (const p of rawPages) {
  pageStarts.set(p.page, ciphertext.length);
  ciphertext.push(...p.indices);
  for (let i = 0; i < p.indices.length; i++) originPage.push(p.page);
}
assert.equal(ciphertext.length, 12956);
assert.equal(ciphertext.length % 2, 0);
const pagePairs = new Map();
for (let i = 0; i < ciphertext.length; i += 2) {
  const owner = originPage[i];
  if (!pagePairs.has(owner)) pagePairs.set(owner, []);
  pagePairs.get(owner).push(i);
}
assert.equal(pagePairs.has(50), false);

/** Exact GF29 frequency collision probability, invariant under symbol relabel. */
function ioc(a) {
  const count = Array(29).fill(0);
  for (const value of a) {
    assert(Number.isInteger(value) && value >= 0 && value < 29);
    count[value]++;
  }
  const n = a.length;
  return n <= 1 ? null :
    count.reduce((sum, c) => sum + c * (c - 1), 0) / (n * (n - 1));
}
/** Apply fixed source-natural page exponent to all pairs, unchanged layout. */
function apply(a, sign, decode) {
  assert.equal(a.length, ciphertext.length);
  const out = a.slice();
  const gen = [0, mod(sign)];
  for (let i = 0; i < a.length; i += 2) {
    const p = originPage[i];
    const exponent = decode ? (56 - p) % 56 : p;
    const pair = mul([a[i], a[i + 1]], power(gen, exponent));
    out[i] = pair[0];
    out[i + 1] = pair[1];
  }
  return out;
}
function physicalRange(a, lo, hi) {
  return rawPages.filter(p => p.page >= lo && p.page <= hi)
    .flatMap(p => a.slice(pageStarts.get(p.page), pageStarts.get(p.page) + p.indices.length));
}
function region(a) {
  const ranges = [[0, 0], [16, 21], [40, 53], [54, 55]];
  return Object.fromEntries(ranges.map(([lo, hi]) => {
    const take = physicalRange(a, lo, hi);
    return ["p" + lo + "-" + hi, {runes: take.length, ioc: ioc(take)}];
  }));
}
assert.equal(region(ciphertext)["p16-21"].runes, 1613);
assert.equal(region(ciphertext)["p40-53"].runes, 3008);
assert.equal(region(ciphertext)["p54-55"].runes, 308);

function byPairParityIoC(a, page) {
  const sites = pagePairs.get(page) || [];
  return [0, 1].map(parity => ioc(sites.map(i => a[i + parity])));
}
/**
 * Every X^p is monomial in the {1,X} basis: its two rune outputs are
 * separately rescaled and maybe exchanged. Therefore all collisions
 * inside an original physical-page × paired-rune parity stratum are
 * exactly invariant, even if an entirely secret 29! substitution is
 * independently supplied to *each* stratum. This tests a much larger
 * hidden-key family than simply one fixed source root/phase.
 */
function parityCollision(a) {
  let equal = 0, total = 0;
  for (const sites of pagePairs.values()) {
    for (const parity of [0, 1]) {
      const values = sites.map(i => a[i + parity]);
      const n = values.length;
      if (n <= 1) continue;
      const counts = Array(29).fill(0);
      for (const v of values) counts[v]++;
      equal += counts.reduce((sum, c) => sum + c * (c - 1), 0);
      total += n * (n - 1);
    }
  }
  return {same: equal, pairs: total, ioc: equal / total};
}
/**
 * The source quadratic generator itself gives a strictly stronger,
 * arbitrary-field-basis-independent invariant. X^(2k)=8^k*I is central
 * in GL2(29), so B X^(2k) B^-1 stays a *single common scalar* on
 * both rune coordinates, for EVERY fixed non-singular unknown basis B.
 * For any global phase, one parity cohort of physical pages is scalar.
 * A page-local bijective GP alphabet following that scalar also cannot
 * change the page-level IoC.
 */
function pageCohortCollision(a, physicalParity) {
  let equal = 0, possible = 0, count = 0, pages = 0;
  for (const [page, sites] of pagePairs.entries()) {
    if (page % 2 !== physicalParity) continue;
    const values = sites.flatMap(i => [a[i], a[i + 1]]);
    pages++;
    count += values.length;
    const hist = Array(29).fill(0);
    for (const v of values) hist[v]++;
    equal += hist.reduce((sum, x) => sum + x * (x - 1), 0);
    possible += values.length * (values.length - 1);
  }
  return { pages, runes: count, same: equal, pairs: possible,
    ioc: equal / possible };
}
const observedPageCohorts = [0, 1].map(parity =>
  pageCohortCollision(ciphertext, parity));
/**
 * The same pure-root no-go survives a fixed affine field translation:
 * T(v)=A*v+b -> T^n(v)=A^n*v+sum(A^j*b).
 * On every even exponent, A^n=lambda*I even under an arbitrary
 * hidden GL2 basis, leaving one independent affine map *per position*
 * in each original page. Per-page-and-position collisions are immutable.
 */
function affinePageCohortCollision(a, physicalParity) {
  let equal = 0, possible = 0, count = 0, groups = 0;
  for (const [page, sites] of pagePairs.entries()) {
    if (page % 2 !== physicalParity) continue;
    for (const runeParity of [0, 1]) {
      const values = sites.map(i => a[i + runeParity]);
      const hist = Array(29).fill(0);
      for (const value of values) hist[value]++;
      equal += hist.reduce((sum, v) => sum + v * (v - 1), 0);
      possible += values.length * (values.length - 1);
      count += values.length;
      groups++;
    }
  }
  return { groups, runes: count, same: equal, pairs: possible,
    ioc: equal / possible };
}
const observedAffineCohorts = [0, 1].map(parity =>
  affinePageCohortCollision(ciphertext, parity));

// Positive decoder plant only: each scalar page has a separately
// invented nonzero affine rune offset on each paired-rune position.
// The offsets are *synthetic controls*, never inferred LP2 keys.
for (const phase of [0, 1]) {
  const next = ciphertext.slice();
  for (const [page, sites] of pagePairs.entries()) {
    const powerValue = page + phase;
    if (powerValue % 2) continue;
    const scalar = power([0, 1], powerValue)[0];
    assert.notEqual(scalar, 0);
    for (const i of sites) {
      next[i] = mod(scalar * ciphertext[i] + 17 * page + 3);
      next[i + 1] = mod(scalar * ciphertext[i + 1] + 13 * page + 4);
    }
  }
  assert.deepEqual(affinePageCohortCollision(next, phase % 2),
    observedAffineCohorts[phase % 2]);
}


const observedParity = parityCollision(ciphertext);
const {encodeSourceNativeGP} = require("./lp2_native_gp_source_orthography_sft.cjs");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const donorFiles = {
  gibran: "resources/control/gibran_prophet_58585.txt",
  shakespeare: "resources/control/shakespeare_first300k.txt",
  emerson: "resources/control/emerson_essays_2944.txt"
};
const nativeBaseline = {};
const beowulf = JSON.parse(read("resources/control/beowulf_oe_gp_profile_corrected.json"));
const beowulfAlphabet = beowulf.positiveControlAlphabet;
assert.equal(beowulfAlphabet.length, 29);
const oeSource = [...beowulf.sourceGpBase29]
  .map(symbol => beowulfAlphabet.indexOf(symbol));
assert.equal(oeSource.length, 48012);
const oeCounts = Array(29).fill(0);
for (const symbol of oeSource) {
  assert(symbol >= 0 && symbol < 29);
  oeCounts[symbol]++;
}
assert.deepEqual(oeCounts, beowulf.allGpCounts);
const nativeSources = Object.entries(donorFiles)
  .map(([author, file]) => [author, encodeSourceNativeGP(read(file))]);
nativeSources.push(["beowulf_old_english", oeSource]);
for (const [author, encoded] of nativeSources) {
  const samples = [];
  for (let start = 0; start + ciphertext.length <= encoded.length;
       start += Math.max(1, Math.floor(ciphertext.length / 2))) {
    samples.push(parityCollision(encoded.slice(start, start + ciphertext.length)).ioc);
  }
  assert(samples.length >= 1, "native source must include at least one full original-length readout");
  const affinePageCohorts = [0, 1].map(parity => {
    const values = [];
    for (let start = 0; start + ciphertext.length <= encoded.length;
         start += Math.max(1, Math.floor(ciphertext.length / 2))) {
      values.push(affinePageCohortCollision(encoded.slice(start,
        start + ciphertext.length), parity).ioc);
    }
    return {groups: observedAffineCohorts[parity].groups,
      minimum: Math.min(...values), maximum: Math.max(...values),
      atOrBelowOriginal: values.filter(v => v <= observedAffineCohorts[parity].ioc).length};
  });
  const pageCohorts = [0, 1].map(parity => {
    const values = [];
    for (let start = 0; start + ciphertext.length <= encoded.length;
         start += Math.max(1, Math.floor(ciphertext.length / 2))) {
      values.push(pageCohortCollision(encoded.slice(start,
        start + ciphertext.length), parity).ioc);
    }
    return { pages: observedPageCohorts[parity].pages,
      minimum: Math.min(...values), maximum: Math.max(...values),
      atOrBelowOriginal: values.filter(v => v <= observedPageCohorts[parity].ioc).length };
  });
  assert(pageCohorts.every(c => c.atOrBelowOriginal === 0),
    author + ": native source should be strongly distinguishable from original root family");
  assert(affinePageCohorts.every(c => c.atOrBelowOriginal === 0),
    author + ": affine field page parity native source distinction");
  nativeBaseline[author] = {
    affinePageCohorts,
    pageCohorts,
    sourceRunes: encoded.length, windows: samples.length,
    minimum: Math.min(...samples),
    median: samples.slice().sort((a, b) => a - b)[Math.floor(samples.length / 2)],
    maximum: Math.max(...samples),
    atOrBelowOriginal: samples.filter(x => x <= observedParity.ioc).length
  };
}

const results = [];
for (const sign of [1, -1]) {
  const received = apply(ciphertext, sign, true);
  const exact = apply(received, sign, false);
  assert.deepEqual(exact, ciphertext);
  // Generator p0 = 1: the entire original p0 is untouched, an exact
  // failure to decipher p0 with the unselected but natural zero-origin rule.
  assert.deepEqual(physicalRange(received, 0, 0), physicalRange(ciphertext, 0, 0));
  let parityInvariants = 0;
  for (const p of rawPages) {
    if (!pagePairs.has(p.page)) continue;
    const first = byPairParityIoC(ciphertext, p.page);
    const second = byPairParityIoC(received, p.page);
    // The monomial matrix swaps rune parity for every odd physical page.
    const expected = p.page % 2 ? [...first].reverse() : first;
    for (let j = 0; j < 2; j++) {
      if (expected[j] !== null) {
        assert.ok(Math.abs(expected[j] - second[j]) < 1e-15);
        parityInvariants++;
      }
    }
  }
  const recoveredStrata = parityCollision(received);
  assert.deepEqual(recoveredStrata, observedParity);
  // For the natural page-number origin, all even physical pages are
  // pure scalar field multiplications, regardless of hidden basis.
  assert.deepEqual(pageCohortCollision(received, 0),
    observedPageCohorts[0]);
  results.push({rootSign:sign,book: {runes: received.length, ioc:ioc(received)},
    regions:region(received),p0Unchanged:true,exactForwardReplay:true,
    originalParityIoCPreserved:parityInvariants});
}
// Source-native p57 controls with 95 genuine runes, repeated or trimmed
// to match original 12,956-symbol register exactly.
const parable = data.pages.find(p => p.page === 57).indices;
assert.equal(parable.length, 95);
const plant = Array.from({length:ciphertext.length},(_,i)=>parable[i % parable.length]);
for (const sign of [1, -1]) {
  const encoded = apply(plant, sign, false);
  const recovered = apply(encoded, sign, true);
  assert.deepEqual(recovered, plant);
}
console.log(JSON.stringify({
  source:"p7 original red products [11,26,8,15,2], residual x^2-8",
  result:"monomial 56-period GF29^2 generator is page-parity scaling/permutation",
  naturalClock:"GF29[X]/(X^2-8) as two global successive runes; X^(page number)",
  original:region(ciphertext),
  originalPageParityCipherCollision:observedParity,
  originalEvenOddPageCohorts:observedPageCohorts,
  originalAffineEvenOddPageCohorts:observedAffineCohorts,
  independentLanguagePageParityControls:nativeBaseline,
  rootCandidates:results,
  independentNativePositive:"true solved p57 corpus planted and reencrypted/decrypted exactly"
}, null, 2));
console.log("PASS: source GF29^2 root56, exact all-phase/basis affine page-parity invariants, native corpus controls, complete source inverse.");
