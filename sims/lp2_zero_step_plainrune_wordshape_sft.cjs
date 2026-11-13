"use strict";
/**
 * Single-file source-original zero-step plain-rune gate (Node.js 22, CommonJS).
 *
 * Conditional cipher: for each non-initial rune in a physical page,
 * C[i] = C[i-1] + K[i]*(P[i]-r) (mod 29), with K[i] nonzero.
 * Thus adjacent equal original C pins exactly the sites P[i] === r,
 * for one unknown but globally fixed GP rune r, independently of K.
 *
 * Examine that prediction using the exact LP2 word lengths and page starts
 * against Shakespeare, Emerson and Gibran native GP-encoded word tokens.
 * Corpus samples test a finite native-English model, not all possible prose.
 *
 * Run: node sims/lp2_zero_step_plainrune_wordshape_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
/** @param {string} file */
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const raw = read("resources/liber-primus/lp2-transcription.txt");
const sourceWords = raw.split("%").slice(0, 55).join("")
  .replace(/\/\s*/g, "").replace(/\s+/g, "")
  .split(/[^\u16A0-\u16FF]+/u).filter(Boolean);
const byRune = new Map(gp.runes.map((r, i) => [r, i]));
const originalPages = gp.pages.filter((p) => p.status === "unsolved" && p.indices.length);
const sourceNumbers = sourceWords.flatMap((w) => [...w].map((r) => byRune.get(r)));
const originalNumbers = originalPages.flatMap((p) => p.indices);
assert.deepEqual(sourceNumbers, originalNumbers);
assert.equal(sourceNumbers.length, 12956);
assert.equal(sourceWords.length, 2896);

const pageStarts = new Set();
const zero = new Uint8Array(sourceNumbers.length);
let offset = 0;
for (const page of originalPages) {
  pageStarts.add(offset);
  for (let i = 1; i < page.indices.length; i++) {
    if (page.indices[i] === page.indices[i - 1]) zero[offset + i] = 1;
  }
  offset += page.indices.length;
}
assert.equal(pageStarts.size, 55);
assert.equal(zero.reduce((a, b) => a + b, 0), 86);

const printWords = [];
let begin = 0;
for (const rawWord of sourceWords) {
  const length = [...rawWord].length;
  printWords.push({ begin, length });
  begin += length;
}
/** @param {number} index @param {number} length */
function role(index, length) {
  return index === 0 ? 0 : index === length - 1 ? 2 : 1;
}
const observed = [0, 0, 0];
for (const w of printWords) {
  for (let j = 0; j < w.length; j++) {
    if (zero[w.begin + j]) observed[role(j, w.length)]++;
  }
}
assert.deepEqual(observed, [23, 44, 19]);

const translit = gp.translit.map((s, i) => ({ s, i }))
  .sort((a, b) => b.s.length - a.s.length);
/** @param {string} source */
function encodeNative(source) {
  const encoded = [];
  for (let text of source.match(/[A-Za-z]+/g) || []) {
    text = text.toUpperCase().replace(/QU/g, "CW").replace(/V/g, "U")
      .replace(/K/g, "C").replace(/Z/g, "S").replace(/Q/g, "C");
    const word = [];
    for (let pos = 0; pos < text.length;) {
      const part = translit.find((entry) => text.startsWith(entry.s, pos));
      assert(part, "Unencoded English letter: " + text.slice(pos));
      word.push(part.i);
      pos += part.s.length;
    }
    if (word.length <= 14) encoded.push(word);
  }
  return encoded;
}
/** @param {number[]} obs @param {number[]} mu */
function poissonDeviance(obs, mu) {
  let score = 0;
  for (let c = 0; c < 3; c++) {
    const o = obs[c], e = mu[c];
    if (e === 0) {
      if (o) return Infinity;
    } else {
      score += 2 * (o ? o * Math.log(o / e) - o + e : e);
    }
  }
  return score;
}
/** @param {number} seed */
function seededRandom(seed) {
  let s = seed >>> 0;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return s >>> 0;
  };
}
/**
 * @param {string} name
 * @param {string} text
 * @param {number} seed
 */
function runCorpus(name, text, seed) {
  const tokens = encodeNative(text);
  const pool = new Map();
  for (const word of tokens) {
    if (!pool.has(word.length)) pool.set(word.length, []);
    pool.get(word.length).push(word);
  }
  const positionRates = new Map();
  for (const [length, list] of pool) {
    const table = Array.from({ length }, () => new Float64Array(29));
    for (const word of list) {
      for (let j = 0; j < length; j++) table[j][word[j]] += 1 / list.length;
    }
    positionRates.set(length, table);
  }
  const expected = Array.from({ length: 29 }, () => [0, 0, 0]);
  for (const w of printWords) {
    const rates = positionRates.get(w.length);
    assert(rates && pool.get(w.length).length, "Missing native word length " + w.length);
    for (let j = 0; j < w.length; j++) {
      if (pageStarts.has(w.begin + j)) continue;
      const c = role(j, w.length);
      for (let r = 0; r < 29; r++) expected[r][c] += rates[j][r];
    }
  }
  const ranked = expected.map((mu, r) => ({
    rune: gp.translit[r], index: r,
    expected: mu.map((v) => Number(v.toFixed(3))),
    deviance: poissonDeviance(observed, mu)
  })).sort((a, b) => a.deviance - b.deviance);

  // Native-word positive controls preserve all 2,896 original word lengths
  // and all 55 physical page starts. Each 29-rune hypothesis is planted in
  // 250 independently sampled word-books. Both parameter selection and
  // the original are scored using the same fixed three-role deviance.
  const random = seededRandom(seed);
  let maxPlantedTrue = 0;
  let maxPlantedBest = 0;
  const plants = 250;
  for (let trial = 0; trial < plants; trial++) {
    const siteCounts = Array.from({ length: 29 }, () => [0, 0, 0]);
    for (const w of printWords) {
      const list = pool.get(w.length);
      const chosen = list[random() % list.length];
      for (let j = 0; j < w.length; j++) {
        if (!pageStarts.has(w.begin + j)) siteCounts[chosen[j]][role(j, w.length)]++;
      }
    }
    for (let r = 0; r < 29; r++) {
      const d = poissonDeviance(siteCounts[r], expected[r]);
      if (d > maxPlantedTrue) maxPlantedTrue = d;
      let best = Infinity;
      for (let k = 0; k < 29; k++) {
        best = Math.min(best, poissonDeviance(siteCounts[r], expected[k]));
      }
      if (best > maxPlantedBest) maxPlantedBest = best;
    }
  }
  assert(ranked[0].deviance > maxPlantedBest,
    "Original unexpectedly overlaps calibrated native cumulative plants");
  return {
    corpus: name, tokens: tokens.length,
    observed, best: ranked.slice(0, 5),
    plants: plants * 29,
    maximumNativeTrueDeviance: Number(maxPlantedTrue.toFixed(3)),
    maximumNativeBestDeviance: Number(maxPlantedBest.toFixed(3))
  };
}
/** Positive control: exact secret multiplicative GP29 step inverse. */
function proveCipherIdentity() {
  const plaintext = sourceNumbers.slice();
  const markerRune = 21;
  const c = new Array(plaintext.length);
  const inverses = Array(29).fill(0);
  for (let k = 1; k < 29; k++) {
    inverses[k] = Array.from({ length: 28 }, (_, i) => i + 1)
      .find((v) => (v * k) % 29 === 1);
  }
  let pageNo = 0, checked = 0;
  for (let i = 0; i < plaintext.length; i++) {
    if (pageStarts.has(i)) {
      c[i] = (7 + 11 * pageNo++) % 29;
      continue;
    }
    const key = 1 + ((i * 17 + 3) % 28);
    c[i] = (c[i - 1] + key * ((plaintext[i] - markerRune + 29) % 29)) % 29;
    assert.equal(c[i] === c[i - 1], plaintext[i] === markerRune);
    const recovered = (markerRune +
      inverses[key] * ((c[i] - c[i - 1] + 29) % 29)) % 29;
    assert.equal(recovered, plaintext[i]);
    checked++;
  }
  assert.equal(checked, 12901);
  return { recovered: checked, markerRune: gp.translit[markerRune] };
}

console.log(JSON.stringify({
  source: { runes: 12956, words: 2896, pageStarts: 55,
    equalPredecessorEvents: 86, observedRoles: observed },
  positive: proveCipherIdentity()
}, null, 2));
const corpora = [
  ["Shakespeare", "resources/control/shakespeare_first300k.txt", 0x330101],
  ["Emerson", "resources/control/emerson_essays_2944.txt", 0x330102],
  ["Gibran", "resources/control/gibran_prophet_58585.txt", 0x330103]
];
const combined = [];
for (const [name, file, seed] of corpora) {
  const source = read(file);
  combined.push(source);
  console.log(JSON.stringify(runCorpus(name, source, seed), null, 2));
}
console.log(JSON.stringify(runCorpus("combined", combined.join("\n"), 0x330104), null, 2));
