"use strict";

/**
 * SFT: canonical p27 DIVINITY serializer control.
 *
 * Frozen serializer:
 *   p50Token[indexSum(8-rune window)] ||
 *   BASE29digit(window[serverSecret-1])
 *
 * The independently recovered serverSecret is 6.
 * Search all canonical contiguous 8-rune windows in complete p0-p55 words.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const primeEcho = read("resources/historical/cicada2013-os-original-prime-echo.sh");

const alphabet = new Map(corpus.runes.map((rune, index) => [rune, index]));
const rawPages = transcription.split("%");
const source = rawPages.slice(0, 55).join("%");
const words = [];
let current = [];

function flush() {
  if (!current.length) return;
  words.push(current);
  current = [];
}

for (const ch of source) {
  if (alphabet.has(ch)) {
    current.push(alphabet.get(ch));
  } else if (ch === "%" || ch === "/" || /\s/u.test(ch)) {
    // Preserve canonical carried words across page/line/whitespace wrapping.
  } else {
    flush();
  }
}
flush();

assert.equal(words.length, 2896);

const p50Tokens = grid.pages.flatMap(page => page.tokens);
assert.equal(p50Tokens.length, 256);

const base29 = "0123456789ABCDEFGHIJKLMNOPQRS";
const serverSecret = 6;

/** @param {number[]} window */
function serialize(window) {
  assert.equal(window.length, 8);
  const address = window.reduce((sum, value) => sum + value, 0);
  if (address >= p50Tokens.length) return null;
  return p50Tokens[address] + base29[window[serverSecret - 1]];
}

/** @param {number[]} inds */
function translit(inds) {
  return inds.map(index => corpus.translit[index]).join("");
}

const targets = new Map([
  ["3QO", []],
  ["16I", []],
]);

let windows = 0;
for (let wordIndex = 0; wordIndex < words.length; wordIndex += 1) {
  const word = words[wordIndex];
  for (let start = 0; start + 8 <= word.length; start += 1) {
    const window = word.slice(start, start + 8);
    windows += 1;
    const encoded = serialize(window);
    if (!targets.has(encoded)) continue;
    const address = window.reduce((sum, value) => sum + value, 0);
    targets.get(encoded).push({
      wordIndex,
      start,
      translit: translit(window),
      address,
      token: p50Tokens[address],
      sixthIndex: window[serverSecret - 1],
    });
  }
}

assert.equal(windows, 731);
assert.deepEqual(targets.get("3QO"), [{
  wordIndex: 1476,
  start: 2,
  translit: "NSOOCAEY",
  address: 103,
  token: "3Q",
  sixthIndex: 24,
}]);
assert.deepEqual(targets.get("16I"), []);

/** @param {string} encoded */
function decodeBase29(encoded) {
  let value = 0;
  for (const ch of encoded) {
    const digit = base29.indexOf(ch);
    assert.ok(digit >= 0);
    value = value * 29 + digit;
  }
  return value;
}

assert.equal(decodeBase29("3QO"), 3301);
assert.equal(decodeBase29("16I"), 1033);

// Verify only the historical terminal/pause semantics needed by this report.
const emitted = [...primeEcho.matchAll(/echo(?:\s+-n)?\s+\"(\d+)\\t\";\s+sleep\s+([.\d]+)/g)]
  .map(match => ({prime: Number(match[1]), delay: Number(match[2])}));

assert.equal(emitted.length, 464);
assert.equal(emitted[0].prime, 2);
assert.equal(emitted.at(-1).prime, 3301);
assert.deepEqual(
  emitted.filter(item => item.delay === 2).map(item => item.prime),
  [1033, 3301]
);
assert.equal(emitted.findIndex(item => item.prime === 1033) + 1, 174);
assert.equal(emitted.findIndex(item => item.prime === 3301) + 1, 464);

console.log(JSON.stringify({
  status: "PASS: p27 serializer selects terminal 3301 and rejects 1033 control",
  canonical: {
    words: words.length,
    eightRuneWindows: windows,
  },
  serializer: {
    serverSecret,
    base29_3301: "3QO",
    base29_1033: "16I",
    hits3301: targets.get("3QO"),
    hits1033: targets.get("16I"),
  },
  primeEcho: {
    count: emitted.length,
    first: emitted[0].prime,
    terminal: emitted.at(-1).prime,
    exceptionalPauses: emitted.filter(item => item.delay === 2),
  },
}, null, 2));
