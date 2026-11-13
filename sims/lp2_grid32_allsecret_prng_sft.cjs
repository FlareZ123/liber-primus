"use strict";

/**
 * SFT: node sims/lp2_grid32_allsecret_prng_sft.cjs
 *
 * Exact original-input all-secret 32-bit generator test on the 256-byte
 * base60 numerical table. This is an experiment, not a claimed decryption.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const MASK32 = 0xffffffffn;
const wrap = x => x & MASK32;

/**
 * Decide if an arbitrary (unknown) affine map T: GF(2)^32 -> GF(2)^32
 * can take every sequential input to its next 32-bit observation.
 * No transition/key bits are guessed.
 * @param {number[]} sequence
 * @returns {{rank:number,firstContradiction:number|null}}
 */
function affineGF2(sequence) {
  const basis = new Uint32Array(32);
  const mapped = new Uint32Array(32);
  let rank = 0;
  for (let i = 1; i < sequence.length - 1; i++) {
    let x = (sequence[i] ^ sequence[0]) >>> 0;
    let y = (sequence[i + 1] ^ sequence[1]) >>> 0;
    let inserted = false;
    for (let bit = 31; bit >= 0; bit--) {
      if (!(x >>> bit & 1)) continue;
      if (basis[bit]) {
        x = (x ^ basis[bit]) >>> 0;
        y = (y ^ mapped[bit]) >>> 0;
      } else {
        basis[bit] = x;
        mapped[bit] = y;
        rank++;
        inserted = true;
        break;
      }
    }
    if (!inserted && x === 0 && y !== 0) {
      return {rank, firstContradiction: i};
    }
  }
  return {rank, firstContradiction: null};
}

/** @param {bigint} x @returns {bigint} */
function inverseOdd(x) {
  assert.equal(x & 1n, 1n);
  let y = 1n;
  for (let i = 0; i < 6; i++) y = wrap(y * (2n - x * y));
  assert.equal(wrap(x * y), 1n);
  return y;
}

/**
 * Test y[n+1] = a*y[n] + c mod 2^32 with all (a,c) unspecified.
 * The first odd difference uniquely determines them.
 * @param {number[]} sequence
 * @returns {{determined:boolean,consistent:boolean,firstMismatch:number|null}}
 */
function lcg32(sequence) {
  const s = sequence.map(BigInt);
  for (let i = 0; i < s.length - 2; i++) {
    const d = wrap(s[i + 1] - s[i]);
    if (!(d & 1n)) continue;
    const a = wrap(wrap(s[i + 2] - s[i + 1]) * inverseOdd(d));
    const c = wrap(s[i + 1] - a * s[i]);
    for (let n = 0; n < s.length - 1; n++) {
      if (wrap(a * s[n] + c) !== s[n + 1]) {
        return {determined: true, consistent: false, firstMismatch: n};
      }
    }
    return {determined: true, consistent: true, firstMismatch: null};
  }
  return {determined: false, consistent: false, firstMismatch: null};
}

/** @param {number[]} bytes @param {number} start @param {boolean} littleEndian */
function pack32(bytes, start, littleEndian) {
  const output = [];
  for (let i = start; i + 3 < bytes.length; i += 4) {
    const b = bytes.slice(i, i + 4);
    if (littleEndian) b.reverse();
    output.push(((b[0] << 24) | (b[1] << 16) | (b[2] << 8) | b[3]) >>> 0);
  }
  return output;
}

function main() {
  const source = JSON.parse(fs.readFileSync(
    path.join(__dirname, "..", "resources", "liber-primus", "base60-grid.json"), "utf8"
  ));
  assert.equal(source.alphabet.length, 60);
  assert.equal(source.rows.length, 32);
  assert.ok(source.rows.every(row => row.length === 8));
  const bytes = source.rows.flat().map(token => {
    assert.match(token, /^[0-9A-Za-z]{2}$/);
    const n = 60 * source.alphabet.indexOf(token[0]) +
      source.alphabet.indexOf(token[1]);
    assert.ok(n >= 0 && n <= 255);
    return n;
  });
  assert.equal(bytes.length, 256);
  const digest = crypto.createHash("sha256").update(Buffer.from(bytes)).digest("hex");
  assert.equal(digest,
    "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290"
  );
  const columnMajor = Array.from({length: 256}, (_, i) =>
    bytes[(i % 32) * 8 + Math.floor(i / 32)]
  );

  let tested = 0;
  let affinePass = 0;
  let lcgPass = 0;
  let minContradiction = Infinity;
  let maxContradiction = -Infinity;
  for (const [layout, data] of [["row-major", bytes], ["column-major", columnMajor]]) {
    for (let offset = 0; offset < 4; offset++) {
      for (const littleEndian of [false, true]) {
        for (const backwards of [false, true]) {
          const words = pack32(data, offset, littleEndian);
          if (backwards) words.reverse();
          const linear = affineGF2(words);
          const lcg = lcg32(words);
          tested++;
          if (linear.firstContradiction === null) affinePass++;
          if (lcg.consistent) lcgPass++;
          if (linear.firstContradiction !== null) {
            minContradiction = Math.min(minContradiction, linear.firstContradiction);
            maxContradiction = Math.max(maxContradiction, linear.firstContradiction);
          }
          console.log(JSON.stringify({
            layout, offset, littleEndian, backwards, words: words.length,
            affineRank: linear.rank, affineContradiction: linear.firstContradiction,
            lcgContradiction: lcg.firstMismatch
          }));
        }
      }
    }
  }

  // Positive plant: a secret affine relabeling of xorshift32 output states.
  let state = 0x3301a5b7;
  const linearPlant = [];
  for (let i = 0; i < 64; i++) {
    linearPlant.push((state ^ 0xa5a5c3c3) >>> 0);
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
  }
  assert.equal(affineGF2(linearPlant).firstContradiction, null);

  // Positive plant: LCG32 with hidden multiplier and additive constant.
  let s = 0x3301abcdn;
  const lcgPlant = [];
  for (let i = 0; i < 64; i++) {
    lcgPlant.push(Number(s));
    s = wrap(1664525n * s + 1013904223n);
  }
  assert.equal(lcg32(lcgPlant).consistent, true);

  assert.equal(tested, 32);
  assert.equal(affinePass, 0);
  assert.equal(lcgPass, 0);
  console.log(JSON.stringify({
    inputSha256: digest, tested, affinePass, lcgPass,
    contradictionRange: [minContradiction, maxContradiction],
    xorshiftAffinePositive: "PASS", lcg32Positive: "PASS",
    originalPlaintextRecovered: false
  }, null, 2));
}

if (require.main === module) main();
module.exports = {affineGF2, lcg32, pack32};
