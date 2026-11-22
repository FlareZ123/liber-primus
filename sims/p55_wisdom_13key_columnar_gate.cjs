"use strict";
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const ROOT = path.join(__dirname, "..");
const M = 29;
const KEY_TEXT = "CABALUOIDFORM";
function encode(source, corpus) {
  const tokens = corpus.translit.slice().sort((a, b) => b.length - a.length);
  const ids = new Map(corpus.translit.map((token, i) => [token, i]));
  const text = source.toUpperCase().replace(/QU/g, "CW").replace(/V/g, "U").replace(/K/g, "C").replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < text.length;) {
    if (text[i] < "A" || text[i] > "Z") { i++; continue; }
    let matched = false;
    for (const token of tokens) if (text.startsWith(token, i)) {
      out.push(ids.get(token)); i += token.length; matched = true; break;
    }
    if (!matched) throw new Error("Unencodable GP source at " + i);
  }
  return out;
}
function columnOrder(key, descending = false) {
  const order = key.map((value, index) => ({ value, index }))
    .sort((a, b) => a.value - b.value || a.index - b.index).map(x => x.index);
  return descending ? order.reverse() : order;
}
function encryptColumnar(plain, order) {
  const width = order.length;
  const columns = Array.from({ length: width }, (_, col) => plain.filter((_, i) => i % width === col));
  return order.flatMap(col => columns[col]);
}
function decryptColumnar(cipher, order) {
  const width = order.length, rows = Math.ceil(cipher.length / width);
  const base = Math.floor(cipher.length / width), extra = cipher.length % width;
  const columns = Array(width); let cursor = 0;
  for (const col of order) {
    const length = base + (col < extra ? 1 : 0);
    columns[col] = cipher.slice(cursor, cursor + length); cursor += length;
  }
  const out = [];
  for (let row = 0; row < rows; row++) for (let col = 0; col < width; col++) {
    if (row < columns[col].length) out.push(columns[col][row]);
  }
  return out;
}
function trigramModel(data, alpha = 0.1) {
  const trigram = new Map(), bigram = new Map();
  for (let i = 2; i < data.length; i++) {
    const pair = data[i - 2] * M + data[i - 1], triple = pair * M + data[i];
    trigram.set(triple, (trigram.get(triple) || 0) + 1);
    bigram.set(pair, (bigram.get(pair) || 0) + 1);
  }
  return { trigram, bigram, alpha };
}
function trigramScore(data, model) {
  let score = 0;
  for (let i = 2; i < data.length; i++) {
    const pair = data[i - 2] * M + data[i - 1], triple = pair * M + data[i];
    score += Math.log(((model.trigram.get(triple) || 0) + model.alpha) /
      ((model.bigram.get(pair) || 0) + M * model.alpha));
  }
  return score / (data.length - 2);
}
function transliterate(data, corpus, limit = 60) {
  return data.slice(0, limit).map(i => corpus.translit[i]).join("");
}
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const shakespeare = encode(fs.readFileSync(path.join(ROOT, "resources/control/shakespeare_first300k.txt"), "utf8"), corpus);
const gibran = encode(fs.readFileSync(path.join(ROOT, "resources/control/gibran_prophet_58585.txt"), "utf8"), corpus);
const shakespeareModel = trigramModel(shakespeare), gibranModel = trigramModel(gibran);
const pages = corpus.pages.filter(p => p.page >= 0 && p.page <= 55 && p.indices.length).sort((a, b) => a.page - b.page);
const unknown = pages.flatMap(p => p.indices), p55 = pages.find(p => p.page === 55).indices;
const ids = new Map(corpus.translit.map((token, i) => [token, i]));
const key = Array.from(KEY_TEXT, rune => ids.get(rune));
if (key.some(x => x === undefined) || key.length !== 13) throw new Error("Unexpected 13-rune key encoding");
const variants = [];
for (const descending of [false, true]) {
  const order = columnOrder(key, descending);
  const plant = shakespeare.slice(0, unknown.length);
  assert.deepEqual(decryptColumnar(encryptColumnar(plant, order), order), plant);
  for (const [target, input] of [["p55", p55], ["full-unknown", unknown]]) {
    const plain = decryptColumnar(input, order);
    variants.push({
      keyReadOrder: descending ? "GP-descending" : "GP-ascending", target, symbols: plain.length,
      shakespeareTrigram: trigramScore(plain, shakespeareModel),
      gibranTrigram: trigramScore(plain, gibranModel),
      first60Runes: transliterate(plain, corpus)
    });
  }
}
console.log(JSON.stringify({
  hypothesis: "MIXING as a 13-columnar transposition keyed by CABALUOIDFORM",
  keyText: KEY_TEXT, keyIndices: key, gpColumnOrderAscending: columnOrder(key),
  unknownRunes: unknown.length, p55Runes: p55.length,
  uniformSymbolLogLikelihood: -Math.log(M),
  nativeReference: { shakespeare: trigramScore(shakespeare, shakespeareModel), gibran: trigramScore(gibran, gibranModel) },
  rawUnknown: { shakespeare: trigramScore(unknown, shakespeareModel), gibran: trigramScore(unknown, gibranModel) },
  roundTripControl: "passed for both column orders on 12,956 known-English symbols",
  variants
}, null, 2));
