"use strict";

/**
 * Original LP2 all-secret per-word shift gate for a finite reversible,
 * ciphertext-history-affine GP29 model. Rejects the exact English dictionary
 * architecture for every secret per-word shift without key enumeration.
 *
 * SFT: node sims/lp2_twohistory_allsecret_wordshift_sft.cjs
 * Windows 11 / Node.js 22 / CommonJS / dependency-free.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");
const root = path.resolve(__dirname, "..");
const gp = JSON.parse(fs.readFileSync(
  path.join(root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const pages = gp.pages.filter(page => page.page <= 55 && page.indices.length);
const source = pages.flatMap(page => page.indices);
assert.equal(source.length, 12956);
assert.equal(pages.length, 55);
const runeMap = new Map(gp.runes.map((symbol, i) => [symbol, i]));
const parsed = parseSharedCorpus();
assert.equal(parsed.words.length, 2896);
assert.equal(parsed.crossPageWords, 32);
assert.equal(parsed.runeCount, source.length);
const words = [];
let position = 0;
for (const word of parsed.words) {
  const values = Array.from(word.runes, symbol => {
    assert(runeMap.has(symbol));
    return runeMap.get(symbol);
  });
  words.push({start: position, len: word.length, values,
    firstPage: word.startPage, lastPage: word.endPage});
  position += values.length;
}
assert.deepEqual(words.flatMap(word => word.values), source);
const mod = x => (x % 29 + 29) % 29;

const tokens = gp.translit.map((token, value) => ({token, value}))
  .sort((a, b) => b.token.length - a.token.length);
/**
 * Encode source-native GP runes following solved LP1 / clear p57 spelling.
 * @param {string} text
 * @returns {number[]}
 */
function encode(text) {
  const input = text.toUpperCase().replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const output = [];
  for (let i = 0; i < input.length;) {
    if (input.startsWith("ING", i)) {
      output.push(21);
      i += 3;
    } else if (input.startsWith("IO", i)) {
      output.push(27);
      i += 2;
    } else {
      const match = tokens.find(t => input.startsWith(t.token, i));
      if (!match) return [];
      output.push(match.value);
      i += match.token.length;
    }
  }
  return output;
}

/**
 * Return differences from the first symbol; invariant under any unknown
 * additive shift common to all positions in a printed word.
 * @param {number[]} runes
 * @returns {string}
 */
function signature(runes) {
  return runes.slice(1)
    .map(v => String.fromCharCode(65 + mod(v - runes[0]))).join("");
}

const lex = Array.from({length: 30}, () => new Set());
const forms = Array.from({length: 30}, () => []);
const lines = fs.readFileSync(
  path.join(root, "resources", "control", "english_wordfreq_textblob.txt"),
  "utf8").split(/\r?\n/);
for (const line of lines) {
  const match = /^([a-z]+)\s+(\d+)$/.exec(line);
  if (!match || Number(match[2]) === 0) continue;
  const p = encode(match[1]);
  if (!p.length || p.length >= lex.length) continue;
  lex[p.length].add(signature(p));
  forms[p.length].push(p);
}
const eligible = words.filter(word => word.len >= 5);
assert.equal(eligible.length, 1132);
const eligibleTrain = eligible.filter(word => word.firstPage <= 2);
const eligibleHoldout = eligible.filter(
  word => word.firstPage >= 40 && word.firstPage <= 53);
assert.equal(eligibleTrain.length, 69);
assert.equal(eligibleHoldout.length, 280);
for (const word of words) assert(forms[word.len].length > 0);

/**
 * A secret per-word shift disappears from each local difference:
 *
 * P[i] = C[i] - a*C[i-1] - b*C[i-5] - K[word(i)] mod29.
 *
 * For word5, C[i-5] is zero at word positions j<5. For global5,
 * the fifth predecessor is continuous across genuine word/page carries.
 *
 * @param {number[]} cipher
 * @param {"word5"|"global5"} lag
 * @param {number} a
 * @param {number} b
 * @returns {{train:number,holdout:number,total:number}}
 */
function countWordSignatures(cipher, lag, a, b) {
  let train = 0;
  let holdout = 0;
  let total = 0;
  for (const word of eligible) {
    const out = [];
    for (let j = 0; j < word.len; j++) {
      const i = word.start + j;
      const prev = i ? cipher[i - 1] : 0;
      const fifth = i >= 5 && (lag === "global5" || j >= 5)
        ? cipher[i - 5] : 0;
      out.push(mod(cipher[i] - a * prev - b * fifth));
    }
    if (lex[word.len].has(signature(out))) {
      total++;
      if (word.firstPage <= 2) train++;
      if (word.firstPage >= 40 && word.firstPage <= 53) holdout++;
    }
  }
  return {train, holdout, total};
}

/**
 * Original cipher must be regenerated recursively, since the two history
 * inputs depend on earlier emitted ciphertext, not plaintext.
 * @param {number[]} plain
 * @param {"word5"|"global5"} lag
 * @param {number} a
 * @param {number} b
 * @returns {number[]}
 */
function encrypt(plain, lag, a, b) {
  const cipher = Array.from({length: plain.length}, () => 0);
  for (let wi = 0; wi < words.length; wi++) {
    const word = words[wi];
    const key = mod(7 * wi + 13);
    for (let j = 0; j < word.len; j++) {
      const i = word.start + j;
      const prev = i ? cipher[i - 1] : 0;
      const fifth = i >= 5 && (lag === "global5" || j >= 5)
        ? cipher[i - 5] : 0;
      cipher[i] = mod(plain[i] + a * prev + b * fifth + key);
    }
  }
  return cipher;
}

const results = [];
for (const lag of ["word5", "global5"]) {
  for (let a = 0; a < 29; a++) {
    for (let b = 0; b < 29; b++) {
      results.push({lag, a, b,
        ...countWordSignatures(source, lag, a, b)});
    }
  }
}
assert.equal(results.length, 1682);
const sorted = [...results].sort(
  (a, b) => b.train - a.train || b.holdout - a.holdout);
const max = f => Math.max(...results.map(x => x[f]));
assert.equal(max("train"), 1);
assert.equal(max("holdout"), 3);
assert.equal(max("total"), 7);

const knownPlain = [];
for (let wi = 0; wi < words.length; wi++) {
  const formsForLength = forms[words[wi].len];
  knownPlain.push(...formsForLength[(wi * 19 + 7) % formsForLength.length]);
}
assert.equal(knownPlain.length, source.length);
const selected = {a: 5, b: 13, lag: "word5"};
const plantC = encrypt(knownPlain, selected.lag, selected.a, selected.b);
const plant = countWordSignatures(plantC, selected.lag,
  selected.a, selected.b);
assert.deepEqual(plant, {train: 69, holdout: 280, total: 1132});
const plantWrong = countWordSignatures(plantC, selected.lag, 6, 13);
assert(plantWrong.total < plant.total);

// Test full exact GP29 original length reconstruction with independently
// selected secret shifts, rather than treating an automatic wrong-key
// reencryption as evidence of a historical cipher.
const recovered = Array.from({length: source.length}, () => 0);
for (let wi = 0; wi < words.length; wi++) {
  const word = words[wi];
  const shift = mod(7 * wi + 13);
  for (let j = 0; j < word.len; j++) {
    const i = word.start + j;
    const prev = i ? plantC[i - 1] : 0;
    const fifth = j >= 5 ? plantC[i - 5] : 0;
    recovered[i] = mod(plantC[i] - 5 * prev - 13 * fifth - shift);
  }
}
assert.deepEqual(recovered, knownPlain);
assert.deepEqual(encrypt(recovered, selected.lag, selected.a,
  selected.b), plantC);

console.log(JSON.stringify({
  status: "complete exact finite original-input gate; no unknown plaintext",
  source: {runes: source.length, words: words.length,
    carriedWords: parsed.crossPageWords, eligibleLongWords: eligible.length,
    trainLongWords: eligibleTrain.length,
    heldoutLongWords: eligibleHoldout.length},
  model: "P=C-a*Cprev-b*Cfive-Kword mod29",
  original: {globalCoefficientPairs: 29 * 29,
    lagChoices: 2, models: results.length,
    independentSecretWordShifts: words.length,
    maximumTrainLongwordMatches: max("train"),
    maximumHoldoutLongwordMatches: max("holdout"),
    maximumAllLongwordMatches: max("total"),
    highestTrain: sorted.slice(0, 5)},
  positive: {selected, totalSourceShapedRunes: recovered.length,
    fullOriginalShapeWordMatches: plant.total,
    train: plant.train, heldout: plant.holdout,
    wrongCoefficientWordMatches: plantWrong.total,
    exactInverseAndForward: true}
}, null, 2));
