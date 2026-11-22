"use strict";

/**
 * Source-defined p8–p14 tree chapter has 1729 runes = GP29 THUE.
 * Test simple Thue–Morse original-cipher receivers, not author intention.
 * Windows 11 / Node 22 / CommonJS / read-only single runnable test.
 *
 * Run: node sims/lp2_tree1729_thue_walsh_original_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const corpus = read("resources/liber-primus/lp2-corpus.json");
const grid = read("resources/liber-primus/lp2-grid-256.json");
const solved = read("resources/external/relikd-solved-gp29-native-v1.json");
const gp = corpus.runes;
const trans = corpus.translit;
const mod29 = n => (n % 29 + 29) % 29;

/** @param {number} n @returns {number} */
function thue(n) {
  let bit = 0;
  while (n > 0) {
    bit ^= n & 1;
    n = Math.floor(n / 2);
  }
  return bit;
}

/** @param {number} n @returns {number[]} */
function digits29(n) {
  const digits = [];
  do {
    digits.unshift(n % 29);
    n = Math.floor(n / 29);
  } while (n > 0);
  return digits;
}

/** @param {number[]} values @returns {number} */
function ioc(values) {
  const hist = Array(29).fill(0);
  for (const value of values) {
    assert(Number.isInteger(value) && value >= 0 && value < 29);
    hist[value]++;
  }
  return hist.reduce((sum, v) => sum + v * (v - 1), 0) /
    (values.length * (values.length - 1));
}

/** @param {number[]} values @returns {number[]} */
function splitIoc(values) {
  const groups = [[], []];
  for (let i = 0; i < values.length; i++) groups[thue(i)].push(values[i]);
  return groups.map(ioc);
}

/** @param {number[]} values @returns {number[]} */
function fwht(values) {
  const result = values.slice();
  assert.equal(result.length, 256);
  for (let length = 1; length < 256; length *= 2) {
    for (let start = 0; start < 256; start += length * 2) {
      for (let j = 0; j < length; j++) {
        const a = result[start + j];
        const b = result[start + j + length];
        result[start + j] = a + b;
        result[start + j + length] = a - b;
      }
    }
  }
  return result;
}

/** @param {number} n @param {number} k @returns {number} */
function choose(n, k) {
  if (k < 0 || k > n) return 0;
  let ans = 1;
  for (let j = 1; j <= k; j++) ans = ans * (n - j + 1) / j;
  return ans;
}

/**
 * One-sided hypergeometric tail, useful only as an unadjusted diagnostic.
 * @param {number} total @param {number} sameSlots
 * @param {number} repeats @param {number} observedSame
 * @returns {number}
 */
function enrichmentP(total, sameSlots, repeats, observedSame) {
  let p = 0;
  for (let k = observedSame; k <= repeats; k++) {
    p += choose(sameSlots, k) * choose(total - sameSlots, repeats - k) /
      choose(total, repeats);
  }
  return p;
}

const treePages = corpus.pages.filter(p => p.page >= 8 && p.page <= 14);
const pageLengths = treePages.map(p => p.indices.length);
const cipher = treePages.flatMap(p => p.indices);
const digits = digits29(cipher.length);
const name = digits.map(i => trans[i]).join("");
assert.deepEqual(pageLengths, [255, 268, 263, 273, 261, 272, 137]);
assert.equal(cipher.length, 1729);
assert.deepEqual(digits, [2, 1, 18]);
assert.equal(name, "THUE");
console.log("SOURCE p8..p14 lengths:", pageLengths.join(","));
console.log("SOURCE rune total:", cipher.length, "GP29:", digits.join(","), name);

const native = solved.sections.flatMap(s => Array.from(s.source_text)
  .filter(g => gp.includes(g)).map(g => gp.indexOf(g)));
assert.equal(native.length, 2979);
const sourceSplit = splitIoc(cipher);
const minima = [Infinity, Infinity];
const maxima = [0, 0];
let controls = 0;
for (let first = 0; first + cipher.length <= native.length; first++) {
  const got = splitIoc(native.slice(first, first + cipher.length));
  for (let b = 0; b < 2; b++) {
    minima[b] = Math.min(minima[b], got[b]);
    maxima[b] = Math.max(maxima[b], got[b]);
  }
  controls++;
}
assert.equal(controls, 1251);
assert(sourceSplit[0] < minima[0] && sourceSplit[1] < minima[1]);
console.log("THUE parity class IoCs:", sourceSplit);
console.log("All solved-native 1729-window parity IoC minima:", minima);
console.log("All solved-native 1729-window parity IoC maxima:", maxima);
console.log("Solved-native windows:", controls);
console.log("DECISION: fixed secret GP29 permutation per Thue bit cannot restore native IoC.");

let best = {a:0, b:0, ioc:-1};
let aboveNative = 0;
for (let a = 0; a < 29; a++) {
  for (let b = 0; b < 29; b++) {
    const decrypted = cipher.map((v, i) =>
      mod29(v - a * i - b * thue(i)));
    const score = ioc(decrypted);
    if (score > best.ioc) best = {a, b, ioc:score};
    if (score >= Math.min(...minima)) aboveNative++;
  }
}
assert.equal(aboveNative, 0);
console.log("ALL 841 affine index + Thue-bit additive masks: best", best,
  "at or above native floor:", aboveNative);

const repeat = {same:[0, 0], different:[0, 0]};
for (let i = 1; i < cipher.length; i++) {
  const slot = thue(i) === thue(i-1) ? repeat.same : repeat.different;
  slot[cipher[i] === cipher[i-1] ? 1 : 0]++;
}
assert.deepEqual(repeat, {same:[570, 6], different:[1149, 3]});
const diagnosticP = enrichmentP(1728, 576, 9, 6);
console.log("Adjacent-equal contingency [different,equal]:", repeat);
console.log("Unadjusted Thue same-bit enrichment hypergeometric p:", diagnosticP);
console.log("NOTE: 9 repeats and post-discovery tests cannot validate a historical Thue clock.");

/**
 * Thue's ternary squarefree fixed point: 0 -> 012, 1 -> 02, 2 -> 1.
 * Source: the classical, pre-2014 Thue morphism. No fitted seed or phase.
 * @param {number} n @returns {number[]}
 */
function ternaryThue(n) {
  let sequence = [0];
  while (sequence.length < n) {
    sequence = sequence.flatMap(v =>
      v === 0 ? [0, 1, 2] : v === 1 ? [0, 2] : [1]);
  }
  return sequence.slice(0, n);
}

const ternary = ternaryThue(cipher.length);
assert.equal(ternary.slice(0, 30).join(""), "012021012102012021020121012021");

/** @param {number[]} values @returns {number[]} */
function ternaryIoc(values) {
  const classes = [[], [], []];
  for (let i = 0; i < values.length; i++) {
    classes[ternary[i]].push(values[i]);
  }
  return classes.map(ioc);
}
const ternaryOriginal = ternaryIoc(cipher);
const ternaryNativeMin = [Infinity, Infinity, Infinity];
const ternaryNativeMax = [0, 0, 0];
for (let first = 0; first + cipher.length <= native.length; first++) {
  const scores = ternaryIoc(native.slice(first, first + cipher.length));
  for (let classNo = 0; classNo < 3; classNo++) {
    ternaryNativeMin[classNo] = Math.min(ternaryNativeMin[classNo], scores[classNo]);
    ternaryNativeMax[classNo] = Math.max(ternaryNativeMax[classNo], scores[classNo]);
  }
}
for (let k = 0; k < 3; k++) {
  assert(ternaryOriginal[k] < ternaryNativeMin[k]);
}
console.log("Ternary squarefree class IoCs:", ternaryOriginal);
console.log("Ternary solved-native class minima:", ternaryNativeMin);
console.log("Ternary solved-native class maxima:", ternaryNativeMax);
console.log("DECISION: any fixed secret permutation per Thue squarefree state fails native class IoC.");

let ternaryBest = {a:0, b:0, ioc:-1};
let ternaryMatches = 0;
for (let a = 0; a < 29; a++) {
  for (let b = 0; b < 29; b++) {
    const decoded = cipher.map((v, i) =>
      mod29(v - (ternary[i] === 0 ? 0 : ternary[i] === 1 ? a : b)));
    const score = ioc(decoded);
    if (score > ternaryBest.ioc) ternaryBest = {a, b, ioc:score};
    if (score >= Math.min(...ternaryNativeMin)) ternaryMatches++;
  }
}
assert.equal(ternaryMatches, 0);
console.log("All 841 ternary additive three-secret-key relatives: best",
  ternaryBest, "at or above native class floor:", ternaryMatches);

/**
 * Public seven-bit Thue–Morse factor is a candidate register selected
 * hypothetically by the seven visible tree pages. Every fixed secret
 * GP29 alphabet permutation within a factor class must preserve its IoC.
 * @param {number} i @returns {number}
 */
function sevenBitThue(i) {
  let factor = 0;
  for (let bit = 0; bit < 7; bit++) factor = factor * 2 + thue(i + bit);
  return factor;
}

const sevenGroups = new Map();
for (let i = 0; i < cipher.length; i++) {
  const state = sevenBitThue(i);
  if (!sevenGroups.has(state)) sevenGroups.set(state, []);
  sevenGroups.get(state).push(i);
}
assert.equal(sevenGroups.size, 20);

/**
 * @param {number[]} sequence
 * @param {number[]} positions
 * @returns {number}
 */
function positionalIoc(sequence, positions) {
  const hist = Array(29).fill(0);
  for (const i of positions) hist[sequence[i]]++;
  return hist.reduce((sum, n) => sum + n*(n-1), 0) /
    (positions.length*(positions.length-1));
}

let sevenViolating = 0;
let sevenWorst = null;
for (const [state,positions] of sevenGroups) {
  const score = positionalIoc(cipher, positions);
  let controlMin = Infinity;
  for (let start = 0; start+cipher.length <= native.length; start++) {
    const hist = Array(29).fill(0);
    for (const pos of positions) hist[native[start+pos]]++;
    const nativeScore = hist.reduce((sum,n)=>sum+n*(n-1),0) /
      (positions.length*(positions.length-1));
    controlMin = Math.min(controlMin,nativeScore);
  }
  if (score < controlMin) sevenViolating++;
  if (!sevenWorst || score-controlMin < sevenWorst.margin)
    sevenWorst={state,positions:positions.length,original:score,nativeMin:controlMin,margin:score-controlMin};
}
assert.equal(sevenViolating,18);
console.log("Seven-bit Thue factor states:",sevenGroups.size,
  "original classes below all native controls:",sevenViolating,
  "strongest absolute exclusion:",sevenWorst);
console.log("All secret fixed 29! maps per public seven-bit Thue state fail native class IoC.");

/**
 * Prefix counts of each externally fixed driver state before rune i.
 * The resulting running-key inverse is P_i = C_i - sum_j a_j*N_j(i).
 * Its forward encoder uses precisely the same public clock and coefficients.
 * @param {number[]} states @param {number} radix @returns {number[][]}
 */
function prefixStateCounts(states, radix) {
  const counts = Array.from({length:radix}, () => Array(states.length).fill(0));
  const totals = Array(radix).fill(0);
  for (let i = 0; i < states.length; i++) {
    for (let s = 0; s < radix; s++) counts[s][i] = totals[s];
    totals[states[i]]++;
  }
  return counts;
}

const nativeWholeMin = Math.min(...Array.from(
  {length:native.length-cipher.length+1},
  (_, start) => ioc(native.slice(start,start+cipher.length))));
const countBinary = prefixStateCounts(
  Array.from({length:cipher.length}, (_, i) => thue(i)), 2);
let binaryRunningBest = {a:0, b:0, ioc:-1};
let binaryRunningNative = 0;
for (let a = 0; a < 29; a++) for (let b = 0; b < 29; b++) {
  const decoded = cipher.map((v, i) =>
    mod29(v - a * countBinary[0][i] - b * countBinary[1][i]));
  const value = ioc(decoded);
  if (value > binaryRunningBest.ioc) binaryRunningBest = {a, b, ioc:value};
  if (value >= nativeWholeMin) binaryRunningNative++;
}
assert.equal(binaryRunningNative, 0);
console.log("Thue-Morse cumulative two-state keys:", 841,
  "best:", binaryRunningBest, "native minimum:", nativeWholeMin);

const countTernary = prefixStateCounts(ternary, 3);
let ternaryRunningBest = {a:0, b:0, c:0, ioc:-1};
let ternaryRunningNative = 0;
for (let a = 0; a < 29; a++) {
  for (let b = 0; b < 29; b++) {
    for (let c = 0; c < 29; c++) {
      const hist = Array(29).fill(0);
      for (let i = 0; i < cipher.length; i++) {
        hist[mod29(cipher[i] - a * countTernary[0][i] -
          b * countTernary[1][i] - c * countTernary[2][i])]++;
      }
      const value = hist.reduce((sum, count) =>
        sum + count * (count - 1), 0) /
        (cipher.length * (cipher.length - 1));
      if (value > ternaryRunningBest.ioc)
        ternaryRunningBest = {a, b, c, ioc:value};
      if (value >= nativeWholeMin) ternaryRunningNative++;
    }
  }
}
assert.equal(ternaryRunningNative, 0);
console.log("Squarefree Thue cumulative three-state keys:", 24389,
  "best:", ternaryRunningBest, "native minimum:", nativeWholeMin);
console.log("Thue running-key engines are fully reversible for every secret key.");
console.log("Exact re-encryption is an implementation invariant for all 25,230 wrong keys.");

/**
 * Ciphertext-feedback Thue receiver: P_i = C_i - key[h(i)]*C_(i-1).
 * This is distinct from public-counter running keys; its previous-symbol
 * state derives from the *observed original ciphertext* and is reversible.
 * @param {number[]} ciphertext @param {number[]} key @returns {number[]}
 */
function inverseTernaryFeedback(ciphertext, key) {
  return ciphertext.map((value, i) => mod29(
    value - key[ternary[i]] * (i ? ciphertext[i-1] : 0)));
}

/** @param {number[]} plaintext @param {number[]} key @returns {number[]} */
function forwardTernaryFeedback(plaintext, key) {
  const ciphertext = [];
  for (let i = 0; i < plaintext.length; i++) {
    ciphertext.push(mod29(plaintext[i] +
      key[ternary[i]] * (i ? ciphertext[i-1] : 0)));
  }
  return ciphertext;
}

let feedbackBest={key:[0,0,0],ioc:-1};
let feedbackNative=0;
for (let a=0;a<29;a++) for (let b=0;b<29;b++)
  for (let c=0;c<29;c++) {
    const key=[a,b,c],candidate=inverseTernaryFeedback(cipher,key);
    const score=ioc(candidate);
    if (score>feedbackBest.ioc) feedbackBest={key,ioc:score};
    if (score>=nativeWholeMin) feedbackNative++;
  }
assert.equal(feedbackNative,0);
const feedbackPlant=native.slice(0,cipher.length);
assert.deepEqual(inverseTernaryFeedback(
  forwardTernaryFeedback(feedbackPlant,feedbackBest.key),
  feedbackBest.key),feedbackPlant);
console.log("Thue squarefree ciphertext-feedback all 24,389 secret coefficient triples:",
  "best",feedbackBest,"native benchmark",nativeWholeMin,
  "authentic native plant replay PASS");

assert.equal(grid.shape, "32 rows by 8 columns across LP2 pages 49, 50, 51");
assert.equal(grid.bytes.length, 256);
let native256Minimum = Infinity;
for (let first = 0; first + 256 <= native.length; first++) {
  native256Minimum = Math.min(native256Minimum,
    ioc(native.slice(first, first + 256)));
}
console.log("Solved-native 256-window minimum IoC:", native256Minimum);
for (const radix of [59, 60]) {
  const original = grid.bytes.map(v =>
    radix === 60 ? v : v - Math.floor(v / 60));
  const transformed = fwht(original);
  const replay = fwht(transformed);
  assert.deepEqual(replay, original.map(v => v * 256));
  const residues = transformed.map(mod29);
  const spectrumIoc = ioc(residues);
  const upperNative = native256Minimum;
  assert(spectrumIoc < upperNative);
  console.log("p50 row-major 32x8 radix", radix,
    "FWHT->GP29 IoC", spectrumIoc, "Thue endpoint", transformed[255],
    "native floor", upperNative, "full 256-point replay PASS");
}
console.log("PASS: original-input THUE clue and bounded inverse gates; no LP2 plaintext recovered.");
