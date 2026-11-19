"use strict";

/**
 * READ OUT p0 receiver -> canonical preserved-center H shell -> MAP -> NEXT.
 *
 * Frozen upstream:
 * - READ OUT selects p0 offsets 80..102 under GP0 -> p50 -> base60 p0 offsets.
 * - H(x,y)=(x-y,x+y) mod29 is the reversible p28 shell operation.
 * - DH23 state is {p=23,g=5,a=6,b=15,A=8,B=19,K=2}.
 * - e=3 is independently selected by the p27 red13 / p28 cube route.
 *
 * New rule tested here:
 * read the first e=3 distinct DH-state values encountered in the preserved-center
 * H stream and add each value's zero-based readout position modulo29.
 * The selected receiver yields MAP. A whole-manuscript census charges the six
 * elementary +/- position/origin variants. MAP is then consumed prospectively
 * by the same GP0 -> p50 -> conventional-base60 p0-offset grammar.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const parts = transcription.split(/^\s*%\s*$/m);

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((a, b) => b.symbol.length - a.symbol.length);

function mod29(value) {
  return ((value % 29) + 29) % 29;
}

function spell(values) {
  return values.map((value) => corpus.translit[value]).join("");
}

function gp(word) {
  const normalized = word
    .toUpperCase()
    .replace(/K/g, "C")
    .replace(/V/g, "U")
    .replace(/Q/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");
  const out = [];
  for (let offset = 0; offset < normalized.length;) {
    const token = gpTokens.find((candidate) => normalized.startsWith(candidate.symbol, offset));
    assert.ok(token, "unmapped GP spelling at " + normalized.slice(offset));
    out.push(token.value);
    offset += token.symbol.length;
  }
  return out;
}

function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

function physicalPart(page) {
  assert.notEqual(page, 50);
  return parts[page <= 49 ? page : page - 1];
}

function parsePage(text) {
  const runes = [];
  const words = [];
  let current = [];
  let start = 0;

  function flush() {
    if (!current.length) return;
    words.push({
      n: words.length + 1,
      start,
      end: start + current.length - 1,
      values: current.slice(),
    });
    current = [];
  }

  for (const char of [...text]) {
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

function H(left, right) {
  return [mod29(left - right), mod29(left + right)];
}

function shellWord(word) {
  const out = [];
  for (let left = 0, right = word.length - 1; left < right; left += 1, right -= 1) {
    out.push(...H(word[left], word[right]));
  }
  if (word.length % 2 === 1) out.push(word[Math.floor(word.length / 2)]);
  return out;
}

function shellWords(words) {
  return words.flatMap((word) => shellWord(word.values));
}

const dh = {
  p: 23,
  g: 5,
  a: 6,
  b: 15,
  A: 8,
  B: 19,
  K: 2,
};
const dhSet = new Set(Object.values(dh));
const e = 3;

function firstNewDh(stream, count) {
  const seen = new Set();
  const out = [];
  for (let position = 0; position < stream.length && out.length < count; position += 1) {
    const value = stream[position];
    if (dhSet.has(value) && !seen.has(value)) {
      seen.add(value);
      out.push({ position, value });
    }
  }
  return out;
}

const tableTokens = grid.pages.flatMap((page) => page.tokens);
const table60 = grid.pages.flatMap((page) => page.bytes);
assert.equal(tableTokens.length, 256);
assert.equal(table60.length, 256);

const alphabet59 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdeghijklmnopqrstuvwx";
function base59(token) {
  let value = 0;
  for (const char of token) {
    const digit = alphabet59.indexOf(char);
    assert.ok(digit >= 0, "token contains omitted base59 digit f");
    value = value * 59 + digit;
  }
  return value;
}

// Re-derive the READ/OUT receiver with the already frozen conventional-base60
// p0-offset grammar.
const readGp = gp("READ");
const outGp = gp("OUT");
assert.deepEqual(readGp, [4, 28, 23]);
assert.deepEqual(outGp, [3, 1, 16]);
assert.equal(sum(readGp), 55);
assert.equal(sum(outGp), 20);
assert.equal(table60[55], 80);
assert.equal(table60[20], 102);

const p0 = parsePage(physicalPart(0));
const start = table60[55];
const end = table60[20];
const selectedWords = p0.words.filter((word) => word.start >= start && word.end <= end);
assert.deepEqual(selectedWords.map((word) => word.n), [18, 19, 20, 21]);
assert.deepEqual(selectedWords.map((word) => word.values.length), [3, 7, 5, 8]);
assert.equal(end - start + 1, 23);

const stream = shellWords(selectedWords);
assert.deepEqual(stream, [
  19, 23, 25,
  4, 16, 12, 9, 6, 10, 14,
  15, 8, 24, 5, 21,
  5, 28, 26, 22, 9, 0, 18, 2,
]);

const firstThree = firstNewDh(stream, e);
assert.deepEqual(firstThree, [
  { position: 0, value: 19 },
  { position: 1, value: 23 },
  { position: 7, value: 6 },
]);

const decoded = firstThree.map(({ position, value }) => mod29(value + position));
assert.deepEqual(decoded, gp("MAP"));
assert.equal(spell(decoded), "MAP");

// Charge the elementary sign/origin family on every four-complete-word window.
const mapGp = gp("MAP");
const rules = {
  "value+pos0": (value, position) => mod29(value + position),
  "value-pos0": (value, position) => mod29(value - position),
  "pos0-value": (value, position) => mod29(position - value),
  "value+pos1": (value, position) => mod29(value + position + 1),
  "value-pos1": (value, position) => mod29(value - position - 1),
  "pos1-value": (value, position) => mod29(position + 1 - value),
};

const counts = Object.fromEntries(Object.keys(rules).map((name) => [name, 0]));
const hits = [];
let windows = 0;
let eligible = 0;

for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  const parsed = parsePage(physicalPart(page));
  for (let index = 0; index + 3 < parsed.words.length; index += 1) {
    windows += 1;
    const candidate = shellWords(parsed.words.slice(index, index + 4));
    const selected = firstNewDh(candidate, e);
    if (selected.length !== e) continue;
    eligible += 1;

    for (const [name, rule] of Object.entries(rules)) {
      const output = selected.map(({ position, value }) => rule(value, position));
      if (output.every((value, i) => value === mapGp[i])) {
        counts[name] += 1;
        hits.push({
          page,
          firstWord: index + 1,
          rule: name,
          selected,
        });
      }
    }
  }
}

assert.equal(windows, 2763);
assert.equal(eligible, 1929);
assert.deepEqual(counts, {
  "value+pos0": 1,
  "value-pos0": 0,
  "pos0-value": 0,
  "value+pos1": 0,
  "value-pos1": 0,
  "pos1-value": 0,
});
assert.deepEqual(hits, [{
  page: 0,
  firstWord: 18,
  rule: "value+pos0",
  selected: [
    { position: 0, value: 19 },
    { position: 1, value: 23 },
    { position: 7, value: 6 },
  ],
}]);

// Prospective holdout after MAP was obtained. Reuse exactly the same
// whole-word GP0 -> zero-based p50 cell -> conventional-base60 p0-offset grammar.
assert.equal(sum(mapGp), 56);
assert.equal(tableTokens[56], "4E");
assert.equal(table60[56], 254);
assert.equal(base59(tableTokens[56]), 250);

const mapOffset60 = table60[56];
const mapOffset59 = base59(tableTokens[56]);
const wordAt60 = p0.words.find((word) => word.start === mapOffset60);
const wordContaining59 = p0.words.find(
  (word) => word.start <= mapOffset59 && word.end >= mapOffset59
);
assert.ok(wordAt60);
assert.equal(wordAt60.n, 57);
assert.ok(wordContaining59);
assert.equal(wordContaining59.n, 56);
assert.notEqual(wordContaining59.start, mapOffset59);

// The selected one-based word number is independently authenticated GP0(NEXT).
const nextGp = gp("NEXT");
assert.equal(sum(nextGp), 57);
assert.equal(wordAt60.n, sum(nextGp));

// Existing NEXT continuation, retained only as an already-published edge.
assert.equal(tableTokens[57], "1w");
assert.equal(table60[57], 118);

console.log(JSON.stringify({
  status: "PASS",
  receiver: {
    instruction: "READ OUT",
    p0Offsets: [start, end],
    words: selectedWords.map((word) => word.n),
    preservedCenterH: stream,
  },
  dh: { ...dh, e },
  mapRecovery: {
    firstDistinctDh: firstThree,
    rule: "value + zero-based readout position mod29",
    gp: decoded,
    text: spell(decoded),
    manuscriptCensus: { windows, eligible, ruleCounts: counts, hits },
  },
  prospectiveMapConsumer: {
    gp0: sum(mapGp),
    p50Address: 56,
    token: tableTokens[56],
    conventionalBase60: {
      value: mapOffset60,
      p0WordStart: wordAt60.start,
      p0WordNumber: wordAt60.n,
      equalsGp0Next: wordAt60.n === sum(nextGp),
    },
    dropFBase59Control: {
      value: mapOffset59,
      containingP0Word: wordContaining59.n,
      isWordStart: wordContaining59.start === mapOffset59,
    },
  },
  existingNextEdge: {
    gp0Next: sum(nextGp),
    p50Address: 57,
    token: tableTokens[57],
    conventionalBase60: table60[57],
    publishedInterpretation: "one-based p28 rune118 -> DH",
  },
  classification:
    "candidate source-linked instruction recovery: MAP is uniquely produced under the charged elementary position family on the preselected READ OUT receiver; its prospective same-grammar base60 consumer lands exactly on p0 word57=GP0(NEXT).",
}, null, 2));
