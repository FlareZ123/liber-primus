"use strict";
/**
 * Original-source SFT: p6/p7 mirrored red words as a sum-zero GP29 six-rune
 * stream key on the enclosed 308-rune body. Source-native lexical control.
 * Run: node sims/lp2_p6_p7_balanced_marker_receiver_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} file */
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const transcript = read("resources/liber-primus/lp2-transcription.txt").split("%");
const frequencyText = read("resources/control/english_wordfreq_textblob.txt");
const solved = read("resources/liber-primus/lp1-plaintext-reference.txt");
const runeIndex = new Map(gp.runes.map((s, i) => [s, i]));
const latin = gp.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);
assert.equal(gp.pages.length, 58);
for (const [page, start, length] of [[6, 71, 11], [7, 194, 14]]) {
  assert(ink.pages.some(x => x.page === page &&
    x.red_spans.some(y => y.start === start && y.length === length)));
  assert.deepEqual([...transcript[page]].filter(c => runeIndex.has(c))
    .map(c => runeIndex.get(c)), gp.pages[page].indices);
}
const p6 = gp.pages[6].indices, p7 = gp.pages[7].indices;
assert.equal(p6.length, 196);
assert.equal(p7.length, 208);
const left = p6.slice(76, 82);
const right = [...p7.slice(196, 200), ...p7.slice(194, 196)];
assert.deepEqual(left, [6, 27, 15, 17, 14, 12]);
assert.deepEqual(right, [22, 16, 2, 25, 23, 3]);
assert.equal(left.reduce((s, x) => s + x, 0),
  right.reduce((s, x) => s + x, 0));
const key = left.map((x, i) => (x - right[i] + 29) % 29);
assert.deepEqual(key, [13, 11, 13, 21, 20, 9]);
assert.equal(key.reduce((s, x) => s + x, 0) % 29, 0);
const receiver = [...p6.slice(82), ...p7.slice(0, 194)];
assert.equal(p6.slice(82).length, 114);
assert.equal(receiver.length, 308);
assert.equal(114 % key.length, 0);

/**
 * GP-rune body with exactly the source's punctuation, including one
 * page-crossing printed word. ±1 are symmetric difference-key directions.
 * @param {-1|0|1} sign
 * @param {boolean} wordReset
 */
function invert(sign, wordReset) {
  let phase = 0;
  const positions = [];
  let body = "";
  for (const [page, start, end] of [[6, 82, 196], [7, 0, 194]]) {
    let offset = 0;
    for (const char of transcript[page]) {
      const value = runeIndex.get(char);
      if (value !== undefined) {
        if (offset >= start && offset < end) {
          positions.push(phase % key.length);
          body += gp.runes[(value + sign * key[phase % key.length] + 29) % 29];
          phase++;
        }
        offset++;
      } else if (offset >= start && offset <= end) {
        body += char;
        if (wordReset && "-.$&§".includes(char)) phase = 0;
      }
    }
  }
  body = body.replace(/[\/\s]/gu, "");
  const values = [...body].filter(x => runeIndex.has(x)).map(x => runeIndex.get(x));
  assert.equal(values.length, 308);
  assert.deepEqual(values.map((x, i) =>
    (x - sign * key[positions[i]] + 29) % 29), receiver);
  return body.match(/[\u16A0-\u16FF]+/gu) || [];
}

/**
 * Reuse solved-LP1/Liber Primus native GP spelling (ING and IO digraphs).
 * @param {string} source
 * @returns {number[]}
 */
function encodeNative(source) {
  const w = source.toUpperCase().replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < w.length;) {
    if (w.startsWith("ING", i)) {out.push(21); i += 3;}
    else if (w.startsWith("IO", i)) {out.push(27); i += 2;}
    else {
      const t = latin.find(x => w.startsWith(x.s, i));
      assert(t, "unmapped source Latin word: " + w);
      out.push(t.i);
      i += t.s.length;
    }
  }
  return out;
}
const lexicon = new Map();
for (const line of frequencyText.split(/\r?\n/gu)) {
  const match = /^([a-z]+) (\d+)$/u.exec(line);
  if (!match) continue;
  const token = encodeNative(match[1]).join(",");
  lexicon.set(token, Math.max(lexicon.get(token) || 0, Number(match[2])));
}
/** @param {string[]} words */
function score(words) {
  const eligible = words.map(w => [...w].map(c => runeIndex.get(c)))
    .filter(a => a.length >= 4);
  const counts = eligible.map(a => lexicon.get(a.join(",")) || 0);
  return {words: words.length, longWords: eligible.length,
    anyLexicon: counts.filter(n => n > 0).length,
    frequencyAtLeastFive: counts.filter(n => n >= 5).length};
}
const results = [];
for (const reset of [false, true]) for (const sign of [-1, 1]) {
  const current = score(invert(sign, reset));
  assert.equal(current.longWords, 40);
  assert.equal(current.anyLexicon, 0);
  results.push({sign, clock: reset ? "printed-word reset" : "continuous", ...current});
}
const original = score(invert(0, false));
assert.equal(original.longWords, 40);
assert.equal(original.anyLexicon, 0);
const p57 = solved.replace(/\r\n/gu, "\n").split("### 57\n")[1];
const clearWords = p57.match(/[A-Z]+/gu) || [];
const clearGP = clearWords.map(encodeNative);
assert.deepEqual(clearGP.flat(), gp.pages[57].indices);
const plant = clearGP.flat().map((v, i) => (v + key[i % 6]) % 29);
assert.deepEqual(plant.map((v, i) => (v - key[i % 6] + 29) % 29),
  gp.pages[57].indices);
const positive = clearGP.filter(w => w.length >= 4)
  .map(w => lexicon.get(w.join(",")) || 0);
assert.equal(positive.length, 12);
assert.equal(positive.filter(n => n >= 5).length, 8);
console.log(JSON.stringify({
  source: "original p6=23.jpg p7=24.jpg, with source print separators",
  redWords: {p6LastSix: left, p7FirstSixReversed: right},
  key, keySumMod29: 0,
  receiver: {p6: [82, 196], p7: [0, 194], runes: 308,
    pageCrossingWordJoined: true, p6TailIs19KeyCycles: true},
  original, results,
  positiveControl: {originalClearP57Runes: 95, longWords: 12,
    lexiconMatches: 8, exactRecoveredRunes: plant.length},
  verdict: "No plaintext in either source-difference key direction or source-motivated clock"
}, null, 2));
