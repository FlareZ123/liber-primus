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
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const prime = corpus.prime;
const translit = corpus.translit;

function rawPageIndex(physicalPage) {
  return physicalPage <= 49 ? physicalPage : physicalPage - 1;
}

function pageWords(physicalPage) {
  const page = rawPages[rawPageIndex(physicalPage)];
  let offset = 0;
  let current = [];
  let start = -1;
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
      // Slash and whitespace are printed line-wrap notation, not word breaks.
    } else {
      flush();
    }
  }
  flush();
  return words;
}

function pageLine(physicalPage, oneBasedLine) {
  return rawPages[rawPageIndex(physicalPage)].split("/")[oneBasedLine - 1];
}

function mod(value) {
  return ((value % 29) + 29) % 29;
}

function H(x, y) {
  return [mod(x - y), mod(x + y)];
}

function H4(values) {
  assert.equal(values.length, 4);
  return [
    mod(values[0] - values[3]),
    mod(values[1] - values[2]),
    mod(values[1] + values[2]),
    mod(values[0] + values[3]),
  ];
}

function modInverse(value, modulus) {
  for (let candidate = 1; candidate < modulus; candidate += 1) {
    if ((value * candidate) % modulus === 1) return candidate;
  }
  throw new Error("No modular inverse");
}

function primeSum(indices) {
  return indices.reduce((sum, index) => sum + prime[index], 0);
}

function transliterate(indices) {
  return indices.map((index) => translit[index]).join("");
}

// The 2016 signed words-map message is read in full, including its opening Hello.
const signedMessage = read("resources/cicada2016-4gq25.md");
const messageMatch = signedMessage.match(/Hello\.[\s\S]*?7A35090F/i);
assert.ok(messageMatch, "2016 signed message body must be present");
const messageWords = [...messageMatch[0].matchAll(/[A-Za-z0-9]+/g)]
  .map((match) => match[0].toLowerCase());
assert.equal(messageWords[19], "their");
assert.equal(messageWords[26], "numbers");
assert.equal(messageWords[28], "the");
assert.equal(messageWords[29], "direction");

// Candidate coordinate hypothesis only: 2016 words20/27 are "their numbers".
// The message does not fix page/word orientation or printed/physical/LP2 page numbering.
const p27Words = pageWords(27);
const p27Word20 = p27Words[19];
assert.equal(p27Word20.start, 79);
assert.equal(p27Word20.inds.length, 12);
assert.equal(transliterate(p27Word20.inds), "EORNSOOCAEYEE");
const core = p27Word20.inds.slice(2, -2);
assert.equal(core.length, 8);
assert.equal(transliterate(core), "NSOOCAEY");

// p57's clear DIVINITY target is represented as DIUINITY in GP29.
const p57Words = pageWords(57);
const target = p57Words.find((word) => transliterate(word.inds) === "DIUINITY");
assert.ok(target, "p57 DIUINITY control must exist");
assert.equal(target.inds.length, 8);
assert.equal(primeSum(target.inds), 376);

// p28 page28/word28 is the existing p57 FIND->28 selector.
const p28Word28 = pageWords(28)[27];
assert.equal(p28Word28.start, 135);
assert.equal(p28Word28.inds.length, 5);
assert.equal(transliterate(p28Word28.inds), "EAAIUL");

// p28 line6 is the visible DH line; its first two runes H-transform to [b,K].
const p28Line6 = [...pageLine(28, 6)]
  .map((character) => runeIndex.get(character))
  .filter((value) => value !== undefined);
assert.equal(p28Line6.length, 23);
assert.deepEqual(p28Line6.slice(0, 2), [23, 8]);
const dhStart = H(p28Line6[0], p28Line6[1]);
assert.deepEqual(dhStart, [15, 2]); // [b,K]

// The selected p28 word's two shells give [A,B] and [p,p+K].
const p28Outer = H(p28Word28.inds[0], p28Word28.inds[4]);
const p28Inner = H(p28Word28.inds[1], p28Word28.inds[3]);
assert.deepEqual(p28Outer, [8, 19]); // [A,B]
assert.deepEqual(p28Inner, [23, 25]); // [p,p+K]
assert.equal(p28Word28.inds[2], 10);

// 2016 word30 DIRECTION selects p29 page29/word30; H4 gives [p-1,b,A,F].
const p29Word30 = pageWords(29)[29];
assert.equal(p29Word30.start, 108);
assert.equal(p29Word30.inds.length, 4);
assert.equal(transliterate(p29Word30.inds), "JYJE");
const p29Packet = H4(p29Word30.inds);
assert.deepEqual(p29Packet, [22, 15, 8, 0]);

// Candidate, not source-authenticated, additive GP29 pad serialization.
// Values are source-derived; this exact concatenation/order remains the weak premise.
const p = p28Line6.length;
const g = p28Word28.inds.length;
const b = dhStart[0];
const K = dhStart[1];
const pMinus1 = p29Packet[0];
const pPlusK = p28Inner[1];
const gInverse = modInverse(g, p);
const F = p29Packet[3];
const candidatePad = [b, g, K, pMinus1, pPlusK, gInverse, K, F];
assert.deepEqual(candidatePad, [15, 5, 2, 22, 25, 14, 2, 0]);

const decryptedCore = core.map((value, index) => mod(value - candidatePad[index]));
assert.deepEqual(decryptedCore, target.inds);
assert.equal(transliterate(decryptedCore), "DIUINITY");

// Source-linked arithmetic checksums. They corroborate the candidate but do not
// independently authenticate the key serialization.
const coreGp0Sum = core.reduce((sum, value) => sum + value, 0);
const corePrimeSum = primeSum(core);
const targetPrimeSum = primeSum(decryptedCore);
const keyPrimeSum = primeSum(candidatePad);
const redHeadingLength = 19;
const redMarkerDots = 13;
const redH = H(redHeadingLength, redMarkerDots);
const exponent = redH[1];
assert.deepEqual(redH, [6, 3]);
assert.equal(exponent, 3);
assert.equal(coreGp0Sum, 103);
assert.equal(corePrimeSum, 376);
assert.equal(targetPrimeSum, 376);
assert.equal(keyPrimeSum, 309);
assert.equal(keyPrimeSum, exponent * coreGp0Sum);
assert.equal(targetPrimeSum - keyPrimeSum, prime[18]); // 67 = 19th prime.

const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
assert.equal(grid.bytes[coreGp0Sum], 2 * coreGp0Sum); // p50 cell103 = 206 = K*103.

// The same pad repeated as a period-8 key does not decode either full page.
const p27Full = corpus.pages.find((page) => page.page === 27).indices;
const p29Full = corpus.pages.find((page) => page.page === 29).indices;
const repeatDecrypt = (values) => values.map((value, index) =>
  mod(value - candidatePad[index % candidatePad.length])
);
const p27RepeatedPreview = transliterate(repeatDecrypt(p27Full).slice(0, 72));
const p29RepeatedPreview = transliterate(repeatDecrypt(p29Full).slice(0, 72));

console.log(JSON.stringify({
  classification: "provisional local 8-rune pad candidate; no unknown LP2 plaintext or page decoder",
  selectors: {
    signed2016Word20: messageWords[19],
    signed2016Word27: messageWords[26],
    signed2016Word29: messageWords[28],
    signed2016Word30: messageWords[29],
    proposedP27Coordinate: "page27/word20",
    p28Selector: "p57 FIND->28, page28/word28",
    p29Selector: "2016 DIRECTION, page29/word30",
  },
  p27: {
    word20Start: p27Word20.start,
    word20: transliterate(p27Word20.inds),
    core: transliterate(core),
    coreIndices: core,
  },
  p28: {
    line6Length: p28Line6.length,
    H_DH: dhStart,
    word28: transliterate(p28Word28.inds),
    H_outer: p28Outer,
    H_inner: p28Inner,
    center: p28Word28.inds[2],
    p: p,
    g: g,
    gInverse: gInverse,
  },
  p29: {
    word30Start: p29Word30.start,
    word30: transliterate(p29Word30.inds),
    H4: p29Packet,
  },
  candidatePad: {
    serialization: "[b,g,K,p-1,p+K,g^-1 mod p,K,F]",
    values: candidatePad,
    decryptedCore: transliterate(decryptedCore),
    status: "order is not source-fixed; this is a candidate only",
  },
  checksums: {
    coreGp0Sum: coreGp0Sum,
    corePrimeSum: corePrimeSum,
    targetPrimeSum: targetPrimeSum,
    keyPrimeSum: keyPrimeSum,
    redH19_13: redH,
    keyPrimeSumEquals3TimesCoreGp0Sum: keyPrimeSum === exponent * coreGp0Sum,
    targetMinusKeyPrimeSumEquals19thPrime:
      targetPrimeSum - keyPrimeSum === prime[18],
    p50Cell103: grid.bytes[coreGp0Sum],
  },
  repeatedPeriod8Controls: {
    p27Prefix: p27RepeatedPreview,
    p29Prefix: p29RepeatedPreview,
    interpretation: "non-prose previews; the pad is not a full-page periodic key",
  },
}, null, 2));
