"use strict";
/**
 * Complete all-secret word-local GP29 progressive-affine English gate.
 *
 * Test the exact family C[w,j] = a[w]*P[w,j] + b[w]*j + z[w] (mod29),
 * with an independent, unrestricted a=1..28, b=0..28 and z=0..28
 * on EACH printed original word. The first two letters algebraically
 * determine b and z for each a; no keys are guessed by a language model.
 *
 * Windows 11, Node 22: node sims/lp2_wordprogressive_allsecret_english_sft.cjs
 * This test reads existing immutable corpus files; it never writes them.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseLP2Words} = require("./lp2_word_pages.cjs");
const root = path.resolve(__dirname, "..");
/** @param {string} file @returns {string} */
function read(file) { return fs.readFileSync(path.join(root, file), "utf8"); }
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const parsed = parseLP2Words(read("resources/liber-primus/lp2-transcription.txt"));
assert.equal(parsed.words.length, 2896);
assert.equal(parsed.runeCount, 12956);
const index = new Map(gp.runes.map((x, i) => [x, i]));
const original = parsed.words.map(x => [...x.runes].map(ch => {
  const value = index.get(ch);
  assert.ok(Number.isInteger(value));
  return value;
}));
const long = original.filter(x => x.length >= 10);
assert.equal(long.length, 109);
const byLength = new Map();
for (const x of gp.translit.map((s, i) => ({s, i}))) {
  assert.ok(x.s.length >= 1);
}
const tokens = gp.translit.map((s, i) => ({s, i}))
  .sort((x, y) => y.s.length - x.s.length);
/** @param {number} n @returns {number} */
const mod = n => (n % 29 + 29) % 29;
/** @param {string} word @returns {number[]} */
function native(word) {
  const s = word.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const out = [];
  for (let j = 0; j < s.length;) {
    if (s.startsWith("ING", j)) { out.push(21); j += 3; }
    else if (s.startsWith("IO", j)) { out.push(27); j += 2; }
    else {
      const item = tokens.find(t => s.startsWith(t.s, j));
      assert.ok(item, "Unsupported native rune for " + word);
      out.push(item.i);
      j += item.s.length;
    }
  }
  return out;
}
for (const line of read("resources/control/english_wordfreq_textblob.txt").split(/\r?\n/u)) {
  const m = /^([a-z]+)\s+([0-9]+)$/.exec(line);
  if (!m) continue;
  const v = native(m[1]);
  if (!byLength.has(v.length)) byLength.set(v.length, []);
  byLength.get(v.length).push({word: m[1], p: v});
}
assert.equal([...byLength.values()].reduce((n, x) => n + x.length, 0), 29157);
/**
 * Return all source-exact secret affine-progressive keys sending P to C.
 * @param {number[]} p
 * @param {number[]} c
 * @returns {Array<{a:number,b:number,z:number}>}
 */
function allKeys(p, c) {
  assert.equal(p.length, c.length);
  assert.ok(p.length >= 2);
  const matches = [];
  for (let a = 1; a < 29; a++) {
    const b = mod(c[1] - c[0] - a * (p[1] - p[0]));
    const z = mod(c[0] - a * p[0]);
    let valid = true;
    for (let j = 2; j < p.length; j++) {
      if (mod(a * p[j] + b * j + z) !== c[j]) {
        valid = false;
        break;
      }
    }
    if (valid) matches.push({a, b, z});
  }
  return matches;
}
const lengths = [10, 11, 12, 13, 14];
const summary = [];
let testedWords = 0;
for (const length of lengths) {
  const originalWords = long.filter(x => x.length === length);
  const pool = byLength.get(length);
  assert.ok(pool && pool.length > 0);
  let originalCompatible = 0;
  for (const c of originalWords) {
    let possible = false;
    for (const {p} of pool) {
      if (allKeys(p, c).length > 0) {
        possible = true;
        break;
      }
    }
    originalCompatible += Number(possible);
    testedWords++;
  }
  summary.push({length, originalWords: originalWords.length,
    dictionaryWords: pool.length, originalCompatible});
}
assert.deepEqual(summary.map(x => x.originalWords), [52, 32, 18, 4, 3]);
assert.equal(testedWords, 109);
assert.equal(summary.reduce((n, x) => n + x.originalCompatible, 0), 0);

// Every original long-word length slot has a genuine native-English plant.
// Both the secret and word change from slot to slot. Check inverse and key.
let plantRecovered = 0;
for (let t = 0; t < long.length; t++) {
  const pool = byLength.get(long[t].length);
  const p = pool[(t * 101 + long[t].length * 31) % pool.length].p;
  const a = 1 + (t * 7 + 3) % 28;
  const b = (t * 11 + 5) % 29;
  const z = (t * 19 + 13) % 29;
  const c = p.map((x, j) => mod(a * x + b * j + z));
  const recovered = allKeys(p, c);
  assert.ok(recovered.some(key => key.a === a && key.b === b && key.z === z));
  const inverseA = Array.from({length: 28}, (_, i) => i + 1)
    .find(v => mod(v * a) === 1);
  assert.ok(inverseA);
  assert.deepEqual(c.map((x, j) => mod(inverseA * (x - b * j - z))), p);
  plantRecovered++;
}
assert.equal(plantRecovered, 109);
console.log(JSON.stringify({
  model: "C[w,j]=(a[w]*P[w,j]+b[w]*j+z[w]) mod29; independent word keys",
  source: "unmodified LP2 p0-p55 12956 GP runes in 2896 printed words",
  dictionary: "29157 source-native TextBlob English types; ING/IO single runes",
  allSecretKeysPerWord: 28 * 29 * 29,
  longWordResults: summary,
  originalsMatchingAnyOfAllKeys: 0,
  sourceShapedPositivePlants: plantRecovered,
  plaintextRecovered: false,
  scope: "Only the exact native-English finite register, preserved words and one-step affine progression"
}, null, 2));
