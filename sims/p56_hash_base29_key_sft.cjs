#!/usr/bin/env node
"use strict";
/*
 * Test the p56 512-bit digest as a BASE29-derived repeating additive key.
 * The operation is source-motivated by the signed 2013 BASE29 command and
 * the p56 digest. This tests only the canonical whole-integer conversion
 * and continuous Vigenere-style use; it does not test the digest as a URL.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = f => JSON.parse(fs.readFileSync(path.join(root, f), "utf8"));
const corpus = read("resources/liber-primus/lp2-corpus.json");
const english = fs.readFileSync(path.join(root, "resources/control/shakespeare_first300k.txt"), "utf8");
const HASH = "36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4";
assert.equal(HASH.length, 128);
assert.match(HASH, /^[0-9a-f]{128}$/);
const mod = x => (x % 29 + 29) % 29;
function base29BigInt(value) {
  let n = value;
  const out = [];
  while (n > 0n) { out.unshift(Number(n % 29n)); n /= 29n; }
  return out;
}
const key = base29BigInt(BigInt("0x" + HASH));
assert.deepEqual(base29BigInt(3301n), [3,26,24]); // signed 2013 example: 3301 -> 3QO
assert.equal(key.length, 105);
const C = corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
assert.equal(C.length, 12956);
const tokens = corpus.translit.map((s, i) => ({ s, i })).sort((a,b) => b.s.length - a.s.length);
function gpEnglish(text) {
  const norm = text.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S");
  const out = [];
  for (const word of norm.match(/[A-Z]+/g) || []) {
    const buf = [];
    for (let i = 0; i < word.length;) {
      const token = tokens.find(t => word.startsWith(t.s, i));
      if (!token) { buf.length = 0; break; }
      buf.push(token.i); i += token.s.length;
    }
    if (buf.length) out.push(...buf);
  }
  return out;
}
const native = gpEnglish(english);
const train = native.slice(0, 100000);
const heldout = native.slice(100000, 112956);
assert.equal(heldout.length, C.length);
const tri = new Uint32Array(29 ** 3);
const ctx = new Uint32Array(29 ** 2);
for (let i = 2; i < train.length; i++) {
  const k = train[i - 2] * 29 + train[i - 1];
  tri[k * 29 + train[i]]++;
  ctx[k]++;
}
function metrics(a) {
  const freq = Array(29).fill(0);
  for (const v of a) freq[v]++;
  let score = 0;
  for (let i = 2; i < a.length; i++) {
    const k = a[i - 2] * 29 + a[i - 1];
    score += Math.log((tri[k * 29 + a[i]] + 0.1) / (ctx[k] + 2.9));
  }
  return {
    ioc: freq.reduce((s,n) => s + n * (n - 1), 0) / (a.length * (a.length - 1)),
    top12: freq.slice().sort((a,b) => b-a).slice(0,12).reduce((s,n) => s+n,0) / a.length,
    trigramNatsPerRune: score / (a.length - 2)
  };
}
const results = [];
for (const sign of [-1, 1]) {
  const plain = C.map((v, i) => mod(v - sign * key[i % key.length]));
  const replay = plain.map((v, i) => mod(v + sign * key[i % key.length]));
  const plantCipher = heldout.map((v, i) => mod(v + sign * key[i % key.length]));
  const plantRecovered = plantCipher.map((v, i) => mod(v - sign * key[i % key.length]));
  assert.deepEqual(replay, C);
  assert.deepEqual(plantRecovered, heldout);
  results.push({
    inverse: sign === 1 ? "C-K" : "C+K",
    first13: plain.slice(0,13).map(v => corpus.translit[v]).join(""),
    prefix80: plain.slice(0,80).map(v => corpus.translit[v]).join(""),
    metrics: metrics(plain),
    exactOriginalReplay: true,
    heldoutEnglishControlRecovered: true
  });
}
console.log(JSON.stringify({
  classification: "bounded negative for the canonical p56-digest-to-BASE29 direct additive-key hypothesis",
  p56Digest: HASH,
  base29KeyLength: key.length,
  base29KeyDigits: key,
  source: "signed 2013 BASE29 command; p56 128-hex digest",
  originalRuneCount: C.length,
  baseline: metrics(C),
  heldoutEnglishControl: metrics(heldout),
  results
}, null, 2));
