"use strict";

/**
 * Source-only p28 DH reconstruction from the literal DH line.
 *
 * Human-visible selectors:
 * - p28 line6 is the sole physical unknown-page line beginning literal "DH".
 * - The line has five printed hyphen/period fragments.
 * - Its one-based line number is six.
 *
 * Frozen operation:
 * - H(x,y)=(x-y,x+y) mod29, with sign/order fixed by solved-page work.
 * - Apply H only to the outer rune pair of each line fragment of length >=2.
 *
 * Bounded source family:
 * - line number is one- or zero-based;
 * - line number and fragment count may map to (a,g) in either order;
 * - on the literal "DH" fragment, its own outer-H pair may be (b,K) or (K,b).
 * For each family member, choose p only from the same line's outer-H outputs,
 * derive A, B and K by standard DH algebra, and require the derived public
 * values to occur in that same output set. This source-visible family does not
 * require the seven DH fields to be distinct.
 *
 * A broader seven-distinct-field census is retained only as a secondary control.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const parts = transcription.split(/^\s*%\s*$/m);
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));

function physicalPart(page) {
  assert.notEqual(page, 50);
  return parts[page <= 49 ? page : page - 1];
}

function mod(value, modulus) {
  return ((value % modulus) + modulus) % modulus;
}

function powMod(base, exponent, modulus) {
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

function values(text) {
  return [...text]
    .map((char) => runeIndex.get(char))
    .filter((value) => value !== undefined);
}

function fragments(rawLine) {
  return rawLine
    .split(/[-.]/u)
    .map(values)
    .filter((fragment) => fragment.length > 0);
}

function outerH(fragment) {
  if (fragment.length < 2) return [];
  const left = fragment[0];
  const right = fragment.at(-1);
  return [mod(left - right, 29), mod(left + right, 29)];
}

const primeValues = new Set([2, 3, 5, 7, 11, 13, 17, 19, 23]);

function lineVariants(page, line, rawLine) {
  const parts = fragments(rawLine);
  if (!parts.length) return null;

  const outputs = parts.flatMap(outerH);
  const outputSet = new Set(outputs);
  const startsDH = (
    parts[0].length >= 2 &&
    parts[0][0] === 23 &&
    parts[0][1] === 8
  );

  const literalPairVariants = [];
  if (startsDH) {
    const dhPair = outerH(parts[0]);
    for (const origin of ["one", "zero"]) {
      const lineValue = origin === "one" ? line : line - 1;
      if (lineValue <= 0) continue;

      for (const assignment of ["g=fragments,a=line", "g=line,a=fragments"]) {
        const g = assignment === "g=fragments,a=line"
          ? parts.length
          : lineValue;
        const a = assignment === "g=fragments,a=line"
          ? lineValue
          : parts.length;

        for (const pairOrder of ["bK", "Kb"]) {
          const [b, K] = pairOrder === "bK"
            ? dhPair
            : [dhPair[1], dhPair[0]];

          for (const p of outputSet) {
            if (!primeValues.has(p) || g <= 0 || g >= p || b <= 0 || b >= p) continue;

            const A = powMod(g, a, p);
            const B = powMod(g, b, p);
            const derivedK = powMod(A, b, p);
            if (derivedK !== K || derivedK !== powMod(B, a, p)) continue;
            if (!outputSet.has(A) || !outputSet.has(B)) continue;

            literalPairVariants.push({
              origin,
              assignment,
              pairOrder,
              tuple: { p, g, a, b, A, B, K },
            });
          }
        }
      }
    }
  }

  const variants = [];
  for (const origin of ["one", "zero"]) {
    const lineValue = origin === "one" ? line : line - 1;
    if (lineValue <= 0) continue;

    for (const assignment of ["g=fragments,a=line", "g=line,a=fragments"]) {
      const g = assignment === "g=fragments,a=line"
        ? parts.length
        : lineValue;
      const a = assignment === "g=fragments,a=line"
        ? lineValue
        : parts.length;

      for (const p of outputSet) {
        if (!primeValues.has(p) || g <= 0 || g >= p) continue;

        for (const b of outputSet) {
          if (b <= 0 || b >= p) continue;

          const A = powMod(g, a, p);
          const B = powMod(g, b, p);
          const K = powMod(A, b, p);
          if (K !== powMod(B, a, p)) continue;
          if (!outputSet.has(A) || !outputSet.has(B) || !outputSet.has(K)) continue;

          const tuple = { p, g, a, b, A, B, K };
          if (new Set(Object.values(tuple)).size !== 7) continue;

          variants.push({ origin, assignment, tuple });
        }
      }
    }
  }

  return {
    page,
    line,
    fragmentCount: parts.length,
    fragmentValues: parts,
    fragmentText: parts.map((fragment) =>
      fragment.map((value) => corpus.translit[value]).join("")
    ),
    outputs,
    outputText: outputs.map((value) => corpus.translit[value]).join(" "),
    startsDH,
    literalPairVariants,
    variants,
  };
}

const rows = [];
for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  const physicalLines = physicalPart(page).trim().split("/");
  for (let i = 0; i < physicalLines.length; i += 1) {
    const row = lineVariants(page, i + 1, physicalLines[i]);
    if (row) rows.push(row);
  }
}

const startsDH = rows.filter((row) => row.startsDH);
const valid = rows.filter((row) => row.variants.length > 0);
const target = rows.find((row) => row.page === 28 && row.line === 6);

assert.ok(target);
assert.equal(startsDH.length, 1);
assert.equal(startsDH[0].page, 28);
assert.equal(startsDH[0].line, 6);

assert.deepEqual(target.fragmentText, [
  "DH",
  "NPA",
  "EORHNNGEAFNF",
  "OMSN",
  "EAAIUL",
]);
assert.equal(target.fragmentCount, 5);
assert.deepEqual(target.outputs, [
  15, 2,
  14, 4,
  12, 12,
  23, 12,
  8, 19,
]);

assert.deepEqual(target.literalPairVariants, [{
  origin: "one",
  assignment: "g=fragments,a=line",
  pairOrder: "bK",
  tuple: {
    p: 23,
    g: 5,
    a: 6,
    b: 15,
    A: 8,
    B: 19,
    K: 2,
  },
}]);

// Stronger positional source family on the selected literal-DH line.
// Charge six binary choices:
// line origin, g/a count assignment, which literal input is p, whether the
// other literal input is A or B, literal-H output order bK/Kb, and final-H
// output order AB/BA. Standard DH algebra must reconcile all three source pairs.
const literalInput = target.fragmentValues[0];
const literalOutput = outerH(target.fragmentValues[0]);
const finalOutput = outerH(target.fragmentValues.at(-1));
const positionalVariants = [];

for (const origin of ["one", "zero"]) {
  const lineValue = origin === "one" ? target.line : target.line - 1;
  if (lineValue <= 0) continue;

  for (const assignment of ["g=fragments,a=line", "g=line,a=fragments"]) {
    const g = assignment === "g=fragments,a=line"
      ? target.fragmentCount
      : lineValue;
    const a = assignment === "g=fragments,a=line"
      ? lineValue
      : target.fragmentCount;

    for (const pIndex of [0, 1]) {
      const p = literalInput[pIndex];
      const knownPublic = literalInput[1 - pIndex];
      if (!primeValues.has(p) || g <= 0 || g >= p) continue;

      for (const publicRole of ["A", "B"]) {
        for (const pairOrder of ["bK", "Kb"]) {
          const [b, K] = pairOrder === "bK"
            ? literalOutput
            : [literalOutput[1], literalOutput[0]];
          if (b <= 0 || b >= p) continue;

          const A = powMod(g, a, p);
          const B = powMod(g, b, p);
          const derivedK = powMod(A, b, p);
          if (derivedK !== K || derivedK !== powMod(B, a, p)) continue;
          if ((publicRole === "A" ? A : B) !== knownPublic) continue;

          for (const finalOrder of ["AB", "BA"]) {
            const expectedFinal = finalOrder === "AB" ? [A, B] : [B, A];
            if (
              expectedFinal[0] !== finalOutput[0] ||
              expectedFinal[1] !== finalOutput[1]
            ) continue;

            positionalVariants.push({
              origin,
              assignment,
              pIndex,
              publicRole,
              pairOrder,
              finalOrder,
              tuple: { p, g, a, b, A, B, K },
            });
          }
        }
      }
    }
  }
}

assert.deepEqual(positionalVariants, [{
  origin: "one",
  assignment: "g=fragments,a=line",
  pIndex: 0,
  publicRole: "A",
  pairOrder: "bK",
  finalOrder: "AB",
  tuple: {
    p: 23,
    g: 5,
    a: 6,
    b: 15,
    A: 8,
    B: 19,
    K: 2,
  },
}]);

const dh = positionalVariants[0].tuple;
assert.equal(powMod(dh.g, dh.a, dh.p), dh.A);
assert.equal(powMod(dh.g, dh.b, dh.p), dh.B);
assert.equal(powMod(dh.A, dh.b, dh.p), dh.K);
assert.equal(powMod(dh.B, dh.a, dh.p), dh.K);

// The literal line directly exposes five fields through outer-H:
// first fragment DH -> [b,K], penultimate -> [p,12], final -> [A,B].
assert.deepEqual(target.outputs.slice(0, 2), [dh.b, dh.K]);
assert.equal(target.outputs[6], dh.p);
assert.deepEqual(target.outputs.slice(-2), [dh.A, dh.B]);

// Family census locks the amount of accidental DH structure elsewhere.
assert.equal(rows.length, 594);
assert.equal(valid.length, 31);
assert.equal(
  valid.reduce((total, row) => total + row.variants.length, 0),
  60
);
assert.deepEqual(
  valid.filter((row) => row.startsDH).map((row) => ({
    page: row.page,
    line: row.line,
    fragmentCount: row.fragmentCount,
    variants: row.variants,
  })),
  [{
    page: 28,
    line: 6,
    fragmentCount: 5,
    variants: target.variants,
  }]
);

console.log(JSON.stringify({
  status: "PASS",
  sourceSelector: {
    physicalRuneLines: rows.length,
    literalDHLineCount: startsDH.length,
    selected: { page: target.page, line: target.line },
    fragments: target.fragmentText,
    fragmentCount: target.fragmentCount,
    oneBasedLineNumber: target.line,
  },
  outerH: {
    outputs: target.outputs,
    dhFieldsVisible: {
      firstFragment: { input: "DH", output: [dh.b, dh.K], labels: ["b", "K"] },
      penultimateFirst: { value: dh.p, label: "p" },
      finalFragment: { output: [dh.A, dh.B], labels: ["A", "B"] },
    },
  },
  numericFamily: {
    lineOriginChoices: ["one", "zero"],
    assignments: ["g=fragments,a=line", "g=line,a=fragments"],
    literalDhPairOrders: ["bK", "Kb"],
    literalDhLineSourceFamilySolutions: target.literalPairVariants,
    positionalSourceFamily: {
      configurations: 64,
      literalInput,
      literalOutput,
      finalOutput,
      solutions: positionalVariants,
    },
    linesWithAnySevenDistinctDhTuple: valid.length,
    totalSevenDistinctDhTupleVariants: valid.reduce(
      (total, row) => total + row.variants.length, 0
    ),
    literalDHLineSolutions: valid.filter((row) => row.startsDH).map((row) => row.variants),
  },
  recoveredDh: dh,
  verification: {
    gPowA: powMod(dh.g, dh.a, dh.p),
    gPowB: powMod(dh.g, dh.b, dh.p),
    APowB: powMod(dh.A, dh.b, dh.p),
    BPowA: powMod(dh.B, dh.a, dh.p),
  },
  classification:
    "source-derived DH reconstruction: the unique literal-DH line has literal input [p,A], its own outer-H output [b,K], and final-fragment outer-H output [A,B]. Together with visible line number and fragment count, exactly one of 64 charged positional/count conventions satisfies standard DH, without a distinctness selection rule.",
}, null, 2));
