"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const solved = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const grid = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const p50 = grid.rows.flat();
const alpha60 = grid.alphabet;
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

/** @param {string} word */
function gp0(word) {
  const normalized = word
    .toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");
  const tokens = corpus.translit
    .map((symbol, value) => ({symbol: symbol.toUpperCase(), value}))
    .sort((left, right) => right.symbol.length - left.symbol.length);
  let total = 0;
  for (let offset = 0; offset < normalized.length;) {
    if (normalized.startsWith("ING", offset)) {
      total += 21;
      offset += 3;
      continue;
    }
    if (normalized.startsWith("IO", offset)) {
      total += 27;
      offset += 2;
      continue;
    }
    const token = tokens.find(candidate =>
      normalized.startsWith(candidate.symbol, offset)
    );
    assert.ok(token, "unmapped GP spelling: " + normalized.slice(offset));
    total += token.value;
    offset += token.symbol.length;
  }
  return total;
}

/** @param {number} state */
function low60Step(state) {
  if (!Number.isInteger(state) || state < 0 || state >= p50.length) return null;
  const value = alpha60.indexOf(p50[state][1]);
  return value < 0 ? null : value;
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

const dh = {g: 5, K: 2, A: 8, B: 19};
assert.equal((dh.g - dh.K + 29) % 29, 3);
assert.equal(dh.A + dh.B, 27);

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

// Prospectively frozen transfer before opening outputs:
// for every OTHER page whose one-based page-numbered word starts exactly at
// center+1, apply the same semantic rule: center gets one cube; the complete
// word gets one cube per nested shell, i.e. exponent 3^ceil(length/2) mod28.
// No p0/DH receiver fact is used here.
const centerPageWordHoldouts = [];
for (let page = 1; page <= 55; page += 1) {
  if (page === 28 || page === 50) continue;
  const parsed = parseWords(physicalPart(page));
  if (parsed.runes.length % 2 === 0) continue;
  const center = (parsed.runes.length - 1) / 2;
  const index = page - 1;
  if (index >= parsed.words.length) continue;
  const word = parsed.words[index];
  if (word.start !== center + 1) continue;
  const layers = Math.ceil(word.values.length / 2);
  const wordExponent = modPow(3, layers) % 28;
  const output = [
    modPow(parsed.runes[center], 3),
    ...word.values.map((value) => modPow(value, wordExponent)),
  ];
  const latin = translit(output).toLowerCase();
  centerPageWordHoldouts.push({
    page,
    word: page,
    center,
    start: word.start,
    input: translit([parsed.runes[center], ...word.values]),
    wordLength: word.values.length,
    layers,
    wordExponent,
    decoded: latin,
    parses: oneOrTwoWordParses(latin, lexicon),
  });
}

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

// The independently supported native-base60 low-digit state pointer is now an
// external source operation. Charge it against every English parse produced by
// the complete 44-transform × 2-orientation family on the independently fixed
// p28 center/right-edge object. A surviving parse must obey first -> second ->
// FIND(42) -> p28 under one unchanged zero-based low-digit transition.
const sourcePointerHits = [];
for (const hit of sourceObject.phraseHits) {
  for (const parse of hit.parses) {
    if (parse.length !== 2) continue;
    const first = gp0(parse[0]);
    const second = gp0(parse[1]);
    const afterFirst = low60Step(first);
    const afterSecond = low60Step(second);
    const afterFind = low60Step(42);
    if (
      afterFirst === second &&
      afterSecond === 42 &&
      afterFind === 28
    ) {
      sourcePointerHits.push({
        transform: hit.transform,
        kind: hit.kind,
        orientation: hit.orientation,
        latin: hit.latin,
        parse,
        walk: [first, afterFirst, afterSecond, afterFind],
      });
    }
  }
}
assert.deepEqual(sourcePointerHits, [{
  transform: "u-3-27",
  kind: "uniform",
  orientation: "forward",
  latin: "readout",
  parse: ["read", "out"],
  walk: [55, 20, 42, 28],
}]);

// The sole p28 rival parse is LUNG DEAR. Its first state is FIND=42 and it
// immediately jumps to p28, so it cannot satisfy the source-order instruction
// chain that the authenticated 2016 route selects.
const sourceRivalParses = sourceObject.phraseHits.flatMap(hit =>
  hit.parses
    .filter(parse => parse.length === 2)
    .map(parse => ({latin: hit.latin, parse}))
);
assert.ok(sourceRivalParses.some(row =>
  row.parse[0] === "lung" && row.parse[1] === "dear"
));
assert.equal(gp0("LUNG"), 42);
assert.equal(gp0("DEAR"), 55);
assert.equal(low60Step(gp0("LUNG")), 28);


// Language-free selector. Do not score or parse the output as English. Charge
// every raw six-rune output in the complete p28 transform/orientation family
// and every one of its five internal rune-boundary splits. GP0 of each side is
// simply the sum of its canonical rune indices. The independently supported
// low-digit operation must satisfy left -> right -> FIND(42) -> p28.
const rawNumericSelectorHits = [];
for (const transform of transforms) {
  for (const orientation of orientations) {
    let output = renderCandidate(
      p28.runes,
      selected,
      "predecessor",
      transform,
      orientation
    );
    assert.ok(output);
    for (let cut = 1; cut < output.length; cut += 1) {
      const left = output.slice(0, cut);
      const right = output.slice(cut);
      const leftGp0 = left.reduce((sum, value) => sum + value, 0);
      const rightGp0 = right.reduce((sum, value) => sum + value, 0);
      if (
        low60Step(leftGp0) === rightGp0 &&
        low60Step(rightGp0) === 42 &&
        low60Step(42) === 28
      ) {
        rawNumericSelectorHits.push({
          transform: transform.name,
          kind: transform.kind,
          orientation,
          cut,
          output,
          leftGp0,
          rightGp0,
          walk: [leftGp0, rightGp0, 42, 28],
        });
      }
    }
  }
}
assert.equal(transforms.length * orientations.length * 5, 440);
assert.deepEqual(rawNumericSelectorHits, [{
  transform: "u-3-27",
  kind: "uniform",
  orientation: "forward",
  cut: 3,
  output: [4, 28, 23, 3, 1, 16],
  leftGp0: 55,
  rightGp0: 20,
  walk: [55, 20, 42, 28],
}]);
assert.equal(translit(rawNumericSelectorHits[0].output), "READOUT");

// Independent center-ray family: every odd-length unknown page contributes
// the six-rune ray from its exact center to each side. The right ray of p28 is
// exactly the discovery span. This charges the left/right center-boundary rival
// without relying on printed-word selection.
const centerRayObjects = [];
for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  const parsed = parseWords(physicalPart(page));
  if (parsed.runes.length % 2 === 0 || parsed.runes.length < 11) continue;
  const center = (parsed.runes.length - 1) / 2;
  const rays = [
    {side: "left", values: parsed.runes.slice(center - 5, center + 1)},
    {side: "right", values: parsed.runes.slice(center, center + 6)},
  ];
  for (const ray of rays) {
    const phraseHits = [];
    for (const transform of transforms) {
      for (const orientation of orientations) {
        let output = transform.apply(ray.values[0], ray.values.slice(1));
        if (orientation === "reverse") output = output.slice().reverse();
        const latin = translit(output).toLowerCase();
        const parses = oneOrTwoWordParses(latin, lexicon);
        if (parses.length) {
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
    centerRayObjects.push({page, center, side: ray.side, phraseHits});
  }
}
const centerRayPhraseObjects = centerRayObjects.filter(
  (item) => item.phraseHits.length > 0
);
const p28RightRay = centerRayObjects.find(
  (item) => item.page === 28 && item.side === "right"
);
assert.ok(p28RightRay);
assert.ok(p28RightRay.phraseHits.some(
  (hit) => hit.transform === "u-3-27" &&
    hit.orientation === "forward" &&
    hit.latin === "readout"
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

// Lock the audited family counts so future corpus/parser drift is visible.
assert.equal(indexingCensus.length, 1);
assert.deepEqual(indexingCensus[0], {
  page: 28,
  origin: "one-based",
  word: 28,
  center: 134,
  start: 135,
  text: "EAAIUL",
});
assert.equal(unknownObjects, 627);
assert.equal(unknownTransformTrials, 55176);
assert.equal(unknownPhraseTrials, 75);
assert.equal(unknownPhraseObjects.length, 47);
assert.equal(sourceObject.phraseHits.length, 2);
assert.equal(sourceReadOutHits.length, 1);
assert.equal(sourceTransformPhraseObjects.length, 2);
assert.equal(centerRayObjects.length, 64);
assert.equal(centerRayPhraseObjects.length, 4);
assert.deepEqual(
  solvedControls.map((item) => [
    item.name,
    item.objects,
    item.phraseObjects,
    item.transformTrials,
    item.phraseTrials,
  ]),
  [
    ["p56_an_end", 4, 1, 352, 2],
    ["p57_parable", 2, 2, 176, 4],
  ]
);

console.log(JSON.stringify({
  status: "PASS: full pre-output READ OUT family audited",
  exactSource: {
    page: 28,
    sourceExponentMotivation: {
      centerExponent: 3,
      centerDerivation: "g-K mod29",
      wordExponent: 27,
      wordDerivations: ["A+B", "3^3 mod28"],
    },
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
  prospectiveCenterPageWordHoldout: {
    rule: "one-based page word starts center+1; center exp3; word exp 3^ceil(len/2) mod28",
    candidates: centerPageWordHoldouts,
    phraseCandidateCount: centerPageWordHoldouts.filter((item) => item.parses.length > 0).length,
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
    externalLowDigitSelector: {
      rule: "first -> second -> FIND(42) -> p28 under native base60 low digit",
      hits: sourcePointerHits,
    },
    languageFreeNumericSelector: {
      chargedConfigurations: transforms.length * orientations.length * 5,
      rule: "GP0(left) -> GP0(right) -> FIND(42) -> p28 over all raw outputs and rune-boundary splits",
      hits: rawNumericSelectorHits,
    },
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
  centerRayControl: {
    objects: centerRayObjects.length,
    phraseObjects: centerRayPhraseObjects.length,
    phraseObjectFraction: centerRayPhraseObjects.length / centerRayObjects.length,
    p28RightRayPhraseHits: p28RightRay.phraseHits,
  },
  solvedControls,
  decisionRule:
    "The externally supported native-base60 low-digit source route selects u-3-27 / forward / cut3 uniquely across all 440 raw p28 transform-orientation-split configurations before any language scoring. The selected raw output then spells READ OUT. Preserve the charged-family/model chronology caveat while treating this as a language-free external transform selector.",
}, null, 2));
