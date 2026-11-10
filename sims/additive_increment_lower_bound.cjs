"use strict";
/**
 * Analytical collision-floor experiment for an additive mod-29
 * keystream with plaintext-independent increments.
 *
 * For C_t=P_t+K_t (mod29), collisions obey
 * C_t=C_(t-1) iff ΔP_t = -ΔK_t (mod29).
 * If the plaintext delta at a position has probability mass f and
 * ΔK is independent of that plaintext delta (even if increments
 * correlate across time), collision probability is >= min(f).
 *
 * The empirical reference f below comes from GP-encoded Shakespeare,
 * not from a proved LP2 plaintext. This is a conditional bound, and
 * it must never be stated as an unconditional exclusion of all
 * additive stream ciphers or all possible language registers.
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const ROOT = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources", "liber-primus", "lp2-corpus.json"), "utf8"
));
const literature = fs.readFileSync(
  path.join(ROOT, "resources", "control", "shakespeare_first300k.txt"), "utf8"
);
const master = fs.readFileSync(
  path.join(ROOT, "resources", "transcriptions", "liber_primus_master.txt"), "utf8"
);
const lp1 = fs.readFileSync(
  path.join(ROOT, "resources", "transcriptions", "lp1_wulfic_canonical.txt"), "utf8"
);

/** @param {string[]} input */
function latinWords(input) {
  const map = new Map(corpus.translit.map((x, i) => [x, i]));
  return input.map(part => {
    const w = part.replace(/QU/g, "CW").replace(/V/g, "U").replace(/K/g, "C").replace(/Z/g, "S");
    const values = [];
    for (let i = 0; i < w.length;) {
      const digraph = w.slice(i, i + 2);
      if (map.has(digraph)) { values.push(map.get(digraph)); i += 2; }
      else if (map.has(w[i])) { values.push(map.get(w[i])); i++; }
      else i++;
    }
    return values;
  }).filter(w => w.length > 0);
}

/** @param {string} source */
function runeWords(source) {
  const map = new Map(corpus.runes.map((x, i) => [x, i]));
  return source.split(/[-.&$§]/).map(piece =>
    [...piece].filter(x => map.has(x)).map(x => map.get(x))
  ).filter(x => x.length > 0);
}

/** @param {number[][]} words */
function differences(words) {
  const within = Array(29).fill(0), across = Array(29).fill(0);
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    for (let j = 1; j < w.length; j++) within[(w[j] - w[j - 1] + 29) % 29]++;
    if (i > 0) {
      const before = words[i - 1];
      across[(w[0] - before[before.length - 1] + 29) % 29]++;
    }
  }
  return { within, across };
}

/** @param {number[]} counts */
function summarize(counts) {
  const n = counts.reduce((s, x) => s + x, 0);
  let minimumShift = 0;
  for (let i = 1; i < 29; i++) if (counts[i] < counts[minimumShift]) minimumShift = i;
  return { n, minDelta: minimumShift, minCount: counts[minimumShift],
    minRate: counts[minimumShift] / n, doublets: counts[0], doubletRate: counts[0] / n };
}

/** @param {{within:number[],across:number[]}} result */
function describe(result) {
  const overall = result.within.map((x, i) => x + result.across[i]);
  return { within: summarize(result.within), across: summarize(result.across), overall: summarize(overall) };
}

function main() {
  const shakespeareSource = literature.toUpperCase().match(/[A-Z]+/g) || [];
  const englishWords = latinWords(shakespeareSource);
  const lp2 = master.slice(master.indexOf("ᛋᚻᛖᚩᚷᛗᛡᚠ"))
    .split("%").slice(0, 56).join("%");
  const lp2Words = runeWords(lp2);
  assert.equal(lp2Words.length, 2896);
  assert.equal(lp2Words.reduce((n, w) => n + w.length, 0), 12956);
  const plainSegments = lp1.split("$");
  const knownPlainLp1 = runeWords([2, 4, 6].map(i => plainSegments[i]).join("$"));

  const eng = differences(englishWords);
  const cipher = differences(lp2Words);
  const controlLp1 = differences(knownPlainLp1);
  const engStats = describe(eng);
  const cipherStats = describe(cipher);
  assert.equal(cipherStats.within.n, 10060);
  assert.equal(cipherStats.across.n, 2895);
  assert.equal(cipherStats.overall.doublets, 86);

  // Direct algebra check. For a deterministic linear counter K_t=d*t,
  // the additive-cipher collision count *exactly* equals the reference
  // plaintext-difference count at -d, with no independence required.
  const linearCounterCheck = [];
  for (let d = 0; d < 29; d++) {
    let collisions = 0;
    const flat = englishWords.flat();
    for (let i = 1; i < flat.length; i++) {
      if ((flat[i] + d * i) % 29 === (flat[i - 1] + d * (i - 1)) % 29) collisions++;
    }
    const shifted = eng.within.map((v, i) => v + eng.across[i]);
    assert.equal(collisions, shifted[(29 - d) % 29]);
    linearCounterCheck.push(collisions);
  }
  const n = cipherStats.overall.n;
  const p = engStats.overall.minRate;
  const expectedFloor = n * p;
  const boundaryAwareFloor = cipherStats.within.n * engStats.within.minRate +
    cipherStats.across.n * engStats.across.minRate;

  const chunkSize = Math.floor(shakespeareSource.length / 4);
  const chunks = Array.from({ length: 4 }, (_, i) => {
    const words = latinWords(shakespeareSource.slice(i * chunkSize,
      i === 3 ? shakespeareSource.length : (i + 1) * chunkSize));
    return describe(differences(words));
  });

  console.log(JSON.stringify({
    hypothesis: "stationary GP-English plaintext deltas independent of additive key increments",
    sourceEnglishRunes: englishWords.reduce((n, w) => n + w.length, 0),
    englishReference: engStats,
    englishQuarterMinRates: chunks.map(v => ({
      within: v.within.minRate, across: v.across.minRate, overall: v.overall.minRate
    })),
    solvedLp1DirectPlainReference: describe(controlLp1),
    realLP2Cipher: cipherStats,
    floorUnderSingleStationaryEnglishDeltaDistribution: expectedFloor,
    floorAllowingDifferentKeyIncrementPoliciesAtWordBoundaries: boundaryAwareFloor,
    observedLP2Doublets: cipherStats.overall.doublets,
    verifiedExactCounterCollisions: { minimum: Math.min(...linearCounterCheck),
      maximum: Math.max(...linearCounterCheck),
      all29AnalyticalIdentitiesPass: true },
    warning: "Conditional expectation bounds under Shakespeare-like stationarity/independence; not binomial p-values; no key/plaintext recovered"
  }, null, 2));
}
if (require.main === module) main();
module.exports = { latinWords, runeWords, differences, summarize, describe };
