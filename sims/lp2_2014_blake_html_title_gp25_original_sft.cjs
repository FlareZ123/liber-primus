"use strict";
/**
 * Original 2014 Onion1 HTML title "For Every Thing That Lives Is Holy"
 * from stage02/auqgnxjtvdbll3pv.onion/index.html in the dated
 * micheloosterhof/cicada-2014 archive. Source-selected candidate literal
 * 25-rune GP29 repeating key with authentic LP1 plaintext-F bypass.
 * No original unknown page is claimed solved.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, "..",
  "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const GP = corpus.translit;
const SYMBOL = new Map(GP.map((word, i) => [word, i]));
const longest = GP.slice().sort((a, b) => b.length - a.length);
const phrase = "For Every Thing That Lives Is Holy";
const source = phrase.toUpperCase().replace(/QU/g, "CW").replace(/V/g, "U")
  .replace(/[KQ]/g, "C").replace(/Z/g, "S").replace(/[^A-Z]/g, "");
const key = [];
for (let i = 0; i < source.length;) {
  const symbol = longest.find(word => source.startsWith(word, i));
  assert.ok(symbol);
  key.push(SYMBOL.get(symbol));
  i += symbol.length;
}
assert.equal(key.length, 25);
assert.equal(key.map(n => GP[n]).join(""), "FOREUERYTHINGTHATLIUESISHOLY");
const pages = corpus.pages.slice(0, 56);
const first = pages.slice(0, 3).flatMap(p => p.indices);
const later = pages.slice(40, 54).flatMap(p => p.indices);
const book = pages.flatMap(p => p.indices);
assert.deepEqual([first.length, later.length, book.length], [729, 3008, 12956]);
const mod = (x, n) => (x % n + n) % n;
/** @param {number[]} a */
function ioc(a) {
  const counts = Array(29).fill(0);
  for (const x of a) counts[x]++;
  return counts.reduce((total, x) => total + x * (x - 1), 0) /
    (a.length * (a.length - 1));
}
/**
 * Test every possible literal F bypass history without language assumptions.
 * An original C=F is ambiguous: literal-F skip or consuming non-F inverse.
 * When C!=F, consuming inverse GP F is illegal in the true forward cipher.
 * @param {number[]} ciphertext @param {number} sign
 */
function fSkipStates(ciphertext, sign) {
  let phases = new Set([0]);
  for (let i = 0; i < ciphertext.length; i++) {
    const next = new Set();
    for (const consumed of phases) {
      const plain = mod(ciphertext[i] + sign * key[consumed % key.length], 29);
      if (plain !== 0) next.add(consumed + 1);
      if (ciphertext[i] === 0) next.add(consumed);
    }
    phases = next;
    if (phases.size === 0) return {valid: false, firstImpossible: i};
  }
  return {valid: true, reachablePhases: phases.size};
}
/** @param {number[]} ciphertext @param {number} sign */
function directRead(ciphertext, sign) {
  return ciphertext.map((c, i) => mod(c + sign * key[i % key.length], 29));
}
/**
 * Authentic forward transparent-F convention:
 * plaintext F emits F without consuming key; other plaintext consumes key.
 * @param {number[]} plaintext @param {number} sign inverse decoding sign
 */
function fSkipEncrypt(plaintext, sign) {
  let i = 0;
  return plaintext.map(p => p === 0 ? 0 : mod(p - sign * key[i++ % key.length], 29));
}
const report = [];
for (const sign of [-1, 1]) {
  const p0 = directRead(first, sign), p40 = directRead(later, sign);
  const global = directRead(book, sign);
  const run = {sign, p0IOC: ioc(p0), p40IOC: ioc(p40),
    fullIOC: ioc(global),
    p0Opening: p0.slice(0, 60).map(n => GP[n]).join(""),
    p0Fskip: fSkipStates(first, sign), p40Fskip: fSkipStates(later, sign)};
  report.push(run);
}
assert.deepEqual(report.map(x => [x.p0Fskip.firstImpossible,
  x.p40Fskip.firstImpossible]), [[174, 79], [41, 159]]);
assert.ok(report.every(x => !x.p0Fskip.valid && !x.p40Fskip.valid));
assert.ok(report.every(x => x.fullIOC < 0.036));
const plant = Array.from({length: 1200}, (_, i) =>
  (i % 31 === 0) ? 0 : (13 * i + 7) % 28 + 1);
for (const sign of [-1, 1]) {
  const encrypted = fSkipEncrypt(plant, sign);
  const valid = fSkipStates(encrypted, sign);
  assert.equal(valid.valid, true);
  assert.ok(valid.reachablePhases >= 1);
}
console.log(JSON.stringify({classification: "historical stage2 literal-key negative",
  original: "https://github.com/micheloosterhof/cicada-2014/blob/6c3421a4d245596e403c88e037509d162a2afd17/stage02/auqgnxjtvdbll3pv.onion/index.html",
  sourceQuote: phrase, gpKeyLength: key.length,
  p0RawIOC: ioc(first), p40RawIOC: ioc(later), fullRawIOC: ioc(book),
  explicitTwoSigns: report,
  originalResult: "No source-native language on naive inverse; " +
    "no legal complete transparent-F inverse on either independent chapter",
  independentTrueFSkipPlant: "1200/1200 symbols encodable; both signs accepted",
}, null, 2));
