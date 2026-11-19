"use strict";

/**
 * SFT: retrospective FOUND -> GOOD transition in the frozen GP29 H-shell space.
 *
 * Run:
 *   node sims\\lp2_found_good_shell_transition_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const solved = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number} left @param {number} right @returns {[number, number]} */
function H(left, right) {
  return [mod29(left - right), mod29(left + right)];
}

/** @param {string} word @returns {number[]} */
function gp(word) {
  const normalized = word.toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");
  const values = [];
  for (let offset = 0; offset < normalized.length;) {
    if (normalized.startsWith("ING", offset)) {
      values.push(21);
      offset += 3;
      continue;
    }
    if (normalized.startsWith("IO", offset)) {
      values.push(27);
      offset += 2;
      continue;
    }
    const token = gpTokens.find((row) => normalized.startsWith(row.symbol, offset));
    assert.ok(token, "unmapped GP spelling " + word);
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}

/** @param {number[]} values @returns {number[]} */
function shell(values) {
  const out = [];
  for (let left = 0, right = values.length - 1; left < right; left += 1, right -= 1) {
    out.push(...H(values[left], values[right]));
  }
  if (values.length % 2 === 1) out.push(values[(values.length - 1) / 2]);
  return out;
}

const clear = signed.split("-----BEGIN PGP SIGNATURE-----")[0]
  .split(/\n\n/).slice(1).join("\n");
const words = clear.split(/[^A-Za-z0-9]+/)
  .filter((token) => /^[A-Za-z]+$/.test(token))
  .map((word, index) => ({ index, word: word.toUpperCase(), values: gp(word) }));
assert.equal(words.length, 43);

const fiveTargets = [...new Map(words
  .filter((row) => row.values.length === 5)
  .map((row) => [row.values.join(","), row])).values()];
const fourTargets = [...new Map(words
  .filter((row) => row.values.length === 4)
  .map((row) => [row.values.join(","), row])).values()];
assert.deepEqual(fiveTargets.map((row) => row.word),
  ["HELLO", "EMPTY", "SEEKS", "LIBER", "WORDS", "FOUND", "FALSE"]);
assert.deepEqual(fourTargets.map((row) => row.word),
  ["LIES", "THEIR", "MEANING", "ROAD", "SEEK", "WILL", "GOOD", "LUCK", "PATHS"]);

const state = { p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2 };
const inverseB = 3;
assert.equal(state.b * inverseB % (state.p - 1), 1);
const foundShell = shell(gp("FOUND"));
const goodShell = shell(gp("GOOD"));
assert.deepEqual(foundShell, [state.a, state.p, state.p, state.K * state.a, state.a - state.g]);
assert.deepEqual(goodShell, [state.K * state.a, 0, 0, state.a]);

const pairedFound = foundShell.slice(0, 4);
const exactDelta = goodShell.map((value, index) => mod29(value - pairedFound[index]));
assert.deepEqual(exactDelta, [state.a, state.a, state.a, state.p]);

const scalarEntries = [
  ["p", state.p], ["g", state.g], ["a", state.a], ["b", state.b],
  ["A", state.A], ["B", state.B], ["K", state.K], ["b^-1_mod22", inverseB],
  ["p+K", mod29(state.p + state.K)], ["K*a", mod29(state.K * state.a)],
  ["K*g", mod29(state.K * state.g)], ["H(A,B).0", H(state.A, state.B)[0]],
  ["H(A,B).1", H(state.A, state.B)[1]], ["H(K,b).0", H(state.K, state.b)[0]],
  ["H(K,b).1", H(state.K, state.b)[1]],
];
const scalars = [...new Map(scalarEntries.map(([name, value]) => [value, { value, names: [] }])).values()];
for (const [name, value] of scalarEntries) scalars.find((row) => row.value === value).names.push(name);
assert.equal(scalars.length, 15);

const targetByShell = new Map(fourTargets.map((row) => [shell(row.values).join(","), row.word]));
const familyHits = [];
for (const x of scalars) {
  for (const y of scalars) {
    for (const sign of [-1, 1]) {
      const delta = [x.value, x.value, x.value, y.value].map((value) => mod29(sign * value));
      const output = pairedFound.map((value, index) => mod29(value + delta[index]));
      const target = targetByShell.get(output.join(","));
      if (target) familyHits.push({ x: x.names, y: y.names, sign, delta, target });
    }
  }
}
assert.equal(scalars.length ** 2 * 2, 450);
assert.deepEqual(familyHits, [
  { x: ["p"], y: ["a"], sign: -1, delta: exactDelta, target: "GOOD" },
  { x: ["a"], y: ["p"], sign: 1, delta: exactDelta, target: "GOOD" },
]);

const orderedBroadHits = [];
for (const left of fiveTargets) {
  for (const right of fourTargets) {
    const leftPaired = shell(left.values).slice(0, 4);
    const rightShell = shell(right.values);
    const delta = rightShell.map((value, index) => mod29(value - leftPaired[index]));
    if (delta[0] === delta[1] && delta[1] === delta[2]) {
      orderedBroadHits.push({ from: left.word, to: right.word, delta });
    }
  }
}
assert.deepEqual(orderedBroadHits, [{ from: "FOUND", to: "GOOD", delta: exactDelta }]);

const adjacentSigned = [];
for (let index = 0; index + 1 < words.length; index += 1) {
  const left = words[index];
  const right = words[index + 1];
  if (left.values.length !== 5 || right.values.length !== 4) continue;
  const leftPaired = shell(left.values).slice(0, 4);
  const rightShell = shell(right.values);
  const delta = rightShell.map((value, coordinate) => mod29(value - leftPaired[coordinate]));
  adjacentSigned.push({
    from: left.word,
    to: right.word,
    delta,
    broad: delta[0] === delta[1] && delta[1] === delta[2],
  });
}
assert.deepEqual(adjacentSigned, [
  { from: "FOUND", to: "GOOD", delta: exactDelta, broad: true },
  { from: "FALSE", to: "PATHS", delta: [16, 10, 13, 16], broad: false },
]);

let solvedAdjacent = 0;
let solvedBroad = 0;
let solvedExact = 0;
for (const section of solved.sections) {
  const sourceWords = (section.source_text.match(/[\u16A0-\u16FF]+/gu) || [])
    .map((raw) => [...raw].map((rune) => runeIndex.get(rune)).filter((value) => value !== undefined));
  for (let index = 0; index + 1 < sourceWords.length; index += 1) {
    const left = sourceWords[index];
    const right = sourceWords[index + 1];
    if (left.length !== 5 || right.length !== 4) continue;
    solvedAdjacent += 1;
    const leftPaired = shell(left).slice(0, 4);
    const rightShell = shell(right);
    const delta = rightShell.map((value, coordinate) => mod29(value - leftPaired[coordinate]));
    if (delta[0] === delta[1] && delta[1] === delta[2]) solvedBroad += 1;
    if (delta.join(",") === exactDelta.join(",")) solvedExact += 1;
  }
}
assert.equal(solvedAdjacent, 9);
assert.equal(solvedBroad, 0);
assert.equal(solvedExact, 0);

console.log(JSON.stringify({
  status: "PASS",
  classification:
    "retrospective mechanism compression: FOUND paired H-shell plus [a,a,a,p] yields GOOD; the 450-label source-scalar family has only residue-equivalent GOOD hits; FOUND->GOOD is the sole broad-shape pair among 63 authenticated 5x4 targets and solved native 5->4 controls have zero hits",
  state,
  foundShell,
  pairedFound,
  goodShell,
  exactDelta,
  family: { configurations: 450, hits: familyHits },
  authenticated: {
    orderedPairs: fiveTargets.length * fourTargets.length,
    broadHits: orderedBroadHits,
    adjacent5to4: adjacentSigned,
  },
  solved: { adjacent5to4: solvedAdjacent, broadHits: solvedBroad, exactHits: solvedExact },
}, null, 2));
