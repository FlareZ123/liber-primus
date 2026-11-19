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
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
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

/** @param {number[]} values @returns {number} */
function gp0(values) {
  return values.reduce((sum, value) => sum + value, 0);
}

const p0Words = pageWords(physicalPart(0));
const table = grid.pages.flatMap((page) => page.bytes);
const READ = [4, 28, 23];
const OUT = [3, 1, 16];

assert.equal(gp0(READ), 55);
assert.equal(gp0(OUT), 20);
assert.equal(table[55], 80);
assert.equal(table[20], 102);

const receiver = p0Words.filter((word) =>
  word.start >= 80 && word.start + word.values.length - 1 <= 102
);
assert.equal(receiver.length, 4);
assert.deepEqual(receiver.map((word) => word.start), [80, 83, 90, 95]);

const packet = receiver.flatMap((word) => shell(word.values));
assert.equal(packet.length, 23);
assert.deepEqual(packet, [
  19, 23, 25,
  4, 16, 12, 9, 6, 10, 14, 15, 8, 24, 5, 21, 5, 28, 26, 22, 9, 0, 18, 2,
]);

const dh = {p: 23, g: 5, a: 6, A: 8, B: 19, b: 15, K: 2};

// The already ordered DH coordinate (A,K) indexes the p-length packet.
const key = [packet[dh.A - 1], packet[dh.K - 1]];
assert.deepEqual(key, [dh.a, dh.p]);
assert.deepEqual(key, [6, 23]);

const following = p0Words.find((word) => word.start === 103);
assert.ok(following);
assert.deepEqual(following.values, [8, 12]);

const plaintext = following.values.map((value, index) =>
  (value - key[index] + 29) % 29
);
assert.deepEqual(plaintext, [2, 18]);
assert.equal(spell(plaintext), "THE");

const reencryption = plaintext.map((value, index) => (value + key[index]) % 29);
assert.deepEqual(reencryption, following.values);

// Expose origin/order dependence.
assert.deepEqual([packet[dh.A], packet[dh.K]], [10, 25]);
assert.deepEqual([packet[dh.K - 1], packet[dh.A - 1]], [23, 6]);

let windows = 0;
let followedByTwo = 0;
const keyHits = [];
const theHits = [];

for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  const words = pageWords(physicalPart(page));

  for (let index = 0; index <= words.length - 4; index += 1) {
    windows += 1;
    const candidate = words.slice(index, index + 4).flatMap((word) => shell(word.values));
    if (candidate.length < dh.A) continue;

    const candidateKey = [candidate[dh.A - 1], candidate[dh.K - 1]];
    if (candidateKey[0] === dh.a && candidateKey[1] === dh.p) {
      keyHits.push({
        page,
        word: index + 1,
        start: words[index].start,
        packetLength: candidate.length,
        nextLength: words[index + 4]?.values.length || null,
      });
    }

    if (index + 4 >= words.length || words[index + 4].values.length !== 2) continue;
    followedByTwo += 1;
    const next = words[index + 4].values;
    const candidatePlain = next.map((value, i) =>
      (value - candidateKey[i] + 29) % 29
    );
    if (candidatePlain[0] === 2 && candidatePlain[1] === 18) {
      theHits.push({
        page,
        word: index + 1,
        start: words[index].start,
        nextStart: words[index + 4].start,
        key: candidateKey,
        cipher: next,
        packetLength: candidate.length,
      });
    }
  }
}

assert.equal(windows, 2763);
assert.equal(followedByTwo, 422);
assert.deepEqual(keyHits, [
  {page: 0, word: 18, start: 80, packetLength: 23, nextLength: 2},
  {page: 0, word: 30, start: 127, packetLength: 18, nextLength: 6},
  {page: 40, word: 12, start: 49, packetLength: 19, nextLength: 3},
]);
assert.deepEqual(theHits, [
  {page: 0, word: 18, start: 80, nextStart: 103, key: [6, 23], cipher: [8, 12], packetLength: 23},
  {page: 2, word: 10, start: 36, nextStart: 64, key: [27, 27], cipher: [0, 16], packetLength: 28},
  {page: 20, word: 17, start: 58, nextStart: 79, key: [9, 21], cipher: [11, 10], packetLength: 21},
]);

// Prospective recursion gate: use the extracted (a,p) as the next one-based
// packet positions. This predicts [12,2], while the independent ROAD crib
// requires [12,5,...]. Freeze the failure rather than tuning the pointer.
const recursiveNext = [packet[dh.a - 1], packet[dh.p - 1]];
assert.deepEqual(recursiveNext, [12, 2]);

const road = p0Words.find((word) => word.start === 105);
assert.ok(road);
const ROAD = [4, 3, 24, 23];
const roadKey = road.values.map((value, index) => (value - ROAD[index] + 29) % 29);
assert.deepEqual(roadKey, [12, 5, 1, 4]);
assert.equal(recursiveNext[0], roadKey[0]);
assert.notEqual(recursiveNext[1], roadKey[1]);

console.log(JSON.stringify({
  status: "PASS",
  receiver: {span: [80, 102], packet},
  selector: {orderedDhCoordinate: ["A", "K"], positions1: [8, 2], key},
  decryption: {
    cipher: following.values,
    plaintext,
    plaintextText: spell(plaintext),
    reencryption,
  },
  controls: {windows, followedByTwo, keyHits, theHits},
  prospectiveRoadGate: {recursiveNext, requiredRoadKey: roadKey, result: "fails at second ROAD rune"},
}, null, 2));
