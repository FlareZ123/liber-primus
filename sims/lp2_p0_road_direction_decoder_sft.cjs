"use strict";

/**
 * Reproduce the p0 ROAD direction decoder from original p50 tokens and
 * fixed DH23/H state. CommonJS SFT for Node 22.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
const solved = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const tokens = grid.pages.flatMap((page) => page.tokens);
const alphabet60 = grid.alphabet;
const alphabet59 = alphabet60.replace("f", "");
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((a, b) => b.symbol.length - a.symbol.length);

const state = Object.freeze({ p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2, e: 3, q: 4, one: 1 });

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number[]} values @returns {number[]} */
function h4(values) {
  assert.equal(values.length, 4);
  return [
    mod29(values[0] - values[3]),
    mod29(values[0] + values[3]),
    mod29(values[1] - values[2]),
    mod29(values[1] + values[2]),
  ];
}

/** @param {number[]} values @returns {number[]} */
function h4inv(values) {
  assert.equal(values.length, 4);
  const inv2 = 15;
  return [
    mod29((values[0] + values[1]) * inv2),
    mod29((values[2] + values[3]) * inv2),
    mod29((values[3] - values[2]) * inv2),
    mod29((values[1] - values[0]) * inv2),
  ];
}

/** @param {string} token @param {string} alphabet @returns {number|null} */
function tokenValue(token, alphabet) {
  const high = alphabet.indexOf(token[0]);
  const low = alphabet.indexOf(token[1]);
  return high < 0 || low < 0 ? null : high * alphabet.length + low;
}

/** @param {number[]} permutation @param {number[]} values @returns {number[]} */
function permute(permutation, values) {
  return permutation.map((index) => values[index]);
}

/** @param {number[]} values @returns {boolean} */
function isPermutation03(values) {
  return values.slice().sort((a, b) => a - b).join(",") === "0,1,2,3";
}

/** @param {string} source @returns {number[][]} */
function runeWords(source) {
  const words = [];
  let current = [];
  for (const char of [...source]) {
    const value = runeIndex.get(char);
    if (value !== undefined) current.push(value);
    else if (current.length) {
      words.push(current);
      current = [];
    }
  }
  if (current.length) words.push(current);
  return words;
}

/** @param {string} word @returns {number[]} */
function gpWord(word) {
  const normalized = word.toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");

  const values = [];
  for (let index = 0; index < normalized.length;) {
    if (normalized.startsWith("ING", index)) {
      values.push(21);
      index += 3;
      continue;
    }
    if (normalized.startsWith("IO", index)) {
      values.push(27);
      index += 2;
      continue;
    }
    const token = gpTokens.find((candidate) => normalized.startsWith(candidate.symbol, index));
    assert.ok(token, `unmapped GP spelling ${word} at ${index}`);
    values.push(token.value);
    index += token.symbol.length;
  }
  return values;
}

const known = new Map();
for (const section of solved.sections) {
  for (const values of runeWords(section.source_text)) {
    known.set(values.join(","), values.map((value) => corpus.translit[value]).join(""));
  }
}
const signedClear = signed
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .split(/\n\n/u)
  .slice(1)
  .join("\n");
const signedWords = signedClear
  .split(/[^A-Za-z0-9]+/u)
  .filter((word) => /^[A-Za-z]+$/u.test(word))
  .map((word) => word.toUpperCase());
for (const word of signedWords) {
  const values = gpWord(word);
  known.set(values.join(","), word);
}

const cells = [105, 106, 107, 108];
const indices = cells.map((cell) => cell - 1);
const roadTokens = indices.map((index) => tokens[index]);
assert.deepEqual(roadTokens, ["22", "13", "0V", "3c"]);

const base60Values = roadTokens.map((token) => tokenValue(token, alphabet60));
assert.deepEqual(base60Values, [122, 63, 31, 218]);
const residues = base60Values.map((value) => value % 29);
const quotients = base60Values.map((value) => Math.floor(value / 29));
const direction = roadTokens.map((token) => alphabet60.indexOf(token[0]));
assert.deepEqual(residues, [state.a, state.g, state.K, state.b]);
assert.deepEqual(quotients, [state.q, state.K, 1, state.g + state.K]);
assert.deepEqual(direction, [state.K, 1, 0, state.e]);
assert.ok(isPermutation03(direction));
assert.deepEqual(permute(direction, direction), [0, 1, 2, 3]);

const directedState = permute(direction, residues);
assert.deepEqual(directedState, [state.K, state.g, state.a, state.b]);
const shell = h4(directedState);
assert.deepEqual(shell, [16, 17, 28, 11]);
const directedShell = permute(direction, shell);
assert.deepEqual(directedShell, [28, state.B - state.K, state.B - state.e, state.B - state.A]);
assert.equal(29, state.p + state.g + 1);
assert.equal(directedShell[0], 28);

const corrected = directedShell.slice();
corrected[0] = mod29(corrected[0] - state.g);
assert.deepEqual(corrected, [state.p, state.B - state.K, state.B - state.e, state.B - state.A]);

const roadKey = h4(corrected);
assert.deepEqual(roadKey, [12, 5, 1, 4]);
const roadCipher = [16, 8, 25, 27];
const roadPlain = roadCipher.map((value, index) => mod29(value - roadKey[index]));
assert.deepEqual(roadPlain, [4, 3, 24, 23]);
assert.equal(known.get(roadPlain.join(",")), "ROAD");
assert.deepEqual(roadPlain.map((value, index) => mod29(value + roadKey[index])), roadCipher);

const hAB = [mod29(state.a - state.b), mod29(state.a + state.b)];
const hCapitalAB = [mod29(state.A - state.b), mod29(state.A + state.b)];
assert.deepEqual(hAB, [20, 21]);
assert.deepEqual(hCapitalAB, [22, 23]);
const interval = [state.B, ...hAB, ...hCapitalAB, mod29(-state.g)];
assert.deepEqual(interval, [19, 20, 21, 22, 23, 24]);
assert.deepEqual(interval.map((index) => signedWords[index]), ["THEIR", "MEANING", "IS", "THE", "ROAD", "AND"]);

// 56 straight four-layer inward normals.
const rays = [];
for (let row = 3; row <= 28; row += 1) {
  rays.push({ side: "L", fixed: row, indices: [0, 1, 2, 3].map((column) => row * 8 + column) });
  rays.push({ side: "R", fixed: row, indices: [7, 6, 5, 4].map((column) => row * 8 + column) });
}
for (const column of [3, 4]) {
  rays.push({ side: "T", fixed: column, indices: [0, 1, 2, 3].map((row) => row * 8 + column) });
  rays.push({ side: "B", fixed: column, indices: [31, 30, 29, 28].map((row) => row * 8 + column) });
}
assert.equal(rays.length, 56);

const permutationRays = [];
const stateSet = new Set([state.p, state.g, state.a, state.b, state.A, state.B, state.K]);
const allStateResidueRays = [];
for (const ray of rays) {
  const rayTokens = ray.indices.map((index) => tokens[index]);
  const p = rayTokens.map((token) => alphabet60.indexOf(token[0]));
  const r = rayTokens.map((token) => tokenValue(token, alphabet60) % 29);
  if (r.every((value) => stateSet.has(value))) {
    allStateResidueRays.push({ side: ray.side, fixed: ray.fixed, cells: ray.indices.map((index) => index + 1), r });
  }
  if (!isPermutation03(p)) continue;
  const w = permute(p, h4(permute(p, r)));
  permutationRays.push({
    side: ray.side,
    fixed: ray.fixed,
    cells: ray.indices.map((index) => index + 1),
    tokens: rayTokens,
    p,
    r,
    w,
    marker: w[0] === 28,
  });
}
assert.equal(permutationRays.length, 6);
assert.deepEqual(permutationRays.filter((ray) => ray.marker), [{
  side: "L",
  fixed: 13,
  cells: [105, 106, 107, 108],
  tokens: ["22", "13", "0V", "3c"],
  p: [2, 1, 0, 3],
  r: [6, 5, 2, 15],
  w: [28, 17, 16, 11],
  marker: true,
}]);
assert.deepEqual(allStateResidueRays, [{
  side: "L",
  fixed: 13,
  cells: [105, 106, 107, 108],
  r: [6, 5, 2, 15],
}]);

// Address/radix convention charge.
const base59Values = roadTokens.map((token) => tokenValue(token, alphabet59));
assert.deepEqual(base59Values.map((value) => value % 29), [4, 4, 2, 12]);
assert.deepEqual(permute(direction, h4(permute(direction, base59Values.map((value) => value % 29)))), [0, 14, 19, 8]);

const zeroBasedTokens = [105, 106, 107, 108].map((index) => tokens[index]);
const zeroBasedDirection = zeroBasedTokens.map((token) => alphabet60.indexOf(token[0]));
assert.deepEqual(zeroBasedTokens, ["13", "0V", "3c", "0E"]);
assert.deepEqual(zeroBasedDirection, [1, 0, 3, 0]);
assert.ok(!isPermutation03(zeroBasedDirection));

// Parse complete page-local words and charge p0 plus the full unknown corpus.
const segments = transcription.split(/^\s*%\s*$/m).slice(0, 55);
const pages = [];
for (let segment = 0; segment < segments.length; segment += 1) {
  const words = [];
  let offset = 0;
  let current = [];
  let start = 0;

  function flush() {
    if (!current.length) return;
    words.push({ start, values: current.slice() });
    current = [];
  }

  for (const char of [...segments[segment]]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      if (!current.length) start = offset;
      current.push(value);
      offset += 1;
    } else if (char === "-" || char === ".") {
      flush();
    }
  }
  flush();
  pages.push({ page: segment >= 50 ? segment + 1 : segment, words });
}

let fourRuneWords = 0;
let addressable = 0;
let validPermutation = 0;
const markerHits = [];

for (const page of pages) {
  for (const word of page.words) {
    if (word.values.length !== 4) continue;
    fourRuneWords += 1;
    if (word.start < 1 || word.start + 3 > 256) continue;
    addressable += 1;

    const tableIndices = [word.start - 1, word.start, word.start + 1, word.start + 2];
    const p = tableIndices.map((index) => alphabet60.indexOf(tokens[index][0]));
    if (!isPermutation03(p)) continue;
    validPermutation += 1;

    const r = tableIndices.map((index) => tokenValue(tokens[index], alphabet60) % 29);
    const w = permute(p, h4(permute(p, r)));
    if (w[0] !== 28) continue;

    const t = w.slice();
    t[0] = mod29(t[0] - state.g);
    const key = h4(t);
    const plain = word.values.map((value, index) => mod29(value - key[index]));
    markerHits.push({
      page: page.page,
      start: word.start,
      cipher: word.values,
      p,
      r,
      w,
      key,
      plain,
      label: known.get(plain.join(",")) || null,
    });
  }
}

assert.equal(fourRuneWords, 514);
assert.equal(addressable, 491);
assert.equal(validPermutation, 25);
assert.equal(markerHits.length, 4);
assert.deepEqual(markerHits.map((hit) => [hit.page, hit.start]), [[0, 105], [3, 105], [20, 105], [31, 105]]);
assert.deepEqual(markerHits.filter((hit) => hit.label).map((hit) => [hit.page, hit.start, hit.label]), [[0, 105, "ROAD"]]);

const p0FourAddressable = pages[0].words.filter((word) =>
  word.values.length === 4 && word.start >= 1 && word.start + 3 <= 256);
assert.equal(p0FourAddressable.length, 10);
const p0PermutationStarts = [];
for (const word of p0FourAddressable) {
  const tableIndices = [word.start - 1, word.start, word.start + 1, word.start + 2];
  const p = tableIndices.map((index) => alphabet60.indexOf(tokens[index][0]));
  if (isPermutation03(p)) p0PermutationStarts.push(word.start);
}
assert.deepEqual(p0PermutationStarts, [105]);

// Marker correction charge: only -g is lexical.
const markerState = [28, 17, 16, 11];
const stateSteps = Object.entries(state);
const correctionLexical = [];
for (const [name, scalar] of stateSteps) {
  for (const sign of [-1, 1]) {
    const t = markerState.slice();
    t[0] = mod29(t[0] + sign * scalar);
    const key = h4(t);
    const plain = roadCipher.map((value, index) => mod29(value - key[index]));
    const label = known.get(plain.join(",")) || null;
    if (label) correctionLexical.push({ step: `${sign < 0 ? "-" : "+"}${name}`, key, plain, label });
  }
}
assert.deepEqual(correctionLexical, [{
  step: "-g",
  key: [12, 5, 1, 4],
  plain: [4, 3, 24, 23],
  label: "ROAD",
}]);

// Operation-order freedom charge.
const transforms = { H: h4, Hinv: h4inv };
const operationLexical = [];
for (const pre of [false, true]) {
  for (const [coreName, core] of Object.entries(transforms)) {
    for (const post of [false, true]) {
      let v = pre ? permute(direction, residues) : residues.slice();
      v = core(v);
      if (post) v = permute(direction, v);

      for (let marker = 0; marker < 4; marker += 1) {
        if (v[marker] !== 28) continue;
        for (const [stateName, scalar] of stateSteps) {
          for (const sign of [-1, 1]) {
            for (const [finalName, finalTransform] of Object.entries(transforms)) {
              const t = v.slice();
              t[marker] = mod29(t[marker] + sign * scalar);
              const key = finalTransform(t);
              const plain = roadCipher.map((value, index) => mod29(value - key[index]));
              const label = known.get(plain.join(",")) || null;
              if (!label) continue;
              operationLexical.push({
                pre,
                core: coreName,
                post,
                marker,
                step: `${sign < 0 ? "-" : "+"}${stateName}`,
                final: finalName,
                key,
                plain,
                label,
              });
            }
          }
        }
      }
    }
  }
}
assert.deepEqual(operationLexical, [{
  pre: true,
  core: "H",
  post: true,
  marker: 0,
  step: "-g",
  final: "H",
  key: [12, 5, 1, 4],
  plain: [4, 3, 24, 23],
  label: "ROAD",
}]);

// Five-rune extension: test whether the ROAD H4 marker mechanism transfers.
function isPermutation04(values) {
  return values.slice().sort((a, b) => a - b).join(",") === "0,1,2,3,4";
}

let fiveRuneWords = 0;
let fiveRuneAddressable = 0;
let fiveRunePermutationCandidates = 0;
let fiveRuneMarkerHits = 0;
const fiveRuneCandidates = [];

for (const page of pages) {
  for (const word of page.words) {
    if (word.values.length !== 5) continue;
    fiveRuneWords += 1;
    if (word.start < 1 || word.start + 4 > 256) continue;
    fiveRuneAddressable += 1;
    const cells = Array.from({ length: 5 }, (_, index) => word.start + index);
    const tableIndices = cells.map((cell) => cell - 1);
    const rayTokens = tableIndices.map((index) => tokens[index]);
    const direction5 = rayTokens.map((token) => alphabet60.indexOf(token[0]));
    if (!isPermutation04(direction5)) continue;
    fiveRunePermutationCandidates += 1;
    const values = rayTokens.map((token) => tokenValue(token, alphabet60));
    const residues5 = values.map(mod29);
    const quotients5 = values.map((value) => Math.floor(value / 29));
    const activePositions = [0, 1, 2, 3, 4].filter((index) => direction5[index] !== 4);
    const orderedResidues = [0, 1, 2, 3].map((digit) => residues5[direction5.indexOf(digit)]);
    const shell = h4(orderedResidues);
    const returned = activePositions.map((index) => shell[direction5[index]]);
    const markerPositions = returned.map((value, index) => value === 28 ? activePositions[index] : null).filter((index) => index !== null);
    if (markerPositions.length > 0) fiveRuneMarkerHits += 1;
    fiveRuneCandidates.push({
      page: page.page, start: word.start,
      translit: word.values.map((value) => corpus.translit[value]).join(""),
      cells, tokens: rayTokens, direction: direction5,
      residues: residues5, quotients: quotients5, returned, markerPositions,
    });
  }
}

assert.equal(fiveRuneWords, 355);
assert.equal(fiveRuneAddressable, 348);
assert.equal(fiveRunePermutationCandidates, 6);
assert.equal(fiveRuneMarkerHits, 0);
assert.deepEqual(fiveRuneCandidates.map((candidate) => [candidate.page, candidate.start]), [[9, 170], [13, 113], [37, 113], [38, 171], [40, 171], [52, 170]]);

console.log(JSON.stringify({
  status: "PASS",
  receiver: {
    cells,
    tokens: roadTokens,
    base60Values,
    residues,
    quotients,
    direction,
    directedState,
    directedShell,
    corrected,
    key: roadKey,
    plaintext: "ROAD",
  },
  controls: {
    inwardRays: rays.length,
    directionPermutationRays: permutationRays.length,
    markerRays: permutationRays.filter((ray) => ray.marker).length,
    fourRuneWords,
    addressable,
    validPermutation,
    markerHits,
    correctionLexical,
    operationLexical,
    fiveRuneWords,
    fiveRuneAddressable,
    fiveRunePermutationCandidates,
    fiveRuneMarkerHits,
    fiveRuneCandidates,
  },
}, null, 2));
