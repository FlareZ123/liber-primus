#!/usr/bin/env node
"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseLP2Words} = require("./lp2_word_pages.cjs");

const root = path.resolve(__dirname, "..");
const raw = fs.readFileSync(path.join(root, "resources", "liber-primus", "lp2-transcription.txt"), "utf8");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const prim = new Map(corpus.runes.map((r, i) => [r, corpus.prime[i]]));
const translit = new Map(corpus.runes.map((r, i) => [r, corpus.translit[i]]));

/** @param {string} runes */
function sum(runes) {
  return [...runes].reduce((total, rune) => total + prim.get(rune), 0);
}
/** @param {string} runes */
function latin(runes) {
  return [...runes].map(rune => translit.get(rune)).join("");
}
/** @param {number} index Rune-bearing transcription index, with runeless physical p50 omitted. */
function fragments(index) {
  const page = raw.split("%")[index];
  return page.replace(/\/\s*/gu, "").match(/[\u16A0-\u16FF]+/gu) || [];
}
/** @param {number} n */
function inverse(n) {
  for (let k = 1; k < 29; k++) {
    if (n * k % 29 === 1) return k;
  }
  throw Error("Expected a nonzero GF29 denominator");
}
/** @param {number | null} x Null denotes infinity. */
function m7(x) {
  if (x === null) return 14 * inverse(25) % 29;
  const denominator = (25 * x + 28) % 29;
  return denominator === 0 ? null : ((14 * x + 25) * inverse(denominator)) % 29;
}

const unsolved = parseLP2Words(raw, 55);
const complete = parseLP2Words(raw, 57);
const local = fragments(32);
assert.equal(unsolved.words.length, 2896);
assert.equal(local.length, 22);
assert.equal(local.reduce((n, w) => n + [...w].length, 0), 121);
assert.equal(unsolved.byContainedPage[32].length, 21);
const carry = unsolved.words.filter(w => w.startPage === 31 && w.endPage === 32);
assert.equal(carry.length, 1);
assert.equal(latin(carry[0].runes), "EAMOL");
assert.equal(sum(carry[0].runes), 260);
assert.equal(latin(local[0]), "L");
assert.equal(sum(local[0]), 73);

const localSums = local.map(sum);
assert.deepEqual(localSums, [
  73,125,267,613,191,184,14,540,458,535,183,442,
  196,497,160,446,98,203,96,348,160,216
]);
assert.equal(latin(local[11]), "WBSRXIAXA");
assert.equal(localSums[11] % 29, 7);
assert.equal(latin(local[5]), "IARTTHF");
assert.equal(localSums[5], 184);
const p55 = fragments(54);
assert.equal(p55.length, 17);
assert.deepEqual(p55.slice(9, 12).map(sum), [138,108,341]);
assert.equal(36 % 29, 7);
assert.equal(corpus.translit[7], "W");
const p57 = complete.byContainedPage[56];
assert.equal(p57.length, 20);
assert.equal(latin(p57[1].runes), "LICE");
assert.equal(sum(p57[1].runes), 184);

assert.equal(m7(7), null);
const orbit = [10];
for (let i = 0; i < 7; i++) orbit.push(m7(orbit.at(-1)));
assert.deepEqual(orbit, [10,8,2,7,null,11,16,10]);
const present = new Set(localSums.map(n => n % 29));
assert.deepEqual([2,8,16].filter(n => present.has(n)), []);
assert.ok(!present.has(m7(10)));
assert.ok(!present.has(16));
assert.equal(unsolved.words.filter(w => sum(w.runes) === 184).length, 10);
const pages184 = unsolved.byContainedPage.flatMap((ws, i) =>
  ws.some(w => sum(w.runes) === 184) ? [i >= 50 ? i + 1 : i] : []);
assert.deepEqual(pages184, [1,15,18,20,29,32,33,38,40,44]);

console.log(JSON.stringify({
  status: "PASS: p32 local-vs-canonical source correction; literal M7 word traversal blocked",
  canonicalUnknownWords: unsolved.words.length,
  page32LocalFragments: local.length,
  completePage32Words: unsolved.byContainedPage[32].length,
  crossPageWord: {translit:latin(carry[0].runes), primeSum:sum(carry[0].runes)},
  page32PrimeSums:localSums,
  page32Residues:localSums.map(n => n % 29),
  poleWord: {pageLocalOrdinal:12, wholePage32WordOrdinal:11, translit:latin(local[11]), primeSum:localSums[11]},
  likeAnchor: {pageLocalOrdinal:6, primeSum:localSums[5]},
  poleOrbit:orbit.map(x => x === null ? "infinity" : x),
  absentWordResidues:[2,8,16],
  pagesWithCanonicalSum184:pages184,
  conclusion:"Neither forward nor reverse M7 orbit gives a total p32 word-to-word path. No recovered key/plaintext."
}, null, 2));
