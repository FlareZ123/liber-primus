"use strict";

/**
 * Exact finite-GP29 lexicon gate on EVERY independent wordwise affine pad.
 * C[j] = P[j] + a[word] + b[word]*j (mod29), a,b independently secret.
 * Node 22: node sims/lp2_word_independent_affine_lexicon_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { parseLP2Words } = require("./lp2_word_pages.cjs");
const root = path.resolve(__dirname, "..");
const read = rel => fs.readFileSync(path.join(root, rel), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const mod = n => (n % 29 + 29) % 29;
const runes = new Map(corpus.runes.map((r, i) => [r, i]));
const gp = new Map(corpus.translit.map((r, i) => [r, i]));
// 2013 aliases C/K, S/Z, NG/ING, IA/IO; solved U/V;
// Q/QU normalizations deliberately liberal and not authenticated.
for (const [a, b] of [["K", "C"], ["Q", "C"], ["Z", "S"], ["V", "U"],
  ["ING", "NG"], ["IO", "IA"]]) gp.set(a, gp.get(b));
const group = ["ING", "TH", "NG", "EO", "OE", "AE", "IA", "EA"];
/** @param {string} w @returns {number[]} */
function encode(w) {
  const s = w.toUpperCase().replace(/QU/g, "CW");
  const out = [];
  for (let i = 0; i < s.length;) {
    const token = group.find(g => s.startsWith(g, i)) || s[i];
    assert.notEqual(gp.get(token), undefined, token);
    out.push(gp.get(token));
    i += token.length;
  }
  return out;
}
/** @param {number[]} x @returns {string} */
function sig(x) {
  const d = [];
  for (let j = 2; j < x.length; j++)
    d.push(mod(x[j] - 2 * x[j - 1] + x[j - 2]));
  return x.length + ":" + d.join(",");
}
const lex = new Set();
for (const line of read("resources/control/english_wordfreq_textblob.txt")
  .split(/\r?\n/)) {
  const match = /^([a-z]+)\s+\d+$/.exec(line);
  if (match) lex.add(match[1]);
}
for (const file of [
  "resources/control/shakespeare_first300k.txt",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/emerson_essays_2944.txt",
  "resources/liber-primus/lp1-plaintext-reference.txt"
]) for (const word of read(file).match(/[A-Za-z]+/g) || [])
  lex.add(word.toLowerCase());
assert.equal(lex.size, 32228);
const signatures = new Map(), byLength = new Map();
for (const word of lex) {
  const p = encode(word), k = sig(p);
  if (!signatures.has(k)) signatures.set(k, []);
  signatures.get(k).push(word);
  if (!byLength.has(p.length)) byLength.set(p.length, []);
  byLength.get(p.length).push({ word, p });
}
const input = parseLP2Words(read("resources/liber-primus/lp2-transcription.txt"));
assert.equal(input.words.length, 2896);
assert.equal(input.runeCount, 12956);
const cipher = input.words.map(word => ({
  page: word.startPage,
  seq: [...word.runes].map(r => {
    const n = runes.get(r);
    assert.notEqual(n, undefined);
    return n;
  })
}));
assert.deepEqual(cipher.flatMap(w => w.seq),
  corpus.pages.slice(0, 56).flatMap(p => p.indices));
const counts = new Map(), sixCandidate = [];
for (const { seq } of cipher) {
  const matches = signatures.get(sig(seq)) || [];
  const row = counts.get(seq.length) || { total: 0, valid: 0 };
  row.total++;
  if (matches.length) row.valid++;
  counts.set(seq.length, row);
  if (seq.length === 6 && matches.length) sixCandidate.push({
    ciphertext: seq.map(n => corpus.translit[n]).join("-"),
    possibleWords: matches
  });
}
const sum = (n, field) => [...counts].reduce((v, [len, row]) =>
  v + (len >= n ? row[field] : 0), 0);
assert.equal(sum(7, "total"), 559);
assert.equal(sum(7, "valid"), 0);
assert.equal(sum(6, "total"), 815);
assert.equal(sum(6, "valid"), 1);
assert.deepEqual(sixCandidate.map(x => x.possibleWords), [["revoir"]]);
// 95 source-authentic solved p57 runes test canonical Latin GP spellings.
const solvedP57 = read("resources/liber-primus/lp1-plaintext-reference.txt")
  .split("### 57\n")[1].trim().match(/[A-Za-z]+/g);
assert.ok(solvedP57);
assert.deepEqual(solvedP57.flatMap(encode), corpus.pages[57].indices);
// Each of the 559 original long-word lengths gets an independently keyed
// genuine GP-English plaintext plant. Every true inverse is exact, and the
// signature index finds the planted word without knowing either secret key.
const long = cipher.filter(w => w.seq.length >= 7);
let recovered = 0;
for (let i = 0; i < long.length; i++) {
  const options = byLength.get(long[i].seq.length);
  assert.ok(options && options.length);
  const selected = options[(37 * i + 17) % options.length];
  const a = (11 * i + 17) % 29, b = (19 * i + 5) % 29;
  const enc = selected.p.map((p, j) => mod(p + a + b * j));
  assert.ok((signatures.get(sig(enc)) || []).includes(selected.word));
  assert.deepEqual(enc.map((c, j) => mod(c - a - b * j)), selected.p);
  assert.notDeepEqual(enc.map((c, j) =>
    mod(c - a - (b + 1) * j)), selected.p);
  recovered += enc.length;
}
assert.equal(long.length, 559);
assert.equal(recovered, 4644);
const p55 = cipher.filter(w => w.page === 54);
assert.deepEqual(p55.map(w => w.seq.length),
  [4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3]);
assert.equal(corpus.pages[55].indices.length, 76);
assert.equal((signatures.get(sig(p55[6].seq)) || []).length, 0);
console.log(JSON.stringify({
  scope: "Independent all-secret wordwise GP29 offsets/slopes, fixed English source lexicon and literal printed word boundaries; no decryption.",
  lexiconWordTypes: lex.size, ciphertextRunes: input.runeCount,
  ciphertextWords: cipher.length, byLength: [...counts].sort((a, b) => a[0] - b[0]),
  sevenPlusWords: sum(7, "total"), sevenPlusPossible: sum(7, "valid"),
  sixPlusWords: sum(6, "total"), sixPlusPossible: sum(6, "valid"),
  sixRuneSurvivor: sixCandidate,
  p55LongWord: p55[6].seq.map(n => corpus.translit[n]).join("-"),
  solvedPage57AuthenticRunes: corpus.pages[57].indices.length,
  plantedWords: long.length, recoveredPlantedRunes: recovered
}, null, 2));
