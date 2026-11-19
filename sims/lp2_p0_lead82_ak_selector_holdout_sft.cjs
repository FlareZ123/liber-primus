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
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const runeSet = new Set(corpus.runes);
const parts = transcription.split(/^\s*%\s*$/m);

/** @param {number} page @returns {string} */
function physicalPart(page) {
  assert.notEqual(page, 50);
  return parts[page <= 49 ? page : page - 1];
}

/**
 * @param {string} text
 * @returns {{start:number, values:number[]}[]}
 */
function pageWords(text) {
  const words = [];
  let current = [];
  let start = 0;
  let offset = 0;

  for (const char of [...text]) {
    if (runeSet.has(char)) {
      if (current.length === 0) start = offset;
      current.push(runeIndex.get(char));
      offset += 1;
    } else if ((char === "-" || char === ".") && current.length) {
      words.push({start, values: current});
      current = [];
    }
  }

  if (current.length) words.push({start, values: current});
  return words;
}

/** @param {number} left @param {number} right @returns {[number,number]} */
function H(left, right) {
  return [((left - right) % 29 + 29) % 29, (left + right) % 29];
}

/** @param {number[]} word @returns {number[]} */
function shell(word) {
  const out = [];
  for (let left = 0, right = word.length - 1; left < right; left += 1, right -= 1) {
    out.push(...H(word[left], word[right]));
  }
  if (word.length % 2 === 1) out.push(word[Math.floor(word.length / 2)]);
  return out;
}

/** @param {number[]} values @returns {string} */
function spell(values) {
  return values.map((value) => corpus.translit[value]).join("");
}

/** @param {number[]} values @returns {string|null} */
function a1z26(values) {
  if (!values.every((value) => value >= 1 && value <= 26)) return null;
  return values.map((value) => String.fromCharCode(64 + value)).join("");
}

const dh = {p: 23, g: 5, a: 6, A: 8, B: 19, b: 15, K: 2};
const p0Words = pageWords(physicalPart(0));
const receiver = p0Words.filter((word) =>
  word.start >= 80 && word.start + word.values.length - 1 <= 102
);
assert.equal(receiver.length, 4);

const packet = receiver.flatMap((word) => shell(word.values));
assert.equal(packet.length, dh.p);
assert.deepEqual(packet, [
  19, 23, 25,
  4, 16, 12, 9, 6, 10, 14, 15, 8, 24, 5, 21, 5, 28, 26, 22, 9, 0, 18, 2,
]);

// Standard chemistry fact used as the downstream semantic holdout.
const LEAD_ATOMIC_NUMBER = 82;
const digits = String(LEAD_ATOMIC_NUMBER).split("").map(Number);
assert.deepEqual(digits, [dh.A, dh.K]);
assert.deepEqual(digits, [8, 2]);

const theKey = digits.map((position) => packet[position - 1]);
assert.deepEqual(theKey, [dh.a, dh.p]);
assert.deepEqual(theKey, [6, 23]);

const theCipher = p0Words.find((word) => word.start === 103);
assert.ok(theCipher);
assert.deepEqual(theCipher.values, [8, 12]);
const thePlain = theCipher.values.map((value, index) =>
  (value - theKey[index] + 29) % 29
);
assert.deepEqual(thePlain, [2, 18]);
assert.equal(spell(thePlain), "THE");
assert.deepEqual(
  thePlain.map((value, index) => (value + theKey[index]) % 29),
  theCipher.values
);

const roadCipher = p0Words.find((word) => word.start === 105);
assert.ok(roadCipher);
assert.deepEqual(roadCipher.values, [16, 8, 25, 27]);
const ROAD = [4, 3, 24, 23];
const roadKey = roadCipher.values.map((value, index) =>
  (value - ROAD[index] + 29) % 29
);
assert.deepEqual(roadKey, [12, 5, 1, 4]);
assert.equal(a1z26(roadKey), "LEAD");

const dhFactorization = [
  (dh.a * dh.K) % 29,
  dh.g,
  (dh.K * dh.b) % 29,
  (dh.b * dh.A) % 29,
];
assert.deepEqual(dhFactorization, roadKey);

// Direction/order control.
const reversedDigits = [...digits].reverse();
const reversedKey = reversedDigits.map((position) => packet[position - 1]);
assert.deepEqual(reversedKey, [dh.p, dh.a]);
const reversedPlain = theCipher.values.map((value, index) =>
  (value - reversedKey[index] + 29) % 29
);
assert.notDeepEqual(reversedPlain, thePlain);
assert.notEqual(spell(reversedPlain), "THE");


// Director #1724 source-authentication gate.
const signedSources = [
  "resources/historical/cicada2012-countdown-message.asc",
  "resources/historical/cicada2012-midi-email.asc",
  "resources/historical/cicada2012-song-is-your-own-path.asc",
  "resources/historical/cicada2012-message-only-displayed.asc",
  "resources/historical/cicada2013-first-onion-hello.asc",
  "resources/historical/cicada2013-forest-clue.asc",
  "resources/historical/cicada2013-second-onion-everything-you-need.asc",
  "resources/historical/cicada2013-second-onion-icmp-echo.asc",
  "resources/historical/cicada2013-welcome-and-congratulations.asc",
  "resources/historical/cicada2013-if-you-followed.asc",
  "resources/historical/cicada2013-no-more-testing.asc",
  "resources/external/2013-do-not-share-this-information-2.asc",
  "resources/historical/cicada2014-stage09-first-jpeg-recovered.asc",
  "resources/historical/cicada2014-stage11-message.asc",
  "resources/historical/cicada2016-4gq25-outguess.asc",
  "resources/historical/cicada2017-yEiTHhvF.asc",
];
const semanticSelectorTerms = /\b(?:a1z26|lead|atomic|periodic|chemical|chemistry|element)\b/i;
const sourceSemanticHits = signedSources.flatMap((relative) => {
  const match = read(relative).match(semanticSelectorTerms);
  return match ? [{relative, term: match[0]}] : [];
});
assert.deepEqual(sourceSemanticHits, []);
assert.match(
  read("resources/historical/cicada2012-message-only-displayed.asc"),
  /The encrypted message is a number\./
);
assert.match(
  read("resources/historical/cicada2016-4gq25-outguess.asc"),
  /their numbers are the direction\./
);

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
/** @param {number[]} values @param {number} origin @param {boolean} reversed @returns {string|null} */
function latinOrdinal(values, origin, reversed) {
  const indices = values.map((value) => value - origin);
  if (!indices.every((value) => value >= 0 && value < 26)) return null;
  return indices.map((value) => alphabet[reversed ? 25 - value : value]).join("");
}
/** @param {number[]} values @param {number} origin @returns {string|null} */
function gpOrdinal(values, origin) {
  const indices = values.map((value) => value - origin);
  if (!indices.every((value) => value >= 0 && value < corpus.translit.length)) return null;
  return indices.map((value) => corpus.translit[value]).join("");
}
const ordinalFamily = {
  A1Z26: latinOrdinal(roadKey, 1, false),
  A0Z25: latinOrdinal(roadKey, 0, false),
  Z1A26: latinOrdinal(roadKey, 1, true),
  Z0A25: latinOrdinal(roadKey, 0, true),
  GP0: gpOrdinal(roadKey, 0),
  GP1: gpOrdinal(roadKey, 1),
};
assert.deepEqual(ordinalFamily, {
  A1Z26: "LEAD",
  A0Z25: "MFBE",
  Z1A26: "OVZW",
  Z0A25: "NUYV",
  GP0: "EOCUR",
  GP1: "JRFO",
});
const fourLetterElements = new Set(["NEON", "IRON", "ZINC", "GOLD", "LEAD"]);
const elementHits = Object.entries(ordinalFamily)
  .filter(([, word]) => fourLetterElements.has(word));
assert.deepEqual(elementHits, [["A1Z26", "LEAD"]]);

console.log(JSON.stringify({
  status: "PASS",
  downstreamHoldout: {
    roadKey,
    a1z26: a1z26(roadKey),
    leadAtomicNumber: LEAD_ATOMIC_NUMBER,
    selectorDigits: digits,
    dhSelector: ["A", "K"],
  },
  packet: {
    length: packet.length,
    selectedValues: theKey,
    selectedState: ["a", "p"],
  },
  decryption: {
    cipher: theCipher.values,
    plaintext: thePlain,
    text: spell(thePlain),
  },
  roadDhFactorization: dhFactorization,
  reversedDigitControl: {
    selectorDigits: reversedDigits,
    key: reversedKey,
    plaintext: reversedPlain,
    text: spell(reversedPlain),
  },
  classification: "Director #1724 negative semantic gate: LEAD=82 is a reproducible arithmetic echo without an authenticated Cicada chemistry or atomic-number selector; it cannot authenticate THE/ROAD or (8,2)",\n  ordinalFamily,\n  sourceSemanticHits,
}, null, 2));
