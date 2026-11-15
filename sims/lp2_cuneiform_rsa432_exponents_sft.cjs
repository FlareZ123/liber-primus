"use strict";
/**
 * Source-selected 1033 / 3301 exponent RSA inverse on the original LP2 grid.
 * Two Babylonian numerals printed at LP2 pp33-39 read 1033 and 3301;
 * these are HYPOTHETICAL public exponents for Cicada's historically factored
 * 2012 and 2014 432-bit challenge RSA moduli. No historical instruction
 * identifies either number as an RSA exponent.
 *
 * Positive-control message is manufactured. Nothing here claims original
 * unknown plaintext, a genuine private key, or an LP2 decoder.
 *
 * SFT: node sims/lp2_cuneiform_rsa432_exponents_sft.cjs
 * Node.js 22, CommonJS, no external dependencies.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const {pkcs1Unpad, oaepUnpad} =
  require("./base60_historical_rsa432_block_inverse.cjs");

const bytes = JSON.parse(fs.readFileSync(path.join(__dirname, "..",
  "resources/liber-primus/base60-grid.json"), "utf8")).byte_rows;
assert.equal(bytes.length, 32);
assert.ok(bytes.every(row => row.length === 8 &&
  row.every(n => Number.isInteger(n) && n >= 0 && n < 256)));
const original = Buffer.from(bytes.flat());
assert.equal(original.length, 256);
assert.equal(crypto.createHash("sha256").update(original).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

const keys = [
  {name: "2012 factored Cicada P.S.", p:
    99554414790940424414351515490472769096534141749790794321708050837n, q:
    104593961812606247801193807142122161186583731774511103180935025763n},
  {name: "2014 factored Cicada challenge", p:
    97513779050322159297664671238670850085661086043266591739338007321n, q:
    77506098606928780021829964781695212837195959082370473820509360759n}
];
const exponents = [1033n, 3301n];
const blockWidth = 54;

/** @param {bigint} a @param {bigint} m @returns {bigint|null} */
function inverse(a, m) {
  let [t, u, r, s] = [0n, 1n, m, a];
  while (s !== 0n) {
    const factor = r / s;
    [t, u, r, s] = [u, t - factor*u, s, r - factor*s];
  }
  return r === 1n ? (t % m + m) % m : null;
}

/** @param {bigint} a @param {bigint} e @param {bigint} m */
function modPow(a, e, m) {
  let out = 1n;
  while (e > 0n) {
    if ((e & 1n) !== 0n) out = out*a % m;
    a = a*a % m;
    e >>= 1n;
  }
  return out;
}

/** @param {Buffer} input @returns {bigint} */
function fromBytes(input) {
  return BigInt("0x" + input.toString("hex"));
}

/** @param {bigint} value @returns {Buffer} */
function toBytes(value) {
  return Buffer.from(value.toString(16).padStart(2*blockWidth, "0"), "hex");
}

/** @param {Buffer} input @returns {Array<[string, Buffer]>} */
function traversals(input) {
  const rows = Array.from({length: 32},
    (_, i) => Array.from(input.subarray(i*8, i*8+8)));
  return [
    ["printed-row-major", Buffer.from(rows.flat())],
    ["printed-column-major", Buffer.from(
      Array.from({length: 8}, (_, col) => rows.map(row => row[col])).flat())],
    ["alternating-row-direction", Buffer.from(
      rows.flatMap((row, i) => i%2 ? row.slice().reverse() : row))]
  ];
}

/** @returns {object[]} All fixed original-image candidate RSA decryptions. */
function scan() {
  const observations = [];
  for (const {name, p, q} of keys) {
    const modulus = p*q;
    const phi = (p-1n)*(q-1n);
    assert.equal(modulus.toString(2).length, 432);
    for (const exponent of exponents) {
      const d = inverse(exponent, phi);
      assert.notEqual(d, null, "Both manuscript numeral exponents must invert");
      let admissible = 0;
      let firstZero = 0;
      let maxLetters = 0;
      let longRuns = 0;
      const candidates = [];
      for (const [layout, stream] of traversals(original))
        for (const direction of ["forward", "byte-reversed"])
          for (let start = 0; start+blockWidth <= stream.length; start++) {
            const block = Buffer.from(stream.subarray(start, start+blockWidth));
            if (direction === "byte-reversed") block.reverse();
            const c = fromBytes(block);
            if (c >= modulus) continue;
            admissible++;
            const ptext = toBytes(modPow(c, d, modulus));
            if (ptext[0] === 0) firstZero++;
            const text = ptext.toString("latin1");
            const longest = (text.match(/[A-Za-z ]+/g) || [])
              .reduce((maximum, run) => Math.max(maximum, run.length), 0);
            maxLetters = Math.max(maxLetters, longest);
            if (longest >= 12) longRuns++;
            const pkcs1 = pkcs1Unpad(ptext);
            const oaep = oaepUnpad(ptext);
            if (pkcs1 || oaep)
              candidates.push({layout, direction, start,
                scheme: pkcs1 ? "PKCS1-v1.5" : "OAEP-SHA1",
                plaintextHex: (pkcs1 || oaep).toString("hex")});
          }
      observations.push({source: name, exponent: String(exponent),
        admissible, firstZero, maxLetters, longRuns, candidates});
    }
  }
  return observations;
}

/** @returns {object} Exact independently manufactured PKCS1 source-key positive. */
function sourceExponentPositive() {
  const result = [];
  for (const {name, p, q} of keys) {
    const modulus = p*q;
    const phi = (p-1n)*(q-1n);
    for (const exponent of exponents) {
      const d = inverse(exponent, phi);
      assert.notEqual(d, null);
      const message = Buffer.from("CICADA", "ascii");
      const valid = Buffer.concat([Buffer.from([0, 2]),
        Buffer.alloc(blockWidth-3-message.length, 0xa7),
        Buffer.from([0]), message]);
      assert.equal(valid.length, blockWidth);
      assert.ok(fromBytes(valid) < modulus);
      const encrypted = toBytes(modPow(fromBytes(valid), exponent, modulus));
      assert.ok(fromBytes(encrypted) < modulus);
      const decrypted = toBytes(modPow(fromBytes(encrypted), d, modulus));
      assert.ok(decrypted.equals(valid));
      assert.ok(pkcs1Unpad(decrypted).equals(message));
      result.push({source: name, exponent: String(exponent),
        plaintext: message.toString("ascii"), recovered: true});
    }
  }
  return result;
}

function main() {
  const positives = sourceExponentPositive();
  const observations = scan();
  assert.deepEqual(observations.map(row => row.admissible),
    [1136, 1136, 838, 838]);
  assert.deepEqual(observations.map(row => row.firstZero), [5, 2, 5, 1]);
  assert.deepEqual(observations.map(row => row.maxLetters), [7, 7, 8, 6]);
  assert.ok(observations.every(row => row.longRuns === 0 &&
    row.candidates.length === 0));
  console.log(JSON.stringify({
    status: "bounded negative; no original unknown plaintext or key",
    publicExponentHypothesis: exponents.map(String),
    RSAInputBytes: 256,
    RSAWindowBytes: blockWidth,
    orientations: ["printed row-major", "column-major", "serpentine"],
    byteDirections: ["forward", "reversed"],
    fullOriginalDecryptions:
      observations.reduce((sum, row) => sum+row.admissible, 0),
    observations, syntheticPositives: positives
  }, null, 2));
}

if (require.main === module) main();
module.exports = {main, scan, sourceExponentPositive};
