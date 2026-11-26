#!/usr/bin/env node
"use strict";

// Bounded test of the p0 3|3 -> E Hahal-runa hypothesis.
// Input is the canonical, original-image-derived GP29 corpus.
// E-hold means ciphertext E is emitted as plaintext E without consuming key/clock.
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const corpusPath = path.join(__dirname, "../resources/liber-primus/lp2-corpus.json");
const corpus = JSON.parse(fs.readFileSync(corpusPath, "utf8"));
const { pages, translit } = corpus;
const E = translit.indexOf("E");
const F = translit.indexOf("F");
const mod = (x, m) => ((x % m) + m) % m;
const title = pages[0].indices.slice(0, 13);
const titleWithoutE = title.filter(x => x !== E);
const p0Body = pages[0].indices.slice(13);
const chapter = p0Body.concat(pages[1].indices, pages[2].indices);

assert.equal(title.length, 13);
assert.deepEqual(title.map(i => translit[i]), ["S","H","E","O","G","M","IA","F","S","Y","E","NG","C"]);
assert.equal(title[2], E);
assert.equal(title[10], E);
assert.equal(p0Body.length, 249);
assert.equal(chapter.length, 716);

function textOf(indices) {
  return indices.map(i => translit[i]).join(" ");
}
function summary(indices, consumed) {
  const counts = Array(29).fill(0);
  let equalities = 0;
  for (let i = 0; i < indices.length; i++) {
    counts[indices[i]]++;
    if (i > 0 && indices[i] === indices[i - 1]) equalities++;
  }
  const ioc = counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (indices.length * (indices.length - 1));
  return {
    length: indices.length,
    consumed,
    adjacentEqualities: equalities,
    ioc,
    first80: textOf(indices.slice(0, 80))
  };
}
function decodeTitleKey(cipher, key, mode) {
  let cursor = 0;
  const out = [];
  for (const c of cipher) {
    if (c === E) {
      out.push(E);
      continue;
    }
    const k = key[cursor % key.length];
    let p;
    if (mode === "C-K") p = c - k;
    else if (mode === "C+K") p = c + k;
    else if (mode === "K-C") p = k - c;
    else throw new Error("Unknown key mode: " + mode);
    out.push(mod(p, 29));
    cursor++;
  }
  return summary(out, cursor);
}
function firstPrimes(count) {
  const found = [];
  for (let n = 2; found.length < count; n++) {
    let prime = true;
    for (const p of found) {
      if (p * p > n) break;
      if (n % p === 0) {
        prime = false;
        break;
      }
    }
    if (prime) found.push(n);
  }
  return found;
}
function decodePrimeMinusOne(cipher, hold) {
  const primes = firstPrimes(cipher.length);
  let cursor = 0;
  const out = [];
  for (const c of cipher) {
    if (c === hold) {
      out.push(hold);
      continue;
    }
    out.push(mod(c - (primes[cursor] - 1), 29));
    cursor++;
  }
  return summary(out, cursor);
}

const titleKeyResults = {};
for (const [name, key] of [["13-rune-title", title], ["11-rune-title-without-E", titleWithoutE]]) {
  titleKeyResults[name] = {};
  for (const mode of ["C-K", "C+K", "K-C"]) {
    titleKeyResults[name][mode] = {
      p0: decodeTitleKey(p0Body, key, mode),
      p0ToP2: decodeTitleKey(chapter, key, mode)
    };
  }
}
const eHoldPrimeClock = decodePrimeMinusOne(chapter, E);
const p56FHoldControl = decodePrimeMinusOne(pages[56].indices, F);

const result = {
  input: "resources/liber-primus/lp2-corpus.json",
  mapping: {
    futhorcHahalRunes33: "E",
    redTitle: textOf(title),
    thirdRuneOfFirstWord: translit[title[2]],
    thirdRuneOfSecondWord: translit[title[10]],
    p0BodyRunes: p0Body.length,
    p0ToP2Runes: chapter.length
  },
  titleKeyResults,
  eHoldPrimeClock,
  p56FHoldPositiveControl: p56FHoldControl
};
process.stdout.write(JSON.stringify(result, null, 2) + "\n");
