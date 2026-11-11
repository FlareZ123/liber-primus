"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(ROOT, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/lp2-transcription.txt");

function parseLP2Words(raw, pageCount = 55) {
  const segments = raw.split("%").slice(0, pageCount);
  const byStartPage = Array.from({length: segments.length}, () => []);
  let current = "", startPage = 0, lastRunePage = 0, page = 0;
  function finish() {
    if (!current) return;
    byStartPage[startPage].push({runes: current, startPage,
      endPage: lastRunePage, length: [...current].length});
    current = "";
  }
  for (const ch of segments.join("%")) {
    if (/[\u16A0-\u16FF]/u.test(ch)) {
      if (!current) startPage = page;
      current += ch;
      lastRunePage = page;
    } else if (ch === "%") {
      page++;
    } else if (ch === "/" || /\s/u.test(ch)) {
      // Printed line wraps do not terminate words.
    } else {
      finish();
    }
  }
  finish();
  return byStartPage;
}
function isPrime(n) {
  if (n < 2n) return false;
  if (n % 2n === 0n) return n === 2n;
  for (let d = 3n; d * d <= n; d += 2n) if (n % d === 0n) return false;
  return true;
}
function base29(n) {
  if (n === 0n) return [0];
  const out = [];
  while (n > 0n) { out.unshift(Number(n % 29n)); n /= 29n; }
  return out;
}
const mod29 = n => Number(((BigInt(n) % 29n) + 29n) % 29n);
function ioc(seq) {
  const h = Array(29).fill(0);
  for (const x of seq) h[x]++;
  return h.reduce((s, n) => s + n * (n - 1), 0) / (seq.length * (seq.length - 1));
}
function decrypt(cipher, key, sign) {
  return cipher.map((c, i) => ((c + sign * key[i % key.length]) % 29 + 29) % 29);
}
function encrypt(plain, key, sign) {
  return plain.map((p, i) => ((p - sign * key[i % key.length]) % 29 + 29) % 29);
}

const N = 1595277641n;
const clausePrimeSums = [1259n, 1031n, 1229n]; // p57 body-clause order
assert.deepEqual(clausePrimeSums.map(isPrime), [true, true, true]);
assert.equal(clausePrimeSums.reduce((a, p) => a * p, 1n), N);
const phiN = clausePrimeSums.reduce((a, p) => a * (p - 1n), 1n);
assert.equal(phiN, 1591168720n);

const byStartPage = parseLP2Words(transcription);
const p55Words = byStartPage[54];
assert.equal(p55Words.length, 16);
assert.deepEqual(p55Words.map(w => w.length),
  [4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3]);
const p55WordRunes = p55Words.flatMap(w => [...w.runes]);
const p55Inner = p55Words.flatMap(w => [...w.runes].slice(1, -1))
  .map(r => corpus.runes.indexOf(r));
assert.equal(p55WordRunes.length, 75);
assert.equal(p55Inner.length, 43);
const page55 = corpus.pages.find(p => p.page === 55);
assert.equal(page55.indices.length, 76);
assert.deepEqual(p55WordRunes.map(r => corpus.runes.indexOf(r)), page55.indices.slice(1));

const keys = [
  {name: "N mod 29", values: [mod29(N)]},
  {name: "phi(N) mod 29", values: [mod29(phiN)]},
  {name: "N base 29, most-significant digit first", values: base29(N)},
  {name: "phi(N) base 29, most-significant digit first", values: base29(phiN)},
  {name: "p57 clause prime sums mod 29, source order", values: clausePrimeSums.map(mod29)},
  {name: "p57 clause totients mod 29, source order", values: clausePrimeSums.map(p => mod29(p - 1n))}
];
assert.deepEqual(keys.map(k => k.values), [
  [24], [26], [2, 19, 22, 14, 20, 24, 24], [2, 19, 16, 20, 7, 2, 26],
  [12, 16, 11], [11, 15, 10]
]);
const solvedControl = corpus.pages.find(p => p.page === 57).indices.slice(7, 50);
assert.equal(solvedControl.length, 43);

const results = [];
for (const spec of keys) {
  for (const sign of [-1, 1]) {
    const plain = decrypt(p55Inner, spec.values, sign);
    assert.deepEqual(encrypt(plain, spec.values, sign), p55Inner);
    assert.deepEqual(decrypt(encrypt(solvedControl, spec.values, sign), spec.values, sign), solvedControl);
    results.push({
      keyName: spec.name, key: spec.values,
      operation: sign === -1 ? "P = C - K mod 29" : "P = C + K mod 29",
      ioc: ioc(plain),
      transliteration: plain.map(x => corpus.translit[x]).join(" ")
    });
  }
}
console.log(JSON.stringify({
  sourceNumber: String(N),
  clausePrimeSums: clausePrimeSums.map(String),
  factorizationVerified: true,
  phiN: String(phiN),
  phiNBase29: base29(phiN),
  p55CompleteWords: p55Words.length,
  p55CompleteWordRunes: p55WordRunes.length,
  incomingCarryRunes: 1,
  p55StrictInteriors: p55Inner.length,
  rawInteriorIoC: ioc(p55Inner),
  solvedP57ControlIoC: ioc(solvedControl),
  tests: results,
  conclusion: "The fixed direct GP29 additive uses of the 2013 parable number and its totient do not recover readable p55 plaintext. This rejects only these representations, signs and phase-zero operation."
}, null, 2));
