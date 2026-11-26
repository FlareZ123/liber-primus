"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");

function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}
function mod29(value) {
  return ((value % 29) + 29) % 29;
}
function permutations(values) {
  if (values.length === 1) return [values];
  const out = [];
  for (let i = 0; i < values.length; i += 1) {
    for (const tail of permutations(values.slice(0, i).concat(values.slice(i + 1)))) {
      out.push([values[i], ...tail]);
    }
  }
  return out;
}
function keyFrom(outerSum, outerDiff, innerSum, innerDiff) {
  const inv2 = 15;
  return [
    mod29((outerSum + outerDiff) * inv2),
    mod29((innerSum + innerDiff) * inv2),
    mod29((innerSum - innerDiff) * inv2),
    mod29((outerSum - outerDiff) * inv2),
  ];
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const pageParts = transcription.split(/^\s*%\s*$/m);
const runeToValue = new Map(corpus.runes.map((rune, value) => [rune, value]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((a, b) => b.symbol.length - a.symbol.length);

function gp(word) {
  const normalized = word
    .toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");
  const out = [];
  for (let index = 0; index < normalized.length;) {
    if (normalized.startsWith("ING", index)) {
      out.push(21);
      index += 3;
      continue;
    }
    if (normalized.startsWith("IO", index)) {
      out.push(27);
      index += 2;
      continue;
    }
    const token = gpTokens.find((row) => normalized.startsWith(row.symbol, index));
    assert.ok(token, "unmapped GP spelling at " + normalized.slice(index));
    out.push(token.value);
    index += token.symbol.length;
  }
  return out;
}

const sourceBody = signed2016.slice(
  signed2016.indexOf("Hello."),
  signed2016.indexOf("-----BEGIN PGP SIGNATURE-----")
);
const signedWords = sourceBody.match(/[A-Za-z]+/g).map((word) => word.toUpperCase());
assert.equal(signedWords.length, 43);
assert.equal(signedWords[35], "FOUND");
assert.equal(signedWords[36], "GOOD");

function physicalPart(page) {
  assert.notEqual(page, 50, "p50 is the rune-free numeric table");
  return pageParts[page <= 49 ? page : page - 1];
}

// This page-local parser treats the physical page boundary as a reset.
// It is used only for the proposed page-local ordinal selector.
function pageLocalWords(page) {
  const out = [];
  let current = [];
  let start = 0;
  let offset = 0;
  function flush() {
    if (!current.length) return;
    out.push({
      ordinal: out.length + 1,
      start,
      end: offset - 1,
      values: current.slice(),
    });
    current = [];
  }
  for (const character of [...physicalPart(page)]) {
    const value = runeToValue.get(character);
    if (value !== undefined) {
      if (!current.length) start = offset;
      current.push(value);
      offset += 1;
    } else if (character === "/" || /\s/u.test(character)) {
      // Printed line breaks and whitespace do not end a word.
    } else {
      flush();
    }
  }
  flush();
  return out;
}

// This stricter parser carries a possible word across physical page breaks,
// then retains only complete words wholly contained on one unknown page.
// It is used for the manuscript-wide fixed-key control.
const unknownSegments = pageParts.slice(0, 55); // p0..p49, then p51..p55
const pages = unknownSegments.map((_, segment) => ({
  page: segment >= 50 ? segment + 1 : segment,
  words: [],
  offset: 0,
}));
let current = [];
let startSegment = 0;
let endSegment = 0;
let startOffset = 0;
function flushCompleteWord() {
  if (!current.length) return;
  if (startSegment === endSegment) {
    const page = pages[startSegment];
    page.words.push({
      index: page.words.length,
      start: startOffset,
      end: startOffset + current.length - 1,
      values: current.slice(),
    });
  }
  current = [];
}
for (let segment = 0; segment < unknownSegments.length; segment += 1) {
  for (const character of [...unknownSegments[segment]]) {
    const value = runeToValue.get(character);
    if (value !== undefined) {
      if (!current.length) {
        startSegment = segment;
        startOffset = pages[segment].offset;
      }
      endSegment = segment;
      current.push(value);
      pages[segment].offset += 1;
    } else if (character === "/" || /\s/u.test(character)) {
      // Printed line breaks and whitespace do not end a word.
    } else {
      flushCompleteWord();
    }
  }
}
flushCompleteWord();

const completeWords = pages.flatMap((page) =>
  page.words.map((word) => ({ page: page.page, ...word }))
);
const fourRuneWords = completeWords.filter((word) => word.values.length === 4);
assert.equal(fourRuneWords.length, 509);

const p0MarkerCount = 13; // counted from the original p0 JPEG
const p57TerminalMarkerCount = 23; // counted from the original p57 JPEG
const prefixPhrase = "EPIPHANY SEEKS";
const fullPhrase = "EPIPHANY SEEKS THE DEVOTED";
const prefixLength = prefixPhrase.replace(/[^A-Z]/g, "").length;
const fullLength = fullPhrase.replace(/[^A-Z]/g, "").length;
assert.equal(prefixLength, 13);
assert.equal(fullLength, 23);
const selectedOffset = p0MarkerCount + p57TerminalMarkerCount;
const selectedPageWordOrdinal = p57TerminalMarkerCount - p0MarkerCount;
assert.equal(selectedOffset, 36);
assert.equal(selectedPageWordOrdinal, 10);

const p2PageLocalWord10 = pageLocalWords(2)[selectedPageWordOrdinal - 1];
assert.deepEqual(p2PageLocalWord10, {
  ordinal: 10,
  start: 36,
  end: 39,
  values: [1, 2, 8, 26],
});
const p2CompletePage = pages.find((page) => page.page === 2);
const p2CompleteWord = p2CompletePage.words.find((word) => word.start === 36);
assert.deepEqual(p2CompleteWord, {
  index: 8,
  start: 36,
  end: 39,
  values: [1, 2, 8, 26],
});

// The p2 page begins with a two-rune page-local fragment while p1 ends in a
// rune without a printed hyphen/period. Thus page-local ordinal10 and the
// whole-manuscript complete-word index8 are distinct, explicit conventions.
const p1End = pageParts[1].replace(/[\/\s]+$/u, "");
const p2Start = pageParts[2].replace(/^\s+/u, "");
assert.ok(runeToValue.has([...p1End].at(-1)));
assert.ok(runeToValue.has([...p2Start][0]));
assert.equal(pageLocalWords(2)[0].values.length, 2);

const K = 2;
const NG = 21;
const V = 4;
const p = 23;
const key = keyFrom(-K, NG, V, p);
assert.deepEqual(key, [24, 28, 5, 3]);
assert.deepEqual(key.map((value) => corpus.translit[value]), ["A", "EA", "C", "O"]);

const cipher = corpus.pages.find((page) => page.page === 2).indices.slice(36, 40);
assert.deepEqual(cipher, [1, 2, 8, 26]);
const good = gp("GOOD");
assert.deepEqual(good, [6, 3, 3, 23]);
const decoded = cipher.map((value, index) => mod29(value - key[index]));
assert.deepEqual(decoded, good);
assert.deepEqual(decoded.map((value, index) => mod29(value + key[index])), cipher);

const h4Shell = [
  mod29(key[0] - key[3]),
  mod29(key[1] - key[2]),
  mod29(key[1] + key[2]),
  mod29(key[0] + key[3]),
];
assert.deepEqual(h4Shell, [NG, p, V, mod29(-K)]);

const sourceFourByValue = new Map();
for (const word of signedWords) {
  const values = gp(word);
  if (values.length === 4) sourceFourByValue.set(values.join(","), { word, values });
}
const sourceFourTargets = [...sourceFourByValue.values()];
assert.equal(sourceFourTargets.length, 9);
const sourceFourMap = new Map(
  sourceFourTargets.map((entry) => [entry.values.join(","), entry.word])
);

// Hold the candidate key fixed and test every complete four-rune word on
// unknown LP2 against every distinct four-rune target in the signed source,
// in both additive directions.
const fixedKeyHits = [];
for (const word of fourRuneWords) {
  for (const sign of [-1, 1]) {
    const output = word.values.map((value, index) => mod29(value + sign * key[index]));
    const target = sourceFourMap.get(output.join(","));
    if (target) {
      fixedKeyHits.push({
        page: word.page,
        wordIndex: word.index,
        start: word.start,
        end: word.end,
        cipher: word.values.slice(),
        sign: sign === -1 ? "subtract" : "add",
        output,
        target,
      });
    }
  }
}
assert.equal(fourRuneWords.length * sourceFourTargets.length * 2, 9162);
assert.deepEqual(fixedKeyHits, [{
  page: 2,
  wordIndex: 8,
  start: 36,
  end: 39,
  cipher: [1, 2, 8, 26],
  sign: "subtract",
  output: [6, 3, 3, 23],
  target: "GOOD",
}]);

// Charge the four source residues over all 24 orders and 16 independent signs.
const restrictedHits = [];
let restrictedAssignments = 0;
for (const values of permutations([K, NG, V, p])) {
  for (let mask = 0; mask < 16; mask += 1) {
    const signed = values.map((value, index) =>
      ((mask >> index) & 1) ? -value : value
    );
    const candidate = keyFrom(...signed);
    restrictedAssignments += 1;
    const output = cipher.map((value, index) => mod29(value - candidate[index]));
    if (output.every((value, index) => value === good[index])) {
      restrictedHits.push({ values, signed, key: candidate });
    }
  }
}
assert.equal(restrictedAssignments, 384);
assert.deepEqual(restrictedHits, [{
  values: [2, 21, 4, 23],
  signed: [-2, 21, 4, 23],
  key: [24, 28, 5, 3],
}]);

// Wider finite source-state pool, preserving the original report's family.
const expandedPool = [2, 3, 4, 5, 6, 8, 12, 15, 19, 21, 23];
const expandedHits = [];
let expandedAssignments = 0;
for (let a = 0; a < expandedPool.length; a += 1) {
  for (let b = 0; b < expandedPool.length; b += 1) {
    if (b === a) continue;
    for (let c = 0; c < expandedPool.length; c += 1) {
      if (c === a || c === b) continue;
      for (let d = 0; d < expandedPool.length; d += 1) {
        if (d === a || d === b || d === c) continue;
        const values = [expandedPool[a], expandedPool[b], expandedPool[c], expandedPool[d]];
        for (let mask = 0; mask < 16; mask += 1) {
          const signed = values.map((value, index) =>
            ((mask >> index) & 1) ? -value : value
          );
          const candidate = keyFrom(...signed);
          expandedAssignments += 1;
          const output = cipher.map((value, index) => mod29(value - candidate[index]));
          if (output.every((value, index) => value === good[index])) {
            expandedHits.push({ signed, key: candidate });
          }
        }
      }
    }
  }
}
assert.equal(expandedAssignments, 126720);
assert.equal(expandedHits.length, 4);
assert.deepEqual(
  [...new Set(expandedHits.map((hit) => hit.key.join(",")))],
  [key.join(",")]
);

// The p2 candidate enters the already documented FOUND<->GOOD source-index
// cycle: GP0(GOOD)=35 -> signed word35 FOUND; the independent p35 receiver
// decrypts to FOUND, whose GP0 is 36 -> signed word36 GOOD.
const found = gp("FOUND");
const goodGp0 = good.reduce((sum, value) => sum + value, 0);
const foundGp0 = found.reduce((sum, value) => sum + value, 0);
assert.equal(goodGp0, 35);
assert.equal(foundGp0, 36);
assert.equal(signedWords[goodGp0], "FOUND");
assert.equal(signedWords[foundGp0], "GOOD");
const p35Cipher = corpus.pages.find((page) => page.page === 35).indices.slice(25, 30);
const p35Key = [19, 14, 18, 15, 17];
const p35Decoded = p35Cipher.map((value, index) => mod29(value - p35Key[index]));
assert.deepEqual(p35Cipher, [19, 17, 19, 24, 11]);
assert.deepEqual(p35Decoded, found);

const result = {
  status: "PASS",
  sourceCoordinate: {
    markerCounts: { p0: p0MarkerCount, p57: p57TerminalMarkerCount },
    signedPhraseLengths: { prefix: prefixLength, full: fullLength },
    page: 2,
    pageLocalGroupOrdinal: 10,
    runeOffset: selectedOffset,
    runeLength: V,
    pageLocalGroup: p2PageLocalWord10,
    wholeManuscriptCompleteWord: p2CompleteWord,
    parserNote: "The p2 first two-rune fragment continues across the p1/p2 page boundary under the continuous-text parser; page-local numbering resets at p2."
  },
  candidate: {
    sourceState: { K, NG, V, p },
    pairInvariants: { outerSum: mod29(-K), outerDiff: NG, innerSum: V, innerDiff: p },
    h4Shell: h4Shell,
    key,
    ciphertext: cipher,
    plaintext: good,
    transliteration: good.map((value) => corpus.translit[value]),
    exactForwardReconstruction: true
  },
  assignmentAudit: {
    restrictedAssignments,
    restrictedHits: restrictedHits.length,
    expandedAssignments,
    expandedHits: expandedHits.length,
    distinctExpandedNumericKeys: 1
  },
  fixedKeyManuscriptControl: {
    completeFourRuneWords: fourRuneWords.length,
    authenticatedTargets: sourceFourTargets.map((entry) => entry.word),
    comparisons: fourRuneWords.length * sourceFourTargets.length * 2,
    hits: fixedKeyHits
  },
  sourceIndexConvergence: {
    goodGp0: goodGp0,
    signedWord35: signedWords[35],
    p35Cipher,
    p35Key,
    p35Decoded,
    foundGp0: foundGp0,
    signedWord36: signedWords[36],
    classification: "cross-result consistency, not independent authentication of the p2 key"
  },
  decision: "Unique exact local inverse under the frozen key; source-coordinate hypothesis is plausible under page-local numbering; H4 slot assignment remains post-hoc, so do not promote to authenticated plaintext or a reusable cipher."
};
const rendered = JSON.stringify(result, null, 2);
console.log(rendered);
if (process.env.RUNNER_TEMP) {
  fs.writeFileSync(path.join(process.env.RUNNER_TEMP, "source-test-output.json"), rendered + "\n", "utf8");
}
