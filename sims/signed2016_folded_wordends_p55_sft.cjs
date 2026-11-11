"use strict";
/**
 * Source-locked 2016 FOLD/END word-end route to the 43 original p55 interior
 * runes. Works on the authentic signed message, canonical LP2 transcript,
 * 2014-style GP prime sums, and original 32x8 page-50 numeric source.
 *
 * The centered END observation is postselected and exploratory. Exact
 * permutation probabilities are conditional, not discovery-adjusted.
 *
 * Run: node sims/signed2016_folded_wordends_p55_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const text = read("resources/lp2-transcription.txt").split("%");
const asc = read("resources/historical/cicada2016-4gq25-outguess.asc");
const MOD = 29;
const mod = (x) => ((x % MOD) + MOD) % MOD;
const gp = (indices) => indices.map((v) => corpus.translit[v]).join("");

assert.equal(text.length, 57);
assert.equal(corpus.pages.length, 58);
assert.equal(grid.bytes.length, 256);
const pageWords = Array.from({ length: 58 }, (_, p) => {
  if (p === 50) return [];
  return text[p > 50 ? p - 1 : p]
    .replace(/[\/\r\n]/g, "")
    .split(/[-.&$§,:!?]/u)
    .map((segment) => (segment.match(/[ᚠ-᛿]+/gu) || []).join(""))
    .filter(Boolean);
});
assert.equal(pageWords.reduce((n, page) => n + page.length, 0), 2973);

/** @param {string} word */
function encodeWord(word) {
  const source = word.toLowerCase().replace(/v/g, "u")
    .replace(/k/g, "c").replace(/z/g, "s");
  const alphabet = corpus.translit.map((token, index) =>
    ({ token: token.toLowerCase(), index }))
    .sort((a, b) => b.token.length - a.token.length);
  const result = [];
  for (let i = 0; i < source.length;) {
    const found = alphabet.find(({ token }) => source.startsWith(token, i));
    assert.ok(found, "Unencodable signed word: " + source.slice(i));
    result.push(found.index);
    i += found.token.length;
  }
  return result;
}
const signed = asc.slice(asc.indexOf("Hello."),
  asc.indexOf("-----BEGIN PGP SIGNATURE-----"));
const originalWords = signed.match(/(?<![A-Za-z0-9])[A-Za-z]+(?![A-Za-z0-9])/g) || [];
assert.equal(originalWords.length, 43);
const sourceRows = originalWords.map((word, index) => {
  const sum = encodeWord(word).reduce((a, v) => a + corpus.prime[v], 0);
  const page = sum % 58;
  const wordIndex = Math.floor(sum / 58);
  const runeWord = pageWords[page][wordIndex] || null;
  const token = page === 50 ? grid.pages.find(p => p.page === 50)
    .tokens[wordIndex] : null;
  const selected = runeWord ? [...runeWord].at(-1) : token?.at(-1);
  assert.ok(selected, "Missing page/word address " + page + ":" + wordIndex);
  const glyphIndex = runeWord ? corpus.runes.indexOf(selected)
    : corpus.translit.indexOf(selected);
  assert.ok(glyphIndex >= 0, "Non-GP terminal rune/digit: " + selected);
  return { word, index, sum, page, wordIndex, runeWord, token, glyphIndex };
});
assert.deepEqual(sourceRows.filter(row => row.runeWord === null)
  .map(row => [row.word, row.page, row.wordIndex, row.token]),
  [["lies", 50, 3, "3D"]]);
const selectedThe = sourceRows.filter(row => row.word.toLowerCase() === "the");
assert.equal(selectedThe.length, 6);
assert.ok(selectedThe.every(row => row.page === 14 && row.wordIndex === 1));
assert.deepEqual(sourceRows.filter(row => row.word.toLowerCase() === "their")
  .map(row => [row.page, row.wordIndex]), [[56, 1],[56, 1]]);
assert.equal(pageWords[14][1], "ᚠᚩᛚᛞ");
assert.equal(pageWords[56][1], "ᛟᛋᚱ");
const page56 = corpus.pages[56].indices;
const primeClock = [2, 3, 5, 7, 11];
const solvedEnd = page56.slice(2, 5).map((c, i) =>
  mod(c - primeClock[i + 2] + 1));
assert.deepEqual(solvedEnd, encodeWord("END"));

const terminal = sourceRows.map(row => row.glyphIndex);
assert.deepEqual(terminal,
  [7,23,21,23,4,14,26,23,19,7,2,3,23,3,13,3,27,23,14,4,24,3,
    23,26,20,4,24,27,23,10,8,20,7,11,16,5,14,26,0,12,7,27,19]);
assert.equal(terminal.length, 43);
const folded = terminal.map((v, i) =>
  i === 21 ? v : mod(v + terminal[42 - i]));
const half = folded.slice(0, 21);
assert.deepEqual(half.slice(9, 12), encodeWord("END"));

/**
 * Count exact favourable ordered samples of six positions from a fixed
 * multiset, constraining three symmetric sums in GF29. No Monte Carlo noise.
 * @param {number[]} multiset
 * @param {number[]} targets
 */
function exactPairProbability(multiset, targets) {
  const counts = Array(29).fill(0);
  for (const v of multiset) counts[v]++;
  /** @param {number} step */
  function favourable(step) {
    if (step === targets.length) return 1n;
    let answer = 0n;
    for (let x = 0; x < 29; x++) {
      if (counts[x] === 0) continue;
      const y = mod(targets[step] - x);
      const nx = counts[x]--;
      const ny = counts[y];
      if (ny > 0) {
        counts[y]--;
        answer += BigInt(nx * ny) * favourable(step + 1);
        counts[y]++;
      }
      counts[x]++;
    }
    return answer;
  }
  const numerator = favourable(0);
  let denominator = 1n;
  for (let i = 0; i < targets.length * 2; i++)
    denominator *= BigInt(multiset.length - i);
  return { numerator: numerator.toString(),
    denominator: denominator.toString(),
    probability: Number(numerator) / Number(denominator) };
}
const matchedNull = exactPairProbability(terminal, encodeWord("END"));
assert.deepEqual([matchedNull.numerator, matchedNull.denominator],
  ["148000", "4389446880"]);

// The p55 one-rune incoming carry has no interior; strip first/last rune from
// each complete printed segment, keeping page/word carries correctly.
const segmentLengths = pageWords[55].map(word => [...word].length);
assert.deepEqual(segmentLengths,
  [1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]);
const interior = pageWords[55]
  .flatMap(word => [...word].slice(1, -1))
  .map(rune => corpus.runes.indexOf(rune));
assert.deepEqual(interior,
  [19,10,12,6,23,2,27,24,17,5,28,0,14,10,19,1,5,13,8,21,20,
    15,23,27,13,8,12,18,10,6,14,6,15,12,2,2,18,28,10,19,5,11,18]);
assert.equal(interior.length, 43);

/** @param {number[]} key @param {"subtract"|"add"|"beaufort"} mode */
function invert(key, mode) {
  const plain = interior.map((c, i) =>
    mod(mode === "subtract" ? c - key[i]
      : mode === "add" ? c + key[i] : key[i] - c));
  const recipher = plain.map((p, i) =>
    mod(mode === "subtract" ? p + key[i]
      : mode === "add" ? p - key[i] : key[i] - p));
  assert.deepEqual(recipher, interior);
  const freqs = Array(29).fill(0);
  plain.forEach(v => freqs[v]++);
  return { gp: gp(plain),
    ioc: freqs.reduce((a, n) => a + n * (n - 1), 0)
      / (plain.length * (plain.length - 1)) };
}
const originalInput = {};
for (const [name, key] of [["rawEnd", terminal],
  ["symmetricFold", folded]]) {
  originalInput[name] = {};
  for (const mode of ["subtract", "add", "beaufort"])
    originalInput[name][mode] = invert(key, mode);
}
const expectedRawMinus = "EOTLEOMBUUIAIAYYLWGIAWMDBAEEOFUOERBLTAEGSHUSYRTHIWIAPEA";
const expectedFoldMinus = "OEEPFMLTAEJTMGEOYEOFEOSOLTHEOCYHIMBOOEEOEOGDAEOWBGPGMNG";
assert.equal(originalInput.rawEnd.subtract.gp, expectedRawMinus);
assert.equal(originalInput.symmetricFold.subtract.gp, expectedFoldMinus);
console.log(JSON.stringify({
  status: "provisional centered-END source correspondence; negative direct p55 key trial",
  corpus: "56 unknown LP2 pages; 12956 GP29 runes",
  signedWords: sourceRows.length, keyGP: gp(terminal),
  foldGP: gp(half), retainedFoldCenter: corpus.translit[folded[21]],
  centralEND: { zeroBasedStart: 9, length: 3, sourceWordPairs:
    [[9,33],[10,32],[11,31]].map(([i,j]) =>
      [sourceRows[i].word, sourceRows[j].word]) },
  permutationNull: matchedNull,
  original43RuneP55Interior: gp(interior),
  originalInput,
  interpretation: "The centered END is exploratory and not a recovered unknown plaintext. " +
    "The exact multiset null does not correct for choosing reading rules or targets after inspection. " +
    "Both directly motivated reversible keys fail to recover readable p55 text."
}, null, 2));
