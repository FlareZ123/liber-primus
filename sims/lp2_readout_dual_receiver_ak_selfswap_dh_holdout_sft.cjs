"use strict";

/**
 * Dual READOUT receiver holdout.
 *
 * Verifies:
 * 1) all word-bounded 23-rune spans on unknown pages;
 * 2) the whole-READOUT sibling is the sole one-based (A,K)->(K,A)
 *    H-packet self-swap across that full family;
 * 3) the two #1706 center-F receivers are the only matched spans whose
 *    H endpoints are entirely DH-valued;
 * 4) they form the sole same-page boundary join and satisfy standard DH;
 * 5) the previously committed split (A,K) self-index recovers [a,p] and THE.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const raw = fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-transcription.txt"), "utf8");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const segments = raw.split(/^\s*%\s*$/m).slice(0, 55);

function physicalPage(segment) {
  return segment >= 50 ? segment + 1 : segment;
}

function mod29(value) {
  return ((value % 29) + 29) % 29;
}

function parsePage(source) {
  const runes = [];
  const words = [];
  let current = [];
  let start = 0;

  function flush() {
    if (!current.length) return;
    words.push({
      number: words.length + 1,
      start,
      end: start + current.length - 1,
      values: current.slice(),
    });
    current = [];
  }

  for (const char of [...source]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      if (!current.length) start = runes.length;
      current.push(value);
      runes.push(value);
    } else if ((char === "-" || char === ".") && current.length) {
      flush();
    }
  }
  flush();
  return { runes, words };
}

function shellWord(values) {
  const out = [];
  for (let left = 0, right = values.length - 1;
    left < right; left += 1, right -= 1) {
    out.push(
      mod29(values[left] - values[right]),
      mod29(values[left] + values[right])
    );
  }
  if (values.length % 2 === 1) {
    out.push(values[(values.length - 1) / 2]);
  }
  return out;
}

function modPow(base, exponent, modulus) {
  let result = 1 % modulus;
  let factor = base % modulus;
  let power = exponent;
  while (power > 0) {
    if (power % 2 === 1) result = (result * factor) % modulus;
    factor = (factor * factor) % modulus;
    power = Math.floor(power / 2);
  }
  return result;
}

const dh = { p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2 };
const dhSet = new Set(Object.values(dh));
const labels = new Map(Object.entries(dh).map(([name, value]) => [value, name]));

const spans = [];
for (let segment = 0; segment < segments.length; segment += 1) {
  const page = parsePage(segments[segment]);
  for (let first = 0; first < page.words.length; first += 1) {
    let length = 0;
    for (let last = first; last < page.words.length; last += 1) {
      length += page.words[last].values.length;
      if (length > 23) break;
      if (length !== 23) continue;

      const start = page.words[first].start;
      const end = page.words[last].end;
      if (end - start + 1 !== 23) continue;

      const stream = page.words
        .slice(first, last + 1)
        .flatMap((word) => shellWord(word.values));

      spans.push({
        page: physicalPage(segment),
        start,
        end,
        centerF: page.runes[start + 11] === 0,
        stream,
        endpoints: [stream[0], stream[1], stream[stream.length - 1]],
      });
    }
  }
}

assert.equal(spans.length, 614);

const oneBasedSwaps = spans.filter((span) =>
  span.stream[dh.A - 1] === dh.K &&
  span.stream[dh.K - 1] === dh.A);
assert.deepEqual(
  oneBasedSwaps.map((span) => [span.page, span.start, span.end]),
  [[0, 166, 188]]
);

const zeroBasedSwaps = spans.filter((span) =>
  span.stream[dh.A] === dh.K &&
  span.stream[dh.K] === dh.A);
assert.equal(zeroBasedSwaps.length, 3);

const matched = spans.filter((span) => span.centerF);
assert.equal(matched.length, 23);
assert.equal(zeroBasedSwaps.filter((span) => span.centerF).length, 0);

const fullyDhEndpoints = matched.filter((span) =>
  span.endpoints.every((value) => dhSet.has(value)));
assert.deepEqual(
  fullyDhEndpoints.map((span) => ({
    page: span.page,
    start: span.start,
    end: span.end,
    labels: span.endpoints.map((value) => labels.get(value)),
  })),
  [
    { page: 0, start: 80, end: 102, labels: ["B", "p", "K"] },
    { page: 0, start: 166, end: 188, labels: ["b", "A", "B"] },
  ]
);

const samePagePairs = [];
for (const left of matched) {
  for (const right of matched) {
    if (left === right || left.page !== right.page) continue;
    samePagePairs.push([left, right]);
  }
}
assert.equal(samePagePairs.length, 10);

const joins = samePagePairs.filter(([left, right]) =>
  left.endpoints[2] === right.endpoints[0]);
assert.equal(joins.length, 1);

const [whole, split] = joins[0];
assert.deepEqual([whole.page, whole.start, whole.end], [0, 166, 188]);
assert.deepEqual([split.page, split.start, split.end], [0, 80, 102]);
assert.deepEqual(whole.endpoints, [dh.b, dh.A, dh.B]);
assert.deepEqual(split.endpoints, [dh.B, dh.p, dh.K]);

assert.equal(modPow(dh.A, dh.b, dh.p), dh.K);
assert.equal(modPow(dh.g, dh.b, dh.p), dh.B);
assert.equal(modPow(dh.g, dh.a, dh.p), dh.A);
assert.equal(modPow(dh.B, dh.a, dh.p), dh.K);

// Previously committed split-packet self-index and exact local THE inverse.
assert.equal(split.stream[dh.A - 1], dh.a);
assert.equal(split.stream[dh.K - 1], dh.p);
const cipherThe = [8, 12];
const recoveredThe = [
  mod29(cipherThe[0] - split.stream[dh.A - 1]),
  mod29(cipherThe[1] - split.stream[dh.K - 1]),
];
assert.deepEqual(recoveredThe, [2, 18]);

console.log(JSON.stringify({
  status: "PASS",
  allWordBounded23: spans.length,
  matchedCenterF23: matched.length,
  oneBasedAKSelfSwap: {
    count: oneBasedSwaps.length,
    receiver: [0, 166, 188],
    output: [whole.stream[dh.A - 1], whole.stream[dh.K - 1]],
    labels: ["K", "A"],
  },
  zeroBasedAKSelfSwap: {
    broadCount: zeroBasedSwaps.length,
    matchedCenterFCount: zeroBasedSwaps.filter((span) => span.centerF).length,
  },
  fullyDhEndpointReceivers: fullyDhEndpoints.map((span) => ({
    page: span.page,
    start: span.start,
    end: span.end,
    values: span.endpoints,
    labels: span.endpoints.map((value) => labels.get(value)),
  })),
  samePageOrderedMatchedPairs: samePagePairs.length,
  boundaryJoin: {
    count: joins.length,
    whole: whole.endpoints,
    split: split.endpoints,
    labels: ["b", "A", "B", "B", "p", "K"],
  },
  dhChecks: {
    A_pow_b_mod_p: modPow(dh.A, dh.b, dh.p),
    g_pow_b_mod_p: modPow(dh.g, dh.b, dh.p),
    g_pow_a_mod_p: modPow(dh.g, dh.a, dh.p),
    B_pow_a_mod_p: modPow(dh.B, dh.a, dh.p),
  },
  splitSelector: {
    selectorOneBased: [dh.A, dh.K],
    key: [split.stream[dh.A - 1], split.stream[dh.K - 1]],
    recoveredThe,
  },
}, null, 2));
