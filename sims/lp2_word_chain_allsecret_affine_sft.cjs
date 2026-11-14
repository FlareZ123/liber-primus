"use strict";
/**
 * Original-word GP29 predecessor-chain gate under fully independent word keys.
 *
 * For each printed word, d[i] is either:
 *  iv:     C[i]-C[i-1], i>=1; C[0] is an unrestricted IV
 *  direct: C[0], then C[i]-C[i-1], i>=1 (zero initial predecessor)
 *  cyclic: C[i]-C[(i-1) mod n], i=0..n-1 (closed walk)
 * All differences are mod29 and no plaintext-F bypass is assumed.
 *
 * Candidate families, with a freshly secret key for EVERY word:
 *  affine: d[i]=a*P[i]+b mod29, a nonzero, b arbitrary;
 *  arbitrary secret bijection: d[i]=pi(P[i]), any permutation of GP29.
 *
 * These are exact all-key finite-lexicon decisions, not decryption claims.
 * The independent source-native GP29 control uses authentic ING/IO spelling.
 * SFT: node sims/lp2_word_chain_allsecret_affine_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const {encodeSourceNativeGP} = require("./lp2_native_gp_source_orthography_sft.cjs");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const byRune = new Map(gp.runes.map((r, i) => [r, i]));
const regexp = new RegExp("[" + gp.runes.join("") + "]+", "gu");
const source = read("resources/lp2-transcription.txt").split("%")
  .slice(0, 55).join("%").replace(/\/\r?\n/g, "")
  .replace(/[\r\n%]/g, "");
const original = (source.match(regexp) || [])
  .map(word => Array.from(word, rune => byRune.get(rune)));
assert.equal(original.length, 2896);
assert.equal(original.flat().length, 12956);
const wordList = read("resources/control/english_wordfreq_textblob.txt")
  .split(/\r?\n/).filter(line => /^[a-z]+ \d+$/.test(line))
  .map(line => line.split(" ")[0]);
assert.equal(wordList.length, 29157);
const dictionary = wordList.map(word => ({
  word, gp: encodeSourceNativeGP(word)
}));
const long = original.filter(word => word.length >= 10 && word.length <= 14);
assert.equal(long.length, 109);
const mod = x => (x % 29 + 29) % 29;
const inverse = Array(29).fill(0);
for (let i = 1; i < 29; i++)
  for (let j = 1; j < 29; j++)
    if (i * j % 29 === 1) { inverse[i] = j; break; }
assert(inverse.slice(1).every(x => x > 0));

/** Canonical signature under every invertible affine GP29 relabeling. */
function affineSignature(v) {
  assert(v.length);
  const pivot = v.findIndex(x => x !== v[0]);
  if (pivot < 0) return v.length + ":constant";
  const factor = inverse[mod(v[pivot] - v[0])];
  return v.length + ":" + v.map(x =>
    mod((x - v[0]) * factor)).join(",");
}
/** Exact equality pattern, invariant under ANY GP29 permutation. */
function bijectionSignature(v) {
  const ids = new Map();
  return v.length + ":" + v.map(x => {
    if (!ids.has(x)) ids.set(x, ids.size);
    return ids.get(x);
  }).join(",");
}
/** @param {number[]} c @param {"iv"|"direct"|"cyclic"} mode */
function steps(c, mode) {
  assert(c.length);
  if (mode === "iv") return c.slice(1).map((v, j) => mod(v - c[j]));
  if (mode === "direct")
    return c.map((v, j) => j ? mod(v - c[j - 1]) : v);
  assert.equal(mode, "cyclic");
  return c.map((v, j) => mod(v - c[(j + c.length - 1) % c.length]));
}
const models = ["iv", "direct", "cyclic"];
const indices = {};
for (const mode of models) {
  const affine = new Map(), bijection = new Map();
  for (const item of dictionary) {
    const p = mode === "iv" ? item.gp.slice(1) : item.gp;
    if (!p.length) continue; // A one-rune word has no predecessor step.
    for (const [map, signature] of [
      [affine, affineSignature], [bijection, bijectionSignature]
    ]) {
      const key = signature(p);
      let choices = map.get(key);
      if (!choices) { choices = []; map.set(key, choices); }
      choices.push(item.word);
    }
  }
  indices[mode] = {affine, bijection};
}
const results = {};
for (const mode of models) {
  let affineMatches = 0, bijectionMatches = 0;
  const byLength = {};
  for (const c of long) {
    const d = steps(c, mode);
    const matchA = indices[mode].affine.has(affineSignature(d));
    const matchB = indices[mode].bijection.has(bijectionSignature(d));
    assert(!matchA || matchB);
    const entry = byLength[c.length] || (byLength[c.length] = {
      words: 0, affine: 0, secretBijection: 0
    });
    entry.words++;
    entry.affine += Number(matchA);
    entry.secretBijection += Number(matchB);
    affineMatches += Number(matchA);
    bijectionMatches += Number(matchB);
  }
  results[mode] = {
    totalLongWords: long.length, affineMatches,
    arbitrarySecretBijectionMatches: bijectionMatches,
    noNativeMatchUnderAnySecretBijection: long.length - bijectionMatches,
    byLength
  };
}
assert.deepEqual(
  models.map(m => [results[m].affineMatches,
    results[m].arbitrarySecretBijectionMatches]),
  [[0, 71], [0, 50], [0, 58]]
);

/**
 * Exact positive control: native-English source word, fresh independent
 * per-word secret a,b, original 109 word lengths. Circular paths require
 * b = -a*sum(P)/n so that their difference sequence closes.
 */
function plant(p, mode, ordinal) {
  const a = (ordinal * 11 + 3) % 28 + 1;
  const b = mode === "cyclic"
    ? mod(-a * p.reduce((s, x) => s + x, 0) * inverse[p.length])
    : (ordinal * 7 + 5) % 29;
  const d = p.map(x => mod(a * x + b));
  const initial = ordinal % 29, c = [];
  if (mode === "iv") {
    c.push(initial);
    for (let i = 1; i < p.length; i++) c.push(mod(c[i - 1] + d[i]));
    assert.deepEqual(steps(c, mode), d.slice(1));
  } else if (mode === "direct") {
    for (let i = 0; i < p.length; i++)
      c.push(mod((i ? c[i - 1] : 0) + d[i]));
    assert.deepEqual(steps(c, mode), d);
  } else {
    assert.equal(mod(d.reduce((s, x) => s + x, 0)), 0);
    c.push(initial);
    for (let i = 1; i < p.length; i++) c.push(mod(c[i - 1] + d[i]));
    assert.deepEqual(steps(c, mode), d);
  }
  const restored = steps(c, mode).map(v => mod((v - b) * inverse[a]));
  assert.deepEqual(restored, mode === "iv" ? p.slice(1) : p);
  return c;
}
const positives = {};
for (const mode of models) {
  let recovered = 0;
  for (let ordinal = 0; ordinal < long.length; ordinal++) {
    const n = long[ordinal].length;
    const pool = dictionary.filter(item => item.gp.length === n);
    assert(pool.length);
    const p = pool[(17 * ordinal + 3) % pool.length].gp;
    const c = plant(p, mode, ordinal);
    const d = steps(c, mode);
    assert(indices[mode].affine.has(affineSignature(d)));
    assert(indices[mode].bijection.has(bijectionSignature(d)));
    recovered++;
  }
  positives[mode] = recovered;
}
assert.deepEqual(positives, {iv: 109, direct: 109, cyclic: 109});
const output = {
  input: {unknownOriginalWords: original.length,
    originalRunes: original.flat().length, selectedWords: long.length,
    lexiconTypes: dictionary.length, sourceNativeOrthography: "ING/IO"},
  results, positiveControlWords: positives,
  conclusion: "No original long word has a source-native dictionary inverse under any word-independent affine mapping of the three GP29 chain-step definitions. Even arbitrary independent per-word bijections fail on 38, 59, or 51 long words respectively.",
  limits: "Finite 29,157-type source-native English lexicon, unchanged printed words and length, single bijection shared within each word, unmodified differences; nonlinear dynamic state, transformed boundaries and unrepresented plaintext languages remain open."
};
console.log(JSON.stringify(output, null, 2));
