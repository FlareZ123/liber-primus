"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");

const read = p => fs.readFileSync(p, "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const frequencyText = read("resources/control/english_wordfreq_textblob.txt");
const mod = n => ((n % 29) + 29) % 29;
const digits = "0123456789ABCDEFGHIJKLMNOPQRS";

function base29(n) {
  let out = "";
  while (n > 0) {
    out = digits[n % 29] + out;
    n = Math.floor(n / 29);
  }
  return out || "0";
}
assert.equal(base29(1033), "16I");
assert.equal(base29(3301), "3QO");

const keySpecs = [
  ["16I3QO", "16I3QO"],
  ["3QO16I", "3QO16I"],
  ["16I", "16I"],
  ["3QO", "3QO"]
];
const keys = keySpecs.map(([name, text]) => ({
  name,
  text,
  values: Array.from(text, ch => digits.indexOf(ch))
}));
assert.deepEqual(keys.map(k => k.values), [
  [1, 6, 18, 3, 26, 24],
  [3, 26, 24, 1, 6, 18],
  [1, 6, 18],
  [3, 26, 24]
]);

const chapter = corpus.pages.slice(33, 40).flatMap(p => p.indices);
assert.equal(chapter.length, 1680);
const pageLengths = corpus.pages.slice(0, 56).map(p => p.indices.length);
const chapterStart = pageLengths.slice(0, 33).reduce((a, b) => a + b, 0);
const chapterEnd = chapterStart + chapter.length;
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));

const words = [];
let active = [];
let activeStart = 0;
let runeOffset = 0;
function flushWord() {
  if (active.length) {
    words.push({ start: activeStart, end: runeOffset, indices: active });
    active = [];
  }
}
for (const ch of transcription) {
  const value = runeIndex.get(ch);
  if (value !== undefined) {
    if (!active.length) activeStart = runeOffset;
    active.push(value);
    runeOffset++;
  } else if (ch === "/" || ch === "%" || /\s/u.test(ch)) {
    // Line wrapping and page markers do not terminate a word.
  } else {
    flushWord();
  }
}
flushWord();

const chapterWords = words
  .filter(w => w.start >= chapterStart && w.end <= chapterEnd)
  .map(w => ({ ...w, start: w.start - chapterStart, end: w.end - chapterStart }));
assert.equal(chapterWords.length, 378);
const fCount = chapter.filter(x => x === 0).length;
assert.equal(fCount, 40);

const tokens = corpus.translit
  .map((token, index) => ({ token, index }))
  .sort((a, b) => b.token.length - a.token.length);

function encodeEnglishWord(word) {
  const normalized = word.toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/[KQ]/g, "C")
    .replace(/V/g, "U")
    .replace(/Z/g, "S")
    .replace(/ING/g, "NG")
    .replace(/IO/g, "IA");
  const out = [];
  for (let i = 0; i < normalized.length;) {
    const token = tokens.find(t => normalized.startsWith(t.token, i));
    if (!token) return null;
    out.push(token.index);
    i += token.token.length;
  }
  return out;
}

const lexicon = new Set();
const trie = { next: new Map(), terminal: false };
let maxWordRunes = 0;
for (const line of frequencyText.match(/^[a-z]+\s+\d+$/gm) || []) {
  const [word] = line.split(/\s+/);
  const encoded = encodeEnglishWord(word);
  if (!encoded) continue;
  lexicon.add(encoded.join(","));
  maxWordRunes = Math.max(maxWordRunes, encoded.length);
  let node = trie;
  for (const rune of encoded) {
    if (!node.next.has(rune)) node.next.set(rune, { next: new Map(), terminal: false });
    node = node.next.get(rune);
  }
  node.terminal = true;
}
assert.equal(lexicon.size, 29060);

function directRepeat(key, sign) {
  const plain = chapter.map((c, i) => mod(c - sign * key[i % key.length]));
  let known = 0;
  for (const word of chapterWords) {
    if (lexicon.has(plain.slice(word.start, word.end).join(","))) known++;
  }
  return {
    knownWords: known,
    totalWords: chapterWords.length,
    coverage: known / chapterWords.length,
    firstWords: chapterWords.slice(0, 20).map(w =>
      plain.slice(w.start, w.end).map(i => corpus.translit[i]).join("")
    )
  };
}

// Exact reachability under the solved-page F-transparent rule:
// plaintext F is passed through and does not consume a key symbol.
function fTransparentReachability(key, sign) {
  let states = new Set([0]);
  for (let i = 0; i < chapter.length; i++) {
    const next = new Set();
    for (const phase of states) {
      if (chapter[i] === 0) next.add(phase);
      const plain = mod(chapter[i] - sign * key[phase]);
      if (plain !== 0) next.add((phase + 1) % key.length);
    }
    if (!next.size) {
      const wordIndex = chapterWords.findIndex(w => i >= w.start && i < w.end);
      const word = chapterWords[wordIndex];
      return {
        possible: false,
        failedRuneOffset: i,
        failedCipherRune: corpus.translit[chapter[i]],
        failedWordIndex: wordIndex,
        failedWord: word ? word.indices.map(x => corpus.translit[x]).join("") : null,
        statesBefore: Array.from(states)
      };
    }
    states = next;
  }
  return { possible: true, finalStates: Array.from(states) };
}

function columnar(input, key, inverse) {
  const columns = key.length;
  const rows = input.length / columns;
  assert.equal(Number.isInteger(rows), true);
  const order = key.map((value, index) => ({ value, index }))
    .sort((a, b) => a.value - b.value || a.index - b.index)
    .map(x => x.index);
  if (inverse) {
    const out = [];
    for (const col of order) {
      for (let row = 0; row < rows; row++) out.push(input[row * columns + col]);
    }
    return { out, order };
  }
  const colData = new Array(columns);
  let cursor = 0;
  for (const col of order) {
    colData[col] = input.slice(cursor, cursor + rows);
    cursor += rows;
  }
  const out = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) out.push(colData[col][row]);
  }
  return { out, order };
}

function hasCompleteLexiconSegmentation(stream) {
  const reachable = new Uint8Array(stream.length + 1);
  reachable[0] = 1;
  for (let i = 0; i < stream.length; i++) {
    if (!reachable[i]) continue;
    let node = trie;
    for (let j = i; j < stream.length && j < i + maxWordRunes; j++) {
      node = node.next.get(stream[j]);
      if (!node) break;
      if (node.terminal) reachable[j + 1] = 1;
    }
  }
  return Boolean(reachable[stream.length]);
}

const baselineKnown = chapterWords.filter(w =>
  lexicon.has(chapter.slice(w.start, w.end).join(","))
).length;
const directResults = [];
const fResults = [];
const columnarResults = [];

for (const spec of keys) {
  for (const sign of [1, -1]) {
    directResults.push({
      key: spec.name,
      sign,
      ...directRepeat(spec.values, sign)
    });
    fResults.push({
      key: spec.name,
      sign,
      ...fTransparentReachability(spec.values, sign)
    });
  }
  for (const inverse of [false, true]) {
    const result = columnar(chapter, spec.values, inverse);
    columnarResults.push({
      key: spec.name,
      direction: inverse ? "inverse" : "decrypt",
      keyOrder: result.order,
      completeTextBlobSegmentation: hasCompleteLexiconSegmentation(result.out),
      first60: result.out.slice(0, 60).map(i => corpus.translit[i]).join("")
    });
  }
}

const expectedKnown = [27, 25, 27, 23, 26, 21, 29, 27];
assert.deepEqual(directResults.map(x => x.knownWords), expectedKnown);
assert.deepEqual(fResults.map(x => x.failedRuneOffset), [20, 89, 162, 34, 38, 141, 71, 71]);
assert.equal(columnarResults.every(x => !x.completeTextBlobSegmentation), true);

console.log(JSON.stringify({
  source: "p33-p39 cuneiform values 1033 and 3301; authenticated 2013 BASE29 operation",
  base29: { "1033": base29(1033), "3301": base29(3301) },
  chapter: {
    pages: "LP2 p33-p39",
    runes: chapter.length,
    words: chapterWords.length,
    FRunes: fCount,
    divisibleBy3: chapter.length % 3 === 0,
    divisibleBy6: chapter.length % 6 === 0,
    baselineLexiconWords: baselineKnown,
    baselineCoverage: baselineKnown / chapterWords.length
  },
  keys: keys.map(k => ({
    name: k.name,
    base29Digits: k.values,
    GP29Transliteration: k.values.map(i => corpus.translit[i]).join("")
  })),
  directRepeatingAdditive: directResults,
  FTransparentReachability: fResults,
  columnarTransposition: columnarResults
}, null, 2));
