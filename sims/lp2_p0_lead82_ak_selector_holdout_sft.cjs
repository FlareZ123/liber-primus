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
  classification: "LEAD=82 is a downstream semantic holdout on the previously committed (8,2) packet selector; page-wide inverse remains unknown",
}, null, 2));
