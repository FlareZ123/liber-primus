"use strict";

/**
 * Source-derived 2013 Twitter bytes as a GP29 key on FIRST DIFFERENCES
 * of the actual, unmodified LP2 unknown ciphertext.
 *
 * Source premise: low LP2 adjacent-repeat rate suggests a chaining state
 * C[i] = C[i-1] + P[i] + sign * K[offset+i] (mod 29).
 * This attack searches every full-length offset of the authentic 2013 byte tape
 * for three fixed byte-to-GP maps, two tape directions and both signs.
 * No ciphertext smoothing, skip recovery, rekeying or word-boundary editing.
 * Run: node sims/lp2_2013_twitter_backchain_alloffset_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");

/** @param {string} name @returns {string} */
function read(name) {
  return fs.readFileSync(path.join(root, name), "utf8").replace(/\r\n/g, "\n");
}
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages = gp.pages.filter(p => p.page < 56 && p.indices.length);
const cipher = pages.flatMap(p => p.indices);
const N = cipher.length;
assert.equal(pages.length, 55);
assert.equal(N, 12956);
assert.equal(gp.pages[57].indices.length, 95);

const dump = read("resources/cicada2013-twitter-hex-stream.txt");
const chunks = [];
let end = 0;
for (const line of dump.trim().split("\n")) {
  const match = line.match(/^([0-9a-f]+):\s*([0-9a-f]+)$/i);
  assert(match, "Twitter record format");
  const offset = parseInt(match[1], 16);
  const hex = match[2];
  assert.equal(hex.length % 2, 0);
  chunks.push({ offset, hex });
  end = Math.max(end, offset + hex.length / 2);
}
assert.equal(chunks.length, 988);
assert.equal(end, 64167);
const bytes = new Uint8Array(end);
const seen = new Uint8Array(end);
for (const {offset, hex} of chunks) {
  for (let j = 0; j < hex.length; j += 2) {
    const position = offset + j / 2;
    assert.equal(seen[position], 0, "overlapping byte offset");
    bytes[position] = parseInt(hex.slice(j, j + 2), 16);
    seen[position] = 1;
  }
}
assert(seen.every(x => x === 1), "complete 2013 stream");

/**
 * Encodes Shakespeare using source-calibrated GP29 spelling already independently
 * established by the solved LP1/p57 regressions in the research repository.
 * @param {string} source
 * @returns {number[]}
 */
function nativeGP(source) {
  const clean = source.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const tokens = gp.translit.map((s, i) => ({ s, i }))
    .sort((a, b) => b.s.length - a.s.length);
  const out = [];
  for (const word of clean.match(/[A-Z]+/g) || []) {
    for (let j = 0; j < word.length;) {
      if (word.startsWith("ING", j)) {
        out.push(21);
        j += 3;
      } else if (word.startsWith("IO", j)) {
        out.push(27);
        j += 2;
      } else {
        const t = tokens.find(t => word.startsWith(t.s, j));
        assert(t, "every source word must GP-encode");
        out.push(t.i);
        j += t.s.length;
      }
    }
  }
  return out;
}
const sourceGP = nativeGP(read("resources/control/shakespeare_first300k.txt"));
assert.equal(sourceGP.length, 217106);
assert(sourceGP.length >= N);
const frequency = Array(29).fill(0.01);
for (const rune of sourceGP) frequency[rune]++;
const logOdds = frequency.map(f => Math.log(29 * f / (sourceGP.length + 0.29)));
const originalDelta = Int8Array.from(cipher, (c, i) =>
  (c + 29 - (i ? cipher[i - 1] : 0)) % 29);
const native350 = sourceGP.slice(0, 350).reduce((v, x) => v + logOdds[x], 0);
assert(Math.abs(native350 - 154.463) < 0.002, "native source LLR calibration");

const keys = {
  mod29: Array.from(bytes, x => x % 29),
  scaled29: Array.from(bytes, x => Math.floor(29 * x / 256)),
  low5discard: Array.from(bytes, x => x & 31).filter(x => x < 29)
};
assert.equal(keys.low5discard.length, 58121);
const TRAIN = 350;
const HOLD_START = 6600;
const result = [];

/**
 * @param {ArrayLike<number>} delta
 * @param {number[]} key
 * @param {number} start
 * @param {number} at
 * @param {number} length
 * @param {number} sign -1 subtracts key; +1 adds it
 * @returns {number}
 */
function llr(delta, key, start, at, length, sign) {
  let score = 0;
  for (let i = at; i < at + length; i++) {
    const letter = (delta[i] + 29 + sign * key[start + i]) % 29;
    score += logOdds[letter];
  }
  return score;
}

/**
 * @param {ArrayLike<number>} delta
 * @param {number[]} key
 * @param {number} sign
 * @param {number} limit
 * @returns {{top:{offset:number,train:number,hold:number}[], aboveZero:number, aboveMinus100:number, offsets:number}}
 */
function scan(delta, key, sign, limit = 5) {
  const top = [];
  let aboveZero = 0;
  let aboveMinus100 = 0;
  const offsets = key.length - N + 1;
  for (let offset = 0; offset < offsets; offset++) {
    const train = llr(delta, key, offset, 0, TRAIN, sign);
    if (train > 0) aboveZero++;
    if (train > -100) aboveMinus100++;
    if (top.length < limit) {
      top.push({ offset, train });
      top.sort((a, b) => b.train - a.train);
    } else if (train > top[top.length - 1].train) {
      top[top.length - 1] = { offset, train };
      top.sort((a, b) => b.train - a.train);
    }
  }
  return {
    offsets, aboveZero, aboveMinus100,
    top: top.map(t => ({
      ...t,
      hold: llr(delta, key, t.offset, HOLD_START, TRAIN, sign)
    }))
  };
}
const expectedOffsets = [
  13893, 12262, 29484, 25263,
  22113, 2540, 9384, 40692,
  18466, 42645, 26749, 11585
];
const expectedBest = [
  -172.174, -148.221, -163.903, -154.790,
  -165.605, -166.004, -156.384, -161.085,
  -162.504, -147.746, -170.857, -161.214
];
for (const [name, original] of Object.entries(keys)) {
  for (const orientation of ["forward", "reverse"]) {
    const key = orientation === "forward" ? original : [...original].reverse();
    for (const sign of [-1, 1]) {
      const decision = scan(originalDelta, key, sign);
      const p = result.length;
      assert.equal(decision.top[0].offset, expectedOffsets[p],
        "original full-key alignment winner");
      assert(Math.abs(decision.top[0].train - expectedBest[p]) < 0.002,
        "original exact LLR snapshot");
      assert.equal(decision.aboveZero, 0);
      assert.equal(decision.aboveMinus100, 0);
      assert(decision.top.every(t => t.hold < 0),
        "no selected original offset yields source-native holdout");
      result.push({
        name, orientation, sign,
        offsetCount: decision.offsets,
        bestOffset: decision.top[0].offset,
        train: decision.top[0].train,
        hold: decision.top[0].hold
      });
    }
  }
}
assert.equal(result.length, 12);
assert.equal(result.reduce((n, r) => n + r.offsetCount, 0), 590360);

/*
 * Real-length English positive: plant the first 12,956 source-native GP runes
 * into a fully reversible C-prev+P+K chain with an otherwise unknown source
 * offset 761, and recover that exact offset blind from the first 350 runes.
 */
const trueOffset = 761;
const key = keys.mod29;
const syntheticCipher = [];
for (let i = 0; i < N; i++) {
  const prev = i ? syntheticCipher[i - 1] : 0;
  syntheticCipher.push((prev + sourceGP[i] + key[trueOffset + i]) % 29);
}
const plantDelta = Int8Array.from(syntheticCipher, (x, i) =>
  (x + 29 - (i ? syntheticCipher[i - 1] : 0)) % 29);
const recovered = Array.from(plantDelta, (x, i) =>
  (x - key[trueOffset + i] + 29) % 29);
assert.deepEqual(recovered, sourceGP.slice(0, N),
  "12,956-rune source-native positive exact inverse");
const plantedScreen = scan(plantDelta, key, -1, 3);
assert.equal(plantedScreen.top[0].offset, trueOffset);
assert(Math.abs(plantedScreen.top[0].train - 154.463) < 0.002);
assert(plantedScreen.top[0].train - plantedScreen.top[1].train > 300,
  "true source offset wins without language fitting");


/**
 * Second, structurally distinct source-key transfer: reserve ciphertext
 * difference zero for GP EA (index 28) and map all other differences
 * through 28 nonzero wheel positions. Its inverse is exactly reversible.
 * A plain GP-EA yields a repeated adjacent ciphertext rune, without a
 * rejection draw or extra keystream consumption.
 */
const keys28 = {
  mod28: Array.from(bytes, x => x % 28),
  scaled28: Array.from(bytes, x => Math.floor(28 * x / 256)),
  low5discard28: Array.from(bytes, x => x & 31).filter(x => x < 28)
};
assert.equal(keys28.low5discard28.length, 56184);
const originalZeroDifferences = Array.from(originalDelta).filter(x => x === 0).length;
assert.equal(originalZeroDifferences, 86);
const expectedOffsets28 = [
  36432, 37884, 44841, 22876,
  4829, 30875, 19573, 4619,
  32487, 20367, 20123, 6705
];
const expectedBest28 = [
  -161.944, -157.592, -152.545, -161.785,
  -146.879, -143.998, -156.731, -135.239,
  -150.392, -152.585, -143.002, -153.118
];

/**
 * @param {ArrayLike<number>} delta
 * @param {number[]} key
 * @param {number} start
 * @param {number} at
 * @param {number} length
 * @param {number} sign
 * @returns {number}
 */
function llr28(delta, key, start, at, length, sign) {
  let score = 0;
  for (let i = at; i < at + length; i++) {
    const step = delta[i];
    const rune = step === 0 ? 28 :
      (step - 1 + 28 + sign * key[start + i]) % 28;
    score += logOdds[rune];
  }
  return score;
}

/**
 * @param {ArrayLike<number>} delta
 * @param {number[]} key
 * @param {number} sign
 * @param {number} limit
 * @returns {{offsets:number,aboveZero:number,aboveMinus100:number,
 * top:{offset:number,train:number,hold:number}[]}}
 */
function scan28(delta, key, sign, limit = 5) {
  const top = [];
  let aboveZero = 0;
  let aboveMinus100 = 0;
  const offsets = key.length - N + 1;
  for (let offset = 0; offset < offsets; offset++) {
    const train = llr28(delta, key, offset, 0, TRAIN, sign);
    if (train > 0) aboveZero++;
    if (train > -100) aboveMinus100++;
    if (top.length < limit) {
      top.push({ offset, train });
      top.sort((a, b) => b.train - a.train);
    } else if (train > top[top.length - 1].train) {
      top[top.length - 1] = { offset, train };
      top.sort((a, b) => b.train - a.train);
    }
  }
  return { offsets, aboveZero, aboveMinus100,
    top: top.map(t => ({
      ...t, hold: llr28(delta, key, t.offset, HOLD_START, TRAIN, sign)
    }))
  };
}
const source28Result = [];
for (const [name, original] of Object.entries(keys28)) {
  for (const orientation of ["forward", "reverse"]) {
    const key28 = orientation === "forward" ? original : [...original].reverse();
    for (const sign of [-1, 1]) {
      const decision = scan28(originalDelta, key28, sign);
      const p = source28Result.length;
      assert.equal(decision.top[0].offset, expectedOffsets28[p],
        "original 28-wheel alignment winner");
      assert(Math.abs(decision.top[0].train - expectedBest28[p]) < 0.002,
        "original 28-wheel LLR snapshot");
      assert.equal(decision.aboveZero, 0);
      assert.equal(decision.aboveMinus100, 0);
      assert(decision.top.every(t => t.hold < 0));
      source28Result.push({
        name, orientation, sign,
        offsetCount: decision.offsets,
        bestOffset: decision.top[0].offset,
        train: decision.top[0].train,
        hold: decision.top[0].hold
      });
    }
  }
}
assert.equal(source28Result.length, 12);
assert.equal(source28Result.reduce((n, r) => n + r.offsetCount, 0), 582612);

const wheelKey = keys28.mod28;
const wheelCipher = [];
const wheelDelta = [];
for (let i = 0; i < N; i++) {
  const truePlain = sourceGP[i];
  const step = truePlain === 28 ? 0 :
    1 + (truePlain + wheelKey[trueOffset + i]) % 28;
  wheelDelta.push(step);
  wheelCipher.push(((i ? wheelCipher[i - 1] : 0) + step) % 29);
}
const wheelRecomputedDelta = Int8Array.from(wheelCipher, (x, i) =>
  (x + 29 - (i ? wheelCipher[i - 1] : 0)) % 29);
assert.deepEqual(Array.from(wheelRecomputedDelta), wheelDelta,
  "ciphertext-difference provenance for wheel plant");
const wheelRecovered = Array.from(wheelRecomputedDelta, (step, i) =>
  step === 0 ? 28 : (step - 1 + 28 - wheelKey[trueOffset + i]) % 28);
assert.deepEqual(wheelRecovered, sourceGP.slice(0, N),
  "12,956-source-rune wheel positive exact inverse");
const plantedWheelScreen = scan28(wheelRecomputedDelta, wheelKey, -1, 3);
assert.equal(plantedWheelScreen.top[0].offset, trueOffset);
assert(Math.abs(plantedWheelScreen.top[0].train - 154.463) < 0.002);
assert(plantedWheelScreen.top[0].train - plantedWheelScreen.top[1].train > 300);

console.log(JSON.stringify({
  status: "original-source direct backchain running-key negative",
  source2013: { records: chunks.length, byteLength: bytes.length,
    runes: N, englishGPReference: sourceGP.length },
  model: "P[i] = (C[i] - C[i-1] +/- mappedTwitterBytes[offset+i]) mod29",
  train: { offset: 0, length: TRAIN },
  holdout: { offset: HOLD_START, length: TRAIN },
  scanned: result,
  twentyEightWheel: { originalZeroDifferences, scanned: source28Result,
    plantedWinner: plantedWheelScreen.top[0],
    plantedSecond: plantedWheelScreen.top[1],
    exactRecovered: wheelRecovered.length },
  genuineGpNativePlant: {
    sourceOffset: trueOffset, decoded: recovered.length,
    blindWinner: plantedScreen.top[0], nextBest: plantedScreen.top[1]
  },
  conclusion: "no unknown plaintext or source-selected decoder"
}, null, 2));
