"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/**
 * @param {string} relative
 * @returns {string}
 */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const parts = transcription.split(/^\s*%\s*$/m);
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));

/**
 * @param {number} value
 * @returns {number}
 */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/**
 * @param {[number, number]} pair
 * @returns {[number, number]}
 */
function H(pair) {
  const [left, right] = pair;
  return [mod29(left - right), mod29(left + right)];
}

/**
 * @param {number} base
 * @param {number} exponent
 * @returns {number}
 */
function modPow(base, exponent) {
  let result = 1;
  let factor = base % 29;
  let power = exponent;
  while (power > 0) {
    if (power % 2 === 1) result = (result * factor) % 29;
    factor = (factor * factor) % 29;
    power = Math.floor(power / 2);
  }
  return result;
}

/**
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
function gcd(a, b) {
  let left = Math.abs(a);
  let right = Math.abs(b);
  while (right !== 0) [left, right] = [right, left % right];
  return left;
}

/**
 * @param {number} page
 * @returns {string}
 */
function physicalPart(page) {
  assert.notEqual(page, 50);
  return parts[page <= 49 ? page : page - 1];
}

/**
 * @param {number} page
 * @returns {{start:number,end:number,values:number[]}[]}
 */
function wordRows(page) {
  let offset = 0;
  const words = (physicalPart(page)
    .replace(/\/\s*/gu, "")
    .match(/[\u16A0-\u16FF]+/gu) || []);
  return words.map((word) => {
    const values = [...word].map((rune) => {
      const value = runeIndex.get(rune);
      assert.notEqual(value, undefined);
      return value;
    });
    const row = { start: offset, end: offset + values.length, values };
    offset = row.end;
    return row;
  });
}

/**
 * @param {number} page
 * @param {number} spanStart
 * @returns {number[][]}
 */
function bodyAfterRedSpan(page, spanStart) {
  const pageInk = ink.pages.find((row) => row.page === page);
  assert.ok(pageInk);
  const spans = [...(pageInk.red_spans || [])].sort((a, b) => a.start - b.start);
  const spanIndex = spans.findIndex((span) => span.start === spanStart);
  assert.ok(spanIndex >= 0);
  const span = spans[spanIndex];
  const rows = wordRows(page);
  const start = span.start + span.length;
  const end = spanIndex + 1 < spans.length
    ? spans[spanIndex + 1].start
    : rows.at(-1)?.end ?? start;
  return rows
    .filter((row) => row.start >= start && row.end <= end)
    .map((row) => row.values);
}

/**
 * Transform one word's outer circumference with the frozen forward H.
 * A one-rune word remains a one-rune center.
 * @param {number[]} word
 * @returns {number[]}
 */
function hOuterWord(word) {
  if (word.length === 0) return [];
  if (word.length === 1) return [word[0]];
  return H([word[0], word.at(-1)]);
}

/**
 * @param {number[][]} words
 * @returns {number[]}
 */
function hOuter(words) {
  return words.flatMap(hOuterWord);
}

/**
 * @param {number[]} word
 * @returns {number[]}
 */
function shedWord(word) {
  return word.length <= 2 ? [] : word.slice(1, -1);
}

/**
 * @param {number[][]} words
 * @returns {number[]}
 */
function shed(words) {
  return words.flatMap(shedWord);
}

/**
 * @param {number[]} values
 * @returns {number}
 */
function gp0(values) {
  return values.reduce((sum, value) => sum + value, 0);
}

/**
 * @param {number[]} values
 * @returns {string}
 */
function spell(values) {
  return values.map((value) => corpus.translit[value]).join("");
}

// The circumference route independently selects p39 and its lower black body.
const p39Body = bodyAfterRedSpan(39, 119);
assert.equal(p39Body.length, 28);
assert.equal(p39Body.flat().length, 118);

const p39HOuter = hOuter(p39Body);
const p39Selector = {
  length: p39HOuter.length,
  gp0Mod29: gp0(p39HOuter) % 29,
};
assert.deepEqual(p39Selector, { length: 55, gp0Mod29: 20 });

// The two independently selected route bodies before p39/p53 each contain
// 21 words. One literal shed therefore removes exactly 42 outer runes while
// the remaining interiors are the already frozen page pointers 39 and 53.
const p33Body = bodyAfterRedSpan(33, 0);
const p3Body = bodyAfterRedSpan(3, 119);
const findGp0 = gp0([0, 10, 9, 23]);
assert.equal(findGp0, 42);
assert.deepEqual(
  [
    [33, hOuter(p33Body).length, shed(p33Body).length],
    [3, hOuter(p3Body).length, shed(p3Body).length],
  ],
  [
    [33, findGp0, 39],
    [3, findGp0, 53],
  ]
);

// Charge the same source statistic across every nonempty red-started body.
const redBodySelectorCensus = [];
for (const page of ink.pages) {
  if (page.page === 50) continue;
  const spans = [...(page.red_spans || [])].sort((a, b) => a.start - b.start);
  for (const span of spans) {
    const body = bodyAfterRedSpan(page.page, span.start);
    if (body.length === 0) continue;
    const transformed = hOuter(body);
    redBodySelectorCensus.push({
      page: page.page,
      start: span.start,
      length: transformed.length,
      gp0Mod29: gp0(transformed) % 29,
    });
  }
}
assert.equal(redBodySelectorCensus.length, 15);
assert.deepEqual(
  redBodySelectorCensus
    .filter((row) =>
      row.length === p39Selector.length &&
      row.gp0Mod29 === p39Selector.gp0Mod29
    )
    .map((row) => [row.page, row.start]),
  [[39, 119]]
);
assert.deepEqual(
  redBodySelectorCensus
    .filter((row) => row.length === findGp0)
    .map((row) => [row.page, row.start]),
  [[3, 119], [33, 0]]
);

// Reconstruct the independently selected p28 center + one-based word28 object.
const p28Rows = wordRows(28);
const p28Runes = p28Rows.flatMap((row) => row.values);
assert.equal(p28Runes.length, 269);
const centerOffset = 134;
const selectedWord = p28Rows[27];
assert.equal(selectedWord.start, centerOffset + 1);
assert.deepEqual(
  [p28Runes[centerOffset], ...selectedWord.values],
  [9, 28, 24, 10, 1, 20]
);

// Charge every reversible uniform GP29 power pair, both orientations, and all
// five rune-boundary cuts. The p39 selector is numeric; no language scoring or
// dictionary test occurs inside this family.
const reversibleExponents = Array.from(
  { length: 28 },
  (_, index) => index + 1
).filter((exponent) => gcd(exponent, 28) === 1);
assert.deepEqual(
  reversibleExponents,
  [1, 3, 5, 9, 11, 13, 15, 17, 19, 23, 25, 27]
);

const hits = [];
for (const boundaryExponent of reversibleExponents) {
  for (const wordExponent of reversibleExponents) {
    for (const orientation of ["forward", "reverse"]) {
      let output = [
        modPow(p28Runes[centerOffset], boundaryExponent),
        ...selectedWord.values.map((value) => modPow(value, wordExponent)),
      ];
      if (orientation === "reverse") output = output.slice().reverse();
      for (let cut = 1; cut < output.length; cut += 1) {
        const left = output.slice(0, cut);
        const right = output.slice(cut);
        if (
          gp0(left) === p39Selector.length &&
          gp0(right) === p39Selector.gp0Mod29
        ) {
          hits.push({
            boundaryExponent,
            wordExponent,
            orientation,
            cut,
            output,
            leftGp0: gp0(left),
            rightGp0: gp0(right),
          });
        }
      }
    }
  }
}
assert.equal(
  reversibleExponents.length * reversibleExponents.length * 2 * 5,
  1440
);
assert.deepEqual(hits, [
  {
    boundaryExponent: 3,
    wordExponent: 27,
    orientation: "forward",
    cut: 3,
    output: [4, 28, 23, 3, 1, 16],
    leftGp0: 55,
    rightGp0: 20,
  },
  {
    boundaryExponent: 17,
    wordExponent: 27,
    orientation: "forward",
    cut: 3,
    output: [4, 28, 23, 3, 1, 16],
    leftGp0: 55,
    rightGp0: 20,
  },
]);

const uniqueOutputs = new Set(hits.map((hit) => hit.output.join(",")));
assert.equal(uniqueOutputs.size, 1);

// Widen the input partition itself. Charge every one of the five contiguous
// input cuts, keeping the same reversible exponent/orientation/output-cut
// family. Only cuts after positions1 or2 survive, and both produce the same
// raw output because source rune28=-1 is fixed by every reversible odd power.
const inputSplitHits = [];
for (let inputCut = 1; inputCut < 6; inputCut += 1) {
  const leftInput = [p28Runes[centerOffset], ...selectedWord.values].slice(0, inputCut);
  const rightInput = [p28Runes[centerOffset], ...selectedWord.values].slice(inputCut);
  for (const leftExponent of reversibleExponents) {
    for (const rightExponent of reversibleExponents) {
      for (const orientation of ["forward", "reverse"]) {
        let output = [
          ...leftInput.map((value) => modPow(value, leftExponent)),
          ...rightInput.map((value) => modPow(value, rightExponent)),
        ];
        if (orientation === "reverse") output = output.slice().reverse();
        for (let cut = 1; cut < output.length; cut += 1) {
          if (
            gp0(output.slice(0, cut)) === p39Selector.length &&
            gp0(output.slice(cut)) === p39Selector.gp0Mod29
          ) {
            inputSplitHits.push({
              inputCut,
              leftExponent,
              rightExponent,
              orientation,
              cut,
              output,
            });
          }
        }
      }
    }
  }
}
assert.equal(5 * reversibleExponents.length * reversibleExponents.length * 2 * 5, 7200);
assert.deepEqual(
  inputSplitHits.map((hit) => [
    hit.inputCut,
    hit.leftExponent,
    hit.rightExponent,
    hit.orientation,
    hit.cut,
    hit.output,
  ]),
  [
    [1, 3, 27, "forward", 3, [4, 28, 23, 3, 1, 16]],
    [1, 17, 27, "forward", 3, [4, 28, 23, 3, 1, 16]],
    [2, 3, 27, "forward", 3, [4, 28, 23, 3, 1, 16]],
    [2, 17, 27, "forward", 3, [4, 28, 23, 3, 1, 16]],
  ]
);
assert.equal(modPow(28, 3), 28);
assert.equal(modPow(28, 27), 28);

// Now hold the source-selected exponent pair itself fixed and charge every
// per-rune assignment of {3,27}. The selector fixes all value-changing
// positions. The four surviving masks differ only on rune28=-1 and rune1=1,
// where the two exponents are mathematically indistinguishable.
const assignmentHits = [];
const p28Input = [p28Runes[centerOffset], ...selectedWord.values];
for (let mask = 0; mask < 64; mask += 1) {
  const exponents = p28Input.map((_, index) =>
    ((mask >> index) & 1) === 1 ? 3 : 27
  );
  for (const orientation of ["forward", "reverse"]) {
    let output = p28Input.map((value, index) => modPow(value, exponents[index]));
    if (orientation === "reverse") output = output.slice().reverse();
    for (let cut = 1; cut < output.length; cut += 1) {
      if (
        gp0(output.slice(0, cut)) === p39Selector.length &&
        gp0(output.slice(cut)) === p39Selector.gp0Mod29
      ) {
        assignmentHits.push({ mask, exponents, orientation, cut, output });
      }
    }
  }
}
assert.equal(64 * 2 * 5, 640);
assert.deepEqual(
  assignmentHits.map((hit) => hit.exponents),
  [
    [3, 27, 27, 27, 27, 27],
    [3, 3, 27, 27, 27, 27],
    [3, 27, 27, 27, 3, 27],
    [3, 3, 27, 27, 3, 27],
  ]
);
assert.ok(assignmentHits.every((hit) =>
  hit.orientation === "forward" &&
  hit.cut === 3 &&
  JSON.stringify(hit.output) === JSON.stringify([4, 28, 23, 3, 1, 16])
));
assert.equal(p28Input[1], 28);
assert.equal(p28Input[4], 1);
assert.equal(modPow(1, 3), 1);
assert.equal(modPow(1, 27), 1);

// The authenticated DH state fixes the center exponent alias to e=3.
const dh = { g: 5, K: 2, e: 3 };
assert.equal(mod29(dh.g - dh.K), dh.e);
assert.equal(hits[0].boundaryExponent, dh.e);

const selectedOutput = hits[0].output;
assert.equal(spell(selectedOutput), "READOUT");

// The previously noted local English rival has different numeric coordinates.
// No lexicon is used to obtain the winning output.
const lung = [20, 1, 21];
const dear = [23, 18, 24, 4];
assert.notDeepEqual(
  [gp0(lung), gp0(dear)],
  [p39Selector.length, p39Selector.gp0Mod29]
);

console.log(JSON.stringify({
  status: "PASS",
  circumferenceRoute: {
    findGp0,
    selectedBodies: [
      {
        page: 33,
        outerRunes: hOuter(p33Body).length,
        interiorRunes: shed(p33Body).length,
        pointer: 39,
      },
      {
        page: 3,
        outerRunes: hOuter(p3Body).length,
        interiorRunes: shed(p3Body).length,
        pointer: 53,
      },
    ],
    allRedBodyOuter42Hits: redBodySelectorCensus
      .filter((row) => row.length === findGp0)
      .map((row) => [row.page, row.start]),
  },
  p39: {
    page: 39,
    sourceBody: { words: p39Body.length, runes: p39Body.flat().length },
    hOuter: {
      runes: p39HOuter.length,
      gp0Mod29: gp0(p39HOuter) % 29,
      selector: [p39Selector.length, p39Selector.gp0Mod29],
    },
    redBodyControlHits: redBodySelectorCensus.filter((row) =>
      row.length === p39Selector.length &&
      row.gp0Mod29 === p39Selector.gp0Mod29
    ),
  },
  p28: {
    input: [p28Runes[centerOffset], ...selectedWord.values],
    chargedConfigurations:
      reversibleExponents.length * reversibleExponents.length * 2 * 5,
    hits,
    uniqueRawOutputs: uniqueOutputs.size,
    widenedInputSplitCharge: {
      chargedConfigurations:
        5 * reversibleExponents.length * reversibleExponents.length * 2 * 5,
      hits: inputSplitHits,
      interpretation:
        "Only input cuts1/2 survive; cut2 is value-identical to cut1 because rune28=-1 is exponent-invariant.",
    },
    perRuneAssignmentCharge: {
      chargedConfigurations: 64 * 2 * 5,
      hits: assignmentHits,
      invariantPositions: [
        { position: 1, value: p28Input[1] },
        { position: 4, value: p28Input[4] },
      ],
      interpretation:
        "All value-changing positions are fixed to the center/word assignment; the four masks differ only on rune28=-1 and rune1=1, where powers3 and27 are indistinguishable.",
    },
    dhResolvedBoundaryExponent: dh.e,
    selectedOutput,
    transliterationAfterSelection: spell(selectedOutput),
  },
  interpretation:
    "The selected p33 and p3 bodies each shed exactly 42=GP0(FIND) outer runes while their interiors point to p39 and p53. On independently selected p39, frozen H applied to the outer circumference supplies [55,20] as (transformed outer-shell length, GP0 mod29). Charging [55,20] against all 1,440 fixed-boundary configurations leaves one raw output. Widening to all 7,200 contiguous input splits leaves only cuts1/2, with cut2 identical because rune28=-1 is power-invariant. Charging every per-rune {3,27} assignment leaves only four masks, differing solely at invariant runes28 and1. Thus every value-changing position is fixed to the center/word assignment. Authenticated e=3 resolves the remaining center exponent alias. Only then does the output transliterate as READ OUT. This is post-discovery cross-object corroboration, not a blind plaintext probability.",
}, null, 2));
