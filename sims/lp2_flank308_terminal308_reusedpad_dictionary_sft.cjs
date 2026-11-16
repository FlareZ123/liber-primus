"use strict";
/**
 * SFT: key-independent dictionary gates for (a) a reused direct additive
 * GP29 pad and (b) a reused key on ciphertext first differences (chain cipher),
 * each at natural LP2 source-printed table flanks and terminal pp54-55. Exact DP minimizes the
 * nonlexicon word count jointly under the two original difference streams.
 *
 * Run: node sims/lp2_flank308_terminal308_reusedpad_dictionary_sft.cjs
 * No network, randomness, or file writes.
 *
 * @typedef {{edges: Map<number, number>, terminal: boolean}} TrieNode
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const read = (p) => fs.readFileSync(path.join(__dirname, "..", p), "utf8");

const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const runeIndex = new Map(gp.runes.map((r, i) => [r, i]));
const alphabet = gp.translit.map((s, i) => ({ s, i }))
  .sort((a, b) => b.s.length - a.s.length);
const source = [];
const classes = [];
let buffered = [];
function endWord() {
  for (let j = 0; j < buffered.length; j++) {
    classes.push(buffered.length === 1 ? 3
      : j === 0 ? 0
      : j === buffered.length - 1 ? 2 : 1);
  }
  source.push(...buffered);
  buffered = [];
}
for (const c of read("resources/liber-primus/lp2-transcription.txt")) {
  if (runeIndex.has(c)) buffered.push(runeIndex.get(c));
  else if (c === "-" || c === ".") endWord();
}
endWord();
const original = gp.pages.filter((p) => p.page < 56 && p.page !== 50)
  .flatMap((p) => p.indices);
assert.deepEqual(source.slice(0, original.length), original);
assert.equal(original.length, 12956);
assert.equal(classes.slice(0, original.length)
  .filter((c) => c === 0 || c === 3).length, 2896);

function toRunes(text) {
  const normalized = text.toUpperCase().replace(/[KVZQ]/g, (c) => ({
    K: "C", V: "U", Z: "S", Q: "C"
  })[c]);
  const tokens = [];
  for (let i = 0; i < normalized.length;) {
    const match = alphabet.find((v) => normalized.startsWith(v.s, i));
    if (match) {
      tokens.push(match.i);
      i += match.s.length;
    } else i++;
  }
  return tokens;
}

const nodes = [{ edges: new Map(), terminal: false }];
const byLength = new Map();
const dictionary = new Set();
for (const row of read("resources/control/english_wordfreq_textblob.txt").split("\n")) {
  const m = /^([a-z]+) (\d+)$/.exec(row);
  if (!m) continue;
  const tokens = toRunes(m[1]);
  const key = tokens.join(",");
  dictionary.add(key);
  if (!byLength.has(tokens.length)) byLength.set(tokens.length, []);
  byLength.get(tokens.length).push(tokens);
  let node = 0;
  for (const symbol of tokens) {
    let next = nodes[node].edges.get(symbol);
    if (next === undefined) {
      next = nodes.length;
      nodes[node].edges.set(symbol, next);
      nodes.push({ edges: new Map(), terminal: false });
    }
    node = next;
  }
  nodes[node].terminal = true;
}
assert.equal(nodes.length, 74946);
assert.equal(dictionary.size, 29061);

// Independent original-source geometry: two complete sentences around the
// pp49-51 numerical table (138 + 170 runes), versus terminal pp54-55 (308).
const starts = new Map();
let runesSoFar = 0;
for (const page of gp.pages.filter(p => p.page < 56)) {
  starts.set(page.page, runesSoFar);
  runesSoFar += page.indices.length;
}
assert.equal(runesSoFar, 12956);
const flankSlices = [[48,199,271],[49,0,66],[51,0,92],[52,0,78]];
const finalSlices = [[54,0,232],[55,0,76]];
function getSlices(slices, array) {
  return slices.flatMap(([page, begin, end]) =>
    array.slice(starts.get(page) + begin, starts.get(page) + end));
}
const a = getSlices(flankSlices, source);
const b = getSlices(finalSlices, source);
const ca = getSlices(flankSlices, classes);
const cb = getSlices(finalSlices, classes);
const count = 308;
assert.deepEqual([a.length,b.length,ca.length,cb.length],[308,308,308,308]);
assert.deepEqual([ca[0],cb[0]],[0,0]);
assert.ok([2,3].includes(ca[137]) && [2,3].includes(ca[307]));
assert.ok([2,3].includes(cb[8]) && [2,3].includes(cb[307]));
assert.equal(ca.filter(c => c === 2 || c === 3).length,73);
assert.equal(cb.filter(c => c === 2 || c === 3).length,66);
const difference = (a, b) => a.map((x, i) => (x - b[i] + 29) % 29);

/**
 * Exact minimal OOV word count over every joint candidate for P4-P5=D mod29.
 * At a nonexistent trie edge, one entire word becomes OOV; its remaining
 * symbols are unconstrained and cost nothing more. An unfinished lexicon
 * prefix at a printed word end also costs exactly one OOV.
 *
 * @param {number[]} delta
 * @param {number[]} wordClassesA
 * @param {number[]} wordClassesB
 * @param {number} limit
 */
function minOov(delta, wordClassesA, wordClassesB, limit = delta.length) {
  const unknown = nodes.length;
  const base = unknown + 1;
  let states = new Map([[0, 0]]);
  let maxStates = 1;
  let firstUnavoidableOovAt = null;
  const milestones = [];
  for (let t = 0; t < Math.min(limit, delta.length); t++) {
    const endA = wordClassesA[t] === 2 || wordClassesA[t] === 3;
    const endB = wordClassesB[t] === 2 || wordClassesB[t] === 3;
    const next = new Map();
    for (const [key, cost] of states) {
      const na = Math.floor(key / base);
      const nb = key % base;
      for (let v = 0; v < 29; v++) {
        const w = (v - delta[t] + 29) % 29;
        let a1 = na === unknown ? unknown : nodes[na].edges.get(v);
        let b1 = nb === unknown ? unknown : nodes[nb].edges.get(w);
        let extra = 0;
        if (a1 === undefined) { a1 = unknown; extra++; }
        else if (endA && a1 !== unknown && !nodes[a1].terminal) extra++;
        if (b1 === undefined) { b1 = unknown; extra++; }
        else if (endB && b1 !== unknown && !nodes[b1].terminal) extra++;
        const dest = (endA ? 0 : a1) * base + (endB ? 0 : b1);
        const candidate = cost + extra;
        const incumbent = next.get(dest);
        if (incumbent === undefined || candidate < incumbent) next.set(dest, candidate);
      }
    }
    states = next;
    maxStates = Math.max(maxStates, states.size);
    let minimum = Infinity;
    for (const value of states.values()) minimum = Math.min(minimum, value);
    if (minimum && firstUnavoidableOovAt === null) firstUnavoidableOovAt = t;
    if ((t + 1) % 200 === 0 || t === limit - 1) {
      milestones.push({ endIndex: t, minOov: minimum, states: states.size });
    }
    assert(states.size <= 100000, "DP unexpectedly exceeded memory cap");
  }
  let minimum = Infinity;
  for (const cost of states.values()) minimum = Math.min(minimum, cost);
  return { length: limit, minOov: minimum, maxStates, firstUnavoidableOovAt,
    milestones };
}

/** Produce positive controls with each printed word length exactly preserved. */
function nativePlant(layout, seed) {
  const result = [];
  for (let i = 0; i < layout.length;) {
    let end = i;
    while (end < layout.length && layout[end] !== 2 && layout[end] !== 3) end++;
    assert(end < layout.length);
    const choices = byLength.get(end - i + 1);
    assert(choices?.length > 0);
    result.push(...choices[(seed + 131 * i) % choices.length]);
    i = end + 1;
  }
  return result;
}

const actual = minOov(difference(a,b),ca,cb);
const plantedA = nativePlant(ca,179);
const plantedB = nativePlant(cb,521);
const planted = minOov(difference(plantedA,plantedB),ca,cb);
const steps = sequence => sequence.map((value,i) =>
  (value-(i?sequence[i-1]:0)+29)%29);
const actualChain = minOov(difference(steps(a),steps(b)),ca,cb);
const sharedPad = Array.from({length:count},(_,i) => (17*i+31)%29);
function chainEncrypt(plain) {
  let state=0;
  return plain.map((x,i) => state=(state+x+sharedPad[i])%29);
}
const plantedChain=minOov(difference(
  steps(chainEncrypt(plantedA)),steps(chainEncrypt(plantedB))),ca,cb);
assert.equal(planted.minOov,0);
assert.equal(plantedChain.minOov,0);
console.log(JSON.stringify({
  source:"138+170 original pre/posttable sentences vs 232+76 terminal",
  lengths:[a.length,b.length],printedWordCounts:[73,66],
  lexicon:{gpDistinct:dictionary.size,trieNodes:nodes.length},
  directPad:{original:actual,positivePlant:planted},
  chainedStepPad:{original:actualChain,positivePlant:plantedChain},
},null,2));
