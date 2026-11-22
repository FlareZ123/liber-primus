"use strict";

/**
 * SFT for the precommitted PATHS -> p50[54]=2a -> p0 word35 receiver.
 *
 * Run:
 *   node sims/lp2_paths_2a_receiver_gate_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);
const tableTokens = grid.pages.flatMap((page) => page.tokens);
const alphabet59 = grid.alphabet.replace("f", "");

function mod29(value) {
  return ((value % 29) + 29) % 29;
}

function H(left, right) {
  return [mod29(left - right), mod29(left + right)];
}

function hInverse(pair) {
  const inverseTwo = 15;
  return [
    mod29((pair[0] + pair[1]) * inverseTwo),
    mod29((pair[1] - pair[0]) * inverseTwo),
  ];
}

function shellInverse(shell) {
  const outer = hInverse(shell.slice(0, 2));
  const inner = hInverse(shell.slice(2, 4));
  return [outer[0], inner[0], inner[1], outer[1]];
}

function gp(word) {
  const normalized = word
    .toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");

  const values = [];
  for (let offset = 0; offset < normalized.length;) {
    if (normalized.startsWith("ING", offset)) {
      values.push(21);
      offset += 3;
      continue;
    }
    if (normalized.startsWith("IO", offset)) {
      values.push(27);
      offset += 2;
      continue;
    }
    const token = gpTokens.find((candidate) =>
      normalized.startsWith(candidate.symbol, offset)
    );
    assert.ok(token, "unmapped GP spelling at " + normalized.slice(offset));
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}

function decodeBase59(token) {
  const high = alphabet59.indexOf(token[0]);
  const low = alphabet59.indexOf(token[1]);
  assert.ok(high >= 0 && low >= 0);
  return high * 59 + low;
}

function parsePage(text) {
  const runes = [];
  const words = [];
  let current = [];
  let start = 0;

  function flush() {
    if (!current.length) return;
    words.push({
      index: words.length,
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

const paths = gp("PATHS");
assert.deepEqual(paths, [13, 24, 2, 15]);
const pathsGp0 = paths.reduce((total, value) => total + value, 0);
assert.equal(pathsGp0, 54);
assert.equal(tableTokens[54], "2a");
assert.equal(decodeBase59("2a"), 154);

const page0 = parsePage(transcription.split(/^\s*%\s*$/m)[0]);
const receiver = page0.words[35];
assert.equal(receiver.start, 154);
assert.equal(receiver.end, 157);
assert.deepEqual(receiver.values, [26, 10, 23, 24]);

const K = 2;
const a = 6;
const hKa = H(K, a);
const hAk = H(a, K);
assert.deepEqual(hKa, [25, 8]);
assert.deepEqual(hAk, [4, 8]);

const rawKeys = [
  [K, a, K, a],
  [a, K, a, K],
  [...hKa, ...hKa],
  [...hAk, ...hAk],
  [K, hKa[0], hKa[1], a],
  [a, hAk[0], hAk[1], K],
  shellInverse([K, a, K, a]),
  shellInverse([a, K, a, K]),
];

const uniqueKeys = [...new Map(rawKeys.map((key) => [key.join(","), key])).values()];
assert.equal(uniqueKeys.length, 8);

const targets = [
  "LIES",
  "THEIR",
  "MEANING",
  "ROAD",
  "SEEK",
  "WILL",
  "GOOD",
  "LUCK",
  "PATHS",
];
const targetMap = new Map(targets.map((word) => [gp(word).join(","), word]));
const hits = [];

for (const key of uniqueKeys) {
  for (const sign of [-1, 1]) {
    const output = receiver.values.map((value, index) =>
      mod29(value + sign * key[index])
    );
    const target = targetMap.get(output.join(","));
    if (target) hits.push({ key, sign, output, target });
  }
}

assert.deepEqual(hits, []);

console.log(JSON.stringify({
  receiver: {
    word: 35,
    start: receiver.start,
    end: receiver.end,
    values: receiver.values,
    translit: receiver.values.map((value) => corpus.translit[value]).join(""),
  },
  token: "2a",
  base59: 154,
  keysTested: uniqueKeys.length,
  additiveDirections: 2,
  authenticatedTargets: targets.length,
  hits,
}, null, 2));
