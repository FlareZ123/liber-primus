"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");

const RUNES = /[\u16A0-\u16FF]/gu;
const REPO = path.resolve(__dirname, "..");

/** @param {string} text @returns {string[]} Canonical rune-word initials. */
function firstRunes(text) {
  return text.split(/[-.&§]/u).map(part => part.match(RUNES))
    .filter(Boolean).map(word => word[0]);
}

/** @param {number} seed @returns {() => number} Reproducible [0,1) source. */
function prng(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

/** @param {number[]} array @param {number} symbols @returns {number} */
function orderedCollisions(array, symbols = 29) {
  const count = new Uint16Array(symbols);
  for (const value of array) count[value]++;
  let total = 0;
  for (const n of count) total += n * (n - 1);
  return total;
}

/** @param {number[][]} groups @returns {{rate:number,numerator:number,denominator:number}} */
function collisionRate(groups) {
  let numerator = 0;
  let denominator = 0;
  for (const group of groups) {
    numerator += orderedCollisions(group);
    denominator += group.length * (group.length - 1);
  }
  return {rate: numerator / denominator, numerator, denominator};
}

/**
 * Word-start null with independent draws from a solved-text profile,
 * optionally mixed with uniform starts.
 * @param {number[][]} groups
 * @param {number[]} base
 * @param {number} epsilon
 * @param {number} trials
 * @param {() => number} random
 */
function concentrationNull(groups, base, epsilon, trials, random) {
  const cumulative = [];
  let cum = 0;
  for (const p of base) {
    cum += (1 - epsilon) * p + epsilon / base.length;
    cumulative.push(cum);
  }
  cumulative[cumulative.length - 1] = 1;
  const target = collisionRate(groups).rate;
  const denom = groups.reduce((s, g) => s + g.length * (g.length - 1), 0);
  let lower = 0;
  let mean = 0;
  let m2 = 0;
  let minimum = Infinity;
  for (let replicate = 0; replicate < trials; replicate++) {
    let hits = 0;
    for (const group of groups) {
      const count = new Uint16Array(base.length);
      for (let j = 0; j < group.length; j++) {
        const u = random();
        let symbol = 0;
        while (u > cumulative[symbol]) symbol++;
        count[symbol]++;
      }
      for (const n of count) hits += n * (n - 1);
    }
    const rate = hits / denom;
    if (rate <= target) lower++;
    if (rate < minimum) minimum = rate;
    const delta = rate - mean;
    mean += delta / (replicate + 1);
    m2 += delta * (rate - mean);
  }
  return {epsilon, trials, lowerTailCount:lower, pEstimate:(lower + 1) / (trials + 1),
    mean, sd:Math.sqrt(m2 / (trials - 1)), minimum};
}

/**
 * Equality hits at word lags 1..maxLag with exact fixed-margin null expectations.
 * @param {number[][]} groups
 * @param {number} maxLag
 */
function lagProfile(groups, maxLag) {
  const hit = new Float64Array(maxLag + 1);
  const N = new Float64Array(maxLag + 1);
  const expected = new Float64Array(maxLag + 1);
  for (const group of groups) {
    const size = group.length;
    if (size < 2) continue;
    const p = orderedCollisions(group) / (size * (size - 1));
    for (let lag = 1; lag <= Math.min(size - 1, maxLag); lag++) {
      const opportunities = size - lag;
      N[lag] += opportunities;
      expected[lag] += opportunities * p;
      for (let i = 0; i < opportunities; i++)
        if (group[i] === group[i + lag]) hit[lag]++;
    }
  }
  return {hit, N, expected};
}

/**
 * @param {{hit:Float64Array,N:Float64Array,expected:Float64Array}} profile
 * @param {number} lag
 */
function lagZ(profile, lag) {
  const e = profile.expected[lag];
  return e ? (profile.hit[lag] - e) /
    Math.sqrt(e * (1 - e / profile.N[lag])) : 0;
}

/** @param {number[][]} groups @param {() => number} random */
function shuffleGroups(groups, random) {
  return groups.map(group => {
    const a = group.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  });
}

/**
 * Controls familywise lag search using the same shuffle on each full group.
 * This null preserves each group's word-initial rune inventory.
 * @param {number[][]} groups
 * @param {number} maxLag
 * @param {number} trials
 * @param {number} seed
 */
function lagPermutationScan(groups, maxLag, trials, seed) {
  const observed = lagProfile(groups, maxLag);
  const z = Array.from({length:maxLag}, (_,i) => lagZ(observed, i + 1));
  const strongest = Math.max(...z);
  const strongestLag = z.indexOf(strongest) + 1;
  const wanted23 = z[22];
  const wanted46 = z[45];
  const random = prng(seed);
  let exceedMax = 0;
  let exceed23 = 0;
  let exceed46 = 0;
  let exceedHarmonic = 0;
  for (let t = 0; t < trials; t++) {
    const shuffled = lagProfile(shuffleGroups(groups, random), maxLag);
    let max = -Infinity;
    for (let lag = 1; lag <= maxLag; lag++) {
      const v = lagZ(shuffled, lag);
      if (v > max) max = v;
    }
    const z23 = lagZ(shuffled, 23);
    const z46 = lagZ(shuffled, 46);
    if (max >= strongest) exceedMax++;
    if (z23 >= wanted23) exceed23++;
    if (z46 >= wanted46) exceed46++;
    if (z23 + z46 >= wanted23 + wanted46) exceedHarmonic++;
  }
  return {
    maxLag, trials,
    top:{lag:strongestLag, z:strongest,
      observed:observed.hit[strongestLag], expected:observed.expected[strongestLag]},
    lag23:{observed:observed.hit[23], expected:observed.expected[23],
      opportunities:observed.N[23], z:wanted23, p:(exceed23 + 1)/(trials + 1)},
    lag46:{observed:observed.hit[46], expected:observed.expected[46],
      opportunities:observed.N[46], z:wanted46, p:(exceed46 + 1)/(trials + 1)},
    familywiseP:(exceedMax + 1)/(trials + 1),
    harmonic23_46P:(exceedHarmonic + 1)/(trials + 1)
  };
}

/**
 * Synthetic period-23 Caesar key on first letters, with 5% independent
 * replacement errors as a conservative proxy for downstream postprocessing.
 * @param {number[][]} pageGroups @param {number[]} ref
 */
function period23Plants(pageGroups, ref) {
  const random = prng(0x5590123);
  const observations = [];
  for (let trial = 0; trial < 100; trial++) {
    const key = Array.from({length:23}, () => Math.floor(random() * 29));
    const planted = pageGroups.map(group => group.map((unused, i) => {
      let symbol = (ref[Math.floor(random() * ref.length)] + key[i % 23]) % 29;
      if (random() < 0.05) symbol = Math.floor(random() * 29);
      return symbol;
    }));
    observations.push(lagZ(lagProfile(planted, 23), 23));
  }
  return {
    trials:observations.length, mean:observations.reduce((s,z) => s + z,0)/100,
    minimum:Math.min(...observations), maximum:Math.max(...observations),
    detectedZ3:observations.filter(z => z > 3).length,
    detectedZ4:observations.filter(z => z > 4).length
  };
}

/** Independent, on-demand reproducibility entry point. */
function main() {
  const master = fs.readFileSync(path.join(REPO, "resources",
    "transcriptions", "liber_primus_master.txt"), "utf8");
  const segments = master.slice(master.indexOf("\n\n") + 2).split("$");
  const known = [2,4,6,17].flatMap(k => firstRunes(segments[k]));
  const sections = segments.slice(7,16).map(firstRunes);
  const alphabet = [...new Set([...known, ...sections.flat()])].sort();
  const index = new Map(alphabet.map((r,i) => [r,i]));
  const ref = known.map(c => index.get(c));
  const sectionGroups = sections.map(group => group.map(c => index.get(c)));
  assert.equal(alphabet.length, 29);
  assert.equal(known.length, 250);
  assert.equal(sections.reduce((s,g) => s + g.length,0), 2896);
  assert.equal(segments.slice(7,16).join("").match(RUNES).length, 12956);
  assert.deepEqual(firstRunes("ᚠ/%\nᚩ-ᚢ"), ["ᚠ","ᚢ"]);

  const parsed = parseSharedCorpus();
  assert.equal(parsed.words.length, 2896);
  assert.equal(parsed.runeCount, 12956);
  assert.equal(parsed.crossPageWords, 32);
  const pageGroups = parsed.byStartPage.map(group =>
    group.map(word => index.get(word.runes[0])));
  assert.equal(pageGroups.length, 55);

  const observed = collisionRate(sectionGroups);
  const reversed = sectionGroups.map((g,section) =>
    g.map(x => (x + 7 * section) % 29));
  assert.equal(collisionRate(reversed).numerator, observed.numerator);
  const freq = Array(29).fill(0);
  for (const symbol of ref) freq[symbol]++;
  const base = freq.map(n => n / ref.length);
  const referenceIoC = orderedCollisions(ref) / (ref.length * (ref.length - 1));
  const random = prng(0x354ae11);
  const nulls = [0,0.5,0.75,1].map(e =>
    concentrationNull(sectionGroups, base, e, 5000, random));

  const output = {
    source:"resources/transcriptions/liber_primus_master.txt",
    sourceSegments:{plaintext:[2,4,6,17],unsolved:[7,8,9,10,11,12,13,14,15]},
    plaintextWordStarts:ref.length, lp2WordStarts:2896,
    perSection:sectionGroups.map((g,i) => ({
      segment:i+7, words:g.length,
      collisionRate:g.length>1 ? orderedCollisions(g)/(g.length*(g.length-1)) : null
    })),
    wordStartCollision:observed, uniformBaseline:1/29,
    plaintextReferenceCollisionRate:referenceIoC, nulls,
    periodicGlobal:lagPermutationScan(sectionGroups,120,1000,0x354ae11),
    periodicPageLocal:lagPermutationScan(pageGroups,50,2000,0x451711),
    period23Plants:period23Plants(pageGroups,ref)
  };
  process.stdout.write(JSON.stringify(output,null,2) + "\n");
}

if (require.main === module) main();
module.exports = {firstRunes, collisionRate, lagProfile, lagZ, period23Plants};
