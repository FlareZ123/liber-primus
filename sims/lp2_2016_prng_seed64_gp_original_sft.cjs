"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const load = (name) => fs.readFileSync(path.join(ROOT, name), "utf8");
const corpus = JSON.parse(load("resources/liber-primus/lp2-corpus.json"));
const signed = load("resources/historical/cicada2016-4gq25-outguess.asc");
const transcript = load("resources/lp2-transcription.txt");
const shakespeare = load("resources/control/shakespeare_first300k.txt");
const alphabet = corpus.translit.map((token, index) =>
  ({ token: token.toLowerCase(), index })).sort((a, b) =>
  b.token.length - a.token.length);
const MOD = (1n << 64n) - 1n;
const sourceWords = [
  "Its", "words", "are", "the", "map", "their", "meaning", "is",
  "the", "road", "and", "their", "numbers", "are", "the", "direction"
];

/** @param {string} word Plain alphabetic source token. @returns {number[]} */
function tokenize(word) {
  const source = word.toLowerCase().replace(/v/g, "u")
    .replace(/k/g, "c").replace(/z/g, "s");
  const indices = [];
  for (let i = 0; i < source.length;) {
    const token = alphabet.find((entry) => source.startsWith(entry.token, i));
    assert.ok(token, "Unknown GP transliteration in " + word);
    indices.push(token.index);
    i += token.token.length;
  }
  return indices;
}

/** @param {string} value Transcript. @returns {string[][]} */
function runeLines(value) {
  return value.split("%").flatMap((page) => page.split("/")).filter((line) =>
    /[ᚠ-᛿]/u.test(line)).map((line) =>
      [...line.matchAll(/[ᚠ-᛿]/gu)].map((match) => match[0]));
}
function recoverSeed() {
  const start = signed.indexOf("Hello.");
  const end = signed.indexOf("-----BEGIN PGP SIGNATURE-----");
  assert.ok(start >= 0 && end > start);
  const words = signed.slice(start, end).match(/(?<![A-Za-z0-9])[A-Za-z]+(?![A-Za-z0-9])/g) || [];
  const offset = words.indexOf("Its");
  assert.equal(words.length, 43);
  assert.deepEqual(words.slice(offset, offset + 16), sourceWords);
  const lines = runeLines(transcript);
  const tokens = sourceWords.map((word) => {
    const sum = tokenize(word).reduce((a, i) => a + corpus.prime[i], 0);
    const row = sum % 29;
    const col = Math.floor(sum / 29);
    const glyph = lines[row][col];
    const index = corpus.runes.indexOf(glyph);
    assert.ok(index >= 0);
    return index;
  });
  assert.deepEqual(tokens.map((i) => corpus.translit[i]), [
    "L", "C", "B", "P", "P", "R", "NG", "NG",
    "P", "A", "R", "R", "TH", "B", "P", "C"
  ]);
  const data = tokens.filter((_, i) => i < 4 || i > 6);
  assert.equal(data.length, 13);
  const seed = data.reduce((s, i) => 29n * s + BigInt(i), 0n);
  assert.equal(seed, 7144649572585460758n);
  return { seed, tokens, data };
}

/**
 * Four standard families, with only the source-derived state as seed.
 * The Java48 state is left-aligned; its high 32 bits are Java next(32),
 * while the low 32 bits expose a separate raw-state projection.
 * @param {"splitmix64"|"xorshift64star"|"lcg64"|"java48"} kind
 * @param {bigint} seed
 * @returns {()=>bigint}
 */
function generator(kind, seed) {
  let state = kind === "java48"
    ? (seed ^ 0x5deece66dn) & ((1n << 48n) - 1n) : seed;
  return () => {
    if (kind === "splitmix64") {
      state = (state + 0x9e3779b97f4a7c15n) & MOD;
      let z = state;
      z = ((z ^ (z >> 30n)) * 0xbf58476d1ce4e5b9n) & MOD;
      z = ((z ^ (z >> 27n)) * 0x94d049bb133111ebn) & MOD;
      return (z ^ (z >> 31n)) & MOD;
    }
    if (kind === "xorshift64star") {
      state ^= state >> 12n;
      state ^= (state << 25n) & MOD;
      state ^= state >> 27n;
      return (state * 2685821657736338717n) & MOD;
    }
    if (kind === "lcg64") {
      state = (state * 6364136223846793005n +
        1442695040888963407n) & MOD;
      return state;
    }
    state = (state * 25214903917n + 11n) & ((1n << 48n) - 1n);
    return state << 16n;
  };
}
/**
 * @param {bigint} output
 * @param {"hi"|"lo"} half
 * @param {"mod"|"scaled"} reduction
 */
function gpKey(output, half, reduction) {
  const word = Number(half === "hi"
    ? (output >> 32n) & 0xffffffffn : output & 0xffffffffn);
  return reduction === "mod" ? word % 29 :
    Math.floor(word * 29 / 4294967296);
}
/** @param {number} n @returns {number} */
function mod29(n) { return (n % 29 + 29) % 29; }
/** @param {number[]} symbols @param {number[][]} logMatrix */
function meanBigram(symbols, logMatrix) {
  let sum = 0;
  for (let i = 1; i < symbols.length; i++)
    sum += logMatrix[symbols[i - 1]][symbols[i]];
  return sum / (symbols.length - 1);
}
/** @param {number[]} symbols */
function ioc(symbols) {
  const counts = Array(29).fill(0);
  for (const i of symbols) counts[i]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (symbols.length * (symbols.length - 1));
}
/** @returns {number[]} */
function englishGP() {
  const text = shakespeare.toLowerCase().replace(/v/g, "u")
    .replace(/k/g, "c").replace(/z/g, "s");
  const tokens = [];
  for (let i = 0; i < text.length;) {
    const hit = alphabet.find((entry) => text.startsWith(entry.token, i));
    if (hit) { tokens.push(hit.index); i += hit.token.length; }
    else i++;
  }
  return tokens;
}
/** @param {number[]} data */
function trainBigram(data) {
  const counts = Array.from({ length: 29 }, () => Array(29).fill(0.2));
  for (let i = 1; i < data.length; i++)
    counts[data[i - 1]][data[i]]++;
  return counts.map((row) => {
    const total = row.reduce((a, b) => a + b, 0);
    return row.map((n) => Math.log(n / total));
  });
}
/**
 * @param {number[][]} pages
 * @param {{kind:string,half:string,reduction:string,sign:number,reset:boolean}} spec
 * @param {bigint} seed
 * @param {boolean} encrypt
 * @returns {number[][]}
 */
function transform(pages, spec, seed, encrypt = false) {
  const continuous = generator(spec.kind, seed);
  return pages.map((page) => {
    const draw = spec.reset ? generator(spec.kind, seed) : continuous;
    return page.map((symbol) => {
      const key = gpKey(draw(), spec.half, spec.reduction);
      return mod29(symbol + (encrypt ? -1 : 1) * spec.sign * key);
    });
  });
}

function main() {
  const { seed, data } = recoverSeed();
  const original = corpus.pages.filter((page) =>
    page.status === "unsolved" && page.indices.length);
  assert.equal(original.length, 55);
  assert.equal(original.reduce((n, page) => n + page.indices.length, 0), 12956);
  const pages = original.map((page) => page.indices);
  const english = englishGP();
  assert.ok(english.length > 200000);
  const logMatrix = trainBigram(english.slice(0, 120000));
  const models = [];
  for (const kind of ["splitmix64", "xorshift64star", "lcg64", "java48"])
    for (const half of ["hi", "lo"])
      for (const reduction of ["mod", "scaled"])
        for (const sign of [-1, 1])
          for (const reset of [false, true])
            models.push({ kind, half, reduction, sign, reset });
  assert.equal(models.length, 64);
  const tested = models.map((spec) => {
    const output = transform(pages, spec, seed);
    return { ...spec,
      p0: meanBigram(output[0], logMatrix),
      p1: meanBigram(output[1], logMatrix),
      p5: meanBigram(output[5], logMatrix),
      fullIoc: ioc(output.flat()),
      p0Head: output[0].slice(0, 30).map((i) =>
        corpus.translit[i]).join("")
    };
  }).sort((a, b) => b.p0 - a.p0);
  assert.ok(tested[0].p0 < -4.5, "Unexpected original-input candidate");
  const controlPages = pages.slice(0, 3);
  const control = english.slice(150000,
    150000 + controlPages.reduce((n, page) => n + page.length, 0));
  assert.equal(control.length, controlPages.reduce((n, page) =>
    n + page.length, 0));
  let cursor = 0;
  const native = controlPages.map((page) => {
    const segment = control.slice(cursor, cursor + page.length);
    cursor += page.length;
    return segment;
  });
  const hidden = {
    kind: "splitmix64", half: "hi", reduction: "scaled",
    sign: 1, reset: true
  };
  const planted = transform(native, hidden, seed, true);
  const results = models.map((spec) => {
    const decoded = transform(planted, spec, seed);
    const flat = decoded.flat();
    return { spec, score: meanBigram(flat, logMatrix),
      exact: flat.filter((v, i) => v === control[i]).length };
  }).sort((a, b) => b.score - a.score);
  assert.deepEqual(results[0].spec, hidden);
  assert.equal(results[0].exact, control.length);
  assert.deepEqual(transform(planted, hidden, seed), native);
  console.log(JSON.stringify({
    mode: "2016 message PRNG marker 13-GP base29 seed",
    remainingTokens: data.map((i) => corpus.translit[i]).join(" "),
    seedDecimal: seed.toString(), seedHex: seed.toString(16),
    originalCipherRrunes: 12956, models: models.length,
    originalBestByPage0: tested.slice(0, 8),
    englishBaseline: meanBigram(control, logMatrix),
    nativePlant: { length: control.length, trueRank: 1,
      trueScore: results[0].score, trueExact: results[0].exact,
      nextBestWrong: results[1].score }
  }, null, 2));
}
main();
