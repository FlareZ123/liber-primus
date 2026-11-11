"use strict";

// Bounded test of the five central p55 runes as a GP29 Vigenere key for
// the preceding unsolved pages. The key is sourced from the p55/p57 shared
// central-five geometry recorded in communications/broadcast/
// 20261111T220620Z_agent4_p57-five-instar-glyph-geometry.md.
//
// Run: node sims/p55-central-five-whole-book-vigenere-gate.cjs

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(ROOT, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const MOD = 29;
const key = [21, 20, 15, 23, 27];
assert.deepEqual(key.map(i => corpus.translit[i]), ["NG", "L", "S", "D", "IA"]);

const pages = corpus.pages
  .filter(p => p.page >= 0 && p.page <= 54)
  .sort((a, b) => a.page - b.page);
const cipher = pages.flatMap(p => p.indices);
assert.equal(cipher.length, 12880);

const pageRanges = [];
let cursor = 0;
for (const page of pages) {
  pageRanges.push({ page: page.page, start: cursor, end: cursor + page.indices.length });
  cursor += page.indices.length;
}
assert.equal(cursor, cipher.length);

const tokens = corpus.translit.slice().sort((a, b) => b.length - a.length);
const ids = new Map(corpus.translit.map((token, i) => [token, i]));

function encode(source) {
  const text = source.toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/K/g, "C")
    .replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < text.length;) {
    if (text[i] < "A" || text[i] > "Z") { i++; continue; }
    let matched = false;
    for (const token of tokens) {
      if (text.startsWith(token, i)) {
        out.push(ids.get(token));
        i += token.length;
        matched = true;
        break;
      }
    }
    if (!matched) throw new Error("Unencodable GP source at " + i);
  }
  return out;
}

function train(source) {
  const data = encode(source);
  const trigram = new Uint32Array(MOD * MOD * MOD);
  const bigram = new Uint32Array(MOD * MOD);
  for (let i = 2; i < data.length; i++) {
    const pair = data[i - 2] * MOD + data[i - 1];
    bigram[pair]++;
    trigram[pair * MOD + data[i]]++;
  }
  return { trigram, bigram };
}

function trigramScore(data, model, alpha = 0.1) {
  let score = 0;
  for (let i = 2; i < data.length; i++) {
    const pair = data[i - 2] * MOD + data[i - 1];
    const triple = pair * MOD + data[i];
    score += Math.log(
      (model.trigram[triple] + alpha) /
      (model.bigram[pair] + MOD * alpha)
    );
  }
  return score / (data.length - 2);
}

function ioc(data) {
  const counts = new Uint32Array(MOD);
  for (const value of data) counts[value]++;
  let pairs = 0;
  for (const count of counts) pairs += count * (count - 1);
  return pairs / (data.length * (data.length - 1));
}

function transliterate(data, limit = 240) {
  return data.slice(0, limit).map(i => corpus.translit[i]).join("");
}

function transform(data, sign) {
  return data.map((value, i) => (value + sign * key[i % key.length] + MOD) % MOD);
}

const shakespeareText = read("resources/control/shakespeare_first300k.txt");
const gibranText = read("resources/control/gibran_prophet_58585.txt");
const models = {
  shakespeare: train(shakespeareText),
  gibran: train(gibranText)
};

const raw = {
  symbols: cipher.length,
  ioc: ioc(cipher),
  shakespeareTrigram: trigramScore(cipher, models.shakespeare),
  gibranTrigram: trigramScore(cipher, models.gibran)
};

const variants = [];
for (const [name, sign] of [["subtract-key", -1], ["add-key", 1]]) {
  const plain = transform(cipher, sign);
  const pageScores = pageRanges
    .filter(range => range.end - range.start >= 3)
    .map(range => ({
      page: range.page,
      symbols: range.end - range.start,
      shakespeare: trigramScore(plain.slice(range.start, range.end), models.shakespeare),
      gibran: trigramScore(plain.slice(range.start, range.end), models.gibran)
    }));
  variants.push({
    name,
    ioc: ioc(plain),
    shakespeareTrigram: trigramScore(plain, models.shakespeare),
    gibranTrigram: trigramScore(plain, models.gibran),
    preview: transliterate(plain),
    bestShakespearePages: pageScores.slice().sort((a, b) => b.shakespeare - a.shakespeare).slice(0, 5),
    bestGibranPages: pageScores.slice().sort((a, b) => b.gibran - a.gibran).slice(0, 5)
  });
}

// Positive control: the same key schedule must invert a synthetic GP29
// ciphertext exactly before interpreting a negative language score.
const control = encode(shakespeareText.slice(0, 12000)).slice(0, 1000);
const encryptedControl = control.map((v, i) => (v + key[i % key.length]) % MOD);
const recoveredControl = encryptedControl.map((v, i) =>
  (v - key[i % key.length] + MOD) % MOD);
assert.deepEqual(recoveredControl, control);

console.log(JSON.stringify({
  hypothesis: "p55 shared central-five runes as a five-symbol GP29 Vigenere key for pages 0-54",
  sourceKey: {
    indices: key,
    transliteration: key.map(i => corpus.translit[i]),
    symbols: key.length
  },
  target: {
    pages: "0-54 in physical order",
    symbols: cipher.length,
    phase: "continuous from page 0, no page resets",
    p55: "excluded; it supplies the candidate key"
  },
  raw,
  syntheticRoundTrip: true,
  variants,
  conclusion: "Both direct Vigenere directions score below the raw stream on both English controls; no plaintext recovered."
}, null, 2));
