"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");

const RADIX = 29;
const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRS";

/** @param {number} n @returns {number[]} */
function base29Digits(n) {
  assert.ok(Number.isInteger(n) && n >= 0);
  if (n === 0) return [0];
  const out = [];
  let x = n;
  while (x > 0) {
    out.push(x % RADIX);
    x = Math.floor(x / RADIX);
  }
  return out.reverse();
}

/** @param {number[]} digits @returns {number} */
function fromBase29(digits) {
  return digits.reduce((n, d) => {
    assert.ok(Number.isInteger(d) && d >= 0 && d < RADIX);
    return n * RADIX + d;
  }, 0);
}

/** @param {number} x @returns {number} */
function mod29(x) {
  return ((x % RADIX) + RADIX) % RADIX;
}

/** @param {number[]} a @param {number[]} b @returns {number} */
function equalCount(a, b) {
  return a.reduce((n, x, i) => n + Number(x === b[i]), 0);
}

const signedSource = fs.readFileSync("resources/historical/2013-tcp-server-worked-examples-source.md", "utf8");
assert.ok(signedSource.includes("C: BASE29 3301"));
assert.ok(signedSource.includes("S: 01 OK 3QO"));
assert.deepEqual(base29Digits(3301), [3, 26, 24]);
assert.equal(fromBase29([3, 26, 24]), 3301);
assert.equal([3, 26, 24].map((d) => ALPHABET[d]).join(""), "3QO");

const live = JSON.parse(fs.readFileSync("resources/external/2013-tcp-live-test-vectors.json", "utf8"));
const liveText = JSON.stringify(live);
assert.ok(liveText.includes('"base29Request":1033') || liveText.includes('"base29Request": 1033'));
assert.ok(liveText.includes('"base29Response":"16I"') || liveText.includes('"base29Response": "16I"'));
assert.ok(liveText.includes('"base29Request":30') || liveText.includes('"base29Request": 30'));
assert.ok(liveText.includes('"base29Response":"11"') || liveText.includes('"base29Response": "11"'));
assert.deepEqual(base29Digits(1033), [1, 6, 18]);
assert.deepEqual(base29Digits(30), [1, 1]);

// Frozen source-only p6 q-block receiver geometry from #3383.
const first = [30, 132, 4, 25];
const second = [146, 57, 132, 71];
const observed = second.map((value, i) => value - first[i]);
const Q = [4, -3, 4, 2];
const D = [0, 12, 12, -12];
assert.deepEqual(observed, [116, -75, 128, 46]);

const rivals = {
  signedHighLow: Q.map((q, i) => RADIX * q + D[i]),
  signedLowHigh: Q.map((q, i) => q + RADIX * D[i]),
  unsignedHighLow: Q.map((q, i) => RADIX * mod29(q) + mod29(D[i])),
  unsignedLowHigh: Q.map((q, i) => mod29(q) + RADIX * mod29(D[i])),
  oneBasedUnsignedHighLow: Q.map((q, i) => RADIX * (mod29(q) + 1) + (mod29(D[i]) + 1)),
  oneBasedUnsignedLowHigh: Q.map((q, i) => (mod29(q) + 1) + RADIX * (mod29(D[i]) + 1)),
  oneBasedFinalAddress: Q.map((q, i) => RADIX * q + D[i] + 1),
};

const scores = Object.fromEntries(Object.entries(rivals).map(([name, values]) => [name, equalCount(values, observed)]));
assert.deepEqual(rivals.signedHighLow, observed);
assert.equal(scores.signedHighLow, 4);
assert.equal(scores.unsignedHighLow, 2);
for (const [name, score] of Object.entries(scores)) {
  if (name === "signedHighLow" || name === "unsignedHighLow") continue;
  assert.equal(score, 0);
}

// The first-party BASE29 codec accepts unsigned integer digits. The exact p6
// displacement has a negative total in lane 2, so it requires a separate signed
// offset convention that the authenticated BASE29 example does not specify.
assert.ok(observed.some((x) => x < 0));
assert.throws(() => base29Digits(observed[1]));

console.log(JSON.stringify({
  status: "PASS",
  firstPartyBase29: {
    positiveControl3301: { digits: base29Digits(3301), text: "3QO" },
    contemporaryControls: {
      1033: { digits: base29Digits(1033), text: "16I" },
      30: { digits: base29Digits(30), text: "11" },
    },
    semantics: "unsigned positional numeral conversion; no address/offset semantics asserted",
  },
  p6: { first, second, observed, Q, D },
  rivals,
  exactLaneMatches: scores,
  decision: "SIGNED_29Q_PLUS_D_IS_EMPIRICALLY_DISTINCT_BUT_NOT_LICENSED_BY_AUTHENTICATED_BASE29_PRECEDENT",
}, null, 2));
