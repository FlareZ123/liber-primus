"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number} value @param {number} modulus @returns {number} */
function inverse(value, modulus) {
  for (let x = 1; x < modulus; x += 1) {
    if ((value * x) % modulus === 1) return x;
  }
  throw new Error("no inverse");
}

/** @param {number} base @param {number} exponent @param {number} modulus @returns {number} */
function modPow(base, exponent, modulus) {
  let out = 1;
  let x = base % modulus;
  let e = exponent;
  while (e > 0) {
    if (e & 1) out = (out * x) % modulus;
    x = (x * x) % modulus;
    e >>= 1;
  }
  return out;
}

/** @param {number} left @param {number} right @returns {number[]} */
function H(left, right) {
  return [mod29(left - right), mod29(left + right)];
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const source = read("resources/liber-primus/lp2-transcription.txt");
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const tokens = grid.pages.flatMap((page) => page.tokens);
const alphabet60 = grid.alphabet;

/** @param {string} token @returns {number} */
function low60(token) {
  const value = alphabet60.indexOf(token[1]);
  assert.ok(value >= 0);
  return value;
}

/** @param {string} token @returns {number} */
function base60(token) {
  const hi = alphabet60.indexOf(token[0]);
  const lo = alphabet60.indexOf(token[1]);
  assert.ok(hi >= 0 && lo >= 0);
  return hi * 60 + lo;
}

const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);

/** @param {string} word @returns {number[]} */
function gpEnglish(word) {
  const normalized = word.toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");

  const values = [];
  for (let offset = 0; offset < normalized.length;) {
    if (normalized.startsWith("ING", offset)) {
      values.push(21);
      offset += 3;
      continue;
    }
    if (normalized.startsWith("IO", offset)) {
      values.push(27);
      offset += 2;
      continue;
    }
    const token = gpTokens.find((candidate) => normalized.startsWith(candidate.symbol, offset));
    assert.ok(token, "unmapped GP spelling: " + word);
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}

const signedBody = signed
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .replace(/^-----BEGIN PGP SIGNED MESSAGE-----[\s\S]*?Hash: SHA1\s*/, "")
  .replace(/\b3301\b/g, "")
  .replace(/\b[0-9A-F]{8,}\b/g, "");

const signedWords = (signedBody.match(/[A-Za-z]+/g) || []).map((word, index) => {
  const values = gpEnglish(word);
  return {
    index,
    word: word.toUpperCase(),
    values,
    gp0: values.reduce((sum, value) => sum + value, 0),
  };
});
assert.equal(signedWords.length, 43);

/**
 * Parse the unknown LP2 stream continuously, retaining complete words wholly
 * contained on one physical page.
 * @returns {Map<number, Array<object>>}
 */
function parsePages() {
  const parts = source.split("%").slice(0, 55);
  const pages = parts.map((_, segment) => ({
    page: segment >= 50 ? segment + 1 : segment,
    words: [],
  }));
  const offsets = new Array(parts.length).fill(0);

  let values = [];
  let startSegment = 0;
  let endSegment = 0;
  let start = 0;

  function flush() {
    if (!values.length) return;
    if (startSegment === endSegment) {
      const page = pages[startSegment];
      page.words.push({
        page: page.page,
        ordinal: page.words.length,
        start,
        end: start + values.length - 1,
        values: values.slice(),
        gp0: values.reduce((sum, value) => sum + value, 0),
      });
    }
    values = [];
  }

  for (let segment = 0; segment < parts.length; segment += 1) {
    for (const char of parts[segment]) {
      const value = runeIndex.get(char);
      if (value !== undefined) {
        if (!values.length) {
          startSegment = segment;
          start = offsets[segment];
        }
        endSegment = segment;
        values.push(value);
        offsets[segment] += 1;
      } else if (char === "/" || /\s/u.test(char)) {
        continue;
      } else {
        flush();
      }
    }
  }
  flush();

  return new Map(pages.map((page) => [page.page, page.words]));
}

const pages = parsePages();
const allWords = [...pages.values()].flat();

// The READ OUT/base60-low operator selected this p38 word before interpreting it.
const reciprocal = [];
for (const word of allWords) {
  if (word.start >= 256 || word.gp0 >= 256) continue;
  if (low60(tokens[word.gp0]) !== word.start) continue;
  if (low60(tokens[word.start]) !== word.gp0) continue;
  reciprocal.push(word);
}
assert.equal(reciprocal.length, 1);
const packetWord = reciprocal[0];
assert.equal(packetWord.page, 38);
assert.equal(packetWord.start, 54);
assert.equal(packetWord.end, 56);
assert.deepEqual(packetWord.values, [5, 12, 19]);
assert.equal(packetWord.gp0, 36);

// Fixed DH state. The packet is typed directly as [g, K*a, B].
const state = Object.freeze({ p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2 });
const packet = Object.freeze({
  g: packetWord.values[0],
  Ka: packetWord.values[1],
  B: packetWord.values[2],
});
assert.deepEqual(packet, { g: state.g, Ka: state.K * state.a, B: state.B });

// The two outer packet fields independently select one authenticated source word:
// p50[g] low digit supplies its GP0, p50[B] low digit supplies its zero-based index.
const selectedGp0 = low60(tokens[packet.g]);
const selectedIndex = low60(tokens[packet.B]);
assert.equal(selectedGp0, 57);
assert.equal(selectedIndex, 33);
const selectedWord = signedWords[selectedIndex];
assert.equal(selectedWord.word, "WILL");
assert.equal(selectedWord.gp0, selectedGp0);

// Charge all residue pairs. WILL at (g,B) is the sole target at that exact pair.
const pairMatches = [];
const distinctSigned = [...new Map(signedWords.map((word) => [word.word, word])).values()];
for (let left = 0; left < 29; left += 1) {
  for (let right = 0; right < 29; right += 1) {
    const gp0 = low60(tokens[left]);
    const index = low60(tokens[right]);
    if (index >= signedWords.length) continue;
    const word = signedWords[index];
    if (word.gp0 !== gp0) continue;
    pairMatches.push({ left, right, word: word.word, gp0, index });
  }
}
assert.ok(pairMatches.some((match) =>
  match.left === state.g && match.right === state.B && match.word === "WILL"));

// The authenticated predecessor YOU now selects the p0 receiver.
const predecessor = signedWords[selectedIndex - 1];
assert.equal(predecessor.word, "YOU");
assert.equal(predecessor.gp0, 30);
assert.equal(tokens[predecessor.gp0], "2L");
assert.equal(base60(tokens[predecessor.gp0]), 141);
assert.equal((selectedWord.word.match(/L/g) || []).length, 2);

const p0 = pages.get(0);
assert.ok(p0);
const receiver = p0.find((word) => word.start === 141);
assert.ok(receiver);
assert.equal(receiver.end, 144);
assert.equal(receiver.values.length, selectedWord.values.length);
assert.deepEqual(receiver.values, [19, 16, 9, 18]);

// Reconstruct the exact WILL key from the packet and fixed DH state before inversion.
const aFromPacket = mod29(packet.Ka * inverse(state.K, 29));
assert.equal(aFromPacket, state.a);
const AFromPacket = modPow(packet.g, aFromPacket, state.p);
assert.equal(AFromPacket, state.A);
const key = [packet.Ka, aFromPacket, ...H(AFromPacket, packet.B)];
assert.deepEqual(key, [12, 6, 18, 27]);

const plaintext = receiver.values.map((value, index) => mod29(value - key[index]));
assert.deepEqual(plaintext, selectedWord.values);
assert.deepEqual(plaintext, [7, 10, 20, 20]);
const replay = plaintext.map((value, index) => mod29(value + key[index]));
assert.deepEqual(replay, receiver.values);

// Existing prospective continuation, now entered from the p38-selected WILL state.
let walk = selectedWord.gp0;
const walkStates = [walk];
for (let step = 0; step < state.K; step += 1) {
  walk = base60(tokens[walk]);
  walkStates.push(walk);
}
assert.deepEqual(walkStates, [57, 118, 35]);
const be = signedWords[selectedIndex + 1];
const found = signedWords[selectedIndex + 2];
assert.equal(be.word, "BE");
assert.equal(be.gp0, 35);
assert.equal(found.word, "FOUND");
const foundReceiver = p0.find((word) => word.start <= 118 && word.end >= 118);
assert.ok(foundReceiver);
assert.equal(foundReceiver.start, 117);
assert.equal(foundReceiver.end, 121);
assert.equal(foundReceiver.values.length, found.values.length);

// Reuse the already frozen p0 FOUND key grammar unchanged. The p38 packet
// supplies g and K*a; the WILL derivation above has already reconstructed a,A.
const foundKey = [
  packet.Ka,
  mod29(packet.g - aFromPacket),
  mod29(state.K * packet.g),
  mod29(aFromPacket - packet.g),
  AFromPacket,
];
assert.deepEqual(foundKey, [12, 28, 10, 1, 8]);
const foundPlaintext = foundReceiver.values.map((value, index) => mod29(value - foundKey[index]));
assert.deepEqual(foundPlaintext, found.values);
assert.deepEqual(foundPlaintext, [0, 3, 1, 9, 23]);
const foundReplay = foundPlaintext.map((value, index) => mod29(value + foundKey[index]));
assert.deepEqual(foundReplay, foundReceiver.values);

console.log(JSON.stringify({
  status: "PASS: p38 state packet causally selects and decrypts p0 WILL",
  reciprocalPacket: {
    eligibleWords: allWords.filter((word) => word.start < 256 && word.gp0 < 256).length,
    reciprocalCount: reciprocal.length,
    page: packetWord.page,
    start: packetWord.start,
    end: packetWord.end,
    values: packetWord.values,
    typed: "[g,K*a,B]",
  },
  targetSelection: {
    p50g: tokens[packet.g],
    gp0FromG: selectedGp0,
    p50B: tokens[packet.B],
    signedIndexFromB: selectedIndex,
    selectedWord: selectedWord.word,
    allResiduePairMatches: pairMatches,
  },
  receiverSelection: {
    predecessor: predecessor.word,
    predecessorGp0: predecessor.gp0,
    token: tokens[predecessor.gp0],
    base60Offset: 141,
    receiver: {
      page: receiver.page,
      start: receiver.start,
      end: receiver.end,
      cipher: receiver.values,
    },
  },
  keyDerivation: {
    packet,
    aFromPacket,
    AFromPacket,
    H_A_B: H(AFromPacket, packet.B),
    key,
  },
  inverse: {
    plaintext,
    word: selectedWord.word,
    forwardReplay: replay,
  },
  continuation: {
    KHopWalk: walkStates,
    nextAuthenticatedWord: be.word,
    nextGp0: be.gp0,
    followingAuthenticatedWord: found.word,
    selectedP0Receiver: {
      start: foundReceiver.start,
      end: foundReceiver.end,
      cipher: foundReceiver.values,
      length: foundReceiver.values.length,
    },
    foundKey,
    foundPlaintext,
    foundForwardReplay: foundReplay,
  },
}, null, 2));
