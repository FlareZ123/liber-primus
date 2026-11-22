"use strict";

/**
 * Single-file source-frozen 43-word GP-length row readout gate.
 * Original p27 black body 215 -> hypothetical 5x43 rows. Each authentic
 * 2016 signed word's GP-rune length mod5 chooses a row for that column.
 * Reuse 43 output symbols as a direct additive key for p55 interiors.
 * Run from root: node sims/p27_2016_wordlength_row_gate_sft.cjs
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const root = path.resolve(__dirname, "..");
const read = rel => fs.readFileSync(path.join(root, rel), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const transcript = read("resources/lp2-transcription.txt");
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
const reference = read("resources/control/gibran_prophet_58585.txt");
const alphabet = corpus.translit.map((token, i) =>
  ({token: token.toLowerCase(), i}))
  .sort((a, b) => b.token.length - a.token.length);

/** @param {string} word @returns {number[]|null} */
function gp(word) {
  const s = word.toLowerCase().replace(/v/g, "u")
    .replace(/k/g, "c").replace(/z/g, "s");
  const out = [];
  for (let i = 0; i < s.length;) {
    const t = alphabet.find(x => s.startsWith(x.token, i));
    if (!t) return null;
    out.push(t.i);
    i += t.token.length;
  }
  return out;
}
const red = ink.pages.find(p => p.page === 27).red_spans[0].length;
assert.equal(red, 19);
const body = corpus.pages[27].indices.slice(red);
assert.equal(body.length, 215);
const rows = Array.from({length: 5}, (_, r) =>
  body.slice(r * 43, (r + 1) * 43));
const payload = signed.slice(signed.indexOf("Hello."),
  signed.indexOf("-----BEGIN PGP SIGNATURE-----"));
const signedWords = payload.match(/(?<![A-Za-z0-9])[A-Za-z]+(?![A-Za-z0-9])/g);
assert.equal(signedWords.length, 43);
const lens = signedWords.map(w => {
  const x = gp(w);
  assert.ok(x);
  return x.length;
});
const runeMap = new Map(corpus.runes.map((r, i) => [r, i]));
const printed = transcript.split("%")[54].replace(/[\/\r\n]/gu, "");
const interior = printed.split(/[-.&$§,:!?]/u)
  .map(w => (w.match(/[ᚠ-᛿]+/gu) ?? []).join(""))
  .filter(Boolean)
  .flatMap(w => [...w].slice(1, -1).map(r => runeMap.get(r)));
assert.equal(interior.length, 43);
const mod = n => ((n % 29) + 29) % 29;

/** @param {number[]} wordLengths @returns {number[][]} */
function outputs(wordLengths) {
  const key = wordLengths.map((len, c) => rows[len % 5][c]);
  return [key, key, key.slice().reverse(), key.slice().reverse()]
    .map((k, i) => interior.map((c, j) =>
      mod(c + (i % 2 ? -1 : 1) * k[j])));
}
/** @param {number[]} x @returns {number} */
function ioc(x) {
  const f = new Uint16Array(29);
  x.forEach(c => f[c]++);
  return [...f].reduce((sum, n) => sum + n * (n - 1), 0) /
    (x.length * (x.length - 1));
}
const trainingWords = (reference.match(/[A-Za-z]+/g) ?? [])
  .map(gp).filter(Boolean);
const counts = new Float64Array(29);
trainingWords.forEach(word => word.forEach(c => counts[c]++));
const total = [...counts].reduce((a, b) => a + b, 0);
assert.equal(total, 62914);
const logp = [...counts].map(n =>
  Math.log((n + 0.5) / (total + 29 * 0.5)));
const likelihood = x =>
  x.reduce((sum, c) => sum + logp[c], 0) / x.length;

const original = outputs(lens);
const observedIoC = original.map(ioc);
const observedLog = original.map(likelihood);
assert.ok(Math.abs(observedIoC[3] - 0.059800664451827246) < 1e-12);
assert.ok(Math.abs(observedLog[3] + 4.075728697939526) < 1e-9);
const maxIoC = Math.max(...observedIoC);
const maxLog = Math.max(...observedLog);
let state = 0x55884543;
/** @returns {number} */
function random() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return (state >>> 0) / 4294967296;
}
const trials = 30000;
let excessIoC = 0;
let excessLog = 0;
for (let t = 0; t < trials; t++) {
  const lengthPermutation = lens.slice();
  for (let i = lengthPermutation.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [lengthPermutation[i], lengthPermutation[j]] =
      [lengthPermutation[j], lengthPermutation[i]];
  }
  const candidates = outputs(lengthPermutation);
  if (Math.max(...candidates.map(ioc)) >= maxIoC) excessIoC++;
  if (Math.max(...candidates.map(likelihood)) >= maxLog) excessLog++;
}
assert.equal(excessIoC, 299);
assert.equal(excessLog, 20015);
console.log(JSON.stringify({
  status: "No readable GP plaintext or source-selected reversible key",
  sourceHypothesis: "2016 GP word lengths mod5 choose rows in p27 black 5x43",
  wordCount: signedWords.length,
  p55Interior: interior.length,
  variants: ["forward +", "forward -", "reverse +", "reverse -"],
  original: {ioc: observedIoC, nativeGpUnigramLog: observedLog,
    rawIoC: ioc(interior), rawNativeLog: likelihood(interior)},
  matchedNull: {seed: "0x55884543", trials, familywiseIoCExcesses: excessIoC,
    familywiseIoCTail: (excessIoC + 1) / (trials + 1),
    familywiseNativeLogExcesses: excessLog,
    familywiseNativeLogTail: (excessLog + 1) / (trials + 1)},
  interpretation: "The apparent 0.0598 IoC is driven partly by 5 EO " +
    "and 5 NG runes, rare under English GP. Native unigram likelihood " +
    "fails the matched-null gate despite the IoC."
}, null, 2));
