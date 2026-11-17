"use strict";

/**
 * Original LP2 pp8-14: sharp all-secret bijective phase-key frequency ceilings.
 *
 * SFT: node sims/lp2_p7_dot7_allsecret_bijection_ceiling_sft.cjs
 * Windows / Node.js 22, read-only, standard library only.
 *
 * Independently arbitrary GP29 alphabet permutations are allowed at each
 * key phase. This proves a frequency ceiling for an exact finite cipher
 * family. It does not recover plaintext, a key, or a historical operation.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const root = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages = read("resources/liber-primus/lp2-transcription.txt").split(/\r?\n%\r?\n/);
const runeOrdinal = new Map(gp.runes.map((r, i) => [r, i]));
assert.equal(gp.runes.length, 29);
assert.equal(pages.length, 57);
const image = fs.readFileSync(path.join(root, "resources/liber-primus/24.jpg"));
assert.equal(crypto.createHash("sha256").update(image).digest("hex"),
  "91a726a7dd59c6caa4d736b9ce72ceba0a2fa827d6b69a2d4057562b9303636c");

/** @typedef {{rune:string,page:number,local:number}} Item */
/** @type {Item[]} */
const original = [];
for (let p = 8; p <= 14; p++) {
  let local = 0;
  const actualRunes = [];
  for (const ch of pages[p]) {
    if (!runeOrdinal.has(ch) && ch !== "7") continue;
    if (ch !== "7") actualRunes.push(runeOrdinal.get(ch));
    original.push({rune: ch, page: p, local: local++});
  }
  assert.deepEqual(actualRunes, gp.pages[p].indices,
    "original printed page and canonical GP corpus must agree");
}
assert.equal(original.length, 1730);
assert.equal(original.filter(x => x.rune === "7").length, 1);
assert.equal(original.findIndex(x => x.rune === "7"), 692);

// Five black circles, original p7 image, sorted by horizontal coordinate.
// The top-to-bottom x-index permutation is derived only from source geometry.
const dotY = [3105.73973, 3166.68765, 2866.70402, 3127.5, 2936.20488];
const dotOrder = [0, 1, 2, 3, 4].sort((a, b) => dotY[a] - dotY[b]);
assert.deepEqual(dotOrder, [2, 4, 0, 3, 1]);
/** @type {Item[]} */
const wrapped = [];
for (let row = 0; row < 346; row++)
  for (const col of dotOrder) wrapped.push(original[col * 346 + row]);
assert.equal(wrapped[0].rune, "7");
const dot5 = wrapped.slice(1);
const unchanged = original.filter(x => x.rune !== "7");
assert.equal(dot5.length, 1729);

/** @param {Item[]} input @param {number[]} permutation @returns {Item[]} */
function sevenTuple(input, permutation) {
  assert.equal(input.length % 7, 0);
  /** @type {Item[]} */
  const output = [];
  for (let i = 0; i < input.length; i += 7)
    for (const j of permutation) output.push(input[i + j]);
  return output;
}
/** @param {Item[]} input @param {"down"|"across"} mode @returns {Item[]} */
function sevenColumn(input, mode) {
  assert.equal(input.length % 7, 0);
  const height = input.length / 7;
  /** @type {Item[]} */
  const output = [];
  if (mode === "down")
    for (let col = 0; col < 7; col++)
      for (let row = 0; row < height; row++)
        output.push(input[row * 7 + col]);
  else
    for (let row = 0; row < height; row++)
      for (let col = 0; col < 7; col++)
        output.push(input[col * height + row]);
  return output;
}
const variants = [
  ["original", unchanged],
  ["dot5", dot5],
  ["tuple7", sevenTuple(dot5, [0, 6, 2, 5, 1, 4, 3])],
  ["inverse7", sevenTuple(dot5, [0, 4, 2, 6, 5, 3, 1])],
  ["column7Down", sevenColumn(dot5, "down")],
  ["column7Across", sevenColumn(dot5, "across")]
];
const originalMultiset = Array(29).fill(0);
for (const item of unchanged) originalMultiset[runeOrdinal.get(item.rune)]++;
for (const [name, items] of variants) {
  assert.equal(items.length, 1729, name);
  const multiset = Array(29).fill(0);
  for (const item of items) multiset[runeOrdinal.get(item.rune)]++;
  assert.deepEqual(multiset, originalMultiset, name + " must preserve all source runes");
}
const denominator = 1729 * 1728;
const originalNumerator = originalMultiset.reduce((sum, n) => sum + n * (n - 1), 0);
assert.equal(originalNumerator, 102958);

/**
 * All-secret sharp upper bound. For every independent phase, allow one
 * arbitrary secret bijection of all 29 runes. Sort each phase histogram by
 * descending count, then align corresponding ranks across phases.
 * Rearrangement inequality makes this optimal for total equal-symbol pairs.
 *
 * @param {Item[]} input
 * @param {(item:Item,index:number)=>number} phase
 * @returns {{classes:number,numerator:number}}
 */
function allSecretCeiling(input, phase) {
  /** @type {Map<number,number[]>} */
  const rows = new Map();
  input.forEach((item, i) => {
    const key = phase(item, i);
    let row = rows.get(key);
    if (!row) { row = Array(29).fill(0); rows.set(key, row); }
    row[runeOrdinal.get(item.rune)]++;
  });
  const sorted = [...rows.values()].map(row => row.sort((a, b) => b - a));
  const strongest = Array.from({length: 29}, (_, j) =>
    sorted.reduce((total, row) => total + row[j], 0));
  assert.equal(strongest.reduce((a, b) => a + b, 0), input.length);
  const numerator = strongest.reduce((total, n) => total + n * (n - 1), 0);
  return {classes: rows.size, numerator};
}
const expectedPeriod = [
  [108826, 112724, 123156, 125566, 153832],
  [108566, 111490, 122290, 126332, 152110],
  [109250, 111490, 122290, 126656, 152110],
  [108588, 111490, 122290, 124900, 152110],
  [109644, 113174, 126216, 126332, 157544],
  [108028, 111034, 123358, 126332, 148484]
];
const expectedPagePhase = [
  [151970, 172004],
  [115516, 171188],
  [133124, 171188],
  [134670, 171188],
  [147990, 167804],
  [143792, 152916]
];
const comparison = variants.map(([name, items], i) => {
  const periods = [5, 7, 14, 16, 35].map(period =>
    allSecretCeiling(items, (_, position) => position % period));
  const pageReset = [5, 7].map(period =>
    allSecretCeiling(items, (item, position) => (item.page - 8) * period + position % period));
  assert.deepEqual(periods.map(s => s.numerator), expectedPeriod[i], name);
  assert.deepEqual(pageReset.map(s => s.numerator), expectedPagePhase[i], name);
  return {name, period: Object.fromEntries([5, 7, 14, 16, 35].map((k, j) =>
    [String(k), {numerator:periods[j].numerator, maxIoC:periods[j].numerator / denominator}])),
    pageReset: Object.fromEntries([5, 7].map((k, j) =>
      [String(k), {classes:pageReset[j].classes,
        numerator:pageReset[j].numerator, maxIoC:pageReset[j].numerator / denominator}]))};
});
const strongest14 = Math.max(...comparison.map(x => x.period["14"].numerator));
const strongest16 = Math.max(...comparison.map(x => x.period["16"].numerator));
assert.equal(strongest14, 126216);
assert.equal(strongest16, 126656);
const strongest35 = Math.max(...comparison.map(x => x.period["35"].numerator));
assert.equal(strongest35, 157544);
const strongestPage7 = Math.max(...comparison.map(x => x.pageReset["7"].numerator));
assert.equal(strongestPage7, 172004);

// A complete finite lower bound for any continuous, static-period alphabet
// cipher, not just source-hinted key lengths. Every period 1..38 fails the
// least concentrated native-English control window on all six source orders.
const sourceKeyPeriodCapacity = [];
for (let period = 1; period <= 39; period++) {
  const candidates = variants.map(([name, items]) =>
    ({name, numerator:allSecretCeiling(items, (_, i) => i % period).numerator}));
  candidates.sort((a, b) => b.numerator - a.numerator);
  sourceKeyPeriodCapacity.push({period, highestNumerator:candidates[0].numerator,
    strongestOrdering:candidates[0].name});
}
const strongestPeriod1to38 = Math.max(...sourceKeyPeriodCapacity.slice(0, 38)
  .map(x => x.highestNumerator));
assert.equal(strongestPeriod1to38, 163128);
assert.deepEqual(sourceKeyPeriodCapacity[38],
  {period:39, highestNumerator:164632, strongestOrdering:"dot5"});

// Independent source-native prose controls, using the already established
// ING/IO grapheme rules. This same encoding yields exactly 3510 LP1 runes.
const tokens = gp.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);
/** @param {string} original @returns {number[]} */
function encodeNativeGP(original) {
  const clean = original.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  /** @type {number[]} */
  const output = [];
  for (const word of clean.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      if (word.startsWith("ING", i)) { output.push(21); i += 3; }
      else if (word.startsWith("IO", i)) { output.push(27); i += 2; }
      else {
        const token = tokens.find(t => word.startsWith(t.s, i));
        assert(token, "Unmapped native-GP English token");
        output.push(token.i);
        i += token.s.length;
      }
    }
  }
  return output;
}
/**
 * Exact single-pass rolling collision numerator for all length-1729 windows.
 * A window's index of coincidence is numerator / 2,987,712.
 *
 * @param {number[]} stream
 * @returns {{windows:number,minNumerator:number,minOffset:number,belowPeriod35:number,belowPage7:number}}
 */
function rollingCollision(stream) {
  const length = 1729;
  assert(stream.length >= length);
  const freq = Array(29).fill(0);
  for (let i = 0; i < length; i++) freq[stream[i]]++;
  let numerator = freq.reduce((sum, n) => sum + n * (n - 1), 0);
  let minNumerator = numerator;
  let minOffset = 0;
  let belowPeriod35 = Number(numerator <= strongest35);
  let belowPeriod38 = Number(numerator <= strongestPeriod1to38);
  let belowPage7 = Number(numerator <= strongestPage7);
  for (let index = length; index < stream.length; index++) {
    const departing = stream[index - length];
    const arriving = stream[index];
    numerator -= 2 * (freq[departing] - 1);
    freq[departing]--;
    numerator += 2 * freq[arriving];
    freq[arriving]++;
    if (numerator < minNumerator) {
      minNumerator = numerator;
      minOffset = index - length + 1;
    }
    belowPeriod35 += Number(numerator <= strongest35);
    belowPeriod38 += Number(numerator <= strongestPeriod1to38);
    belowPage7 += Number(numerator <= strongestPage7);
  }
  return {windows: stream.length - length + 1, minNumerator, minOffset,
    belowPeriod35, belowPeriod38, belowPage7};
}
const controls = [
  ["solvedLP1", "resources/liber-primus/lp1-plaintext-reference.txt", 3510, 1782, 178186, 385, 0],
  ["Shakespeare", "resources/control/shakespeare_first300k.txt", 217106, 215378, 164130, 137976, 22852],
  ["Gibran", "resources/control/gibran_prophet_58585.txt", 62492, 60764, 171684, 47450, 55],
  ["Emerson", "resources/control/emerson_essays_2944.txt", 321327, 319599, 172456, 90903, 0]
];
const controlResults = controls.map(([name, file, expectedLength, windows, minimum, offset, belowPage7]) => {
  const raw = read(file);
  const cleaned = name === "solvedLP1" ? raw.replace(/^#.*$/gm, "") : raw;
  const encoded = encodeNativeGP(cleaned);
  assert.equal(encoded.length, expectedLength, name + " GP rune count");
  const result = rollingCollision(encoded);
  assert.equal(result.windows, windows, name);
  assert.equal(result.minNumerator, minimum, name);
  assert.equal(result.minOffset, offset, name);
  assert.equal(result.belowPeriod35, 0, name + " cannot fall under source period-35 ceiling");
  assert.equal(result.belowPeriod38, 0, name + " cannot fall under period-38 ceiling");
  assert.equal(result.belowPage7, belowPage7, name + " page×7 sensitivity");
  return {name, sourceRunes:encoded.length, ...result,
    minimumIoC:result.minNumerator / denominator};
});
assert.equal(controlResults.reduce((sum, x) => sum + x.windows, 0), 597523);
assert(controlResults.every(x => x.minNumerator > strongestPeriod1to38));

// Independent language-register sensitivity. These are original-source
// *preencoded* GP29 witnesses, already archived with their own provenance,
// not English words reinterpreted under the English-native grapheme rules.
const oldEnglishProfile = JSON.parse(read("resources/control/beowulf_oe_gp_profile_corrected.json"));
const alphabet29 = oldEnglishProfile.positiveControlAlphabet;
assert.equal(alphabet29.length, 29);
assert.equal(oldEnglishProfile.allSourceGpRunes, 48012);
const oldEnglish = Array.from(oldEnglishProfile.sourceGpBase29,
  letter => alphabet29.indexOf(letter));
assert.equal(oldEnglish.length, 48012);
assert(oldEnglish.every(x => x >= 0 && x < 29));
const latinSource = JSON.parse(read("resources/control/latin-vulgate-heldout-gp.json"));
assert.equal(latinSource.runes.length, 2400);
assert(latinSource.runes.every(x => Number.isInteger(x) && x >= 0 && x < 29));
const nonEnglish = [
  ["source-normalized Beowulf Old English", oldEnglish, 46284, 157852, 38967, 2184],
  ["source-normalized Vulgate Latin", latinSource.runes, 672, 212584, 1, 0]
].map(([name, source, windows, minNumerator, minOffset, below38]) => {
  const result = rollingCollision(source);
  assert.equal(result.windows, windows, name);
  assert.equal(result.minNumerator, minNumerator, name);
  assert.equal(result.minOffset, minOffset, name);
  assert.equal(result.belowPeriod35, 0, name + " source period35");
  assert.equal(result.belowPeriod38, below38, name + " period38 sensitivity");
  return {name, sourceRunes:source.length, ...result,
    minimumIoC:result.minNumerator / denominator};
});
assert.equal(controlResults.reduce((n, x) => n + x.windows, 0)
  + nonEnglish.reduce((n, x) => n + x.windows, 0), 644479);

console.log(JSON.stringify({
  source: "original 24.jpg + pp8-14 original transcript, 1730 mixed symbols",
  dotOrder, digitBefore:692, digitAfter:0, sourceRunes:1729,
  sourceIoC:originalNumerator / denominator, denominator,
  period14WholeFamilyMaximumIoC:strongest14 / denominator,
  period16WholeFamilyMaximumIoC:strongest16 / denominator,
  period35WholeFamilyMaximumIoC:strongest35 / denominator,
  pageBy7WholeFamilyMaximumIoC:strongestPage7 / denominator,
  comparison, controls:controlResults, otherLanguageControls:nonEnglish,
  strongestPeriod1To38Numerator:strongestPeriod1to38,
  firstPotentialPeriod39:sourceKeyPeriodCapacity[38],
  conclusion: "Direct recurring periods 5/7/14/16/35 plus source-fixed 5-/7-column rearrangements cannot recover the independently observed native GP29-English unigram profile, even with every phase alphabet secret.",
  limitation: "Does not rule out changing internal state, non-bijective code, another register, or page-conditional 7-phase models matched by some independent English controls."
}, null, 2));
