"use strict";

/**
 * Key-blind exact word-length crib search: solved LP1 against unresolved LP2.
 * Canonical words cross printed line and physical page boundaries, but not
 * - . & $ § delimiters. Nulls preserve each LP2 section's word-length multiset.
 * Run from the repository with Node 22: node sims/lp1_lp2_wordlength_crib_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = (name) => fs.readFileSync(path.join(ROOT, name), "utf8");
const first = read("resources/transcriptions/liber_primus_master.txt")
  .split("%").slice(0, 16).join("%");
const second = read("resources/lp2-transcription.txt")
  .split("%").slice(0, 55).join("%");

/** @param {string} input @returns {number[][]} Rune-word lengths per section. */
function parseSections(input) {
  const sections = [[]];
  let word = 0;
  function finish() {
    if (word) {
      sections[sections.length - 1].push(word);
      word = 0;
    }
  }
  for (const character of input) {
    const code = character.charCodeAt(0);
    if (code >= 0x16A0 && code <= 0x16FF) word++;
    else if ("-.$&§".includes(character)) {
      finish();
      if ("$§".includes(character) && sections[sections.length - 1].length) sections.push([]);
    }
  }
  finish();
  return sections.filter((group) => group.length);
}

/**
 * @param {number[]} source
 * @param {number[]} target
 * @returns {{length:number,sourceIndex:number,targetIndex:number}}
 */
function longestShared(source, target) {
  for (let length = 14; length >= 4; length--) {
    const seen = new Map();
    for (let i = 0; i + length <= source.length; i++)
      seen.set(source.slice(i, i + length).join(","), i);
    for (let j = 0; j + length <= target.length; j++) {
      const i = seen.get(target.slice(j, j + length).join(","));
      if (i !== undefined) return {length, sourceIndex:i, targetIndex:j};
    }
  }
  return {length:3, sourceIndex:-1, targetIndex:-1};
}

let state = 0x33013301;
/** @returns {number} Deterministic [0,1) float. */
function random() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return (state >>> 0) / 4294967296;
}
/** @param {number[]} array @returns {number[]} */
function shuffled(array) {
  const copy = array.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const lp1 = parseSections(first).flat();
const sections = parseSections(second);
const lp2 = sections.flat();
assert.equal(lp1.length, 694);
assert.equal(lp2.length, 2896);
assert.deepEqual(sections.map((s) => s.length), [158,255,385,435,224,326,378,735]);
const observed = longestShared(lp1, lp2);
assert.equal(observed.length, 8);
assert.equal(observed.targetIndex, 318);
const planted = lp2.slice();
planted.splice(1000, 14, ...lp1.slice(250, 264));
const positive = longestShared(lp1, planted);
assert.ok(positive.length >= 14, "14-word literal crib must be found");

const trials = 1200;
let exceeds = 0;
const histogram = {};
for (let n = 0; n < trials; n++) {
  const control = sections.flatMap(shuffled);
  const longest = longestShared(lp1, control).length;
  histogram[longest] = (histogram[longest] || 0) + 1;
  if (longest >= observed.length) exceeds++;
}
const result = {
  sourceWords:lp1.length,
  unresolvedWords:lp2.length,
  sectionLengths:sections.map((s) => s.length),
  observed,
  exampleMatchedLengths:lp1.slice(observed.sourceIndex,
    observed.sourceIndex + observed.length),
  plantedControlLength:positive.length,
  trials,
  nullAtLeastObserved:exceeds,
  addOneP:(exceeds + 1) / (trials + 1),
  histogram,
  seed:"0x33013301"
};
console.log(JSON.stringify(result, null, 2));
