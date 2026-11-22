"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");
const {firstRunes} = require("./word_start_reset_scan.cjs");

const RUNES = /[\u16A0-\u16FF]/gu;

/** @param {number} seed @returns {() => number} */
function randomGenerator(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

/** @param {number[]} values @returns {number} Ordered collision count. */
function collisions(values) {
  const counts = new Uint16Array(29);
  for (const value of values) counts[value]++;
  let count = 0;
  for (const n of counts) count += n * (n - 1);
  return count;
}

/**
 * Repeated phase-specific substitutions preserve this within-group/phase
 * collision count, regardless of the unknown bijections.
 * @param {number[][]} groups Canonical word initials by reset scope.
 * @param {number} period
 * @returns {{hits:number,pairs:number,expected:number,z:number,rate:number}}
 */
function phaseScore(groups, period) {
  let hits = 0;
  let pairs = 0;
  let expected = 0;
  for (const group of groups) {
    if (group.length < 2) continue;
    const q = collisions(group) / (group.length * (group.length - 1));
    const counts = new Uint16Array(period * 29);
    const lengths = new Uint16Array(period);
    for (let i = 0; i < group.length; i++) {
      const phase = i % period;
      counts[phase * 29 + group[i]]++;
      lengths[phase]++;
    }
    let groupPairs = 0;
    for (let phase = 0; phase < period; phase++) {
      groupPairs += lengths[phase] * (lengths[phase] - 1);
      for (let symbol = 0; symbol < 29; symbol++) {
        const n = counts[phase * 29 + symbol];
        hits += n * (n - 1);
      }
    }
    pairs += groupPairs;
    expected += q * groupPairs;
  }
  const z = pairs && expected
    ? (hits - expected) / Math.sqrt(expected * (1 - expected / pairs))
    : 0;
  return {hits, pairs, expected, z, rate:pairs ? hits / pairs : null};
}

/** @param {number[][]} groups @param {() => number} rnd */
function shuffleGroups(groups, rnd) {
  return groups.map(group => {
    const copy = group.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  });
}

/**
 * One-sided scan for excess phase-specific equality. Includes the full
 * max-selected period in every matched shuffle null.
 * @param {number[][]} groups
 * @param {number} trials
 * @param {number} seed
 */
function scanPeriods(groups, trials, seed) {
  const minPeriod = 2;
  const maxPeriod = 60;
  const periods = Array.from({length:maxPeriod - minPeriod + 1},
    (_, i) => i + minPeriod);
  const observed = periods.map(period => phaseScore(groups, period));
  const winnerIndex = observed.reduce((best, result, i, arr) =>
    result.z > arr[best].z ? i : best, 0);
  const winner = observed[winnerIndex];
  const rnd = randomGenerator(seed);
  let equalOrGreaterMaximum = 0;
  let greater23 = 0;
  const index23 = periods.indexOf(23);
  for (let trial = 0; trial < trials; trial++) {
    const shuffled = shuffleGroups(groups, rnd);
    let maximum = -Infinity;
    for (let i = 0; i < periods.length; i++) {
      const z = phaseScore(shuffled, periods[i]).z;
      if (z > maximum) maximum = z;
      if (i === index23 && z >= observed[index23].z) greater23++;
    }
    if (maximum >= winner.z) equalOrGreaterMaximum++;
  }
  return {
    trials, minPeriod, maxPeriod,
    winner:{period:periods[winnerIndex],...winner},
    period23:{...observed[index23],
      p:(greater23 + 1) / (trials + 1)},
    period29:observed[periods.indexOf(29)],
    period46:observed[periods.indexOf(46)],
    familywiseP:(equalOrGreaterMaximum + 1) / (trials + 1)
  };
}

/**
 * Plant an arbitrary alphabet permutation per phase and per reset group.
 * No assumption of additive/modular structure.
 * @param {number[][]} groups
 * @param {number[]} reference
 * @param {number} period
 * @param {number} trials
 */
function plantPhaseSubstitutions(groups, reference, period, trials) {
  const rnd = randomGenerator(0x35a927);
  const zScores = [];
  for (let trial = 0; trial < trials; trial++) {
    const planted = groups.map(group => {
      const table = Array.from({length:period}, () => {
        const permutation = Array.from({length:29}, (_,i) => i);
        for (let i = permutation.length - 1; i > 0; i--) {
          const j = Math.floor(rnd() * (i + 1));
          [permutation[i],permutation[j]] = [permutation[j],permutation[i]];
        }
        return permutation;
      });
      return group.map((unused,i) => {
        const plain = reference[Math.floor(rnd() * reference.length)];
        const encrypted = table[i % period][plain];
        return rnd() < 0.05 ? Math.floor(rnd() * 29) : encrypted;
      });
    });
    zScores.push(phaseScore(planted,period).z);
  }
  return {
    trials,period,overwrittenFraction:0.05,
    minimum:Math.min(...zScores),
    maximum:Math.max(...zScores),
    mean:zScores.reduce((sum,z) => sum + z,0)/trials,
    above3:zScores.filter(z => z > 3).length,
    above4:zScores.filter(z => z > 4).length
  };
}

/** Deterministic on-demand research entry point. */
function main() {
  const master = fs.readFileSync(path.join(__dirname, "..",
    "resources", "transcriptions", "liber_primus_master.txt"), "utf8");
  const sections = master.slice(master.indexOf("\n\n") + 2).split("$");
  const alphabet = [...new Set([...master.matchAll(RUNES)].map(m => m[0]))].sort();
  const runeId = new Map(alphabet.map((x,i) => [x,i]));
  const reference = [2,4,6,17].flatMap(i => firstRunes(sections[i]))
    .map(x => runeId.get(x));
  const sectionGroups = sections.slice(7,16).map(firstRunes)
    .map(group => group.map(r => runeId.get(r)));
  const corpus = parseSharedCorpus();
  const pageGroups = corpus.byStartPage.map(group =>
    group.map(word => runeId.get(word.runes[0])));
  assert.equal(alphabet.length,29);
  assert.equal(reference.length,250);
  assert.equal(sectionGroups.reduce((s,g) => s + g.length,0),2896);
  assert.equal(pageGroups.reduce((s,g) => s + g.length,0),2896);
  assert.equal(corpus.crossPageWords,32);
  const output = {
    controls:{
      referenceStarts:reference.length,
      lp2Starts:pageGroups.reduce((s,g) => s + g.length,0),
      originalRunes:corpus.runeCount,
      crossingWords:corpus.crossPageWords
    },
    section:scanPeriods(sectionGroups,600,0x35a913),
    page:scanPeriods(pageGroups,1000,0x35a914),
    arbitraryPhase23Plants:plantPhaseSubstitutions(pageGroups,reference,23,100)
  };
  process.stdout.write(JSON.stringify(output,null,2) + "\n");
}

if (require.main === module) main();
module.exports = {phaseScore,scanPeriods,plantPhaseSubstitutions};
