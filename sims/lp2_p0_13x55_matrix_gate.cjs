#!/usr/bin/env node
"use strict";

// Reproduce the 13 + 1 + 55x13 partition and falsify simple page-key/OTP
// interpretations. Source: canonical original-image-derived LP2 corpus.
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, "../resources/liber-primus/lp2-corpus.json"), "utf8"
));
const { pages, translit, prime } = corpus;
const alphabet = Array.from({ length: 29 }, (_, i) => i);
const F = translit.indexOf("F");
const E = translit.indexOf("E");
const mod = x => ((x % 29) + 29) % 29;
const title = pages[0].indices.slice(0, 13);
const sentinel = pages[0].indices[13];
const payload = pages[0].indices.slice(14).concat(pages[1].indices, pages[2].indices);
assert.equal(pages[0].runic_count + pages[1].runic_count + pages[2].runic_count, 729);
assert.equal(title.length, 13);
assert.equal(translit[sentinel], "TH");
assert.equal(payload.length, 715);
assert.equal(payload.length, 55 * 13);
const rows = Array.from({ length: 55 }, (_, r) => payload.slice(r * 13, (r + 1) * 13));
const colMajor = Array.from({ length: 13 }, (_, c) => rows.map(row => row[c])).flat();

function textOf(a) { return a.map(i => translit[i]).join(" "); }
function stats(a, consumed) {
  const counts = Array(29).fill(0);
  let equalities = 0;
  for (let i = 0; i < a.length; i++) {
    counts[a[i]]++;
    if (i && a[i] === a[i - 1]) equalities++;
  }
  return {
    length: a.length,
    consumed,
    adjacentEqualities: equalities,
    ioc: counts.reduce((s, n) => s + n * (n - 1), 0) / (a.length * (a.length - 1)),
    first60: textOf(a.slice(0, 60))
  };
}
function vigenere(cipher, key, sign, hold, primeShifts = false, reverse = false) {
  const K = reverse ? key.slice().reverse() : key;
  let cursor = 0;
  const out = [];
  for (const c of cipher) {
    if (hold !== null && c === hold) {
      out.push(c);
      continue;
    }
    const shift = primeShifts ? prime[K[cursor % 13]] - 1 : K[cursor % 13];
    out.push(mod(c + sign * shift));
    cursor++;
  }
  return stats(out, cursor);
}
function keyedAlphabet(cipher, key, mode, reverse = false) {
  const K = reverse ? key.slice().reverse() : key;
  const unique = [];
  for (const x of K) if (!unique.includes(x)) unique.push(x);
  const keyed = unique.concat(alphabet.filter(x => !unique.includes(x)));
  const out = cipher.map(c => mode === "decrypt" ? alphabet[keyed.indexOf(c)] : keyed[alphabet.indexOf(c)]);
  return { keyedAlphabet: textOf(keyed), ...stats(out, cipher.length) };
}
function oneTimePad(cipher, key, sign, hold, reverse = false) {
  const K = reverse ? key.slice().reverse() : key;
  let cursor = 0;
  const out = [];
  for (const c of cipher) {
    if (hold !== null && c === hold) {
      out.push(c);
      continue;
    }
    out.push(mod(c + sign * K[cursor]));
    cursor++;
  }
  return stats(out, cursor);
}

const pageKeyCases = [
  { page: 3, row: 2 },   // natural p1-p55 mapping
  { page: 4, row: 3 },
  { page: 55, row: 54 },
  { page: 56, row: 53 }, // alternative p3-p57 mapping
  { page: 57, row: 54 }
];
const pageKeyResults = [];
for (const { page, row } of pageKeyCases) {
  const cipher = pages[page].indices;
  const key = rows[row];
  const tests = [];
  for (const primeShifts of [false, true]) {
    for (const sign of [-1, 1]) {
      for (const hold of [null, F, E]) {
        for (const reverse of [false, true]) {
          tests.push({
            primeShifts,
            sign,
            hold: hold === null ? "none" : translit[hold],
            reverse,
            ...vigenere(cipher, key, sign, hold, primeShifts, reverse)
          });
        }
      }
    }
  }
  pageKeyResults.push({ page, row, key: textOf(key), length: cipher.length, tests });
}
const keyedAlphabetResults = [];
for (const { page, key } of [
  { page: 0, key: title },
  { page: 3, key: rows[2] },
  { page: 4, key: rows[3] },
  { page: 55, key: rows[54] }
]) {
  for (const mode of ["decrypt", "encrypt"]) {
    for (const reverse of [false, true]) {
      const cipher = page === 0 ? pages[0].indices.slice(14) : pages[page].indices;
      keyedAlphabetResults.push({
        page, mode, reverse, key: textOf(key),
        ...keyedAlphabet(cipher, key, mode, reverse)
      });
    }
  }
}
const laterCipher = pages.slice(3, 56).flatMap(p => p.indices).slice(0, 715);
const otpResults = [];
for (const [keyOrder, key] of [["row-major", payload], ["column-major", colMajor]]) {
  for (const sign of [-1, 1]) {
    for (const hold of [null, F, E]) {
      for (const reverse of [false, true]) {
        otpResults.push({
          keyOrder, sign,
          hold: hold === null ? "none" : translit[hold],
          reverse,
          ...oneTimePad(laterCipher, key, sign, hold, reverse)
        });
      }
    }
  }
}
process.stdout.write(JSON.stringify({
  partition: {
    pageRunicCounts: pages.slice(0, 3).map(p => p.runic_count),
    total: 729,
    redTitle: textOf(title),
    firstBlackSentinel: translit[sentinel],
    payloadLength: payload.length,
    matrix: "55 x 13",
    row0ForP1: textOf(rows[0]),
    row54ForP55: textOf(rows[54])
  },
  pageKeyResults,
  keyedAlphabetResults,
  oneTimePadResults: otpResults
}, null, 2) + "\n");
