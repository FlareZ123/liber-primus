"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const solved = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const parts = transcription.split(/^\s*%\s*$/m);
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const runeSet = new Set(corpus.runes);
const orbit = [1, 3, 9, 27, 25, 19];

/** @param {number} base @param {number} exponent */
function modPow(base, exponent) {
  let out = 1;
  let x = base % 29;
  let e = exponent;
  while (e > 0) {
    if (e & 1) out = (out * x) % 29;
    x = (x * x) % 29;
    e = Math.floor(e / 2);
  }
  return out;
}

/** @param {number[]} values */
function translit(values) {
  return values.map((value) => corpus.translit[value]).join("");
}

/** @param {number} page */
function physicalPart(page) {
  assert.notEqual(page, 50);
  return parts[page <= 49 ? page : page - 1];
}

/** @param {string} text @param {"physical"|"generic"} mode */
function parseWords(text, mode = "physical") {
  const words = [];
  const runes = [];
  let current = [];
  let start = 0;
  const flush = () => {
    if (!current.length) return;
    words.push({start, values: current});
    current = [];
  };
  for (const char of [...text]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      if (current.length === 0) start = runes.length;
      current.push(value);
      runes.push(value);
    } else if (mode === "generic" || char === "-" || char === ".") {
      flush();
    }
  }
  flush();
  return {words, runes};
}

/** @param {string[]} words @param {number} minimumLength */
function makeLexicon(words, minimumLength) {
  return new Set(
    words
      .map((word) => word.toLowerCase())
      .filter((word) => /^[a-z]+$/u.test(word) && word.length >= minimumLength)
  );
}

/** @param {string} text @param {Set<string>} lexicon */
function oneOrTwoWordParses(text, lexicon) {
  const out = [];
  if (lexicon.has(text)) out.push([text]);
  for (let cut = 3; cut <= text.length - 3; cut += 1) {
    const left = text.slice(0, cut);
    const right = text.slice(cut);
    if (lexicon.has(left) && lexicon.has(right)) out.push([left, right]);
  }
  return out;
}

const dictionaryWords = read("resources/control/english_wordfreq_textblob.txt")
  .toLowerCase().split(/\s+/u).filter(Boolean);
for (const relative of [
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/shakespeare_first300k.txt",
  "resources/control/emerson_essays_2944.txt",
  "resources/liber-primus/lp1-plaintext-reference.txt",
]) {
  dictionaryWords.push(...(read(relative).toLowerCase().match(/[a-z]+/gu) || []));
}
const lexicon = makeLexicon(dictionaryWords, 3);

/**
 * The uniform family is an explicit upper bound on every whole-object choice
 * obtainable by iterating cube or inverse-cube any number of times on the
 * boundary rune and five-rune word separately.
 */
const transforms = [];
for (const boundaryExponent of orbit) {
  for (const wordExponent of orbit) {
    transforms.push({
      kind: "uniform",
      name: "u-" + boundaryExponent + "-" + wordExponent,
      apply(boundary, word) {
        return [
          modPow(boundary, boundaryExponent),
          ...word.map((value) => modPow(value, wordExponent)),
        ];
      },
    });
  }
}

/**
 * Charge the natural alternative reading of "three nested layers": apply one
 * cube step per actual shell depth instead of assigning the deepest exponent
 * uniformly to all five runes. Cube and inverse-cube may independently seed
 * the boundary and word, and shell depth may run outer->inner or inner->outer.
 */
for (const boundaryBase of [3, 19]) {
  for (const wordBase of [3, 19]) {
    for (const depthDirection of ["outer-in", "inner-out"]) {
      const depths = depthDirection === "outer-in"
        ? [1, 2, 3, 2, 1]
        : [3, 2, 1, 2, 3];
      const wordExponents = depths.map((depth) =>
        modPow(wordBase, depth) % 28
      );
      transforms.push({
        kind: "per-shell",
        name: "s-" + boundaryBase + "-" + wordBase + "-" + depthDirection,
        apply(boundary, word) {
          return [
            modPow(boundary, boundaryBase),
            ...word.map((value, i) => modPow(value, wordExponents[i])),
          ];
        },
      });
    }
  }
}

assert.equal(transforms.length, 44);

const orientations = ["forward", "reverse"];
const boundarySides = ["predecessor", "successor"];
const familySizePerFiveRuneWord = transforms.length * orientations.length * boundarySides.length;
assert.equal(familySizePerFiveRuneWord, 176);

/**
 * @param {number[]} runes
 * @param {{start:number,values:number[]}} word
 * @param {"predecessor"|"successor"} side
 */
function boundaryRune(runes, word, side) {
  if (side === "predecessor") {
    return word.start > 0 ? runes[word.start - 1] : null;
  }
  const at = word.start + word.values.length;
  return at < runes.length ? runes[at] : null;
}

/**
 * @param {number[]} runes
 * @param {{start:number,values:number[]}} word
 * @param {"predecessor"|"successor"} side
 * @param {object} transform
 * @param {"forward"|"reverse"} orientation
 */
function renderCandidate(runes, word, side, transform, orientation) {
  const boundary = boundaryRune(runes, word, side);
  if (boundary === null) return null;
  let output = transform.apply(boundary, word.values);
  if (side === "successor") {
    // Natural source order for the six-rune object is WORD + boundary.
    output = [...output.slice(1), output[0]];
  }
  if (orientation === "reverse") output = output.slice().reverse();
  return output;
}

function scanParsed(parsed, label) {
  const objects = [];
  let transformTrials = 0;
  let phraseTrials = 0;
  for (let wordIndex = 0; wordIndex < parsed.words.length; wordIndex += 1) {
    const word = parsed.words[wordIndex];
    if (word.values.length !== 5) continue;
    for (const side of boundarySides) {
      if (boundaryRune(parsed.runes, word, side) === null) continue;
      const phraseHits = [];
      for (const transform of transforms) {
        for (const orientation of orientations) {
          transformTrials += 1;
          const output = renderCandidate(
            parsed.runes, word, side, transform, orientation
          );
          const latin = translit(output).toLowerCase();
          const parses = oneOrTwoWordParses(latin, lexicon);
          if (parses.length) {
            phraseTrials += 1;
            phraseHits.push({
              transform: transform.name,
              kind: transform.kind,
              orientation,
              latin,
              parses,
            });
          }
        }
      }
      objects.push({
        label,
        word: wordIndex + 1,
        start: word.start,
        side,
        phraseHits,
      });
    }
  }
  return {objects, transformTrials, phraseTrials};
}

// Exact source reconstruction.
const p28 = parseWords(physicalPart(28));
assert.equal(p28.runes.length, 269);
assert.equal(p28.words.length, 59);
const centerOffset = 134;
const selected = p28.words[27];
assert.deepEqual(selected, {start: 135, values: [28, 24, 10, 1, 20]});
assert.equal(selected.start, centerOffset + 1);
assert.equal(p28.runes[centerOffset], 9);

const sourceTransform = transforms.find((item) => item.name === "u-3-27");
assert.ok(sourceTransform);
const sourceDecoded = renderCandidate(
  p28.runes, selected, "predecessor", sourceTransform, "forward"
);
assert.deepEqual(sourceDecoded, [4, 28, 23, 3, 1, 16]);
assert.equal(translit(sourceDecoded), "READOUT");

// Exact inversion for the frozen source transform.
const reconstructed = [
  modPow(sourceDecoded[0], 19),
  ...sourceDecoded.slice(1).map((value) => modPow(value, 27)),
];
assert.deepEqual(reconstructed, [9, 28, 24, 10, 1, 20]);

// Indexing/boundary selection is evaluated without English.
const indexingCensus = [];
for (let page = 1; page <= 55; page += 1) {
  if (page === 50) continue;
  const parsed = parseWords(physicalPart(page));
  if (parsed.runes.length % 2 === 0) continue;
  const center = (parsed.runes.length - 1) / 2;
  for (const origin of ["one-based", "zero-based"]) {
    const index = origin === "one-based" ? page - 1 : page;
    if (index < 0 || index >= parsed.words.length) continue;
    const word = parsed.words[index];
    if (word.start === center + 1 && word.values.length === 5) {
      indexingCensus.push({
        page,
        origin,
        word: index + 1,
        center,
        start: word.start,
        text: translit(word.values),
      });
    }
  }
}
assert.ok(indexingCensus.some((item) =>
  item.page === 28 &&
  item.origin === "one-based" &&
  item.word === 28 &&
  item.center === 134 &&
  item.start === 135
));

// Full unknown-manuscript family. No downstream p0/DH property is inspected.
const unknownScans = [];
let unknownObjects = 0;
let unknownTransformTrials = 0;
let unknownPhraseTrials = 0;
for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  const scan = scanParsed(parseWords(physicalPart(page)), "p" + page);
  unknownScans.push(...scan.objects.map((item) => ({page, ...item})));
  unknownObjects += scan.objects.length;
  unknownTransformTrials += scan.transformTrials;
  unknownPhraseTrials += scan.phraseTrials;
}

const unknownPhraseObjects = unknownScans.filter((item) => item.phraseHits.length > 0);
const sourceObject = unknownScans.find((item) =>
  item.page === 28 &&
  item.word === 28 &&
  item.side === "predecessor"
);
assert.ok(sourceObject);
const sourceReadOutHits = sourceObject.phraseHits.filter((hit) =>
  hit.latin === "readout"
);
assert.ok(sourceReadOutHits.some((hit) =>
  hit.transform === "u-3-27" && hit.orientation === "forward"
));

// Solved p56/p57 plaintext controls under the exact same family.
const solvedControls = [];
for (const name of ["p56_an_end", "p57_parable"]) {
  const section = solved.sections.find((item) => item.name === name);
  assert.ok(section);
  const scan = scanParsed(parseWords(section.source_text, "generic"), name);
  solvedControls.push({
    name,
    objects: scan.objects.length,
    phraseObjects: scan.objects.filter((item) => item.phraseHits.length > 0).length,
    transformTrials: scan.transformTrials,
    phraseTrials: scan.phraseTrials,
  });
}

const sourceTransformPhraseObjects = unknownScans.filter((item) =>
  item.phraseHits.some((hit) =>
    hit.transform === "u-3-27" && hit.orientation === "forward"
  )
);

console.log(JSON.stringify({
  status: "PASS: full pre-output READ OUT family audited",
  exactSource: {
    page: 28,
    centerOffset,
    selectedWord: 28,
    selectedStart: selected.start,
    sourceSpan: translit([p28.runes[centerOffset], ...selected.values]),
    transform: "u-3-27",
    decoded: translit(sourceDecoded),
    exactReconstruction: translit(reconstructed),
  },
  structuralIndexingCensus: {
    hits: indexingCensus,
    count: indexingCensus.length,
  },
  family: {
    transforms: transforms.length,
    uniformTransforms: transforms.filter((item) => item.kind === "uniform").length,
    perShellTransforms: transforms.filter((item) => item.kind === "per-shell").length,
    orientations: orientations.length,
    boundarySides: boundarySides.length,
    choicesPerFiveRuneWordWithBothSides: familySizePerFiveRuneWord,
  },
  unknownControl: {
    sideObjects: unknownObjects,
    transformTrials: unknownTransformTrials,
    phraseTrials: unknownPhraseTrials,
    phraseObjects: unknownPhraseObjects.length,
    phraseObjectFraction: unknownPhraseObjects.length / unknownObjects,
    sourceObjectPhraseHitCount: sourceObject.phraseHits.length,
    sourceObjectPhraseHits: sourceObject.phraseHits,
    sourceReadOutHitCount: sourceReadOutHits.length,
    frozenSourceTransformPhraseObjects: sourceTransformPhraseObjects.length,
    frozenSourceTransformHits: sourceTransformPhraseObjects.map((item) => ({
      page: item.page,
      word: item.word,
      start: item.start,
      side: item.side,
      hits: item.phraseHits.filter((hit) =>
        hit.transform === "u-3-27" && hit.orientation === "forward"
      ),
    })),
  },
  solvedControls,
  decisionRule:
    "Do not promote READ OUT from language selectivity alone if the charged pre-output family makes phrase hits common. A surviving claim also requires an untouched consequence from the frozen source transform.",
}, null, 2));
