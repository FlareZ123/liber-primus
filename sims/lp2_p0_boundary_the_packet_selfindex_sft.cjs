"use strict";

/**
 * Source-selected p0 boundary:
 * - derive split/whole 23-value H packets from original ciphertext;
 * - recover THE at p0 235..236 by ciphertext self-index into split packet;
 * - charge the small lookup family on the fixed word;
 * - census the fixed inverse manuscript-wide;
 * - verify the adjacent seven-rune word's unique H pair-sum [B,p,A].
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const raw = fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-transcription.txt"), "utf8");
const signed = fs.readFileSync(
  path.join(root, "resources/historical/cicada2016-4gq25-outguess.asc"), "utf8");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const segments = raw.split(/^\s*%\s*$/m).slice(0, 55);

function pageNo(segment) {
  return segment >= 50 ? segment + 1 : segment;
}

function mod29(value) {
  return ((value % 29) + 29) % 29;
}

function parsePage(source) {
  const runes = [];
  const words = [];
  let current = [];
  let start = 0;

  function flush() {
    if (!current.length) return;
    words.push({
      number: words.length + 1,
      start,
      end: start + current.length - 1,
      values: current.slice(),
    });
    current = [];
  }

  for (const char of [...source]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      if (!current.length) start = runes.length;
      current.push(value);
      runes.push(value);
    } else if ((char === "-" || char === ".") && current.length) {
      flush();
    }
  }
  flush();
  return { runes, words };
}

function shellWord(values) {
  const out = [];
  for (let left = 0, right = values.length - 1;
    left < right; left += 1, right -= 1) {
    out.push(
      mod29(values[left] - values[right]),
      mod29(values[left] + values[right])
    );
  }
  if (values.length % 2 === 1) {
    out.push(values[(values.length - 1) / 2]);
  }
  return out;
}

function packetForSpan(page, start, end) {
  const words = page.words.filter((word) =>
    word.start >= start && word.end <= end);
  assert.equal(words[0].start, start);
  assert.equal(words[words.length - 1].end, end);
  const packet = words.flatMap((word) => shellWord(word.values));
  assert.equal(packet.length, end - start + 1);
  return packet;
}

const p0 = parsePage(segments[0]);
const split = packetForSpan(p0, 80, 102);
const whole = packetForSpan(p0, 166, 188);

assert.deepEqual(split, [
  19,23,25,4,16,12,9,6,10,14,15,8,24,5,21,5,28,26,22,9,0,18,2,
]);
assert.deepEqual(whole, [
  15,8,22,10,11,15,10,2,13,8,28,15,14,8,20,12,9,4,25,4,7,24,19,
]);

const theWord = p0.words.find((word) =>
  word.start === 235 && word.end === 236);
const devotedReceiver = p0.words.find((word) =>
  word.start === 237 && word.end === 243);

assert.ok(theWord);
assert.ok(devotedReceiver);
assert.deepEqual(theWord.values, [8, 5]);
assert.deepEqual(devotedReceiver.values, [15,22,16,22,21,1,4]);

function forwardLookup(packet, value, origin) {
  const index = origin === "one" ? value - 1 : value;
  if (index < 0 || index >= packet.length) return null;
  return packet[index];
}

const theKey = theWord.values.map((value) =>
  forwardLookup(split, value, "one"));
assert.deepEqual(theKey, [6, 16]);

const recoveredThe = theWord.values.map((value, index) =>
  mod29(value - theKey[index]));
assert.deepEqual(recoveredThe, [2, 18]);

const reconstructedTheCipher = recoveredThe.map((value, index) =>
  mod29(value + theKey[index]));
assert.deepEqual(reconstructedTheCipher, theWord.values);

function inversePositions(packet, value, origin) {
  const positions = [];
  for (let index = 0; index < packet.length; index += 1) {
    if (packet[index] !== value) continue;
    positions.push(origin === "one" ? index + 1 : index);
  }
  return positions;
}

function cartesian(arrays, index = 0, prefix = [], out = []) {
  if (index === arrays.length) {
    out.push(prefix.slice());
    return out;
  }
  for (const value of arrays[index]) {
    prefix.push(value);
    cartesian(arrays, index + 1, prefix, out);
    prefix.pop();
  }
  return out;
}

const familyHits = [];
for (const [packetName, packet] of [["split", split], ["whole", whole]]) {
  for (const origin of ["one", "zero"]) {
    const forward = theWord.values.map((value) =>
      forwardLookup(packet, value, origin));
    if (forward.every((value) => value !== null)) {
      for (const sign of ["subtract", "add"]) {
        const plain = theWord.values.map((value, index) =>
          sign === "subtract"
            ? mod29(value - forward[index])
            : mod29(value + forward[index]));
        if (plain[0] === 2 && plain[1] === 18) {
          familyHits.push({
            packet: packetName,
            origin,
            direction: "forward",
            sign,
            key: forward,
          });
        }
      }
    }

    const inverseChoices = theWord.values.map((value) =>
      inversePositions(packet, value, origin));
    if (inverseChoices.every((choices) => choices.length > 0)) {
      for (const key of cartesian(inverseChoices)) {
        for (const sign of ["subtract", "add"]) {
          const plain = theWord.values.map((value, index) =>
            sign === "subtract"
              ? mod29(value - key[index])
              : mod29(value + key[index]));
          if (plain[0] === 2 && plain[1] === 18) {
            familyHits.push({
              packet: packetName,
              origin,
              direction: "inverse",
              sign,
              key,
            });
          }
        }
      }
    }
  }
}

assert.deepEqual(familyHits, [{
  packet: "split",
  origin: "one",
  direction: "forward",
  sign: "subtract",
  key: [6, 16],
}]);

let twoRuneCount = 0;
let eligibleTwoRuneCount = 0;
const globalTheHits = [];

for (let segment = 0; segment < segments.length; segment += 1) {
  const page = parsePage(segments[segment]);
  for (const word of page.words) {
    if (word.values.length !== 2) continue;
    twoRuneCount += 1;
    if (!word.values.every((value) => value >= 1 && value <= 23)) continue;
    eligibleTwoRuneCount += 1;
    const key = word.values.map((value) => split[value - 1]);
    const plain = word.values.map((value, index) =>
      mod29(value - key[index]));
    if (plain[0] === 2 && plain[1] === 18) {
      globalTheHits.push({
        page: pageNo(segment),
        start: word.start,
        end: word.end,
        cipher: word.values,
      });
    }
  }
}

assert.equal(twoRuneCount, 465);
assert.equal(eligibleTwoRuneCount, 284);
assert.equal(globalTheHits.length, 5);
assert.ok(globalTheHits.some((hit) =>
  hit.page === 0 && hit.start === 235 && hit.end === 236));

const prose = signed
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .split("\n")
  .filter((line) =>
    !line.startsWith("-----") &&
    !line.startsWith("Hash:") &&
    !/^\s*3301\s*$/.test(line) &&
    !/Verify OpenPGP/.test(line))
  .join(" ");

const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((a, b) => b.symbol.length - a.symbol.length);

function gpWord(word) {
  const source = word.toUpperCase()
    .replace(/K/g, "C")
    .replace(/V/g, "U")
    .replace(/Q/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");

  const values = [];
  for (let index = 0; index < source.length;) {
    const token = gpTokens.find((candidate) =>
      source.startsWith(candidate.symbol, index));
    if (!token) return null;
    values.push(token.value);
    index += token.symbol.length;
  }
  return values;
}

const vocabulary = new Map();
for (const word of prose.match(/[A-Za-z]+/g) || []) {
  const values = gpWord(word);
  if (!values) continue;
  const key = values.join(",");
  if (!vocabulary.has(key)) vocabulary.set(key, new Set());
  vocabulary.get(key).add(word.toUpperCase());
}

let eligibleWordCount = 0;
const sourceVocabularyHits = [];

for (let segment = 0; segment < segments.length; segment += 1) {
  const page = parsePage(segments[segment]);
  for (const word of page.words) {
    if (!word.values.every((value) => value >= 1 && value <= 23)) continue;
    eligibleWordCount += 1;

    for (const [packetName, packet] of [["split", split], ["whole", whole]]) {
      const key = word.values.map((value) => packet[value - 1]);
      const plain = word.values.map((value, index) =>
        mod29(value - key[index]));
      const words = vocabulary.get(plain.join(","));
      if (!words) continue;
      sourceVocabularyHits.push({
        page: pageNo(segment),
        start: word.start,
        end: word.end,
        packet: packetName,
        sourceWords: [...words],
        plain,
      });
    }
  }
}

assert.equal(eligibleWordCount, 1145);
assert.equal(sourceVocabularyHits.length, 5);
assert.ok(sourceVocabularyHits.every((hit) =>
  hit.packet === "split" &&
  hit.sourceWords.length === 1 &&
  hit.sourceWords[0] === "THE" &&
  hit.plain.length === 2));

const devotedH = shellWord(devotedReceiver.values);
assert.deepEqual(devotedH, [11,19,21,23,24,8,22]);
assert.deepEqual([devotedH[1], devotedH[3], devotedH[5]], [19,23,8]);

const dhSet = new Set([23,5,6,15,8,19,2]);
let sevenRuneCount = 0;
let allEvenDhCount = 0;
const exactEvenTripleHits = [];

for (let segment = 0; segment < segments.length; segment += 1) {
  const page = parsePage(segments[segment]);
  for (const word of page.words) {
    if (word.values.length !== 7) continue;
    sevenRuneCount += 1;
    const h = shellWord(word.values);
    const sums = [h[1], h[3], h[5]];
    if (sums.every((value) => dhSet.has(value))) allEvenDhCount += 1;
    if (sums[0] === 19 && sums[1] === 23 && sums[2] === 8) {
      exactEvenTripleHits.push({
        page: pageNo(segment),
        start: word.start,
        end: word.end,
      });
    }
  }
}

assert.equal(sevenRuneCount, 214);
assert.equal(allEvenDhCount, 5);
assert.deepEqual(exactEvenTripleHits, [{
  page: 0,
  start: 237,
  end: 243,
}]);

console.log(JSON.stringify({
  status: "PASS",
  selectedBoundary: {
    theCipher: theWord.values,
    key: theKey,
    plaintext: recoveredThe,
    forwardReconstruction: reconstructedTheCipher,
  },
  familyHits,
  manuscriptTwoRuneControl: {
    all: twoRuneCount,
    eligible: eligibleTwoRuneCount,
    exactTheHits: globalTheHits.length,
    hits: globalTheHits,
  },
  sourceVocabularyControl: {
    eligibleWords: eligibleWordCount,
    exactHits: sourceVocabularyHits.length,
    hits: sourceVocabularyHits,
  },
  adjacentSevenRuneReceiver: {
    cipher: devotedReceiver.values,
    h: devotedH,
    evenPairSums: [devotedH[1], devotedH[3], devotedH[5]],
    allSevenRuneWords: sevenRuneCount,
    allEvenDhCount,
    exactTripleHits: exactEvenTripleHits,
  },
}, null, 2));
