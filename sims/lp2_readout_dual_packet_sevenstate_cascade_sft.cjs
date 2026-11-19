"use strict";

/**
 * Dual READOUT packet seven-state cascade.
 *
 * Starting from the fixed DH coordinate (A,K), the split packet emits (a,p),
 * the independently selected whole packet indexed by (a,p) emits (b,B), and
 * the same H map supplies the single missing state g. The recovered (p,g)
 * returns to the established zero-based p50 DH root address189.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const grid = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-grid-256.json"), "utf8"));
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

const dh = { p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2 };
const dhValues = Object.values(dh).sort((a, b) => a - b);
const dhSet = new Set(dhValues);

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
      });
    }
  }
}

assert.equal(spans.length, 614);

function sameSet(values, expected) {
  if (values.length !== expected.length) return false;
  const a = values.slice().sort((x, y) => x - y);
  const b = expected.slice().sort((x, y) => x - y);
  return a.every((value, index) => value === b[index]);
}

function evaluateCascade(first, second) {
  const step1 = [
    first.stream[dh.A - 1],
    first.stream[dh.K - 1],
  ];
  if (!step1.every((value) => dhSet.has(value))) return null;

  const step2 = [
    second.stream[step1[0] - 1],
    second.stream[step1[1] - 1],
  ];
  if (!step2.every((value) => dhSet.has(value))) return null;

  const seen = [...new Set([dh.A, dh.K, ...step1, ...step2])];
  const missing = dhValues.filter((value) => !seen.includes(value));
  if (missing.length !== 1) return null;

  const h = [
    mod29(step2[0] - step2[1]),
    mod29(step2[0] + step2[1]),
  ];
  const closing = h.filter((value) => missing.includes(value));
  if (closing.length !== 1) return null;

  const complete = [...new Set([...seen, closing[0]])];
  if (!sameSet(complete, dhValues)) return null;

  return { step1, step2, h, missing, closing };
}

function scanPairs(family) {
  const hits = [];
  for (const first of family) {
    for (const second of family) {
      if (first === second) continue;
      const result = evaluateCascade(first, second);
      if (!result) continue;
      hits.push({
        first: [first.page, first.start, first.end],
        second: [second.page, second.start, second.end],
        ...result,
      });
    }
  }
  return hits;
}

const matched = spans.filter((span) => span.centerF);
assert.equal(matched.length, 23);

const matchedHits = scanPairs(matched);
assert.equal(matchedHits.length, 1);
assert.deepEqual(matchedHits[0].first, [0, 80, 102]);
assert.deepEqual(matchedHits[0].second, [0, 166, 188]);
assert.deepEqual(matchedHits[0].step1, [dh.a, dh.p]);
assert.deepEqual(matchedHits[0].step2, [dh.b, dh.B]);
assert.deepEqual(matchedHits[0].h, [25, dh.g]);
assert.deepEqual(matchedHits[0].missing, [dh.g]);
assert.deepEqual(matchedHits[0].closing, [dh.g]);

const broadHits = scanPairs(spans);
assert.equal(broadHits.length, 11);

const rootAddress = dh.p * 8 + dh.g;
assert.equal(rootAddress, 189);

const tokens = grid.pages.flatMap((page) => page.tokens);
assert.equal(tokens.length, 256);
assert.equal(tokens[rootAddress], "3C");

const alphabet59 = grid.alphabet.replace("f", "");
function decode(token, alphabet) {
  let value = 0;
  for (const char of token) {
    const digit = alphabet.indexOf(char);
    assert.notEqual(digit, -1);
    value = value * alphabet.length + digit;
  }
  return value;
}

assert.equal(decode(tokens[rootAddress], alphabet59), rootAddress);

console.log(JSON.stringify({
  status: "PASS",
  spanCount: spans.length,
  matchedCenterFCount: matched.length,
  matchedOrderedPairs: matched.length * (matched.length - 1),
  matchedCascadeHits: matchedHits,
  broadOrderedPairs: spans.length * (spans.length - 1),
  broadCascadeHitCount: broadHits.length,
  externalRoot: {
    p: dh.p,
    g: dh.g,
    zeroBasedAddress: rootAddress,
    token: tokens[rootAddress],
    base59Value: decode(tokens[rootAddress], alphabet59),
    selfPointer: true,
  },
}, null, 2));
