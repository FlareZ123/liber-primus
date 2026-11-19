"use strict";

/**
 * SFT for the p28 READ OUT -> HERE -> THE b-orbit candidate.
 *
 * Reconstructs the manuscript-wide outer-H/count DH family, freezes the
 * already selected p28 DH state, and tests whether a state-derived linear
 * recurrence in H coordinates predicts a third source fragment without using
 * language to choose its location or output.
 *
 * Node.js 22, CommonJS, read-only, no third-party dependencies.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const parts = transcription.split(/^\s*%\s*$/m);
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const primeValues = new Set([2, 3, 5, 7, 11, 13, 17, 19, 23]);

/** @param {number} value @param {number} modulus @returns {number} */
function mod(value, modulus) {
  return ((value % modulus) + modulus) % modulus;
}

/** @param {number} base @param {number} exponent @param {number} modulus @returns {number} */
function modPow(base, exponent, modulus) {
  let result = 1 % modulus;
  let x = mod(base, modulus);
  let e = exponent;
  while (e > 0) {
    if (e & 1) result = (result * x) % modulus;
    x = (x * x) % modulus;
    e = Math.floor(e / 2);
  }
  return result;
}

/** @param {number} a @param {number} b @returns {number} */
function gcd(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) [x, y] = [y, x % y];
  return x;
}

/** @param {number} value @param {number} modulus @returns {number|null} */
function inverse(value, modulus) {
  if (gcd(value, modulus) !== 1) return null;
  for (let candidate = 1; candidate < modulus; candidate += 1) {
    if ((value * candidate) % modulus === 1) return candidate;
  }
  return null;
}

/** @param {number} page @returns {string} */
function physicalPart(page) {
  assert.notEqual(page, 50);
  return parts[page <= 49 ? page : page - 1];
}

/** @param {string} text @returns {number[]} */
function values(text) {
  return [...text]
    .map((char) => runeIndex.get(char))
    .filter((value) => value !== undefined);
}

/** @param {string} line @returns {number[][]} */
function fragments(line) {
  return line
    .split(/[-.]/u)
    .map(values)
    .filter((fragment) => fragment.length > 0);
}

/** @param {number[]} fragment @returns {number[]} */
function outerH(fragment) {
  if (fragment.length < 2) return [];
  return [
    mod(fragment[0] - fragment.at(-1), 29),
    mod(fragment[0] + fragment.at(-1), 29),
  ];
}

/** @param {[number, number]} pair @returns {[number, number]} */
function hPair(pair) {
  return [
    mod(pair[0] - pair[1], 29),
    mod(pair[0] + pair[1], 29),
  ];
}

/** @param {[number, number]} pair @returns {[number, number]} */
function hInverse(pair) {
  const inv2 = 15;
  return [
    mod((pair[0] + pair[1]) * inv2, 29),
    mod((pair[1] - pair[0]) * inv2, 29),
  ];
}

/**
 * Scale exactly one H coordinate, then return to source endpoint coordinates.
 * @param {[number, number]} pair
 * @param {0|1} coordinate
 * @param {number} factor
 * @returns {[number, number]}
 */
function hCoordinateScale(pair, coordinate, factor) {
  const transformed = hPair(pair);
  transformed[coordinate] = mod(transformed[coordinate] * factor, 29);
  return hInverse(transformed);
}

/** @param {number[]} vector @returns {string} */
function transliterate(vector) {
  return vector.map((value) => corpus.translit[value]).join("");
}

/** @param {number[]} left @param {number[]} right @returns {boolean} */
function sameVector(left, right) {
  return left.length === right.length &&
    left.every((value, index) => value === right[index]);
}

/**
 * @typedef {{
 *   page:number,line:number,origin:string,assignment:string,p:number,g:number,
 *   a:number,b:number,A:number,B:number,K:number,e:number|null
 * }} DhRow
 */

/** @type {DhRow[]} */
const variants = [];
/** @type {Map<number, number[][][]>} */
const pageFragments = new Map();
let runeLines = 0;

for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  const lineFragments = physicalPart(page)
    .trim()
    .split("/")
    .map(fragments);
  pageFragments.set(page, lineFragments);

  for (let lineIndex = 0; lineIndex < lineFragments.length; lineIndex += 1) {
    const current = lineFragments[lineIndex];
    if (!current.length) continue;
    runeLines += 1;

    const outputSet = new Set(current.flatMap(outerH));

    for (const origin of ["one", "zero"]) {
      const lineValue = origin === "one" ? lineIndex + 1 : lineIndex;
      if (lineValue <= 0) continue;

      for (const assignment of ["g=fragments,a=line", "g=line,a=fragments"]) {
        const g =
          assignment === "g=fragments,a=line" ? current.length : lineValue;
        const a =
          assignment === "g=fragments,a=line" ? lineValue : current.length;

        for (const p of outputSet) {
          if (!primeValues.has(p) || g <= 0 || g >= p) continue;

          for (const b of outputSet) {
            if (b <= 0 || b >= p) continue;

            const A = modPow(g, a, p);
            const B = modPow(g, b, p);
            const K = modPow(A, b, p);
            if (K !== modPow(B, a, p)) continue;
            if (!outputSet.has(A) || !outputSet.has(B) || !outputSet.has(K)) {
              continue;
            }

            variants.push({
              page,
              line: lineIndex + 1,
              origin,
              assignment,
              p,
              g,
              a,
              b,
              A,
              B,
              K,
              e: inverse(b, p - 1),
            });
          }
        }
      }
    }
  }
}

assert.equal(runeLines, 594);
assert.equal(variants.length, 1628);

const nontrivial = variants.filter((row) =>
  [row.g, row.b, row.A, row.B, row.K].every((value) => value > 1)
);
const invertibleNontrivial = nontrivial.filter((row) => row.e !== null);

assert.equal(nontrivial.length, 711);
assert.equal(invertibleNontrivial.length, 289);

const targetRows = nontrivial.filter((row) =>
  row.page === 28 &&
  row.line === 6 &&
  row.origin === "one" &&
  row.assignment === "g=fragments,a=line" &&
  row.p === 23 &&
  row.g === 5 &&
  row.a === 6 &&
  row.b === 15 &&
  row.A === 8 &&
  row.B === 19 &&
  row.K === 2
);
assert.equal(targetRows.length, 1);
const target = targetRows[0];
assert.equal(target.e, 3);

/*
 * The already source-selected p28 page start supplies HE | RE under outer-H.
 * Freeze the DH factor b=15, which is also K^-1 in GP29, and scale only the
 * H difference coordinate. The first observed transition is HE -> RE.
 */
const p28Lines = pageFragments.get(28);
assert.ok(p28Lines);
const p28Line1 = p28Lines[0];
assert.ok(p28Line1.length >= 2);

const start1 = /** @type {[number, number]} */ (
  [p28Line1[0][0], p28Line1[0].at(-1)]
);
const start2 = /** @type {[number, number]} */ (
  [p28Line1[1][0], p28Line1[1].at(-1)]
);

assert.deepEqual(start1, [13, 5]);
assert.deepEqual(start2, [11, 7]);
assert.deepEqual(hPair(start1), [8, 18]);
assert.deepEqual(hPair(start2), [4, 18]);
assert.equal(transliterate(hPair(start1)), "HE");
assert.equal(transliterate(hPair(start2)), "RE");
assert.equal(mod(target.b * target.K, 29), 1);
assert.deepEqual(
  hCoordinateScale(start1, 0, target.b),
  start2
);

const predictedThird = hCoordinateScale(start2, 0, target.b);
const predictedThirdH = hPair(predictedThird);
assert.deepEqual(predictedThird, [10, 8]);
assert.deepEqual(predictedThirdH, [2, 18]);
assert.deepEqual(predictedThirdH, [
  target.K,
  mod(target.p - target.g, 29),
]);
assert.equal(transliterate(predictedThirdH), "THE");

/*
 * Charge the post-observation freedom in selecting a DH field, its inverse,
 * and either H coordinate. There are ten distinct non-unit factors generated
 * by the seven target DH fields and their GP29 inverses.
 */
const fieldValues = {
  p: target.p,
  g: target.g,
  a: target.a,
  b: target.b,
  A: target.A,
  B: target.B,
  K: target.K,
};
/** @type {Map<number, string[]>} */
const factorNames = new Map();
for (const [name, value] of Object.entries(fieldValues)) {
  const inv = inverse(value, 29);
  assert.notEqual(inv, null);
  for (const [label, factor] of [[name, value], [name + "^-1", inv]]) {
    if (!factorNames.has(factor)) factorNames.set(factor, []);
    factorNames.get(factor).push(label);
  }
}
assert.equal(factorNames.size, 10);

/**
 * @typedef {{
 *   page:number,coordinate:0|1,factor:number,names:string[],
 *   predicted:[number,number],matches:{line:number,fragment:number,length:number}[]
 * }} PageStartHit
 */
/** @type {PageStartHit[]} */
const pageStartHits = [];
let eligiblePageStarts = 0;

for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  const lines = pageFragments.get(page);
  assert.ok(lines);

  // The established HERE control is specifically a page whose first two
  // printed fragments are both multi-rune. A later multi-rune fragment does
  // not substitute for a one-rune first/second fragment.
  if (
    lines[0].length < 2 ||
    lines[0][0].length < 2 ||
    lines[0][1].length < 2
  ) continue;
  eligiblePageStarts += 1;

  const first = /** @type {[number,number]} */ ([
    lines[0][0][0],
    lines[0][0].at(-1),
  ]);
  const second = /** @type {[number,number]} */ ([
    lines[0][1][0],
    lines[0][1].at(-1),
  ]);

  const allMulti = [];
  for (let line = 0; line < lines.length; line += 1) {
    for (let fragment = 0; fragment < lines[line].length; fragment += 1) {
      const value = lines[line][fragment];
      if (value.length < 2) continue;
      allMulti.push({
        line: line + 1,
        fragment: fragment + 1,
        length: value.length,
        pair: /** @type {[number,number]} */ ([value[0], value.at(-1)]),
      });
    }
  }

  for (const coordinate of /** @type {(0|1)[]} */ ([0, 1])) {
    for (const [factor, names] of factorNames) {
      if (!sameVector(
        hCoordinateScale(first, coordinate, factor),
        second
      )) continue;

      const predicted = hCoordinateScale(second, coordinate, factor);
      const matches = allMulti
        .filter(({ pair }) => sameVector(pair, predicted))
        .map(({ line, fragment, length }) => ({ line, fragment, length }));
      if (!matches.length) continue;

      pageStartHits.push({
        page,
        coordinate,
        factor,
        names,
        predicted,
        matches,
      });
    }
  }
}

assert.equal(eligiblePageStarts, 41);
assert.deepEqual(pageStartHits, [{
  page: 28,
  coordinate: 0,
  factor: 15,
  names: ["b", "K^-1"],
  predicted: [10, 8],
  matches: [{ line: 7, fragment: 3, length: 5 }],
}]);

/*
 * Broaden the same charged family to every physically adjacent multi-rune
 * fragment pair. This records the strongest matched control: one non-p28
 * triple exists, so p28's page-start selection remains essential.
 */
const adjacentTripleHits = [];
let adjacentPairs = 0;

for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  const lines = pageFragments.get(page);
  assert.ok(lines);

  const allMulti = [];
  for (let line = 0; line < lines.length; line += 1) {
    for (let fragment = 0; fragment < lines[line].length; fragment += 1) {
      const value = lines[line][fragment];
      if (value.length < 2) continue;
      allMulti.push({
        line: line + 1,
        fragment: fragment + 1,
        length: value.length,
        pair: /** @type {[number,number]} */ ([value[0], value.at(-1)]),
      });
    }
  }

  for (let line = 0; line < lines.length; line += 1) {
    const multi = lines[line]
      .map((fragment, index) => ({ fragment, index }))
      .filter(({ fragment }) => fragment.length >= 2);
    for (let i = 0; i < multi.length - 1; i += 1) {
      if (multi[i + 1].index !== multi[i].index + 1) continue;
      adjacentPairs += 1;
      const first = /** @type {[number,number]} */ ([
        multi[i].fragment[0],
        multi[i].fragment.at(-1),
      ]);
      const second = /** @type {[number,number]} */ ([
        multi[i + 1].fragment[0],
        multi[i + 1].fragment.at(-1),
      ]);

      for (const coordinate of /** @type {(0|1)[]} */ ([0, 1])) {
        for (const [factor, names] of factorNames) {
          if (!sameVector(
            hCoordinateScale(first, coordinate, factor),
            second
          )) continue;
          const predicted = hCoordinateScale(second, coordinate, factor);
          const matches = allMulti.filter(({ pair }) =>
            sameVector(pair, predicted)
          );
          if (!matches.length) continue;
          adjacentTripleHits.push({
            page,
            line: line + 1,
            firstFragment: multi[i].index + 1,
            secondFragment: multi[i + 1].index + 1,
            coordinate,
            factor,
            names,
            predicted,
            output: transliterate(hPair(predicted)),
            matches: matches.map(({ line: l, fragment, length }) => ({
              line: l,
              fragment,
              length,
            })),
          });
        }
      }
    }
  }
}

assert.equal(adjacentPairs, 2367);
assert.equal(adjacentTripleHits.length, 2);
assert.ok(adjacentTripleHits.some((hit) =>
  hit.page === 28 &&
  hit.line === 1 &&
  hit.coordinate === 0 &&
  hit.factor === 15 &&
  hit.output === "THE"
));
assert.ok(adjacentTripleHits.some((hit) =>
  hit.page === 46 &&
  hit.line === 10 &&
  hit.coordinate === 1 &&
  hit.factor === 8
));

/*
 * Open the predicted p28 receiver only after the numeric endpoint prediction.
 * The complete five-rune source object then closes on the same DH state.
 */
const receiver = p28Lines[6][2];
assert.deepEqual(receiver, [10, 18, 13, 28, 8]);
assert.equal(receiver.length, target.g);
assert.deepEqual(outerH(receiver), predictedThirdH);

const receiverShell = [
  ...outerH(receiver),
  ...outerH(receiver.slice(1, -1)),
  receiver[2],
];
assert.deepEqual(receiverShell, [
  target.K,
  mod(target.p - target.g, 29),
  target.B,
  mod(target.b + target.K, 29),
  mod(target.b - target.K, 29),
]);

const predictedReceiver = [
  mod(target.A + target.K, 29),
  mod(target.p - target.g, 29),
  mod(target.b - target.K, 29),
  mod(target.p + target.g, 29),
  target.A,
];
assert.deepEqual(receiver, predictedReceiver);

/*
 * Matched state-family receiver control. For every invertible nontrivial DH
 * variant, use the immediate post-state line (a+1), fragment e, and require
 * that fragment length equals g before testing the b-orbit output.
 */
let coordinateExists = 0;
let lengthMatchesG = 0;
let outerPredictionHits = 0;
let fullReceiverHits = 0;
const stateReceiverHits = [];

for (const row of invertibleNontrivial) {
  assert.notEqual(row.e, null);
  const lines = pageFragments.get(row.page);
  assert.ok(lines);
  const targetLine = row.a + 1;
  if (targetLine < 1 || targetLine > lines.length) continue;
  const line = lines[targetLine - 1];
  if (row.e < 1 || row.e > line.length) continue;
  coordinateExists += 1;

  const fragment = line[row.e - 1];
  if (fragment.length !== row.g) continue;
  lengthMatchesG += 1;

  const predictedOuter = [
    mod(row.A * row.b * row.b, 29),
    mod(row.p - row.g, 29),
  ];
  const outerHit = sameVector(outerH(fragment), predictedOuter);
  if (outerHit) outerPredictionHits += 1;

  const predictedFull = [
    mod(row.A + row.K, 29),
    mod(row.p - row.g, 29),
    mod(row.b - row.K, 29),
    mod(row.p + row.g, 29),
    row.A,
  ];
  const fullHit = sameVector(fragment, predictedFull);
  if (fullHit) fullReceiverHits += 1;

  if (outerHit || fullHit) {
    stateReceiverHits.push({
      page: row.page,
      line: row.line,
      origin: row.origin,
      assignment: row.assignment,
      p: row.p,
      g: row.g,
      a: row.a,
      b: row.b,
      A: row.A,
      B: row.B,
      K: row.K,
      e: row.e,
      targetLine,
      targetFragment: row.e,
      outerHit,
      fullHit,
    });
  }
}

assert.equal(coordinateExists, 110);
assert.equal(lengthMatchesG, 7);
assert.equal(outerPredictionHits, 1);
assert.equal(fullReceiverHits, 1);
assert.deepEqual(stateReceiverHits, [{
  page: 28,
  line: 6,
  origin: "one",
  assignment: "g=fragments,a=line",
  p: 23,
  g: 5,
  a: 6,
  b: 15,
  A: 8,
  B: 19,
  K: 2,
  e: 3,
  targetLine: 7,
  targetFragment: 3,
  outerHit: true,
  fullHit: true,
}]);

/*
 * The full receiver formula is algebraically compatible with three concise
 * cross-field GP29 identities. They jointly select the target in the 711-row
 * nontrivial family. These identities were recognized after the receiver and
 * are reported as corroboration rather than a blind discovery statistic.
 */
const identityCounts = {
  c1: 0,
  c2: 0,
  c3: 0,
  c12: 0,
  c13: 0,
  c23: 0,
  all: 0,
};
const identityHits = [];

for (const row of nontrivial) {
  const c1 =
    mod(2 * row.A + row.K, 29) === mod(row.p - row.g, 29);
  const c2 = mod(-2 * row.g, 29) === row.B;
  const c3 = mod(2 * row.p, 29) === mod(row.b + row.K, 29);
  if (c1) identityCounts.c1 += 1;
  if (c2) identityCounts.c2 += 1;
  if (c3) identityCounts.c3 += 1;
  if (c1 && c2) identityCounts.c12 += 1;
  if (c1 && c3) identityCounts.c13 += 1;
  if (c2 && c3) identityCounts.c23 += 1;
  if (c1 && c2 && c3) {
    identityCounts.all += 1;
    identityHits.push({
      page: row.page,
      line: row.line,
      origin: row.origin,
      assignment: row.assignment,
      p: row.p,
      g: row.g,
      a: row.a,
      b: row.b,
      A: row.A,
      B: row.B,
      K: row.K,
    });
  }
}

assert.deepEqual(identityCounts, {
  c1: 22,
  c2: 31,
  c3: 9,
  c12: 1,
  c13: 1,
  c23: 2,
  all: 1,
});
assert.equal(identityHits.length, 1);
assert.equal(identityHits[0].page, 28);
assert.equal(identityHits[0].line, 6);

console.log(JSON.stringify({
  status: "PASS",
  target,
  here: {
    firstEndpoints: start1,
    secondEndpoints: start2,
    firstH: hPair(start1),
    secondH: hPair(start2),
    text: transliterate([...hPair(start1), ...hPair(start2)]),
    recurrence:
      "multiply the H difference coordinate by b=15 (=K^-1 mod29), preserve the H sum coordinate",
  },
  prediction: {
    thirdEndpoints: predictedThird,
    thirdH: predictedThirdH,
    text: transliterate(predictedThirdH),
    sourceLocation: { page: 28, line: 7, fragment: 3 },
    fullSource: receiver,
    fullShellH: receiverShell,
    fullSourceFormula: "[A+K, p-g, b-K, p+g, A] mod29",
  },
  controls: {
    pageStarts: {
      eligible: eligiblePageStarts,
      chargedTransforms: factorNames.size * 2,
      hits: pageStartHits,
    },
    allAdjacentPairs: {
      eligible: adjacentPairs,
      chargedTransforms: factorNames.size * 2,
      tripleHits: adjacentTripleHits,
    },
    stateReceiver: {
      invertibleNontrivialVariants: invertibleNontrivial.length,
      coordinateExists,
      lengthMatchesG,
      outerPredictionHits,
      fullReceiverHits,
      hits: stateReceiverHits,
    },
    crossFieldIdentities: {
      counts: identityCounts,
      hits: identityHits,
    },
  },
  classification:
    "Source-state candidate continuation: the already known p28 HERE prefix admits one charged DH-field H-coordinate recurrence whose next state predicts a p28 source fragment reading THE. The recurrence is familywise unique at eligible page starts; the target's (a+1,e,length=g) coordinates and full five-rune DH checksum are post-location corroboration. Treat THE as a serious candidate local plaintext token, not established plaintext.",
}, null, 2));
