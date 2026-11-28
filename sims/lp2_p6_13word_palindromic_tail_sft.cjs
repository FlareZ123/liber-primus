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
    mod29(values[0] + values[4]),
    mod29(values[1] - values[3]),
    mod29(values[1] + values[3]),
    values[2],
  ];
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

/** @param {number[]} values @returns {string} */
function multisetKey(values) {
  return values.slice().sort((left, right) => left - right).join(",");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const signedText = read("resources/historical/cicada2016-4gq25-outguess.asc");
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));

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
assert.match(
  clear,
  /numbers are the direction\.\s+Seek and you will be found\./iu
);

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
      gp0: mod29(values.reduce((sum, value) => sum + value, 0)),
    };
  });

assert.equal(source.length, 43);
assert.equal(source[29].word, "DIRECTION");
assert.deepEqual(source.slice(30).map((row) => row.word), [
  "SEEK", "AND", "YOU", "WILL", "BE", "FOUND", "GOOD",
  "LUCK", "BEWARE", "FALSE", "PATHS", "VERIFY", "OPENPGP",
]);

// Existing p6/DH state.
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
const qg = mod29(state.q * state.g);
assert.equal(qg, 20);

// Physical p6 boundary object.
const p6Ink = ink.pages.find((page) => page.page === 6);
assert.ok(p6Ink);
assert.deepEqual(p6Ink.red_spans.map((span) => [span.start, span.length]), [
  [71, 11],
]);
assert.deepEqual(p6Ink.large_punctuation, [
  [71, 13, "red"],
  [82, 13, "red"],
]);
assert.equal(p6Ink.red_spans[0].length + state.K, 13);
assert.equal(source.slice(32).length, p6Ink.red_spans[0].length);
assert.equal(source.slice(30).length, 13);

// Prepending the omitted K=2 source words to the existing p6 [q,1,q,K]
// selector yields a palindromic five-block schedule over the full signed tail.
const schedule = [state.K, state.q, 1, state.q, state.K];
assert.deepEqual(schedule, [2, 4, 1, 4, 2]);
assert.deepEqual(schedule, schedule.slice().reverse());
assert.equal(schedule.reduce((sum, value) => sum + value, 0), 13);

const schedulePermutations = uniquePermutations(schedule);
assert.equal(schedulePermutations.length, 30);

/**
 * @param {number} start
 * @param {number[]} layout
 * @returns {{
 *   lengthSums:number[],
 *   gp0Sums:number[],
 *   lengthShell:number[],
 *   gp0Shell:number[]
 * }}
 */
function summarize(start, layout) {
  let cursor = start;
  const lengthSums = [];
  const gp0Sums = [];

  for (const width of layout) {
    const block = source.slice(cursor, cursor + width);
    cursor += width;
    lengthSums.push(
      mod29(block.reduce((sum, row) => sum + row.length, 0))
    );
    gp0Sums.push(
      mod29(block.reduce((sum, row) => sum + row.gp0, 0))
    );
  }

  return {
    lengthSums,
    gp0Sums,
    lengthShell: h5(lengthSums),
    gp0Shell: h5(gp0Sums),
  };
}

const tail = summarize(30, schedule);
assert.deepEqual(tail.lengthSums, [
  mod29(state.g + state.K),
  mod29(-state.b),
  state.q,
  state.B,
  mod29(state.b - state.K),
]);
assert.deepEqual(tail.lengthSums, [7, 14, 4, 19, 13]);
assert.deepEqual(tail.lengthShell, [
  state.p,
  qg,
  mod29(-state.g),
  state.q,
  state.q,
]);
assert.deepEqual(tail.lengthShell, [23, 20, 24, 4, 4]);

assert.deepEqual(tail.gp0Sums, [25, 13, 6, 18, 18]);
assert.deepEqual(tail.gp0Shell, [
  mod29(state.g + state.K),
  mod29(-state.b),
  mod29(-state.g),
  state.K,
  state.a,
]);
assert.deepEqual(tail.gp0Shell, [7, 14, 24, 2, 6]);

// The 13 source-word initials also form a complete outside-in state packet.
// This uses the same frozen H orientation as the manuscript-side H shells.
const tailInitials = source.slice(30).map((row) => row.values[0]);
assert.deepEqual(tailInitials, [
  state.b,
  mod29(-state.g),
  mod29(-state.e),
  mod29(state.K + state.g),
  mod29(state.K + state.b),
  state.F,
  state.a,
  qg,
  mod29(state.K + state.b),
  state.F,
  mod29(state.b - state.K),
  mod29(state.a - state.g),
  state.e,
]);

/** @param {number[]} values @returns {number[]} */
function hShell(values) {
  const output = [];
  for (
    let left = 0, right = values.length - 1;
    left < right;
    left += 1, right -= 1
  ) {
    output.push(
      mod29(values[left] - values[right]),
      mod29(values[left] + values[right])
    );
  }
  if (values.length % 2) {
    output.push(values[Math.floor(values.length / 2)]);
  }
  return output;
}

const tailInitialShell = hShell(tailInitials);
assert.deepEqual(tailInitialShell, [
  mod29(state.a * state.K),
  mod29(state.B - 1),
  state.p,
  mod29(state.p + state.K),
  mod29(state.b - state.K),
  mod29(state.K * state.g),
  mod29(state.K + state.g),
  mod29(state.K + state.g),
  state.F,
  state.g,
  mod29(-state.q * state.g),
  qg,
  state.a,
]);
assert.deepEqual(tailInitialShell, [
  12, 18, 23, 25, 13, 10, 7, 7, 0, 5, 9, 20, 6,
]);

const initialShellExactHits = [];
const initialShellMultisetHits = [];
for (let start = 0; start <= source.length - 13; start += 1) {
  const rows = source.slice(start, start + 13);
  const firsts = rows.map((row) => row.values[0]);
  const shell = hShell(firsts);
  const candidate = {
    start,
    words: rows.map((row) => row.word),
    firsts,
    shell,
  };
  if (shell.join(",") === tailInitialShell.join(",")) {
    initialShellExactHits.push(candidate);
  }
  if (multisetKey(shell) === multisetKey(tailInitialShell)) {
    initialShellMultisetHits.push(candidate);
  }
}
assert.deepEqual(initialShellExactHits.map((row) => row.start), [30]);
assert.deepEqual(initialShellMultisetHits.map((row) => row.start), [30]);

// Two more word-resolution channels use the same 13-unit fold.
const tailLengths = source.slice(30).map((row) => row.length);
const tailGp0 = source.slice(30).map((row) => row.gp0);
const tailLengthShell = hShell(tailLengths);
const tailGp0Shell = hShell(tailGp0);

assert.deepEqual(tailLengthShell, [
  mod29(-state.e),
  mod29(state.b - state.q),
  mod29(-state.e),
  mod29(-state.q * state.g),
  mod29(-1),
  mod29(state.K + state.g),
  mod29(-1),
  mod29(-state.q * state.g),
  mod29(-state.q),
  state.A,
  mod29(state.a - state.g),
  mod29(-state.q * state.g),
  state.q,
]);
assert.deepEqual(tailLengthShell, [
  26, 11, 26, 9, 28, 7, 28, 9, 25, 8, 1, 9, 4,
]);

assert.deepEqual(tailGp0Shell, [
  mod29(state.K * state.g),
  state.b,
  mod29(-state.e),
  mod29(-1),
  state.g,
  mod29(-state.e),
  mod29(-state.q * state.g),
  mod29(state.B - 1),
  state.g,
  mod29(state.K + state.g),
  state.g,
  mod29(-state.q * state.g),
  state.a,
]);
assert.deepEqual(tailGp0Shell, [
  10, 15, 26, 28, 5, 26, 9, 18, 5, 7, 5, 9, 6,
]);

const wordResolutionHits = {
  initialExact: [],
  initialMultiset: [],
  lengthExact: [],
  lengthMultiset: [],
  gp0Exact: [],
  gp0Multiset: [],
  jointExact: [],
  jointMultiset: [],
};

for (let start = 0; start <= source.length - 13; start += 1) {
  const rows = source.slice(start, start + 13);
  const shells = {
    initial: hShell(rows.map((row) => row.values[0])),
    length: hShell(rows.map((row) => row.length)),
    gp0: hShell(rows.map((row) => row.gp0)),
  };
  const exact = {
    initial: shells.initial.join(",") === tailInitialShell.join(","),
    length: shells.length.join(",") === tailLengthShell.join(","),
    gp0: shells.gp0.join(",") === tailGp0Shell.join(","),
  };
  const multiset = {
    initial: multisetKey(shells.initial) === multisetKey(tailInitialShell),
    length: multisetKey(shells.length) === multisetKey(tailLengthShell),
    gp0: multisetKey(shells.gp0) === multisetKey(tailGp0Shell),
  };

  if (exact.initial) wordResolutionHits.initialExact.push(start);
  if (multiset.initial) wordResolutionHits.initialMultiset.push(start);
  if (exact.length) wordResolutionHits.lengthExact.push(start);
  if (multiset.length) wordResolutionHits.lengthMultiset.push(start);
  if (exact.gp0) wordResolutionHits.gp0Exact.push(start);
  if (multiset.gp0) wordResolutionHits.gp0Multiset.push(start);
  if (exact.initial && exact.length && exact.gp0) {
    wordResolutionHits.jointExact.push(start);
  }
  if (multiset.initial && multiset.length && multiset.gp0) {
    wordResolutionHits.jointMultiset.push(start);
  }
}

for (const hits of Object.values(wordResolutionHits)) {
  assert.deepEqual(hits, [30]);
}

// Charge every 13-word source window and every distinct permutation of the
// [K,q,1,q,K] widths. Both exact H5 state shells must hold simultaneously.
const exactLengthHits = [];
const exactGp0Hits = [];
const exactJointHits = [];
const multisetLengthHits = [];
const multisetGp0Hits = [];
const multisetJointHits = [];
let configurations = 0;

const targetLengthShell = tail.lengthShell;
const targetGp0Shell = tail.gp0Shell;
const targetLengthMultiset = multisetKey(targetLengthShell);
const targetGp0Multiset = multisetKey(targetGp0Shell);

for (let start = 0; start <= source.length - 13; start += 1) {
  for (const layout of schedulePermutations) {
    configurations += 1;
    const summary = summarize(start, layout);
    const row = {
      start,
      layout,
      lengthSums: summary.lengthSums,
      gp0Sums: summary.gp0Sums,
      lengthShell: summary.lengthShell,
      gp0Shell: summary.gp0Shell,
      words: source.slice(start, start + 13).map((entry) => entry.word),
    };

    const exactLength =
      summary.lengthShell.join(",") === targetLengthShell.join(",");
    const exactGp0 =
      summary.gp0Shell.join(",") === targetGp0Shell.join(",");
    const multisetLength =
      multisetKey(summary.lengthShell) === targetLengthMultiset;
    const multisetGp0 =
      multisetKey(summary.gp0Shell) === targetGp0Multiset;

    if (exactLength) exactLengthHits.push(row);
    if (exactGp0) exactGp0Hits.push(row);
    if (exactLength && exactGp0) exactJointHits.push(row);

    if (multisetLength) multisetLengthHits.push(row);
    if (multisetGp0) multisetGp0Hits.push(row);
    if (multisetLength && multisetGp0) multisetJointHits.push(row);
  }
}

assert.equal(configurations, 31 * 30);
assert.equal(configurations, 930);

assert.equal(exactLengthHits.length, 1);
assert.equal(exactGp0Hits.length, 2);
assert.equal(exactJointHits.length, 1);
assert.equal(multisetLengthHits.length, 1);
assert.equal(multisetGp0Hits.length, 2);
assert.equal(multisetJointHits.length, 1);

const winner = exactJointHits[0];
assert.equal(winner.start, 30);
assert.deepEqual(winner.layout, schedule);
assert.deepEqual(winner.words, source.slice(30).map((entry) => entry.word));
assert.deepEqual(multisetJointHits[0], winner);

const result = {
  status: "PASS",
  classification:
    "source-only p6 11-inside-13 palindromic tail selector; finite post-discovery charge, not an unknown-plaintext decryption",
  physicalBoundary: {
    redSpan: p6Ink.red_spans[0],
    boundaryMarks: p6Ink.large_punctuation,
    K: state.K,
    identity: "11 red runes + K=2 = 13 dots = 13 post-DIRECTION alphabetic words",
  },
  sourceTail: {
    sentenceBoundaryAfter: source[29].word,
    start: 30,
    words: source.slice(30).map((entry) => entry.word),
    schedule,
    palindromic: true,
    blockLengthSums: tail.lengthSums,
    blockLengthH5: tail.lengthShell,
    blockGp0Sums: tail.gp0Sums,
    blockGp0H5: tail.gp0Shell,
  },
  symmetricInitialPacket: {
    initials: tailInitials,
    H13: tailInitialShell,
    labels: [
      "aK", "B-1",
      "p", "p+K",
      "b-K", "Kg",
      "K+g", "K+g",
      "F", "g",
      "-qg", "qg",
      "a",
    ],
    pairReadout: [
      ["SEEK", "OPENPGP", [tailInitialShell[0], tailInitialShell[1]]],
      ["AND", "VERIFY", [tailInitialShell[2], tailInitialShell[3]]],
      ["YOU", "PATHS", [tailInitialShell[4], tailInitialShell[5]]],
      ["WILL", "FALSE", [tailInitialShell[6], tailInitialShell[7]]],
      ["BE", "BEWARE", [tailInitialShell[8], tailInitialShell[9]]],
      ["FOUND", "LUCK", [tailInitialShell[10], tailInitialShell[11]]],
      ["GOOD", null, [tailInitialShell[12]]],
    ],
    sourceWindows: source.length - 13 + 1,
    exactHits: initialShellExactHits.length,
    multisetHits: initialShellMultisetHits.length,
    winner: initialShellExactHits[0],
  },
  wordResolutionH13: {
    channels: {
      initial: {
        values: tailInitials,
        shell: tailInitialShell,
        labels: [
          "aK", "B-1", "p", "p+K", "b-K", "Kg",
          "K+g", "K+g", "F", "g", "-qg", "qg", "a",
        ],
      },
      length: {
        values: tailLengths,
        shell: tailLengthShell,
        labels: [
          "-e", "b-q", "-e", "-qg", "-1", "K+g",
          "-1", "-qg", "-q", "A", "a-g", "-qg", "q",
        ],
      },
      gp0: {
        values: tailGp0,
        shell: tailGp0Shell,
        labels: [
          "Kg", "b", "-e", "-1", "g", "-e",
          "-qg", "B-1", "g", "K+g", "g", "-qg", "a",
        ],
      },
    },
    sourceWindows: source.length - 13 + 1,
    hits: wordResolutionHits,
  },
  charge: {
    sourceWindows: source.length - 13 + 1,
    schedulePermutations: schedulePermutations.length,
    configurations,
    exact: {
      lengthHits: exactLengthHits.length,
      gp0Hits: exactGp0Hits.length,
      jointHits: exactJointHits.length,
      winner,
    },
    coordinateOrderRelaxed: {
      lengthShellPermutationFamilySize: uniquePermutations(targetLengthShell).length,
      gp0ShellPermutationFamilySize: uniquePermutations(targetGp0Shell).length,
      lengthMultisetHits: multisetLengthHits.length,
      gp0MultisetHits: multisetGp0Hits.length,
      jointMultisetHits: multisetJointHits.length,
      winner: multisetJointHits[0],
    },
  },
};

const output = JSON.stringify(result, null, 2);
console.log(output);
const artifact = path.join(
  process.env.RUNNER_TEMP || process.env.TEMP || __dirname,
  "source-test-output.json"
);
fs.writeFileSync(artifact, output + "\n", "utf8");
