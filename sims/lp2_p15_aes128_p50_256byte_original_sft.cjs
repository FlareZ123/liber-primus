"use strict";
/**
 * Original p15 16-cell Fibonacci-prime square as AES-128 key, p49–51 256-byte
 * grid as ciphertext. This is a bounded unsigned low-byte interpretation
 * with source-justified orderings and explicit null IV, not a signed opcode.
 * Run: node sims/lp2_p15_aes128_p50_256byte_original_sft.cjs
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const sourceGrid = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-grid-256.json"), "utf8"));
const ciphertext = Buffer.from(sourceGrid.bytes);
const p15Rows = [
  [3258, 3222, 3152, 3038],
  [3278, 3299, 3298, 2838],
  [3288, 3294, 3296, 2472],
  [4516, 1206,  708, 1820]
];
const fibDistinct = [0,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987];
const primesAtFibPlusOne = [2,3,5,7,13,23,43,79,149,263,463,829,1481,2593,4507,7817];
const spiral = [[1,1],[1,2],[2,2],[2,1],[2,0],[1,0],[0,0],[0,1],[0,2],[0,3],[1,3],[2,3],[3,3],[3,2],[3,1],[3,0]];
assert.equal(ciphertext.length, 256);
assert.deepEqual(sourceGrid.bytes.slice(0,8), [203,231,167,186,97,237,126,183]);
const rowMajor = p15Rows.flat();
const spiralMajor = spiral.map(([r,c]) => p15Rows[r][c]);
assert.deepEqual(spiralMajor, primesAtFibPlusOne.map(p => Math.abs(3301-p)));
assert.deepEqual(spiralMajor.slice(0,4), [3299,3298,3296,3294]);

/** @param {number[]} values @returns {Buffer} */
function lowBytes(values) {
  assert.equal(values.length, 16);
  return Buffer.from(values.map(value => value & 255));
}
/** @param {Buffer} bytes @returns {object} */
function metrics(bytes) {
  const len = bytes.length;
  const printable = bytes.filter(b => b>=32&&b<=126).length;
  const validGP = bytes.filter(b => b<29).length;
  const last = bytes[len-1];
  const validPkcs7 = last >= 1 && last <=16 &&
    Array.from(bytes.subarray(len-last)).every(b => b === last);
  const starts = bytes.subarray(0, 16).toString("hex");
  return {
    printable, printableShare: +(printable / len).toFixed(5),
    rawGP29: validGP, rawGP29Share: +(validGP / len).toFixed(5),
    pkcs7Suffix: validPkcs7, first16Hex: starts
  };
}
/** @param {string} algo @param {Buffer} key @param {Buffer|null} iv @param {Buffer} input @param {boolean} encrypt */
function block(algo, key, iv, input, encrypt) {
  const transform = encrypt
    ? crypto.createCipheriv(algo,key,iv)
    : crypto.createDecipheriv(algo,key,iv);
  transform.setAutoPadding(false);
  return Buffer.concat([transform.update(input), transform.final()]);
}
const keys = [
  ["printed-row-major-low-byte", lowBytes(rowMajor)],
  ["source-red-spiral-low-byte", lowBytes(spiralMajor)],
  ["generated-source-prime-value-low-byte", lowBytes(primesAtFibPlusOne)],
  ["generated-source-Fibonacci-index-low-byte", lowBytes(fibDistinct)]
];
const algorithms = [
  ["aes-128-ecb", null],
  ["aes-128-cbc", Buffer.alloc(16)],
  ["aes-128-ctr", Buffer.alloc(16)]
];
const planted = Buffer.from(("THE WORDS ARE THE MAP THEIR MEANING IS THE ROAD AND THEIR NUMBERS THE DIRECTION " +
  "LIBER PRIMUS THE WAY THE TRUTH THE KEY ").repeat(3).slice(0,256),"ascii");
assert.equal(planted.length, 256);
const results = [];
for (const [name,key] of keys) {
  assert.equal(key.length,16);
  for(const [algo,iv] of algorithms) {
    const encrypted = block(algo,key,iv,planted,true);
    assert.deepEqual(block(algo,key,iv,encrypted,false),planted,
      "native AES roundtrip failed: "+name+"/"+algo);
    const recovered = block(algo,key,iv,ciphertext,false);
    assert.equal(recovered.length,256);
    const m=metrics(recovered);
    results.push({key:name,algorithm:algo,...m});
  }
}
assert.equal(results.length, 12);
assert(results.every(r => r.printableShare <0.65));
assert(results.every(r => r.rawGP29Share <0.27));
assert(results.every(r => !r.pkcs7Suffix));
const best = results.slice().sort((a,b)=>b.printableShare-a.printableShare);
console.log(JSON.stringify({
  hypothesis: "p15 4x4 authentic integers as AES-128 key, p49-51 256 base60 bytes as AES ciphertext",
  originalByteCount: ciphertext.length, sourceKeys: keys.length, aesModes: algorithms.length,
  sourcePuzzleKeySelector: "undetermined; 4x4 geometry alone is weak",
  observedBest: best.slice(0,4), allCandidateMetrics: results,
  allPlantedAESModeRoundtripsPass: true,
  anyOriginalPlaintextRecovered: false,
  conclusion: "No direct ASCII or raw-GP29 plaintext; finite source-key AES128 ECB/CBC0/CTR0 interpretation retired"
},null,2));
console.log("PASS source p15 AES128 + authentic p50 256B bounded original receiver");
