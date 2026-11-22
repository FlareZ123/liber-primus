#!/usr/bin/env node
"use strict";

// Bounded test of the seven RAND bytes in the preserved 2013 participant
// transcript against the seven physical segments of the LP2 p33–39 cuneiform
// interval. This is not a generic key search: all candidate mappings below
// are frozen from the historical transcript and the known p56 phi-prime rule.

const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const vectors = JSON.parse(fs.readFileSync(path.join(root, "resources/external/2013-tcp-live-test-vectors.json"), "utf8"));

const transcript = vectors.sources.find((source) => source.observed?.randByteSequence);
assert.ok(transcript, "2013 participant transcript must expose randByteSequence");
const bytes = transcript.observed.randByteSequence;
assert.deepEqual(bytes, [151, 207, 64, 91, 172, 47, 179], "freeze the exact observed transcript output");
assert.ok(bytes.every((n) => Number.isInteger(n) && n >= 0 && n <= 255));

const randResponses = transcript.observed.randResponses;
assert.ok(Array.isArray(randResponses), "grouped RAND responses must be preserved");
assert.deepEqual(randResponses.flatMap((item) => item.values), bytes);

const pages = corpus.pages.filter((page) => page.page >= 33 && page.page <= 39).sort((a, b) => a.page - b.page);
assert.deepEqual(pages.map((page) => page.page), [33, 34, 35, 36, 37, 38, 39]);

// The cuneiform interval starts after the 91-rune p33 preface.
const segments = pages.map((page) => page.page === 33 ? page.indices.slice(91) : page.indices);
assert.deepEqual(segments.map((segment) => segment.length), [123, 261, 271, 238, 228, 228, 240]);
assert.equal(segments.reduce((sum, segment) => sum + segment.length, 0), 1589);

const translit = corpus.translit;
assert.ok(Array.isArray(translit) && translit.length === 29);
const mod29 = bytes.map((value) => value % 29);
const base29Alphabet = "0123456789ABCDEFGHIJKLMNOPQRS";
assert.equal(base29Alphabet.length, 29);

function toBase29(value) {
  let n = value;
  let out = "";
  do {
    out = base29Alphabet[n % 29] + out;
    n = Math.floor(n / 29);
  } while (n > 0);
  return out;
}
const base29Tokens = bytes.map(toBase29);
assert.deepEqual(base29Tokens, ["56", "74", "26", "34", "5R", "1I", "65"]);
const base29Key14 = base29Tokens.join("").split("").map((char) => base29Alphabet.indexOf(char));
assert.deepEqual(base29Key14, [5, 6, 7, 4, 2, 6, 3, 4, 5, 27, 1, 18, 6, 5]);

function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
}
function nextPrime(n) {
  let value = n;
  while (!isPrime(value)) value++;
  return value;
}
function firstPrimes(count) {
  const result = [];
  for (let value = 2; result.length < count; value++) {
    if (isPrime(value)) result.push(value);
  }
  return result;
}
const primes = firstPrimes(1000);

function transform(inputSegments, mode, direction, skipF) {
  let globalIndex = 0;
  return inputSegments.map((segment, pageIndex) => {
    let localIndex = 0;
    let prime = mode === "primeOrdinal"
      ? primes[bytes[pageIndex] - 1]
      : mode === "primeValue"
        ? nextPrime(bytes[pageIndex])
        : null;
    return segment.map((cipherRune) => {
      if (skipF && cipherRune === 0) return 0;
      let key;
      switch (mode) {
        case "pageShift": key = mod29[pageIndex]; break;
        case "period7": key = mod29[globalIndex % 7]; break;
        case "period14": key = base29Key14[globalIndex % 14]; break;
        case "pagePair": key = base29Key14[2 * pageIndex + (localIndex % 2)]; break;
        case "primeOrdinal":
        case "primeValue":
          key = (prime - 1) % 29;
          prime = nextPrime(prime + 1);
          break;
        default: throw new Error(`Unknown key mode: ${mode}`);
      }
      globalIndex++;
      localIndex++;
      return (cipherRune + direction * key + 29) % 29;
    });
  });
}

function score(outputSegments) {
  const flat = outputSegments.flat();
  const counts = Array(29).fill(0);
  for (const value of flat) counts[value]++;
  const n = flat.length;
  const ioc = counts.reduce((sum, count) => sum + count * (count - 1), 0) / (n * (n - 1));
  return {
    n,
    ioc: Number(ioc.toFixed(6)),
    preview: flat.slice(0, 50).map((value) => translit[value]).join(" ")
  };
}

const originalCounts = Array(29).fill(0);
for (const segment of segments) for (const value of segment) originalCounts[value]++;
const originalN = segments.reduce((sum, segment) => sum + segment.length, 0);
const ciphertextIoc = originalCounts.reduce((sum, count) => sum + count * (count - 1), 0) / (originalN * (originalN - 1));

const candidates = [];
for (const mode of ["pageShift", "period7", "period14", "pagePair"]) {
  for (const direction of [-1, 1]) {
    for (const skipF of [false, true]) {
      const roundTrip = skipF ? "not-asserted" : true;
      if (!skipF) {
        const encoded = transform(segments, mode, 1, false);
        assert.deepEqual(transform(encoded, mode, -1, false), segments, `${mode} round-trip failed`);
      }
      candidates.push({
        mode, direction: direction < 0 ? "subtract" : "add", skipF, roundTrip,
        ...score(transform(segments, mode, direction, skipF))
      });
    }
  }
}
for (const mode of ["primeOrdinal", "primeValue"]) {
  for (const direction of [-1, 1]) {
    for (const skipF of [false, true]) {
      if (!skipF) {
        const encoded = transform(segments, mode, 1, false);
        assert.deepEqual(transform(encoded, mode, -1, false), segments, `${mode} round-trip failed`);
      }
      candidates.push({
        mode, direction: direction < 0 ? "subtract" : "add", skipF,
        roundTrip: skipF ? "not-asserted" : true,
        ...score(transform(segments, mode, direction, skipF))
      });
    }
  }
}

process.stdout.write(JSON.stringify({
  source: transcript.url,
  randResponses,
  randByteSequence: bytes,
  mod29Key: mod29,
  base29Tokens,
  base29ExpandedKey: base29Key14,
  pageNumbers: pages.map((page) => page.page),
  segmentLengths: segments.map((segment) => segment.length),
  totalRunes: originalN,
  ciphertextIoc: Number(ciphertextIoc.toFixed(6)),
  candidates
}, null, 2) + "\n");
