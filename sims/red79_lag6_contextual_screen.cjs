"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");
const {words} = require("./outer_permutation_word_context.cjs");
const {train, decode} = require("./lag6_repair_contextual_inverse.cjs");

const root = path.join(__dirname, "..");
const readJson = f => JSON.parse(fs.readFileSync(path.join(root, f), "utf8"));
const corpus = readJson("resources/liber-primus/lp2-corpus.json");
const ink = readJson("resources/liber-primus/lp2-ink-annotations.json");
const parsed = parseSharedCorpus(), N = parsed.runeCount, M = 29;
const mod = (x, m = M) => ((x % m) + m) % m;
assert.equal(parsed.words.length, 2896);
assert.equal(N, 12956);
assert.equal(N, 164 * 79);

const redPages = [15, 40, 53];
const redKey = redPages.flatMap(p => {
  const a = ink.pages.find(x => x.page === p);
  const page = corpus.pages.find(x => x.page === p);
  assert(a && page);
  return a.red_spans.flatMap(s => page.indices.slice(s.start, s.start + s.length));
});
assert.equal(redKey.length, 79);

const ambiguous = [];
let globalOffset = 0;
for (const word of parsed.words) {
  for (let j = 6; j < word.length; j++) {
    const observed = word[j], previous = word[j - 1];
    if (observed === mod(24 - 2 * word[j - 6]) && observed !== previous)
      ambiguous.push({index: globalOffset + j, observed, previous});
  }
  globalOffset += word.length;
}
assert.equal(globalOffset, N);
assert.equal(ambiguous.length, 79);

function applyT(x, n) { for (let i = 0; i < n; i++) x = mod(24 - 2 * x); return x; }
let bestAlignment = null;
for (const reverse of [false, true]) {
  const k = reverse ? [...redKey].reverse() : redKey;
  for (let rotation = 0; rotation < 28; rotation++) {
    let observed = 0, previous = 0, either = 0;
    for (let i = 0; i < 79; i++) {
      const v = applyT(k[i], rotation), e = ambiguous[i];
      observed += Number(v === e.observed);
      previous += Number(v === e.previous);
      either += Number(v === e.observed || v === e.previous);
    }
    const candidate = {reverse, rotation, observed, previous, either};
    if (!bestAlignment || either > bestAlignment.either) bestAlignment = candidate;
  }
}
function powMod(a, e, m) {
  let r = 1;
  while (e > 0) { if (e % 2) r = r * a % m; a = a * a % m; e = Math.floor(e / 2); }
  return r;
}
const raw = fs.readFileSync(path.join(root, "resources/control/shakespeare_first300k.txt"), "utf8");
assert.equal(raw.length, 300000);
const model = train(words(raw.slice(0, 200000)));
function ioc(xs) {
  const f = Array(M).fill(0);
  for (const x of xs) f[x]++;
  return f.reduce((s, n) => s + n * (n - 1), 0) / (xs.length * (xs.length - 1));
}
function summarize(name, pad) {
  const decoded = decode(parsed.words, pad, model, 0.95);
  const sequence = decoded.flatMap(x => x.sequence);
  assert.equal(sequence.length, N);
  return {
    name,
    totalLogPosterior: decoded.reduce((s, x) => s + x.score, 0),
    lexicalWords: decoded.filter(x => x.origin === "lexicon").length,
    lexicalWordsLengthAtLeast5: decoded.filter((x, i) =>
      x.origin === "lexicon" && parsed.words[i].length >= 5).length,
    runeIoC: ioc(sequence),
    sample: decoded.slice(0, 70).map(x =>
      x.sequence.map(v => corpus.translit[v]).join("")).join(" ")
  };
}
const results = [];
for (const sign of [1, -1]) for (const reverse of [false, true]) {
  const pad = Array.from({length: N}, (_, i) =>
    mod(sign * redKey[reverse ? 78 - i % 79 : i % 79]));
  results.push(summarize("red79-index-" + sign + "-" + reverse, pad));
}
for (const sign of [1, -1]) {
  const pad = Array.from({length: N}, (_, i) =>
    mod(sign * (powMod(53, mod(15 + i, 78), 79) % M)));
  results.push(summarize("F79-53-phase15-" + sign, pad));
}
console.log(JSON.stringify({
  classification: "bounded original-cipher source-key screen; not a decryption",
  input: {words: parsed.words.length, runes: N},
  sourceClues: {
    redPages,
    redSpanLengths: redPages.map(p =>
      ink.pages.find(x => x.page === p).red_spans.reduce((s, x) => s + x.length, 0)),
    redKeyLength: redKey.length,
    ambiguousWordLocalT6Sites: ambiguous.length,
    T: "T(x)=24-2x mod29",
    F79Pad: "53^(15+i mod78) mod79, reduced mod29"
  },
  redKeyEventAlignment: {
    directForwardMatches: redKey.filter((v, i) =>
      v === ambiguous[i].observed || v === ambiguous[i].previous).length,
    bestAcrossForwardReverseAndTrotations: bestAlignment
  },
  contextualInverse: {training: "first 200,000 Shakespeare characters", mixture: 0.95, candidates: results}
}, null, 2));
