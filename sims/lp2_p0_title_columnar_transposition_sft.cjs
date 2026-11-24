"use strict";

/**
 * Bounded SFT: test the conditional 13-rune p0 title as a columnar
 * transposition key for the original 716-rune p0-p2 body.
 *
 * Run: node sims/lp2_p0_title_columnar_transposition_sft.cjs
 * Node.js 22+, CommonJS, built-ins only.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-p0-physical-ink-override.json"));

const selected = corpus.pages.filter(page => page.page <= 2).flatMap(page => page.indices);
assert.equal(selected.length, 729);
assert.deepEqual(ink.physical_zero_based.red_words.map(word => word.length), [8, 5]);
assert.equal(ink.physical_zero_based.large_punctuation[0].after_runes, 13);
assert.equal(ink.physical_zero_based.large_punctuation[0].dots, 13);
assert.deepEqual(ink.physical_zero_based.red_words.flatMap(word => word.gp_indices), selected.slice(0, 13));

const body = selected.slice(13);
const titleTokens = ["S", "E", "C", "U", "E", "N", "D", "I", "R", "A", "T", "I", "O"];
const titleIndices = titleTokens.map(token => {
  const i = corpus.translit.indexOf(token);
  assert.notEqual(i, -1, "missing GP29 token " + token);
  return i;
});
assert.equal(body.length, 716);
assert.equal(titleIndices.length, 13);
assert.equal(body.length, 13 * 55 + 1);

function encryptRowReadColumn(input, order) {
  const columns = Array.from({length: order.length}, () => []);
  for (let i = 0; i < input.length; i++) columns[i % order.length].push(input[i]);
  return order.flatMap(column => columns[column]);
}
function decryptColumnReadRow(input, order) {
  const width = order.length;
  const rows = Math.ceil(input.length / width);
  const remainder = input.length % width;
  const lengths = Array.from({length: width}, (_, column) =>
    Math.floor(input.length / width) + (remainder > 0 && column < remainder ? 1 : 0)
  );
  const columns = Array.from({length: width}, () => []);
  let offset = 0;
  for (const column of order) {
    columns[column] = input.slice(offset, offset + lengths[column]);
    offset += lengths[column];
  }
  const output = [];
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < width; column++) {
      if (row < columns[column].length) output.push(columns[column][row]);
    }
  }
  return output;
}
function letters(values) {
  return values.map(index => corpus.translit[index]).join("").replace(/[^A-Z]/g, "");
}
function buildTrigramModel(text) {
  const counts = new Map();
  for (let i = 0; i <= text.length - 3; i++) {
    const gram = text.slice(i, i + 3);
    counts.set(gram, (counts.get(gram) || 0) + 1);
  }
  return {counts, total: text.length - 2, vocabulary: 26 ** 3};
}
function trigramScore(text, model) {
  let score = 0;
  for (let i = 0; i <= text.length - 3; i++) {
    const gram = text.slice(i, i + 3);
    score += Math.log(((model.counts.get(gram) || 0) + 0.1) /
      (model.total + 0.1 * model.vocabulary));
  }
  return score / (text.length - 2);
}
function xorshift32(seed) {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return (x >>> 0) / 4294967296;
  };
}
function shuffleOrder(random) {
  const order = Array.from({length: 13}, (_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}
function stats(values) {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
  return {mean, sd: Math.sqrt(variance)};
}
function tailProbability(nullValues, observed) {
  return (nullValues.filter(value => value >= observed).length + 1) /
    (nullValues.length + 1);
}
function round(value) {
  return Number(value.toFixed(12));
}

const latinAscending = titleTokens
  .map((token, i) => ({token, i}))
  .sort((a, b) => a.token.charCodeAt(0) - b.token.charCodeAt(0) || a.i - b.i)
  .map(item => item.i);
const gp29Ascending = titleIndices
  .map((value, i) => ({value, i}))
  .sort((a, b) => a.value - b.value || a.i - b.i)
  .map(item => item.i);
const orders = {
  latinAscending,
  latinReversed: latinAscending.slice().reverse(),
  gp29Ascending,
  gp29Reversed: gp29Ascending.slice().reverse(),
};

const caesarText = read("resources/external/caesar-de-bello-civili-perseus-liber-primus-normalized.txt")
  .split(/\r?\n/).filter(line => !line.startsWith("#")).join(" ")
  .toUpperCase().replace(/[^A-Z]/g, "");
const shakespeareText = read("resources/control/shakespeare_first300k.txt")
  .toUpperCase().replace(/[^A-Z]/g, "");
const models = {
  latin: buildTrigramModel(caesarText),
  english: buildTrigramModel(shakespeareText),
};

const observed = [];
for (const [orderName, order] of Object.entries(orders)) {
  for (const direction of ["decrypt", "encrypt"]) {
    const output = direction === "decrypt"
      ? decryptColumnReadRow(body, order)
      : encryptRowReadColumn(body, order);
    const text = letters(output);
    observed.push({
      order: orderName,
      direction,
      latinScore: trigramScore(text, models.latin),
      englishScore: trigramScore(text, models.english),
      prefix: text.slice(0, 160),
    });
  }
}

const random = xorshift32(0x13c0a7);
const permutations = 5000;
const nulls = {
  decrypt: {latin: [], english: []},
  encrypt: {latin: [], english: []},
};
for (let i = 0; i < permutations; i++) {
  const order = shuffleOrder(random);
  for (const direction of ["decrypt", "encrypt"]) {
    const output = direction === "decrypt"
      ? decryptColumnReadRow(body, order)
      : encryptRowReadColumn(body, order);
    const text = letters(output);
    nulls[direction].latin.push(trigramScore(text, models.latin));
    nulls[direction].english.push(trigramScore(text, models.english));
  }
}
for (const result of observed) {
  const nullSet = nulls[result.direction];
  result.latinTail = tailProbability(nullSet.latin, result.latinScore);
  result.englishTail = tailProbability(nullSet.english, result.englishScore);
  result.latinScore = round(result.latinScore);
  result.englishScore = round(result.englishScore);
  result.latinTail = round(result.latinTail);
  result.englishTail = round(result.englishTail);
}
console.log(JSON.stringify({
  status: "bounded 13-column transposition negative; no LP2 plaintext recovered",
  bodyRunes: body.length,
  keyTokens: titleTokens,
  columns: 13,
  rows: 56,
  columnLengths: [56, ...Array(12).fill(55)],
  keyOrders: orders,
  nullPermutationCountPerDirection: permutations,
  nullSummary: {
    decryptLatin: stats(nulls.decrypt.latin),
    decryptEnglish: stats(nulls.decrypt.english),
    encryptLatin: stats(nulls.encrypt.latin),
    encryptEnglish: stats(nulls.encrypt.english),
  },
  observed,
}, null, 2));
