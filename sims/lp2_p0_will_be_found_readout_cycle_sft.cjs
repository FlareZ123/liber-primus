"use strict";

/**
 * SFT: source-constrained WILL -> BE -> FOUND receiver -> READ OUT/DH return.
 *
 * Frozen upstream:
 * - authenticated 2016 signed-message word order;
 * - canonical GP29 word-number convention;
 * - original p50 tokens and conventional base60/base59 readings;
 * - source-derived p28 DH state, especially K=2 and p=23;
 * - the already fixed wordwise H shell operation;
 * - independently selected READ OUT p0 packet starts 80 and 166.
 *
 * This test does not claim that FOUND is plaintext at p0 117..121 and does
 * not revive a general p50-numeral-to-LP2-offset architecture.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const pathLib = require("node:path");

const root = pathLib.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(pathLib.join(root, relative), "utf8");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);
const tableTokens = grid.pages.flatMap((page) => page.tokens);
const alphabet60 = grid.alphabet;
const alphabet59 = alphabet60.replace("f", "");

function mod29(value) {
  return ((value % 29) + 29) % 29;
}

function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

function gp(word) {
  const normalized = word
    .toUpperCase()
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

    const token = gpTokens.find((candidate) =>
      normalized.startsWith(candidate.symbol, offset)
    );
    assert.ok(token, "unmapped GP spelling at " + normalized.slice(offset));
    values.push(token.value);
    offset += token.symbol.length;
  }

  return values;
}

function gp0(word) {
  return sum(gp(word));
}

function signedWords() {
  const clear = signed2016
    .split("-----BEGIN PGP SIGNATURE-----")[0]
    .split(/\r?\n\r?\n/)
    .slice(1)
    .join("\n");

  return clear.match(/[A-Za-z]+/g) || [];
}

function parsePage(text) {
  const words = [];
  let current = [];
  let start = 0;
  let runeOffset = 0;

  function flush() {
    if (!current.length) return;
    words.push({
      index: words.length,
      start,
      end: runeOffset - 1,
      length: current.length,
      values: current.slice(),
      gp0: sum(current),
    });
    current = [];
  }

  for (const char of [...text]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      if (!current.length) start = runeOffset;
      current.push(value);
      runeOffset += 1;
    } else if ((char === "-" || char === ".") && current.length) {
      flush();
    }
  }
  flush();
  return words;
}

function decodeToken(token, alphabet) {
  const high = alphabet.indexOf(token[0]);
  const low = alphabet.indexOf(token[1]);
  if (high < 0 || low < 0) return null;
  return high * alphabet.length + low;
}

function H(left, right) {
  return [mod29(left - right), mod29(left + right)];
}

function shellWord(values) {
  const out = [];
  for (
    let left = 0, right = values.length - 1;
    left < right;
    left += 1, right -= 1
  ) {
    out.push(...H(values[left], values[right]));
  }
  if (values.length % 2 === 1) out.push(values[(values.length - 1) / 2]);
  return out;
}

const p0 = parsePage(transcription.split(/^\s*%\s*$/m)[0]);
const message = signedWords();
assert.equal(p0.length, 59);
assert.equal(message.length, 43);

// Source-derived p28 DH state. Only K and p are consumed below, but retain the
// full tuple so the SFT states exactly which upstream object is frozen.
const dh = { p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2 };

// Charge the hop count against every DH field before specializing to K.
// Across all seven field values, both radices, and all signed adjacencies,
// only K=2 under base60 connects one authenticated word to its successor.
const stateHopHits = [];
for (const [field, steps] of Object.entries(dh)) {
  for (const [radix, alphabet] of [
    ["base60", alphabet60],
    ["base59", alphabet59],
  ]) {
    for (let index = 0; index < message.length - 1; index += 1) {
      let value = gp0(message[index]);
      let valid = true;
      for (let step = 0; step < steps; step += 1) {
        if (value < 0 || value >= tableTokens.length) {
          valid = false;
          break;
        }
        value = decodeToken(tableTokens[value], alphabet);
        if (value === null) {
          valid = false;
          break;
        }
      }
      if (valid && value === gp0(message[index + 1])) {
        stateHopHits.push({
          field,
          steps,
          radix,
          index,
          from: message[index].toLowerCase(),
          to: message[index + 1].toLowerCase(),
        });
      }
    }
  }
}

assert.deepEqual(stateHopHits, [{
  field: "K",
  steps: 2,
  radix: "base60",
  index: 33,
  from: "will",
  to: "be",
}]);

// Charge every authenticated adjacent triple under both source-supported
// p50 radices. K=2 fixes the walk depth before reading any p0 ciphertext.
// The first intermediate table value is treated only as a rune direction:
// it may land anywhere inside a printed p0 word. The containing word must
// have the same GP rune length as the third authenticated word.
const tripleHits = [];
for (const [radix, alphabet] of [
  ["base60", alphabet60],
  ["base59", alphabet59],
]) {
  for (let index = 0; index < message.length - 2; index += 1) {
    const start = gp0(message[index]);
    if (start < 0 || start >= tableTokens.length) continue;

    const intermediate = decodeToken(tableTokens[start], alphabet);
    if (
      intermediate === null ||
      intermediate < 0 ||
      intermediate >= tableTokens.length
    ) {
      continue;
    }

    const end = decodeToken(tableTokens[intermediate], alphabet);
    if (end !== gp0(message[index + 1])) continue;

    const receiver = p0.find((word) =>
      word.start <= intermediate && intermediate <= word.end
    );
    if (!receiver || receiver.length !== gp(message[index + 2]).length) continue;

    tripleHits.push({
      radix,
      index,
      words: message.slice(index, index + 3).map((word) => word.toLowerCase()),
      path: [start, intermediate, end],
      receiver,
    });
  }
}

assert.deepEqual(tripleHits, [{
  radix: "base60",
  index: 33,
  words: ["will", "be", "found"],
  path: [57, 118, 35],
  receiver: {
    index: 26,
    start: 117,
    end: 121,
    length: 5,
    values: [12, 2, 11, 10, 2],
    gp0: 37,
  },
}]);

const foundReceiver = tripleHits[0].receiver;
assert.equal(gp0("FOUND"), 36);

// Only after the receiver is selected, consume its untouched raw word number.
// The original p50 token at address37 is 1K. Base60 returns80, while base59
// returns79. Offset80 is the independently fixed split READ OUT packet start.
assert.equal(tableTokens[foundReceiver.gp0], "1K");
const foundReturn60 = decodeToken(tableTokens[foundReceiver.gp0], alphabet60);
const foundReturn59 = decodeToken(tableTokens[foundReceiver.gp0], alphabet59);
assert.equal(foundReturn60, 80);
assert.equal(foundReturn59, 79);

// Matched local control: among every complete five-rune p0 word, only the
// prospectively selected receiver maps under either radix to either frozen
// READ OUT packet start (80 split, 166 whole).
const readoutStarts = new Set([80, 166]);
const fiveRuneReturnHits = [];
for (const word of p0.filter((candidate) => candidate.length === 5)) {
  if (word.gp0 >= tableTokens.length) continue;
  for (const [radix, alphabet] of [
    ["base60", alphabet60],
    ["base59", alphabet59],
  ]) {
    const value = decodeToken(tableTokens[word.gp0], alphabet);
    if (readoutStarts.has(value)) {
      fiveRuneReturnHits.push({
        wordIndex: word.index,
        start: word.start,
        gp0: word.gp0,
        token: tableTokens[word.gp0],
        radix,
        value,
      });
    }
  }
}

assert.deepEqual(fiveRuneReturnHits, [{
  wordIndex: 26,
  start: 117,
  gp0: 37,
  token: "1K",
  radix: "base60",
  value: 80,
}]);

// Reproduce only the simplest already-fixed consequence at the returned
// split receiver. p=23 fixes the span length; the four complete words at
// 80..102 shell-transform to a packet beginning [B,p] and ending K.
const readoutWords = p0.filter((word) => word.start >= 80 && word.end <= 102);
assert.deepEqual(
  readoutWords.map((word) => [word.start, word.end, word.length]),
  [[80, 82, 3], [83, 89, 7], [90, 94, 5], [95, 102, 8]]
);
assert.equal(readoutWords.reduce((n, word) => n + word.length, 0), dh.p);

const readoutPacket = readoutWords.flatMap((word) => shellWord(word.values));
assert.equal(readoutPacket.length, dh.p);
assert.deepEqual(readoutPacket.slice(0, 2), [dh.B, dh.p]);
assert.equal(readoutPacket.at(-1), dh.K);

const stateValues = new Set(Object.values(dh));
for (const value of stateValues) assert.ok(readoutPacket.includes(value));

console.log(JSON.stringify({
  status: "PASS: WILL -> BE -> FOUND uniquely selects p0 117..121 and returns to READ OUT/DH",
  frozenDh: dh,
  stateHopFamily: { fields: Object.keys(dh), radices: ["base60", "base59"], hits: stateHopHits },\n  tripleFamily: {
    authenticatedTriples: message.length - 2,
    radices: ["base60", "base59"],
    hits: tripleHits,
  },
  selectedReceiver: {
    wordIndex: foundReceiver.index,
    offsets: [foundReceiver.start, foundReceiver.end],
    ciphertext: foundReceiver.values,
    rawGp0: foundReceiver.gp0,
    foundGp0: gp0("FOUND"),
  },
  localReturn: {
    token: tableTokens[foundReceiver.gp0],
    base60: foundReturn60,
    base59: foundReturn59,
    fiveRuneControlHits: fiveRuneReturnHits,
  },
  readoutPacket: {
    offsets: [80, 102],
    length: readoutPacket.length,
    boundary: [readoutPacket[0], readoutPacket[1], readoutPacket.at(-1)],
    expectedBoundary: [dh.B, dh.p, dh.K],
    fullStateCovered: [...stateValues].every((value) => readoutPacket.includes(value)),
  },
  classification:
    "conditional local navigation bridge: K=2 and the signed phrase select the receiver before its ciphertext is consumed; its raw number uniquely returns the five-rune control family to the split READ OUT/DH packet under base60. FOUND is a navigation label, not recovered plaintext.",
}, null, 2));
