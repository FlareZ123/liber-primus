"use strict";
/**
 * Source-bound OUR OWN crib test for the repeated LP2 terminal two-word marker.
 * Native GP indices, exact page register, two natural additive orientations,
 * six-rune phase anchored at both occurrences. No key/phase/crib search.
 *
 * @module lp2_repeated_pair_our_own_crib_sft
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const file = path.join(__dirname, "..", "resources", "liber-primus", "lp2-corpus.json");
const corpus = JSON.parse(fs.readFileSync(file, "utf8"));
/** @param {number} page @returns {number[]} */
const indices = page => corpus.pages.find(record => record.page === page).indices;
/** @param {number} x @returns {number} */
const mod = x => ((x % 29) + 29) % 29;
/** @param {number[]} v @returns {string} */
const latin = v => v.map(i => corpus.translit[i]).join("");
/** @param {number[]} xs @returns {number} */
function ioc(xs) {
  const counts = Array(29).fill(0);
  for (const x of xs) counts[x]++;
  return counts.reduce((s, n) => s + n * (n - 1), 0) / (xs.length * (xs.length - 1));
}
/** @param {number[]} haystack @param {number[]} needle @returns {number[]} */
function occurrences(haystack, needle) {
  const hits = [];
  for (let i = 0; i <= haystack.length - needle.length; i++)
    if (needle.every((x, n) => haystack[i + n] === x)) hits.push(i);
  return hits;
}
function run() {
  const p27 = indices(27), p55 = indices(55), p57 = indices(57);
  assert.equal(p55.length, 76);
  // P57's literal solved OUR OWN = O U R / O W N; each is three GP runes.
  const crib = [3, 1, 4, 3, 7, 9];
  assert.equal(latin(crib), "OUROWN");
  assert.deepEqual(occurrences(p57, crib), [47]);
  const marker = p55.slice(-6);
  assert.deepEqual(marker, [23, 11, 1, 17, 18, 10]);
  assert.deepEqual(occurrences(p27, marker), [28]);
  assert.deepEqual(occurrences(p55, marker), [70]);
  const baseline = ioc(p57.slice(0, 76));
  const output = [];
  for (const orientation of ["C-P", "C+P"]) {
    const key = marker.map((c, i) =>
      mod(orientation === "C-P" ? c - crib[i] : c + crib[i]));
    const decode = (cipher, anchor) => cipher.map((c, i) => {
      const k = key[mod(i - anchor) % 6];
      return mod(orientation === "C-P" ? c - k : k - c);
    });
    const encode = (plain, anchor) => plain.map((p, i) => {
      const k = key[mod(i - anchor) % 6];
      return mod(orientation === "C-P" ? p + k : k - p);
    });
    const p55Plain = decode(p55, 70);
    const p27Plain = decode(p27, 28);
    assert.deepEqual(p55Plain.slice(-6), crib);
    assert.deepEqual(p27Plain.slice(28, 34), crib);
    assert.deepEqual(encode(p55Plain, 70), p55);
    assert.deepEqual(encode(p27Plain, 28), p27);
    const plant = p57.slice(0, 76);
    assert.deepEqual(decode(encode(plant, 70), 70), plant);
    const score55 = ioc(p55Plain), score27 = ioc(p27Plain);
    assert.ok(score55 < 0.04);
    assert.ok(score27 < 0.04);
    output.push({orientation, key, keyTransliteration: latin(key),
      p55IoC: score55, p27IoC: score27,
      p55Unspaced: latin(p55Plain),
      p27AnchorWindowUnspaced: latin(p27Plain.slice(15, 50))});
  }
  console.log(JSON.stringify({
    source: "LP2 physical p27 and p55; solved p57 OUR OWN at 47..52",
    marker: latin(marker), markerAtP27: 28, markerAtP55: 70,
    solvedP57First76IoC: baseline,
    p55OriginalIoC: ioc(p55), output,
    authenticPlaintextEstablished: false
  }, null, 2));
}
if (require.main === module) run();
module.exports = {run};
