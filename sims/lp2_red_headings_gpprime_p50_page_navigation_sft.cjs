"use strict";
/**
 * Reproducible literal red-chapter-heading → p50 address → page-number audit.
 * No hidden phrase, key, cipher or cherry-picked target page is inferred.
 * The input headings are the nine original page-start red inscriptions; p15
 * has two adjacent red spans making one interrupted heading.
 *
 * Windows Node22 CommonJS SFT. Read-only, immutable source inputs.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const load = p => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
const corpus = load("resources/liber-primus/lp2-corpus.json");
const ink = load("resources/liber-primus/lp2-ink-annotations.json");
const grid = load("resources/liber-primus/lp2-grid-256.json");
const tokens = grid.pages.flatMap(p => p.tokens);
assert.equal(tokens.length, 256);
assert.equal(corpus.pages.length, 58);
const alphabet60 = grid.alphabet;
const alphabet59 = alphabet60.replace("f", "");
assert.equal(alphabet60.length, 60);
assert.equal(alphabet59.length, 59);
const decode = (token, alphabet) =>
  alphabet.indexOf(token[0]) * alphabet.length + alphabet.indexOf(token[1]);
const starts = [0, 3, 8, 15, 23, 27, 33, 40, 54];
const red = starts.map(p => {
  const annotation = ink.pages.find(x => x.page === p);
  const spans = annotation.red_spans
    .filter(x => x.start === 0 || (p === 15 && x.start === 9));
  assert.equal(spans[0].start, 0);
  if (p === 15) assert.deepEqual(spans.map(x => [x.start, x.length]),
    [[0,9],[9,11]]);
  const vals = spans.flatMap(s => corpus.pages[p].indices
    .slice(s.start, s.start + s.length));
  const primeSum = vals.reduce((s, x) => s + corpus.prime[x], 0);
  const gp0Sum = vals.reduce((s, x) => s + x, 0);
  const cell = primeSum % 256;
  const token = tokens[cell];
  const base60Page = decode(token, alphabet60);
  const base59Page = decode(token, alphabet59);
  return {
    page:p, redLength:vals.length, primeSum, gp0Sum, cell,
    token, base60Page, base59Page,
    base60InBook:base60Page<58,
    base59InBook:base59Page<58,
    nextPhysicalPage:p+1,
    base60EqualsNext:base60Page===p+1,
    base59EqualsNext:base59Page===p+1
  };
});
assert.deepEqual(red.map(x=>x.primeSum),
  [662,742,446,1068,786,1109,379,435,597]);
assert.deepEqual(red.map(x=>x.cell),
  [150,230,190,44,18,85,123,179,85]);
assert.deepEqual(red.map(x=>[x.token,x.base60Page,x.base59Page]), [
  ["2X",153,151], ["1v",117,115], ["2o",170,167],
  ["3o",230,226], ["0F",15,15], ["0S",28,28],
  ["0s",54,53], ["2t",175,172], ["0S",28,28]
]);
const inBook60 = red.filter(x=>x.base60InBook);
const inBook59 = red.filter(x=>x.base59InBook);
assert.deepEqual(inBook60.map(x=>[x.page,x.base60Page]),
  [[23,15],[27,28],[33,54],[54,28]]);
assert.deepEqual(inBook59.map(x=>[x.page,x.base59Page]),
  [[23,15],[27,28],[33,53],[54,28]]);
assert.deepEqual(red.filter(x=>x.base60EqualsNext).map(x=>x.page),[27]);
assert.deepEqual(red.filter(x=>x.base59EqualsNext).map(x=>x.page),[27]);
// Literal source p15 is a 4×4 printed numerical figure, not sixteen
// post-selected rune plaintext values. The p23 red rune count matches it.
assert.equal(red.find(x=>x.page===23).redLength,16);
const address85 = red.filter(x=>x.cell===85);
assert.deepEqual(address85.map(x=>x.page),[27,54]);
assert.equal(address85[0].token,"0S");
assert.equal(address85[0].base60Page,28);
assert.equal(address85[1].base59Page,28);
console.log(JSON.stringify({
  status:"Source-anchored candidate page-navigation interpretation, no decoder",
  source:"All nine original page-start red headings, no hand-selected exclusions",
  formula:"GP-prime-weight SUM of source red title, mod256, p50 zero-based cell, base59 or base60 value",
  red,
  validPagePointersInBase60:inBook60.map(x=>[x.page,x.base60Page]),
  validPagePointersInBase59:inBook59.map(x=>[x.page,x.base59Page]),
  exactRadixIndependentLinks:[[23,15],[27,28],[54,28]],
  discriminatingFork:["p33=>p54 in base60","p33=>p53 in base59"],
  observedSourceShapes:["p23 red heading has 16 runes; p15 prints 16 values in 4x4 grid",
  "p27 immediately precedes p28 which has DH23 line6",
  "p27 and p54 red prime sums differ 512 and both address p50 cell85"],
  unresolved:["No instruction guarantees title prime sums or modulo256 lookup",
    "No key or cipher inverse follows from page pointer alone",
    "p33 radix-dependent page target differs"],
  authenticUnknownPlaintextRecovered:false
},null,2));
