"use strict";
/**
 * Direct p53 red51 -> black128 additive-key gate.
 *
 * The p53 red suffix begins at rune 128, has length 51, and starts at a
 * word boundary; the preceding black prefix has length 128 and ends at a
 * word boundary. Test the natural color-key reading with a repeated key
 * and standard plaintext-/ciphertext-autokey extension.
 *
 * Orientations: P=C-K, P=K-C, P=C+K. No fitted key or alphabet.
 * Shakespeare GP trigram model; heldout Shakespeare and Gibran 128-rune
 * windows are native-English controls. All nine models have exact plants.
 *
 * Run: node sims/red51_black128_additive_gate.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const load = p => JSON.parse(fs.readFileSync(path.join(ROOT, p), "utf8"));
const mod = x => ((x % 29) + 29) % 29;
const corpus = load("resources/liber-primus/lp2-corpus.json");
const ink = load("resources/liber-primus/lp2-ink-annotations.json");
const p53 = corpus.pages.find(p => p.page === 53);
const redSpan = (ink.pages.find(p => p.page === 53).red_spans || []).find(s => s.start === 128 && s.length === 51);
assert.ok(redSpan, "p53 red span must be source-marked at [128,179)");
const red = p53.indices.slice(128), black = p53.indices.slice(0, 128);
assert.equal(red.length, 51);
assert.equal(black.length, 128);
const segments = fs.readFileSync(path.join(ROOT, "resources/lp2-transcription.txt"), "utf8").split("%").slice(0, 55);
assert.equal(segments.length, 55);
const runeMap = new Map(corpus.runes.map((r, i) => [r, i]));
const page = [], starts = [], ends = [];
let active = false, last = -1;
for (const ch of segments[52]) {
  if (runeMap.has(ch)) {
    page.push(runeMap.get(ch));
    starts.push(!active);
    ends.push(false);
    active = true;
    last = page.length - 1;
  } else if (ch === "/" || /\s/u.test(ch)) {
    // line-wrap only
  } else {
    if (active && last >= 0) ends[last] = true;
    active = false;
  }
}
if (active && last >= 0) ends[last] = true;
assert.deepEqual(page, p53.indices);
assert.equal(ends[127], true);
assert.equal(starts[128], true);
const N = 31, START = 29, END = 30, ALPHA = 29;
function encodeWord(word) {
  const s = word.toUpperCase().replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/K/g, "C").replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < s.length;) {
    const pair = corpus.translit.indexOf(s.slice(i, i + 2));
    if (pair >= 0) { out.push(pair); i += 2; }
    else {
      const one = corpus.translit.indexOf(s[i]);
      assert.notEqual(one, -1);
      out.push(one); i++;
    }
  }
  return out;
}
const wordsOf = text => (text.match(/[A-Za-z]+/g) || []).map(encodeWord);
const shakespeare = fs.readFileSync(path.join(ROOT, "resources/control/shakespeare_first300k.txt"), "utf8");
const gibran = fs.readFileSync(path.join(ROOT, "resources/control/gibran_prophet_58585.txt"), "utf8");
const trainWords = wordsOf(shakespeare.slice(0, 240000));
const heldoutWords = wordsOf(shakespeare.slice(240000));
const gibranWords = wordsOf(gibran);
function trainTrigram(words) {
  const h3 = new Float64Array(N * N * N), h2 = new Float64Array(N * N);
  const h1 = new Float64Array(N), c3 = new Float64Array(N * N), c2 = new Float64Array(N);
  for (const word of words) {
    let a = START, b = START;
    for (const c of [...word, END]) {
      h3[(a * N + b) * N + c]++; c3[a * N + b]++;
      h2[b * N + c]++; c2[b]++; h1[c]++;
      a = b; b = c;
    }
  }
  const total = h1.reduce((a, b) => a + b, 0);
  const p1 = Float64Array.from(h1, x => (x + 1) / (total + N));
  const p2 = new Float64Array(N * N), lm = new Float64Array(N * N * N);
  for (let b = 0; b < N; b++) for (let c = 0; c < N; c++)
    p2[b * N + c] = (h2[b * N + c] + 10 * p1[c]) / (c2[b] + 10);
  for (let a = 0; a < N; a++) for (let b = 0; b < N; b++) for (let c = 0; c < N; c++)
    lm[(a * N + b) * N + c] =
      Math.log((h3[(a * N + b) * N + c] + 5 * p2[b * N + c]) / (c3[a * N + b] + 5));
  return lm;
}
const lm = trainTrigram(trainWords);
function score(text, wordStarts, wordEnds) {
  let a = START, b = START, sum = 0;
  for (let i = 0; i < text.length; i++) {
    if (wordStarts[i]) { a = START; b = START; }
    const c = text[i];
    sum += lm[(a * N + b) * N + c];
    a = b; b = c;
    if (wordEnds[i]) {
      sum += lm[(a * N + b) * N + END];
      a = START; b = START;
    }
  }
  return sum / text.length;
}
function stream(words, limit) {
  const text = [], wordStarts = [], wordEnds = [];
  for (const word of words) {
    for (let j = 0; j < word.length && text.length < limit; j++) {
      text.push(word[j]); wordStarts.push(j === 0); wordEnds.push(j === word.length - 1);
    }
    if (text.length >= limit) break;
  }
  return { text, wordStarts, wordEnds };
}
function windowScore(words, offset, count) {
  const s = stream(words, offset + count);
  return score(s.text.slice(offset), s.wordStarts.slice(offset), s.wordEnds.slice(offset));
}
const controls = [];
for (const [name, words] of [["shakespeare-heldout", heldoutWords], ["gibran", gibranWords]]) {
  const total = words.reduce((n, w) => n + w.length, 0);
  for (let offset = 0; offset + 128 <= total; offset += 128)
    controls.push({ name, offset, score: windowScore(words, offset, 128) });
}
function keyAt(i, mode, feedback, plain, cipher) {
  if (mode === "repeat") return red[i % red.length];
  if (i < red.length) return red[i];
  return feedback === "plaintext" ? plain[i - red.length] : cipher[i - red.length];
}
function decrypt(cipher, orientation, mode, feedback) {
  const plain = new Uint8Array(cipher.length);
  for (let i = 0; i < cipher.length; i++) {
    const k = keyAt(i, mode, feedback, plain, cipher);
    plain[i] = orientation === "C-K" ? mod(cipher[i] - k)
      : orientation === "K-C" ? mod(k - cipher[i]) : mod(cipher[i] + k);
  }
  return plain;
}
function encrypt(plain, orientation, mode, feedback) {
  const cipher = new Uint8Array(plain.length), recovered = new Uint8Array(plain.length);
  for (let i = 0; i < plain.length; i++) {
    const k = keyAt(i, mode, feedback, recovered, cipher);
    cipher[i] = orientation === "C-K" ? mod(plain[i] + k)
      : orientation === "K-C" ? mod(k - plain[i]) : mod(plain[i] - k);
    const dk = keyAt(i, mode, feedback, recovered, cipher);
    recovered[i] = orientation === "C-K" ? mod(cipher[i] - dk)
      : orientation === "K-C" ? mod(dk - cipher[i]) : mod(cipher[i] + dk);
  }
  return cipher;
}
function roundtrip(plain, orientation, mode, feedback) {
  const cipher = encrypt(plain, orientation, mode, feedback);
  const decoded = decrypt(cipher, orientation, mode, feedback);
  return decoded.every((x, i) => x === plain[i]);
}
const results = [];
for (const orientation of ["C-K", "K-C", "C+K"]) {
  const out = decrypt(black, orientation, "repeat", "plaintext");
  results.push({ orientation, mode: "repeating-51", feedback: "none",
    score: score(out, starts.slice(0, 128), ends.slice(0, 128)),
    prefix: Array.from(out.slice(0, 40), x => corpus.translit[x]).join(" ") });
  for (const feedback of ["plaintext", "ciphertext"]) {
    const decoded = decrypt(black, orientation, "autokey", feedback);
    results.push({ orientation, mode: "51-rune-autokey", feedback,
      score: score(decoded, starts.slice(0, 128), ends.slice(0, 128)),
      prefix: Array.from(decoded.slice(0, 40), x => corpus.translit[x]).join(" ") });
  }
}
const plant = stream(gibranWords, 128).text;
const positiveControls = [];
for (const orientation of ["C-K", "K-C", "C+K"]) {
  positiveControls.push({ orientation, mode: "repeat",
    exact: roundtrip(plant, orientation, "repeat", "plaintext") });
  for (const feedback of ["plaintext", "ciphertext"])
    positiveControls.push({ orientation, mode: "autokey", feedback,
      exact: roundtrip(plant, orientation, "autokey", feedback) });
}
assert.ok(positiveControls.every(x => x.exact));
const controlScores = controls.map(x => x.score).sort((a, b) => a - b);
console.log(JSON.stringify({
  classification: "Bounded negative for direct p53 red51-to-black128 additive key",
  source: {
    p53Runes: page.length, blackLength: black.length, redLength: red.length,
    redDistinctSymbols: new Set(red).size, redStartsAt: 128,
    blackEndsAtWordBoundary: ends[127], redBeginsAtWordBoundary: starts[128]
  },
  search: { models: results.length, variants: results },
  nativeControls: {
    windows: controls.length, min: controlScores[0],
    median: controlScores[Math.floor(controlScores.length / 2)],
    max: controlScores[controlScores.length - 1]
  },
  positiveControls,
  note: "Forward-reading red key only; no fitted alphabet, offset, or key."
}, null, 2));
if (require.main === module) main();
