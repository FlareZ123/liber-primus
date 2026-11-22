"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { buildSourceNativeTrigramModel } = require("./lp1_source_native_trigram_model.cjs");

const root = path.resolve(__dirname, "..");

/**
 * @param {string} relative
 * @returns {string}
 */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8");
}

/**
 * @param {number} value
 * @returns {number}
 */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/**
 * @param {number} base
 * @param {number} exponent
 * @param {number} modulus
 * @returns {number}
 */
function powMod(base, exponent, modulus) {
  let result = 1;
  let factor = base % modulus;
  let power = exponent;
  while (power > 0) {
    if (power % 2 === 1) result = (result * factor) % modulus;
    factor = (factor * factor) % modulus;
    power = Math.floor(power / 2);
  }
  return result;
}

/**
 * @param {[number, number]} pair
 * @returns {[number, number]}
 */
function hadamardPair(pair) {
  const [left, right] = pair;
  return [mod29(left - right), mod29(left + right)];
}

/**
 * @param {number[][]} left
 * @param {number[][]} right
 * @returns {number[][]}
 */
function mul2(left, right) {
  return [
    [
      mod29(left[0][0] * right[0][0] + left[0][1] * right[1][0]),
      mod29(left[0][0] * right[0][1] + left[0][1] * right[1][1]),
    ],
    [
      mod29(left[1][0] * right[0][0] + left[1][1] * right[1][0]),
      mod29(left[1][0] * right[0][1] + left[1][1] * right[1][1]),
    ],
  ];
}

/**
 * @param {number} exponent
 * @returns {number[][]}
 */
function hPower(exponent) {
  let n = ((exponent % 28) + 28) % 28;
  let result = [[1, 0], [0, 1]];
  let factor = [[1, 28], [1, 1]];
  while (n > 0) {
    if (n % 2 === 1) result = mul2(result, factor);
    factor = mul2(factor, factor);
    n = Math.floor(n / 2);
  }
  return result;
}

/**
 * @param {[number, number]} pair
 * @param {number} exponent
 * @returns {[number, number]}
 */
function hPowerPair(pair, exponent) {
  const matrix = hPower(exponent);
  const [left, right] = pair;
  return [
    mod29(matrix[0][0] * left + matrix[0][1] * right),
    mod29(matrix[1][0] * left + matrix[1][1] * right),
  ];
}

/**
 * Apply H^exponent outside-in to one printed word, preserving an odd center.
 * @param {number[]} word
 * @param {number} exponent
 * @returns {number[]}
 */
function shellPower(word, exponent) {
  const out = [];
  for (let left = 0, right = word.length - 1; left < right; left += 1, right -= 1) {
    out.push(...hPowerPair([word[left], word[right]], exponent));
  }
  if (word.length % 2 === 1) out.push(word[Math.floor(word.length / 2)]);
  return out;
}

/**
 * @param {number[]} decoded
 * @param {number} exponent
 * @returns {number[]}
 */
function shellUnpower(decoded, exponent) {
  const out = new Array(decoded.length);
  let input = 0;
  for (let left = 0, right = decoded.length - 1; left < right; left += 1, right -= 1) {
    const [x, y] = hPowerPair([decoded[input], decoded[input + 1]], -exponent);
    out[left] = x;
    out[right] = y;
    input += 2;
  }
  if (decoded.length % 2 === 1) out[Math.floor(decoded.length / 2)] = decoded[input];
  return out;
}

/**
 * @param {number[][]} words
 * @param {number} phase
 * @param {1|-1} direction
 * @returns {number[]}
 */
function cycleDecode(words, phase, direction) {
  return words.flatMap((word, index) =>
    shellPower(word, direction * (phase + index))
  );
}

/**
 * @param {number[]} values
 * @returns {number}
 */
function ioc(values) {
  const counts = new Array(29).fill(0);
  for (const value of values) counts[value] += 1;
  let equalPairs = 0;
  for (const count of counts) equalPairs += count * (count - 1);
  return equalPairs / (values.length * (values.length - 1));
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const grid = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const lp1Reference = read("resources/liber-primus/lp1-plaintext-reference.txt");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const parts = transcription.split(/^\s*%\s*$/m);

/**
 * @param {number} page
 * @returns {string}
 */
function physicalPart(page) {
  assert.notEqual(page, 50);
  return parts[page <= 49 ? page : page - 1];
}

/**
 * @param {string} text
 * @returns {number[][]}
 */
function runeWords(text) {
  const normalized = text.replace(/\/\s*/gu, "");
  return (normalized.match(/[\u16A0-\u16FF]+/gu) || []).map((word) =>
    [...word].map((rune) => {
      const value = runeIndex.get(rune);
      assert.notEqual(value, undefined);
      return value;
    })
  );
}

/**
 * @param {number} page
 * @returns {{values:number[], start:number, end:number, length:number}[]}
 */
function wordRows(page) {
  let offset = 0;
  return runeWords(physicalPart(page)).map((values) => {
    const row = {
      values,
      start: offset,
      end: offset + values.length,
      length: values.length,
    };
    offset = row.end;
    return row;
  });
}

/**
 * @param {{start:number,end:number,length:number}[]} rows
 * @param {number} start
 * @param {number} end
 * @returns {{start:number,end:number,length:number}[]}
 */
function rowsInSpan(rows, start, end) {
  return rows.filter((row) => row.start >= start && row.end <= end);
}

/**
 * @param {number[]} values
 * @returns {string}
 */
function spell(values) {
  return values.map((value) => corpus.translit[value]).join("");
}

const state = { p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2, e: 3, q: 4 };
assert.equal(powMod(state.g, state.a, state.p), state.A);
assert.equal(powMod(state.g, state.b, state.p), state.B);
assert.equal(powMod(state.B, state.a, state.p), state.K);
assert.equal(state.p - state.K, 21);

const flatTokens = grid.rows.flat();
const flatBytes = grid.byte_rows.flat();
assert.equal(flatTokens[state.B], "0X");
assert.equal(flatBytes[state.B], 33);

const page33 = wordRows(33);
assert.equal(page33.length, 53);
assert.equal(page33.at(-1).end, 214);

const p33Ink = ink.pages.find((page) => page.page === 33);
assert.ok(p33Ink);
assert.deepEqual(
  p33Ink.red_spans.map((span) => [span.start, span.length]),
  [[0, 10], [91, 8]]
);
assert.deepEqual(
  p33Ink.large_punctuation,
  [[10, 13, "red"], [91, 13, "red"], [99, 13, "red"]]
);

const firstTitle = rowsInSpan(page33, 0, 10);
const markerMOrdinal = corpus.translit.indexOf("M");
const markerNGOrdinal = corpus.translit.indexOf("NG");
assert.equal(markerMOrdinal, state.B);
assert.equal(markerNGOrdinal, state.B + state.K);
const firstBody = rowsInSpan(page33, 10, 91);
const secondTitle = rowsInSpan(page33, 91, 99);
const secondBody = rowsInSpan(page33, 99, 214);
const firstUnit = rowsInSpan(page33, 0, 91);

assert.deepEqual(firstTitle.map((row) => row.length), [state.K, state.A]);
assert.deepEqual(secondTitle.map((row) => row.length), [state.e, state.g]);
assert.equal(firstTitle.reduce((sum, row) => sum + row.length, 0), state.A + state.K);
assert.equal(secondTitle.reduce((sum, row) => sum + row.length, 0), state.A);
assert.equal(firstTitle[0].values[0], state.p);
assert.equal(secondTitle[0].values[0], state.p - state.K);
assert.deepEqual(hadamardPair([state.K, state.A]), [state.p, state.A + state.K]);
assert.deepEqual(hadamardPair([state.e, state.g]), [mod29(-state.K), state.A]);

// Original-image source reading: a decorative red M precedes the first
// transcribed p33 unit, while the second oversized red rubric begins NG TH.
// The second heading's literal first two GP values therefore map through the
// already frozen H orientation to [M,D] = [B,p].
assert.deepEqual(secondTitle[0].values.slice(0, 2), [state.B + state.K, state.K]);
assert.deepEqual(
  hadamardPair(secondTitle[0].values.slice(0, 2)),
  [markerMOrdinal, firstTitle[0].values[0]]
);
assert.deepEqual([markerMOrdinal, firstTitle[0].values[0]], [state.B, state.p]);

// A second H step yields [25,13]. 25 is GP0(WE) in solved p57; 13 is the
// literal red 13-dot punctuation count terminating the first p33 title.
const weGp0 = corpus.translit.indexOf("W") + corpus.translit.indexOf("E");
assert.equal(weGp0, 25);
assert.deepEqual(hadamardPair([markerMOrdinal, firstTitle[0].values[0]]), [weGp0, 13]);
assert.ok(p33Ink.large_punctuation.some(([offset, dots, color]) =>
  offset === 10 && dots === 13 && color === "red"
));

assert.equal(firstUnit.length, state.p);
assert.equal(firstBody.length, state.p - state.K);
assert.equal(firstBody.reduce((sum, row) => sum + row.length, 0), state.e ** state.q);
assert.equal(secondBody.length, state.p + state.g);
assert.equal(secondBody.reduce((sum, row) => sum + row.length, 0), state.p * state.g);

const page33Sections = physicalPart(33).split(/^\s*&\s*$/m);
assert.equal(page33Sections.length, 2);
const lineCounts = page33Sections.map((section) =>
  section
    .split(/\r?\n/u)
    .filter((line) => /[\u16A0-\u16FF]/u.test(line)).length
);
assert.deepEqual(lineCounts, [state.g, state.a]);

const twoWordRedSpans = [];
const redFirstPairTransforms = [];
for (const page of ink.pages) {
  if (page.page === 50) continue;
  const rows = wordRows(page.page);
  for (const span of page.red_spans || []) {
    const spanValues = [...span.runes].map((rune) => {
      const value = runeIndex.get(rune);
      assert.notEqual(value, undefined);
      return value;
    });
    if (spanValues.length >= 2) {
      redFirstPairTransforms.push({
        page: page.page,
        start: span.start,
        first2: spanValues.slice(0, 2),
        throughH: hadamardPair(spanValues.slice(0, 2)),
      });
    }
    const selected = rowsInSpan(rows, span.start, span.start + span.length);
    if (
      selected.length !== 2 ||
      selected[0].start !== span.start ||
      selected[1].end !== span.start + span.length
    ) continue;
    twoWordRedSpans.push({
      page: page.page,
      start: span.start,
      firstRune: selected[0].values[0],
      lengths: selected.map((row) => row.length),
    });
  }
}
assert.equal(twoWordRedSpans.length, 8);
assert.deepEqual(
  twoWordRedSpans.filter((row) => row.lengths[0] === state.K && row.lengths[1] === state.A),
  [{ page: 33, start: 0, firstRune: state.p, lengths: [state.K, state.A] }]
);
assert.deepEqual(
  twoWordRedSpans
    .filter((row) => mod29(row.lengths[0] - row.lengths[1]) === row.firstRune)
    .map((row) => [row.page, row.start, row.firstRune, ...row.lengths]),
  [[33, 0, state.p, state.K, state.A]]
);
assert.deepEqual(
  redFirstPairTransforms
    .filter((row) => row.throughH[0] === state.B && row.throughH[1] === state.p)
    .map((row) => [row.page, row.start, ...row.first2]),
  [[33, 91, state.B + state.K, state.K]]
);

const H = [[1, 28], [1, 1]];
let order = null;
let power = [[1, 0], [0, 1]];
for (let exponent = 1; exponent <= 28; exponent += 1) {
  power = mul2(power, H);
  if (JSON.stringify(power) === JSON.stringify([[1, 0], [0, 1]])) {
    order = exponent;
    break;
  }
}
assert.equal(order, 28);
assert.equal(secondBody.length, order);

for (let exponent = 0; exponent < order; exponent += 1) {
  for (const word of secondBody) {
    assert.deepEqual(shellUnpower(shellPower(word.values, exponent), exponent), word.values);
  }
}

const model = buildSourceNativeTrigramModel({ corpus, referenceText: lp1Reference });
const rawSecondBody = secondBody.flatMap((row) => row.values);
const schedules = [];
for (let phase = 0; phase < order; phase += 1) {
  for (const direction of [1, -1]) {
    const output = cycleDecode(secondBody.map((row) => row.values), phase, direction);
    schedules.push({
      phase,
      direction,
      ioc: ioc(output),
      trigram: model.scoreChapters([output]).mean,
      output,
    });
  }
}
schedules.sort((left, right) => right.trigram - left.trigram);
const best = schedules[0];
const matchingUpper = cycleDecode(
  firstBody.map((row) => row.values),
  best.phase,
  best.direction
);

console.log(JSON.stringify({
  status: "PASS",
  upstream: {
    selectedState: state.B,
    p50Token: flatTokens[state.B],
    decodedByte: flatBytes[state.B],
    physicalPage: 33,
  },
  layout: {
    firstLargeRune: firstTitle[0].values[0],
    firstTitleWordLengths: firstTitle.map((row) => row.length),
    firstTitleThroughH: hadamardPair(firstTitle.map((row) => row.length)),
    firstUnitLines: lineCounts[0],
    firstUnitWords: firstUnit.length,
    firstBodyWords: firstBody.length,
    firstBodyRunes: firstBody.reduce((sum, row) => sum + row.length, 0),
    secondLargeRune: secondTitle[0].values[0],
    secondTitleWordLengths: secondTitle.map((row) => row.length),
    secondTitleThroughH: hadamardPair(secondTitle.map((row) => row.length)),
    secondUnitLines: lineCounts[1],
    secondBodyWords: secondBody.length,
    secondBodyRunes: secondBody.reduce((sum, row) => sum + row.length, 0),
    twoWordRedSpanCount: twoWordRedSpans.length,
    hChain: {
      secondHeadingFirstTwo: secondTitle[0].values.slice(0, 2),
      toTopMarkerAndInitial: hadamardPair(secondTitle[0].values.slice(0, 2)),
      topMarkerAndInitial: [markerMOrdinal, firstTitle[0].values[0]],
      toWeAndDots: hadamardPair([markerMOrdinal, firstTitle[0].values[0]]),
      matchingRedSpanFirstPairCount: redFirstPairTransforms.filter(
        (row) => row.throughH[0] === state.B && row.throughH[1] === state.p
      ).length,
    },
  },
  hCycleGate: {
    order,
    testedSchedules: schedules.length,
    rawIoC: ioc(rawSecondBody),
    rawTrigram: model.scoreChapters([rawSecondBody]).mean,
    best: {
      phase: best.phase,
      direction: best.direction,
      ioc: best.ioc,
      trigram: best.trigram,
      lowerReadout: spell(best.output),
      sameScheduleUpperIoC: ioc(matchingUpper),
      sameScheduleUpperTrigram: model.scoreChapters([matchingUpper]).mean,
      sameScheduleUpperReadout: spell(matchingUpper),
    },
    solvedP57Trigram: model.p57Score,
  },
  interpretation:
    "The independently selected B=19 state addresses p50[19]=0X=33. Physical p33 then self-registers the same DH/H state in its source layout: the second red heading starts [B+K,K]=[21,2] and uniquely among all red-span first pairs maps through H to [B,p]=[19,23], the decorative M plus first title D; a second H step gives [GP0(WE),13]=[25,13], matching solved p57 WE and the literal red title punctuation count. Separately, [K,A]=[2,8] is the unique exact two-word red span of that shape and H([2,8])=[p,A+K]=[23,10], matching the first red title rune D and total title length; the upper unit has g=5 lines, p=23 words, p-K=21 black words and e^q=81 black runes; the second red title has [e,g]=[3,5] and H=[-K,A]=[27,8], begins with GP21=p-K, and its lower unit has a=6 lines, p+g=28 black words and p*g=115 black runes. The 28-word lower body therefore motivates one bounded H-order cycle test over all 28 phases and both directions. No parameter outside that fixed family is searched.",
}, null, 2));
