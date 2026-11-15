"use strict";
/**
 * Original LP2 p57 one-edge-shed 75-rune pad against original p55 body.
 * Windows 11, Node.js 22 CommonJS. One-file, read-only source test.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const parts = read("resources/lp2-transcription.txt").split("%");
const glyph = new Map(gp.runes.map((r, i) => [r, i]));
/** @param {string} section @returns {number[][]} */
function parseWords(section) {
  const out = [];
  let word = [];
  for (const ch of section) {
    if (glyph.has(ch)) word.push(glyph.get(ch));
    else if (ch === "/" || /\s/u.test(ch)) {}
    else if (word.length) { out.push(word); word = []; }
  }
  if (word.length) out.push(word);
  return out;
}
/** @param {number} value @returns {number} */
const mod = value => (value % 29 + 29) % 29;
/** @param {number[]} values @returns {number} */
function ioc(values) {
  const count = Array(29).fill(0);
  for (const v of values) count[v]++;
  return count.reduce((s, n) => s + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}
/**
 * State sieve for the genuine solved p56 plaintext-F nonconsuming bypass.
 * @param {number[]} cipher
 * @param {number[]} key
 * @returns {{deadAt:number|null, clocks:number[]}}
 */
function transparentF(cipher, key) {
  let states = new Set([0]);
  for (const [i, c] of cipher.entries()) {
    const next = new Set();
    for (const used of states) {
      if (used < key.length && mod(c - key[used]) !== 0) next.add(used + 1);
      if (c === 0) next.add(used);
    }
    if (!next.size) return {deadAt: i, clocks: []};
    states = next;
  }
  return {deadAt: null, clocks: [...states]};
}
/** @param {number[]} plain @param {number[]} key */
function plant(plain, key) {
  let used = 0;
  const cipher = plain.map(p => p === 0 ? 0 : mod(p + key[used++]));
  assert(used <= key.length);
  assert(transparentF(cipher, key).clocks.includes(used));
}
assert.equal(parts.length, 57);
const p55 = gp.pages.find(p => p.page === 55).indices;
const p56 = gp.pages.find(p => p.page === 56).indices;
const p57 = gp.pages.find(p => p.page === 57).indices;
const w55 = parseWords(parts[54]);
const w57 = parseWords(parts[56]);
assert.deepEqual(w55.flat(), p55);
assert.deepEqual(w57.flat(), p57);
assert.deepEqual(w55[0], [21]);
assert.equal(w55.length, 17);
assert.equal(w57.length, 20);
assert.deepEqual([p55.length, p56.length, p57.length], [76, 85, 95]);
const target = w55.slice(1).flat();
assert.equal(target.length, 75);
const keys = [
  ["first:index", w57.flatMap(w => w.slice(1))],
  ["first:totient", w57.flatMap(w => w.slice(1)).map(v => mod(gp.prime[v] - 1))],
  ["last:index", w57.flatMap(w => w.slice(0, -1))],
  ["last:totient", w57.flatMap(w => w.slice(0, -1)).map(v => mod(gp.prime[v] - 1))],
];
const primes = [];
for (let n = 2; primes.length < 85; n++) {
  let prime = true;
  for (let divisor = 2; divisor * divisor <= n; divisor++) {
    if (n % divisor === 0) { prime = false; break; }
  }
  if (prime) primes.push(n);
}
assert(transparentF(p56, primes.map(p => mod(p - 1))).clocks.includes(84));
const death = {"first:index":53,"first:totient":11,"last:index":65,"last:totient":2};
const records = [];
for (const [name, key] of keys) {
  assert.equal(key.length, 75);
  plant(p57.slice(0, 75), key);
  const skipResult = transparentF(target, key);
  assert.equal(skipResult.deadAt, death[name]);
  for (const sign of [-1, 1]) {
    const plain = target.map((v, i) => mod(v + sign * key[i]));
    assert(plain.every((v, i) => mod(v - sign * key[i]) === target[i]));
    records.push({name, sign, ioc:ioc(plain),
      first20:plain.slice(0,20).map(i => gp.translit[i]).join(" "),
      strictFFailureAtBodyIndex:skipResult.deadAt});
  }
}
console.log(JSON.stringify({
  source:{p55runecount:76,p55CompleteWordRunes:75,p55CompleteWords:16,
    p57runecount:95,p57words:20,p57OneEdgeShed:75,
    p56SolvedCipherPositive:true},
  originalIoC:ioc(target), clearP57IoC:ioc(p57), records,
  outcome:"All direct additive outputs nonprose. All authentic p56-style minus/F-skip variants contradictory."
},null,2));