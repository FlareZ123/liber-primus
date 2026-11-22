"use strict";

/**
 * Source-locked cross-round 7,524 length and bytewise key gate.
 *
 * The 2013 Book of the Law chapter III GP-normalized symbol count happens to
 * equal the default OutGuess extracted byte count from the 2014 LP1 page04.
 * Probe source-order XOR/add/subtract for four literal symbol-to-byte mappings.
 * Do not infer a key/LP2 plaintext from a shared length or synthetic plant.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const corpus = require("../resources/liber-primus/lp2-corpus.json");
const root = path.resolve(__dirname, "..");
const raw = fs.readFileSync(path.join(root, "resources", "external",
  "2013-book-of-law-III.txt"), "utf8");
const binary = fs.readFileSync(path.join(root, "resources", "external",
  "derived", "2014-stage04", "04-outguess.bin"));
const gp = new Map(corpus.translit.map((s, i) => [s, i]));

const normalized = raw.replace(/^\s*\d+[.:]\s*/gm, "")
  .normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
  .toUpperCase().replace(/K/g, "C").replace(/V/g, "U")
  .replace(/Q/g, "C").replace(/Z/g, "S");
const symbols = [];
for (let i = 0; i < normalized.length; i++) {
  const pair = normalized.slice(i, i + 2);
  if (gp.has(pair)) { symbols.push(gp.get(pair)); i++; }
  else if (gp.has(normalized[i])) symbols.push(gp.get(normalized[i]));
}
assert.equal(symbols.length, 7524);
assert.equal(binary.length, 7524);
assert.equal(crypto.createHash("sha1").update(binary).digest("hex"),
  "18b50380fcd1ac5133fbc418b5d17f869da93aa0");

/** @param {Buffer} bytes @returns {number} */
function entropy(bytes) {
  const hist = Array(256).fill(0);
  for (const b of bytes) hist[b]++;
  return hist.reduce((s, n) => n
    ? s - n / bytes.length * Math.log2(n / bytes.length) : s, 0);
}
/** @param {Buffer} bytes @returns {number} */
function longestPrintableRun(bytes) {
  let run = 0, best = 0;
  for (const b of bytes) {
    run = b >= 32 && b <= 126 ? run + 1 : 0;
    if (run > best) best = run;
  }
  return best;
}
/** @param {Buffer} source @param {number[]} key
 * @param {"xor"|"add"|"subtract"} action @returns {Buffer} */
function operate(source, key, action) {
  return Buffer.from(source.map((b, i) => {
    const v = key[i];
    return action === "xor" ? b ^ v : action === "add"
      ? (b + v) & 255 : (b - v + 256) & 255;
  }));
}
const keys = [
  ["GP-index", symbols],
  ["GP-prime", symbols.map(i => corpus.prime[i])],
  ["rune-UTF16-low-byte", symbols.map(i => corpus.runes[i].charCodeAt(0) & 255)],
  ["translit-first-ASCII", symbols.map(i => corpus.translit[i].charCodeAt(0))]
];
const cases = [];
for (const [name, key] of keys) {
  for (const action of ["xor", "add", "subtract"]) {
    const decoded = operate(binary, key, action);
    const inverse = action === "add" ? "subtract"
      : action === "subtract" ? "add" : "xor";
    assert.deepEqual(operate(decoded, key, inverse), binary);

    const originalMessage = Buffer.from("THE QUICK BROWN FOX JUMPS OVER ");
    const keySlice = key.slice(0, originalMessage.length);
    const ciphertext = operate(originalMessage, keySlice, inverse);
    assert.deepEqual(operate(ciphertext, keySlice, action), originalMessage);
    const best = longestPrintableRun(decoded);
    assert.ok(best <= 9);
    assert.ok(entropy(decoded) > 7.97);

    cases.push({
      keyName:name, action, entropyBitsPerByte:entropy(decoded),
      printableAsciiBytes:[...decoded].filter(b=>b>=32&&b<=126).length,
      maxPrintableRun:best, headHex:decoded.subarray(0,24).toString("hex"),
      exactOriginalReencryption:true, nativeSourcePlantRecovered:true
    });
  }
}
console.log(JSON.stringify({
  status:"Exact source-length correspondence; direct byte operations negative",
  stage04Bytes:binary.length, chapterIIIgpRunes:symbols.length,
  bookNormalization:"K/Q=C,V=U,Z=S; greedy GP29, source verses stripped",
  binarySHA1:"18b50380fcd1ac5133fbc418b5d17f869da93aa0",
  rawEntropy:entropy(binary), cases
},null,2));
