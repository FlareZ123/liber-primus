"use strict";

/**
 * SFT: signed-index -> same-page state receivers, p33 WILL local inverse,
 * and the sealed p34 BE transfer.
 *
 * Windows Node.js 22, CommonJS, no third-party dependencies.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

const transcription = read("resources/liber-primus/lp2-transcription.txt");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const signedSource = read("resources/historical/cicada2016-4gq25-outguess.asc");

const runeSet = new Set(corpus.runes);
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({symbol, value}))
  .sort((left, right) => right.symbol.length - left.symbol.length);

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number[]} values @returns {number} */
function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

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

    const token = gpTokens.find(candidate =>
      normalized.startsWith(candidate.symbol, offset)
    );
    assert.ok(token, "unmapped GP spelling: " + normalized.slice(offset));
    values.push(token.value);
    offset += token.symbol.length;
  }

  return values;
}

/** @param {number} block @returns {number} */
function physicalPage(block) {
  return block < 50 ? block : block + 1;
}

/**
 * @returns {Array<{
 *   startPage:number,startOffset:number,endPage:number,endOffset:number,
 *   values:number[]
 * }>}
 */
function parseWords() {
  let block = 0;
  let page = 0;
  let pageOffset = 0;
  let startPage = null;
  let startOffset = null;
  let runes = [];
  const words = [];

  function close() {
    if (runes.length === 0) return;
    words.push({
      startPage,
      startOffset,
      endPage: page,
      endOffset: pageOffset - 1,
      values: runes.map(rune => runeIndex.get(rune)),
    });
    startPage = null;
    startOffset = null;
    runes = [];
  }

  for (const ch of transcription) {
    if (runeSet.has(ch)) {
      if (runes.length === 0) {
        startPage = page;
        startOffset = pageOffset;
      }
      runes.push(ch);
      pageOffset += 1;
    } else if (ch === "-" || ch === "." || ch === "&" || ch === "$") {
      close();
    } else if (ch === "%") {
      close();
      block += 1;
      page = physicalPage(block);
      pageOffset = 0;
    }
  }

  close();
  return words;
}

const clear = signedSource.split("-----BEGIN PGP SIGNATURE-----")[0];
const body = clear.slice(clear.indexOf("Hello."));
const signed = body
  .split(/[^A-Za-z0-9]+/)
  .filter(token => /^[A-Za-z]+$/.test(token))
  .map((word, index) => ({
    index,
    label: word.toUpperCase(),
    values: gp(word),
  }));

assert.equal(signed.length, 43);

const words = parseWords();

/** @param {number[]} values @returns {string} */
function stateKey(values) {
  return values.length + ":" + sum(values);
}

const pageStateCounts = Array.from({length: 43}, () => new Map());
for (const word of words) {
  if (
    word.startPage >= 0 &&
    word.startPage < 43 &&
    word.endPage === word.startPage
  ) {
    const key = stateKey(word.values);
    const counts = pageStateCounts[word.startPage];
    counts.set(key, (counts.get(key) || 0) + 1);
  }
}

const rows = signed.map(sourceWord => {
  const key = stateKey(sourceWord.values);
  const matches = words.filter(word =>
    word.startPage === sourceWord.index &&
    word.endPage === sourceWord.index &&
    stateKey(word.values) === key
  );

  return {
    index: sourceWord.index,
    label: sourceWord.label,
    length: sourceWord.values.length,
    gp0: sum(sourceWord.values),
    matches,
  };
});

assert.deepEqual(
  rows
    .filter(row => row.matches.length > 0)
    .map(row => [
      row.index,
      row.label,
      row.matches.length,
      row.matches.map(match => match.startOffset),
    ]),
  [
    [6, "SEEKS", 1, [128]],
    [11, "IS", 1, [49]],
    [21, "IS", 1, [170]],
    [33, "WILL", 1, [132]],
    [34, "BE", 2, [4, 249]],
    [38, "BEWARE", 1, [57]],
    [40, "PATHS", 1, [71]],
  ]
);

assert.equal(rows[39].label, "FALSE");
assert.equal(rows[39].matches.length, 0);
assert.equal(rows[41].label, "VERIFY");
assert.equal(rows[41].matches.length, 0);
assert.equal(rows[42].label, "OPENPGP");
assert.equal(rows[42].matches.length, 0);

/**
 * Exact-token-state permutation control. The 43 source word states are shuffled
 * among the fixed physical page indices, preserving the complete source multiset.
 *
 * @param {string[]} keys
 * @returns {{any:number,unique:number,totalMatches:number}}
 */
function score(keys) {
  let any = 0;
  let unique = 0;
  let totalMatches = 0;

  for (let page = 0; page < 43; page += 1) {
    const count = pageStateCounts[page].get(keys[page]) || 0;
    if (count > 0) any += 1;
    if (count === 1) unique += 1;
    totalMatches += count;
  }

  return {any, unique, totalMatches};
}

const sourceStateKeys = signed.map(word => stateKey(word.values));
const observed = score(sourceStateKeys);
assert.deepEqual(observed, {any: 7, unique: 6, totalMatches: 8});

let seed = 0x33012016;

/** @returns {number} */
function random() {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 4294967296;
}

const samples = 200000;
let geAny = 0;
let geUnique = 0;
let geJoint = 0;
let geTotal = 0;

for (let sample = 0; sample < samples; sample += 1) {
  const shuffled = sourceStateKeys.slice();

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[other]] = [
      shuffled[other],
      shuffled[index],
    ];
  }

  const candidate = score(shuffled);
  if (candidate.any >= observed.any) geAny += 1;
  if (candidate.unique >= observed.unique) geUnique += 1;
  if (
    candidate.any >= observed.any &&
    candidate.unique >= observed.unique
  ) {
    geJoint += 1;
  }
  if (candidate.totalMatches >= observed.totalMatches) geTotal += 1;
}

assert.deepEqual(
  {geAny, geUnique, geJoint, geTotal},
  {
    geAny: 109461,
    geUnique: 121543,
    geJoint: 104174,
    geTotal: 101230,
  }
);

// P33 WILL was selected by the frozen rule above before its inverse key was
// inspected.
const p33 = rows[33];
assert.equal(p33.label, "WILL");
assert.equal(p33.matches.length, 1);
const p33Receiver = p33.matches[0];
assert.deepEqual(
  [p33Receiver.startOffset, p33Receiver.endOffset],
  [132, 135]
);
assert.deepEqual(p33Receiver.values, [3, 15, 17, 22]);
assert.deepEqual(p33.values, [7, 10, 20, 20]);

const p33Key = p33Receiver.values.map((value, index) =>
  mod29(value - p33.values[index])
);
assert.deepEqual(p33Key, [25, 5, 26, 2]);

/**
 * Canonical four-rune H ordering used elsewhere in the repository:
 * [x0-x3, x1-x2, x1+x2, x0+x3].
 *
 * @param {number[]} values
 * @returns {number[]}
 */
function h4(values) {
  assert.equal(values.length, 4);
  return [
    mod29(values[0] - values[3]),
    mod29(values[1] - values[2]),
    mod29(values[1] + values[2]),
    mod29(values[0] + values[3]),
  ];
}

const dh = Object.freeze({
  p: 23,
  g: 5,
  a: 6,
  b: 15,
  A: 8,
  B: 19,
  K: 2,
  e: 3,
  q: 4,
});

assert.deepEqual(h4(p33Key), [
  dh.p,
  dh.A,
  dh.K,
  mod29(-dh.K),
]);

assert.deepEqual(
  p33.values.map((value, index) => mod29(value + p33Key[index])),
  p33Receiver.values
);

// Sealed successor after observing the p33 shell but before opening either p34
// candidate. The next signed word BE has two state-matched page34 receivers.
// Remove the p33 shell circumference [p, -K], retain [A,K], and apply the same
// 2-point H inverse. This fixes [g,-e] = [5,26] with no p34 tuning.
const p34 = rows[34];
assert.equal(p34.label, "BE");
assert.equal(p34.matches.length, 2);
assert.deepEqual(p34.values, [17, 18]);

const inv2 = 15;
const innerShell = [dh.A, dh.K];
const p34Key = [
  mod29((innerShell[0] + innerShell[1]) * inv2),
  mod29((innerShell[1] - innerShell[0]) * inv2),
];
assert.deepEqual(p34Key, [dh.g, mod29(-dh.e)]);

const p34Outputs = p34.matches.map(match => ({
  start: match.startOffset,
  cipher: match.values,
  subtract: match.values.map((value, index) =>
    mod29(value - p34Key[index])
  ),
  add: match.values.map((value, index) =>
    mod29(value + p34Key[index])
  ),
}));

assert.deepEqual(p34Outputs, [
  {
    start: 4,
    cipher: [12, 23],
    subtract: [7, 26],
    add: [17, 20],
  },
  {
    start: 249,
    cipher: [28, 7],
    subtract: [23, 10],
    add: [4, 4],
  },
]);

for (const output of p34Outputs) {
  assert.notDeepEqual(output.subtract, p34.values);
  assert.notDeepEqual(output.add, p34.values);
}

console.log(JSON.stringify({
  status: "PASS",
  frozenIndexPageStateRule: {
    observed,
    hits: rows
      .filter(row => row.matches.length > 0)
      .map(row => ({
        index: row.index,
        word: row.label,
        count: row.matches.length,
        starts: row.matches.map(match => match.startOffset),
      })),
    exactSourceStatePermutationControl: {
      samples,
      geAny,
      geUnique,
      geJoint,
      geTotal,
    },
  },
  p33Will: {
    target: p33.values,
    receiver: {
      page: 33,
      start: p33Receiver.startOffset,
      end: p33Receiver.endOffset,
      cipher: p33Receiver.values,
    },
    subtractionKey: p33Key,
    hShell: h4(p33Key),
    shellLabels: "[p,A,K,-K]",
  },
  blindSuccessor: {
    sourceWord: "BE",
    page: 34,
    stateMatchedStarts: p34.matches.map(match => match.startOffset),
    frozenInnerShell: innerShell,
    frozenKey: p34Key,
    outputs: p34Outputs,
    result: "FAIL",
  },
  decision:
    "The index->same-page length+GP0 rule is nonselective under the exact source-state permutation control. P33 WILL is a source-constrained local inverse whose key compresses to [p,A,K,-K], but the natural no-tune p34 BE transfer fails on both preselected receivers and both signs. Preserve WILL as a local candidate only; do not promote a reusable decoder or warning-corridor page map.",
}, null, 2));
