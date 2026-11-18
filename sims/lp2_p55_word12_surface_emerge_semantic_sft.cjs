"use strict";

/**
 * Source-selected p55 word12 semantic carrier.
 *
 * Upstream:
 *   p57 TUNNELNG GP0=94 -> p50[94]=0u -> base59=55, selecting p55.
 *   p57 OUR is title-inclusive word12 and phi(GP-prime(OUR))=12.
 *   p28 center-line DH23 supplies shared K=2 as the shed depth.
 *
 * Blind receiver:
 *   canonical p55 word12, after K=2 symmetric shedding.
 *
 * Run:
 *   node sims/lp2_p55_word12_surface_emerge_semantic_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const solved = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const parts = transcription.split(/^\s*%\s*$/m);
const tokens = grid.pages.flatMap((page) => page.tokens);
const alphabet59 = grid.alphabet.replace("f", "");

/** @param {string} token */
function decode59(token) {
  const high = alphabet59.indexOf(token[0]);
  const low = alphabet59.indexOf(token[1]);
  assert.ok(high >= 0 && low >= 0);
  return high * 59 + low;
}

/** @param {number} n */
function phi(n) {
  let result = n;
  let value = n;
  for (let p = 2; p * p <= value; p += 1) {
    if (value % p !== 0) continue;
    while (value % p === 0) value /= p;
    result -= result / p;
  }
  if (value > 1) result -= result / value;
  return result;
}

/** @param {number[]} values */
function primeSum(values) {
  return values.reduce((sum, value) => sum + corpus.prime[value], 0);
}

/** @param {number[]} values */
function gp0(values) {
  return values.reduce((sum, value) => sum + value, 0);
}

/** @param {number[]} values */
function spell(values) {
  return values.map((value) => corpus.translit[value]).join("");
}

/** @param {string} text */
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

/** @param {number} physicalPage */
function physicalWords(physicalPage) {
  assert.notEqual(physicalPage, 50);
  const partIndex = physicalPage <= 49 ? physicalPage : physicalPage - 1;
  return runeWords(parts[partIndex]);
}

const p57 = solved.sections.find((section) => section.name === "p57_parable");
assert.ok(p57);
const p57Words = runeWords(p57.source_text);
const p57Rows = p57Words.map((word, index) => ({
  position: index + 1,
  text: spell(word),
  gp0: gp0(word),
  prime: primeSum(word),
}));

/** @param {string} text */
function p57Word(text) {
  const row = p57Rows.find((candidate) => candidate.text === text);
  assert.ok(row);
  return row;
}

const tunnelng = p57Word("TUNNELNG");
const our = p57Word("OUR");
const the = p57Word("THE");
const surface = p57Word("SURFACE");
const emerge = p57Word("EMERGE");

assert.equal(tunnelng.gp0, 94);
assert.equal(tokens[tunnelng.gp0], "0u");
assert.equal(decode59(tokens[tunnelng.gp0]), 55);

assert.equal(our.position, 12);
assert.equal(our.prime, 21);
assert.equal(phi(our.prime), 12);

const p55Words = physicalWords(55);
assert.equal(p55Words.length, 17);
const selected = p55Words[11];
assert.deepEqual(selected, [28, 18, 10, 6, 14, 6, 15]);
assert.equal(spell(selected), "EAEIGXGS");
assert.equal(selected.length, 7);

const K = 2;
const interior = selected.slice(K, -K);
const shell = selected.slice(0, K).concat(selected.slice(-K));
assert.deepEqual(interior, [10, 6, 14]);
assert.deepEqual(shell, [28, 18, 6, 15]);

const registers = {
  wholePrime: primeSum(selected),
  wholePhi: phi(primeSum(selected)),
  shellPrime: primeSum(shell),
  shellPhi: phi(primeSum(shell)),
  interiorPrime: primeSum(interior),
  interiorPhi: phi(primeSum(interior)),
};

assert.deepEqual(registers, {
  wholePrime: 341,
  wholePhi: 300,
  shellPrime: 246,
  shellPhi: 80,
  interiorPrime: 95,
  interiorPhi: 72,
});
assert.equal(registers.wholePhi, emerge.prime);
assert.equal(registers.shellPrime, surface.prime);
assert.equal(registers.interiorPhi, the.prime);
assert.equal(phi(emerge.prime), 80);
assert.equal(phi(surface.prime), 80);

/* Global holdout over all complete p0..p55 words. */
const tripleHits = [];
for (let physicalPage = 0; physicalPage <= 55; physicalPage += 1) {
  if (physicalPage === 50) continue;
  const words = physicalWords(physicalPage);
  for (let index = 0; index < words.length; index += 1) {
    const word = words[index];
    if (word.length < 2 * K + 1) continue;
    const inner = word.slice(K, -K);
    const outer = word.slice(0, K).concat(word.slice(-K));
    if (
      phi(primeSum(word)) === emerge.prime &&
      primeSum(outer) === surface.prime &&
      phi(primeSum(inner)) === the.prime
    ) {
      tripleHits.push({
        page: physicalPage,
        word: index + 1,
        text: spell(word),
        values: word,
      });
    }
  }
}
assert.deepEqual(tripleHits, [{
  page: 55,
  word: 12,
  text: "EAEIGXGS",
  values: [28, 18, 10, 6, 14, 6, 15],
}]);

console.log(JSON.stringify({
  status: "PASS: TUNNELNG->p55 and OUR->word12 select a unique K=2 THE/SURFACE/EMERGE carrier",
  upstream: {
    tunnelngGp0: tunnelng.gp0,
    tableToken: tokens[tunnelng.gp0],
    base59Page: decode59(tokens[tunnelng.gp0]),
    ourPosition: our.position,
    ourPrime: our.prime,
    ourTotient: phi(our.prime),
    shedDepth: K,
  },
  p55: {
    word: 12,
    text: spell(selected),
    values: selected,
    interior: spell(interior),
    shell: spell(shell),
    registers,
    semanticOrderFromInsideOut: ["THE", "SURFACE", "EMERGE"],
    commonTotient: phi(surface.prime),
  },
  globalTripleHits: tripleHits,
}, null, 2));
