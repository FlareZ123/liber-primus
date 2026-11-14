"use strict";

/**
 * LP2 original-source navigation and one frozen HOME-key decoder gate.
 *
 * Reproducer: Node.js 22 CommonJS, run from anywhere in this repository.
 * Reads only canonical source assets; never writes or mutates anything.
 * Source indices are zero-based unless the table index is labeled 1-based.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const load = (name) => JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));
const corpus = load("resources/liber-primus/lp2-corpus.json");
const table = load("resources/liber-primus/base60-grid.json");
const page = (n) => {
  const record = corpus.pages.find((p) => p.page === n);
  assert(record, "Missing original page " + n);
  return record.indices;
};
const same = (a, b) => a.length === b.length &&
  a.every((x, i) => x === b[i]);
const mod29 = (n) => ((n % 29) + 29) % 29;
const gp = (s) => {
  const index = corpus.translit.indexOf(s);
  assert(index >= 0);
  return index;
};
const translit = (symbols) => symbols.map((v) => corpus.translit[v]).join(".");

const p27 = page(27);
const p32 = page(32);
const p55 = page(55);
const p57 = page(57);
assert.equal(p27.length, 234);
assert.equal(p32.length, 121);
assert.equal(p55.length, 76);
assert.equal(p57.length, 95);

// Source-visible last two complete printed words, p55: DJU-BEI.
const terminalPair = p55.slice(-6);
assert.equal(translit(terminalPair), "D.J.U.B.E.I");
assert(same(terminalPair, p27.slice(28, 34)));
const sum = (a) => a.reduce((n, i) => n + corpus.prime[i], 0);
const sums = [sum(terminalPair.slice(0, 3)), sum(terminalPair.slice(3))];
assert.deepEqual(sums, [129, 159]);
assert.equal((sums[0] + sums[1]) % 29, 27);
assert.equal(mod29(sums[0] - sums[1]), 28);

// Independent original-corpus endpoint census, including all other pages.
const unsolved = corpus.pages.filter((p) => p.page < 56 && p.indices.length);
assert.equal(unsolved.length, 55);
const terminalMatches = [];
for (const from of unsolved) {
  for (const to of unsolved) {
    if (from.page === to.page) continue;
    for (let i = 0; i + 6 <= to.indices.length; i++) {
      if (same(from.indices.slice(-6), to.indices.slice(i, i + 6))) {
        terminalMatches.push([from.page, to.page, i]);
      }
    }
  }
}
assert.deepEqual(terminalMatches, [[55, 27, 28]]);

// A new, literal next-hop reading: first entire word after p27 anchor is
// AE-F, whose GP-prime sum 103 selects 1-based 103rd table token "0W".
assert.equal(translit(p27.slice(34, 36)), "AE.F");
assert.equal(sum(p27.slice(34, 36)), 103);
const cells = table.rows.flat();
assert.equal(cells.length, 256);
assert.equal(cells[102], "0W");
assert.equal(cells[103], "3Q");
const base60Digits = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx";
assert.equal(base60Digits.indexOf("W"), 32);
assert.equal(base60Digits.indexOf("Q"), 26);
assert.equal(60 * base60Digits.indexOf("0") + base60Digits.indexOf("W"), 32);
assert.equal(cells.filter((v) => v === "3Q").length, 1);
assert.equal(cells.filter((v) => v === "0W").length, 3);

// Physical p32, selected by cell103 value32, has a 121-rune 11x11 text
// block; its source row/column prime sums match the signed 2016 tree
// image canvas (563x569). This is an arithmetic link, not a cipher inverse.
const firstRowPrimeSum = sum(p32.slice(0, 11));
const firstColumnPrimeSum = sum(Array.from({length: 11}, (_, i) => p32[11 * i]));
assert.equal(firstRowPrimeSum, 563);
assert.equal(firstColumnPrimeSum, 569);

// Original ciphertext contains one literal HOME 4-gram, at p32 offset33,
// which is a fragment inside a longer printed cipher word, not plaintext.
const homeKey = ["H", "O", "M", "E"].map(gp);
assert(same(p32.slice(33, 37), homeKey));
const homeHits = [];
for (const record of unsolved) {
  for (let i = 0; i + 4 <= record.indices.length; i++) {
    if (same(record.indices.slice(i, i + 4), homeKey)) {
      homeHits.push([record.page, i]);
    }
  }
}
assert.deepEqual(homeHits, [[32, 33]]);

/**
 * All legal key clocks for an authentic-p56-style transparent plaintext-F
 * additive cipher. A literal P=F gives C=F and does not advance the key.
 * C=F can ALSO be produced by an encrypted non-F and advance the key.
 *
 * @param {number[]} cipher Original GP29 ciphertext
 * @param {number} start First cipher index included in the test
 * @param {-1|1} sign Candidate decode direction P=C+sign*K
 * @returns {{ok:boolean,firstFail:number|null,clocks:number[]}}
 */
function allClocks(cipher, start, sign) {
  let clocks = new Set([0]);
  for (let i = start; i < cipher.length; i++) {
    const next = new Set();
    for (const k of clocks) {
      if (cipher[i] === 0) next.add(k);
      const p = mod29(cipher[i] + sign * homeKey[k % homeKey.length]);
      if (p !== 0) next.add(k + 1);
    }
    if (!next.size) return {ok: false, firstFail: i, clocks: [...clocks]};
    clocks = next;
  }
  return {ok: true, firstFail: null, clocks: [...clocks]};
}

/**
 * Construct positive GP29 ciphertext with transparent plaintext-F.
 * @param {number[]} plain Real solved source GP runes
 * @param {-1|1} sign Decode sign
 * @returns {number[]} Reversibly encoded symbols
 */
function encryptTransparent(plain, sign) {
  let k = 0;
  return plain.map((v) => {
    if (v === 0) return 0;
    return mod29(v - sign * homeKey[(k++) % homeKey.length]);
  });
}

// Original solved-source positive: use genuine p57, both directions.
// Independently check all symbol-level forward equations and legal DP paths.
for (const sign of [-1, 1]) {
  const plain = p57.slice(0, 76);
  const cipher = encryptTransparent(plain, sign);
  let k = 0;
  for (let i = 0; i < plain.length; i++) {
    if (plain[i] === 0) {
      assert.equal(cipher[i], 0);
    } else {
      assert.equal(mod29(cipher[i] + sign * homeKey[k % 4]), plain[i]);
      k++;
    }
  }
  const decoded = allClocks(cipher, 0, sign);
  assert(decoded.ok);
  assert(decoded.clocks.includes(k));
}

// Actual p55, both viable physical readings (all76 vs 75 after p54 carry),
// both signs, all cipher-F ambiguity clocks, no fitted starting phase.
const originalGates = [];
for (const start of [0, 1]) {
  for (const sign of [-1, 1]) {
    const result = allClocks(p55, start, sign);
    assert.equal(result.ok, false);
    const expected = {
      "0,-1": 2,
      "0,1": 0,
      "1,-1": 60,
      "1,1": 3
    }[start + "," + sign];
    assert.equal(result.firstFail, expected);
    originalGates.push({
      start, decodeSign: sign, legalFullDecodes: 0,
      firstImpossibleOriginalRune: result.firstFail,
      cipherRuneAtFailure: corpus.translit[p55[result.firstFail]]
    });
  }
}
console.log(JSON.stringify({
  finding: "source-constrained navigation candidate; no plaintext recovered",
  terminalSixMatch: terminalMatches,
  footerPrimeWordSums: sums,
  pointer: {page: 27, runeOffset: 28,
    nextWholeWordGP: "AE.F", nextWordPrimeSum: 103,
    tablePositionOneBased: 103, token: cells[102], numericValue: 32,
    nextToken: cells[103], destinationPage: 32},
  target: {physicalPage: 32, runes: p32.length,
    rowPrimeSum: firstRowPrimeSum, columnPrimeSum: firstColumnPrimeSum,
    literalHOMEHits: homeHits},
  frozenDirectHOMEKey: {runeIndices: homeKey, source: "p32@33-36",
    decoder: "GP29 additive with authentic p56 plaintext-F skip",
    originalGates, solvedP57PositiveControl: "76/76 for both signs"},
  interpretation: "No original instruction authenticates the table-to-page hop or HOME key"
}, null, 2));
