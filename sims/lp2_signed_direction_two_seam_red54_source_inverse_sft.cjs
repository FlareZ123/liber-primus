"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
const index = read("resources/cicada2014-onion7-index.html");
const authorPageNames = Array.from(index.matchAll(/<img src="(\d+)\.jpg"/g),
  (m) => Number(m[1]));
assert.deepEqual(authorPageNames, [...Array(58).keys()]);

const words = signed.slice(signed.indexOf("Hello."),
  signed.indexOf("-----BEGIN PGP SIGNATURE-----"))
  .replace(/\b7A35090F\b/g, "")
  .match(/[A-Za-z]+/g).map((s) => s.toUpperCase());
assert.equal(words[29], "DIRECTION");

/** @param {string} english @param {boolean} ior @returns {number} */
function gp0(english, ior) {
  const normalized = english.replace(/QU/g, "CW")
    .replace(/[KQ]/g, "C").replace(/V/g, "U").replace(/Z/g, "S");
  const mapping = corpus.translit.map((s, index) => ({ s, index }))
    .sort((a, b) => b.s.length - a.s.length);
  let sum = 0;
  for (let i = 0; i < normalized.length;) {
    if (ior && normalized.startsWith("IO", i)) { sum += 27; i += 2; continue; }
    const entry = mapping.find((item) => normalized.startsWith(item.s, i));
    assert.ok(entry, "unmapped GP spelling");
    sum += entry.index;
    i += entry.s.length;
  }
  return sum;
}

const literal = gp0("DIRECTION", false);
const ior = gp0("DIRECTION", true);
assert.deepEqual([literal, ior, literal % 58, ior % 58], [98, 112, 40, 54]);
assert.equal(gp0("ROAD", false), 54);
const chapterStarts = [0, 3, 8, 15, 23, 27, 33, 40, 54];
assert.ok(chapterStarts.includes(literal % 58));
assert.ok(chapterStarts.includes(ior % 58));
assert.deepEqual(chapterStarts.filter((n) =>
  chapterStarts.includes((n + 14) % 58)), [40]);

/** @param {number} p @returns {number[]} */
function terminalRed(p) {
  const spans = ink.pages.find((row) => row.page === p).red_spans;
  const s = spans[spans.length - 1];
  const values = corpus.pages[p].indices.slice(s.start, s.start + s.length);
  assert.equal(values.length, s.length);
  return values;
}

const red39 = terminalRed(39);
const red53 = terminalRed(53);
assert.deepEqual(red39, [27, 5, 15]);
assert.equal(red53.length, 51);
const redKey = red39.concat(red53);
assert.equal(redKey.length, 54);
const target = corpus.pages[54].indices.concat(corpus.pages[55].indices);
assert.equal(corpus.pages[54].indices.length, 232);
assert.equal(corpus.pages[55].indices.length, 76);
assert.equal(target.length, 308);
const rawFLocations = target.map((n, i) => n === 0 ? i : -1).filter((n) => n >= 0);
assert.deepEqual(rawFLocations, [41, 65, 195, 247, 257, 273]);

/** @param {number} n @returns {number} */
function mod(n) { return (n % 29 + 29) % 29; }

/**
 * Exact authentic LP2 p56-F semantics, with completely unknown F decisions.
 * Any C!=F that decrypts to plaintext F is impossible; C=F may mean
 * transparent plaintext F (consume nothing) or encrypted non-F.
 * @param {number[]} cipher
 * @param {number[]} key
 * @param {1|-1} sign
 * @param {number} begin
 * @returns {{firstImpossible:number|null,terminalKeyClocks:number[]}}
 */
function reachable(cipher, key, sign, begin) {
  let clocks = new Set([0]);
  for (let i = begin; i < cipher.length; i++) {
    const next = new Set();
    for (const k of clocks) {
      const p = mod(cipher[i] + sign * key[k % key.length]);
      if (cipher[i] === 0) next.add(k);
      if (p !== 0) next.add(k + 1);
    }
    clocks = next;
    if (!clocks.size) return { firstImpossible: i, terminalKeyClocks: [] };
  }
  return { firstImpossible: null, terminalKeyClocks: [...clocks].sort((a, b) => a - b) };
}

/**
 * Forward plant: the actual recovered p57 rune stream supplies independently
 * native, source-authentic GP29 values, including genuine F runes.
 * @param {number[]} plain
 * @param {number[]} key
 * @param {1|-1} sign
 * @param {number} begin
 * @returns {{cipher:number[],consumed:number}}
 */
function encryptPlant(plain, key, sign, begin) {
  const cipher = plain.slice();
  let consumed = 0;
  for (let i = begin; i < plain.length; i++) {
    if (plain[i] === 0) cipher[i] = 0;
    else {
      cipher[i] = mod(plain[i] - sign * key[consumed % key.length]);
      consumed++;
    }
  }
  return { cipher, consumed };
}

const positivePlain = Array.from({ length: target.length },
  (_, i) => corpus.pages[57].indices[i % corpus.pages[57].indices.length]);
const outcomes = [];
for (const begin of [0, 1]) {
  for (const keyType of ["rune", "gp-prime-residue"]) {
    const key = redKey.map((n) => keyType === "rune" ? n : corpus.prime[n] % 29);
    for (const sign of [-1, 1]) {
      const result = reachable(target, key, sign, begin);
      assert.notEqual(result.firstImpossible, null,
        "unexpected full legal original p54/p55 decoder");
      assert.equal(result.terminalKeyClocks.length, 0);
      const planted = encryptPlant(positivePlain, key, sign, begin);
      const control = reachable(planted.cipher, key, sign, begin);
      assert.equal(control.firstImpossible, null,
        "authentic solved-p57 GP plant must remain reachable");
      assert.ok(control.terminalKeyClocks.includes(planted.consumed));
      outcomes.push({
        begin,
        keyType,
        sign,
        firstImpossible: result.firstImpossible,
        controlKnownKeyConsumed: planted.consumed,
        controlRecoveredEntire308: true,
      });
    }
  }
}
assert.deepEqual(outcomes.map((o) => o.firstImpossible),
  [50, 114, 8, 22, 21, 114, 81, 35]);

console.log(JSON.stringify({
  status: "PASS",
  sourceSelection: "signed DIRECTION GP0 98/112 modulo original 58 => chapter starts 40/54",
  redTerminalSourcePages: [39, 53],
  redLengths: [3, 51],
  sourceKeyLength: 54,
  signedROADgp0: 54,
  fixedCipherReceiver: "all p54 232 + p55 76 contiguous runes",
  authenticP56Model: "GP29 addition/subtraction, transparent F no key advance",
  forbiddenSourceOriginalPaths: outcomes.length,
  originalOutcomes: outcomes,
  discovery: "No p54-55 plaintext or source-authenticated cipher; eight frozen inverses impossible",
}, null, 2));
