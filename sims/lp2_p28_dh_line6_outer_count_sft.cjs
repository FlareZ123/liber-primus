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
 * Bounded numeric family:
 * - line number is one- or zero-based;
 * - line number and fragment count may map to (a,g) in either order.
 * For every line/family member, choose p and b only from outer-H outputs, derive
 * A=g^a mod p, B=g^b mod p, K=A^b=B^a mod p, require p prime and all seven DH
 * fields distinct, and require A/B/K to occur in the same outer-H output set.
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

assert.deepEqual(target.variants, [{
  origin: "one",
  assignment: "g=fragments,a=line",
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

const dh = target.variants[0].tuple;
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
    "source-derived DH reconstruction: the unique literal-DH line plus fixed outer-H, visible line number, and fragment count reconstructs the full seven-distinct-field DH23 tuple under exactly one member of the charged 2x2 numeric family.",
}, null, 2));
