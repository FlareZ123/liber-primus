"use strict";
/**
 * A complete-secret, source-shaped 11-column key gate for the p6/p7
 * original 308-rune interval and the DH23 shared-2 GP29 multiplicative
 * group. Removes the red11 key assumption and optimizes every one of
 * 11 unknown keys over all 29 GP indices (28 for the multiplicative map).
 *
 * This is a blinded native-GP control test, not a discovered LP2 key.
 * Node 22: node sims/lp2_p6_p7_dh2_allsecret_11column_native_gp_gate.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {encodeSourceNativeGP} = require("./lp2_native_gp_source_orthography_sft.cjs");

const read = name => fs.readFileSync(path.resolve(__dirname, "..", name), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const page = n => corpus.pages.find(p => p.page === n).indices;
const mod = n => ((n % 29) + 29) % 29;
const inv = Array.from({length: 29}, (_, n) => {
  if (!n) return 0;
  for (let v = 1; v < 29; v++) if (n * v % 29 === 1) return v;
  throw new Error("No inverse for " + n);
});
const states = Array.from({length: 28}, (_, i) => {
  let v = 1;
  for (let j = 0; j < i; j++) v = mod(v * 2);
  return v;
});
assert.equal(new Set(states).size, 28);
assert.equal(mod(states[27] * 2), 1);
const source = page(6).slice(82).concat(page(7).slice(0, 194));
const seed = [...ink.pages.find(p => p.page === 6).red_spans[0].runes]
  .map(r => corpus.runes.indexOf(r));
assert.equal(source.length, 308);
assert.equal(seed.length, 11);
const native = encodeSourceNativeGP(read("resources/control/gibran_prophet_58585.txt"));
assert.ok(native.length > 30000);
const hist = Array(29).fill(0.5);
for (const x of native) hist[x]++;
const total = hist.reduce((a, b) => a + b, 0);
const logfreq = hist.map(n => Math.log(n / total));

/** @param {number} type @param {number} c @param {number} k @param {number} r */
function invert(type, c, k, r) {
  if (type === 0) return mod(inv[states[r]] * (c - k));
  if (type === 1) return mod(c - states[r] * k);
  return mod(c * inv[mod(states[r] * k)]);
}
/** @param {number} type @param {number} p @param {number} k @param {number} r */
function forward(type, p, k, r) {
  if (type === 0) return mod(states[r] * p + k);
  if (type === 1) return mod(p + states[r] * k);
  return mod(states[r] * k * p);
}
/** @param {number} type @param {number[]} c @param {number[]} key */
function decode(type, c, key) {
  return c.map((v, i) => invert(type, v, key[i % 11], Math.floor(i / 11)));
}
/** @param {number} type @param {number[]} p @param {number[]} key */
function encode(type, p, key) {
  return p.map((v, i) => forward(type, v, key[i % 11], Math.floor(i / 11)));
}
/** @param {number[]} x @param {number} fromRow @param {number} toRow */
const score = (x, fromRow, toRow) => x.slice(fromRow * 11, toRow * 11)
  .reduce((sum, v) => sum + logfreq[v], 0) / ((toRow - fromRow) * 11);

/**
 * Exact separable maximum likelihood over all 29^11 keys because
 * the GP-native unigram model sums across independent source columns.
 * @param {number} type
 * @param {number[]} ciphertext
 * @param {number} trainRows
 */
function recover(type, ciphertext, trainRows) {
  const key = [];
  for (let col = 0; col < 11; col++) {
    let best = -Infinity, arg = -1;
    for (let k = type === 2 ? 1 : 0; k < 29; k++) {
      let s = 0;
      for (let r = 0; r < trainRows; r++)
        s += logfreq[invert(type, ciphertext[r * 11 + col], k, r)];
      if (s > best) { best = s; arg = k; }
    }
    key.push(arg);
  }
  const plain = decode(type, ciphertext, key);
  return {
    key,
    train: score(plain, 0, trainRows),
    holdout: trainRows === 28 ? null : score(plain, trainRows, 28),
    oracleAllRows: score(plain, 0, 28),
    first110: plain.slice(0, 110).map(v => corpus.translit[v]).join("")
  };
}
function quantile(xs, q) {
  const a = xs.slice().sort((x, y) => x - y);
  return a[Math.floor((a.length - 1) * q)];
}
const sample = Array.from({length: 24}, (_, i) =>
  native.slice(i * 1319 + 3000, i * 1319 + 3000 + 308));
assert.ok(sample.every(s => s.length === 308));
const branches = [];
for (let type = 0; type < 3; type++) {
  assert.deepEqual(decode(type, encode(type, sample[0], seed), seed), sample[0],
    "positive native GP plant under authentic red seed");
  const originalFit = recover(type, source, 14);
  const originalAll = recover(type, source, 28);
  const control = sample.map(p => recover(type, encode(type, p, seed), 14));
  const fullControls = sample.map(p => recover(type, encode(type, p, seed), 28));
  const held = control.map(x => x.holdout);
  const oracle = fullControls.map(x => x.oracleAllRows);
  branches.push({
    operation: ["affine_2power_GP29","additive_2power_GP29","multiplicative_2power_GP29"][type],
    keySecretSearch: type === 2 ? "28^11" : "29^11",
    inferredOriginalKeyTrain14: originalFit.key,
    inferredOriginalKeyAll28: originalAll.key,
    originalTrainLogPerRune: originalFit.train,
    originalHoldoutLogPerRune: originalFit.holdout,
    originalOracleAllRowsLogPerRune: originalAll.oracleAllRows,
    originalFirst110: originalFit.first110,
    sourceNativeControls: 24,
    nativeControlsHoldoutMin: Math.min(...held),
    nativeControlsHoldoutMedian: quantile(held, 0.5),
    nativeControlsHoldoutMax: Math.max(...held),
    nativeControlsOracleMin: Math.min(...oracle),
    nativeControlsOracleMedian: quantile(oracle, 0.5),
    nativeControlsOracleMax: Math.max(...oracle),
    originalBelowEveryNativeHoldout: originalFit.holdout < Math.min(...held),
    originalBelowEveryNativeOracle: originalAll.oracleAllRows < Math.min(...oracle),
    exactPositivePlant: true
  });
}
console.log(JSON.stringify({
  classification: "native GP corpus-calibrated complete-secret 11column DH2 inference",
  originalReceiver: "p6[82..195]+p7[0..193]",
  sourceRunes: source.length,
  originalBoundaries: [11, 28],
  familyFixedState: "2^row mod29, row=0..27",
  nativeCalibrationLength: native.length,
  sourceNativeControls:24,
  trainingRows:14,
  heldoutRows:14,
  results: branches
}, null, 2));
