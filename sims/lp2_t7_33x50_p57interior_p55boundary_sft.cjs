"use strict";

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources", "liber-primus", "lp2-corpus.json"), "utf8"
));
const transcription = fs.readFileSync(
  path.join(ROOT, "resources", "liber-primus", "lp2-transcription.txt"), "utf8"
);
const wordFreq = fs.readFileSync(
  path.join(ROOT, "resources", "control", "english_wordfreq_textblob.txt"), "utf8"
);

const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const latin = corpus.translit;

function glyphWords(pageIndex) {
  const fragment = transcription.split("%")[pageIndex] || "";
  const words = fragment.replace(/\/\s*/gu, "").match(/[\u16A0-\u16FF]+/gu) || [];
  return words.map(word => [...word].map(r => runeIndex.get(r)).filter(Number.isInteger));
}

// The p57 Parable has 19 body words / 88 runes; shedding both word
// endpoints leaves 50 interior runes.
// The p55 page contributes 33 boundary runes under the source-frozen
// cross-page word treatment (the leading one-rune fragment is the final
// rune of the incoming word).
const p55Words = glyphWords(54);
const p57BodyWords = glyphWords(56).slice(1);
const p57Interior = p57BodyWords.flatMap(w => w.length > 2 ? w.slice(1, -1) : []);
const p55Boundary = p55Words.flatMap(w => w.length === 1 ? [w[0]] : [w[0], w[w.length - 1]]);

if (p57BodyWords.length !== 19) throw new Error("p57 body word count");
if (p57BodyWords.flat().length !== 88) throw new Error("p57 body rune count");
if (p57Interior.length !== 50) throw new Error("p57 interior count");
if (p55Words.flat().length !== 76) throw new Error("p55 rune count");
if (p55Boundary.length !== 33) throw new Error("p55 boundary count");

const stream = corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
if (stream.length !== 12956) throw new Error("LP2 length");
const target = stream.slice(2739, 4389);
if (target.length !== 1650) throw new Error("50x33 window length");
const repeats = [];
for (let i = 1; i < target.length; i++) {
  if (target[i] === target[i - 1]) repeats.push(2739 + i);
}
if (repeats.join(',') !== '2740,3140,3852') {
  throw new Error('original interval repeat inventory mismatch');
}

const primes = corpus.prime;
const reps = {
  raw: [p57Interior, p55Boundary],
  primeMod29: [
    p57Interior.map(x => primes[x] % 29),
    p55Boundary.map(x => primes[x] % 29)
  ],
  phiMod29: [
    p57Interior.map(x => (primes[x] - 1) % 29),
    p55Boundary.map(x => (primes[x] - 1) % 29)
  ]
};

const tri = new Map();
const ctx = new Map();
for (const line of wordFreq.match(/^[a-z]+\s+\d+$/gm) || []) {
  const [word0, count0] = line.split(/\s+/u);
  const word = word0.toUpperCase();
  const count = Number(count0);
  for (let i = 0; i + 2 < word.length; i++) {
    const t = word.slice(i, i + 3);
    const b = word.slice(i, i + 2);
    tri.set(t, (tri.get(t) || 0) + count);
    ctx.set(b, (ctx.get(b) || 0) + count);
  }
}

function charScore(indices) {
  let text = "";
  for (const x of indices) text += latin[x];
  let score = 0;
  let n = 0;
  for (let i = 0; i + 2 < text.length; i++) {
    const b = text.slice(i, i + 2);
    const t = text.slice(i, i + 3);
    score += Math.log(((tri.get(t) || 0) + 0.1) / ((ctx.get(b) || 0) + 2.6));
    n++;
  }
  return n ? score / n : null;
}

function ioc(indices) {
  const counts = new Array(29).fill(0);
  for (const x of indices) counts[x]++;
  return counts.reduce((s, n) => s + n * (n - 1), 0) /
    (indices.length * (indices.length - 1));
}

function decode(rowKey, colKey, sign, reverseRows, reverseCols) {
  const rows = reverseRows ? [...rowKey].reverse() : rowKey;
  const cols = reverseCols ? [...colKey].reverse() : colKey;
  const out = new Array(target.length);
  for (let i = 0; i < target.length; i++) {
    const r = Math.floor(i / 33);
    const c = i % 33;
    out[i] = ((target[i] + sign * (rows[r] + cols[c])) % 29 + 29) % 29;
  }
  return out;
}

function bestFor(rowKey, colKey) {
  let best = null;
  for (const sign of [-1, 1]) {
    for (const reverseRows of [false, true]) {
      for (const reverseCols of [false, true]) {
        const decoded = decode(rowKey, colKey, sign, reverseRows, reverseCols);
        const candidate = {
          sign, reverseRows, reverseCols,
          ioc: ioc(decoded),
          charScore: charScore(decoded)
        };
        if (!best || candidate.charScore > best.charScore) best = candidate;
      }
    }
  }
  return best;
}

const results = [];
for (const [representation, [rows, cols]] of Object.entries(reps)) {
  results.push({ representation, ...bestFor(rows, cols) });
}
results.sort((a, b) => b.charScore - a.charScore);

const rawScore = charScore(target);
// Deterministic matched null; prior unseeded results were not repeatable.
let rngState = 0x3301;
function uniform() {
  rngState = (Math.imul(rngState, 1664525) + 1013904223) >>> 0;
  return rngState / 4294967296;
}
const randomBest = [];
for (let draw = 0; draw < 500; draw++) {
  const rows = Array.from({length: 50}, () => Math.floor(uniform() * 29));
  const cols = Array.from({length: 33}, () => Math.floor(uniform() * 29));
  randomBest.push(bestFor(rows, cols).charScore);
}
randomBest.sort((a, b) => a - b);
const targetScore = results[0].charScore;
const ge = randomBest.filter(x => x >= targetScore).length;

console.log(JSON.stringify({
  interval: {start: 2739, endInclusive: 4388, length: 1650, shape: [50, 33], internalAdjacentEquals: repeats},
  source_lengths: {p57Interior: 50, p55Boundary: 33},
  raw: {ioc: ioc(target), charScore: rawScore},
  results,
  random_control: {
    draws: randomBest.length,
    p50: randomBest[249],
    p90: randomBest[449],
    p95: randomBest[474],
    p99: randomBest[494],
    max: randomBest[499],
    exceedance: (ge + 1) / (randomBest.length + 1)
  }
}, null, 2));
