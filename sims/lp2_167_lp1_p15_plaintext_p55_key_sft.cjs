"use strict";
/**
 * Historically linked LP1 167.jpg (= LP1 scan15) solved text as a direct
 * unkeyed running-GP29 pad on original LP2 p55 and pp54-55.
 * Read only. No fitted phase / seed / speculative second layer.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
/** @param {string} name @returns {string} */
const read = name => fs.readFileSync(path.join(__dirname, "..", name), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const lp1 = read("resources/liber-primus/lp1-plaintext-reference.txt");
const section = lp1.split("### 15\n")[1].split("### 16")[0];
const lines = section.split("\n").map(x => x.trim()).filter(x => x && !x.startsWith("["));
assert.deepEqual(lines, ["AN INSTRUCTION", "KWESTION ALL THINGS",
  "DISCOVER TRUTH INSIDE YOURSELF", "FOLLOW YOUR TRUTH", "IMPOSE NOTHING ON OTHERS"]);
const words = lines.join(" ").split(/\s+/u).filter(Boolean);
const tokens = [...gp.translit].sort((a, b) => b.length - a.length);
/** @param {string} plain @returns {number[]} */
function encode(plain) {
  let letters = plain.replace(/[^A-Z]/gu, "").replace(/K/gu,"C").replace(/V/gu,"U").replace(/Q/gu,"C");
  const out = [];
  while (letters.length) {
    const token = tokens.find(t => letters.startsWith(t));
    assert(token, "Original LP1 GP transliteration mapping");
    out.push(gp.translit.indexOf(token));
    letters = letters.slice(token.length);
  }
  return out;
}
/** @param {number} x @returns {number} */
const mod = x => (x % 29 + 29) % 29;
/** @param {number[]} p @returns {number} */
function ioc(p) {
  const cnt = Array(29).fill(0);
  for (const x of p) cnt[x]++;
  return cnt.reduce((s, n) => s + n * (n-1), 0)/(p.length*(p.length-1));
}
const keys = [["whole",encode(words.join(""))],
  ["body",encode(words.slice(2).join(""))],
  ["drop-AN",encode(words.slice(1).join(""))]];
assert.deepEqual(keys.map(x => x[1].length), [86, 73, 84]);
const p55 = gp.pages[55].indices;
const p5455 = gp.pages.slice(54, 56).flatMap(p => p.indices);
assert.deepEqual([p55.length, p5455.length], [76,308]);
const expected = {
  "whole":[[0.03298245614035088,0.034117348449596005],[0.035789473684210524,0.03544989212741656]],
  "body":[[0.039649122807017545,0.03498455941452684],[0.036491228070175435,0.034244257371293205]],
  "drop-AN":[[0.030877192982456142,0.03555564956216422],[0.03894736842105263,0.03356740978890816]]
};
const results = [];
for (const [name, key] of keys) for (const [dir, sign] of [["minus",-1],["plus",1]]) {
  const row = [];
  for (const [recipient, original] of [["p55", p55], ["p54-55", p5455]]) {
    const plain = original.map((x, i) => mod(x + sign*key[i % key.length]));
    assert.deepEqual(plain.map((x, i) => mod(x - sign*key[i % key.length])),original);
    const check = expected[name][sign === -1 ? 0 : 1][recipient === "p55" ? 0 : 1];
    assert(Math.abs(ioc(plain) - check) < 1e-13);
    row.push({recipient, ioc:ioc(plain),first45:plain.slice(0,45).map(i => gp.translit[i]).join("")});
  }
  results.push({name, keyLength:key.length, dir, receivers:row});
}
console.log(JSON.stringify({source:"2014 Stage10 /167.jpg = LP1 scan15, historically decrypted instruction", keyVariants:results, decision:"No coherent original p55 plaintext or p56-key handoff with full LP1-page text as a fixed GP29 running pad"},null,2));
