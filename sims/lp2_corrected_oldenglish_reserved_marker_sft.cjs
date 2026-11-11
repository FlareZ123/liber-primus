"use strict";

/**
 * Key-independent single-reserved-GP-symbol predecessor test with fully
 * corrected Old English Beowulf source words, including correct lowercase
 * thorn, eth and ash mapping.
 *
 * Original LP2 permits 2,896 words; three 14-rune words lack a counterpart
 * in the pinned source. Grant them arbitrary plaintext, remove all three
 * from moments and match testing, and compare the remaining 2,893.
 * Node 22, CommonJS; node sims/lp2_corrected_oldenglish_reserved_marker_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const read = (name) => fs.readFileSync(path.join(ROOT, name), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const source = JSON.parse(read("resources/control/beowulf_oe_gp_profile_corrected.json"));
const runes = new Map(corpus.runes.map((r, i) => [r, i]));

const encoded = [...source.sourceGpBase29].map((char) =>
  source.positiveControlAlphabet.indexOf(char));
assert.equal(encoded.length, 48012);
assert.equal(source.allSourceGpWordLengths.length, 10885);
assert.equal(source.allGpCounts[2], 2078);
assert.equal(source.allGpCounts[25], 560);
assert(encoded.every((x) => x >= 0 && x < 29));

let start = 0;
const nativeWords = source.allSourceGpWordLengths.map((length) => {
  const word = encoded.slice(start, start + length);
  start += length;
  return word;
});
assert.equal(start, 48012);

const originalText = read("resources/lp2-transcription.txt")
  .split("%").slice(0, 55).join("%");
const native = [];
let current = [], lastRune = null;
const finish = () => {if(current.length){native.push(current);current=[];}};
for (const ch of originalText) {
  if (runes.has(ch)) {
    current.push(Number(lastRune === ch));
    lastRune = ch;
  } else if (ch === "%" || ch === "/" || /\s/u.test(ch)) {
    // An actual printed word continues through page and line wraps.
  } else finish();
}
finish();
assert.equal(native.length, 2896);
assert.equal(native.reduce((sum, word) => sum + word.length, 0), 12956);

const reference = Array.from({length: 15}, () => []);
for (const w of nativeWords) if (w.length < reference.length)
  reference[w.length].push(w);

const countVector = (words) => {
  const out = [0, 0, 0];
  for (const w of words) for (let j = 0; j < w.length; j++) {
    if (w[j]) {
      out[0]++;
      out[1] += Number(j === 0);
      out[2] += Number(j === w.length - 1);
    }
  }
  return out;
};

const threeLong = native.filter((w) => w.length === 14);
assert.equal(threeLong.length, 3);
assert.equal(countVector(threeLong)[0], 0);
assert.equal(reference[14].length, 0);
const retained = native.filter((w) => w.length < 14);
const observed = countVector(retained);
assert.deepEqual(observed, [86, 23, 19]);
const hist = Array(14).fill(0);
for (const w of retained) hist[w.length]++;

/**
 * Exact native word-length conditional means and standard deviations.
 * @param {number} symbol GP index reserved as a predecessor-repeat marker.
 */
function moments(symbol) {
  const mean = [0, 0, 0], variance = [0, 0, 0];
  for (let length = 1; length < hist.length; length++) if (hist[length]) {
    const pool = reference[length];
    assert(pool.length > 0);
    const totals = [0, 0, 0], squared = [0, 0, 0];
    for (const word of pool) {
      const vector = [
        word.filter((x) => x === symbol).length,
        Number(word[0] === symbol),
        Number(word[word.length - 1] === symbol)
      ];
      for (let k = 0; k < 3; k++) {
        totals[k] += vector[k];
        squared[k] += vector[k] ** 2;
      }
    }
    for (let k = 0; k < 3; k++) {
      const meanAtLength = totals[k] / pool.length;
      mean[k] += hist[length] * meanAtLength;
      variance[k] += hist[length] *
        Math.max(0, squared[k] / pool.length - meanAtLength ** 2);
    }
  }
  return {mean, sd: variance.map(Math.sqrt)};
}

/** @param {number[]} obs @param {{mean:number[],sd:number[]}} m */
function deviation(obs, m) {
  return Math.min(...[
    obs, [obs[0] + 1, obs[1] + 1, obs[2]]
  ].map((candidate) => Math.max(...candidate.map((x, k) =>
    m.sd[k] > 0 ? Math.abs((x - m.mean[k]) / m.sd[k]) :
      Number(x !== m.mean[k]) * Infinity))));
}

/** @param {number} symbol */
function patternMisses(symbol) {
  const valid = Array.from({length: 14}, () => new Set());
  for (const word of nativeWords) if (word.length < valid.length)
    valid[word.length].add(word.map((v) => Number(v === symbol)).join(""));
  let failures = 0;
  for (let i = 0; i < retained.length; i++) {
    const word = retained[i];
    const bits = word.join("");
    const match = valid[word.length];
    if (!match.has(bits) && (i !== 0 || !match.has("1" + bits.slice(1))))
      failures++;
  }
  return failures;
}

/**
 * A reversible 29-way preceding-ciphertext symbol channel with exactly
 * one special plaintext rune s mapping to repeated previous ciphertext.
 * @param {number[]} plain
 * @param {number} s
 */
function forward(plain, s) {
  let previous = 0;
  return plain.map((p) => {
    const allowed = Array.from({length:29}, (_,i) => i)
      .filter((x) => x !== previous);
    const next = p === s ? previous :
      allowed[(5 * (p < s ? p : p - 1) + 11) % 28];
    previous = next;
    return next;
  });
}
/** @param {number[]} cipher @param {number} s */
function inverse(cipher,s) {
  let previous = 0;
  return cipher.map((x) => {
    const allowed = Array.from({length:29}, (_,i) => i)
      .filter((v) => v !== previous);
    let p = s;
    if (x !== previous) {
      const rank = ((17 * (allowed.indexOf(x) - 11)) % 28 + 28) % 28;
      p = rank < s ? rank : rank + 1;
    }
    previous = x;
    return p;
  });
}

let state = 0x33012014;
const random = () => {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return state >>> 0;
};
const planted = retained.flatMap((w) => {
  const pool = reference[w.length];
  return pool[random() % pool.length];
});
assert.equal(planted.length, 12956 - 42);
for (let s = 0; s < 29; s++) {
  const cipher = forward(planted, s);
  assert.deepEqual(inverse(cipher,s), planted);
  for (let i = 1; i < cipher.length; i++)
    assert.equal(cipher[i] === cipher[i - 1], planted[i] === s);
}

const results = corpus.translit.map((name, i) => ({
  rune: name,
  score: deviation(observed, moments(i)),
  mean: moments(i).mean,
  sd: moments(i).sd,
  unmatchedNativeWordPatterns: patternMisses(i),
})).sort((a,b) => a.score - b.score);
assert.equal(results[0].rune, "AE");
assert(Math.abs(results[0].score - 5.744999853369919) < 1e-9);
assert.equal(results[0].unmatchedNativeWordPatterns, 30);
assert(results.every((x) => x.score > 5.7));

console.log(JSON.stringify({
  test: "PASS",
  status: "Source-conditional negative of one fixed reserved-repeat GP29 symbol",
  nativeSource: {words: nativeWords.length, GP: encoded.length},
  original: {words: native.length, retainedWords: retained.length,
    excludedSourceUnrepresented14RuneWords: 3, observed},
  all29Best: results.slice(0, 6),
  exactPlanted29WayRoundtrips: 29,
  conclusion: "Corrected Old English does not rescue any single reserved GP rune; source and intact-word assumptions remain conditional",
}, null, 2));
