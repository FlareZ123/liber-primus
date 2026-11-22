"use strict";
/**
 * SFT: source-word-constrained dual-English running-key test for original LP2 p55.
 *
 * Frozen hypothesis: publish the predecessor-excluding GP28 difference
 * r=(C_i-C_(i-1) mod29)-1; a repeated ciphertext rune is the exceptional EA
 * plaintext rune and consumes no running-key symbol. Otherwise
 * r=(P_i+K_i) mod28, with the original printed plaintext word breaks intact.
 *
 * Word candidates use the pinned TextBlob lexicon; GP28 key likelihood is a
 * smoothed GP trigram model from pinned Shakespeare. This is an exploratory
 * model, not an authenticated Cicada encryption rule.
 *
 * Repro: node sims/lp2_p55_dualtext_wordbeam_runningkey_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const glyphs = corpus.translit;
const alphabet = glyphs.map((symbol, index) => ({symbol, index}))
  .sort((a, b) => b.symbol.length - a.symbol.length);
const WIDTH = 150;
const N = 28;
const lengths = [4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3];
const p55 = corpus.pages.find((p) => p.page === 55).indices;
assert.equal(p55.length, 76);
assert.equal(glyphs[p55[0]], "NG");
assert.equal(lengths.reduce((x, y) => x + y, 0), 75);
const sourceWords = [
  "AE M I W", "S B", "X M", "S EO G D TH AE", "F IA A B C U", "W R",
  "B EA F X I M U C P H NG L EO", "M S D IA P F", "B H EO C",
  "EO E", "EA E I G X G S", "E S EO TH TH E S", "TH OE",
  "C EA I M C X", "D J U", "B E I"
];
const indexOf = new Map(glyphs.map((g, i) => [g, i]));
assert.deepEqual(sourceWords.flatMap((w) => w.split(" ").map((g) => indexOf.get(g))),
  p55.slice(1));
assert.deepEqual(sourceWords.map((w) => w.split(" ").length), lengths);

/** @param {string} s @returns {string} */
function normalize(s) {
  return s.toUpperCase().replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/K/g, "C").replace(/Z/g, "S").replace(/Q/g, "C");
}
/** @param {string} word @returns {number[]|null} */
function encodeWord(word) {
  word = normalize(word);
  const result = [];
  for (let i = 0; i < word.length;) {
    const match = alphabet.find((g) => word.startsWith(g.symbol, i));
    if (!match) return null;
    result.push(match.index);
    i += match.symbol.length;
  }
  return result;
}
/** @param {string} text @returns {number[]} */
function nativeStream(text) {
  return (text.toUpperCase().match(/[A-Z]+/g) || [])
    .flatMap((w) => encodeWord(w) || []).filter((x) => x !== 28);
}
const training = nativeStream(read("resources/control/shakespeare_first300k.txt"));
const heldout = nativeStream(read("resources/control/gibran_prophet_58585.txt"));
assert.equal(training.length, 217167);
assert.equal(heldout.length, 62508);
const tri = new Float64Array(N ** 3).fill(0.2);
const pair = new Float64Array(N ** 2).fill(5.6);
const uni = new Float64Array(N).fill(1);
for (let i = 0; i < training.length; i++) {
  uni[training[i]]++;
  if (i > 1) {
    const [a, b, c] = training.slice(i - 2, i + 1);
    tri[(a * N + b) * N + c]++;
    pair[a * N + b]++;
  }
}
const uniLog = Array.from(uni, (x) => Math.log(x / training.length));
const trigramLog = new Float64Array(N ** 3);
for (let i = 0; i < trigramLog.length; i++) {
  trigramLog[i] = Math.log(tri[i] / pair[Math.floor(i / N)]);
}
/** @param {number} a @param {number} b @param {number} c */
function letterLog(a, b, c) {
  return a < 0 || b < 0 ? uniLog[c] : trigramLog[(a * N + b) * N + c];
}
const lexicon = [];
for (const line of read("resources/control/english_wordfreq_textblob.txt").split("\n")) {
  const m = line.match(/^([a-z]+) (\d+)$/);
  if (!m) continue;
  const gp = encodeWord(m[1]);
  if (gp) lexicon.push({word: m[1], frequency: Number(m[2]), gp});
}
const options = lengths.map((n, j) => lexicon
  .filter((x) => x.gp.length === n && x.gp.every((value, i) =>
    j === 11 ? (i === 4 ? value === 28 : value !== 28) : value !== 28))
  .sort((a, b) => b.frequency - a.frequency));
assert.deepEqual(options.map((x) => x.length),
  [1852,180,180,4342,4342,180,462,4342,1852,180,4610,14,180,4342,654,654]);

/** @param {number[]} ciphertext @returns {(number|null)[]} */
function predecessorRanks(ciphertext) {
  const out = [];
  for (let i = 1; i < ciphertext.length; i++) {
    const d = (ciphertext[i] - ciphertext[i - 1] + 29) % 29;
    out.push(d === 0 ? null : d - 1);
  }
  return out;
}

/**
 * @param {(number|null)[]} ranks
 * @returns {{score:number,words:string[],key:number[]}}
 */
function solve(ranks) {
  let cursor = 0;
  let beam = [{score: 0, pa: -1, pb: -1, ka: -1, kb: -1, words: [], key: []}];
  for (let j = 0; j < lengths.length; j++) {
    const first = cursor;
    const block = ranks.slice(first, first + lengths[j]);
    cursor += lengths[j];
    const candidates = [];
    for (const w of options[j]) {
      const key = [];
      let valid = true;
      for (let i = 0; i < block.length; i++) {
        const r = block[i], p = w.gp[i];
        if (r === null) {
          if (p !== 28) {valid = false; break;}
        } else if (p === 28) {
          valid = false;
          break;
        } else {
          key.push((r - p + N) % N);
        }
      }
      if (valid) candidates.push({w, key, prior: Math.log(w.frequency + 1)});
    }
    const next = [];
    for (const state of beam) {
      for (const x of candidates) {
        let score = state.score + x.prior;
        let pa = state.pa, pb = state.pb, ka = state.ka, kb = state.kb;
        for (const p of x.w.gp) {
          if (p === 28) continue;
          score += letterLog(pa, pb, p);
          pa = pb; pb = p;
        }
        for (const k of x.key) {
          score += letterLog(ka, kb, k);
          ka = kb; kb = k;
        }
        next.push({score,pa,pb,ka,kb,
          words: state.words.concat(x.w.word),
          key: state.key.concat(x.key)});
      }
    }
    next.sort((a, b) => b.score - a.score);
    const used = new Set();
    beam = [];
    for (const state of next) {
      const signature = ((state.pa * N + state.pb) * N + state.ka) * N + state.kb;
      if (used.has(signature)) continue;
      used.add(signature);
      beam.push(state);
      if (beam.length >= WIDTH) break;
    }
    assert.ok(beam.length > 0, "no dictionary/escape path for word " + (j + 1));
  }
  assert.equal(cursor, ranks.length);
  return beam[0];
}
const sourceRanks = predecessorRanks(p55);
assert.equal(sourceRanks.length, 75);
assert.deepEqual(sourceRanks.flatMap((x, i) => x === null ? [i] : []), [58]);
const real = solve(sourceRanks);
assert.equal(real.words.join(" "),
  "seen to it twelve without the quartermaster england like the glancing increase the wounds and with");
assert.ok(Math.abs(real.score + 251.68863079368577) < 1e-8);

// Independent wordwise-English/Gibran-key plant with exactly the source lengths
// and the source's exceptional EA location. The plant is deliberately not a
// coherent 16-word sentence. It is a detector-power check for word recovery.
const plantedWords = options.map((arr, j) =>
  j === 11 ? arr.find((x) => x.word === "increase")
    : arr[(j * 7) % Math.min(arr.length, 40)]);
const plantedPlain = plantedWords.flatMap((x) => x.gp);
assert.equal(plantedPlain.length, 75);
const ciphertext = [p55[0]];
let previous = p55[0];
let keyConsumed = 0;
for (const p of plantedPlain) {
  if (p === 28) {
    ciphertext.push(previous);
    continue;
  }
  const k = heldout[9000 + keyConsumed++];
  previous = (previous + 1 + (p + k) % N) % 29;
  ciphertext.push(previous);
}
assert.equal(keyConsumed, 74);
const planted = solve(predecessorRanks(ciphertext));
const matchedWords = planted.words.filter((w, i) => w === plantedWords[i].word).length;
assert.equal(matchedWords, 11);
assert.ok(Math.abs(planted.score + 204.86808104536786) < 1e-8);
console.log(JSON.stringify({
  model: "source GP28 predecessor difference = plaintext + natural-English running key",
  originalWords: real.words.join(" "), originalScore: real.score,
  plantedWords: plantedWords.map((x) => x.word).join(" "),
  plantedRecovered: planted.words.join(" "), plantedWordCount: matchedWords,
  plantedScore: planted.score, originalRunes: p55.length,
  warning: "Original word string is an overfit candidate, NOT genuine plaintext."
}, null, 2));
