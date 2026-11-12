"use strict";

/**
 * Single-file, read-only SFT for a two-pass 3-then-5 whole-word columnar
 * inverse selected only by the original p40 red heading's 3|5 word split.
 *
 * This is a hypothesis gate, not a claim of solved LP2 plaintext.
 * Run: node sims/lp2_p40_red35_twopass_word_columnar_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} file */
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const runeSet = new Set(gp.runes);
const tokens = gp.translit.slice().sort((a, b) => b.length - a.length);

/** @returns {{page: number, runes: string, length: number}[]} */
function parseWords() {
  const text = read("resources/liber-primus/lp2-transcription.txt")
    .split("%").slice(0, 55).join("%");
  const words = [];
  let page = 0;
  let current = "";
  let first = 0;
  const close = () => {
    if (current) {
      words.push({page: first, runes: current, length: current.length});
      current = "";
    }
  };
  for (const c of text) {
    if (runeSet.has(c)) {
      if (!current) first = page;
      current += c;
    } else if (c === "%") page++;
    else if (c !== "/" && !/\s/u.test(c)) close();
  }
  close();
  assert.equal(words.length, 2896);
  assert.equal(words.reduce((a, w) => a + w.length, 0), 12956);
  return words;
}

/**
 * GP-normalized full-word rune counts, with the same conventions as the
 * repository's independently trained native word-order controls.
 * @param {string} text
 * @returns {number[]}
 */
function gpLengths(text) {
  return (text.toUpperCase().match(/[A-Z]+/g) || []).map(raw => {
    const word = raw.replace(/QU/g, "CW").replace(/V/g, "U")
      .replace(/[KQ]/g, "C").replace(/Z/g, "S").replace(/ING/g, "NG");
    let n = 0;
    for (let at = 0; at < word.length;) {
      const token = tokens.find(t => word.startsWith(t, at));
      assert(token, "Unknown GP token in " + word);
      at += token.length;
      n++;
    }
    return n;
  });
}
/** @param {number} n */
const category = n => n <= 4 ? n - 1 : n <= 6 ? 4 : n <= 8 ? 5 : 6;

/**
 * @param {number[]} source
 * @returns {number[]} Seven-by-seven flattened source syntax model
 */
function grammarModel(source) {
  const pairs = Array.from({length: 7}, () => Array(7).fill(1));
  const row = Array(7).fill(7);
  const col = Array(7).fill(7);
  let total = 49;
  for (let i = 1; i < source.length; i++) {
    const x = category(source[i - 1]);
    const y = category(source[i]);
    pairs[x][y]++;
    row[x]++;
    col[y]++;
    total++;
  }
  return pairs.flatMap((values, x) => values.map((n, y) =>
    Math.log2((n / row[x]) / (col[y] / total))));
}

/** @param {number[]} classes @param {number[]} permutation @param {number[]} model */
function score(classes, permutation, model) {
  let acc = 0;
  let previous = classes[permutation[0]];
  for (let i = 1; i < permutation.length; i++) {
    const next = classes[permutation[i]];
    acc += model[previous * 7 + next];
    previous = next;
  }
  return acc / (permutation.length - 1);
}

/** 
 * @param {number} n
 * @param {number[]} order Ranked original red runes, one column per label.
 * @returns {number[]} Index map for classic ragged columnar inverse.
 */
function inverseMap(n, order) {
  const width = order.length;
  const sizes = Array.from({length: width}, (_, col) =>
    Math.floor(n / width) + (col < n % width ? 1 : 0));
  const columns = Array.from({length: width}, () => []);
  let at = 0;
  for (const col of order) {
    columns[col] = Array.from({length: sizes[col]}, (_, i) => at + i);
    at += sizes[col];
  }
  assert.equal(at, n);
  const out = [];
  for (let row = 0; row < Math.ceil(n / width); row++)
    for (let col = 0; col < width; col++)
      if (row < columns[col].length) out.push(columns[col][row]);
  assert.equal(out.length, n);
  assert.equal(new Set(out).size, n);
  return out;
}
/** @param {number[]} a @param {number[]} b */
const compose = (a, b) => a.map(i => b[i]);
/** @template T @param {T[]} values @param {number[]} index @returns {T[]} */
const apply = (values, index) => index.map(i => values[i]);
/** @param {number[]} index */
function inversePermutation(index) {
  const result = Array(index.length);
  index.forEach((v, i) => { result[v] = i; });
  assert.equal(new Set(result).size, index.length);
  return result;
}

const words = parseWords();
const chapter = words.filter(w => w.page >= 40 && w.page <= 52);
const redHeading = chapter.slice(0, 2)
  .flatMap(w => [...w.runes].map(r => gp.runes.indexOf(r)));
assert.deepEqual(redHeading, [0, 9, 19, 26, 6, 23, 25, 8]);
assert.deepEqual(redHeading, gp.pages[40].indices.slice(0, 8));
assert.deepEqual(chapter.slice(0, 2).map(w => w.length), [3, 5]);
const body = chapter.slice(2);
assert.equal(chapter.length, 669);
assert.equal(body.length, 667);
assert.equal(body.reduce((n, w) => n + w.length, 0), 3000);

const sorted = values => values.map((_, i) => i)
  .sort((a, b) => values[a] - values[b]);
const order3 = sorted(redHeading.slice(0, 3));
const order5 = sorted(redHeading.slice(3));
assert.deepEqual(order3, [0, 1, 2]);
assert.deepEqual(order5, [1, 4, 2, 3, 0]);
const raw = Array.from({length: body.length}, (_, i) => i);
const d3 = inverseMap(body.length, order3);
const d5 = inverseMap(body.length, order5);
const methods = {
  unchanged: raw,
  only3: d3,
  only5: d5,
  decode3then5: compose(d5, d3),
  decode5then3: compose(d3, d5)
};
for (const [name, map] of Object.entries(methods)) {
  assert.deepEqual(apply(apply(body, map), inversePermutation(map)),
    body, "Full 667-word roundtrip failure in " + name);
}

const control = {
  LP1: gpLengths(read("resources/liber-primus/lp1-plaintext-reference.txt")),
  Gibran: gpLengths(read("resources/control/gibran_prophet_58585.txt")),
  Emerson: gpLengths(read("resources/control/emerson_essays_2944.txt"))
};
assert.deepEqual(Object.fromEntries(Object.entries(control)
  .map(([name, words]) => [name, words.length])),
{LP1: 904, Gibran: 15733, Emerson: 77932});
const models = Object.fromEntries(Object.entries(control)
  .map(([name, values]) => [name, grammarModel(values)]));
const classes = body.map(w => category(w.length));
const names = Object.keys(models);
const operators = Object.keys(methods);
const observed = Object.fromEntries(names.map(name => [name,
  Object.fromEntries(operators.map(op =>
    [op, score(classes, methods[op], models[name])]))]));
const nullScores = Object.fromEntries(names.map(name =>
  [name, Object.fromEntries(operators.map(op => [op, []]))]));

let seed = 0x33553355;
/** @param {number} n */
function randomIndex(n) {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return (seed >>> 0) % n;
}
const samples = 20000;
for (let trial = 0; trial < samples; trial++) {
  const shuffle = classes.slice();
  for (let i = shuffle.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1);
    [shuffle[i], shuffle[j]] = [shuffle[j], shuffle[i]];
  }
  for (const name of names)
    for (const op of operators)
      nullScores[name][op].push(score(shuffle, methods[op], models[name]));
}
const meanSd = {};
const results = {};
for (const name of names) {
  results[name] = {};
  meanSd[name] = {};
  for (const op of operators) {
    const data = nullScores[name][op];
    const mean = data.reduce((a, b) => a + b, 0) / samples;
    const sd = Math.sqrt(data.reduce(
      (a, b) => a + (b - mean) ** 2, 0) / samples);
    meanSd[name][op] = {mean, sd};
    const value = observed[name][op];
    results[name][op] = {
      bitsPerPair: value,
      standardizedZ: (value - mean) / sd,
      nullUpperTail: (1 + data.filter(x => x >= value).length) / (1 + samples)
    };
  }
}
/** @param {string} op @param {number} trial */
const combined = (op, trial) => names.reduce((sum, name) =>
  sum + (nullScores[name][op][trial] - meanSd[name][op].mean) /
  meanSd[name][op].sd, 0) / names.length;
const target = names.reduce((sum, name) =>
  sum + results[name].decode3then5.standardizedZ, 0) / names.length;
let uncorrected = 0;
let familywise = 0;
for (let trial = 0; trial < samples; trial++) {
  if (combined("decode3then5", trial) >= target) uncorrected++;
  if (Math.max(...operators.slice(1).map(op =>
    combined(op, trial))) >= target) familywise++;
}
const combinedP = (uncorrected + 1) / (samples + 1);
const familywiseP = (familywise + 1) / (samples + 1);
assert(Math.abs(target - 1.4684847189319592) < 1e-9);
assert(Math.abs(combinedP - 0.03094845257737113) < 1e-9);
assert(Math.abs(familywiseP - 0.11584420778961052) < 1e-9);

// A positive grammar-control roundtrip under BOTH historically visible widths.
for (const name of names) {
  const plant = control[name].slice(0, body.length);
  assert.deepEqual(apply(apply(plant, methods.decode3then5),
    inversePermutation(methods.decode3then5)), plant);
  assert.deepEqual(apply(apply(plant, methods.decode5then3),
    inversePermutation(methods.decode5then3)), plant);
}

console.log(JSON.stringify({
  source: "Original physical pp40–53, full words after first red 3+5",
  headingIndices: redHeading, order3, order5,
  bodyWords: body.length, bodyRunes: 3000,
  tests: results,
  candidate: "decode3then5",
  threeReferenceMeanZ: target,
  candidateUncorrectedUpperTail: combinedP,
  fourOperationFamilywiseUpperTail: familywiseP,
  fixedSeed: "0x33553355", samples,
  conclusion: "Only exploratory word-length improvement; no statistically " +
    "convincing three-control familywise syntax or recovered plaintext"
}, null, 2));
