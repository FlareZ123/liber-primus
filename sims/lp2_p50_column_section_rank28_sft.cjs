#!/usr/bin/env node
"use strict";

// Source-fixed p50-column / eight-section predecessor-exclusion test.
// Frozen assumptions:
//   * p50's eight physical columns map left-to-right to the eight '$'-terminated
//     unknown LP2 sections in source order;
//   * each column is a 32-symbol cyclic rotation stream, top-to-bottom;
//   * the first ciphertext rune in each section is its clear IV;
//   * GP F (index 0) is the repeat sentinel and is transparent to the key clock;
//   * every other plaintext rune (indices 1..28) is ranked in GP order and mapped
//     to the 28 ciphertext runes other than the previous ciphertext rune;
//   * the column byte is reduced mod 28 and rotates that ordered 28-way set.
// No phase, column permutation, section permutation, reset tuning, or key fitting.

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const transcription = read("resources/transcriptions/lp2-image-corrected.txt");
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));

const GP = corpus.runes;
const GP_TEXT = corpus.translit;
assert.equal(GP.length, 29);
assert.equal(GP_TEXT[0], "F");
assert.equal(grid.pages.reduce((n, p) => n + p.tokens.length, 0), 256);
assert.deepEqual(grid.pages.map((p) => [p.page, p.rows, p.cols]), [
  [49, 10, 8], [50, 13, 8], [51, 9, 8],
]);

const glyphIndex = new Map(GP.map((r, i) => [r, i]));
const sourceSections = transcription.split("$").slice(0, 8).map((part) =>
  [...part].filter((ch) => glyphIndex.has(ch)).map((ch) => glyphIndex.get(ch))
);
const expectedLengths = [729, 1145, 1738, 1894, 1021, 1433, 1680, 3316];
assert.deepEqual(sourceSections.map((s) => s.length), expectedLengths);

const tokens = grid.pages.flatMap((p) => p.tokens);
const alphabet60 = grid.alphabet;
const alphabet59 = alphabet60.replace("f", "");
function parseTokens(radix, alphabet) {
  const values = tokens.map((token) => {
    const hi = alphabet.indexOf(token[0]);
    const lo = alphabet.indexOf(token[1]);
    assert.ok(hi >= 0 && lo >= 0, "token outside frozen digit alphabet");
    return radix * hi + lo;
  });
  assert.equal(values.length, 256);
  return values;
}
const byteTables = {
  base60: parseTokens(60, alphabet60),
  drop_f_base59: parseTokens(59, alphabet59),
};

const mod = (x, m) => ((x % m) + m) % m;
const alphabetWithout = (symbol) => GP.filter((x) => x !== symbol);

function encode(plainWithIv, key, sign) {
  assert.ok(plainWithIv.length > 0);
  const cipher = [plainWithIv[0]];
  let previousCipher = plainWithIv[0];
  let keyAdvances = 0;

  for (const plain of plainWithIv.slice(1)) {
    if (plain === 0) {
      // Transparent F: emit the previous ciphertext symbol and hold the key.
      cipher.push(previousCipher);
    } else {
      const allowedCipher = alphabetWithout(previousCipher);
      const shift = key[keyAdvances % 32] % 28;
      cipher.push(allowedCipher[mod((plain - 1) + sign * shift, 28)]);
      keyAdvances += 1;
    }
    previousCipher = cipher[cipher.length - 1];
  }
  return { cipher, keyAdvances };
}

function decode(cipher, key, sign) {
  assert.ok(cipher.length > 0);
  const plain = [];
  let previousCipher = cipher[0];
  let keyAdvances = 0;

  for (const currentCipher of cipher.slice(1)) {
    if (currentCipher === previousCipher) {
      plain.push(0);
      // Transparent F: no key advance and previousCipher remains unchanged.
    } else {
      const allowedCipher = alphabetWithout(previousCipher);
      const rank = allowedCipher.indexOf(currentCipher);
      assert.ok(rank >= 0, "cipher symbol absent from predecessor-excluded set");
      const shift = key[keyAdvances % 32] % 28;
      plain.push(1 + mod(rank - sign * shift, 28));
      keyAdvances += 1;
    }
    previousCipher = currentCipher;
  }
  return { plain, keyAdvances };
}

function stats(symbols) {
  const counts = Array(29).fill(0);
  for (const symbol of symbols) counts[symbol] += 1;
  let adjacentEqual = 0;
  for (let i = 1; i < symbols.length; i += 1) {
    if (symbols[i] === symbols[i - 1]) adjacentEqual += 1;
  }
  const n = symbols.length;
  const ioc = counts.reduce((sum, c) => sum + c * (c - 1), 0) / (n * (n - 1));
  const nonF = counts.slice(1);
  const nonFN = nonF.reduce((a, b) => a + b, 0);
  const expected = nonFN / 28;
  const nonFChi2 = nonF.reduce((sum, c) => sum + ((c - expected) ** 2) / expected, 0);
  const nonFIoc = nonF.reduce((sum, c) => sum + c * (c - 1), 0) / (nonFN * (nonFN - 1));
  return {
    n,
    ioc: Number(ioc.toFixed(12)),
    adjacentEqual,
    F: counts[0],
    nonF_ioc: Number(nonFIoc.toFixed(12)),
    nonF_chi2_28df: Number(nonFChi2.toFixed(6)),
    nonF_min: Math.min(...nonF),
    nonF_max: Math.max(...nonF),
  };
}

const results = [];
for (const [radix, bytes] of Object.entries(byteTables)) {
  for (const sign of [1, -1]) {
    const decodedSections = [];
    const sectionResults = [];
    let originalRoundTrips = 0;

    for (let section = 0; section < 8; section += 1) {
      const cipher = sourceSections[section];
      const key = Array.from({ length: 32 }, (_, row) => bytes[row * 8 + section]);
      const decoded = decode(cipher, key, sign);
      const replay = encode([cipher[0], ...decoded.plain], key, sign).cipher;
      assert.deepEqual(replay, cipher, "original section failed exact replay");
      originalRoundTrips += 1;
      decodedSections.push(decoded.plain);
      sectionResults.push({
        section,
        cipherRunes: cipher.length,
        recoveredRunes: decoded.plain.length,
        keyAdvances: decoded.keyAdvances,
        ...stats(decoded.plain),
        preview: decoded.plain.slice(0, 48).map((x) => GP_TEXT[x]).join(" "),
      });
    }

    // Source-native positive controls: both solved pages, each under every
    // physical p50 column. The first rune is the IV; all remaining runes,
    // including literal F holds, must recover exactly.
    let nativeTests = 0;
    let nativeRecoveredRunes = 0;
    for (let column = 0; column < 8; column += 1) {
      const key = Array.from({ length: 32 }, (_, row) => bytes[row * 8 + column]);
      for (const pageNumber of [56, 57]) {
        const native = corpus.pages[pageNumber].indices;
        const planted = encode(native, key, sign);
        const recovered = decode(planted.cipher, key, sign).plain;
        assert.deepEqual(recovered, native.slice(1));
        nativeTests += 1;
        nativeRecoveredRunes += recovered.length;
      }
    }

    results.push({
      radix,
      sign,
      originalSectionsRoundTripped: originalRoundTrips,
      nativePositiveTests: nativeTests,
      nativeRunesRecovered: nativeRecoveredRunes,
      aggregate: stats(decodedSections.flat()),
      sections: sectionResults,
    });
  }
}

const originalRepeatCounts = sourceSections.map((s) =>
  s.slice(1).filter((x, i) => x === s[i]).length
);
assert.deepEqual(originalRepeatCounts, [4, 6, 9, 10, 11, 13, 12, 21]);
assert.equal(originalRepeatCounts.reduce((a, b) => a + b, 0), 86);

console.log(JSON.stringify({
  hypothesis: "eight p50 columns as eight per-section period-32 GP28 rank rotations",
  sectionLengths: expectedLengths,
  originalRepeatCounts,
  keyClock: "advance on non-F transitions only; reset per $ section",
  initialState: "first ciphertext rune of each section is a clear IV and is not recovered",
  table: { shape: "32x8", tokens: 256, alphabet60, alternate59: alphabet59 },
  results,
}, null, 2));
