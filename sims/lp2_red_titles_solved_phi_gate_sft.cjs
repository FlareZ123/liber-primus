"use strict";

/**
 * Apply the authenticated LP2 p56 prime-totient operation to the separately
 * image-selected unknown red headings. No guessed word, key or language fit.
 *
 * Read-only single-file test: node sims/lp2_red_titles_solved_phi_gate_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..", "resources", "liber-primus");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "lp2-corpus.json"), "utf8"));
const ink = JSON.parse(fs.readFileSync(path.join(root, "lp2-ink-annotations.json"), "utf8"));

/** @param {number} len @returns {number[]} */
function firstPrimes(len) {
  const out = [];
  for (let i = 2; out.length < len; i++) {
    if (out.every((p) => i % p !== 0)) out.push(i);
  }
  return out;
}
const primes = firstPrimes(250);
const mod29 = (x) => (x % 29 + 29) % 29;
/** @param {number[]} values */
const latin = (values) => values.map((v) => corpus.translit[v]).join("");
/** @param {number[]} cipher */
const phi = (cipher) => cipher.map((x, i) => mod29(x - (primes[i] - 1)));
/** @param {number[]} arr */
function ioc(arr) {
  const counts = Array(29).fill(0);
  for (const v of arr) counts[v]++;
  return counts.reduce((a, n) => a + n * (n - 1), 0) / (arr.length * (arr.length - 1));
}

const solved = corpus.pages.find((p) => p.page === 56).indices.slice(0, 5);
assert.equal(latin(phi(solved)), "ANEND");

const redPages = ink.pages.filter((p) => p.page < 56 &&
  (p.red_spans || []).some((s) => s.start === 0));
assert.deepEqual(redPages.map((p) => p.page), [0, 3, 8, 15, 23, 27, 33, 40, 54]);
const expected = [
  "XGXYAEWJJOEIABXD", "MNHTHJOESIAOEOSWYOPEA",
  "PHIPLTHOTNXTHI", "EAEATPXTIRTH",
  "FOEOSAETHWBBENCCROEO", "EJOEXCLHWSNGBCEAGOYSOC",
  "OEIIEAMIAHESW", "EAWSLAEJNM", "DBBBBMIANGY"
];
const headings = redPages.map((p, i) => {
  const length = p.red_spans.find((s) => s.start === 0).length;
  const cipher = corpus.pages.find((pg) => pg.page === p.page).indices.slice(0, length);
  const text = latin(phi(cipher));
  assert.equal(text, expected[i]);
  return {page: p.page, length, decoded: text};
});

const allRed = ink.pages.filter((p) => p.page < 56)
  .flatMap((p) => (p.red_spans || []).map((s) =>
    corpus.pages.find((pg) => pg.page === p.page).indices.slice(s.start, s.start + s.length)))
  .flat();
assert.equal(allRed.length, 213);
const global = phi(allRed);
assert(Math.abs(ioc(allRed) - 0.03383824962352733) < 1e-14);
assert(Math.abs(ioc(global) - 0.03343963149968996) < 1e-14);
console.log(JSON.stringify({
  solvedControl: "ANEND", headings,
  unknownRedRunes: allRed.length,
  unknownRedIoc: ioc(allRed),
  globallyDecryptedIoc: ioc(global),
  globallyDecryptedPrefix: latin(global.slice(0, 80))
}, null, 2));
