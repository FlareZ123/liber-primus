"use strict";

/**
 * SFT for the source-selected p0 DH-grid route:
 *   [b,K] -> p50 coordinate -> NUMBERS ->
 *   local PATHS receiver/key shell and continued VERIFY branch.
 *
 * Run:
 *   node sims/lp2_p0_dh_grid_paths_verify_route_sft.cjs
 */

const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const ROOT = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(ROOT, relative), "utf8").replace(/\r/g, "");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");

const table = grid.pages.flatMap((page) => page.tokens);
const alphabet60 = grid.alphabet;
const alphabet59 = alphabet60.replace("f", "");
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);

assert.equal(table.length, 256);
assert.equal(alphabet60.length, 60);
assert.equal(alphabet59.length, 59);

/** @param {number} value */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number} x @param {number} y */
function H(x, y) {
  return [mod29(x - y), mod29(x + y)];
}

/** @param {number[]} shell */
function hInverseShell(shell) {
  assert.equal(shell.length, 4);
  const inv2 = 15;
  const invertPair = (difference, sum) => [
    mod29((difference + sum) * inv2),
    mod29((sum - difference) * inv2),
  ];
  const outer = invertPair(shell[0], shell[1]);
  const inner = invertPair(shell[2], shell[3]);
  return [outer[0], inner[0], inner[1], outer[1]];
}

/** @param {string} word */
function gp(word) {
  const normalized = word
    .toUpperCase()
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
    const token = gpTokens.find((item) =>
      normalized.startsWith(item.symbol, offset)
    );
    assert.ok(token, "unmapped GP spelling: " + normalized.slice(offset));
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}

/** @param {string} token @param {string} alphabet */
function decodeToken(token, alphabet) {
  const high = alphabet.indexOf(token[0]);
  const low = alphabet.indexOf(token[1]);
  if (high < 0 || low < 0) return null;
  return high * alphabet.length + low;
}

/** @param {string} token */
function high60(token) {
  return alphabet60.indexOf(token[0]);
}

/** @param {string} token */
function low60(token) {
  return alphabet60.indexOf(token[1]);
}

const clearBody = signed
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .split(/\n\n/)
  .slice(1)
  .join("\n");

const sourceWords = clearBody
  .split(/[^A-Za-z0-9]+/)
  .filter((word) => /^[A-Za-z]+$/.test(word))
  .map((word, index) => {
    const values = gp(word);
    return {
      index,
      label: word.toUpperCase(),
      values,
      gp0: values.reduce((sum, value) => sum + value, 0),
    };
  });

assert.equal(sourceWords.length, 43);
assert.equal(sourceWords[2].label, "PATH");
assert.equal(sourceWords[5].label, "EPIPHANY");
assert.equal(sourceWords[15].label, "WORDS");
assert.equal(sourceWords[19].label, "THEIR");
assert.equal(sourceWords[23].label, "ROAD");
assert.equal(sourceWords[26].label, "NUMBERS");
assert.equal(sourceWords[33].label, "WILL");
assert.equal(sourceWords[40].label, "PATHS");
assert.equal(sourceWords[41].label, "VERIFY");
assert.equal(sourceWords[42].label, "OPENPGP");

const primaryDh = Object.freeze({
  p: 23,
  g: 5,
  a: 6,
  b: 15,
  A: 8,
  B: 19,
  K: 2,
});

assert.equal(sourceWords[primaryDh.K].label, "PATH");
assert.equal(sourceWords[primaryDh.g].label, "EPIPHANY");
assert.equal(sourceWords[primaryDh.a].label, "SEEKS");
assert.equal(sourceWords[primaryDh.A].label, "DEVOTED");
assert.equal(sourceWords[primaryDh.b].label, "WORDS");
assert.equal(sourceWords[primaryDh.B].label, "THEIR");
assert.equal(sourceWords[primaryDh.p].label, "ROAD");

/** @param {string} text */
function pageRunes(text) {
  return [...text]
    .map((char) => runeIndex.get(char))
    .filter((value) => value !== undefined);
}

/** @param {string} text */
function pageWords(text) {
  const words = [];
  let current = [];
  let start = 0;
  let runeOffset = 0;

  const close = () => {
    if (current.length === 0) return;
    words.push({
      ordinal: words.length,
      start,
      end: start + current.length - 1,
      length: current.length,
      values: current.slice(),
      sum: current.reduce((total, value) => total + value, 0),
    });
    current = [];
  };

  for (const char of [...text]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      if (current.length === 0) start = runeOffset;
      current.push(value);
      runeOffset += 1;
    } else if ((char === "-" || char === ".") && current.length > 0) {
      close();
    }
  }
  close();
  return words;
}

const pageTexts = transcription.split(/^\s*%\s*$/m).slice(0, 56);
assert.equal(pageTexts.length, 56);

const p0Runes = pageRunes(pageTexts[0]);
const p0Words = pageWords(pageTexts[0]);
const p0Starts = new Map(p0Words.map((word) => [word.start, word]));

const p0a = p0Words[42];
const p0b = p0Words[43];
assert.deepEqual(
  [p0a.start, p0a.end, p0a.length, p0a.values, p0a.sum, mod29(p0a.sum)],
  [189, 191, 3, [0, 6, 9], 15, 15]
);
assert.deepEqual(
  [p0b.start, p0b.end, p0b.length, p0b.values, p0b.sum, mod29(p0b.sum)],
  [192, 195, 4, [19, 12, 20, 9], 60, 2]
);

const selectedState = [mod29(p0a.sum), mod29(p0b.sum)];
assert.deepEqual(selectedState, [primaryDh.b, primaryDh.K]);

const p28Lines = pageTexts[28].trim().split("\n");
const dhLine = p28Lines[5].replace(/\/$/, "");
const dhFragments = dhLine
  .split("-")
  .filter(Boolean)
  .map((fragment) =>
    [...fragment]
      .map((char) => runeIndex.get(char))
      .filter((value) => value !== undefined)
  );

assert.equal(dhFragments.length, 5);
assert.deepEqual(dhFragments[0], [23, 8]);

const dhOuterPairs = dhFragments.map((fragment) =>
  H(fragment[0], fragment[fragment.length - 1])
);

assert.deepEqual(dhOuterPairs, [
  [15, 2],
  [14, 4],
  [12, 12],
  [23, 12],
  [8, 19],
]);
assert.deepEqual(selectedState, dhOuterPairs[0]);

const validCoordinates = dhOuterPairs
  .map(([row, column], pairIndex) => ({ pairIndex, row, column }))
  .filter(({ row, column }) =>
    row >= 0 && row < 32 && column >= 0 && column < 8
  );

assert.deepEqual(validCoordinates, [
  { pairIndex: 0, row: 15, column: 2 },
  { pairIndex: 1, row: 14, column: 4 },
]);

const selectedAddress = selectedState[0] * 8 + selectedState[1];
assert.equal(selectedAddress, 122);
assert.equal(table[selectedAddress], "1Q");
assert.equal(low60(table[selectedAddress]), 26);
assert.equal(sourceWords[26].label, "NUMBERS");

const numbersState = low60(table[selectedAddress]);
const numbersToken = table[numbersState];
assert.equal(numbersToken, "2r");
assert.equal(decodeToken(numbersToken, alphabet60), 173);

const pathsReceiver = decodeToken(numbersToken, alphabet60);
assert.equal(pathsReceiver, 173);
assert.deepEqual(p0Runes.slice(pathsReceiver, pathsReceiver + 4), [22, 8, 20, 28]);

const rivalAddress = 14 * 8 + 4;
assert.equal(rivalAddress, 116);
assert.equal(table[rivalAddress], "0s");
const rivalState = low60(table[rivalAddress]);
assert.equal(rivalState, 54);
assert.equal(table[rivalState], "2a");
const rivalReceiver = decodeToken(table[rivalState], alphabet60);
assert.equal(rivalReceiver, 156);
assert.equal(p0Starts.has(rivalReceiver), false);

/**
 * The exact retrospective serializer:
 *   q0=(low0,high0), q1=(low1,high1)
 *   shell=[q0.low-q0.high, q1.low-q1.high, q1.low, q1.high]
 *
 * @param {number} startState
 */
function exactSerializer(startState) {
  const token0 = table[startState];
  const state1 = low60(token0);
  const token1 = table[state1];
  const q0 = {
    high: mod29(high60(token0)),
    low: mod29(low60(token0)),
  };
  const q1 = {
    high: mod29(high60(token1)),
    low: mod29(low60(token1)),
  };
  const shell = [
    mod29(q0.low - q0.high),
    mod29(q1.low - q1.high),
    q1.low,
    q1.high,
  ];
  const key = hInverseShell(shell);
  const receiver = decodeToken(token1, alphabet60);
  return { startState, token0, state1, token1, q0, q1, shell, key, receiver };
}

const selectedSerializer = exactSerializer(selectedAddress);
assert.deepEqual(selectedSerializer.shell, [25, 22, 24, 2]);
assert.deepEqual(selectedSerializer.key, [9, 13, 18, 13]);
assert.equal(selectedSerializer.receiver, 173);

assert.deepEqual(
  selectedSerializer.key.map((index) => sourceWords[index].label),
  ["LIBER", "WAY", "MAP", "WAY"]
);

const pathsPlain = p0Runes
  .slice(pathsReceiver, pathsReceiver + 4)
  .map((value, index) => mod29(value - selectedSerializer.key[index]));

assert.deepEqual(pathsPlain, [13, 24, 2, 15]);
assert.equal(pathsPlain.map((value) => corpus.translit[value]).join(""), "PATHS");
assert.deepEqual(
  pathsPlain.map((value, index) =>
    mod29(value + selectedSerializer.key[index])
  ),
  p0Runes.slice(pathsReceiver, pathsReceiver + 4)
);

const distinctFourRuneTargets = [
  ...new Map(sourceWords
    .filter((word) => word.values.length === 4)
    .map((word) => [word.label, word.values]))
    .entries(),
].map(([label, values]) => ({ label, values }));

assert.deepEqual(
  distinctFourRuneTargets.map((target) => target.label),
  ["LIES", "THEIR", "MEANING", "ROAD", "SEEK", "WILL", "GOOD", "LUCK", "PATHS"]
);

/** @param {{high:number,low:number}} q @param {string} name */
function scalar(q, name) {
  if (name === "high") return q.high;
  if (name === "low") return q.low;
  if (name === "diff") return mod29(q.low - q.high);
  assert.equal(name, "sum");
  return mod29(q.low + q.high);
}

/** @param {{high:number,low:number}} q */
function pairForms(q) {
  return {
    highLow: [q.high, q.low],
    lowHigh: [q.low, q.high],
    HhighLow: H(q.high, q.low),
    HlowHigh: H(q.low, q.high),
  };
}

const q0 = selectedSerializer.q0;
const q1 = selectedSerializer.q1;
const scalarNames = ["high", "low", "diff", "sum"];
const serializerHits = [];
const serializedShells = [];

for (const [first, second, tokenOrder] of [
  [q0, q1, "forward"],
  [q1, q0, "reverse"],
]) {
  for (const scalar0 of scalarNames) {
    for (const scalar1 of scalarNames) {
      for (const [pairSource, pairQ] of [["first", q0], ["second", q1]]) {
        for (const [pairForm, pair] of Object.entries(pairForms(pairQ))) {
          const shell = [
            scalar(first, scalar0),
            scalar(second, scalar1),
            ...pair,
          ];
          serializedShells.push(shell.join(","));
          const key = hInverseShell(shell);

          for (const sign of [-1, 1]) {
            const output = p0Runes
              .slice(pathsReceiver, pathsReceiver + 4)
              .map((value, index) => mod29(value + sign * key[index]));

            for (const target of distinctFourRuneTargets) {
              if (output.every((value, index) => value === target.values[index])) {
                serializerHits.push({
                  tokenOrder,
                  scalar0,
                  scalar1,
                  pairSource,
                  pairForm,
                  shell,
                  key,
                  sign,
                  target: target.label,
                });
              }
            }
          }
        }
      }
    }
  }
}

assert.equal(serializedShells.length, 256);
assert.equal(new Set(serializedShells).size, 248);
assert.deepEqual(serializerHits, [{
  tokenOrder: "forward",
  scalar0: "diff",
  scalar1: "diff",
  pairSource: "second",
  pairForm: "lowHigh",
  shell: [25, 22, 24, 2],
  key: [9, 13, 18, 13],
  sign: -1,
  target: "PATHS",
}]);

const exactSerializerGlobalHits = [];

for (let startState = 0; startState < 256; startState += 1) {
  const candidate = exactSerializer(startState);
  if (
    candidate.receiver === null ||
    candidate.receiver < 0 ||
    candidate.receiver + 4 > p0Runes.length
  ) {
    continue;
  }

  for (const sign of [-1, 1]) {
    const output = p0Runes
      .slice(candidate.receiver, candidate.receiver + 4)
      .map((value, index) => mod29(value + sign * candidate.key[index]));

    for (const target of distinctFourRuneTargets) {
      if (output.every((value, index) => value === target.values[index])) {
        exactSerializerGlobalHits.push({
          startState,
          token0: candidate.token0,
          state1: candidate.state1,
          token1: candidate.token1,
          receiver: candidate.receiver,
          shell: candidate.shell,
          key: candidate.key,
          sign,
          target: target.label,
        });
      }
    }
  }
}

assert.deepEqual(
  exactSerializerGlobalHits.map((hit) => hit.startState),
  [52, 122, 130]
);
for (const hit of exactSerializerGlobalHits) {
  assert.equal(hit.token0, "1Q");
  assert.equal(hit.state1, 26);
  assert.equal(hit.token1, "2r");
  assert.equal(hit.receiver, 173);
  assert.deepEqual(hit.shell, [25, 22, 24, 2]);
  assert.deepEqual(hit.key, [9, 13, 18, 13]);
  assert.equal(hit.sign, -1);
  assert.equal(hit.target, "PATHS");
}

const rivalSerializer = exactSerializer(rivalAddress);
assert.deepEqual(rivalSerializer.shell, [25, 5, 7, 2]);
assert.deepEqual(rivalSerializer.key, [15, 19, 12, 19]);
assert.equal(rivalSerializer.receiver, 156);

function targetLabels(output) {
  return distinctFourRuneTargets
    .filter((target) =>
      output.length === 4 &&
      output.every((value, index) => value === target.values[index])
    )
    .map((target) => target.label);
}

const rivalOutput = p0Runes
  .slice(rivalSerializer.receiver, rivalSerializer.receiver + 4)
  .map((value, index) => mod29(value - rivalSerializer.key[index]));
assert.deepEqual(targetLabels(rivalOutput), []);

const frozenContinuation = [];
let continuationState = selectedAddress;

for (let step = 0; step < 5; step += 1) {
  const candidate = exactSerializer(continuationState);
  const segment =
    candidate.receiver !== null &&
    candidate.receiver >= 0 &&
    candidate.receiver + 4 <= p0Runes.length
      ? p0Runes.slice(candidate.receiver, candidate.receiver + 4)
      : [];

  const output = segment.length === 4
    ? segment.map((value, index) => mod29(value - candidate.key[index]))
    : [];

  frozenContinuation.push({
    startState: continuationState,
    token0: candidate.token0,
    state1: candidate.state1,
    token1: candidate.token1,
    receiver: candidate.receiver,
    shell: candidate.shell,
    key: candidate.key,
    labels: targetLabels(output),
  });

  continuationState = low60(candidate.token0);
}

assert.deepEqual(
  frozenContinuation.map((item) => item.labels),
  [["PATHS"], [], [], [], []]
);

const labelsByGp0 = new Map();
for (const word of sourceWords) {
  const labels = labelsByGp0.get(word.gp0) || [];
  if (!labels.includes(word.label)) labels.push(word.label);
  labelsByGp0.set(word.gp0, labels);
}

/**
 * @param {number} state
 * @param {{radix:number,component:string,addressOrigin:number,digitOrigin:number}} mode
 */
function transition(state, mode) {
  const index = state - mode.addressOrigin;
  if (index < 0 || index >= table.length) return null;
  const token = table[index];
  const alphabet = mode.radix === 60 ? alphabet60 : alphabet59;
  const char = mode.component === "low" ? token[1] : token[0];
  const digit = alphabet.indexOf(char);
  if (digit < 0) return null;
  return digit + mode.digitOrigin;
}

/**
 * @param {number} start
 * @param {{radix:number,component:string,addressOrigin:number,digitOrigin:number}} mode
 */
function walk(start, mode) {
  const seen = new Set();
  const sequence = [];
  let state = start;

  for (let step = 0; step < 100 && !seen.has(state); step += 1) {
    seen.add(state);
    state = transition(state, mode);
    if (state === null) break;
    sequence.push(state);
  }
  return sequence;
}

function firstVocabularyHit(sequence) {
  for (let index = 0; index < sequence.length; index += 1) {
    const labels = labelsByGp0.get(sequence[index]);
    if (labels) return { state: sequence[index], index, labels };
  }
  return null;
}

const transitionFamily = [];
for (const radix of [60, 59]) {
  for (const component of ["low", "high"]) {
    for (const addressOrigin of [0, 1]) {
      for (const digitOrigin of [0, 1]) {
        const mode = { radix, component, addressOrigin, digitOrigin };
        const selectedWalk = walk(selectedAddress, mode);
        const rivalWalk = walk(rivalAddress, mode);
        const selectedFirst = firstVocabularyHit(selectedWalk);
        const rivalFalseCycle =
          rivalWalk.length >= 3 &&
          rivalWalk[0] === 54 &&
          rivalWalk[1] === 36 &&
          rivalWalk[2] === 54;
        transitionFamily.push({
          mode,
          selectedWalk,
          rivalWalk,
          selectedFirst,
          rivalFalseCycle,
          survives:
            selectedFirst !== null &&
            selectedFirst.state === 59 &&
            rivalFalseCycle,
        });
      }
    }
  }
}

assert.equal(transitionFamily.length, 16);
const survivingTransitions = transitionFamily.filter((item) => item.survives);
assert.deepEqual(survivingTransitions.map((item) => item.mode), [{
  radix: 60,
  component: "low",
  addressOrigin: 0,
  digitOrigin: 0,
}]);

const canonicalMode = survivingTransitions[0].mode;
assert.deepEqual(walk(selectedAddress, canonicalMode), [26, 53, 51, 59, 9, 9]);
assert.deepEqual(walk(rivalAddress, canonicalMode), [54, 36, 54]);
assert.deepEqual(firstVocabularyHit(walk(selectedAddress, canonicalMode)), {
  state: 59,
  index: 3,
  labels: ["VERIFY"],
});
assert.deepEqual(labelsByGp0.get(54), ["ROAD", "PATHS"]);
assert.deepEqual(labelsByGp0.get(36), ["FOUND"]);

let eventualVerify = 0;
let firstVerify = 0;
for (let startState = 0; startState < 256; startState += 1) {
  const sequence = walk(startState, canonicalMode);
  if (sequence.includes(59)) eventualVerify += 1;
  const first = firstVocabularyHit(sequence);
  if (first && first.state === 59) firstVerify += 1;
}
assert.equal(eventualVerify, 190);
assert.equal(firstVerify, 79);

function reflectHorizontal(address) {
  const row = Math.floor(address / 8);
  const column = address % 8;
  return row * 8 + (7 - column);
}

const distinctSourceWords = [
  ...new Map(sourceWords.map((word) => [word.label, word])).values(),
];
const primaryValues = new Set(Object.values(primaryDh));
const reflectionInvariants = [];

for (const word of distinctSourceWords) {
  if (word.gp0 < 0 || word.gp0 >= 256) continue;
  const token = table[word.gp0];
  if (!/^\d{2}$/.test(token)) continue;
  const literal = Number(token);
  if (!primaryValues.has(literal)) continue;

  const reflectedAddress = reflectHorizontal(word.gp0);
  const reflectedToken = table[reflectedAddress];
  const base60 = mod29(decodeToken(reflectedToken, alphabet60));
  const base59Raw = decodeToken(reflectedToken, alphabet59);
  const base59 = base59Raw === null ? null : mod29(base59Raw);

  if (base60 === literal && base59 !== literal) {
    reflectionInvariants.push({
      word: word.label,
      gp0: word.gp0,
      token,
      literal,
      reflectedAddress,
      reflectedToken,
      base60,
      base59,
    });
  }
}

assert.deepEqual(reflectionInvariants, [{
  word: "VERIFY",
  gp0: 59,
  token: "19",
  literal: 19,
  reflectedAddress: 60,
  reflectedToken: "1k",
  base60: 19,
  base59: 17,
}]);

assert.equal(table[59], "19");
assert.equal(Number(table[59]), primaryDh.B);

const primaryEntries = Object.entries(primaryDh);
const dualWordHits = [];

for (const [xName, x] of primaryEntries) {
  for (const [yName, y] of primaryEntries) {
    const gpState = low60(table[x]);
    const indexState = low60(table[y]);

    const matches = sourceWords.filter((word) =>
      word.gp0 === gpState && word.index === indexState
    );

    if (matches.length > 0) {
      dualWordHits.push({
        xName,
        x,
        yName,
        y,
        gpState,
        indexState,
        labels: matches.map((word) => word.label),
      });
    }
  }
}

assert.deepEqual(dualWordHits, [{
  xName: "g",
  x: 5,
  yName: "B",
  y: 19,
  gpState: 57,
  indexState: 33,
  labels: ["WILL"],
}]);

console.log(JSON.stringify({
  status: "PASS",
  upstream: {
    selectedP0Words: [
      { ordinal: 42, start: 189, sumMod29: 15 },
      { ordinal: 43, start: 192, sumMod29: 2 },
    ],
    selectedState,
    dhOuterPairs,
    selectedCoordinate: [15, 2],
    selectedAddress,
    selectedToken: table[selectedAddress],
    firstLowDigit: numbersState,
    firstLowDigitSourceWord: sourceWords[numbersState].label,
  },
  paths: {
    secondToken: numbersToken,
    receiver: pathsReceiver,
    shell: selectedSerializer.shell,
    key: selectedSerializer.key,
    plaintext: "PATHS",
    keyWordPositions: selectedSerializer.key.map((index) => sourceWords[index].label),
    serializerFamily: {
      labeledSerializers: serializedShells.length,
      distinctShells: new Set(serializedShells).size,
      hits: serializerHits,
    },
    globalExactSerializerAliases: exactSerializerGlobalHits,
    frozenContinuation,
  },
  branchControl: {
    rivalCoordinate: [14, 4],
    rivalAddress,
    rivalToken: table[rivalAddress],
    rivalReceiver,
    transitionFamilySurvivors: survivingTransitions.map((item) => item.mode),
    selectedWalk: walk(selectedAddress, canonicalMode),
    rivalWalk: walk(rivalAddress, canonicalMode),
    eventualVerify,
    firstVerify,
  },
  verifyAndWill: {
    reflectionInvariants,
    dualWordHits,
  },
  classification:
    "Source-selected navigation plus a retrospective but family-charged local PATHS key mechanism. The exact serializer does not transfer to later walk pairs and is not a common warning-packet scheduler.",
}, null, 2));
