"use strict";

/**
 * Source-only red32 row-selected AES256 CTR GP29 inverse, complete original LP2.
 * One source key, the original p15 spiral IV, one book-continuous AES pad.
 * Strictly scoped direct addition/subtraction; no tuneable phases or skips.
 *
 * Node.js 22 CommonJS standalone SFT.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const {redIntervals} = require("./lp2_red32_gridrow_aes256_selfkey_sft.cjs");

const root = path.resolve(__dirname, "..");
/** @param {string} filename */
const json = filename => JSON.parse(fs.readFileSync(path.join(root, filename), "utf8"));
const grid = json("resources/liber-primus/lp2-grid-256.json");
const corpus = json("resources/liber-primus/lp2-corpus.json");

const cells = Buffer.from(grid.pages.flatMap(p => p.bytes));
assert.equal(cells.length, 256);
assert.equal(crypto.createHash("sha256").update(cells).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");
const lengths = redIntervals();
const key = Buffer.from(lengths.map((n, r) => cells[r * 8 + n % 8]));
assert.equal(key.toString("hex"),
  "ed5c796d27503bfe7a2eadd396da492ac90d7d0ee9f0eb510044af8e006ac071");
const p15 = [3299,3298,3296,3294,3288,3278,3258,3222,
  3152,3038,2838,2472,1820,708,1206,4516];
const iv = Buffer.from(p15.map(n => n % 256));
assert.equal(iv.toString("hex"), "e3e2e0ded8ceba9650de16a81cc4b6a4");
const originalPages = corpus.pages.filter(p => p.page <= 55 && p.indices.length > 0);
const original = originalPages.flatMap(p => p.indices);
assert.equal(originalPages.length, 55);
assert.equal(original.length, 12956);

/** Encrypt zero blocks with standard AES256CTR to obtain a fixed byte pad. */
function pad(secret, size) {
  const cipher = crypto.createCipheriv("aes-256-ctr", secret, iv);
  return Buffer.concat([cipher.update(Buffer.alloc(size)), cipher.final()]);
}
const rawPad = pad(key, original.length);
const shifts = Uint8Array.from(rawPad, n => n % 29);
/** @param {number[]} text @param {number} sign */
function transform(text, sign) {
  return text.map((n,i) => (n + sign * shifts[i] + 29) % 29);
}
/** @param {number[]} text */
function ioc(text) {
  const counts = Array(29).fill(0);
  for (const n of text) counts[n]++;
  return counts.reduce((s,n) => s + n * (n - 1),0) / (text.length * (text.length-1));
}
/** @param {number[]} text */
function prefix(text) {
  return text.slice(0, 48).map(n => corpus.translit[n]).join(" ");
}
const subtract = transform(original, -1);
const add = transform(original, 1);
assert.deepEqual(transform(subtract, 1), original);
assert.deepEqual(transform(add, -1), original);

const page57 = corpus.pages.find(p=>p.page===57).indices;
assert.equal(page57.length, 95);
const nativePlant = Array.from({length:original.length},(_,i)=>page57[i%95]);
const plantCipher = transform(nativePlant,1);
assert.deepEqual(transform(plantCipher,-1), nativePlant);
const wrongPad = pad(Buffer.from(key.map((v,i)=>i===0?v^1:v)), original.length);
const wrong = plantCipher.map((v,i)=>(v-wrongPad[i]%29+29)%29);
assert.notDeepEqual(wrong,nativePlant);
const wrongAccuracy = wrong.filter((n,i)=>n===nativePlant[i]).length;

const report = {
  source: "exact LP2 225-red/31-mark -> 32 lengths -> 32 printed grid row-select bytes + p15 original spiral IV",
  sourceGridSHA256: "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290",
  keyHex: key.toString("hex"),
  ivHex: iv.toString("hex"),
  selection: "complete book cipher rune positions, including F, one continuous AES-256-CTR stream; each byte mod29; independent direct signs",
  original: {pages: originalPages.length,runes:original.length,
    ciphertextIoC:ioc(original),
    subtractionIoC:ioc(subtract),additionIoC:ioc(add),
    subtractOpening:prefix(subtract),addOpening:prefix(add),
    losslessForwardReencryption:true
  },
  positive: {knownP57nativePlantRunes:nativePlant.length,
    perfectTrueKeyDecryption:true,correctKeyIoC:ioc(nativePlant),
    oneByteDifferentKeyMatchedRunes:wrongAccuracy,
    wrongKeyIoC:ioc(wrong)},
  decision: "Source-frozen direct AES CTR modulo29 pad has no coherent original GP plaintext; original forward re-encryption alone proves nothing. No additional key phase or repeat-skip model tested."
};
assert(ioc(subtract)<0.04 && ioc(add)<0.04);
assert(ioc(nativePlant)>0.04 && wrongAccuracy<original.length/4);
console.log(JSON.stringify(report,null,2));
