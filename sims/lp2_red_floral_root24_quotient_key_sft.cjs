"use strict";
/**
 * LP2 p39/p29/grid root-24 cue and the two pp40–55 floral red headings.
 *
 * The red p40 (8 rune) and p54 (9 rune) headings both vanish at x=24 in
 * GF(29) when read as printed-order descending polynomial coefficients.
 * The previously known p29 and table polynomials have double root24, while
 * the original red p39 triad yields root24 only in LOW-FIRST order.
 *
 * Test the new source-derived heading quotients at x24 as phase-zero
 * repeating GP29 keys on their adjacent original chapter bodies.
 * Node22 CommonJS; no third-party packages or file writes.
 *
 * Run: node sims/lp2_red_floral_root24_quotient_key_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = name => JSON.parse(fs.readFileSync(path.join(ROOT, name), "utf8"));
const corpus = read("resources/liber-primus/lp2-corpus.json");
const grid = read("resources/liber-primus/base60-grid.json");
const ink = read("resources/liber-primus/lp2-ink-annotations.json");
const mod = x => ((x % 29) + 29) % 29;
const root = 24;
const GP = new Map(corpus.runes.map((rune, i) => [rune, i]));

/** @param {number[]} coefficients @param {number} x */
function evaluate(coefficients, x) {
  return coefficients.reduce((sum, value) => mod(sum * x + value), 0);
}

/** @param {number[]} coefficients */
function derivative(coefficients) {
  return coefficients.slice(0, -1).map((value, i) =>
    mod(value * (coefficients.length - i - 1)));
}

/** Synthetic division in GF29, descending coefficient order. */
function divideByRoot(coefficients) {
  assert(coefficients.length >= 2);
  const quotient = [coefficients[0]];
  for (let i = 1; i < coefficients.length - 1; i++) {
    quotient.push(mod(coefficients[i] + root * quotient.at(-1)));
  }
  const remainder = mod(coefficients.at(-1) + root * quotient.at(-1));
  const reconstructed = quotient.map(x => x);
  const check = Array(coefficients.length).fill(0);
  for (let i = 0; i < quotient.length; i++) {
    check[i] = mod(check[i] + quotient[i]);
    check[i + 1] = mod(check[i + 1] - root * quotient[i]);
  }
  check[check.length - 1] = mod(check.at(-1) + remainder);
  assert.deepEqual(check, coefficients);
  return { quotient, remainder };
}

/** @param {number[]} symbols */
function ioc(symbols) {
  const counts = Array(29).fill(0);
  for (const x of symbols) counts[x]++;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) /
    (symbols.length * (symbols.length - 1));
}

/** @param {number[]} text @param {number[]} key @param {1|-1} sign */
function additive(text, key, sign) {
  return text.map((value, i) => mod(value + sign * key[i % key.length]));
}

const sourceTable = grid.byte_rows.flat().map(x => x % 29);
assert.equal(sourceTable.length, 256);
assert.equal(evaluate(sourceTable, root), 0);
assert.equal(evaluate(derivative(sourceTable), root), 0);
const p29 = corpus.pages[29].indices;
assert.equal(p29.length, 277);
assert.equal(evaluate(p29, root), 0);
assert.equal(evaluate(derivative(p29), root), 0);

// The p39 three-rune red span is HIGH-FIRST [IA,C,S], but its
// established 15*x²+5*x+27 factor reads the same three glyphs LOW-FIRST.
const p39red = ink.pages.find(p => p.page === 39).red_spans[0];
const p39indices = Array.from(p39red.runes).map(r => GP.get(r));
assert.deepEqual(p39indices, [27, 5, 15]);
const p39low = p39indices.slice().reverse();
assert.equal(evaluate(p39low, root), 0);
assert.equal(evaluate(derivative(p39low), root), 0);
assert.equal(evaluate(p39indices, root), 27); // Distinct direction, no silence.

const allRed = ink.pages.flatMap(p => (p.red_spans || []).map(span => ({
  page: p.page,
  start: span.start,
  indices: Array.from(span.runes).map(r => GP.get(r)),
})));
assert.equal(allRed.length, 18);
for (const span of allRed) {
  assert.deepEqual(
    corpus.pages[span.page].indices.slice(span.start, span.start + span.indices.length),
    span.indices
  );
}
const forwardZero = allRed.filter(span => evaluate(span.indices, root) === 0)
  .map(span => ({page: span.page, start: span.start, length: span.indices.length}));
assert.deepEqual(forwardZero, [
  {page: 40, start: 0, length: 8},
  {page: 54, start: 0, length: 9},
]);

const native = corpus.pages[57].indices;
assert.equal(native.length, 95);
const results = [];
for (const {page, headingLength, lastPage} of [
  {page: 40, headingLength: 8, lastPage: 53},
  {page: 54, headingLength: 9, lastPage: 55},
]) {
  const head = corpus.pages[page].indices.slice(0, headingLength);
  const {quotient, remainder} = divideByRoot(head);
  assert.equal(remainder, 0);
  const body = corpus.pages.slice(page, lastPage + 1)
    .flatMap(p => p.indices).slice(headingLength);
  const expectedLength = page === 40 ? 3000 : 299;
  assert.equal(body.length, expectedLength);
  assert.equal(quotient.length, headingLength - 1);
  const originalIoc = ioc(body);
  const tests = [];
  for (const sign of [-1, 1]) {
    const decoded = additive(body, quotient, sign);
    assert.deepEqual(additive(decoded, quotient, -sign), body);
    const planted = Array.from({length: body.length}, (_, i) => native[i % native.length]);
    const ciphertextPlant = additive(planted, quotient, -sign);
    assert.deepEqual(additive(ciphertextPlant, quotient, sign), planted);
    assert(ioc(decoded) < 0.045, "No original native-like GP reading");
    tests.push({
      sign, candidateIoc: ioc(decoded),
      preview: decoded.slice(0, 64).map(x => corpus.translit[x]).join(""),
      recoveredPlant: planted.length,
    });
  }
  results.push({
    physicalChapterStart: page,
    originalHeading: head.map(x => corpus.translit[x]).join(" "),
    headingEvaluatedAt24: evaluate(head, root),
    headingDerivativeAt24: evaluate(derivative(head), root),
    root24Quotient: quotient.map(x => corpus.translit[x]).join(" "),
    originalBodyRunes: body.length, originalBodyIoc: originalIoc,
    inverseTests: tests,
  });
}
assert.equal(results[0].inverseTests[0].candidateIoc, 0.03447193508947427);
assert.equal(results[1].inverseTests[1].candidateIoc, 0.03604857354492604);
console.log(JSON.stringify({
  observedCommonRoot: 24,
  originalTablePolynomialRootMultiplicityAtLeast: 2,
  originalP29PolynomialRootMultiplicityAtLeast: 2,
  p39RedTriadRoot24OnlyInLowFirstOrder: true,
  totalOriginalRedSpans: allRed.length,
  exactPrintedOrderRedRoot24Spans: forwardZero,
  originalFloralChapterInverse: results,
  decision: "Exact source-linked root observation; direct quotient-as-repeating-key does not recover plaintext.",
}, null, 2));
