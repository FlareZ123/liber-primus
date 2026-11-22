"use strict";

/**
 * SFT: ROAD -> LEAD -> shed circumference EA -> prime-self-indexed H-packet
 * -> (A,K) -> (a,p) -> THE.
 *
 * Upstream ROAD/LEAD and LEAD coordinate MUST->SHED are reproduced in
 * separate SFTs. This file tests the new consequence that literal SHED on
 * LEAD selects EA, and that EA source-selects the previously retrospective
 * (A,K) packet selector without using THE plaintext.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const runeSet = new Set(corpus.runes);
const parts = transcription.split(/^\s*%\s*$/m);
const gpTokens = corpus.translit
  .map((symbol, value) => ({symbol, value}))
  .sort((a, b) => b.symbol.length - a.symbol.length);

/** @param {number} page @returns {string} */
function physicalPart(page) {
  assert.notEqual(page, 50);
  return parts[page <= 49 ? page : page - 1];
}

/** @param {string} word @returns {number[]} */
function gp(word) {
  const normalized = word.toUpperCase()
    .replace(/K/g, "C")
    .replace(/V/g, "U")
    .replace(/Q/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");
  const out = [];

  for (let i = 0; i < normalized.length;) {
    const token = gpTokens.find((item) =>
      normalized.startsWith(item.symbol, i)
    );
    assert.ok(token, "unmapped GP spelling at " + word + ":" + i);
    out.push(token.value);
    i += token.symbol.length;
  }

  return out;
}

/**
 * @param {string} text
 * @returns {Array<{start:number,end:number,values:number[]}>}
 */
function pageWords(text) {
  const words = [];
  let current = [];
  let start = 0;
  let offset = 0;

  const flush = () => {
    if (!current.length) return;
    words.push({start, end: offset - 1, values: current});
    current = [];
  };

  for (const char of [...text]) {
    if (runeSet.has(char)) {
      if (!current.length) start = offset;
      current.push(runeIndex.get(char));
      offset += 1;
    } else if (char === "-" || char === ".") {
      flush();
    }
  }

  flush();
  return words;
}

/** @param {number} left @param {number} right @returns {[number,number]} */
function H(left, right) {
  return [((left - right) % 29 + 29) % 29, (left + right) % 29];
}

/** @param {number[]} word @returns {number[]} */
function shell(word) {
  const out = [];
  for (
    let left = 0, right = word.length - 1;
    left < right;
    left += 1, right -= 1
  ) {
    out.push(...H(word[left], word[right]));
  }
  if (word.length % 2 === 1) {
    out.push(word[Math.floor(word.length / 2)]);
  }
  return out;
}

/** @param {number[]} values @returns {number} */
function gp0(values) {
  return values.reduce((sum, value) => sum + value, 0);
}

/** @param {number[]} values @returns {string} */
function spell(values) {
  return values.map((value) => {
    if (value === 21) return "ING";
    if (value === 27) return "IO";
    return corpus.translit[value];
  }).join("");
}

const dh = {p: 23, g: 5, a: 6, A: 8, B: 19, b: 15, K: 2};

// Reconstruct the fixed READ OUT receiver.
const table = grid.pages.flatMap((page) => page.bytes);
const READ = gp("READ");
const OUT = gp("OUT");
assert.deepEqual(READ, [4, 28, 23]);
assert.deepEqual(OUT, [3, 1, 16]);
assert.equal(gp0(READ), 55);
assert.equal(gp0(OUT), 20);
assert.equal(table[55], 80);
assert.equal(table[20], 102);

const p0Words = pageWords(physicalPart(0));
const receiver = p0Words.filter((word) =>
  word.start >= 80 && word.end <= 102
);
assert.equal(receiver.length, 4);
const packet = receiver.flatMap((word) => shell(word.values));
assert.deepEqual(packet, [
  19, 23, 25,
  4, 16, 12, 9, 6, 10, 14, 15, 8, 24, 5, 21, 5, 28, 26, 22, 9, 0, 18, 2,
]);
assert.equal(packet.length, dh.p);

// Reconstruct ROAD -> LEAD locally, but do not use THE.
const road = p0Words.find((word) => word.start === 105);
assert.ok(road);
const roadPlain = gp("ROAD");
assert.deepEqual(roadPlain, [4, 3, 24, 23]);
const leadA1 = road.values.map(
  (value, index) => (value - roadPlain[index] + 29) % 29
);
assert.deepEqual(leadA1, [12, 5, 1, 4]);
const leadText = leadA1
  .map((value) => String.fromCharCode(64 + value))
  .join("");
assert.equal(leadText, "LEAD");

// Literal SHED of LEAD's one-letter circumference leaves EA. In the fixed
// 12-key A1 family, LEAD is the only word whose inner bigram is a dedicated
// native GP rune.
const fixedA1Keys = [
  "HIRE", "CASE", "LEAD", "GUMS", "BANE", "COPE",
  "GUNS", "BODY", "FIRS", "CURS", "MENU", "EASE",
];
const nativeInner = fixedA1Keys
  .map((word) => {
    const inner = word.slice(1, -1);
    const match = corpus.translit.findIndex((symbol) => symbol === inner);
    return {word, inner, value: match >= 0 ? match : null};
  })
  .filter((row) => row.value !== null);
assert.deepEqual(nativeInner, [{word: "LEAD", inner: "EA", value: 28}]);

const divinity = nativeInner[0].value;
assert.equal(divinity, 28);
assert.equal(corpus.prime[divinity], 109);

// EA is the unique prime-self-indexed rune in the selected p-length packet.
const packetSelf = packet
  .map((value, index) => ({
    position: index + 1,
    value,
    prime: corpus.prime[value],
    modP: corpus.prime[value] % dh.p,
  }))
  .filter((row) => row.position === row.modP);
assert.deepEqual(packetSelf, [{
  position: 17,
  value: 28,
  prime: 109,
  modP: 17,
}]);

// Its immediate packet circumference emits the independently fixed ordered
// DH coordinate (A,K) through the same H operation.
const eaPosition = packetSelf[0].position;
const neighbors = [packet[eaPosition - 2], packet[eaPosition]];
assert.deepEqual(neighbors, [5, 26]);
const selector = H(neighbors[0], neighbors[1]);
assert.deepEqual(selector, [dh.A, dh.K]);

// The now-derived one-based packet selector emits (a,p).
const key = [
  packet[selector[0] - 1],
  packet[selector[1] - 1],
];
assert.deepEqual(key, [dh.a, dh.p]);
assert.deepEqual(key, [6, 23]);

// Only now inspect the following two-rune ciphertext word.
const following = p0Words.find((word) => word.start === 103);
assert.ok(following);
assert.deepEqual(following.values, [8, 12]);
const plaintext = following.values.map(
  (value, index) => (value - key[index] + 29) % 29
);
assert.deepEqual(plaintext, [2, 18]);
assert.equal(spell(plaintext), "THE");
assert.deepEqual(
  plaintext.map((value, index) => (value + key[index]) % 29),
  following.values
);

// The full prime of the selected inner rune also lands on the next word
// after ROAD, a forward receiver checksum. No decryption is claimed there.
const afterRoad = p0Words.find((word) => word.start === 109);
assert.ok(afterRoad);
assert.equal(corpus.prime[divinity], afterRoad.start);

// Manuscript-wide fixed-family control under the canonical shell decoder.
let windows = 0;
let eaAt17 = 0;
let neighborAk = 0;
let indexedAp = 0;
const fullHits = [];

for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  const words = pageWords(physicalPart(page));

  for (let index = 0; index <= words.length - 4; index += 1) {
    windows += 1;
    const candidate = words
      .slice(index, index + 4)
      .flatMap((word) => shell(word.values));

    if (candidate.length < 18 || candidate[16] !== divinity) continue;
    eaAt17 += 1;

    // 109 mod23=17 is fixed by EA and p, not re-fitted per window.
    assert.equal(corpus.prime[candidate[16]] % dh.p, 17);

    const candidateSelector = H(candidate[15], candidate[17]);
    if (
      candidateSelector[0] !== dh.A ||
      candidateSelector[1] !== dh.K
    ) continue;
    neighborAk += 1;

    const candidateKey = [
      candidate[candidateSelector[0] - 1],
      candidate[candidateSelector[1] - 1],
    ];
    if (
      candidateKey[0] !== dh.a ||
      candidateKey[1] !== dh.p
    ) continue;
    indexedAp += 1;

    const next = words[index + 4] || null;
    const hit = {
      page,
      word: index + 1,
      start: words[index].start,
      packetLength: candidate.length,
      selector: candidateSelector,
      key: candidateKey,
      next: next
        ? {start: next.start, values: next.values}
        : null,
    };

    if (next && next.values.length === 2) {
      const nextPlain = next.values.map(
        (value, i) => (value - candidateKey[i] + 29) % 29
      );
      hit.nextPlain = nextPlain;
      hit.nextText = spell(nextPlain);
    }

    fullHits.push(hit);
  }
}

assert.equal(windows, 2763);
assert.equal(eaAt17, 51);
assert.equal(neighborAk, 2);
assert.equal(indexedAp, 1);
assert.deepEqual(fullHits, [{
  page: 0,
  word: 18,
  start: 80,
  packetLength: 23,
  selector: [8, 2],
  key: [6, 23],
  next: {start: 103, values: [8, 12]},
  nextPlain: [2, 18],
  nextText: "THE",
}]);

console.log(JSON.stringify({
  status: "PASS",
  chain: {
    roadCipher: road.values,
    roadPlain,
    leadA1,
    leadText,
    shedInner: {text: "EA", value: divinity, prime: corpus.prime[divinity]},
    packetSelfIndex: packetSelf,
    neighbors,
    throughH: selector,
    packetIndexedKey: key,
    followingCipher: following.values,
    followingPlaintext: plaintext,
    followingText: spell(plaintext),
    forwardPrimeReceiver: afterRoad.start,
  },
  control: {
    windows,
    eaAt17,
    neighborAk,
    indexedAp,
    fullHits,
  },
  classification:
    "value-changing THE recovery with the previously retrospective (A,K) packet selector now derived from the ROAD/LEAD -> MUST SHED -> EA chain; ROAD/LEAD remains the main upstream semantic hypothesis",
}, null, 2));
