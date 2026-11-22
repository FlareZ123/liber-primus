"use strict";

/**
 * Original p8 source "XIXM" (Roman XIX = GP29 M index19) as a 19-rune
 * stationary Vigenere / arbitrary monoalphabetic-per-phase key hypothesis.
 * Original p8 black243 + p9..p13 1337 => 1580 original receiver runes.
 *
 * Windows11 Node22 standalone read-only SFT, with solved-source-native GP
 * positive controls and original whole-receiver equality invariants.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = p => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
const gp = read("resources/liber-primus/lp2-corpus.json");
const ref = read("resources/external/relikd-solved-gp29-native-v1.json");
const red = gp.pages[8].indices.slice(0, 12);
assert.deepEqual(red.slice(0, 4), [14, 10, 14, 19]);
assert.equal(red.slice(0, 4).map(v => gp.translit[v]).join(""), "XIXM");
assert.equal(red[3], 19); // XIX is Roman 19, M is GP ordinal0 19
const sourceOriginal = gp.pages.slice(8, 14)
  .map((p, i) => i === 0 ? p.indices.slice(12) : p.indices);
const lengths = sourceOriginal.map(x => x.length);
assert.deepEqual(lengths, [243, 268, 263, 273, 261, 272]);
assert.equal(lengths.reduce((a, b) => a + b, 0), 1580);

const index = new Map(gp.runes.map((r, i) => [r, i]));
const native = ref.sections.flatMap(s => [...s.source_text]
  .filter(ch => index.has(ch)).map(ch => index.get(ch)));
assert(native.length >= 1580);
let at = 0;
const sourceNative = lengths.map(n => {
  const w = native.slice(at, at + n);
  at += n;
  return w;
});

/**
 * Exact same-symbol pair frequency in each secret alphabet class.
 * All arbitrary fixed bijections within a class preserve this statistic.
 * @param {number[][]} parts
 * @param {number} period
 * @param {boolean} restart
 * @returns {{ioc:number, equal:number, pairs:number}}
 */
function invariant(parts, period, restart, ignoreF = false) {
  const groups = new Map();
  let position = 0;
  for (const part of parts) {
    for (let i = 0; i < part.length; i++) {
      // Restarted groups incorporate a distinct page base address.
      const label = restart ? (position - i) + ":" + (i % period) : String(position % period);
      const counts = groups.get(label) || Array(29).fill(0);
      if (!(ignoreF && part[i] === 0)) counts[part[i]]++;
      groups.set(label, counts);
      position++;
    }
  }
  let equal = 0, pairs = 0;
  for (const counts of groups.values()) {
    const n = counts.reduce((a, b) => a + b, 0);
    equal += counts.reduce((a, b) => a + b * (b - 1), 0);
    pairs += n * (n - 1);
  }
  return {ioc: equal / pairs, equal, pairs};
}

const continuous = invariant(sourceOriginal, 19, false);
const pageReset = invariant(sourceOriginal, 19, true);
const noFOriginal = [invariant(sourceOriginal, 19, false, true),
  invariant(sourceOriginal, 19, true, true)];
const nativeContinuous = invariant(sourceNative, 19, false);
const nativePageReset = invariant(sourceNative, 19, true);
/**
 * Independent complete solved-GP control: keep every possible 1,580-rune
 * native window, preserving the exact source page cuts and two key clocks.
 * Frequency collisions survive all secret per-phase rune bijections.
 * @returns {{count:number,min:number[],max:number[],atOrBelow:number[]}}
 */
function allNativeWindows() {
  const targets = [continuous.ioc, pageReset.ioc];
  const minimum = [Infinity, Infinity], maximum = [-Infinity, -Infinity];
  const atOrBelow = [0, 0];
  const noFTargets = noFOriginal.map(x => x.ioc);
  const noFMinimum = [Infinity, Infinity];
  const noFMaximum = [-Infinity, -Infinity];
  const noFAtOrBelow = [0, 0];
  let count = 0;
  for (let start = 0; start + 1580 <= native.length; start++) {
    let i = start;
    const candidate = lengths.map(n => {
      const page = native.slice(i, i + n);
      i += n;
      return page;
    });
    const measured = [invariant(candidate, 19, false).ioc,
      invariant(candidate, 19, true).ioc];
    const noFMeasured = [invariant(candidate, 19, false, true).ioc,
      invariant(candidate, 19, true, true).ioc];
    for (let k = 0; k < 2; k++) {
      minimum[k] = Math.min(minimum[k], measured[k]);
      maximum[k] = Math.max(maximum[k], measured[k]);
      atOrBelow[k] += Number(measured[k] <= targets[k]);
      noFMinimum[k] = Math.min(noFMinimum[k], noFMeasured[k]);
      noFMaximum[k] = Math.max(noFMaximum[k], noFMeasured[k]);
      noFAtOrBelow[k] += Number(noFMeasured[k] <= noFTargets[k]);
    }
    count++;
  }
  return {count, min:minimum, max:maximum, atOrBelow,
    ignoreTransparentF: {original:noFTargets, min:noFMinimum,
      max:noFMaximum, atOrBelow:noFAtOrBelow}};
}
const nativeWindows = allNativeWindows();
assert.equal(nativeWindows.count, 1400);
assert.deepEqual(nativeWindows.atOrBelow, [0, 0]);
assert.deepEqual(nativeWindows.ignoreTransparentF.atOrBelow, [0, 0]);

function nearly(x, y) { assert(Math.abs(x - y) < 1e-15, x + " vs " + y); }
nearly(continuous.ioc, 0.03358703355621977);
nearly(pageReset.ioc, 0.03082965144820815);
nearly(nativeContinuous.ioc, 0.06232089483252704);
nearly(nativePageReset.ioc, 0.0648993618065783);

/**
 * A source-independent planted nonzero, unknown-key GP29 Vigenere cipher;
 * verify source-native plaintext's invariant survives BOTH key-reset modes.
 * @param {number[][]} parts
 * @param {boolean} restart
 */
function positivePlant(parts, restart) {
  let globalPosition = 0;
  const original = parts.map(p => p.slice());
  const ciphertext = parts.map((p, page) => p.map((r, j) => {
    const phase = restart ? j % 19 : globalPosition % 19;
    const key = (7 * phase + 3 + (restart ? 5 * page : 0)) % 29;
    globalPosition++;
    return (r + key) % 29;
  }));
  assert.deepEqual(invariant(ciphertext, 19, restart),
    invariant(original, 19, restart));
  let at = 0;
  const restored = ciphertext.map((p, page) => p.map((c, j) => {
    const phase = restart ? j % 19 : at % 19;
    const key = (7 * phase + 3 + (restart ? 5 * page : 0)) % 29;
    at++;
    return (c - key + 29) % 29;
  }));
  assert.deepEqual(restored, original);
  return true;
}
assert(positivePlant(sourceNative, false));
assert(positivePlant(sourceNative, true));
assert(continuous.ioc < 0.04 && pageReset.ioc < 0.04);
assert(nativeContinuous.ioc > 0.06 && nativePageReset.ioc > 0.06);
console.log(JSON.stringify({
  source:"p8 Roman XIX=19 and M GP0=19, original p8 black+p9..p13",
  receiverLengths:lengths, period:19,
  continuousOriginal:continuous, pageResetOriginal:pageReset,
  solvedNativeContinuous:nativeContinuous,
  solvedNativePageReset:nativePageReset,
  allSolvedNativeWindows:nativeWindows,
  positive:"19-class unknown-key ciphertext decrypt/reencrypt, both clock rules PASS",
  conclusion:"No stationary GP29 Vigenere19 or arbitrary secret per-19-phase alphabet explains this receiver as native-English GP"
},null,2));
