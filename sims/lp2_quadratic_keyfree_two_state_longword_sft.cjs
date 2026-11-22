"use strict";

/**
 * Source-native GP29 key-free quadratic *keystream* recurrence inverse.
 *
 * Original C = P + K (mod 29), with word-private unknown key seeds and
 * every unknown coefficient in the complete two-state quadratic family.
 * This is an autonomous key recurrence; unlike previous cfeedback
 * experiments, every nonlinear input here is the inferred key K, not C.
 *
 * One frozen original-word and dictionary scan; no key, tap, phase, nonce,
 * plaintext or event is fit outside the supplied native-GP word.
 *
 * Windows 11, Node.js 22 CommonJS, read-only single-file test:
 *   node sims/lp2_quadratic_keyfree_two_state_longword_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus, physicalLP2Page} =
  require("./lp2_word_pages.cjs");
const {encodeSourceNativeGP} =
  require("./lp2_native_gp_source_orthography_sft.cjs");
const root = path.resolve(__dirname, "..");
/** @param {string} name @returns {string} */
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const words = read("resources/control/dwyl-english-alpha-gp13-14-only.txt")
  .trim().split(/\r?\n/);
assert.equal(words.length, 29229);
const dictionary = new Map([[13, []], [14, []]]);
for (const word of words) {
  const plain = encodeSourceNativeGP(word);
  assert(dictionary.has(plain.length));
  dictionary.get(plain.length).push({word, plain});
}
assert.deepEqual([13, 14].map(n => dictionary.get(n).length),
  [17772, 11457]);

const rune = new Map(gp.runes.map((glyph, i) => [glyph, i]));
const original = parseSharedCorpus().words.filter(w => w.length >= 13)
  .map(w => ({
    physicalPage: physicalLP2Page(w.startPage),
    cipher: [...w.runes].map(g => rune.get(g))
  }));
assert.deepEqual(original.map(w => [w.physicalPage, w.cipher.length]),
  [[11,13],[13,14],[16,13],[25,14],[43,14],[52,13],[55,13]]);
const mod = x => ((x % 29) + 29) % 29;
const inverse = new Array(29).fill(0);
for (let a = 1; a < 29; a++) {
  for (let b = 1; b < 29; b++) {
    if (a * b % 29 === 1) inverse[a] = b;
  }
}
assert(inverse.slice(1).every(Boolean));

/**
 * Full model: K_i = a*K_prev^2 + b*K_prev*K_prev2
 *           + c*K_prev2^2 + d*K_prev + e*K_prev2 + f (mod29).
 * Nested squares model omits only the cross term.
 *
 * @param {number} x
 * @param {number} y
 * @param {"complete6"|"squares5"} family
 * @returns {number[]}
 */
function features(x, y, family) {
  return family === "complete6"
    ? [mod(x*x), mod(x*y), mod(y*y), x, y, 1]
    : [mod(x*x), mod(y*y), x, y, 1];
}

/**
 * Algebraically recover unknown quadratic coefficients from C-P.
 * For an inconsistent equation, no possible secret coefficients exist.
 * A rank-deficient compatible key would be reported separately rather
 * than silently called an impossibility.
 *
 * @param {number[]} key
 * @param {"complete6"|"squares5"} family
 * @returns {{status:"inconsistent"|"underdetermined"|"recovered",rank:number,taps?:number[]}}
 */
function recover(key, family) {
  const parameters = family === "complete6" ? 6 : 5;
  /** @type {(number[]|null)[]} */
  const basis = Array(parameters).fill(null);
  let rank = 0;
  for (let i = 2; i < key.length; i++) {
    const row = [
      ...features(key[i-1], key[i-2], family),
      key[i]
    ];
    let installed = false;
    for (let col = 0; col < parameters; col++) {
      if (row[col] === 0) continue;
      const pivot = basis[col];
      if (pivot === null) {
        const scale = inverse[row[col]];
        for (let j = col; j <= parameters; j++)
          row[j] = mod(row[j] * scale);
        basis[col] = row;
        rank++;
        installed = true;
        break;
      }
      const factor = row[col];
      for (let j = col; j <= parameters; j++)
        row[j] = mod(row[j] - factor * pivot[j]);
    }
    if (!installed && row[parameters] !== 0)
      return {status:"inconsistent",rank};
  }
  if (rank !== parameters)
    return {status:"underdetermined",rank};
  const taps = Array(parameters).fill(0);
  for (let i = parameters - 1; i >= 0; i--) {
    let x = basis[i][parameters];
    for (let j = i+1; j < parameters; j++)
      x -= basis[i][j] * taps[j];
    taps[i] = mod(x);
  }
  return {status:"recovered",rank,taps};
}

/**
 * @param {number[]} seed Two arbitrary initial symbols.
 * @param {number[]} taps
 * @param {"complete6"|"squares5"} family
 * @param {number} length
 * @returns {number[]}
 */
function generateKey(seed, taps, family, length) {
  assert.equal(seed.length, 2);
  const key = seed.slice();
  for (let i = 2; i < length; i++) {
    const inputs = features(key[i-1], key[i-2], family);
    key.push(mod(taps.reduce(
      (sum, tap, j) => sum + tap * inputs[j], 0)));
  }
  return key;
}

const positivePlain = encodeSourceNativeGP("CIRCUMFERENCES");
assert.equal(positivePlain.length, 14);
assert(gp.pages.find(p => p.page === 57).indices.join(",")
  .includes(positivePlain.join(",")));
const controls = {};
for (const [family, secretTaps] of [
  ["complete6", [11,26,8,15,2,17]],
  ["squares5", [15,11,8,2,17]]
]) {
  const plantedKey = generateKey([13,23], secretTaps,
    family, positivePlain.length);
  const plantedCipher = positivePlain.map((x,i) => mod(x + plantedKey[i]));
  const recoveredKey = plantedCipher.map(
    (x,i) => mod(x - positivePlain[i]));
  const found = recover(recoveredKey, family);
  assert.equal(found.status,"recovered");
  assert.deepEqual(found.taps,secretTaps);
  const replay = generateKey(recoveredKey.slice(0,2),
    found.taps, family, recoveredKey.length);
  assert.deepEqual(replay, recoveredKey);
  assert.deepEqual(
    positivePlain.map((p,i)=>mod(p + replay[i])),plantedCipher);
  controls[family] = {word:"CIRCUMFERENCES",recoveredTaps:found.taps};
}

const results = {};
for (const family of ["complete6","squares5"]) {
  const totals = {
    inconsistent:0,underdetermined:0,recovered:0
  };
  const hits = [];
  for (const {physicalPage,cipher} of original) {
    for (const {word,plain} of dictionary.get(cipher.length)) {
      const key = cipher.map((x,i) => mod(x-plain[i]));
      const found = recover(key,family);
      totals[found.status]++;
      if (found.status === "recovered") {
        assert.deepEqual(
          generateKey(key.slice(0,2), found.taps, family, key.length),
          key);
        hits.push({physicalPage, word, taps:found.taps});
      }
    }
  }
  assert.deepEqual(totals,
    {inconsistent:105459,underdetermined:0,recovered:0});
  assert.deepEqual(hits,[]);
  results[family] = {totals,hits};
}
console.log(JSON.stringify({
  source:"7 unsolved LP2 native-rune words, source-independent 29,229 GP English words",
  candidateWordComparisons:105459,
  model:"word-private initial GP29 key values; all 6 quadratic polynomial coefficients free",
  controls, original:results,
  conclusion:"No original 13/14-rune native-English word is compatible with any two-state autonomous GF29 quadratic key recurrence, with or without the cross term; no creator key or unknown plaintext."
},null,2));
console.log("PASS: all-unknown-parameter two-state quadratic original-word gate");
