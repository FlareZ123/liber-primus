"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);
const parts = transcription.split(/^\s*%\s*$/m);

/** @param {number} value */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number} page */
function pageRaw(page) {
  if (page === 50) return "";
  return parts[page < 50 ? page : page - 1] || "";
}

/** @param {string} raw */
function parseWords(raw) {
  const words = [];
  let values = [];
  let offset = 0;
  let start = 0;

  const flush = () => {
    if (!values.length) return;
    words.push({
      start,
      end: offset - 1,
      length: values.length,
      values: values.slice(),
      gp0: values.reduce((sum, value) => sum + value, 0),
    });
    values = [];
  };

  for (const character of raw) {
    if (runeIndex.has(character)) {
      if (!values.length) start = offset;
      values.push(runeIndex.get(character));
      offset += 1;
    } else if (character === "/" || /\s/u.test(character)) {
      // Printed wraps do not terminate a word.
    } else {
      flush();
    }
  }
  flush();
  return { words, runeCount: offset };
}

/**
 * Parse the continuous source transcription. A physical-page marker resets
 * the page-local offset but does not terminate a printed word that carries
 * across the page boundary.
 */
function parseAllWords() {
  const words = [];
  let block = 0;
  let page = 0;
  let offset = 0;
  let startPage = null;
  let start = 0;
  let values = [];

  const flush = () => {
    if (!values.length) return;
    words.push({
      page: startPage,
      endPage: page,
      start,
      end: offset - 1,
      length: values.length,
      values: values.slice(),
      gp0: values.reduce((sum, value) => sum + value, 0),
    });
    startPage = null;
    start = 0;
    values = [];
  };

  for (const character of transcription) {
    if (runeIndex.has(character)) {
      if (!values.length) {
        startPage = page;
        start = offset;
      }
      values.push(runeIndex.get(character));
      offset += 1;
    } else if (character === "/" || /\\s/u.test(character)) {
      // Printed line wraps and whitespace do not terminate words.
    } else if (character === "%") {
      block += 1;
      page = block < 50 ? block : block + 1;
      offset = 0;
    } else {
      flush();
    }
  }
  flush();
  return words;
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
    const token = gpTokens.find((row) => normalized.startsWith(row.symbol, index));
    assert.ok(token, `Unmapped GP text at ${normalized.slice(index)}`);
    values.push(token.value);
    index += token.symbol.length;
  }
  return values;
}

function signedWords() {
  const clear = signed2016
    .split("-----BEGIN PGP SIGNATURE-----")[0]
    .replace(/^-----BEGIN PGP SIGNED MESSAGE-----[\s\S]*?Hash: SHA1\s*/, "")
    .replace(/\b3301\b/g, "")
    .replace(/\b[0-9A-F]{8,}\b/g, "");
  return (clear.match(/[A-Za-z]+/g) || []).map((word, index) => ({
    index,
    word: word.toUpperCase(),
    values: gp(word),
  }));
}

/** Outside-in H serializer for a vector. @param {number[]} values */
function H(values) {
  const shell = [];
  const sums = [];
  for (let left = 0, right = values.length - 1; left < right; left += 1, right -= 1) {
    shell.push(mod29(values[left] - values[right]));
    sums.push(mod29(values[left] + values[right]));
  }
  if (values.length % 2 === 1) shell.push(values[Math.floor(values.length / 2)]);
  shell.push(...sums.reverse());
  return shell;
}

/** Inverse outside-in H serializer. @param {number[]} shell */
function Hinv(shell) {
  const output = Array(shell.length);
  const inverseTwo = 15;
  const pairs = Math.floor(shell.length / 2);
  for (let index = 0; index < pairs; index += 1) {
    const difference = shell[index];
    const sum = shell[shell.length - 1 - index];
    output[index] = mod29((difference + sum) * inverseTwo);
    output[shell.length - 1 - index] = mod29((sum - difference) * inverseTwo);
  }
  if (shell.length % 2 === 1) output[pairs] = shell[pairs];
  return output;
}

const source = signedWords();
assert.equal(source.length, 43);
assert.equal(source[6].word, "SEEKS");
assert.deepEqual(source[6].values, [15, 18, 18, 5, 15]);
const seeksGp0 = source[6].values.reduce((sum, value) => sum + value, 0);
assert.equal(seeksGp0, 71);

// Complete same-index source-state census over authenticated indices that have physical LP2 pages.
const sameIndex = [];
for (const row of source) {
  if (row.index > 55 || row.index === 50) continue;
  const gp0 = row.values.reduce((sum, value) => sum + value, 0);
  const matches = parseWords(pageRaw(row.index)).words.filter(
    (word) => word.length === row.values.length && word.gp0 === gp0
  );
  if (matches.length) {
    sameIndex.push({
      index: row.index,
      word: row.word,
      gp0,
      matches: matches.map((word) => ({ start: word.start, end: word.end })),
    });
  }
}
assert.deepEqual(sameIndex.map((row) => row.index), [6, 11, 21, 33, 34, 38, 40]);


// Charge the index/state premise itself over every signed-word/page pairing.
// State matching alone is common. The p6 conjunction adds a visible red-span
// start exactly at the source GP0 and is unique over all 43 x 43 pairings.
const statePairings = [];
const uniqueStatePairings = [];
const uniqueStateRedStartPairings = [];

for (let page = 0; page < source.length; page += 1) {
  const words = parseWords(pageRaw(page)).words;
  const redStarts = new Set(
    (ink.pages.find((row) => row.page === page)?.red_spans || [])
      .map((span) => span.start)
  );

  for (const row of source) {
    const gp0 = row.values.reduce((sum, value) => sum + value, 0);
    const matches = words.filter(
      (word) => word.length === row.values.length && word.gp0 === gp0
    );
    if (matches.length > 0) {
      statePairings.push({ page, index: row.index, word: row.word, matches: matches.length });
    }
    if (matches.length === 1) {
      const unique = { page, index: row.index, word: row.word, gp0 };
      uniqueStatePairings.push(unique);
      if (redStarts.has(gp0)) uniqueStateRedStartPairings.push(unique);
    }
  }
}

assert.equal(statePairings.length, 295);
assert.equal(uniqueStatePairings.length, 267);
assert.deepEqual(uniqueStateRedStartPairings, [{
  page: 6,
  index: 6,
  word: "SEEKS",
  gp0: 71,
}]);

// SEEKS uniquely selects one p6 complete word by source length and GP0.
const p6 = parseWords(pageRaw(6));
const seeksReceivers = p6.words.filter(
  (word) => word.length === source[6].values.length && word.gp0 === seeksGp0
);
assert.equal(seeksReceivers.length, 1);
const receiver = seeksReceivers[0];
assert.equal(receiver.start, 128);
assert.equal(receiver.end, 132);
assert.deepEqual(receiver.values, [14, 10, 22, 15, 10]);

// The same source GP0 is visibly printed as the p6 lower red-title start.
const p6Ink = ink.pages.find((page) => page.page === 6);
assert.ok(p6Ink);
assert.deepEqual(p6Ink.red_spans, [{
  start: 71,
  length: 11,
  runes: "ᚪᛏᛉᛒᛗᚷᛡᛋᛒᛉᛇ",
}]);
assert.equal(p6Ink.red_spans[0].start, seeksGp0);

const redWords = p6.words.filter(
  (word) => word.start >= 71 && word.end < 82
);
assert.deepEqual(redWords.map((word) => word.length), [4, 1, 4, 2]);
assert.equal(redWords.reduce((sum, word) => sum + word.length, 0), 11);
assert.deepEqual(H(redWords.map((word) => word.length)), [2, 26, 5, 6]); // [K,p+e,g,a]

// The red title begins the second physical section. Its lower black body has 26 words.
const p6Sections = pageRaw(6).split("&");
assert.equal(p6Sections.length, 2);
const lowerWords = parseWords(p6Sections[1]).words;
assert.deepEqual(lowerWords.slice(0, 4).map((word) => word.length), [4, 1, 4, 2]);
assert.equal(lowerWords.length - 4, 26);
const p6BlackBodyWords = p6.words.filter((word) => word.start >= 82);
const receiverBodyOrdinal = p6BlackBodyWords.findIndex((word) => word.start === 128) + 1;
const receiverPageOrdinal = p6.words.findIndex((word) => word.start === 128) + 1;
assert.equal(receiverBodyOrdinal, 10); // K*g
assert.equal(receiverPageOrdinal, 29);

// The established p28 HERE line maps one-based state p=23 to value26, uniquely.
const p28FirstLine = pageRaw(28)
  .split("/")
  .find((line) => /[\u16A0-\u16FF]/u.test(line));
assert.ok(p28FirstLine);
const hereLine = [...p28FirstLine]
  .filter((rune) => runeIndex.has(rune))
  .map((rune) => runeIndex.get(rune));
assert.equal(hereLine.length, 23);
const here26Positions = hereLine
  .map((value, index) => value === 26 ? index + 1 : null)
  .filter((value) => value !== null);
assert.deepEqual(here26Positions, [23]);

// Low-description p6 layout shell:
// replace the singleton title slot with the red-title total, then append
// HERE^-1(lower-body word count).
const shell = [
  redWords[0].length,
  p6Ink.red_spans[0].length,
  redWords[2].length,
  redWords[3].length,
  here26Positions[0],
];
assert.deepEqual(shell, [4, 11, 4, 2, 23]);
const key = Hinv(shell);
assert.deepEqual(key, [28, 21, 4, 10, 24]);
assert.deepEqual(H(key), shell);

const plaintext = receiver.values.map((value, index) => mod29(value - key[index]));
assert.deepEqual(plaintext, source[6].values);

// Fixed-key manuscript-wide control: exactly one authenticated five-rune target hit.
const fiveRuneTargets = [];
for (const row of source) {
  if (row.values.length !== 5) continue;
  if (!fiveRuneTargets.some((target) => target.word === row.word)) fiveRuneTargets.push(row);
}
assert.deepEqual(fiveRuneTargets.map((row) => row.word), [
  "HELLO", "EMPTY", "SEEKS", "LIBER", "WORDS", "FOUND", "FALSE",
]);

// Use continuous word segmentation for manuscript-wide controls. Page-local
// parsing above remains appropriate for p6 geometry, but it splits words that
// cross physical-page boundaries and creates false page fragments.
const fiveRuneWords = parseAllWords().filter((word) =>
  word.page <= 55 && word.endPage <= 55 && word.length === 5
);
const crossPageFiveRuneWords = fiveRuneWords.filter((word) => word.page !== word.endPage);
assert.equal(fiveRuneWords.length, 317);
assert.equal(crossPageFiveRuneWords.length, 6);

const receiverStateShell = [4, 24, 22, 25, 24]; // [q,-g,p-1,p+K,-g]
assert.deepEqual(H(receiver.values), receiverStateShell);
const receiverStateShellHits = fiveRuneWords
  .filter((word) => H(word.values).every((value, index) => value === receiverStateShell[index]))
  .map((word) => ({ page: word.page, start: word.start }));
assert.deepEqual(receiverStateShellHits, [{ page: 6, start: 128 }]);

const fixedKeyHits = [];
for (const word of fiveRuneWords) {
  for (const target of fiveRuneTargets) {
    for (const sign of [-1, 1]) {
      const output = word.values.map((value, index) => mod29(value + sign * key[index]));
      if (output.every((value, index) => value === target.values[index])) {
        fixedKeyHits.push({
          page: word.page,
          start: word.start,
          sign,
          target: target.word,
        });
      }
    }
  }
}
assert.deepEqual(fixedKeyHits, [{ page: 6, start: 128, sign: -1, target: "SEEKS" }]);

// Charge the local layout serialization instead of accepting the one fitted form.
// Family dimensions:
//   title direction: forward/reverse (2)
//   replace no slot or exactly one of four title-length slots by total (5)
//   body scalar: direct 26 or HERE-inverse 23 (2)
//   body placement: first/last (2)
//   key use: direct shell or H^-1(shell) (2)
//   arithmetic sign: +/- (2)
// = 160 configurations.
const titleLengths = [4, 1, 4, 2];
const bodyScalars = [
  ["direct-body", 26],
  ["HERE-inverse", 23],
];
const familyHits = [];
let familyConfigurations = 0;

for (const orientation of ["forward", "reverse"]) {
  for (const replacement of [-1, 0, 1, 2, 3]) {
    for (const [bodyMode, bodyValue] of bodyScalars) {
      for (const placement of ["first", "last"]) {
        for (const keyMode of ["direct", "Hinv"]) {
          for (const sign of [-1, 1]) {
            familyConfigurations += 1;
            const title = orientation === "forward"
              ? titleLengths.slice()
              : titleLengths.slice().reverse();
            if (replacement >= 0) {
              const slot = orientation === "forward" ? replacement : 3 - replacement;
              title[slot] = 11;
            }
            const candidateShell = placement === "last"
              ? [...title, bodyValue]
              : [bodyValue, ...title];
            const candidateKey = keyMode === "Hinv"
              ? Hinv(candidateShell)
              : candidateShell;

            for (const word of fiveRuneWords) {
              for (const target of fiveRuneTargets) {
                const output = word.values.map(
                  (value, index) => mod29(value + sign * candidateKey[index])
                );
                if (output.every((value, index) => value === target.values[index])) {
                  familyHits.push({
                    orientation,
                    replacement,
                    bodyMode,
                    placement,
                    keyMode,
                    sign,
                    shell: candidateShell,
                    key: candidateKey,
                    page: word.page,
                    start: word.start,
                    target: target.word,
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

// First-party semantic charge over the 40 structural shells.
const navigationLabels = new Set(["PATH", "WAY", "MAP", "ROAD"]);
const structuralShells = [];
for (const orientation of ["forward", "reverse"]) {
  for (const replacement of [-1, 0, 1, 2, 3]) {
    for (const [bodyMode, bodyValue] of bodyScalars) {
      for (const placement of ["first", "last"]) {
        const title = orientation === "forward" ? titleLengths.slice() : titleLengths.slice().reverse();
        if (replacement >= 0) {
          const slot = orientation === "forward" ? replacement : 3 - replacement;
          title[slot] = 11;
        }
        const candidateShell = placement === "last" ? [...title, bodyValue] : [bodyValue, ...title];
        const labels = candidateShell.map((value) => source[value]?.word || null);
        const semanticGrammar =
          labels[0] === labels[2] &&
          labels[1] === "IS" &&
          navigationLabels.has(labels[3]) &&
          navigationLabels.has(labels[4]) &&
          labels[3] !== labels[4];
        structuralShells.push({ orientation, replacement, bodyMode, placement, shell: candidateShell, labels, semanticGrammar });
      }
    }
  }
}
assert.equal(structuralShells.length, 40);
assert.equal(new Set(structuralShells.map((row) => row.shell.join(","))).size, 40);
assert.deepEqual(structuralShells.filter((row) => row.semanticGrammar), [{
  orientation: "forward",
  replacement: 1,
  bodyMode: "HERE-inverse",
  placement: "last",
  shell: [4, 11, 4, 2, 23],
  labels: ["EMPTY", "IS", "EMPTY", "PATH", "ROAD"],
  semanticGrammar: true,
}]);

const navigationIndices = new Set(source.filter((row) => navigationLabels.has(row.word)).map((row) => row.index));
const targetNavigation = fiveRuneTargets.map((target) => {
  const targetShell = H(target.values);
  return {
    word: target.word,
    shell: targetShell,
    labels: targetShell.map((value) => source[value]?.word || null),
    distinctNavigation: [...new Set(targetShell.filter((value) => navigationIndices.has(value)))],
  };
});
const maxNavigation = Math.max(...targetNavigation.map((row) => row.distinctNavigation.length));
assert.equal(maxNavigation, 3);
assert.deepEqual(targetNavigation.filter((row) => row.distinctNavigation.length === maxNavigation), [{
  word: "SEEKS",
  shell: [0, 13, 18, 23, 1],
  labels: ["HELLO", "WAY", "MAP", "ROAD", "THE"],
  distinctNavigation: [13, 18, 23],
}]);

assert.equal(familyConfigurations, 160);
assert.deepEqual(familyHits, [{
  orientation: "forward",
  replacement: 1,
  bodyMode: "HERE-inverse",
  placement: "last",
  keyMode: "Hinv",
  sign: -1,
  shell: [4, 11, 4, 2, 23],
  key: [28, 21, 4, 10, 24],
  page: 6,
  start: 128,
  target: "SEEKS",
}]);

// Matched red-span census: p6's [4,1,4,2] exact four-word title shape is unique.
const exactFourWordRed = [];
for (const pageInk of ink.pages) {
  if (pageInk.page > 55 || pageInk.page === 50) continue;
  const parsed = parseWords(pageRaw(pageInk.page));
  for (const span of pageInk.red_spans || []) {
    const words = parsed.words.filter(
      (word) => word.start >= span.start && word.end < span.start + span.length
    );
    const exact = words.length === 4
      && words[0].start === span.start
      && words[3].end === span.start + span.length - 1
      && words.reduce((sum, word) => sum + word.length, 0) === span.length;
    if (exact) {
      exactFourWordRed.push({
        page: pageInk.page,
        start: span.start,
        length: span.length,
        wordLengths: words.map((word) => word.length),
      });
    }
  }
}
assert.deepEqual(exactFourWordRed, [
  { page: 6, start: 71, length: 11, wordLengths: [4, 1, 4, 2] },
  { page: 23, start: 0, length: 16, wordLengths: [2, 6, 3, 5] },
]);

console.log(JSON.stringify({
  status: "PASS",
  classification: "strong local p6 SEEKS candidate; layout serialization recognized after target assignment",
  sourceSelector: {
    signedIndex: 6,
    signedWord: "SEEKS",
    gpLength: 5,
    gp0: seeksGp0,
    physicalPage: 6,
    redTitleStart: p6Ink.red_spans[0].start,
    receiver: { start: receiver.start, end: receiver.end, cipher: receiver.values },
  },
  layout: {
    redTitleWordLengths: redWords.map((word) => word.length),
    redTitleRunes: p6Ink.red_spans[0].length,
    lowerBodyWords: lowerWords.length - 4,
    redTitleLengthH: H(redWords.map((word) => word.length)),
    receiverBodyOrdinal,
    receiverPageOrdinal,
    receiverH: H(receiver.values),
    receiverStateShellHits,
    HEREInverse26: here26Positions[0],
    shell,
    key,
  },
  plaintext: {
    target: "SEEKS",
    values: plaintext,
  },
  controls: {
    sameIndexHits: sameIndex,
    crossPairingCensus: {
      totalPairings: source.length * source.length,
      statePairings: statePairings.length,
      uniqueStatePairings: uniqueStatePairings.length,
      uniqueStatePlusRedStart: uniqueStateRedStartPairings,
      randomPermutationProbability:
        uniqueStateRedStartPairings.length === 1 ? 1 / source.length : null,
    },
    fiveRuneWords: fiveRuneWords.length,
    crossPageFiveRuneWords: crossPageFiveRuneWords.length,
    authenticatedFiveRuneTargets: fiveRuneTargets.map((row) => row.word),
    fixedKeyHits,
    layoutFamilyConfigurations: familyConfigurations,
    layoutFamilyHits: familyHits,
    semanticStructuralShells: structuralShells.filter((row) => row.semanticGrammar),
    targetNavigation,
    exactFourWordRed,
  },
}, null, 2));
