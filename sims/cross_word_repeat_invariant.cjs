"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const RUNES = /[\u16A0-\u16FF]/gu;
const REPO = path.resolve(__dirname, "..");

/** @param {string} text @returns {string[][]} List of canonical rune words. */
function words(text) {
  return text.split(/[-.&§]/u).map(part => part.match(RUNES))
    .filter(Boolean);
}

/** @param {number} seed @returns {() => number} Reproducible uniform source. */
function prng(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

/** @param {string[][][]} groups @returns {number} */
function boundaryRepeated(groups) {
  let count = 0;
  for (const group of groups) {
    for (let i = 1; i < group.length; i++)
      if (group[i - 1][group[i - 1].length - 1] === group[i][0]) count++;
  }
  return count;
}

/**
 * Exact conditional expectation for a uniformly randomized order of words
 * within each group. A particular ordered pair of distinct words becomes
 * adjacent with probability 1 / N.
 * @param {string[][][]} groups
 * @returns {{expected:number,observed:number,pairs:number,groups:number,words:number}}
 */
function exactWordShuffleExpectation(groups) {
  let expected = 0;
  let pairs = 0;
  let nwords = 0;
  for (const group of groups) {
    const N = group.length;
    nwords += N;
    if (N < 2) continue;
    pairs += N - 1;
    const first = new Map();
    const last = new Map();
    let sameWord = 0;
    for (const word of group) {
      const f = word[0];
      const l = word[word.length - 1];
      first.set(f, (first.get(f) || 0) + 1);
      last.set(l, (last.get(l) || 0) + 1);
      if (f === l) sameWord++;
    }
    let matches = -sameWord;
    for (const [r,n] of first) matches += n * (last.get(r) || 0);
    expected += matches / N;
  }
  return {
    expected, observed:boundaryRepeated(groups), pairs,groups:groups.length,
    words:nwords
  };
}

/**
 * @param {string[][]} group
 * @param {() => number} random
 * @param {"full"|"length"} mode
 */
function shuffled(group, random, mode) {
  const copy = group.slice();
  if (mode === "length") {
    const byLength = new Map();
    for (let i = 0; i < copy.length; i++) {
      const len = copy[i].length;
      if (!byLength.has(len)) byLength.set(len, []);
      byLength.get(len).push(i);
    }
    for (const positions of byLength.values()) {
      for (let i = positions.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        const a = positions[i], b = positions[j];
        [copy[a],copy[b]] = [copy[b],copy[a]];
      }
    }
  } else {
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [copy[i],copy[j]] = [copy[j],copy[i]];
    }
  }
  return copy;
}

/**
 * Exact whole-word permutation null preserving all existing ciphertext words.
 * The "length" mode additionally keeps the complete word-length sequence
 * unchanged; clauses keep punctuation and coarse semantic scope.
 * @param {string[][][]} groups
 * @param {"full"|"length"} mode
 * @param {number} trials
 * @param {number} seed
 */
function permute(groups, mode, trials, seed) {
  const random = prng(seed);
  const observed = boundaryRepeated(groups);
  let below = 0;
  let mean = 0;
  let m2 = 0;
  let minimum = Infinity;
  for (let t = 0; t < trials; t++) {
    const test = groups.map(g => shuffled(g, random, mode));
    const hits = boundaryRepeated(test);
    if (hits <= observed) below++;
    if (hits < minimum) minimum = hits;
    const delta = hits - mean;
    mean += delta / (t + 1);
    m2 += delta * (hits - mean);
  }
  return {
    mode, trials,observed,
    lowerTailCount:below,
    lowerTailP:(below + 1) / (trials + 1),
    expectedMean:mean, sd:Math.sqrt(m2 / (trials - 1)), minimum
  };
}

/**
 * Within-word adjacent repeat counts, unaffected by any whole-word shuffle.
 * @param {string[][][]} sections
 */
function withinWord(sections) {
  let nRunes = 0;
  let pairs = 0;
  let repeats = 0;
  for (const group of sections) {
    for (const word of group) {
      nRunes += word.length;
      for (let j = 1; j < word.length; j++) {
        pairs++;
        if (word[j - 1] === word[j]) repeats++;
      }
    }
  }
  return {nRunes,pairs,repeats,rate:repeats / pairs};
}

/** Run the exact tests on the original source, no additional dependencies. */
function main() {
  const master = fs.readFileSync(path.join(REPO,"resources",
    "transcriptions","liber_primus_master.txt"),"utf8");
  const allSections = master.slice(master.indexOf("\n\n") + 2).split("$");
  const sections = allSections.slice(7,16).map(words);
  const clauses = allSections.slice(7,16).flatMap(text =>
    text.split(/[.&§]/u).map(words).filter(group => group.length));
  const reference = [2,4,6,17].map(i => words(allSections[i]));

  assert.equal(sections.length,9);
  assert.equal(sections.flat().length,2896);
  assert.equal(clauses.flat().length,2896);
  assert.equal(withinWord(sections).nRunes,12956);
  assert.equal(withinWord(sections).pairs,10060);
  assert.equal(exactWordShuffleExpectation(sections).pairs,2887);
  assert.equal(exactWordShuffleExpectation(clauses).pairs,2728);
  // The two scopes differ only by explicit clause and paragraph boundaries.
  assert.equal(boundaryRepeated(sections),23);
  assert.equal(boundaryRepeated(clauses),22);
  const output = {
    source:"resources/transcriptions/liber_primus_master.txt",
    description:"Canonical words; physical line/page breaks preserved within words",
    withinWord:withinWord(sections),
    acrossWordsBySection:exactWordShuffleExpectation(sections),
    withinClauses:exactWordShuffleExpectation(clauses),
    referenceEnglish:exactWordShuffleExpectation(reference),
    permutationControls:{
      sectionAllWords:permute(sections,"full",5000,0x61ae552),
      sectionSameLength:permute(sections,"length",5000,0x61ae553),
      clauseAllWords:permute(clauses,"full",5000,0x61ae554),
      clauseSameLength:permute(clauses,"length",5000,0x61ae555),
      referenceEnglish:permute(reference,"full",5000,0x61ae556)
    }
  };
  process.stdout.write(JSON.stringify(output,null,2)+"\n");
}

if (require.main === module) main();
module.exports = {words,boundaryRepeated,exactWordShuffleExpectation,permute,withinWord};
