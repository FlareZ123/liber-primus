"use strict";

/**
 * Source-selected lag-five S-echo word interiors as a 75-rune p55 pad.
 * Single-file test: node sims/lp2_s5_shed75_terminal_pad_sft.cjs
 * Reads the unmodified checked-in original LP2 corpus and typography.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const transcript = fs.readFileSync(
  path.join(root, "resources", "liber-primus", "lp2-transcription.txt"), "utf8");
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const S = corpus.runes[15];
const words = [];
let current = "";
let firstPage = 0;
let runePage = 0;

function completeWord() {
  if (current) {
    words.push({ text: current, startPage: firstPage });
    current = "";
  }
}

for (const ch of transcript.split("%").slice(0, 55).join("%")) {
  if (/[\u16A0-\u16FF]/u.test(ch)) {
    if (!current) firstPage = runePage;
    current += ch;
  } else if (ch === "%") {
    runePage++;
  } else if (ch === "/" || /\s/u.test(ch)) {
    // Typographic line/page wraps are not word boundaries.
  } else {
    completeWord();
  }
}
completeWord();

const wordRuneCount = words.reduce((n, w) => n + [...w.text].length, 0);
assert.equal(words.length, 2896);
assert.equal(wordRuneCount, 12956);

const marked = words.filter(({text}) =>
  [...text].some((r, i, arr) => i >= 5 && r === S && arr[i - 5] === S));
const lengths = marked.map(({text}) => [...text].length);
assert.equal(marked.length, 11);
assert.deepEqual(lengths, [8, 10, 12, 8, 12, 10, 6, 10, 8, 6, 7]);
assert.equal(lengths.reduce((a, b) => a + b, 0), 97);
assert.deepEqual(marked.map(({startPage}) => startPage >= 50 ?
  startPage + 1 : startPage), [1, 6, 9, 20, 38, 39, 41, 47, 51, 52, 55]);

const key = marked.flatMap(({text}) =>
  [...text].slice(1, -1).map(r => runeIndex.get(r)));
assert.equal(key.length, 75);
assert(key.every(n => Number.isInteger(n) && n >= 0 && n <= 28));
const C = corpus.pages[55].indices.slice(1);
assert.equal(corpus.pages[55].indices.length, 76);
assert.equal(C.length, 75);
const mod = x => ((x % 29) + 29) % 29;
const ioc = arr => {
  const counts = Array(29).fill(0);
  for (const n of arr) counts[n]++;
  return counts.reduce((n, f) => n + f * (f - 1), 0) /
    (arr.length * (arr.length - 1));
};
const direct = {};
for (const sign of [-1, 1]) {
  const P = C.map((c, i) => mod(c + sign * key[i]));
  assert.deepEqual(P.map((p, i) => mod(p - sign * key[i])), C);
  direct[sign] = { ioc: ioc(P), opening: P.slice(0, 40)
    .map(n => corpus.translit[n]).join(" ") };
}
assert(Math.abs(direct[-1].ioc - 0.036756756756756756) < 1e-12);
assert(Math.abs(direct[1].ioc - 0.03495495495495495) < 1e-12);

// Exact forward-valid plaintext-F bypass, the historical Cicada rule.
const zeroAt = C.flatMap((c, i) => c === 0 ? [i] : []);
assert.deepEqual(zeroAt, [14, 24, 40]);
const surviving = [];
for (const sign of [-1, 1]) {
  for (let mask = 0; mask < 2 ** zeroAt.length; mask++) {
    const P = [];
    let k = 0;
    let valid = true;
    for (let i = 0; i < C.length; i++) {
      const zeroOrdinal = zeroAt.indexOf(i);
      if (zeroOrdinal >= 0 && ((mask >>> zeroOrdinal) & 1)) {
        P.push(0);
        continue; // Literal plaintext-F, no key advance.
      }
      const p = mod(C[i] + sign * key[k++]);
      if (p === 0) {
        valid = false; // A consumed F is forbidden by the forward cipher.
        break;
      }
      P.push(p);
    }
    if (valid) {
      const replay = [];
      let k2 = 0;
      for (const p of P) replay.push(p === 0 ? 0 : mod(p - sign * key[k2++]));
      assert.deepEqual(replay, C);
      surviving.push({sign, mask, consumed: k, ioc: ioc(P),
        opening: P.slice(0, 40).map(n => corpus.translit[n]).join(" ")});
    }
  }
}
assert.equal(surviving.length, 1);
assert.equal(surviving[0].sign, 1);
assert.equal(surviving[0].mask, 7);
assert.equal(surviving[0].consumed, 72);
assert(Math.abs(surviving[0].ioc - 0.034594594594594595) < 1e-12);

// The same 97 marked runes with only the global ends removed supply 95,
// the solved p57 length. A fixed value substitution cannot explain its text.
const allMarked = [...marked.map(m => m.text).join("")];
const globalInside = allMarked.slice(1, -1).map(r => runeIndex.get(r));
const actual57 = corpus.pages[57].indices;
assert.equal(globalInside.length, 95);
assert.equal(actual57.length, 95);
const map = new Map();
let fixedSubstitutionContradictions = 0;
for (let i = 0; i < 95; i++) {
  if (!map.has(globalInside[i])) map.set(globalInside[i], actual57[i]);
  else if (map.get(globalInside[i]) !== actual57[i])
    fixedSubstitutionContradictions++;
}
assert.equal(fixedSubstitutionContradictions, 67);

// Independent native solved-source plant for the 75-cell direct inverse.
const plantPlain = actual57.slice(0, 75);
for (const sign of [-1, 1]) {
  const plantCipher = plantPlain.map((p, i) => mod(p - sign * key[i]));
  assert.deepEqual(plantCipher.map((c, i) => mod(c + sign * key[i])),
    plantPlain);
}

console.log(JSON.stringify({
  status: "SFT PASS: no source-original plaintext recovered",
  selectedPhysicalPages: marked.map(m => m.startPage >= 50 ?
    m.startPage + 1 : m.startPage),
  wordLengths: lengths,
  selectedRunes: allMarked.length,
  strippedWordInteriors: key.length,
  terminalPageBodyRunes: C.length,
  sourceDirect: direct,
  strictFChoices: 2 * (2 ** zeroAt.length),
  strictFValid: surviving,
  p57GlobalEndTrimmed: globalInside.length,
  p57FixedSubstitutionContradictions: fixedSubstitutionContradictions
}, null, 2));
