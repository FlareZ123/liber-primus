#!/usr/bin/env node
"use strict";

// Reconstruct the conditional 56-symbol stream from the first 5x5 square,
// then test one natural reading of the 2016 'numbers are the direction':
// GP prime weights become cumulative steps around the 56 LP2 pages.
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const blocks = read("resources/cicada2014-openpuff-magic-squares.txt").trim().split(/\r?\n\s*\r?\n/);
const square = blocks[0].trim().split(/\r?\n/).map(line => line.trim().split(/\s+/).map(Number));
if (square.length !== 5 || square.some(row => row.length !== 5)) throw new Error("expected original 5x5 square");
function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
}
function factorKeys(n) {
  const out = [];
  for (let p = 2; p * p <= n; p++) if (n % p === 0) {
    out.push(p);
    while (n % p === 0) n /= p;
  }
  if (n > 1) out.push(n);
  return out;
}
function numberCommand(n) {
  if (isPrime(n)) {
    const reversed = Number(String(n).split("").reverse().join(""));
    if (isPrime(reversed)) return { plus: true, factors: [] };
    return { plus: false, factors: factorKeys(reversed) };
  }
  return { plus: false, factors: factorKeys(n) };
}
function base29Digits(n) {
  const out = [];
  for (; n > 0; n = Math.floor(n / 29)) out.unshift(n % 29);
  return out.length ? out : [0];
}
const gpPrimeIndex = new Map(corpus.prime.map((p, i) => [p, i]));
const stream = [];
let factorOccurrences = 0, omittedF = 0, externalOccurrences = 0;
for (const row of square) for (const value of row) {
  const result = numberCommand(value);
  if (result.plus) continue;
  for (const factor of result.factors) {
    factorOccurrences++;
    const index = gpPrimeIndex.get(factor);
    const digits = index === undefined ? base29Digits(factor) : [index];
    if (index === undefined) externalOccurrences++;
    for (const digit of digits) {
      if (digit === 0) omittedF++; // conditional transfer of p56's F-skip
      else stream.push(digit);
    }
  }
}
if (factorOccurrences !== 70 || omittedF !== 21 || stream.length !== 56) throw new Error("source-derived stream counts changed");
const transliteration = stream.map(i => corpus.translit[i]).join("");
const expected = "OIUWHUCRDUOHUGONTOTHOUOGIDTHIWATHIIDUOGTHOTOONUGUOHRDUCUWHOI";
if (transliteration !== expected) throw new Error("56-symbol stream differs from the pinned derivation");
const steps = stream.map(i => corpus.prime[i] % 56);
let page = 0;
const route = [page];
for (const step of steps) { page = (page + step) % 56; route.push(page); }
const withStart = route.slice(0, 56);
const afterSteps = route.slice(1);
function coverage(values) {
  const unique = [...new Set(values)];
  return { positions: values.length, uniquePages: unique.length, missing: Array.from({length:56}, (_,i) => i).filter(i => !unique.includes(i)) };
}
console.log(JSON.stringify({
  factorOccurrences, externalOccurrences, omittedF, streamLength: stream.length,
  streamIndices: stream, transliteration, steps,
  routeWithStart: withStart, coverageWithStart: coverage(withStart),
  routeAfterSteps: afterSteps, coverageAfterSteps: coverage(afterSteps),
  finalPageAfter56Steps: route.at(-1), returnsToStart: route.at(-1) === 0
}, null, 2));
