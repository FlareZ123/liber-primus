"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number[]} values @returns {number[]} */
function h5(values) {
  assert.equal(values.length, 5);
  return [
    mod29(values[0] - values[4]),
    mod29(values[1] - values[3]),
    values[2],
    mod29(values[1] + values[3]),
    mod29(values[0] + values[4]),
  ];
}

/** @param {number[]} values @returns {number[]} */
function hShell(values) {
  const differences = [];
  const sums = [];
  for (
    let left = 0, right = values.length - 1;
    left < right;
    left += 1, right -= 1
  ) {
    differences.push(mod29(values[left] - values[right]));
    sums.unshift(mod29(values[left] + values[right]));
  }
  const center = values.length % 2
    ? [values[Math.floor(values.length / 2)]]
    : [];
  return differences.concat(center, sums);
}

/** @param {number[]} values @returns {number[][]} */
function uniquePermutations(values) {
  const output = new Map();

  /** @param {number[]} prefix @param {number[]} rest */
  function visit(prefix, rest) {
    if (!rest.length) {
      output.set(prefix.join(","), prefix.slice());
      return;
    }
    for (let index = 0; index < rest.length; index += 1) {
      visit(
        prefix.concat(rest[index]),
        rest.slice(0, index).concat(rest.slice(index + 1))
      );
    }
  }

  visit([], values);
  return [...output.values()];
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signedText = read("resources/historical/cicada2016-4gq25-outguess.asc");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);

/** @param {string} word @returns {number[]} */
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

    const token = gpTokens.find((candidate) =>
      normalized.startsWith(candidate.symbol, offset)
    );
    assert.ok(token, "unmapped GP spelling: " + normalized.slice(offset));
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}

const clear = signedText.split("-----BEGIN PGP SIGNATURE-----")[0];
const source = clear
  .slice(clear.indexOf("Hello."))
  .split(/[^A-Za-z0-9]+/u)
  .filter((token) => /^[A-Za-z]+$/u.test(token))
  .map((word, index) => {
    const values = gp(word);
    return {
      index,
      word: word.toUpperCase(),
      values,
      length: values.length,
    };
  });

assert.equal(source[29].word, "DIRECTION");
assert.deepEqual(source.slice(30).map((row) => row.word), [
  "SEEK", "AND", "YOU", "WILL", "BE", "FOUND", "GOOD",
  "LUCK", "BEWARE", "FALSE", "PATHS", "VERIFY", "OPENPGP",
]);

const state = Object.freeze({
  q: 4,
  K: 2,
  e: 3,
  g: 5,
  a: 6,
  p: 23,
  b: 15,
  A: 8,
  B: 19,
  F: 0,
});

// Parse complete page-local printed groups and retain one-based local ordinals.
const parts = transcription.split(/^\s*%\s*$/m).slice(0, 55);
const words = [];
let current = [];
let startPage = -1;
let endPage = -1;
let startOffset = -1;

/** Flush one printed group. */
function flush() {
  if (!current.length) return;
  words.push({
    page: startPage,
    endPage,
    start: startOffset,
    values: current.slice(),
  });
  current = [];
}

for (let block = 0; block < parts.length; block += 1) {
  const page = block >= 50 ? block + 1 : block;
  let offset = 0;
  for (const char of parts[block]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      if (!current.length) {
        startPage = page;
        startOffset = offset;
      }
      endPage = page;
      current.push(value);
      offset += 1;
    } else if (!/[\s/]/u.test(char)) {
      flush();
    }
  }
}
flush();

const canonical = words.filter((word) => word.page === word.endPage);

/** @param {number} page @returns {{page:number,endPage:number,start:number,values:number[]}[]} */
function localWords(page) {
  return canonical.filter((word) => word.page === page);
}

// The 13-unit operation-mode schedule was already established independently:
// direct K-prefix, direct q block, q-center singleton, direct q block,
// F-marker terminal K block. P35 is the existing adjacent 2+3 packet class.
const establishedOrdinals = new Map([
  [30, 27],
  [31, 32],
  [32, 6],
  [33, 35],
  [34, 2],
  [35, 7],
  [36, 36],
  [37, 38],
  [38, 12],
  [39, 30],
  [40, 17],
  [41, 42],
  [42, 45],
]);

const V = source[41].values[0]; // VERIFY.first = a-g = 1
const O = source[42].values[0]; // OPENPGP.first = e = 3
const L = source[37].values[0]; // LUCK.first = qg = 20
const G = source[36].values[0]; // GOOD.first = a = 6

assert.deepEqual({ V, O, L, G }, {
  V: mod29(state.a - state.g),
  O: state.e,
  L: mod29(state.q * state.g),
  G: state.a,
});

// Symbolic delta scheduler over [K,q,1,q,K] source blocks.
const delta = [
  mod29(-O), V,
  O, state.K, mod29(-O), V,
  state.F,
  V, O, L, G,
  V, O,
];
assert.deepEqual(delta, [
  26, 1, 3, 2, 26, 1, 0, 1, 3, 20, 6, 1, 3,
]);

// The same DIRECTION=29 fold used by the source-tail selector maps zero-based
// source indices30..42 to residues1..13.
assert.deepEqual(
  source.slice(30).map((row) => mod29(row.index)),
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
);

// The delta stream itself has an unusually compact symmetric state shell.
const deltaShell = hShell(delta);
assert.deepEqual(deltaShell, [
  state.p,
  state.F,
  state.F,
  state.K,
  mod29(-state.e),
  mod29(-state.q * state.g),
  mod29(state.b - state.q),
  mod29(-(state.K + state.g)),
  state.p,
  state.F,
  state.F,
  state.K,
  state.F,
]);
assert.deepEqual(deltaShell, [
  23, 0, 0, 2, 26, 9, 11, 22, 23, 0, 0, 2, 0,
]);

// P35's independently established adjacent 2+3 state packet selector.
const p35PacketShell = [
  state.A,
  mod29(state.p - 1),
  state.B,
  mod29(state.K * state.a),
  mod29(state.a - state.g),
];
assert.deepEqual(p35PacketShell, [8, 22, 19, 12, 1]);

/**
 * Apply the already established operation class after an ordinal residue has
 * been predicted. This function reads structure only; it does not compare
 * ciphertext output to an authenticated target.
 *
 * @param {number} page
 * @param {number} residue
 * @returns {{ordinal:number,start:number,values:number[]}[]}
 */
function structuralCandidates(page, residue) {
  const sourceWord = source[page];
  const local = localWords(page);

  return local
    .map((word, index) => ({
      word,
      ordinal: index + 1,
    }))
    .filter((entry) => mod29(entry.ordinal) === residue)
    .filter((entry) => {
      if (page === 35) {
        const next = local[entry.ordinal];
        return (
          entry.word.values.length === 2 &&
          next?.values.length === 3 &&
          h5(entry.word.values.concat(next.values)).join(",") ===
            p35PacketShell.join(",")
        );
      }

      if (page === 36) {
        return (
          entry.word.values.length === sourceWord.length + 1 &&
          entry.word.values[Math.floor(entry.word.values.length / 2)] ===
            state.q
        );
      }

      if (page === 41) {
        return (
          entry.word.values.length === sourceWord.length + 1 &&
          entry.word.values[Math.floor(entry.word.values.length / 2)] ===
            state.F
        );
      }

      if (page === 42) {
        return (
          entry.word.values.length === sourceWord.length + 1 &&
          entry.word.values[1] === state.F
        );
      }

      return entry.word.values.length === sourceWord.length;
    })
    .map((entry) => ({
      ordinal: entry.ordinal,
      start: entry.word.start,
      values: entry.word.values,
    }));
}

/**
 * @param {number[]} candidateDelta
 * @returns {{
 *   score:number,
 *   rows:{page:number,word:string,folded:number,delta:number,residue:number,candidates:{ordinal:number,start:number,values:number[]}[],expected:number,match:boolean}[]
 * }}
 */
function evaluate(candidateDelta) {
  assert.equal(candidateDelta.length, 13);
  const rows = [];

  for (let offset = 0; offset < 13; offset += 1) {
    const page = 30 + offset;
    const folded = mod29(page);
    const residue = mod29(folded + candidateDelta[offset]);
    const candidates = structuralCandidates(page, residue);
    const expected = establishedOrdinals.get(page);
    const match =
      candidates.length === 1 &&
      candidates[0].ordinal === expected;

    rows.push({
      page,
      word: source[page].word,
      folded,
      delta: candidateDelta[offset],
      residue,
      candidates,
      expected,
      match,
    });
  }

  return {
    score: rows.filter((row) => row.match).length,
    rows,
  };
}

const exact = evaluate(delta);
assert.equal(exact.score, 13);
assert.deepEqual(
  exact.rows.map((row) => row.candidates[0].ordinal),
  [...establishedOrdinals.values()]
);

// Charge ordering freedom while keeping the source-derived atom multisets
// fixed inside the physically selected [K,q,1,q,K] blocks.
const blockFamilies = [
  uniquePermutations([mod29(-O), V]),
  uniquePermutations([O, state.K, mod29(-O), V]),
  [[state.F]],
  uniquePermutations([V, O, L, G]),
  uniquePermutations([V, O]),
];
assert.deepEqual(blockFamilies.map((family) => family.length), [2, 24, 1, 24, 2]);

let configurations = 0;
const scoreHistogram = {};
const winners = [];

for (const prefix of blockFamilies[0]) {
  for (const block1 of blockFamilies[1]) {
    for (const block3 of blockFamilies[3]) {
      for (const terminal of blockFamilies[4]) {
        configurations += 1;
        const candidate = [
          ...prefix,
          ...block1,
          state.F,
          ...block3,
          ...terminal,
        ];
        const evaluation = evaluate(candidate);
        scoreHistogram[evaluation.score] =
          (scoreHistogram[evaluation.score] || 0) + 1;

        if (evaluation.score === 13) {
          winners.push({
            delta: candidate,
            rows: evaluation.rows,
          });
        }
      }
    }
  }
}

assert.equal(configurations, 2304);
assert.deepEqual(scoreHistogram, {
  1: 81,
  2: 144,
  3: 334,
  4: 384,
  5: 479,
  6: 352,
  7: 292,
  8: 128,
  9: 79,
  10: 16,
  11: 14,
  13: 1,
});
assert.equal(winners.length, 1);
assert.deepEqual(winners[0].delta, delta);

const result = {
  status: "PASS",
  classification:
    "retrospectively recognized but target-independent ordered receiver-ordinal serializer over the source-selected p30-p42 object",
  sourceAtoms: {
    V: { word: "VERIFY", first: V, role: "a-g" },
    O: { word: "OPENPGP", first: O, role: "e" },
    L: { word: "LUCK", first: L, role: "qg" },
    G: { word: "GOOD", first: G, role: "a" },
    K: state.K,
    F: state.F,
  },
  schedule: {
    blockWidths: [state.K, state.q, 1, state.q, state.K],
    symbolic:
      "[-O,V | O,K,-O,V | F | V,O,L,G | V,O]",
    delta,
    H13: deltaShell,
    H13Labels: [
      "p", "F",
      "F", "K",
      "-e", "-qg",
      "b-q", "-(K+g)",
      "p", "F",
      "F", "K",
      "F",
    ],
  },
  exactSelection: exact.rows,
  charge: {
    blockFamilySizes: blockFamilies.map((family) => family.length),
    configurations,
    scoreHistogram,
    completeHits: winners.length,
    winner: winners[0],
    note:
      "finite post-discovery ordering charge; atom multisets and operation modes were already known",
  },
};

const output = JSON.stringify(result, null, 2);
console.log(output);
const artifact = path.join(
  process.env.RUNNER_TEMP || process.env.TEMP || __dirname,
  "source-test-output.json"
);
fs.writeFileSync(artifact, output + "\n", "utf8");
