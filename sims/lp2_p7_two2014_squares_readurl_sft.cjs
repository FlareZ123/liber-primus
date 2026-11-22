"use strict";
/**
 * Cross-source five-word readout: untouched LP2 p7 red products and Cicada's
 * two pre-LP2 5x5 magic squares. Tests one motivated exponent (five printed
 * red words), the complete 56-exponent/120-word-order reference family, and
 * uniqueness of the inverse GF29 linear equations.
 *
 * SFT: Node.js 22, CommonJS, Windows 11 compatible, read-only.
 * Run: node sims/lp2_p7_two2014_squares_readurl_sft.cjs
 *
 * The phrase is a conditional interpretation, NOT decrypted unknown LP2 text.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const load = name => fs.readFileSync(path.resolve(root, name), "utf8");
const corpus = JSON.parse(load("resources/liber-primus/lp2-corpus.json"));
const annotations = JSON.parse(load("resources/liber-primus/lp2-ink-annotations.json"));
const pageTranscripts = load("resources/lp2-transcription.txt").split("%");
const gpIndex = new Map(corpus.runes.map((glyph, index) => [glyph, index]));
const mod = value => ((value % 29) + 29) % 29;

/** @param {number} page @returns {{start:number,end:number,runes:number[]}[]} */
function pageWords(page) {
  const text = pageTranscripts[page - Number(page > 50)].replace(/\/\s*/g, "");
  let pos = 0;
  return (text.match(/[\u16a0-\u16ff]+/gu) || []).map(printed => {
    const runes = [...printed].map(glyph => {
      assert(gpIndex.has(glyph), "Unknown GP glyph");
      return gpIndex.get(glyph);
    });
    const word = {start: pos, end: pos + runes.length, runes};
    pos = word.end;
    return word;
  });
}

/** @param {number} page @param {{start:number,length:number}} span */
function originalRedProducts(page, span) {
  return pageWords(page).filter(w =>
    w.start >= span.start && w.end <= span.start + span.length
  ).map(w => w.runes.reduce((acc, v) => mod(acc * v), 1));
}
const redP7 = annotations.pages.find(p => p.page === 7).red_spans
  .map(span => originalRedProducts(7, span))
  .find(products => products.length === 5);
const redP53 = annotations.pages.find(p => p.page === 53).red_spans
  .map(span => originalRedProducts(53, span))
  .find(products => products.length === 12);
assert.deepEqual(redP7, [11, 26, 8, 15, 2]);
assert.deepEqual(redP53, [7, 14, 25, 16, 17, 23, 3, 4, 0, 22, 4, 1]);

const matrixGroups = load("resources/cicada2014-openpuff-magic-squares.txt")
  .trim().split(/\n\s*\n/).map(block => block.trim().split(/\r?\n/)
    .filter(line => line.trim())
    .map(line => line.trim().split(/\s+/).map(Number)));
assert.deepEqual(matrixGroups.map(m => m.length), [5, 7, 5]);
const A = matrixGroups[0], B = matrixGroups[2];
assert.deepEqual([A.length, B.length], [5, 5]);
assert(A.every(row => row.length === 5 && row.reduce((a, b) => a + b, 0) === 3301));
assert(B.every(row => row.length === 5 && row.reduce((a, b) => a + b, 0) === 1033));

const identity = size => Array.from({length: size}, (_, i) =>
  Array.from({length: size}, (_, j) => Number(i === j)));
/** @param {number[][]} x @param {number[][]} y @returns {number[][]} */
function multiply(x, y) {
  return x.map(row => y[0].map((_, col) =>
    mod(row.reduce((sum, a, i) => sum + a * y[i][col], 0))));
}
/** @param {number[][]} x @param {number[]} v @returns {number[]} */
function transform(x, v) {
  return x.map(row => mod(row.reduce((sum, a, i) => sum + a * v[i], 0)));
}
function powersOf(x, size) {
  const powers = [identity(x.length)];
  for (let i = 1; i < size; i++) powers.push(multiply(powers.at(-1), x));
  return powers;
}
const Aa = powersOf(A, 57), Bb = powersOf(B, 57);
assert.deepEqual(Aa[56], identity(5));
assert.deepEqual(Bb[28], identity(5));
const first = transform(Aa[5], redP7);
const second = transform(Bb[5], redP7);
assert.deepEqual(first, [13, 18, 4, 28, 23]);
assert.deepEqual(second, [1, 4, 20, 14, 21]);
const literal = data => data.map(i => corpus.translit[i]).join("");
assert.equal(literal(first), "PEREAD");
assert.equal(literal(second), "URLXNG");

const targetRead = [4, 28, 23], targetUrl = [1, 4, 20];
const middle = first.slice(2).concat(second.slice(0, 3));
assert.deepEqual(middle, targetRead.concat(targetUrl));
assert.equal(literal(middle), "READURL");

/** @param {number[]} items @returns {number[][]} */
function permutations(items) {
  const result = [];
  function visit(prefix, rest) {
    if (!rest.length) {result.push(prefix); return;}
    rest.forEach((v, i) => visit(prefix.concat(v), rest.filter((_, j) => i !== j)));
  }
  visit([], items);
  return result;
}
const candidates = [];
let suffixReadHits = 0, prefixUrlHits = 0;
const permutationsOfFive = permutations([0, 1, 2, 3, 4]);
assert.equal(permutationsOfFive.length, 120);
for (let exponent = 0; exponent < 56; exponent++) {
  for (const ordering of permutationsOfFive) {
    const v = ordering.map(i => redP7[i]);
    const x = transform(Aa[exponent], v);
    const y = transform(Bb[exponent], v);
    const hasRead = x.slice(2).every((z, i) => z === targetRead[i]);
    const hasUrl = y.slice(0, 3).every((z, i) => z === targetUrl[i]);
    if (hasRead) suffixReadHits++;
    if (hasUrl) prefixUrlHits++;
    if (hasRead && hasUrl) candidates.push({exponent, ordering});
  }
}
assert.equal(suffixReadHits, 1);
assert.equal(prefixUrlHits, 4);
assert.deepEqual(candidates, [{
  exponent: 5, ordering: [0, 1, 2, 3, 4]
}]);

// An independent original 12-red-word span on p53 supplies eight 5-word
// windows. None produces the same centrally positioned six-rune phrase.
let p53Matches = 0;
for (let start = 0; start + 5 <= redP53.length; start++) {
  const v = redP53.slice(start, start + 5);
  for (let exponent = 0; exponent < 56; exponent++) {
    const x = transform(Aa[exponent], v);
    const y = transform(Bb[exponent], v);
    if (x.slice(2).every((z, i) => z === targetRead[i]) &&
        y.slice(0, 3).every((z, i) => z === targetUrl[i])) p53Matches++;
  }
}
assert.equal(p53Matches, 0);

// The six printed rune values constrain one unknown source five-vector.
// Exact GF29 elimination proves a unique solution, the original p7 vector.
const leftRows = Aa[5].slice(2), rightRows = Bb[5].slice(0, 3);
const rhs = targetRead.concat(targetUrl);
const system = leftRows.concat(rightRows).map((r, i) =>
  r.concat([rhs[i]]));
const pivotColumns = [];
let pivotRow = 0;
for (let col = 0; col < 5; col++) {
  let next = pivotRow;
  while (next < system.length && system[next][col] === 0) next++;
  if (next === system.length) continue;
  [system[pivotRow], system[next]] = [system[next], system[pivotRow]];
  let inverse = 1;
  while (mod(inverse * system[pivotRow][col]) !== 1) inverse++;
  assert(inverse < 29);
  system[pivotRow] = system[pivotRow].map(x => mod(x * inverse));
  for (let i = 0; i < system.length; i++) {
    if (i === pivotRow) continue;
    const factor = system[i][col];
    system[i] = system[i].map((x, k) => mod(x - factor * system[pivotRow][k]));
  }
  pivotColumns.push(col);
  pivotRow++;
}
assert.deepEqual(pivotColumns, [0, 1, 2, 3, 4]);
assert(system[5].every(v => v === 0));
assert.deepEqual(system.slice(0, 5).map(row => row[5]), redP7);

// Original p3-p7 comprises precisely 255 real printed words after joining four
// cross-page continuations. The five genuine red words are the last five.
// This is a natural, independently source-shaped 51x5 consumer of both squares.
const scrollWords = (pageTranscripts.slice(3, 8).join("")
  .replace(/\/\s*/g, "").match(/[\u16a0-\u16ff]+/gu) || [])
  .map(str => [...str].map(glyph => gpIndex.get(glyph)));
assert.equal(scrollWords.length, 255);
assert.deepEqual(scrollWords.flat(),
  corpus.pages.slice(3, 8).flatMap(page => page.indices));
const scrollProducts = scrollWords.map(runes =>
  runes.reduce((acc, rune) => mod(acc * rune), 1));
assert.deepEqual(scrollProducts.slice(-5), redP7);
const scrollFifthOutputs = [];
for (let pos = 0; pos < 255; pos += 5) {
  const source = scrollProducts.slice(pos, pos + 5);
  scrollFifthOutputs.push({
    first: transform(Aa[5], source),
    second: transform(Bb[5], source)
  });
}
assert.equal(scrollFifthOutputs.length, 51);
assert.equal(literal(scrollFifthOutputs.at(-1).first.slice(2).concat(
  scrollFifthOutputs.at(-1).second.slice(0, 3))), "READURL");
const otherMatchingMiddleSix = scrollFifthOutputs.slice(0, -1).filter(block =>
  literal(block.first.slice(2).concat(block.second.slice(0, 3))) === "READURL");
assert.equal(otherMatchingMiddleSix.length, 0);

// Direct 255-word-product → 255-rune p8 additive pad is a complete frozen
// source receiver, independent from the terminal instruction extraction.
const p8 = corpus.pages.find(page => page.page === 8).indices;
assert.equal(p8.length, 255);
const originalIoc = values => {
  const hist = Array(29).fill(0);
  for (const n of values) hist[n]++;
  return hist.reduce((total, n) => total + n * (n - 1), 0) /
    (values.length * (values.length - 1));
};
const receiverResults = [];
const knownP57 = corpus.pages.find(page => page.page === 57).indices;
for (const [name, operator] of [
  ["A5", Aa[5]], ["A-minus5", Aa[51]],
  ["B5", Bb[5]], ["B-minus5", Bb[23]]
]) {
  const pad = [];
  for (let at = 0; at < 255; at += 5) {
    pad.push(...transform(operator, scrollProducts.slice(at, at + 5)));
  }
  assert.equal(pad.length, 255);
  for (const sign of [-1, 1]) {
    const decoded = p8.map((rune, i) => mod(rune + sign * pad[i]));
    assert.deepEqual(decoded.map((x, i) => mod(x - sign * pad[i])), p8);
    const knownNative = Array.from({length: 255},
      (_, i) => knownP57[i % knownP57.length]);
    const plant = knownNative.map((x, i) => mod(x - sign * pad[i]));
    assert.deepEqual(plant.map((x, i) => mod(x + sign * pad[i])), knownNative);
    receiverResults.push({
      operator: name, sign,
      full255Ioc: Number(originalIoc(decoded).toFixed(12)),
      black243Ioc: Number(originalIoc(decoded.slice(12)).toFixed(12))
    });
  }
}
assert.deepEqual(receiverResults.map(x => x.full255Ioc), [
  0.033101744635, 0.03433688436,
  0.034151613401, 0.034522155319,
  0.034553033812, 0.033997220936,
  0.034985332716, 0.033039987649
]);
assert(receiverResults.every(x => x.full255Ioc < 0.036));

const result = {
  classification: "Conditional cross-source readout, no unknown plaintext",
  originalP7FiveRedWordProducts: redP7,
  historicalSquares: ["3301 five-by-five", "1033 five-by-five"],
  sourceMotivatedExponent: 5,
  firstOutput: {gpIndices: first, glyphs: literal(first)},
  secondOutput: {gpIndices: second, glyphs: literal(second)},
  centrallyFramedRunePhrase: {gpIndices: middle, text: literal(middle)},
  exactFamily: {exponents: 56, inputOrders: 120,
    uniqueJointMatch: candidates, separateReadHits: suffixReadHits,
    separateUrlHits: prefixUrlHits},
  independentP53Controls: {redWords: 12, windows: 8, exponents: 56,
    exactJointMatches: p53Matches},
  originalScroll: {pages: "p3-p7", originalPrintedWords: scrollWords.length,
    fiveWordGroups: scrollFifthOutputs.length,
    terminalGroupOriginalProducts: scrollProducts.slice(-5),
    nonterminalReadUrlMatches: otherMatchingMiddleSix.length},
  completeP8Receiver: {original255Ioc: Number(originalIoc(p8).toFixed(12)),
    exactOriginalNativeGPPositiveCases: receiverResults.length,
    inverseResults: receiverResults},
  reverseEquations: {constraints: 6, gf29Rank: 5,
    uniqueVector: system.slice(0, 5).map(row => row[5])},
  limitation: "Operation and frame not selected by a signed Cicada instruction; no p0-p55 plaintext recovered"
};
console.log(JSON.stringify(result, null, 2));
