"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const printed = corpus.pages.find(page => page.page === 29).indices;
assert.equal(printed.length, 277);
function mod(value) { return ((value % 29) + 29) % 29; }
function evaluate(coefficients, x) {
  let value = 0;
  for (let i = coefficients.length - 1; i >= 0; i--) value = mod(value * x + coefficients[i]);
  return value;
}
function derivative(coefficients) {
  return coefficients.slice(1).map((coefficient, i) => mod((i + 1) * coefficient));
}
function divideLinear(coefficients, root) {
  const degree = coefficients.length - 1;
  const quotient = Array(degree);
  quotient[degree - 1] = coefficients[degree];
  for (let i = degree - 1; i >= 1; i--) quotient[i - 1] = mod(coefficients[i] + root * quotient[i]);
  return {quotient, remainder: mod(coefficients[0] + root * quotient[0])};
}
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value]++;
  const n = values.length;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) / (n * (n - 1));
}
function letters(values) { return values.map(i => corpus.translit[i]).join("").replace(/[^A-Z]/g, ""); }
function model(text) {
  const counts = new Map();
  for (let i = 0; i <= text.length - 3; i++) {
    const gram = text.slice(i, i + 3);
    counts.set(gram, (counts.get(gram) || 0) + 1);
  }
  return {counts, total: text.length - 2, vocabulary: 26 ** 3};
}
function score(text, m) {
  let total = 0;
  for (let i = 0; i <= text.length - 3; i++) {
    const gram = text.slice(i, i + 3);
    total += Math.log(((m.counts.get(gram) || 0) + 0.1) / (m.total + 0.1 * m.vocabulary));
  }
  return total / (text.length - 2);
}
const round = n => Number(n.toFixed(12));
const ascending = printed.slice().reverse();
const d1 = derivative(ascending), d2 = derivative(d1);
const roots = {
  P3: evaluate(ascending, 3), Pprime3: evaluate(d1, 3),
  P24: evaluate(ascending, 24), Pprime24: evaluate(d1, 24),
  Psecond24: evaluate(d2, 24)
};
assert.deepEqual(roots, {P3:0,Pprime3:26,P24:0,Pprime24:0,Psecond24:24});
let quotient = ascending.slice(), divisions = [];
for (const root of [3,24,24]) {
  const result = divideLinear(quotient, root);
  divisions.push({root, degreeBefore:quotient.length-1, remainder:result.remainder, quotientLength:result.quotient.length});
  assert.equal(result.remainder, 0);
  quotient = result.quotient;
}
assert.equal(quotient.length, 274);
const printedQuotient = quotient.slice().reverse();
const caesar = read("resources/external/caesar-de-bello-civili-perseus-liber-primus-normalized.txt")
  .split(/\r?\n/).filter(line=>!line.startsWith("#")).join(" ").toUpperCase().replace(/[^A-Z]/g,"");
const shakespeare = read("resources/control/shakespeare_first300k.txt").toUpperCase().replace(/[^A-Z]/g,"");
const models = {latin:model(caesar),english:model(shakespeare)};
function assess(values) {
  const text = letters(values);
  return {runes:values.length,ioc:round(ioc(values)),latin:round(score(text,models.latin)),
    english:round(score(text,models.english)),prefix:text.slice(0,300)};
}
const p57 = corpus.pages.find(page=>page.page===57).indices;
console.log(JSON.stringify({
  status:"exact Q-factor confirmed; direct quotient is not plaintext",
  page:29,printedRuneCount:printed.length,polynomialConvention:"first printed rune is leading coefficient",
  field:"GF(29)",roots,
  Q:{expression:"(x-3)(x-24)^2",ascendingCoefficients:[12,24,7,1],divisions,
    quotientDegree:quotient.length-1,quotientLength:quotient.length},
  quotientPrintedOrder:assess(printedQuotient),
  quotientReverseOrder:assess(quotient),
  clearP57Control:assess(p57)
},null,2));
