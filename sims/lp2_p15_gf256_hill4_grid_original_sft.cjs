"use strict";

/**
 * First-party p15 Fibonacci-square numeric matrices applied to the original
 * p49–51 256-byte token table using a conventional GF(2^8) Hill4 cipher.
 * Node 22, CommonJS, read-only, fully source-frozen 128 variants.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const root = path.resolve(__dirname, "..");
const sourceText = fs.readFileSync(path.join(root, "resources",
  "liber-primus", "lp2-grid-256.json"), "utf8");
const bytes = JSON.parse(sourceText).bytes;
const bases = [
  ["printed-distance", [
    [3258, 3222, 3152, 3038], [3278, 3299, 3298, 2838],
    [3288, 3294, 3296, 2472], [4516, 1206, 708, 1820]
  ]],
  ["prime", [
    [43, 79, 149, 263], [23, 2, 3, 463],
    [13, 7, 5, 829], [7817, 4507, 2593, 1481]
  ]],
  ["prime-ordinal", [
    [14, 22, 35, 56], [9, 1, 2, 90],
    [6, 4, 3, 145], [988, 611, 378, 234]
  ]],
  ["fibonacci-index", [
    [13, 21, 34, 55], [8, 0, 1, 89],
    [5, 3, 2, 144], [987, 610, 377, 233]
  ]]
];

const multiplication = new Uint8Array(65536);
for (let a = 0; a < 256; a++) {
  for (let b = 0; b < 256; b++) {
    let x = a;
    let y = b;
    let v = 0;
    while (y) {
      if (y & 1) v ^= x;
      x = (x << 1) ^ ((x & 128) ? 0x11b : 0);
      x &= 255;
      y >>>= 1;
    }
    multiplication[256 * a + b] = v;
  }
}
const multiply = (a, b) => multiplication[256 * a + b];
const inverseScalars = new Uint8Array(256);
for (let x = 1; x < 256; x++) {
  const y = Array.from({length:255}, (_, i) => i + 1)
    .find(candidate => multiply(x, candidate) === 1);
  assert(y !== undefined);
  inverseScalars[x] = y;
}

const transpose = m => m[0].map((_, j) => m.map(row => row[j]));
const rotate = m => transpose(m).map(row => row.reverse());

/** Gauss-Jordan inverse over GF256, with every row operation explicit. */
function inverse(m) {
  const a = m.map((row, i) =>
    row.slice().concat([0, 1, 2, 3].map(j => +(i === j))));
  for (let col = 0; col < 4; col++) {
    let pivot = col;
    while (pivot < 4 && a[pivot][col] === 0) pivot++;
    if (pivot === 4) return null;
    [a[pivot], a[col]] = [a[col], a[pivot]];
    const inv = inverseScalars[a[col][col]];
    for (let j = 0; j < 8; j++) a[col][j] = multiply(a[col][j], inv);
    for (let row = 0; row < 4; row++) {
      if (row === col) continue;
      const factor = a[row][col];
      for (let j = 0; j < 8; j++) {
        a[row][j] ^= multiply(factor, a[col][j]);
      }
    }
  }
  return a.map(row => row.slice(4));
}

function transform(data, matrix) {
  assert.equal(data.length % 4, 0);
  const out = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i += 4) {
    for (let row = 0; row < 4; row++) {
      let value = 0;
      for (let col = 0; col < 4; col++) {
        value ^= multiply(matrix[row][col], data[i + col]);
      }
      out[i + row] = value;
    }
  }
  return [...out];
}

function isPrintable(byte) {
  return byte >= 32 && byte <= 126 || byte === 9 || byte === 10 ||
    byte === 13;
}

function score(data) {
  let printed = 0;
  let longest = 0;
  let current = 0;
  for (const byte of data) {
    current = isPrintable(byte) ? current + 1 : 0;
    printed += +(isPrintable(byte));
    longest = Math.max(longest, current);
  }
  return {printed, longest};
}

function allKeys() {
  const keys = [];
  for (const [family, matrix] of bases) {
    let current = matrix;
    for (let turn = 0; turn < 4; turn++) {
      for (let flip = 0; flip < 2; flip++) {
        const key = (flip ? current.map(row => row.slice().reverse()) :
          current).map(row => row.map(n => n & 255));
        const keyInverse = inverse(key);
        assert(keyInverse, family + " must be nonsingular in GF256");
        for (const [operation, m] of [
          ["K", key], ["Kinv", keyInverse],
          ["Kt", transpose(key)], ["KinvT", transpose(keyInverse)]
        ]) keys.push({family, turn, flip, operation, matrix:m});
      }
      current = rotate(current);
    }
  }
  assert.equal(keys.length, 128);
  return keys;
}

function run() {
  assert.equal(bytes.length, 256);
  const configs = allKeys();
  const results = configs.map(({family, turn, flip, operation, matrix}) => {
    const value = transform(bytes, matrix);
    return {family, turn, flip, operation, ...score(value),
      first16hex:Buffer.from(value.slice(0, 16)).toString("hex")};
  }).sort((a, b) => b.printed - a.printed || b.longest - a.longest);
  assert.equal(results[0].printed, 113);
  assert.equal(results[0].longest, 10);
  assert.equal(results[0].family, "prime-ordinal");
  assert.equal(results[0].operation, "Kinv");
  assert.equal(results[0].first16hex, "49a3e49caab30a061bae60c610d27902");

  const prose = [...Buffer.from("WORDS ARE THE MAP. NUMBERS ARE THE DIRECTION. "
    .repeat(7).slice(0, 256), "ascii")];
  assert.equal(prose.length, 256);
  const k = configs[0].matrix;
  const ciphertext = transform(prose, k);
  assert.deepEqual(transform(ciphertext, inverse(k)), prose);

  let state = 0x15f13301;
  const next = () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
  const maxima = [];
  for (let trial = 0; trial < 1000; trial++) {
    const shuffled = bytes.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = next() % (i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    maxima.push(Math.max(...configs.map(({matrix}) =>
      score(transform(shuffled, matrix)).printed)));
  }
  const exceed = maxima.filter(x => x >= results[0].printed).length;
  maxima.sort((a, b) => a - b);
  return {
    tableSha256:crypto.createHash("sha256").update(sourceText).digest("hex"),
    mode:"standard AES polynomial x^8+x^4+x^3+x+1, GF(256)",
    originalTableBytes:bytes.length,
    operations:configs.length,
    originalTop:results.slice(0, 4),
    originalPrintRange:[results.at(-1).printed, results[0].printed],
    fullFamilyMatchedNull: {
      trials:1000,
      median: maxima[500],
      q95: maxima[950],
      atLeastObserved:exceed,
      empiricalUpperTail:(exceed+1)/1001
    },
    positivePlantRecovered:prose.length,
    interpretation:"No LP2 plaintext or recognized original payload header"
  };
}

if (require.main === module) console.log(JSON.stringify(run(), null, 2));
module.exports = {run, inverse, transform};
