"use strict";

/**
 * SFT: derive the p33 WILL, p38 BEWARE, and p40 PATHS local key shells
 * directly from authenticated signed-2016 word numbers, their p50 cells,
 * the unique [3,5] red-span geometry, and the already fixed p28 DH lookup.
 *
 * The recipes were recognized after the local inverses were known. The SFT
 * therefore measures mechanism compression and family selectivity; it does
 * not relabel the three candidates as established plaintext.
 */

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

/** @param {number[]} values @returns {number} */
function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

const transcription = read("resources/liber-primus/lp2-transcription.txt");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const signedSource = read("resources/historical/cicada2016-4gq25-outguess.asc");
const grid = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const runeSet = new Set(corpus.runes);
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
    assert.ok(token, "unmapped GP spelling at " + normalized.slice(offset));
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}

/** @returns {Array<{index:number,word:string,values:number[],gp0:number}>} */
function signedWords() {
  const clear = signedSource
    .split("-----BEGIN PGP SIGNATURE-----")[0]
    .replace(/^-----BEGIN PGP SIGNED MESSAGE-----[\s\S]*?Hash: SHA1\s*/, "")
    .replace(/\b3301\b/g, "")
    .replace(/\b[0-9A-F]{8,}\b/g, "");

  return (clear.match(/[A-Za-z]+/g) || []).map((word, index) => {
    const values = gp(word);
    return {
      index,
      word: word.toUpperCase(),
      values,
      gp0: sum(values),
    };
  });
}

/** @param {number} block @returns {number} */
function physicalPage(block) {
  return block >= 50 ? block + 1 : block;
}

/**
 * Parse complete printed words while preserving cross-page continuations.
 * Slash and whitespace are physical layout, not word delimiters.
 *
 * @returns {Array<{
 *   page:number,start:number,end:number,values:number[],length:number,gp0:number
 * }>}
 */
function completeWords() {
  const parts = transcription.split("%").slice(0, 55);
  const pages = parts.map((_, segment) => ({
    page: physicalPage(segment),
    words: [],
  }));
  const offsets = new Array(parts.length).fill(0);

  let values = [];
  let startSegment = 0;
  let endSegment = 0;
  let start = 0;

  const flush = () => {
    if (!values.length) return;
    if (startSegment === endSegment) {
      const page = pages[startSegment];
      page.words.push({
        page: page.page,
        start,
        end: start + values.length - 1,
        values: values.slice(),
        length: values.length,
        gp0: sum(values),
      });
    }
    values = [];
  };

  for (let segment = 0; segment < parts.length; segment += 1) {
    for (const character of parts[segment]) {
      const value = runeIndex.get(character);
      if (value !== undefined) {
        if (!values.length) {
          startSegment = segment;
          start = offsets[segment];
        }
        endSegment = segment;
        values.push(value);
        offsets[segment] += 1;
      } else if (character === "/" || /\s/u.test(character)) {
        // Layout only.
      } else {
        flush();
      }
    }
  }
  flush();

  return pages.flatMap((page) => page.words);
}

/**
 * p50 byte -> GP29 quotient/remainder.
 * @param {number} index
 * @returns {{hi:number,lo:number,byte:number,token:string}}
 */
function cell(index) {
  const byte = grid.byte_rows.flat()[index];
  return {
    hi: Math.floor(byte / 29),
    lo: byte % 29,
    byte,
    token: grid.rows.flat()[index],
  };
}

/** Canonical four-rune H order [d0,d1,s1,s0]. @param {number[]} values */
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
function invertH4(shell) {
  assert.equal(shell.length, 4);
  const inv2 = 15;
  return [
    mod29((shell[0] + shell[3]) * inv2),
    mod29((shell[1] + shell[2]) * inv2),
    mod29((shell[2] - shell[1]) * inv2),
    mod29((shell[3] - shell[0]) * inv2),
  ];
}

/** Pair-interleaved H order [d0,s0,d1,s1,d2,s2]. @param {number[]} values */
function h6(values) {
  assert.equal(values.length, 6);
  const out = [];
  for (let left = 0, right = 5; left < right; left += 1, right -= 1) {
    out.push(mod29(values[left] - values[right]));
    out.push(mod29(values[left] + values[right]));
  }
  return out;
}

/** @param {number[]} shell @returns {number[]} */
function invertH6(shell) {
  assert.equal(shell.length, 6);
  const inv2 = 15;
  const left = [];
  const right = [];
  for (let index = 0; index < shell.length; index += 2) {
    const difference = shell[index];
    const pairSum = shell[index + 1];
    left.push(mod29((difference + pairSum) * inv2));
    right.push(mod29((pairSum - difference) * inv2));
  }
  return [...left, ...right.reverse()];
}

/** @param {number} page @returns {number[][]} */
function runeLines(page) {
  const parts = transcription.split("%").slice(0, 55);
  const segment = page <= 49 ? page : page - 1;
  return parts[segment]
    .trim()
    .split("/")
    .filter((line) => [...line].some((character) => runeSet.has(character)))
    .map((line) =>
      [...line]
        .map((character) => runeIndex.get(character))
        .filter((value) => value !== undefined)
    );
}

const source = signedWords();
assert.equal(source.length, 43);
assert.deepEqual(
  source.slice(33, 43).map((row) => row.word),
  ["WILL", "BE", "FOUND", "GOOD", "LUCK", "BEWARE", "FALSE", "PATHS", "VERIFY", "OPENPGP"]
);

const words = completeWords();
assert.equal(words.length, 2864);
const words4 = words.filter((word) => word.length === 4);
const words6 = words.filter((word) => word.length === 6);
assert.equal(words4.length, 509);
assert.equal(words6.length, 251);

const fourTargets = [...new Map(
  source
    .filter((row) => row.values.length === 4)
    .map((row) => [row.values.join(","), row])
).values()];
const sixTargets = [...new Map(
  source
    .filter((row) => row.values.length === 6)
    .map((row) => [row.values.join(","), row])
).values()];
assert.deepEqual(
  fourTargets.map((row) => row.word),
  ["LIES", "THEIR", "MEANING", "ROAD", "SEEK", "WILL", "GOOD", "LUCK", "PATHS"]
);
assert.deepEqual(sixTargets.map((row) => row.word), ["PRIMUS", "BEWARE", "VERIFY"]);

const fourTargetMap = new Map(fourTargets.map((row) => [row.values.join(","), row]));
const sixTargetMap = new Map(sixTargets.map((row) => [row.values.join(","), row]));

// Visible red [3,5] spans occur only on p33 and p40.
// Their H sum coordinate is A=3+5=8.
const red35 = [];
for (const pageEntry of ink.pages) {
  const pageWords = words.filter((word) => word.page === pageEntry.page);
  for (const span of pageEntry.red_spans || []) {
    const inside = pageWords.filter((word) =>
      word.start >= span.start && word.end < span.start + span.length
    );
    if (
      inside.length === 2 &&
      inside[0].length === 3 &&
      inside[1].length === 5
    ) {
      red35.push({
        page: pageEntry.page,
        start: span.start,
        length: span.length,
        wordLengths: inside.map((word) => word.length),
      });
    }
  }
}
assert.deepEqual(red35, [
  { page: 33, start: 91, length: 8, wordLengths: [3, 5] },
  { page: 40, start: 0, length: 8, wordLengths: [3, 5] },
]);
const A = 3 + 5;
assert.equal(A, 8);

// P28 literal-DH source fixes p and DH[p].
const p28Lines = runeLines(28);
const dhLine = p28Lines[5];
const p = dhLine.length;
const dhAtP = dhLine[p - 1];
assert.equal(p, 23);
assert.deepEqual(dhLine.slice(0, 2), [23, 8]);
assert.equal(dhAtP, 20);

// Source-number cells that matter to the local routes.
assert.deepEqual(cell(33), { hi: 3, lo: 27, byte: 114, token: "1s" });
assert.deepEqual(cell(34), { hi: 6, lo: 23, byte: 197, token: "3H" });
assert.deepEqual(cell(38), { hi: 4, lo: 17, byte: 133, token: "2D" });
assert.deepEqual(cell(39), { hi: 0, lo: 5, byte: 5, token: "05" });
assert.deepEqual(cell(40), { hi: 2, lo: 22, byte: 80, token: "1K" });

// WILL BE recipe.
// For source pair i,i+1:
// shell4 = [low(i+1), A, -low(i), low(i)].
function willBeShell(index) {
  const current = cell(index);
  const next = cell(index + 1);
  return [next.lo, A, mod29(-current.lo), current.lo];
}

const willShell = willBeShell(33);
const willKey = invertH4(willShell);
assert.deepEqual(willShell, [23, 8, 2, 27]);
assert.deepEqual(willKey, [25, 5, 26, 2]);
assert.deepEqual(h4(willKey), willShell);

const p33Will = words.find((word) =>
  word.page === 33 && word.start === 132 && word.end === 135
);
assert.ok(p33Will);
assert.deepEqual(p33Will.values, [3, 15, 17, 22]);
const willPlain = p33Will.values.map((value, index) =>
  mod29(value - willKey[index])
);
assert.deepEqual(willPlain, source[33].values);

// BEWARE FALSE PATHS source triple.
// Let T_i=(hi_i,lo_i). For triple i,i+1,i+2:
// peer = lo_i - hi_(i+2)
// step = lo_(i+1) - hi_(i+2)
function tripleState(index) {
  const first = cell(index);
  const middle = cell(index + 1);
  const last = cell(index + 2);
  return {
    first,
    middle,
    last,
    peer: mod29(first.lo - last.hi),
    step: mod29(middle.lo - last.hi),
  };
}

const warning = tripleState(38);
assert.deepEqual(
  {
    words: source.slice(38, 41).map((row) => row.word),
    cells: [warning.first, warning.middle, warning.last],
    peer: warning.peer,
    step: warning.step,
  },
  {
    words: ["BEWARE", "FALSE", "PATHS"],
    cells: [
      { hi: 4, lo: 17, byte: 133, token: "2D" },
      { hi: 0, lo: 5, byte: 5, token: "05" },
      { hi: 2, lo: 22, byte: 80, token: "1K" },
    ],
    peer: 15,
    step: 3,
  }
);

// PATHS recipe from the warning triple:
// [-peer, A, step, -step].
function warningPathShell(index) {
  const state = tripleState(index);
  return [mod29(-state.peer), A, state.step, mod29(-state.step)];
}

const pathsShell = warningPathShell(38);
const pathsKey = invertH4(pathsShell);
assert.deepEqual(pathsShell, [14, 8, 3, 26]);
assert.deepEqual(pathsKey, [20, 20, 12, 6]);
assert.deepEqual(h4(pathsKey), pathsShell);

const p40Paths = words.find((word) =>
  word.page === 40 && word.start === 71 && word.end === 74
);
assert.ok(p40Paths);
assert.deepEqual(p40Paths.values, [4, 15, 14, 21]);
const pathsPlain = p40Paths.values.map((value, index) =>
  mod29(value - pathsKey[index])
);
assert.deepEqual(pathsPlain, source[40].values);

// BEWARE recipe from the same warning triple plus the already fixed p28 DH
// lookup: [K-peer, -g, p, DH[p], 0, -peer].
function warningBewareShell(index) {
  const state = tripleState(index);
  return [
    mod29(state.last.hi - state.peer),
    mod29(-state.middle.lo),
    p,
    dhAtP,
    state.middle.hi,
    mod29(-state.peer),
  ];
}

const bewareShell = warningBewareShell(38);
const bewareKey = invertH6(bewareShell);
assert.deepEqual(bewareShell, [16, 24, 23, 20, 0, 14]);
assert.deepEqual(bewareKey, [20, 7, 7, 7, 13, 4]);
assert.deepEqual(h6(bewareKey), bewareShell);

const p38Beware = words.find((word) =>
  word.page === 38 && word.start === 57 && word.end === 62
);
assert.ok(p38Beware);
assert.deepEqual(p38Beware.values, [8, 25, 14, 2, 17, 22]);
const bewarePlain = p38Beware.values.map((value, index) =>
  mod29(value - bewareKey[index])
);
assert.deepEqual(bewarePlain, source[38].values);

// Full charged WILL-BE family: 42 source-adjacent recipes x all complete
// four-rune unknown words x both signs x nine distinct four-rune source targets.
const willBeHits = [];
for (let sourceIndex = 0; sourceIndex <= 41; sourceIndex += 1) {
  const shell = willBeShell(sourceIndex);
  const key = invertH4(shell);
  for (const word of words4) {
    for (const sign of [-1, 1]) {
      const output = word.values.map((value, index) =>
        mod29(value + sign * key[index])
      );
      const target = fourTargetMap.get(output.join(","));
      if (target) {
        willBeHits.push({
          sourceIndex,
          sourcePair: [source[sourceIndex].word, source[sourceIndex + 1].word],
          page: word.page,
          start: word.start,
          sign,
          target: target.word,
          targetIndex: target.index,
          identity: word.page === target.index,
          shell,
          key,
        });
      }
    }
  }
}
assert.equal(42 * words4.length * 2 * fourTargets.length, 384804);
assert.deepEqual(willBeHits, [{
  sourceIndex: 33,
  sourcePair: ["WILL", "BE"],
  page: 33,
  start: 132,
  sign: -1,
  target: "WILL",
  targetIndex: 33,
  identity: true,
  shell: [23, 8, 2, 27],
  key: [25, 5, 26, 2],
}]);

// Full charged three-cell four-rune family.
const warningPathHits = [];
for (let sourceIndex = 0; sourceIndex <= 40; sourceIndex += 1) {
  const shell = warningPathShell(sourceIndex);
  const key = invertH4(shell);
  for (const word of words4) {
    for (const sign of [-1, 1]) {
      const output = word.values.map((value, index) =>
        mod29(value + sign * key[index])
      );
      const target = fourTargetMap.get(output.join(","));
      if (target) {
        warningPathHits.push({
          sourceIndex,
          sourceTriple: source.slice(sourceIndex, sourceIndex + 3).map((row) => row.word),
          page: word.page,
          start: word.start,
          sign,
          target: target.word,
          targetIndex: target.index,
          identity: word.page === target.index,
          shell,
          key,
        });
      }
    }
  }
}
assert.equal(41 * words4.length * 2 * fourTargets.length, 375642);
assert.deepEqual(warningPathHits, [
  {
    sourceIndex: 27,
    sourceTriple: ["ARE", "THE", "DIRECTION"],
    page: 34,
    start: 227,
    sign: -1,
    target: "GOOD",
    targetIndex: 36,
    identity: false,
    shell: [6, 8, 3, 26],
    key: [16, 20, 12, 10],
  },
  {
    sourceIndex: 38,
    sourceTriple: ["BEWARE", "FALSE", "PATHS"],
    page: 40,
    start: 71,
    sign: -1,
    target: "PATHS",
    targetIndex: 40,
    identity: true,
    shell: [14, 8, 3, 26],
    key: [20, 20, 12, 6],
  },
]);
assert.deepEqual(
  warningPathHits.filter((row) => row.identity),
  [warningPathHits[1]]
);

// Full charged three-cell six-rune family. The p38 hit is unique even before
// requiring page/index identity.
const warningBewareHits = [];
for (let sourceIndex = 0; sourceIndex <= 40; sourceIndex += 1) {
  const shell = warningBewareShell(sourceIndex);
  const key = invertH6(shell);
  for (const word of words6) {
    for (const sign of [-1, 1]) {
      const output = word.values.map((value, index) =>
        mod29(value + sign * key[index])
      );
      const target = sixTargetMap.get(output.join(","));
      if (target) {
        warningBewareHits.push({
          sourceIndex,
          sourceTriple: source.slice(sourceIndex, sourceIndex + 3).map((row) => row.word),
          page: word.page,
          start: word.start,
          sign,
          target: target.word,
          targetIndex: target.index,
          identity: word.page === target.index,
          shell,
          key,
        });
      }
    }
  }
}
assert.equal(41 * words6.length * 2 * sixTargets.length, 61746);
assert.deepEqual(warningBewareHits, [{
  sourceIndex: 38,
  sourceTriple: ["BEWARE", "FALSE", "PATHS"],
  page: 38,
  start: 57,
  sign: -1,
  target: "BEWARE",
  targetIndex: 38,
  identity: true,
  shell: [16, 24, 23, 20, 0, 14],
  key: [20, 7, 7, 7, 13, 4],
}]);

console.log(JSON.stringify({
  status: "PASS",
  classification:
    "retrospective source-derived key-shell generator; exact local inverses gain direct signed-word/p50 provenance, but the recipes were recognized after the local plaintext candidates",
  sourceObjects: {
    red35,
    p28: { p, dhAtP },
    cells: {
      WILL33: cell(33),
      BE34: cell(34),
      BEWARE38: cell(38),
      FALSE39: cell(39),
      PATHS40: cell(40),
    },
  },
  exact: {
    WILL: { shell: willShell, key: willKey, receiver: p33Will, plaintext: willPlain },
    BEWARE: { shell: bewareShell, key: bewareKey, receiver: p38Beware, plaintext: bewarePlain },
    PATHS: { shell: pathsShell, key: pathsKey, receiver: p40Paths, plaintext: pathsPlain },
  },
  chargedFamilies: {
    willBe: {
      configurations: 384804,
      hits: willBeHits,
    },
    warningPath: {
      configurations: 375642,
      hits: warningPathHits,
      identityHits: warningPathHits.filter((row) => row.identity),
    },
    warningBeware: {
      configurations: 61746,
      hits: warningBewareHits,
    },
  },
}, null, 2));
