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
// Frozen from the independently documented p0 13-dot route: SSHYEOEGMNGIAFC.
const dotRoutePermutation = [8, 0, 1, 9, 2, 3, 10, 4, 5, 11, 6, 7, 12];
const dotPermutedRows = rows.map(row => dotRoutePermutation.map(i => row[i]));
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
  for (const [rowOrder, key] of [["printed", rows[row]], ["dot-route", dotPermutedRows[row]]]) {
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
    pageKeyResults.push({ page, row, rowOrder, key: textOf(key), length: cipher.length, tests });
  }
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

const base60 = JSON.parse(fs.readFileSync(
  path.join(__dirname, "../resources/liber-primus/base60-grid.json"), "utf8"
));
const p50ByteRows = base60.byte_rows.slice(10, 23);
assert.equal(p50ByteRows.length, 13);
assert(p50ByteRows.every(row => row.length === 8));
const p50RowKey = rows[47]; // conditional p3-p57 page-to-row mapping
const p50DotKey = dotPermutedRows[47];
const p50KeyVariants = {
  row47Index: p50RowKey,
  row47Prime: p50RowKey.map(i => prime[i]),
  dotRow47Index: p50DotKey,
  dotRow47Prime: p50DotKey.map(i => prime[i])
};
function printableRatio(bytes) {
  return bytes.filter(x => x >= 32 && x <= 126).length / bytes.length;
}
function asciiPreview(bytes) {
  return bytes.map(x => x >= 32 && x <= 126 ? String.fromCharCode(x) : ".").join("");
}

function matrixProduct(a, b, modulus) {
  return a.map(row => Array.from({ length: 8 }, (_, col) =>
    row.reduce((sum, value, k) => sum + value * b[k][col], 0) % modulus
  ));
}
function bytePrintableRatio(bytes) {
  return bytes.filter(x => x >= 32 && x <= 126).length / bytes.length;
}
function byteAsciiPreview(bytes) {
  return bytes.slice(0, 80).map(x => x >= 32 && x <= 126 ? String.fromCharCode(x) : ".").join("");
}
const matrixProductTests = [];
for (const [aName, a] of [
  ["raw", rows],
  ["dot-columns", dotPermutedRows]
]) {
  for (const [bName, b] of [
    ["natural", p50ByteRows],
    ["dot-rows", dotRoutePermutation.map(i => p50ByteRows[i])]
  ]) {
    for (const modulus of [23, 29, 60, 256]) {
      const product = matrixProduct(a, b, modulus);
      const flat = product.flat();
      const entry = {
        aName, bName, modulus, shape: [product.length, 8],
        firstRows: product.slice(0, 5),
        printableRatio: modulus === 256 ? bytePrintableRatio(flat) : null,
        asciiPreview: modulus === 256 ? byteAsciiPreview(flat) : null
      };
      if (modulus === 29 || modulus === 23) {
        const controls = [];
        for (const page of [56, 57]) {
          const key = product[page - 3];
          const cipher = pages[page].indices;
          const variants = [];
          for (const sign of [-1, 1]) {
            for (const hold of [null, F, E]) {
              for (const reverse of [false, true]) {
                const K = reverse ? key.slice().reverse() : key;
                let cursor = 0;
                const out = [];
                for (const c of cipher) {
                  if (hold !== null && c === hold) { out.push(c); continue; }
                  out.push(((c + sign * K[cursor % 8]) % 29 + 29) % 29);
                  cursor++;
                }
                variants.push({ sign, hold: hold === null ? "none" : translit[hold], reverse, ...stats(out, cursor) });
              }
            }
          }
          controls.push({ page, key: textOf(key), variants });
        }
        entry.controlVigenere = controls;
      }
      matrixProductTests.push(entry);
    }
  }
}

const p50Tests = [];
for (const [keyName, key] of Object.entries(p50KeyVariants)) {
  for (const op of ["xor", "minus", "plus"]) {
    for (const reverse of [false, true]) {
      const K = reverse ? key.slice().reverse() : key;
      const out = [];
      for (let r = 0; r < 13; r++) {
        for (const byte of p50ByteRows[r]) {
          const v = K[r];
          out.push(op === "xor" ? (byte ^ v) :
            op === "minus" ? ((byte - v + 256) % 256) : ((byte + v) % 256));
        }
      }
      p50Tests.push({
        keyName, op, reverse,
        printableRatio: printableRatio(out),
        asciiPreview: asciiPreview(out)
      });
    }
  }
}
const p50RowOrder = p50RowKey.map((v, i) => ({ v, i }))
  .sort((a, b) => a.v - b.v || a.i - b.i).map(x => x.i);
const p50Reorders = [];
for (const [orderName, order] of [
  ["row47-rank", p50RowOrder],
  ["dot-route", dotRoutePermutation],
  ["reverse-dot-route", dotRoutePermutation.slice().reverse()]
]) {
  const reordered = order.map(i => p50ByteRows[i]);
  for (const read of ["row", "column"]) {
    const out = read === "row" ? reordered.flat() :
      Array.from({ length: 8 }, (_, col) => reordered.map(row => row[col])).flat();
    p50Reorders.push({
      orderName, read,
      printableRatio: printableRatio(out),
      asciiPreview: asciiPreview(out)
    });
  }
}

const otpResults = [];
for (const [keyOrder, key] of [["row-major", payload], ["column-major", colMajor], ["dot-route-row-major", dotPermutedRows.flat()]]) {
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
    dotRoutePermutation,
    row0ForP1: textOf(rows[0]),
    row54ForP55: textOf(rows[54])
  },
  pageKeyResults,
  keyedAlphabetResults,
  oneTimePadResults: otpResults,
  p50CrossCarrierGate: {
    mapping: "conditional p3-p57; p50 -> row47",
    rowKey: textOf(p50RowKey),
    base60TableShape: [13, 8],
    rowPermutation: p50RowOrder,
    rowwiseByteOperations: p50Tests,
    rowReorders: p50Reorders,
    matrixProducts: matrixProductTests
  }
}, null, 2) + "\n");
