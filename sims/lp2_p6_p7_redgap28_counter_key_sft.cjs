"use strict";
/**
 * Source-fixed p6/p7 red-gap key hypothesis and exact original-cipher test.
 * Run: node sims/lp2_p6_p7_redgap28_counter_key_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const read = p => fs.readFileSync(path.resolve(__dirname, "..", p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const runeToValue = new Map(corpus.runes.map((r, i) => [r, i]));
const values = runes => [...runes].map(r => {
  assert.ok(runeToValue.has(r));
  return runeToValue.get(r);
});
const page = n => corpus.pages.find(p => p.page === n).indices;
const sum = xs => xs.reduce((a, b) => a + b, 0);
const mod = n => ((n % 29) + 29) % 29;
const ioc = xs => {
  const counts = Array(29).fill(0);
  for (const x of xs) counts[x]++;
  return counts.reduce((a, n) => a + n * (n - 1), 0) / (xs.length * (xs.length - 1));
};
const translit = xs => xs.map(x => corpus.translit[x]).join("");

const red6 = ink.pages.find(p => p.page === 6).red_spans[0];
const red7 = ink.pages.find(p => p.page === 7).red_spans[0];
assert.deepEqual([red6.start, red6.length, red7.start, red7.length], [71, 11, 194, 14]);
assert.deepEqual([page(6).length, page(7).length], [196, 208]);
const key = values(red6.runes);
const closing = values(red7.runes);
assert.deepEqual(key, [24, 16, 14, 17, 19, 6, 27, 15, 17, 14, 12]);
assert.equal(sum(key), 181);
assert.equal(sum(closing), 209);
const gap = page(6).slice(red6.start + red6.length).concat(page(7).slice(0, red7.start));
assert.equal(gap.length, 308);
assert.equal(gap.length, key.length * 28);
assert.equal(sum(closing) - sum(key), 28);

// Compare the complete physical consecutive-page red-span family, not only p6/p7.
const adjacent = [];
for (let p = 0; p < 55; p++) {
  const left = ink.pages.find(x => x.page === p)?.red_spans ?? [];
  const right = ink.pages.find(x => x.page === p + 1)?.red_spans ?? [];
  for (const a of left) for (const b of right) {
    const aVals = values(a.runes), bVals = values(b.runes);
    const intervening = page(p).length - a.start - a.length + b.start;
    adjacent.push({
      pagePair: [p, p + 1],
      leftLen: a.length,
      leftSum: sum(aVals),
      rightSum: sum(bVals),
      gap: intervening,
      completeCycles: intervening / a.length,
      redSumDifference: sum(bVals) - sum(aVals),
      counterIdentity: intervening === a.length * (sum(bVals) - sum(aVals))
    });
  }
}
assert.deepEqual(adjacent.map(x => x.pagePair), [[6, 7], [7, 8], [39, 40], [53, 54]]);
assert.deepEqual(adjacent.filter(x => x.counterIdentity).map(x => x.pagePair), [[6, 7]]);

/** @param {boolean} advance @param {number} sign */
function fixedInverse(advance, sign) {
  const shifts = gap.map((_, i) => mod(key[i % 11] + (advance ? Math.floor(i / 11) : 0)));
  const decoded = gap.map((x, i) => mod(x + sign * shifts[i]));
  const reencoded = decoded.map((x, i) => mod(x - sign * shifts[i]));
  assert.deepEqual(reencoded, gap);
  return {
    rule: advance ? "11-symbol key, block-counter +1 each block" : "11-symbol key, fixed period",
    sign: sign < 0 ? "subtract" : "add",
    ioc: ioc(decoded),
    firstHalfIoc: ioc(decoded.slice(0, 154)),
    secondHalfIoc: ioc(decoded.slice(154)),
    first100: translit(decoded.slice(0, 100)),
    last60: translit(decoded.slice(-60))
  };
}

/**
 * Authentic solved-p56 F-transparent key rule, with exact ciphertext-F
 * branching. Clock consumes one key per non-F plaintext rune.
 * This is separate from the fixed 308=28*11 counter hypothesis.
 * @param {number} sign
 */
function transparentReachability(sign) {
  let phases = new Set([0]);
  for (let offset = 0; offset < gap.length; offset++) {
    const next = new Set(), ciphertext = gap[offset];
    for (const phase of phases) {
      if (ciphertext === 0) next.add(phase); // literal plaintext F: no key advance
      const plain = mod(ciphertext + sign * key[phase % key.length]);
      if (plain !== 0) next.add(phase + 1);
    }
    if (!next.size) return { possible: false, firstImpossibleOffset: offset };
    phases = next;
  }
  return { possible: true, finalPhaseCount: phases.size };
}
const outputs = [
  fixedInverse(false, -1), fixedInverse(false, +1),
  fixedInverse(true, -1), fixedInverse(true, +1)
];

// Second source-motivated but unselected operation: the red GP0 endpoints
// 181 and 209 share phi=180. Read 28 intervening integer totients in
// the natural source direction as 28 row shifts, with 11 ciphertext runes/row.
/** @param {number} n */
function phi(n) {
  let rest = n, result = n;
  for (let p = 2; p * p <= rest; p++) {
    if (rest % p !== 0) continue;
    while (rest % p === 0) rest /= p;
    result -= result / p;
  }
  if (rest > 1) result -= result / rest;
  return result;
}
assert.deepEqual([phi(181), phi(209)], [180, 180]);
const totientRows = Array.from({length: 28}, (_, row) => mod(phi(181 + row)));
const totientOutputs = [-1, +1].map(sign => {
  const decoded = gap.map((c, i) => mod(c + sign * totientRows[Math.floor(i / 11)]));
  assert.deepEqual(
    decoded.map((p, i) => mod(p - sign * totientRows[Math.floor(i / 11)])),
    gap
  );
  return {
    sign: sign < 0 ? "subtract" : "add",
    ioc: ioc(decoded),
    firstHalfIoc: ioc(decoded.slice(0, 154)),
    secondHalfIoc: ioc(decoded.slice(154)),
    first100: translit(decoded.slice(0, 100))
  };
});

// Standard lexicographically keyed 11-column transposition: a simple
// historically available operation selected by red11 width and the 28 full
// blocks. Stable ranking uses the original GP29 symbol order, with source
// order breaking equal-symbol ties.
/** @param {boolean} descending */
function columnOrder(descending) {
  return key.map((value, index) => ({value, index}))
    .sort((a, b) => (descending ? b.value - a.value : a.value - b.value) || a.index - b.index)
    .map(x => x.index);
}
/**
 * @param {number[]} order
 * @param {"column-chunks"|"rowwise-swap"} layout
 */
function inverseColumnar(order, layout) {
  const rows = Array.from({length: 28}, () => Array(11).fill(0));
  if (layout === "column-chunks") {
    for (let j = 0; j < 11; j++) for (let r = 0; r < 28; r++)
      rows[r][order[j]] = gap[j * 28 + r];
  } else {
    for (let r = 0; r < 28; r++) for (let j = 0; j < 11; j++)
      rows[r][order[j]] = gap[r * 11 + j];
  }
  const decoded = rows.flat();
  const replay = [];
  if (layout === "column-chunks") {
    for (let j = 0; j < 11; j++) for (let r = 0; r < 28; r++)
      replay.push(rows[r][order[j]]);
  } else {
    for (let r = 0; r < 28; r++) for (let j = 0; j < 11; j++)
      replay.push(rows[r][order[j]]);
  }
  assert.deepEqual(replay, gap);
  return {
    layout, columnOrder: order, first100: translit(decoded.slice(0, 100)),
    adjacentEquals: decoded.slice(1).filter((v, i) => v === decoded[i]).length
  };
}
const transpositionOutputs = [false, true].flatMap(descending => {
  const order = columnOrder(descending);
  return [
    { ranking: descending ? "descending" : "ascending",
      ...inverseColumnar(order, "column-chunks") },
    { ranking: descending ? "descending" : "ascending",
      ...inverseColumnar(order, "rowwise-swap") }
  ];
});
const transparent = {
  subtract: transparentReachability(-1),
  add: transparentReachability(+1)
};
assert.deepEqual(transparent, {
  subtract: { possible: false, firstImpossibleOffset: 28 },
  add: { possible: false, firstImpossibleOffset: 7 }
});
console.log(JSON.stringify({
  classification: "source-aligned but negative direct-key receiver; no plaintext",
  ink: {
    keyPage: 6, keyStart: 71, keyLength: 11, keySum: 181,
    receiver: "physical p6 offsets 82..195 then p7 offsets 0..193",
    blackRunes: gap.length, repetitions: 28,
    closingPage: 7, closingStart: 194, closingLength: 14, closingSum: 209,
    increment: 28
  },
  adjacentControls: adjacent,
  ciphertextIoc: ioc(gap),
  output: outputs,
  consecutiveTotientRowShifts: totientRows,
  consecutiveTotientReadouts: totientOutputs,
  keyedColumnarReadouts: transpositionOutputs,
  authenticFTransparentFixedPeriod: transparent
}, null, 2));
