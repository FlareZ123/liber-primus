"use strict";

/**
 * Source-bounded January 2014 Onion-2 / LP2 32x8 numeric table bridge.
 * Read-only SFT for Node.js 22 on Windows 11 or other platforms.
 * All input is from checked-in historical source artifacts.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const grid = JSON.parse(fs.readFileSync(
  path.join(root, "resources", "liber-primus", "lp2-grid-256.json"), "utf8"
));
const onionHex = fs.readFileSync(
  path.join(root, "resources", "2014-onion2-final-256byte-hex.txt"), "utf8"
).trim();
assert.match(onionHex, /^[0-9a-f]{512}$/i);
const onion = Buffer.from(onionHex, "hex");
/** @param {Buffer} bytes @param {string} algorithm @returns {Buffer} */
const digest = (bytes, algorithm) => crypto.createHash(algorithm).update(bytes).digest();
const sha256 = bytes => digest(bytes, "sha256").toString("hex");
assert.equal(sha256(onion), "05acf0d8e2ba7d851e2b4bbc32b85e461a1bd41576a50504487f33d4c1522c56");
assert.equal(onion.length, 256);
assert.deepEqual(grid.shape, [32, 8]);
const tokens = grid.pages.flatMap(p => p.tokens);
assert.equal(tokens.length, 256);
const alphabet60 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx";
const alphabet59 = alphabet60.replace("f", "");
/** @param {string} token @param {string} alphabet @returns {number} */
function parseByte(token, alphabet) {
  const hi = alphabet.indexOf(token[0]);
  const lo = alphabet.indexOf(token[1]);
  assert.ok(token.length === 2 && hi >= 0 && lo >= 0);
  const number = hi * alphabet.length + lo;
  assert.ok(number >= 0 && number < 256);
  return number;
}
const grids = [
  {radix: 60, bytes: Buffer.from(tokens.map(x => parseByte(x, alphabet60)))},
  {radix: 59, bytes: Buffer.from(tokens.map(x => parseByte(x, alphabet59)))}
];
assert.deepEqual([...grids[0].bytes], grid.bytes);
assert.equal(sha256(grids[0].bytes), "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");
assert.equal(sha256(grids[1].bytes), "511d4fdb69ffbae4707ef93acf7465421f5480208e28d8e8c598cafa0d33cb79");
/** @param {Uint8Array} bytes @returns {{distinct:number,largest:number,pattern:number[]}} */
function multiplicity(bytes) {
  const counts = new Uint16Array(256);
  for (const value of bytes) counts[value]++;
  const pattern = [...counts].filter(n => n).sort((a, b) => a - b);
  return {distinct: pattern.length, largest: pattern[pattern.length - 1], pattern};
}
/** @param {Uint8Array} bytes @returns {{printable:number,letters:number,spaces:number,maxRun:number}} */
function asciiEvidence(bytes) {
  let printable = 0, letters = 0, spaces = 0, run = 0, maxRun = 0;
  for (const x of bytes) {
    if (x >= 32 && x <= 126) {
      printable++;
      run++;
      if (run > maxRun) maxRun = run;
    } else run = 0;
    if ((x >= 65 && x <= 90) || (x >= 97 && x <= 122)) letters++;
    if (x === 32) spaces++;
  }
  return {printable, letters, spaces, maxRun};
}
/** @param {Uint8Array} bytes @returns {Buffer[]} */
function columns32(bytes) {
  return Array.from({length: 8}, (_, j) =>
    Buffer.from(Array.from({length: 32}, (_, i) => bytes[i * 8 + j]))
  );
}
/** @param {Buffer} key @param {Buffer} bytes @param {boolean} decrypt @returns {Buffer} */
function aes(key, bytes, decrypt) {
  const transform = decrypt
    ? crypto.createDecipheriv("aes-256-ecb", key, null)
    : crypto.createCipheriv("aes-256-ecb", key, null);
  transform.setAutoPadding(false);
  return Buffer.concat([transform.update(bytes), transform.final()]);
}
/** @param {string} algo @param {Buffer[]} target @param {number} step @param {number} rounds */
function hashBridge(algo, target, step, rounds) {
  let exact = 0, comparisons = 0, longestEqualPrefix = 0;
  for (const source of [onion, Buffer.from(onionHex, "ascii")]) {
    const candidates = [];
    for (let end = step; end <= source.length; end += step) {
      candidates.push(digest(source.subarray(0, end), algo));
    }
    let chain = source;
    for (let i = 0; i < rounds; i++) {
      chain = digest(chain, algo);
      candidates.push(chain);
    }
    for (const candidate of candidates) {
      for (const chunk of target) {
        comparisons++;
        if (candidate.equals(chunk)) exact++;
        let n = 0;
        while (n < candidate.length && candidate[n] === chunk[n]) n++;
        if (n > longestEqualPrefix) longestEqualPrefix = n;
      }
    }
  }
  return {comparisons, exact, longestEqualPrefix};
}
const onionCount = multiplicity(onion);
assert.equal(onionCount.distinct, 158);
assert.equal(onionCount.largest, 5);
const out = {onionSha256: sha256(onion), records: []};
for (const {radix, bytes} of grids) {
  const counts = multiplicity(bytes);
  assert.equal(counts.distinct, 161);
  assert.equal(counts.largest, 4);
  // Permutations and any bijective byte relabeling preserve multiplicity.
  assert.notDeepEqual(counts.pattern, onionCount.pattern);
  const cols = columns32(bytes);
  const blocks = Array.from({length: 4}, (_, i) => bytes.subarray(i * 64, (i + 1) * 64));
  const sha32 = hashBridge("sha256", cols, 32, 8);
  const sha64 = hashBridge("sha512", blocks, 64, 4);
  assert.equal(sha32.exact, 0);
  assert.equal(sha64.exact, 0);
  const xor = Buffer.from(bytes.map((b, i) => b ^ onion[i]));
  const xorAscii = asciiEvidence(xor);
  const aesOutputs = cols.map(key => asciiEvidence(aes(key, onion, true)));
  const aesBest = aesOutputs.reduce((a, b) => a.printable > b.printable ? a : b);
  assert.ok(xorAscii.printable < 180);
  assert.ok(aesBest.printable < 180);
  // Genuine ASCII, AES-256 and SHA-256 positives.
  const plant = Buffer.from("THE PATH LIES EMPTY. ITS WORDS ARE THE MAP. ".repeat(8), "ascii")
    .subarray(0, 256);
  assert.equal(plant.length, 256);
  assert.deepEqual(aes(cols[0], aes(cols[0], plant, false), true), plant);
  assert.equal(asciiEvidence(plant).printable, 256);
  const plantedDigest = digest(onion.subarray(0, 32), "sha256");
  assert.ok(hashBridge("sha256", [plantedDigest, ...cols.slice(1)], 32, 8).exact >= 1);
  out.records.push({radix, sourceSha256: sha256(bytes), distinct: counts.distinct,
    largestMultiplicity: counts.largest, sha32, sha64, xorAscii, aesBest, aesOutputs});
}
console.log("PASS LP2 original-source 256-byte Onion2/numeric-grid bridge");
console.log(JSON.stringify(out, null, 2));
