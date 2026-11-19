"use strict";

/**
 * P38 numbered-section-5 BEWARE state selector and frozen-family holdout.
 *
 * The base60-low/zero-origin p50 component was fixed upstream by the p28
 * READ OUT route. This test uses only original LP2 structure plus authenticated
 * signed2016 / solved p56-p57 source words to label section starts. It then
 * applies Agent19's already frozen 48-case BEWARE shell family unchanged to
 * the selected p38 receiver.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");

const transcription = read("resources/liber-primus/lp2-transcription.txt");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const signedSource = read("resources/historical/cicada2016-4gq25-outguess.asc");
const solved = JSON.parse(
  read("resources/external/relikd-solved-gp29-native-v1.json")
);

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const runeSet = new Set(corpus.runes);
const tape = grid.pages.flatMap((page) => page.tokens);
const alphabet = grid.alphabet;
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);

assert.equal(tape.length, 256);
assert.equal(alphabet.length, 60);

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
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
    const token = gpTokens.find((candidate) =>
      normalized.startsWith(candidate.symbol, offset)
    );
    assert.ok(token, "unmapped GP spelling: " + normalized.slice(offset));
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}

/** @param {number[]} values @returns {number} */
function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

/** @param {string[]} tokens @param {number} address @returns {number|null} */
function low60(tokens, address) {
  if (!Number.isInteger(address) || address < 0 || address >= tokens.length) {
    return null;
  }
  const value = alphabet.indexOf(tokens[address][1]);
  return value < 0 ? null : value;
}

/** @returns {Array<object>} */
function signedWords() {
  const clear = signedSource
    .split("-----BEGIN PGP SIGNATURE-----")[0]
    .split(/\r?\n\r?\n/)
    .slice(1)
    .join("\n");

  return clear
    .split(/[^A-Za-z0-9]+/)
    .filter((token) => /^[A-Za-z]+$/.test(token))
    .map((word, index) => {
      const values = gp(word);
      return {
        source: "signed",
        index,
        label: word.toUpperCase(),
        values,
        length: values.length,
        gp0: sum(values),
      };
    });
}

/**
 * @param {object} section
 * @param {string} source
 * @returns {Array<object>}
 */
function runeWords(section, source) {
  const words = [];
  let current = [];

  for (const char of [...section.source_text]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      current.push(value);
    } else if (current.length) {
      words.push({
        source,
        index: words.length,
        label: current.map((item) => corpus.translit[item]).join(""),
        values: current.slice(),
        length: current.length,
        gp0: sum(current),
      });
      current = [];
    }
  }
  if (current.length) {
    words.push({
      source,
      index: words.length,
      label: current.map((item) => corpus.translit[item]).join(""),
      values: current.slice(),
      length: current.length,
      gp0: sum(current),
    });
  }
  return words;
}

const signed = signedWords();
const sourceCorpora = {
  signed,
  p56: runeWords(
    solved.sections.find((section) => section.name === "p56_an_end"),
    "p56"
  ),
  p57: runeWords(
    solved.sections.find((section) => section.name === "p57_parable"),
    "p57"
  ),
};

assert.equal(sourceCorpora.signed.length, 43);
assert.deepEqual(
  signed.slice(35, 43).map((word) => word.label),
  ["FOUND", "GOOD", "LUCK", "BEWARE", "FALSE", "PATHS", "VERIFY", "OPENPGP"]
);
assert.equal(signed[37].gp0, 31);
assert.equal(signed[38].gp0, 88);
assert.equal(signed[38].length, 6);
assert.equal(tape[88], "3V");
assert.equal(low60(tape, 88), 31);

const predecessorCandidates = [];
for (const words of Object.values(sourceCorpora)) {
  for (let index = 1; index < words.length; index += 1) {
    predecessorCandidates.push({
      selected: words[index],
      predecessor: words[index - 1],
    });
  }
}

// The visible Arabic markers 1-5 span physical p36-p38.
const parts = transcription.split(/^\s*%\s*$/m);
const numberedText = [parts[36], parts[37], parts[38]].join("\n");
const markers = [...numberedText.matchAll(/([1-5])-/g)];
assert.deepEqual(markers.map((match) => Number(match[1])), [1, 2, 3, 4, 5]);

const sectionStarts = [];
for (let markerIndex = 0; markerIndex < markers.length; markerIndex += 1) {
  const marker = markers[markerIndex];
  const section = Number(marker[1]);
  const begin = marker.index + marker[0].length;
  const end =
    markerIndex + 1 < markers.length
      ? markers[markerIndex + 1].index
      : numberedText.length;
  const chunk = numberedText.slice(begin, end);
  const values = [];

  for (const char of [...chunk]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      values.push(value);
    } else if ((char === "-" || char === ".") && values.length) {
      break;
    }
  }

  sectionStarts.push({
    section,
    values,
    length: values.length,
    gp0: sum(values),
  });
}

assert.deepEqual(
  sectionStarts.map((row) => [row.section, row.length, row.gp0]),
  [
    [1, 4, 56],
    [2, 4, 67],
    [3, 3, 37],
    [4, 7, 100],
    [5, 6, 88],
  ]
);

/**
 * @param {string[]} tokens
 * @returns {Array<object>}
 */
function sectionStateHits(tokens) {
  const hits = [];
  for (const start of sectionStarts) {
    for (const candidate of predecessorCandidates) {
      if (
        candidate.selected.length !== start.length ||
        candidate.selected.gp0 !== start.gp0
      ) {
        continue;
      }
      if (low60(tokens, start.gp0) !== candidate.predecessor.gp0) continue;
      hits.push({
        section: start.section,
        selected: candidate.selected,
        predecessor: candidate.predecessor,
        token: tokens[start.gp0],
      });
    }
  }
  return hits;
}

const observedSectionHits = sectionStateHits(tape);
assert.equal(observedSectionHits.length, 1);
assert.equal(observedSectionHits[0].section, 5);
assert.equal(observedSectionHits[0].selected.source, "signed");
assert.equal(observedSectionHits[0].selected.label, "BEWARE");
assert.equal(observedSectionHits[0].predecessor.label, "LUCK");

// Parse all complete words wholly contained on one physical unknown page.
const unknownSegments = parts.slice(0, 55);
const unknownPages = unknownSegments.map((text, segment) => ({
  page: segment >= 50 ? segment + 1 : segment,
  words: [],
  offset: 0,
}));
let current = [];
let startSegment = 0;
let endSegment = 0;
let startOffset = 0;

function flushUnknownWord() {
  if (!current.length) return;
  if (startSegment === endSegment) {
    const page = unknownPages[startSegment];
    page.words.push({
      page: page.page,
      ordinal: page.words.length,
      start: startOffset,
      end: startOffset + current.length - 1,
      values: current.slice(),
      length: current.length,
      gp0: sum(current),
    });
  }
  current = [];
}

for (let segment = 0; segment < unknownSegments.length; segment += 1) {
  for (const char of [...unknownSegments[segment]]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      if (!current.length) {
        startSegment = segment;
        startOffset = unknownPages[segment].offset;
      }
      endSegment = segment;
      current.push(value);
      unknownPages[segment].offset += 1;
    } else if (char === "/" || /\s/u.test(char)) {
      // Line/page wrap can continue a word.
    } else {
      flushUnknownWord();
    }
  }
}
flushUnknownWord();

const unknownWords = unknownPages.flatMap((page) => page.words);
assert.equal(unknownWords.length, 2864);

const bewareStateReceivers = unknownWords.filter(
  (word) =>
    word.length === signed[38].length &&
    word.gp0 === signed[38].gp0 &&
    low60(tape, word.gp0) === signed[37].gp0
);
assert.deepEqual(
  bewareStateReceivers.map((word) => [word.page, word.ordinal, word.start, word.end]),
  [
    [36, 37, 180, 185],
    [38, 11, 57, 62],
    [49, 16, 60, 65],
  ]
);

// Exact-token-multiset calibration for the complete source-predecessor family.
/** @param {number} seed @returns {() => number} */
function makeRng(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

/**
 * @param {string[]} source
 * @param {() => number} random
 * @returns {string[]}
 */
function shuffled(source, random) {
  const result = source.slice();
  for (let index = result.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}

const permutationCount = 100000;
const random = makeRng(0x24be5afe);
let familyTailCount = 0;
let exactBewareCount = 0;
let totalHits = 0;
const histogram = {};

for (let trial = 0; trial < permutationCount; trial += 1) {
  const hits = sectionStateHits(shuffled(tape, random));
  totalHits += hits.length;
  histogram[hits.length] = (histogram[hits.length] || 0) + 1;
  if (hits.length >= observedSectionHits.length) familyTailCount += 1;
  if (
    hits.some(
      (hit) =>
        hit.section === 5 &&
        hit.selected.source === "signed" &&
        hit.selected.label === "BEWARE"
    )
  ) {
    exactBewareCount += 1;
  }
}

assert.equal(familyTailCount, 4576);
assert.equal(exactBewareCount, 1215);
assert.deepEqual(histogram, { 0: 95424, 1: 2698, 2: 1849, 3: 29 });

// Frozen Agent19 BEWARE family transfer, unchanged.
const state = { p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2, e: 3 };
const roles = [
  { name: "Alice-self", u: state.a, U: state.A, v: state.b, V: state.B },
  { name: "Bob-self", u: state.b, U: state.B, v: state.a, V: state.A },
];

/** @param {number[]} shell @returns {number[]} */
function hInverse(shell) {
  const key = new Array(shell.length);
  const inverse2 = 15;
  const pairs = Math.floor(shell.length / 2);
  for (let pair = 0; pair < pairs; pair += 1) {
    const difference = shell[2 * pair];
    const pairSum = shell[(2 * pair) + 1];
    key[pair] = mod29((difference + pairSum) * inverse2);
    key[shell.length - 1 - pair] =
      mod29((pairSum - difference) * inverse2);
  }
  if (shell.length % 2 === 1) key[pairs] = shell.at(-1);
  return key;
}

const p38Section5 = bewareStateReceivers.find(
  (word) => word.page === 38 && word.start === 57
);
assert.ok(p38Section5);
assert.deepEqual(p38Section5.values, [8, 25, 14, 2, 17, 22]);

const sixRuneTargets = new Map();
for (const word of signed) {
  if (word.values.length !== 6) continue;
  sixRuneTargets.set(word.values.join(","), word.label);
}

const frozenFamilyHits = [];
for (const role of roles) {
  for (const [sName, s] of [["g", state.g], ["e", state.e], ["K", state.K]]) {
    for (const firstSign of [-1, 1]) {
      for (const secondSign of [-1, 1]) {
        const keyShell = [
          s,
          role.V,
          role.V,
          mod29(role.U + (firstSign * role.u)),
          mod29(state.K * role.u),
          mod29(role.v + (secondSign * state.K)),
        ];
        const key = hInverse(keyShell);
        for (const sign of [-1, 1]) {
          const plain = p38Section5.values.map((value, index) =>
            mod29(value + (sign * key[index]))
          );
          const target = sixRuneTargets.get(plain.join(","));
          if (target) {
            frozenFamilyHits.push({
              role: role.name,
              s: sName,
              firstSign,
              secondSign,
              sign,
              keyShell,
              key,
              target,
            });
          }
        }
      }
    }
  }
}

assert.equal(roles.length * 3 * 2 * 2 * 2, 48);
assert.deepEqual(frozenFamilyHits, []);

const p0BewareKey = [12, 2, 0, 17, 12, 7];
const p0KeyTransfer = p38Section5.values.map((value, index) =>
  mod29(value - p0BewareKey[index])
);
assert.deepEqual(p0KeyTransfer, [25, 23, 14, 14, 5, 15]);
assert.notDeepEqual(p0KeyTransfer, gp("BEWARE"));

console.log(JSON.stringify({
  status: "PASS",
  classification:
    "positive source-state selector for BEWARE at the authored p38 section-5 start; frozen p0 BEWARE rune-level family transfer fails, so this is a plaintext-state candidate without a decoder",
  sectionStarts: sectionStarts.map((row) => ({
    section: row.section,
    length: row.length,
    gp0: row.gp0,
    token: row.gp0 < 256 ? tape[row.gp0] : null,
    low60: low60(tape, row.gp0),
  })),
  observedSectionHits: observedSectionHits.map((hit) => ({
    section: hit.section,
    selected: [hit.selected.source, hit.selected.label],
    predecessor: [hit.predecessor.source, hit.predecessor.label],
    token: hit.token,
  })),
  manuscriptBewareStateReceivers: bewareStateReceivers.map((word) => ({
    page: word.page,
    ordinal: word.ordinal,
    start: word.start,
    end: word.end,
  })),
  permutationCalibration: {
    trials: permutationCount,
    seed: "0x24be5afe",
    meanHits: totalHits / permutationCount,
    familywiseTail: (familyTailCount + 1) / (permutationCount + 1),
    exactBewareTail: (exactBewareCount + 1) / (permutationCount + 1),
    histogram,
  },
  frozenBewareFamilyTransfer: {
    configs: 48,
    hits: frozenFamilyHits,
    exactP0BewareKey: p0BewareKey,
    exactP0KeyOutput: p0KeyTransfer,
  },
}, null, 2));
