"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "resources", "liber-primus", "lp2-corpus.json"), "utf8"));

/**
 * Exact arrays published in Wulfic/Cicada3301-Liber_Primus MASTER_TRACKER.md §3.
 * No parameters optimized from original ciphertext here.
 * @type {Record<number, {mode:"add"|"sub", key:number[], prefix:string, post:string}>}
 */
const cases = {
  18: {
    mode: "sub",
    key: [11,6,1,20,25,20,9,15,24,26,25,7,19,8,10,24,18,9,0,16,9,4,14,22,13,13,3,28,5,21,24,19,5,1,27,14,6,17,24,24,22,8,23,6,22,19,2,11,3,19,25,15,24],
    prefix: "BEINGOFALLIWILLASCTHEOATHISSWORNTOTHEONEWITHINTHEABOFETHEWAY",
    post: "IAROEAEFPEOIETHIACAYEHRNMYHIAWOEBXCEAJOEBTAYFHAIWTHUTTHSASUAPRGAC"
  },
  19: {
    mode: "add",
    key: [24,15,2,24,4,21,11,10,20,16,9,19,26,11,7,5,11,6,27,8,22,25,21,16,25,0,27,9,21,7,27,15,21,9,3,16,5,22,18,4,5,18,23,28,28,28,28],
    prefix: "REARRANGINGTHEPRIMESNUMBERSWILLSHOWAPATHTOTHEDEORHEER",
    post: "NEEOGIAYEOCOEWTHCIRRMGUGNGJXJOAEGEOOHTHEEAEEAJOEAFATIIBTMP"
  }
};

/** @param {number[]} indices @returns {number} */
function ioc(indices) {
  const counts = Array(29).fill(0);
  for (const index of indices) counts[index]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) / (indices.length * (indices.length - 1));
}
/** @param {number[]} indices @returns {string} */
function translit(indices) {
  return indices.map((index) => corpus.translit[index]).join("");
}
/** @param {number[]} cipher @param {{mode:"add"|"sub",key:number[]}} config @returns {number[]} */
function decode(cipher, config) {
  return cipher.map((value, index) => {
    const k = config.key[index % config.key.length];
    return (value + (config.mode === "add" ? k : 29 - k)) % 29;
  });
}
for (const [pageName, config] of Object.entries(cases)) {
  const page = Number(pageName);
  const cipher = corpus.pages[page].indices;
  const n = config.key.length;
  assert.ok(config.key.every((k) => Number.isInteger(k) && k >= 0 && k < 29));
  const plain = decode(cipher, config);
  assert.equal(translit(plain.slice(0, n)), config.prefix);
  assert.equal(translit(plain.slice(n, 2 * n)), config.post);
  const printed = (v) => ioc(v).toFixed(10);
  assert.ok(ioc(plain.slice(0, n)) > 0.05);
  assert.ok(ioc(plain.slice(n)) < 0.04);
  console.log("Physical p" + page + ", " + cipher.length + " runes; published " + config.mode + " key length " + n);
  console.log("First key cycle: " + config.prefix);
  console.log("Second cycle: " + config.post);
  console.log("First IoC " + printed(plain.slice(0, n)) + ", remaining IoC " + printed(plain.slice(n)) + ", raw IoC " + printed(cipher));
}
const page27 = corpus.pages[27].indices;
const page44 = corpus.pages[44].indices;
let equalPrefix = 0;
while (equalPrefix < Math.min(page27.length, page44.length) &&
  page27[equalPrefix] === page44[equalPrefix]) equalPrefix++;
assert.equal(page27.length, 234);
assert.equal(page44.length, 273);
assert.equal(equalPrefix, 0);
console.log("Original physical p27 vs p44, leading exact runes " + equalPrefix + ", first runes " + corpus.translit[page27[0]] + "/" + corpus.translit[page44[0]]);
console.log("PASS: no independent continuous plaintext under the published periodic keys.");
