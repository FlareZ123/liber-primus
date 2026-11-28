#!/usr/bin/env node
"use strict";

/*
 * Literal 15/14 GP chart: one-escape, 14+15 variable-length straddling code.
 * Original input: resources/liber-primus/lp2-corpus.json
 * Positive controls: genuine clear GP p56 and p57; no inferred English.
 * A fixed escape from the 15-rune column (or reversed 14-rune column)
 * produces codewords S or ESC+D, where S and D partition all 29 symbols.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, "..", "resources", "liber-primus", "lp2-corpus.json"),
  "utf8"
));
const letters = corpus.translit;
assert.equal(letters.length, 29);
assert.deepEqual(
  [letters[0], letters[14], letters[15], letters[28]],
  ["F", "X", "S", "EA"]
);

const left = Array.from({ length: 15 }, (_, i) => i);
const right = Array.from({ length: 14 }, (_, i) => i + 15);
const chapters = [
  [0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55]
];

function inverse(cipher, singles, escape) {
  const S = new Set(singles);
  const D = new Set(Array.from({ length: 29 }, (_, i) => i).filter(x => !S.has(x)));
  assert(D.has(escape));
  const plain = [];
  for (let i = 0; i < cipher.length;) {
    const c = cipher[i];
    assert(Number.isInteger(c) && c >= 0 && c < 29);
    if (S.has(c)) {
      plain.push(c);
      i++;
    } else if (c === escape) {
      if (i + 1 >= cipher.length)
        return { ok: false, offset: i, reason: "dangling-escape", plain };
      if (!D.has(cipher[i + 1]))
        return { ok: false, offset: i, reason: "invalid-second-column", plain };
      plain.push(cipher[i + 1]);
      i += 2;
    } else {
      return { ok: false, offset: i, reason: "nonprefix-double-rune", plain };
    }
  }
  return { ok: true, offset: cipher.length, plain };
}

function forward(plain, singles, escape) {
  const S = new Set(singles);
  const D = new Set(Array.from({ length: 29 }, (_, i) => i).filter(x => !S.has(x)));
  assert(D.has(escape));
  const out = [];
  for (const p of plain) {
    assert(Number.isInteger(p) && p >= 0 && p < 29);
    if (S.has(p)) out.push(p);
    else out.push(escape, p);
  }
  return out;
}

function histogram(cipher) {
  const h = Array(29).fill(0);
  for (const c of cipher) {
    assert(Number.isInteger(c) && c >= 0 && c < 29);
    h[c]++;
  }
  return h;
}

function scanOriginal(cipher, singles) {
  const D = Array.from({ length: 29 }, (_, i) => i).filter(x => !singles.includes(x));
  const hist = histogram(cipher);
  const doubledColumnOccurrences = D.reduce((n, d) => n + hist[d], 0);
  const candidates = D.map(escape => {
    const result = inverse(cipher, singles, escape);
    const deficit = doubledColumnOccurrences - 2 * hist[escape];
    assert(!result.ok, "Unexpected original parse: do not silently discard");
    assert(deficit > 0,
      "Source count obstruction was expected for all literal escapes");
    return {
      escape, escapeRune: letters[escape],
      escapeOccurrences: hist[escape], deficit,
      firstFailureAt: result.offset,
      failure: result.reason, legalPrefixPlainRunes: result.plain.length
    };
  });
  const maxPrefix = candidates.reduce((a, b) =>
    a.escapeOccurrences >= b.escapeOccurrences ? a : b);
  const longest = candidates.reduce((a, b) =>
    a.legalPrefixPlainRunes >= b.legalPrefixPlainRunes ? a : b);
  return {
    cipherRunes: cipher.length,
    doubleColumnRunes: doubledColumnOccurrences,
    maximumEscapeRune: maxPrefix.escapeRune,
    maximumEscapeCount: maxPrefix.escapeOccurrences,
    minimumForbiddenCount: Math.min(...candidates.map(c => c.deficit)),
    longestLegalPrefixDecodedRunes: longest.legalPrefixPlainRunes,
    longestLegalPrefixEscapeRune: longest.escapeRune,
    longestLegalPrefixFirstFailure: longest.firstFailureAt,
    sourceSelectedX: singles === right
      ? candidates.find(c => c.escape === 14)
      : null,
    conventionalS: singles === left
      ? candidates.find(c => c.escape === 15)
      : null
  };
}

// A legal frame has one escape plus one D suffix per long codeword.
// Consequently N_D == 2*N_ESC, independently of plaintext or its language.
// Verify this exact invariant for genuine known plaintext and original-tape
// data treated only as a positive input to forward() (never as "recovered").
for (const pageNumber of [56, 57]) {
  const native = corpus.pages[pageNumber].indices;
  for (const [singles, escape] of [[right, 14], [left, 15]]) {
    const wire = forward(native, singles, escape);
    const result = inverse(wire, singles, escape);
    assert(result.ok);
    assert.deepEqual(result.plain, native);
    assert.deepEqual(forward(result.plain, singles, escape), wire);
    const h = histogram(wire);
    const D = Array.from({ length: 29 }, (_, i) => i)
      .filter(x => !singles.includes(x));
    assert.equal(D.reduce((n, d) => n + h[d], 0), 2 * h[escape]);
    if (singles === right) {
      assert(!inverse([14], singles, escape).ok);
      assert(!inverse([14, 15], singles, escape).ok);
      assert(!inverse([0], singles, escape).ok);
    } else {
      assert(!inverse([15], singles, escape).ok);
      assert(!inverse([15, 0], singles, escape).ok);
      assert(!inverse([16], singles, escape).ok);
    }
    console.log("POSITIVE page=" + pageNumber + " native=" + native.length +
      " wire=" + wire.length + " singletons=" + singles.length +
      " prefix=" + letters[escape] + " exact=true");
  }
}

const outputs = [];
for (const [from, to] of chapters) {
  const cipher = corpus.pages.slice(from, to + 1)
    .flatMap(page => page.indices);
  const a = scanOriginal(cipher, right); // right=14 singletons, left=15 doubles
  const b = scanOriginal(cipher, left);  // left=15 singletons, right=14 doubles
  outputs.push({ physicalPages: [from, to], A15D_B14S: a, B14D_A15S: b });
  console.log("ORIGINAL p" + from + "-" + to + " n=" + cipher.length +
    " leftD>= " + a.minimumForbiddenCount +
    " rightD>= " + b.minimumForbiddenCount +
    " longest-legal-prefix=" +
    Math.max(a.longestLegalPrefixDecodedRunes, b.longestLegalPrefixDecodedRunes) +
    " no-original-decryption");
}
assert.equal(outputs[0].A15D_B14S.doubleColumnRunes, 384);
assert.equal(outputs[0].A15D_B14S.maximumEscapeCount, 34);
assert.equal(outputs[0].A15D_B14S.minimumForbiddenCount, 316);
assert.equal(outputs[0].B14D_A15S.doubleColumnRunes, 345);
assert.equal(outputs[0].B14D_A15S.minimumForbiddenCount, 283);
assert.equal(outputs[0].A15D_B14S.sourceSelectedX.escapeOccurrences, 28);
assert.equal(outputs[0].A15D_B14S.sourceSelectedX.deficit, 328);
assert.equal(outputs[0].A15D_B14S.sourceSelectedX.firstFailureAt, 1);
console.log("PASS: 18 exact original column/escape impossibilities; " +
  "all 29 eligible prefix choices per chapter checked; " +
  "all four native positive frames round-trip exactly.");