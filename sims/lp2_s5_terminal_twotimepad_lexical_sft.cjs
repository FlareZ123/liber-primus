"use strict";

/**
 * Word-overlap inverse of a frozen shared 75-rune GP29 pad hypothesis.
 * Two original ciphertexts: p55 after its one-rune page carry and the
 * "shed circumferences" interiors of eleven S5-lag-marked words.
 * Run: node sims/lp2_s5_terminal_twotimepad_lexical_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcript = read("resources/liber-primus/lp2-transcription.txt");
const lexiconText = read("resources/control/english_wordfreq_textblob.txt");
const rune2index = new Map(corpus.runes.map((rune, i) => [rune, i]));
const originalWords = [];
let current = "";
function finishWord() {
  if (current) {
    originalWords.push(current);
    current = "";
  }
}
for (const ch of transcript.split("%").slice(0, 55).join("%")) {
  if (/[\u16A0-\u16FF]/u.test(ch)) current += ch;
  else if (ch !== "%" && ch !== "/" && !/\s/u.test(ch)) finishWord();
}
finishWord();
assert.equal(originalWords.length, 2896);
assert.equal(originalWords.reduce((n, w) => n + [...w].length, 0), 12956);

const S = corpus.runes[15];
const markedWords = originalWords.filter(word =>
  [...word].some((r, i, wordRunes) => i >= 5 && r === S && wordRunes[i - 5] === S));
assert.equal(markedWords.length, 11);
const Bwords = markedWords.map(word =>
  [...word].slice(1, -1).map(r => rune2index.get(r)));
const p55Fragment = transcript.split("%")[54].replace(/\/\s*/gu, "");
const p55PrintedWords = p55Fragment.match(/[\u16A0-\u16FF]+/gu) || [];
assert.equal(p55PrintedWords.length, 17);
assert.equal([...p55PrintedWords[0]].length, 1);
const Awords = p55PrintedWords.slice(1).map(word =>
  [...word].map(r => rune2index.get(r)));
const Aoriginal = Awords.flat();
const Boriginal = Bwords.flat();
assert.equal(Aoriginal.length, 75);
assert.equal(Boriginal.length, 75);
assert.deepEqual(Aoriginal, corpus.pages[55].indices.slice(1));
const mod = n => ((n % 29) + 29) % 29;
const delta = Aoriginal.map((n, i) => mod(n - Boriginal[i]));
const tokens = corpus.translit.map((token, i) => ({token, i}))
  .sort((a, b) => b.token.length - a.token.length);

/**
 * Source-calibrated Cicada GP spelling: QU/CW, V/U, K/C, Z/S, ING, IO.
 * @param {string} word
 * @returns {number[]|null}
 */
function encode(word) {
  const s = word.toUpperCase().replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/K/g, "C").replace(/Z/g, "S").replace(/ING/g, "NG")
    .replace(/IO/g, "IA");
  const numbers = [];
  for (let i = 0; i < s.length;) {
    const token = tokens.find(t => s.startsWith(t.token, i));
    if (!token) return null;
    numbers.push(token.i);
    i += token.token.length;
  }
  return numbers;
}
const dictionary = new Map();
for (const line of lexiconText.match(/^[a-z]+\s+\d+$/gm) || []) {
  const [word, count] = line.split(/\s+/u);
  const numbers = encode(word);
  if (!numbers) continue;
  const signature = numbers.join(",");
  const existing = dictionary.get(signature);
  if (!existing || Number(count) > existing.freq) {
    dictionary.set(signature, {word, numbers, freq: Number(count)});
  }
}
assert.equal(dictionary.size, 29058);
const byLength = new Map();
for (const entry of dictionary.values()) {
  if (!byLength.has(entry.numbers.length)) byLength.set(entry.numbers.length, []);
  byLength.get(entry.numbers.length).push(entry);
}
const eachStart = words => {
  let start = 0;
  return words.map((word, index) => {
    const record = {index, start, length: word.length};
    start += word.length;
    return record;
  });
};
const A = eachStart(Awords), B = eachStart(Bwords);
assert.equal(A.length, 16);
assert.equal(B.length, 11);

/**
 * Count dictionary-consistent plaintext word pairs for each crossing segment.
 * Dictionary candidates for each word are fixed before examining differences.
 * @param {number[]} diffs 75 shared-pad-cancelled GP29 values.
 * @returns {Array<{a:number,b:number,n:number,pairs:number}>}
 */
function overlapResults(diffs) {
  const result = [];
  for (const a of A) for (const b of B) {
    const left = Math.max(a.start, b.start);
    const end = Math.min(a.start + a.length, b.start + b.length);
    if (left >= end) continue;
    const possibleA = byLength.get(a.length) || [];
    const possibleB = byLength.get(b.length) || [];
    const bIndex = new Map();
    for (const candidate of possibleB) {
      const signature = candidate.numbers
        .slice(left - b.start, end - b.start).join(",");
      bIndex.set(signature, (bIndex.get(signature) || 0) + 1);
    }
    let pairs = 0;
    for (const candidate of possibleA) {
      const needed = [];
      for (let k = left; k < end; k++) {
        needed.push(mod(candidate.numbers[k - a.start] - diffs[k]));
      }
      pairs += bIndex.get(needed.join(",")) || 0;
    }
    result.push({a:a.index,b:b.index,n:end-left,pairs});
  }
  return result;
}
const original = overlapResults(delta);
assert.equal(original.length, 24);
const decisive = original.filter(e => e.n >= 5 && e.pairs === 0);
assert.deepEqual(decisive.map(e => [e.a,e.b,e.n]), [
  [3,1,6], [4,2,6], [6,3,6], [6,4,5], [7,4,5], [11,7,6]
]);

// A source-native GP-English positive using exactly the SAME two word layouts,
// the SAME frozen dictionary, and a common but unknown 75-rune running pad.
function chooseWords(template) {
  return template.map(word => {
    const options = byLength.get(word.length);
    assert(options && options.length);
    return options.reduce((best, option) =>
      option.freq > best.freq ? option : best).numbers;
  });
}
const Aplain = chooseWords(Awords).flat();
const Bplain = chooseWords(Bwords).flat();
const key = Aplain.map((_, i) => mod(13 + 17*i + i*i));
const Aplant = Aplain.map((p, i) => mod(p + key[i]));
const Bplant = Bplain.map((p, i) => mod(p + key[i]));
const dPlant = Aplant.map((p, i) => mod(p - Bplant[i]));
assert.deepEqual(dPlant, Aplain.map((p, i) => mod(p - Bplain[i])));
const plant = overlapResults(dPlant);
assert.equal(plant.length, 24);
assert(plant.every(edge => edge.pairs > 0));
assert.deepEqual(Aplant.map((c, i) => mod(c - key[i])), Aplain);
assert.deepEqual(Bplant.map((c, i) => mod(c - key[i])), Bplain);

console.log(JSON.stringify({
  status:"SFT PASS; no original two-time-pad plaintext",
  selectedS5SourceWordLengths:markedWords.map(x=>[...x].length),
  p55CompleteWordLengths:Awords.map(w=>w.length),
  otherStreamInteriorLengths:Bwords.map(w=>w.length),
  originalRunes:Aoriginal.length,
  sourceNativeDictionaryWords:dictionary.size,
  overlappingWordPairs:original.length,
  longOverlaps:original.filter(e=>e.n>=4),
  impossibleFivePlusRuneOriginalEdges:decisive,
  syntheticCommonPadEdgesWithAtLeastOneDictionaryPair:
    plant.filter(e=>e.pairs>0).length
},null,2));
