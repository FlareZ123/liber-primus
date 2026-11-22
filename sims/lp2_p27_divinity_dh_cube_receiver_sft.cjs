"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const rawPages = read("resources/liber-primus/lp2-transcription.txt").split("%");
const prime = corpus.prime;
const translit = corpus.translit;
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));

function pageWords(physicalPage) {
  const rawIndex = physicalPage <= 49 ? physicalPage : physicalPage - 1;
  const page = rawPages[rawIndex];
  let offset = 0, current = [], start = -1;
  const words = [];
  const flush = () => {
    if (current.length) words.push({start, end: offset, inds: current});
    current = [];
    start = -1;
  };
  for (const character of page) {
    const value = runeIndex.get(character);
    if (value !== undefined) {
      if (!current.length) start = offset;
      current.push(value);
      offset += 1;
    } else if (character === "/" || /\s/u.test(character)) {
      // Slash and whitespace are printed line-wrap notation.
    } else {
      flush();
    }
  }
  flush();
  return words;
}

function primeSum(indices) {
  return indices.reduce((sum, index) => sum + prime[index], 0);
}
function phi(value) {
  let result = value, remaining = value;
  for (let factor = 2; factor * factor <= remaining; factor += 1) {
    if (remaining % factor === 0) {
      while (remaining % factor === 0) remaining /= factor;
      result -= result / factor;
    }
  }
  if (remaining > 1) result -= result / remaining;
  return result;
}
function modInverse(value, modulus) {
  for (let candidate = 1; candidate < modulus; candidate += 1) {
    if ((value * candidate) % modulus === 1) return candidate;
  }
  throw new Error("No modular inverse");
}
function powMod(base, exponent, modulus) {
  let result = 1;
  while (exponent > 0) {
    if (exponent & 1) result = (result * base) % modulus;
    base = (base * base) % modulus;
    exponent = Math.floor(exponent / 2);
  }
  return result;
}
function transliterate(indices) {
  return indices.map((index) => translit[index]).join("");
}

const unknown12 = [];
for (let physicalPage = 0; physicalPage <= 55; physicalPage += 1) {
  if (physicalPage === 50) continue;
  for (const word of pageWords(physicalPage)) {
    if (word.inds.length === 12) unknown12.push({page: physicalPage, ...word});
  }
}
assert.equal(unknown12.length, 18);
const body12 = pageWords(27).filter((word) => word.start >= 19 && word.inds.length === 12);
assert.equal(body12.length, 2);
const selected = unknown12.filter((word) =>
  phi(primeSum(word.inds)) === 280 &&
  primeSum(word.inds.slice(2, -2)) === 376
);
assert.equal(selected.length, 1);
assert.equal(selected[0].page, 27);
assert.equal(selected[0].start, 79);
assert.equal(transliterate(selected[0].inds), "EORNSOOCAEYEE");
assert.equal(primeSum(selected[0].inds), 562);
assert.equal(phi(primeSum(selected[0].inds)), 280);

const interior = selected[0].inds.slice(2, -2);
assert.equal(interior.length, 8);
assert.equal(transliterate(interior), "NSOOCAEY");
assert.equal(primeSum(interior), 376);
const p57Words = pageWords(57);
const p57Instar = p57Words.find((word) => primeSum(word.inds) === 280);
const p57Divinity = p57Words.find((word) => primeSum(word.inds) === 376);
assert.equal(transliterate(p57Instar.inds), "INSTAR");
assert.equal(transliterate(p57Divinity.inds), "DIUINITY");
assert.equal(p57Divinity.inds.length, 8);

// The p28 DH23 state is independently reconstructed in the linked p28 SFT/report.
const dh = {p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2};
assert.equal(powMod(dh.g, dh.a, dh.p), dh.A);
assert.equal(powMod(dh.g, dh.b, dh.p), dh.B);
assert.equal(powMod(dh.B, dh.a, dh.p), dh.K);
assert.equal(powMod(dh.A, dh.b, dh.p), dh.K);
const exponent = modInverse(dh.b, dh.p - 1);
assert.equal(exponent, 3);
assert.equal(dh.g - dh.K, exponent);
assert.equal(dh.a / dh.K, exponent);
const inverseExponent = modInverse(exponent, 28);
assert.equal(inverseExponent, 19);

const H = (x, y) => [((x - y) % 29 + 29) % 29, ((x + y) % 29 + 29) % 29];
assert.deepEqual(H(19, 13), [6, 3]);
assert.equal(H(19, 13)[1], exponent);

const cube = interior.map((value) => powMod(value, exponent, 29));
const inverseCube = interior.map((value) => powMod(value, inverseExponent, 29));
assert.deepEqual(interior.map((value) => powMod(powMod(value, exponent, 29), inverseExponent, 29)), interior);
assert.deepEqual(interior.map((value) => powMod(powMod(value, inverseExponent, 29), exponent, 29)), interior);
for (let value = 0; value < 29; value += 1) {
  assert.equal(powMod(powMod(value, exponent, 29), inverseExponent, 29), value);
}
const p57WordArrays = p57Words.map((word) => word.inds);
const cubeMatchesP57 = p57WordArrays.some((word) => JSON.stringify(word) === JSON.stringify(cube));
const inverseMatchesP57 = p57WordArrays.some((word) => JSON.stringify(word) === JSON.stringify(inverseCube));
assert.equal(cubeMatchesP57, false);
assert.equal(inverseMatchesP57, false);

console.log(JSON.stringify({
  selection: {
    physicalPage: selected[0].page,
    runeOffset: selected[0].start,
    twelveRuneWord: transliterate(selected[0].inds),
    allUnknownTwelveRuneWords: unknown12.length,
    uniqueSelectorCount: selected.length,
    wholePrimeSum: primeSum(selected[0].inds),
    wholePhi: phi(primeSum(selected[0].inds)),
    twiceShedInterior: transliterate(interior),
    interiorValues: interior,
    interiorPrimeSum: primeSum(interior),
    p57WholePrimeControls: {
      INSTAR: primeSum(p57Instar.inds),
      DIUINITY: primeSum(p57Divinity.inds),
    },
  },
  dhOperation: {
    state: dh, exponent, inverseExponent, red19Plus13H: H(19, 13),
  },
  result: {
    cubeValues: cube,
    cubeTransliteration: transliterate(cube),
    inverseValues: inverseCube,
    inverseTransliteration: transliterate(inverseCube),
    cubeMatchesAnyP57Word: cubeMatchesP57,
    inverseMatchesAnyP57Word: inverseMatchesP57,
  },
}, null, 2));
