"use strict";

/**
 * LP2 p55 moth-linked p5 suffix, source-native direct running-key challenge.
 * Test whether the full 30-rune additive/Beaufort pad required by the
 * provisional LP1-p5 plaintext is an EXACT unbroken GP29 text substring
 * of independently existing Cicada and historical text sources.
 *
 * Because source text may be read forward/backward or with original LP1
 * Atbash, freeze exactly four static key-register conventions. This tests
 * source text as a contiguous running key, not wordwise skips or a KDF.
 *
 * SFT: node sims/lp2_p55_moth_runningkey_source_sft.cjs
 * Node.js 22 CommonJS, no external packages, zero file writes.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8")
    .replace(/\r\n/g, "\n");
}

const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const map = gp.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);
const mod29 = x => ((x % 29) + 29) % 29;
const expectedCipher = [
  12, 18, 28, 18, 10, 6, 14, 6, 15, 18, 15, 12, 2, 2, 18,
  15, 2, 22, 5, 28, 10, 19, 5, 14, 23, 11, 1, 17, 18, 10
];
const sourceCipher = gp.pages.find(p => p.page === 55).indices.slice(46);
assert.deepEqual(sourceCipher, expectedCipher);

const sourcePhrase = [
  ["TH", "E"], ["T", "O", "T", "I", "E", "N", "T"],
  ["F", "U", "N", "C", "T", "IA", "N"], ["I", "S"],
  ["S", "A", "C", "R", "E", "D"], ["A", "L", "L"], ["TH", "NG", "S"]
];
assert.deepEqual(sourcePhrase.map(w => w.length), [2, 7, 7, 2, 6, 3, 3]);
const candidatePlain = sourcePhrase.flat().map(r => gp.translit.indexOf(r));
assert(candidatePlain.every(x => x >= 0));
assert.equal(candidatePlain.length, 30);
const required = [
  sourceCipher.map((v, i) => mod29(v - candidatePlain[i])),
  sourceCipher.map((v, i) => mod29(v + candidatePlain[i]))
];

/**
 * Source-normalized GP29 spellings independently calibrated by solved LP1:
 * ING -> NG, IO -> IA, and other canonical two-rune transliterations.
 * This is a single documented spelling convention, not an adjustable key.
 * @param {string} input
 * @returns {number[]}
 */
function encodeSourceNativeGP(input) {
  const plain = (input.match(/[A-Za-z]+/g) || []).join("")
    .toUpperCase().replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < plain.length;) {
    if (plain.startsWith("ING", i)) {
      out.push(21);
      i += 3;
    } else if (plain.startsWith("IO", i)) {
      out.push(27);
      i += 2;
    } else {
      const t = map.find(x => plain.startsWith(x.s, i));
      assert(t, "source romanization missing " + plain[i]);
      out.push(t.i);
      i += t.s.length;
    }
  }
  return out;
}

/**
 * @param {number[]} key
 * @param {number[]} source
 * @returns {{length:number,sourceOffset:number,cribOffset:number}}
 */
function longestMatch(key, source) {
  let best = {length: 0, sourceOffset: -1, cribOffset: -1};
  for (let j = 0; j < source.length; j++) {
    for (let i = 0; i < key.length; i++) {
      let n = 0;
      while (i + n < key.length && j + n < source.length &&
        key[i + n] === source[j + n]) n++;
      if (n > best.length) best = {
        length: n, sourceOffset: j, cribOffset: i
      };
    }
  }
  return best;
}

/**
 * @param {string} file
 * @returns {number[]}
 */
function originalSource(file) {
  let s = read(file);
  if (file.endsWith(".asc")) {
    s = s.split("-----BEGIN PGP SIGNATURE-----")[0]
      .split("\n\n").slice(1).join("\n\n");
  }
  if (file.includes("/transcriptions/")) {
    const indexes = new Map(gp.runes.map((r, i) => [r, i]));
    return [...s].filter(ch => indexes.has(ch)).map(ch => indexes.get(ch));
  }
  return encodeSourceNativeGP(s);
}

const references = [
  ["resources/transcriptions/lp1_wulfic_canonical.txt", 2797, 4],
  ["resources/liber-primus/lp1-plaintext-reference.txt", 3863, 3],
  ["resources/external/2013-liber-al-bookcode-I.txt", 6834, 4],
  ["resources/external/2013-liber-al-bookcode-II.txt", 6942, 4],
  ["resources/external/2013-liber-al-bookcode-III.txt", 7381, 4],
  ["resources/external/cicada2012-blake-marriage-gutenberg45315.txt", 32960, 4],
  ["resources/historical/cicada2016-4gq25-outguess.asc", 177, 3],
  ["resources/cicada2014-may2-signed-message.asc", 83, 3],
  ["resources/control/shakespeare_first300k.txt", 215146, 4],
  ["resources/control/gibran_prophet_58585.txt", 61918, 4],
  ["resources/control/emerson_essays_2944.txt", 317604, 4]
];

let testedRunes = 0;
const results = [];
for (const [file, count, expectedMaximum] of references) {
  const original = originalSource(file);
  assert.equal(original.length, count, "fixture rune count " + file);
  let best = {length: 0};
  const variants = [
    ["direct", original],
    ["atbash", original.map(x => 28 - x)],
    ["reverse", [...original].reverse()],
    ["reverse-atbash", [...original].reverse().map(x => 28 - x)]
  ];
  for (const [reading, text] of variants) {
    for (let keyKind = 0; keyKind < required.length; keyKind++) {
      const match = longestMatch(required[keyKind], text);
      if (match.length > best.length) best = {
        ...match, reading, keyKind: keyKind ? "C+P" : "C-P"
      };
    }
  }
  assert.equal(best.length, expectedMaximum, file);
  assert(best.length < 5, "authentic plaintext pad candidate must be reviewed");
  testedRunes += original.length;
  results.push({file, originalRunes: original.length, best});
}
assert.equal(testedRunes, 655705);
const plant = originalSource(references[0][0]).slice(400, 430);
assert.equal(plant.length, 30);
const plantedCipher = candidatePlain.map((v, i) => mod29(v + plant[i]));
const recoveredRequiredKey = plantedCipher.map((v, i) =>
  mod29(v - candidatePlain[i]));
assert.deepEqual(recoveredRequiredKey, plant);
assert.equal(longestMatch(recoveredRequiredKey,
  originalSource(references[0][0])).length, 30);

console.log(JSON.stringify({
  status: "PASS: conditional original p55 moth-source running-key scan",
  originalSourceCipherRunes: sourceCipher.length,
  proposedOriginalLP1p5PlaintextRunes: candidatePlain.length,
  directSourceRunesInspected: testedRunes,
  sourceReadings: 4, additiveOrBeaufortSigns: 2,
  longestExactPadFragmentAcrossSources: Math.max(...results.map(r => r.best.length)),
  genuineOriginalSourcePositivePlant: "30/30 key positions detected",
  sourceTable: results,
  conclusion: "No complete or five-consecutive-rune native-GP running key recovered; no unknown plaintext verified"
}, null, 2));

module.exports = {encodeSourceNativeGP, longestMatch};
