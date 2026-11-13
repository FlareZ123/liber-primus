"use strict";
/**
 * Signed 2016 message acrostics as a deterministic direct GP29 key on the
 * 43 strict interiors of physical LP2 p55. No tuning to ciphertext.
 * Run from repository root with Node.js 22:
 *   node sims/lp2_signed2016_acrostic_p55_core_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} file */
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const asc = read("resources/historical/cicada2016-4gq25-outguess.asc");
const body = asc.slice(asc.indexOf("Hello."),
  asc.indexOf("-----BEGIN PGP SIGNATURE-----"));
const sourceWords = body.match(/(?<![A-Za-z0-9])[A-Za-z]+(?![A-Za-z0-9])/g) || [];
assert.equal(sourceWords.length, 43);
const tokens = corpus.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);
/** GP-normalize words according to the canonical Cicada alphabet.
 * @param {string} source
 * @returns {number[]}
 */
function gpEncode(source) {
  const s = source.toUpperCase().replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const output = [];
  for (const word of s.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      const token = tokens.find(t => word.startsWith(t.s, i));
      assert.ok(token);
      output.push(token.i);
      i += token.s.length;
    }
  }
  return output;
}
const transcript = read("resources/lp2-transcription.txt");
const pageWords = transcript.split("%")[54].replace(/\/\s*/g, "")
  .match(/[\u16A0-\u16FF]+/gu) || [];
const c = corpus.pages[55].indices;
const positions = [];
let at = 0;
for (const word of pageWords) {
  const chars = [...word];
  for (let i = 1; i < chars.length - 1; i++) positions.push(at + i);
  at += chars.length;
}
assert.deepEqual([at, c.length, positions.length], [76, 76, 43]);
const original = positions.map(i => c[i]);
const firstGp = sourceWords.map(w => gpEncode(w)[0]);
const lastGp = sourceWords.map(w => gpEncode(w).at(-1));
const firstLatin = sourceWords.map(w => w.toUpperCase().charCodeAt(0) - 65);
const lastLatin = sourceWords.map(w => w.toUpperCase().charCodeAt(w.length - 1) - 65);
const keys = [
  ["first-GP", firstGp], ["last-GP", lastGp],
  ["first-Latin", firstLatin], ["last-Latin", lastLatin]
];
assert(keys.every(([, k]) => k.length === 43 && k.every(x => x >= 0 && x < 29)));
/** @param {number[]} symbols @param {number[]} key @param {-1|1} sign */
function decrypt(symbols, key, sign) {
  return symbols.map((x, i) => (x + sign * key[i] + 29) % 29);
}
const training = gpEncode(read("resources/control/shakespeare_first300k.txt")
  .slice(0, 240000));
const heldout = gpEncode(read("resources/control/gibran_prophet_58585.txt"));
assert.equal(heldout.length, 63114);
const logTrigram = new Float64Array(29 ** 3).fill(1);
for (let i = 2; i < training.length; i++)
  logTrigram[training[i - 2] * 29 ** 2 +
    training[i - 1] * 29 + training[i]]++;
const count = logTrigram.reduce((a, b) => a + b, 0);
for (let i = 0; i < logTrigram.length; i++)
  logTrigram[i] = Math.log(logTrigram[i] / count);
/** @param {number[]} symbols */
function score(symbols) {
  let result = 0;
  for (let i = 2; i < symbols.length; i++)
    result += logTrigram[symbols[i - 2] * 29 ** 2 +
      symbols[i - 1] * 29 + symbols[i]];
  return result / (symbols.length - 2);
}
let minGibran = Infinity;
for (let i = 0; i + 43 <= heldout.length; i++)
  minGibran = Math.min(minGibran, score(heldout.slice(i, i + 43)));
assert.equal(heldout.length - 43 + 1, 63072);
const trials = [];
for (const [name, key] of keys) {
  for (const sign of [-1, 1]) {
    const plain = decrypt(original, key, sign);
    const value = score(plain);
    trials.push({
      key: name, sign, score: value,
      latin: plain.map(i => corpus.translit[i]).join("")
    });
    // This is a true reversible 43-rune key candidate on an independent
    // GP source and can recognize its own planted plaintext.
    const plantPlain = heldout.slice(2500, 2543);
    const plantCipher = decrypt(plantPlain, key, -sign);
    assert.deepEqual(decrypt(plantCipher, key, sign), plantPlain);
  }
}
// The independently marked p27 black body is exactly 215=5*43 runes.
// Reuse the SAME signed 43-word key five times; no fitted offset or reset.
const body27 = corpus.pages[27].indices.slice(19);
assert.deepEqual([corpus.pages[27].indices.length, body27.length], [234, 215]);
let minGibran215 = Infinity;
for (let i = 0; i + 215 <= heldout.length; i++)
  minGibran215 = Math.min(minGibran215,
    score(heldout.slice(i, i + 215)));
assert.equal(heldout.length - 215 + 1, 62900);
const trials27 = [];
for (const [name, key] of keys) {
  for (const sign of [-1, 1]) {
    const p = body27.map((v, i) => (v + sign * key[i % 43] + 29) % 29);
    trials27.push({key: name, sign, score: score(p),
      first80: p.slice(0, 80).map(i => corpus.translit[i]).join("")});
    // Positive plant under the exact fivefold source-key register.
    const source = heldout.slice(4000, 4215);
    const cipher = source.map((v, i) =>
      (v - sign * key[i % 43] + 29) % 29);
    const decoded = cipher.map((v, i) =>
      (v + sign * key[i % 43] + 29) % 29);
    assert.deepEqual(decoded, source);
  }
}
trials27.sort((a, b) => b.score - a.score);
assert.ok(trials27.every(t => t.score < minGibran215));
assert.ok(Math.abs(trials27[0].score + 11.411810628340199) < 1e-10);
trials.sort((a, b) => b.score - a.score);
assert.ok(trials.every(x => x.score < minGibran));
assert.ok(Math.abs(trials[0].score + 11.144918487610301) < 1e-10);
returnReport();
function returnReport() {
  const result = {
    page: 55, sourceWords: 43, originalRunes: 76, testedInteriors: 43,
    heldoutGibranWindows: 63072,
    rawTrigram: score(original), heldoutMinimum: minGibran,
    best: trials[0], eightOriginalTrials: trials,
    p27Body: 215, p27Raw: score(body27), p27GibranMinimum: minGibran215,
    p27Best: trials27[0], p27EightTrials: trials27,
    decision: "Eight direct initial/final-letter keys recover no native-GP prose on p55/43 or p27/215; source semantics remain open"
  };
  if (require.main === module) console.log(JSON.stringify(result, null, 2));
  module.exports = {run: () => result};
}
