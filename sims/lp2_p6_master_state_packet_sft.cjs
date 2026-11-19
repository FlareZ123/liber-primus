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

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));\nconst ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const source = read("resources/liber-primus/lp2-transcription.txt");
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const tokens = grid.pages.flatMap((page) => page.tokens);
const alphabet60 = grid.alphabet;
const state = Object.freeze({ p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2 });

/** @param {string} token @returns {number} */
function low60(token) {
  const value = alphabet60.indexOf(token[1]);
  assert.ok(value >= 0, "invalid base60 token " + token);
  return value;
}

/** @param {number} left @param {number} right @returns {number[]} */
function H(left, right) {
  return [mod29(left - right), mod29(left + right)];
}

/** @param {number[]} values @returns {number[]} */
function h4Canonical(values) {
  assert.equal(values.length, 4);
  return [
    mod29(values[0] - values[3]),
    mod29(values[1] - values[2]),
    mod29(values[1] + values[2]),
    mod29(values[0] + values[3]),
  ];
}

/** @param {number[]} values @returns {number} */
function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

/** @param {number[]} values @returns {number[]} */
function hShell(values) {
  const out = [];
  for (let left = 0, right = values.length - 1; left < right; left += 1, right -= 1) {
    out.push(...H(values[left], values[right]));
  }
  if (values.length % 2) out.push(values[Math.floor(values.length / 2)]);
  return out;
}

/**
 * Invert an even-length outside-in H shell.
 * Shell order: [d0,s0,d1,s1,...] for outer to inner pairs.
 * @param {number[]} shell
 * @returns {number[]}
 */
function invertHShell(shell) {
  assert.equal(shell.length % 2, 0);
  const inv2 = 15; // 2^-1 mod29
  const left = [];
  const right = [];
  for (let index = 0; index < shell.length; index += 2) {
    const difference = shell[index];
    const sum = shell[index + 1];
    left.push(mod29((difference + sum) * inv2));
    right.push(mod29((sum - difference) * inv2));
  }
  return [...left, ...right.reverse()];
}

const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);

/** @param {string} word @returns {number[]} */
function gpEnglish(word) {
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
    const token = gpTokens.find((candidate) => normalized.startsWith(candidate.symbol, offset));
    assert.ok(token, "unmapped GP spelling " + word);
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}

const signedBody = signed
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .replace(/^-----BEGIN PGP SIGNED MESSAGE-----[\s\S]*?Hash: SHA1\s*/, "")
  .replace(/\b3301\b/g, "")
  .replace(/\b[0-9A-F]{8,}\b/g, "");

const signedWords = (signedBody.match(/[A-Za-z]+/g) || []).map((word, index) => {
  const values = gpEnglish(word);
  return {
    index,
    word: word.toUpperCase(),
    values,
    length: values.length,
    gp0: values.reduce((sum, value) => sum + value, 0),
  };
});
assert.equal(signedWords.length, 43);

// Reconstruct the independently frozen signed-word direction graph:
// s_i = low60(p50[i]) - i - GP_length(word_i) mod29.
const edges = signedWords.map((word) =>
  mod29(low60(tokens[word.index]) - word.index - word.length)
);

/** @param {number} start @returns {{cycle:string,depth:number,cycleNodes:number[]}} */
function traceGraph(start) {
  const seen = new Map();
  const route = [];
  let node = start;
  while (!seen.has(node)) {
    seen.set(node, route.length);
    route.push(node);
    node = edges[node];
  }
  const cycleStart = seen.get(node);
  const cycleNodes = route.slice(cycleStart);
  const rotations = cycleNodes.map((_, offset) =>
    [...cycleNodes.slice(offset), ...cycleNodes.slice(0, offset)]
  );
  rotations.sort((left, right) => {
    for (let index = 0; index < left.length; index += 1) {
      if (left[index] !== right[index]) return left[index] - right[index];
    }
    return 0;
  });
  return {
    cycle: rotations[0].join(","),
    depth: cycleStart,
    cycleNodes: rotations[0],
  };
}

const traces = signedWords.map((_, index) => traceGraph(index));
const cycleMap = new Map();
for (const trace of traces) {
  if (!cycleMap.has(trace.cycle)) cycleMap.set(trace.cycle, trace.cycleNodes);
}
const cycles = [...cycleMap.values()];
const cycleLengths = cycles.map((cycle) => cycle.length).sort((left, right) => left - right);
const totalCycleNodes = cycleLengths.reduce((sum, value) => sum + value, 0);
const maxDepth = Math.max(...traces.map((trace) => trace.depth));
const basinSizes = [...cycleMap.keys()]
  .map((cycle) => traces.filter((trace) => trace.cycle === cycle).length)
  .sort((left, right) => left - right);

assert.equal(cycles.length, 2);
assert.deepEqual(cycleLengths, [3, 3]);
assert.equal(totalCycleNodes, 6);
assert.equal(maxDepth, 5);
assert.deepEqual(basinSizes, [14, 29]);

const topologyState = Object.freeze({
  K: cycles.length,
  e: cycleLengths[0],
  a: totalCycleNodes,
  g: maxDepth,
  p: 29 - totalCycleNodes,
  b: 29 - basinSizes[0],
});
assert.deepEqual(topologyState, { K: 2, e: 3, a: 6, g: 5, p: 23, b: 15 });

const sixRuneTargets = [...new Map(
  signedWords
    .filter((word) => word.length === 6)
    .map((word) => [word.values.join(","), word])
).values()];
assert.deepEqual(sixRuneTargets.map((word) => word.word), ["PRIMUS", "BEWARE", "VERIFY"]);

const parts = source.split("%").slice(0, 55);

/** @param {number} segment @returns {number} */
function physicalPage(segment) {
  return segment >= 50 ? segment + 1 : segment;
}

/** @returns {Map<number, Array<object>>} */
function parsePages() {
  const pages = parts.map((_, segment) => ({ page: physicalPage(segment), words: [] }));
  const offsets = new Array(parts.length).fill(0);

  let values = [];
  let startSegment = 0;
  let endSegment = 0;
  let start = 0;

  function flush() {
    if (!values.length) return;
    if (startSegment === endSegment) {
      const page = pages[startSegment];
      page.words.push({
        page: page.page,
        ordinal: page.words.length,
        start,
        end: start + values.length - 1,
        values: values.slice(),
        length: values.length,
        gp0: values.reduce((sum, value) => sum + value, 0),
      });
    }
    values = [];
  }

  for (let segment = 0; segment < parts.length; segment += 1) {
    for (const char of parts[segment]) {
      const value = runeIndex.get(char);
      if (value !== undefined) {
        if (!values.length) {
          startSegment = segment;
          start = offsets[segment];
        }
        endSegment = segment;
        values.push(value);
        offsets[segment] += 1;
      } else if (char === "/" || /\s/u.test(char)) {
        continue;
      } else {
        flush();
      }
    }
  }
  flush();

  return new Map(pages.map((page) => [page.page, page.words]));
}

/** @param {number} page @returns {number[][]} */
function runeLines(page) {
  const segment = page <= 49 ? page : page - 1;
  return parts[segment]
    .trim()
    .split("/")
    .filter((line) => [...line].some((char) => runeIndex.has(char)))
    .map((line) => [...line].map((char) => runeIndex.get(char)).filter((value) => value !== undefined));
}

const pages = parsePages();
const allWords = [...pages.values()].flat();
const sixRuneWords = allWords.filter((word) => word.length === 6);
assert.equal(sixRuneWords.length, 251);


// P6 is selected independently by authenticated word index6 = SEEKS and by
// the direction-graph state a=6. Its exact four-word red heading is tested as
// a source-visible state packet before any p33/p40/p38 receiver key is used.
const packetState = Object.freeze({
  ...state,
  e: topologyState.e,
  q: 4,
});
assert.equal(signedWords[packetState.a].word, "SEEKS");

const p6 = pages.get(6);
assert.ok(p6);
const p6Ink = ink.pages.find((entry) => entry.page === 6);
assert.ok(p6Ink);
assert.deepEqual(
  p6Ink.red_spans.map((span) => [span.start, span.length]),
  [[71, 11]]
);
assert.deepEqual(p6Ink.large_punctuation, [
  [71, 13, "red"],
  [82, 13, "red"],
]);

const p6Span = p6Ink.red_spans[0];
const p6HeadingWords = p6.filter((word) =>
  word.start >= p6Span.start &&
  word.end < p6Span.start + p6Span.length
);
assert.deepEqual(
  p6HeadingWords.map((word) => [word.start, word.end, word.values]),
  [
    [71, 74, [24, 16, 14, 17]],
    [75, 75, [19]],
    [76, 79, [6, 27, 15, 17]],
    [80, 81, [14, 12]],
  ]
);
const p6HeadingLengths = p6HeadingWords.map((word) => word.length);
const p6HeadingGp0 = p6HeadingWords.map((word) => word.gp0);
assert.deepEqual(p6HeadingLengths, [4, 1, 4, 2]);
assert.deepEqual(p6HeadingGp0, [71, 19, 65, 26]);

const p6LengthShell = h4Canonical(p6HeadingLengths);
assert.deepEqual(p6LengthShell, [
  packetState.K,
  mod29(-packetState.e),
  packetState.g,
  packetState.a,
]);

const signedStateValues = new Set();
for (const value of Object.values(packetState)) {
  signedStateValues.add(value);
  signedStateValues.add(mod29(-value));
}

const exactFourWordRedSpans = [];
for (const annotation of ink.pages) {
  const pageWords = pages.get(annotation.page) || [];
  for (let spanIndex = 0; spanIndex < (annotation.red_spans || []).length; spanIndex += 1) {
    const span = annotation.red_spans[spanIndex];
    const inside = pageWords.filter((word) =>
      word.start >= span.start &&
      word.end < span.start + span.length
    );
    if (
      inside.length === 4 &&
      inside[0].start === span.start &&
      inside[3].end === span.start + span.length - 1
    ) {
      const lengths = inside.map((word) => word.length);
      const shell = h4Canonical(lengths);
      exactFourWordRedSpans.push({
        page: annotation.page,
        spanIndex,
        lengths,
        shell,
        fullyStateTyped: shell.every((value) => signedStateValues.has(value)),
      });
    }
  }
}
assert.deepEqual(
  exactFourWordRedSpans.map((entry) => [entry.page, entry.lengths]),
  [
    [6, [4, 1, 4, 2]],
    [23, [2, 6, 3, 5]],
  ]
);
assert.deepEqual(
  exactFourWordRedSpans.filter((entry) => entry.fullyStateTyped),
  [{
    page: 6,
    spanIndex: 0,
    lengths: [4, 1, 4, 2],
    shell: [2, 26, 5, 6],
    fullyStateTyped: true,
  }]
);

// The packet reconstructs the two established four-rune same-index shells.
// A is the total length of the twin longest heading words. The final heading
// word exposes -b as its first rune, K as its length, and -e as its GP0.
// The non-singleton count is e; H(lengths) supplies a and thus p=-a.
const p6MaxLength = Math.max(...p6HeadingLengths);
const p6A = p6HeadingLengths
  .filter((length) => length === p6MaxLength)
  .reduce((total, length) => total + length, 0);
const p6LastWord = p6HeadingWords.at(-1);
const p6E = p6HeadingLengths.filter((length) => length > 1).length;
assert.equal(p6A, packetState.A);
assert.equal(p6LastWord.length, packetState.K);
assert.equal(p6LastWord.values[0], mod29(-packetState.b));
assert.equal(p6LastWord.gp0, mod29(-packetState.e));
assert.equal(p6E, packetState.e);
assert.equal(mod29(-p6LengthShell[3]), packetState.p);

const p33Target = signedWords[33];
const p40Target = signedWords[40];
assert.equal(p33Target.word, "WILL");
assert.equal(p40Target.word, "PATHS");

const p33StateMatches = (pages.get(33) || []).filter((word) =>
  word.length === p33Target.length && word.gp0 === p33Target.gp0
);
const p40StateMatches = (pages.get(40) || []).filter((word) =>
  word.length === p40Target.length && word.gp0 === p40Target.gp0
);
assert.deepEqual(p33StateMatches.map((word) => word.start), [132]);
assert.deepEqual(p40StateMatches.map((word) => word.start), [71]);

const p33RequiredKey = p33StateMatches[0].values.map((value, index) =>
  mod29(value - p33Target.values[index])
);
const p40RequiredKey = p40StateMatches[0].values.map((value, index) =>
  mod29(value - p40Target.values[index])
);
const p33Shell = h4Canonical(p33RequiredKey);
const p40Shell = h4Canonical(p40RequiredKey);
assert.deepEqual(p33Shell, [23, 8, 2, 27]);
assert.deepEqual(p40Shell, [14, 8, 3, 26]);
assert.deepEqual(p33Shell, [
  mod29(-p6LengthShell[3]),
  p6A,
  p6LengthShell[0],
  mod29(-p6LengthShell[0]),
]);
assert.deepEqual(p40Shell, [
  p6LastWord.values[0],
  p6A,
  p6E,
  p6LastWord.gp0,
]);

const p38 = pages.get(38);
assert.ok(p38);
const receiver = p38.find((word) => word.start === 57 && word.end === 62);
assert.ok(receiver);
assert.deepEqual(receiver.values, [8, 25, 14, 2, 17, 22]);
assert.equal(receiver.length, 6);
assert.equal(receiver.gp0, 88);

// Reproduce the independent LUCK -> BEWARE state selector.
const beware = signedWords.find((word) => word.word === "BEWARE");
const luck = signedWords.find((word) => word.word === "LUCK");
assert.ok(beware && luck);
assert.equal(beware.gp0, receiver.gp0);
assert.equal(beware.length, receiver.length);
assert.equal(tokens[receiver.gp0], "3V");
assert.equal(low60(tokens[receiver.gp0]), luck.gp0);
assert.equal(signedWords[beware.index - 1].word, "LUCK");

const p28Lines = runeLines(28);
const hereLine = p28Lines[0];
const dhLine = p28Lines[5];
assert.equal(hereLine.length, state.p);
assert.equal(dhLine.length, state.p);
assert.equal(hereLine[state.B - 1], 22);
assert.equal(dhLine[state.p - 1], 20);


const p6PacketFirstWord = p6HeadingWords[0].values;
assert.deepEqual(p6PacketFirstWord, [
  mod29(-packetState.g),
  mod29(packetState.K - packetState.b),
  mod29(-packetState.b),
  mod29(packetState.K + packetState.b),
]);

// Charge the first-word grammar over every four-rune red word and every
// authenticated state-field pair. The p6 word is the only instance of
// [-x, K-y, -y, K+y], fixing x=g and y=b without using p38 values.
const redFourRuneWords = [];
for (const annotation of ink.pages) {
  const pageWords = pages.get(annotation.page) || [];
  for (let spanIndex = 0; spanIndex < (annotation.red_spans || []).length; spanIndex += 1) {
    const span = annotation.red_spans[spanIndex];
    const inside = pageWords.filter((word) =>
      word.start >= span.start &&
      word.end < span.start + span.length
    );
    for (let wordIndex = 0; wordIndex < inside.length; wordIndex += 1) {
      if (inside[wordIndex].length === 4) {
        redFourRuneWords.push({
          page: annotation.page,
          spanIndex,
          wordIndex,
          word: inside[wordIndex],
        });
      }
    }
  }
}
assert.equal(redFourRuneWords.length, 9);

const packetFieldEntries = Object.entries(packetState);
const firstWordTemplateHits = [];
for (const redWord of redFourRuneWords) {
  for (const [xName, x] of packetFieldEntries) {
    for (const [yName, y] of packetFieldEntries) {
      const predicted = [
        mod29(-x),
        mod29(packetState.K - y),
        mod29(-y),
        mod29(packetState.K + y),
      ];
      if (predicted.every((value, index) => value === redWord.word.values[index])) {
        firstWordTemplateHits.push({
          page: redWord.page,
          spanIndex: redWord.spanIndex,
          wordIndex: redWord.wordIndex,
          start: redWord.word.start,
          xName,
          yName,
          predicted,
        });
      }
    }
  }
}
assert.deepEqual(firstWordTemplateHits, [{
  page: 6,
  spanIndex: 0,
  wordIndex: 0,
  start: 71,
  xName: "g",
  yName: "b",
  predicted: [24, 16, 14, 17],
}]);

// Stronger manuscript-wide control: the same state grammar is unique among
// every complete four-rune word on unknown p0-p55.
const completeFourRuneWords = [...pages.values()]
  .flat()
  .filter((word) => word.length === 4);
assert.equal(completeFourRuneWords.length, 508);
const firstWordManuscriptHits = [];
for (const word of completeFourRuneWords) {
  for (const [xName, x] of packetFieldEntries) {
    for (const [yName, y] of packetFieldEntries) {
      const predicted = [
        mod29(-x),
        mod29(packetState.K - y),
        mod29(-y),
        mod29(packetState.K + y),
      ];
      if (predicted.every((value, index) => value === word.values[index])) {
        firstWordManuscriptHits.push({
          page: word.page,
          start: word.start,
          xName,
          yName,
          predicted,
        });
      }
    }
  }
}
assert.deepEqual(firstWordManuscriptHits, [{
  page: 6,
  start: 71,
  xName: "g",
  yName: "b",
  predicted: [24, 16, 14, 17],
}]);

// Joint four-word packet grammar. Search every page-local consecutive
// four-word window, with no red-ink prefilter. The family is
//
// W1 = [-x1, K-y, -y, K+y]
// W2 = [B]
// W3 = [x3, -K, y, K+y]
// W4 = [-y, x3*K]
//
// with x1,x3,y independently ranging over the nine authenticated state
// fields. Directly solving the implied x1/x3/y values is exactly equivalent
// to charging all 9^3 assignments per window.
const completePageWords = [...pages.values()].flat();
assert.equal(completePageWords.length, 2862);
const pageLocalFourWordWindows = [];
for (const [page, pageWords] of pages.entries()) {
  for (let windowIndex = 0; windowIndex + 4 <= pageWords.length; windowIndex += 1) {
    pageLocalFourWordWindows.push({
      page,
      windowIndex,
      words: pageWords.slice(windowIndex, windowIndex + 4),
    });
  }
}
assert.equal(pageLocalFourWordWindows.length, 2697);

const stateNameByValue = new Map(
  packetFieldEntries.map(([name, value]) => [value, name])
);
const fullPacketGrammarHits = [];
for (const window of pageLocalFourWordWindows) {
  const [word1, word2, word3, word4] = window.words;
  if (
    word1.length !== 4 ||
    word2.length !== 1 ||
    word3.length !== 4 ||
    word4.length !== 2 ||
    word2.values[0] !== packetState.B
  ) {
    continue;
  }

  const y = mod29(-word1.values[2]);
  const x1 = mod29(-word1.values[0]);
  const x3 = word3.values[0];
  if (
    !stateNameByValue.has(y) ||
    !stateNameByValue.has(x1) ||
    !stateNameByValue.has(x3)
  ) {
    continue;
  }

  const predictedWord1 = [
    mod29(-x1),
    mod29(packetState.K - y),
    mod29(-y),
    mod29(packetState.K + y),
  ];
  const predictedWord3 = [
    x3,
    mod29(-packetState.K),
    y,
    mod29(packetState.K + y),
  ];
  const predictedWord4 = [
    mod29(-y),
    mod29(x3 * packetState.K),
  ];
  if (
    predictedWord1.every((value, index) => value === word1.values[index]) &&
    predictedWord3.every((value, index) => value === word3.values[index]) &&
    predictedWord4.every((value, index) => value === word4.values[index])
  ) {
    fullPacketGrammarHits.push({
      page: window.page,
      windowIndex: window.windowIndex,
      starts: window.words.map((word) => word.start),
      x1: stateNameByValue.get(x1),
      x3: stateNameByValue.get(x3),
      y: stateNameByValue.get(y),
    });
  }
}
assert.deepEqual(fullPacketGrammarHits, [{
  page: 6,
  windowIndex: 14,
  starts: [71, 75, 76, 80],
  x1: "g",
  x3: "a",
  y: "b",
}]);

// The fourth field K+b is a target-initial selector. Among authenticated
// six-rune source words it selects BEWARE alone.
const packetTargetInitial = p6PacketFirstWord[3];
assert.equal(packetTargetInitial, mod29(packetState.K + packetState.b));
assert.deepEqual(
  sixRuneTargets
    .filter((target) => target.values[0] === packetTargetInitial)
    .map((target) => target.word),
  ["BEWARE"]
);

// Treat one of the four printed fields as the target-initial selector and
// assign the remaining three, in every possible order, to d0,s0,s2 of the
// six-rune interleaved H shell. The middle pair is fixed by p=-a and p-e;
// d2=0. This charges all 4*3! = 24 role maps and both signs.
const packetRoleHits = [];
let packetRoleCases = 0;
for (let targetSlot = 0; targetSlot < 4; targetSlot += 1) {
  const remaining = [0, 1, 2, 3].filter((index) => index !== targetSlot);
  for (const d0Slot of remaining) {
    for (const s0Slot of remaining) {
      if (s0Slot === d0Slot) continue;
      for (const s2Slot of remaining) {
        if (s2Slot === d0Slot || s2Slot === s0Slot) continue;
        const shell = [
          p6PacketFirstWord[d0Slot],
          p6PacketFirstWord[s0Slot],
          packetState.p,
          mod29(packetState.p - packetState.e),
          0,
          p6PacketFirstWord[s2Slot],
        ];
        const key = invertHShell(shell);
        const admissibleTargets = sixRuneTargets.filter((target) =>
          target.values[0] === p6PacketFirstWord[targetSlot]
        );
        for (const sign of [-1, 1]) {
          packetRoleCases += 1;
          const candidate = receiver.values.map((value, index) =>
            mod29(value + sign * key[index])
          );
          for (const target of admissibleTargets) {
            if (candidate.every((value, index) => value === target.values[index])) {
              packetRoleHits.push({
                targetSlot,
                d0Slot,
                s0Slot,
                s2Slot,
                targetInitial: p6PacketFirstWord[targetSlot],
                sign,
                shell,
                key,
                target: target.word,
              });
            }
          }
        }
      }
    }
  }
}
assert.equal(packetRoleCases, 48);
assert.deepEqual(packetRoleHits, [{
  targetSlot: 3,
  d0Slot: 1,
  s0Slot: 0,
  s2Slot: 2,
  targetInitial: 17,
  sign: -1,
  shell: [16, 24, 23, 20, 0, 14],
  key: [20, 7, 7, 7, 13, 4],
  target: "BEWARE",
}]);

/** @returns {number[][]} */
function orderedTriplesOfFour() {
  const out = [];
  for (let first = 0; first < 4; first += 1) {
    for (let second = 0; second < 4; second += 1) {
      if (second === first) continue;
      for (let third = 0; third < 4; third += 1) {
        if (third === first || third === second) continue;
        out.push([first, second, third]);
      }
    }
  }
  return out;
}

const packetLines = [
  ["HERE", hereLine],
  ["DH", dhLine],
];
const p6P28Family = [];
for (const order of orderedTriplesOfFour()) {
  for (const [lineName, line] of packetLines) {
    const shell = [
      p6PacketFirstWord[order[0]],
      p6PacketFirstWord[order[1]],
      packetState.p,
      line[packetState.p - 1],
      0,
      p6PacketFirstWord[order[2]],
    ];
    p6P28Family.push({
      order,
      lineName,
      shell,
      key: invertHShell(shell),
    });
  }
}
assert.equal(p6P28Family.length, 48);

const Ka = mod29(state.K * state.a);
const cipherShell = hShell(receiver.values);
assert.deepEqual(cipherShell, [
  state.b,
  mod29(state.a - state.g),
  state.A,
  mod29(state.b - state.K),
  Ka,
  mod29(state.K - state.b),
]);

const bewareShell = hShell(beware.values);
assert.deepEqual(bewareShell, [
  mod29(state.g - state.a),
  state.a,
  mod29(-state.b),
  hereLine[state.B - 1],
  Ka,
  state.K,
]);


const p6P28ReceiverHits = [];
for (const familyCase of p6P28Family) {
  for (const sign of [-1, 1]) {
    const candidate = receiver.values.map((value, index) =>
      mod29(value + sign * familyCase.key[index])
    );
    for (const target of sixRuneTargets) {
      if (candidate.every((value, index) => value === target.values[index])) {
        p6P28ReceiverHits.push({
          order: familyCase.order,
          lineName: familyCase.lineName,
          sign,
          shell: familyCase.shell,
          key: familyCase.key,
          target: target.word,
        });
      }
    }
  }
}
assert.deepEqual(p6P28ReceiverHits, [{
  order: [1, 0, 2],
  lineName: "DH",
  sign: -1,
  shell: [16, 24, 23, 20, 0, 14],
  key: [20, 7, 7, 7, 13, 4],
  target: "BEWARE",
}]);

const p6P28ManuscriptHits = [];
for (const word of sixRuneWords) {
  for (const familyCase of p6P28Family) {
    for (const sign of [-1, 1]) {
      const candidate = word.values.map((value, index) =>
        mod29(value + sign * familyCase.key[index])
      );
      for (const target of sixRuneTargets) {
        if (candidate.every((value, index) => value === target.values[index])) {
          p6P28ManuscriptHits.push({
            page: word.page,
            start: word.start,
            order: familyCase.order,
            lineName: familyCase.lineName,
            sign,
            target: target.word,
            shell: familyCase.shell,
          });
        }
      }
    }
  }
}
assert.deepEqual(p6P28ManuscriptHits, [{
  page: 38,
  start: 57,
  order: [1, 0, 2],
  lineName: "DH",
  sign: -1,
  target: "BEWARE",
  shell: [16, 24, 23, 20, 0, 14],
}]);

// Compact peer-state key template. The receiver is an Alice-side packet, so
// the peer private field is b. The family charge below does not hard-code b.
const familyHits = [];
for (const [peerName, peer] of Object.entries(state)) {
  for (const [lineName, line] of [["HERE", hereLine], ["DH", dhLine]]) {
    for (const sign of [-1, 1]) {
      const shell = [
        mod29(state.K - peer),
        mod29(-state.g),
        state.p,
        line[state.p - 1],
        0,
        mod29(-peer),
      ];
      const key = invertHShell(shell);
      const plaintext = receiver.values.map((value, index) => mod29(value + sign * key[index]));
      for (const target of sixRuneTargets) {
        if (plaintext.every((value, index) => value === target.values[index])) {
          familyHits.push({
            peerName,
            peer,
            lineName,
            sign,
            shell,
            key,
            target: target.word,
          });
        }
      }
    }
  }
}

assert.deepEqual(familyHits, [{
  peerName: "b",
  peer: state.b,
  lineName: "DH",
  sign: -1,
  shell: [16, 24, 23, 20, 0, 14],
  key: [20, 7, 7, 7, 13, 4],
  target: "BEWARE",
}]);

// The same shell compresses entirely to signed-word direction-graph topology.
// p-e=20 independently equals the literal p28 DH[p] lookup.
const topologyShell = [
  mod29(topologyState.K - topologyState.b),
  mod29(-topologyState.g),
  topologyState.p,
  mod29(topologyState.p - topologyState.e),
  mod29(topologyState.e - topologyState.e),
  mod29(-topologyState.b),
];
assert.deepEqual(topologyShell, [16, 24, 23, 20, 0, 14]);
assert.deepEqual(topologyShell, familyHits[0].shell);
assert.equal(mod29(topologyState.p - topologyState.e), dhLine[state.p - 1]);

const exact = familyHits[0];
assert.deepEqual(exact.shell, hShell(exact.key));
const plaintext = receiver.values.map((value, index) => mod29(value - exact.key[index]));
assert.deepEqual(plaintext, beware.values);
const replay = plaintext.map((value, index) => mod29(value + exact.key[index]));
assert.deepEqual(replay, receiver.values);

// Exact-key manuscript-wide charge.
const targetMap = new Map(sixRuneTargets.map((target) => [target.values.join(","), target.word]));
const manuscriptHits = [];
for (const word of sixRuneWords) {
  for (const sign of [-1, 1]) {
    const candidate = word.values.map((value, index) => mod29(value + sign * exact.key[index]));
    const target = targetMap.get(candidate.join(","));
    if (target) {
      manuscriptHits.push({
        page: word.page,
        ordinal: word.ordinal,
        start: word.start,
        end: word.end,
        cipher: word.values,
        sign,
        plaintext: candidate,
        target,
      });
    }
  }
}

assert.deepEqual(manuscriptHits, [{
  page: 38,
  ordinal: 11,
  start: 57,
  end: 62,
  cipher: [8, 25, 14, 2, 17, 22],
  sign: -1,
  plaintext: beware.values,
  target: "BEWARE",
}]);

// Precommitted fresh transfer: source-assigned p0 VERIFY at offsets177..182.
// The exact p38 key and subtraction direction were frozen before these values
// were opened in the Agent7 invocation. The transfer must fail without rescue.
const verify = signedWords.find((word) => word.word === "VERIFY");
assert.ok(verify);
const p0 = pages.get(0);
assert.ok(p0);
const verifyReceiver = p0.find((word) => word.start === 177 && word.end === 182);
assert.ok(verifyReceiver);
assert.deepEqual(verifyReceiver.values, [0, 14, 25, 13, 6, 14]);

const p6P28VerifyHits = [];
for (const familyCase of p6P28Family) {
  for (const sign of [-1, 1]) {
    const candidate = verifyReceiver.values.map((value, index) =>
      mod29(value + sign * familyCase.key[index])
    );
    for (const target of sixRuneTargets) {
      if (candidate.every((value, index) => value === target.values[index])) {
        p6P28VerifyHits.push({
          order: familyCase.order,
          lineName: familyCase.lineName,
          sign,
          target: target.word,
          shell: familyCase.shell,
        });
      }
    }
  }
}
assert.deepEqual(p6P28VerifyHits, []);

// The stronger p6-only role family also transfers unchanged to VERIFY and
// yields no authenticated six-rune target.
const packetRoleVerifyHits = [];
let packetRoleVerifyCases = 0;
for (let targetSlot = 0; targetSlot < 4; targetSlot += 1) {
  const remaining = [0, 1, 2, 3].filter((index) => index !== targetSlot);
  for (const d0Slot of remaining) {
    for (const s0Slot of remaining) {
      if (s0Slot === d0Slot) continue;
      for (const s2Slot of remaining) {
        if (s2Slot === d0Slot || s2Slot === s0Slot) continue;
        const shell = [
          p6PacketFirstWord[d0Slot],
          p6PacketFirstWord[s0Slot],
          packetState.p,
          mod29(packetState.p - packetState.e),
          0,
          p6PacketFirstWord[s2Slot],
        ];
        const key = invertHShell(shell);
        const admissibleTargets = sixRuneTargets.filter((target) =>
          target.values[0] === p6PacketFirstWord[targetSlot]
        );
        for (const sign of [-1, 1]) {
          packetRoleVerifyCases += 1;
          const candidate = verifyReceiver.values.map((value, index) =>
            mod29(value + sign * key[index])
          );
          for (const target of admissibleTargets) {
            if (candidate.every((value, index) => value === target.values[index])) {
              packetRoleVerifyHits.push({
                targetSlot,
                d0Slot,
                s0Slot,
                s2Slot,
                sign,
                target: target.word,
              });
            }
          }
        }
      }
    }
  }
}
assert.equal(packetRoleVerifyCases, 48);
assert.deepEqual(packetRoleVerifyHits, []);

const verifyTransfer = verifyReceiver.values.map((value, index) => mod29(value - exact.key[index]));
assert.deepEqual(verifyTransfer, [9, 7, 18, 6, 22, 10]);
assert.notDeepEqual(verifyTransfer, verify.values);

console.log(JSON.stringify({
  status: "PASS: p38 section-5 BEWARE has one compact DH-shell inverse",
  sourceSelector: {
    receiver: {
      page: receiver.page,
      start: receiver.start,
      end: receiver.end,
      cipher: receiver.values,
      gp0: receiver.gp0,
    },
    predecessor: luck.word,
    predecessorGp0: luck.gp0,
    p50Token: tokens[receiver.gp0],
    low60: low60(tokens[receiver.gp0]),
    target: beware.word,
  },
  p6MasterPacket: {
    headingWordLengths: p6HeadingLengths,
    headingWordGp0: p6HeadingGp0,
    headingRaw: p6HeadingWords.map((word) => word.values),
    lengthShell: p6LengthShell,
    lengthShellLabels: "[K,-e,g,a]",
    exactFourWordRedSpans,
    p33: {
      receiver: [132, 135],
      shell: p33Shell,
      shellLabels: "[-a,A,K,-K]",
    },
    p40: {
      receiver: [71, 74],
      shell: p40Shell,
      shellLabels: "[-b,A,e,-e]",
    },
  },
  p6FirstWordGrammar: {
    redFourRuneWords: redFourRuneWords.length,
    chargedTemplateCases:
      redFourRuneWords.length * packetFieldEntries.length * packetFieldEntries.length,
    hits: firstWordTemplateHits,
    manuscriptFourRuneWords: completeFourRuneWords.length,
    manuscriptTemplateCases:
      completeFourRuneWords.length * packetFieldEntries.length * packetFieldEntries.length,
    manuscriptHits: firstWordManuscriptHits,
    pageLocalFourWordWindows: pageLocalFourWordWindows.length,
    fullPacketGrammarAssignments:
      pageLocalFourWordWindows.length * packetFieldEntries.length ** 3,
    fullPacketGrammarHits,
    targetInitial: packetTargetInitial,
    sixRuneTargetsWithInitial:
      sixRuneTargets.filter((target) => target.values[0] === packetTargetInitial)
        .map((target) => target.word),
    roleAssignmentCases: packetRoleCases,
    roleAssignmentHits: packetRoleHits,
    verifyRoleAssignmentCases: packetRoleVerifyCases,
    verifyRoleAssignmentHits: packetRoleVerifyHits,
    deterministicShell: [
      p6PacketFirstWord[1],
      p6PacketFirstWord[0],
      packetState.p,
      mod29(packetState.p - packetState.e),
      0,
      p6PacketFirstWord[2],
    ],
    deterministicShellLabels: "[K-b,-g,p,p-e,0,-b]",
  },
  p6P28SixRuneFamily: {
    keys: p6P28Family.length,
    configurationsPerReceiver: p6P28Family.length * 2,
    p38Hits: p6P28ReceiverHits,
    completeSixRuneWords: sixRuneWords.length,
    manuscriptConfigurations: sixRuneWords.length * p6P28Family.length * 2,
    manuscriptHits: p6P28ManuscriptHits,
    p0VerifyHits: p6P28VerifyHits,
  },
  shells: {
    cipher: cipherShell,
    cipherLabels: "[b,a-g,A,b-K,K*a,K-b]",
    plaintext: bewareShell,
    plaintextLabels: "[g-a,a,-b,HERE[B],K*a,K]",
    key: exact.shell,
    keyLabels: "[K-b,-g,p,DH[p],0,-b]",
  },
  directionGraphTopology: {
    cycles,
    cycleLengths,
    totalCycleNodes,
    maxDepth,
    basinSizes,
    reconstructed: topologyState,
    topologyShell,
    shellLabels: "[K-b,-g,p,p-e,e-e,-b]",
    pMinusEEqualsDhAtP: mod29(topologyState.p - topologyState.e),
  },
  family: {
    stateFields: Object.keys(state),
    sourceLines: ["HERE", "DH"],
    additiveSigns: [-1, 1],
    configurations: Object.keys(state).length * 2 * 2,
    authenticatedSixRuneTargets: sixRuneTargets.map((target) => target.word),
    hits: familyHits,
  },
  exactInverse: {
    key: exact.key,
    plaintext,
    forwardReplay: replay,
  },
  manuscriptControl: {
    completeSixRuneWords: sixRuneWords.length,
    exactKeyBothSignsTargetHits: manuscriptHits,
  },
  precommittedFreshTransfer: {
    assignedTarget: verify.word,
    receiver: {
      page: verifyReceiver.page,
      start: verifyReceiver.start,
      end: verifyReceiver.end,
      cipher: verifyReceiver.values,
    },
    exactP38Key: exact.key,
    direction: "subtraction",
    result: verifyTransfer,
    pass: false,
  },
  classification:
    "P6 is a source-selected state-packet candidate: its four-word grammar is globally unique across 1,966,113 charged page-window/state assignments; its exact red-title layout encodes [K,-e,g,a]; its first red word is the unique red four-rune instance of [-x,K-y,-y,K+y] and fixes x=g,y=b; the unused K+b field uniquely selects BEWARE among authenticated six-rune targets; all 48 possible field-role/sign assignments leave the exact p38 shell [K-b,-g,p,p-e,0,-b] as the sole hit. The broader p6+p28 family is also manuscript-unique and the p0 VERIFY transfer is zero. Preserve as strong cross-page key-schedule evidence with one retrospective role assignment, not as a universal decoder.",
}, null, 2));
