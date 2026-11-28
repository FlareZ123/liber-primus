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
function h2(values) {
  assert.equal(values.length, 2);
  return [mod29(values[0] - values[1]), mod29(values[0] + values[1])];
}

/** @param {number[]} values @returns {number[]} */
function h3(values) {
  assert.equal(values.length, 3);
  return [
    mod29(values[0] - values[2]),
    values[1],
    mod29(values[0] + values[2]),
  ];
}

/** @param {number[]} values @returns {number[]} */
function h4(values) {
  assert.equal(values.length, 4);
  return [
    mod29(values[0] - values[3]),
    mod29(values[1] - values[2]),
    mod29(values[1] + values[2]),
    mod29(values[0] + values[3]),
  ];
}

/** @param {number[]} shell @returns {number[]} */
function h3Inverse(shell) {
  assert.equal(shell.length, 3);
  const inv2 = 15;
  return [
    mod29((shell[0] + shell[2]) * inv2),
    shell[1],
    mod29((shell[2] - shell[0]) * inv2),
  ];
}

/** @param {number[]} shell @returns {number[]} */
function h4Inverse(shell) {
  assert.equal(shell.length, 4);
  const inv2 = 15;
  return [
    mod29((shell[0] + shell[3]) * inv2),
    mod29((shell[1] + shell[2]) * inv2),
    mod29((shell[2] - shell[1]) * inv2),
    mod29((shell[3] - shell[0]) * inv2),
  ];
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signedText = read("resources/historical/cicada2016-4gq25-outguess.asc");
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
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
const sourceWords = clear
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
      gp0: values.reduce((sum, value) => sum + value, 0),
      gp0mod29: mod29(values.reduce((sum, value) => sum + value, 0)),
    };
  });
assert.equal(sourceWords.length, 43);

// Existing p6/DH state, independently established before this experiment.
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
const Kg = mod29(state.K * state.g);
const aK = mod29(state.a * state.K);
assert.deepEqual({ qg, Kg, aK }, { qg: 20, Kg: 10, aK: 12 });

// Independent physical/source boundary: p6's only red span is 11 runes
// between two red 13-dot marks. The authenticated signed message ends the
// DIRECTION sentence immediately before a 13-word alphabetic tail. Removing
// K=2 leading words from that tail leaves the already selected 11-word core.
const p6Ink = ink.pages.find((page) => page.page === 6);
assert.ok(p6Ink);
assert.deepEqual(p6Ink.red_spans, [{
  start: 71,
  length: 11,
  runes: "ᚪᛏᛉᛒᛗᚷᛡᛋᛒᛉᛇ",
}]);
assert.deepEqual(p6Ink.large_punctuation, [
  [71, 13, "red"],
  [82, 13, "red"],
]);
assert.match(
  clear,
  /numbers are the direction\.\s+Seek and you will be found\./iu
);
assert.equal(sourceWords[29].word, "DIRECTION");
assert.equal(sourceWords.slice(30).length, 13);
assert.deepEqual(sourceWords.slice(30).map((row) => row.word), [
  "SEEK", "AND", "YOU", "WILL", "BE", "FOUND", "GOOD", "LUCK",
  "BEWARE", "FALSE", "PATHS", "VERIFY", "OPENPGP",
]);
assert.equal(p6Ink.red_spans[0].length + state.K, 13);
assert.equal(sourceWords.slice(32).length, p6Ink.red_spans[0].length);

// The p6 source-tail selector begins at source index32 and omits exactly K=2
// words. Test the omitted pair without reading any LP2 ciphertext.
assert.deepEqual(
  sourceWords.slice(30, 32).map((row) => row.word),
  ["SEEK", "AND"]
);
const pairCandidates = [];
for (let index = 0; index + 1 < sourceWords.length; index += 1) {
  const left = sourceWords[index];
  const right = sourceWords[index + 1];
  const initialShell = h2([left.values[0], right.values[0]]);
  if (
    left.length === state.q &&
    right.length === state.e &&
    left.gp0mod29 === mod29(-state.K) &&
    right.gp0mod29 === mod29(-state.K) &&
    initialShell[0] === qg &&
    initialShell[1] === Kg
  ) {
    pairCandidates.push({
      index,
      words: [left.word, right.word],
      lengths: [left.length, right.length],
      gp0mod29: [left.gp0mod29, right.gp0mod29],
      initials: [left.values[0], right.values[0]],
      initialH2: initialShell,
    });
  }
}
assert.deepEqual(pairCandidates, [{
  index: 30,
  words: ["SEEK", "AND"],
  lengths: [state.q, state.e],
  gp0mod29: [mod29(-state.K), mod29(-state.K)],
  initials: [state.b, mod29(-state.g)],
  initialH2: [qg, Kg],
}]);

// Parse complete page-local printed groups.
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

/** @param {number[]} left @param {number[]} right @returns {number[]} */
function subtract(left, right) {
  return left.map((value, index) => mod29(value - right[index]));
}

/** @param {number[]} left @param {number[]} right @returns {number[]} */
function add(left, right) {
  return left.map((value, index) => mod29(value + right[index]));
}

// --- p30 / SEEK ---
// Source-only receiver shell:
// reverse H2(SEEK.first,AND.first)=[Kg,qg], then append SEEK.first=b and
// the independently selected corridor-start residue e.
const seek = sourceWords[30];
const and = sourceWords[31];
const p30ReceiverShell = [
  pairCandidates[0].initialH2[1],
  pairCandidates[0].initialH2[0],
  seek.values[0],
  state.e,
];
assert.deepEqual(p30ReceiverShell, [Kg, qg, state.b, state.e]);

const p30ReceiverHits = canonical
  .filter((word) =>
    word.values.length === 4 &&
    h4(word.values).join(",") === p30ReceiverShell.join(",")
  )
  .map((word) => {
    const local = localWords(word.page);
    return {
      page: word.page,
      ordinal: local.indexOf(word) + 1,
      start: word.start,
      values: word.values,
      shell: h4(word.values),
    };
  });
assert.deepEqual(p30ReceiverHits, [{
  page: 30,
  ordinal: 27,
  start: 112,
  values: [21, 3, 12, 11],
  shell: [Kg, qg, state.b, state.e],
}]);
assert.equal(p30ReceiverHits[0].ordinal, seek.gp0mod29);
assert.equal(seek.gp0mod29, mod29(-state.K));

const p30Receiver = p30ReceiverHits[0].values;
assert.deepEqual(h4(seek.values), [Kg, state.F, mod29(state.g + state.K), qg]);
const p30Key = subtract(p30Receiver, seek.values);
const p30KeyShell = h4(p30Key);
assert.deepEqual(p30Key, [6, 14, 23, 6]);
assert.deepEqual(p30KeyShell, [state.F, qg, state.A, aK]);
assert.deepEqual(h4Inverse(p30KeyShell), p30Key);
assert.deepEqual(subtract(p30Receiver, p30Key), seek.values);
assert.deepEqual(add(seek.values, p30Key), p30Receiver);

// Exact-key manuscript/source charge. Re-encryption is an invariant; this
// charge only records how selective the frozen local key is.
const fourRuneTargets = sourceWords.filter((row) => row.length === 4);
const p30ExactKeyHits = [];
for (const word of canonical.filter((row) => row.values.length === 4)) {
  for (const sign of [-1, 1]) {
    const candidate = word.values.map((value, index) =>
      mod29(value + sign * p30Key[index])
    );
    for (const target of fourRuneTargets) {
      if (candidate.every((value, index) => value === target.values[index])) {
        p30ExactKeyHits.push({
          page: word.page,
          start: word.start,
          sign,
          targetIndex: target.index,
          target: target.word,
        });
      }
    }
  }
}
assert.deepEqual(p30ExactKeyHits, [{
  page: 30,
  start: 112,
  sign: -1,
  targetIndex: 30,
  target: "SEEK",
}]);

// --- p31 / AND ---
// A separate direct-state receiver shell is also manuscript-unique. Its
// ordinal is exactly the p6-selected corridor start index32.
const p31ReceiverShell = [
  mod29(state.b - state.q),
  state.p,
  mod29(state.b - state.K),
];
assert.deepEqual(p31ReceiverShell, [11, 23, 13]);

const p31ReceiverHits = canonical
  .filter((word) =>
    word.values.length === 3 &&
    h3(word.values).join(",") === p31ReceiverShell.join(",")
  )
  .map((word) => {
    const local = localWords(word.page);
    return {
      page: word.page,
      ordinal: local.indexOf(word) + 1,
      start: word.start,
      values: word.values,
      shell: h3(word.values),
    };
  });
assert.deepEqual(p31ReceiverHits, [{
  page: 31,
  ordinal: 32,
  start: 126,
  values: [12, 23, 1],
  shell: [11, 23, 13],
}]);
assert.equal(p31ReceiverHits[0].ordinal, 32);

const p31Receiver = p31ReceiverHits[0].values;
const p31Key = subtract(p31Receiver, and.values);
const p31KeyShell = h3(p31Key);
assert.deepEqual(p31Key, [17, 14, 7]);
assert.deepEqual(p31KeyShell, [Kg, mod29(-state.b), mod29(-state.g)]);
assert.deepEqual(h3Inverse(p31KeyShell), p31Key);
assert.deepEqual(subtract(p31Receiver, p31Key), and.values);
assert.deepEqual(add(and.values, p31Key), p31Receiver);

// The p31 key itself is not manuscript-unique; preserve this negative control.
const threeRuneTargets = sourceWords.filter((row) => row.length === 3);
const p31ExactKeyHits = [];
for (const word of canonical.filter((row) => row.values.length === 3)) {
  for (const sign of [-1, 1]) {
    const candidate = word.values.map((value, index) =>
      mod29(value + sign * p31Key[index])
    );
    for (const target of threeRuneTargets) {
      if (candidate.every((value, index) => value === target.values[index])) {
        p31ExactKeyHits.push({
          page: word.page,
          start: word.start,
          sign,
          targetIndex: target.index,
          target: target.word,
        });
      }
    }
  }
}
assert.deepEqual(p31ExactKeyHits, [
  { page: 31, start: 126, sign: -1, targetIndex: 24, target: "AND" },
  { page: 31, start: 126, sign: -1, targetIndex: 31, target: "AND" },
  { page: 33, start: 116, sign: -1, targetIndex: 32, target: "YOU" },
]);

// Coupled source-only serializer charge. The family shares one W1 field
// between the two page keys, chooses p30 x from the signed title-length H4,
// p31 u/v as distinct literal W1 fields, and p31 w from H4(W1). Charge both
// additive directions and every consecutive authenticated [4,3] source pair.
const titleLengths = [state.q, 1, state.q, state.K];
const titleH = h4(titleLengths);
assert.deepEqual(titleH, [state.K, mod29(-state.e), state.g, state.a]);
const W1 = [mod29(-state.g), mod29(state.K - state.b), mod29(-state.b), mod29(state.K + state.b)];
assert.deepEqual(W1, [24, 16, 14, 17]);
const W1H = h4(W1);
assert.deepEqual(W1H, [mod29(state.g + state.K), state.K, mod29(state.a - state.g), aK]);

const source43Pairs = [];
for (let index = 0; index + 1 < sourceWords.length; index += 1) {
  if (sourceWords[index].length === 4 && sourceWords[index + 1].length === 3) {
    source43Pairs.push({
      index,
      left: sourceWords[index],
      right: sourceWords[index + 1],
    });
  }
}
assert.deepEqual(source43Pairs.map((entry) => [entry.index, entry.left.word, entry.right.word]), [
  [23, "ROAD", "AND"],
  [30, "SEEK", "AND"],
]);

const jointSerializerHits = [];
let jointSerializerCases = 0;
for (let xIndex = 0; xIndex < titleH.length; xIndex += 1) {
  for (const xSign of [1, -1]) {
    const x = mod29(xSign * titleH[xIndex]);
    for (let uIndex = 0; uIndex < W1.length; uIndex += 1) {
      for (let vIndex = 0; vIndex < W1.length; vIndex += 1) {
        if (uIndex === vIndex) continue;
        for (let wIndex = 0; wIndex < W1H.length; wIndex += 1) {
          const key30 = [x, W1[vIndex], mod29(-x), x];
          const key31 = [W1[uIndex], W1[vIndex], W1H[wIndex]];
          for (const direction30 of [-1, 1]) {
            for (const direction31 of [-1, 1]) {
              for (const pair of source43Pairs) {
                jointSerializerCases += 1;
                const out30 = p30Receiver.map((value, index) =>
                  mod29(value + direction30 * key30[index])
                );
                const out31 = p31Receiver.map((value, index) =>
                  mod29(value + direction31 * key31[index])
                );
                if (
                  out30.every((value, index) => value === pair.left.values[index]) &&
                  out31.every((value, index) => value === pair.right.values[index])
                ) {
                  jointSerializerHits.push({
                    xIndex,
                    xSign,
                    uIndex,
                    vIndex,
                    wIndex,
                    key30,
                    key31,
                    direction30,
                    direction31,
                    sourcePairIndex: pair.index,
                    targets: [pair.left.word, pair.right.word],
                  });
                }
              }
            }
          }
        }
      }
    }
  }
}
assert.equal(jointSerializerCases, 3072);
assert.deepEqual(jointSerializerHits, [{
  xIndex: 3,
  xSign: 1,
  uIndex: 3,
  vIndex: 2,
  wIndex: 0,
  key30: [state.a, mod29(-state.b), state.p, state.a],
  key31: [mod29(state.K + state.b), mod29(-state.b), mod29(state.K + state.g)],
  direction30: -1,
  direction31: -1,
  sourcePairIndex: 30,
  targets: ["SEEK", "AND"],
}]);

// Prospectively frozen receiver-address extrapolation from the newly observed
// p30 ordinal27 -> p31 ordinal32 = +g. The precommit fixes one backward step:
// p29 ordinal22 must have DIRECTION's eight-rune arity. It fails structurally.
const p29Target = sourceWords[29];
assert.equal(p29Target.word, "DIRECTION");
assert.equal(p29Target.length, 8);
const gStepOrdinal = 27 - state.g;
assert.equal(gStepOrdinal, 22);
const p29GStepReceiver = localWords(29)[gStepOrdinal - 1];
assert.ok(p29GStepReceiver);
assert.equal(p29GStepReceiver.start, 85);
assert.equal(p29GStepReceiver.values.length, 2);
assert.notEqual(p29GStepReceiver.values.length, p29Target.length);

const result = {
  status: "PASS",
  classification:
    "provisional source-selected boundary/receiver bridge; key-shell orderings were recognized after the known source targets and are not authenticated plaintext evidence",
  physicalTailBoundary: {
    p6RedSpan: p6Ink.red_spans[0],
    p6BoundaryMarks: p6Ink.large_punctuation,
    signedSentenceBoundaryAfter: sourceWords[29].word,
    signedTailWords: sourceWords.slice(30).map((row) => row.word),
    fullTailWordCount: sourceWords.slice(30).length,
    selectedCoreWordCount: sourceWords.slice(32).length,
    identity: "11 red runes + K=2 = 13-dot marks = 13 signed-tail words",
  },
  sourceBoundary: {
    omittedByP6Selector: state.K,
    corridorStart: 32,
    uniquePairCandidates: pairCandidates,
  },
  p30Seek: {
    target: seek,
    receiverSelectorShell: p30ReceiverShell,
    receiverHits: p30ReceiverHits,
    targetShell: h4(seek.values),
    key: p30Key,
    keyShell: p30KeyShell,
    exactKeyManuscriptHits: p30ExactKeyHits,
  },
  p31And: {
    target: and,
    receiverSelectorShell: p31ReceiverShell,
    receiverHits: p31ReceiverHits,
    targetShell: h3(and.values),
    key: p31Key,
    keyShell: p31KeyShell,
    exactKeyManuscriptHits: p31ExactKeyHits,
  },
  prospectiveGStepReceiver: {
    precommit: "workplace/agent1-p30p31-ordinal-g-step-p29-precommit.md",
    prediction: { page: 29, ordinal: gStepOrdinal, requiredLength: p29Target.length },
    observed: { start: p29GStepReceiver.start, length: p29GStepReceiver.values.length },
    pass: false,
    decision: "reject the 27->32 ordinal +g recurrence; do not retune the address",
  },
  jointSerializerCharge: {
    titleH,
    W1,
    W1H,
    familySerializers: 8 * 12 * 4,
    source43Pairs: source43Pairs.map((entry) => [entry.index, entry.left.word, entry.right.word]),
    configurations: jointSerializerCases,
    hits: jointSerializerHits,
    note: "finite post-discovery charge, not a discovery-wide probability",
  },
  counts: {
    completeFourRuneWords: canonical.filter((word) => word.values.length === 4).length,
    completeThreeRuneWords: canonical.filter((word) => word.values.length === 3).length,
    authenticatedFourRuneTargets: fourRuneTargets.length,
    authenticatedThreeRuneTargets: threeRuneTargets.length,
  },
};

const output = JSON.stringify(result, null, 2);
console.log(output);
const artifact = path.join(
  process.env.RUNNER_TEMP || process.env.TEMP || __dirname,
  "source-test-output.json"
);
fs.writeFileSync(artifact, output + "\n", "utf8");
