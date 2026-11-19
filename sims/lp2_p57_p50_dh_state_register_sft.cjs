"use strict";

/**
 * Solved p57 PARABLE -> p50 native-base60/base29 DH state register.
 *
 * The fixed operation is:
 *   canonical GP0(word) -> p50 address -> native base60 value ->
 *   Euclidean pair [floor(value/29), value mod 29].
 *
 * The six-word tail FIND THE DIVINITY WITHIN AND EMERGE reconstructs the
 * already independent DH state directly, while the first sentence and middle
 * instruction expose exact p50 graph handoffs into p32 and the base60 zero
 * cycle. No unknown ciphertext value is used to choose any state field.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number} base @param {number} exponent @param {number} modulus @returns {number} */
function modPow(base, exponent, modulus) {
  let output = 1;
  let factor = base % modulus;
  let remaining = exponent;
  while (remaining > 0) {
    if (remaining & 1) output = output * factor % modulus;
    factor = factor * factor % modulus;
    remaining >>= 1;
  }
  return output;
}

/** @param {number} value @param {number} modulus @returns {number} */
function inverse(value, modulus) {
  for (let candidate = 1; candidate < modulus; candidate += 1) {
    if (value * candidate % modulus === 1) return candidate;
  }
  throw new Error("inverse not found");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const solved = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");

const tokens = grid.pages.flatMap((page) => page.tokens);
const alphabet60 = grid.alphabet;
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));

assert.equal(tokens.length, 256);
assert.equal(alphabet60.length, 60);

/** @param {string} token @returns {number} */
function decode60(token) {
  const high = alphabet60.indexOf(token[0]);
  const low = alphabet60.indexOf(token[1]);
  assert.ok(high >= 0 && low >= 0);
  return high * 60 + low;
}

/** @param {number} value @returns {number[]} */
function pair29(value) {
  return [Math.floor(value / 29), value % 29];
}

/** @param {string} text @returns {number[][]} */
function parseRuneWords(text) {
  const output = [];
  let current = [];
  for (const character of [...text]) {
    const value = runeIndex.get(character);
    if (value !== undefined) {
      current.push(value);
    } else if (current.length && "•⁘⁜⁚ \n".includes(character)) {
      output.push(current);
      current = [];
    }
  }
  if (current.length) output.push(current);
  return output;
}

/** @param {number[]} word @returns {number} */
function gp0(word) {
  return word.reduce((sum, value) => sum + value, 0);
}

/** @param {number[]} word @returns {string} */
function translit(word) {
  return word.map((value) => corpus.translit[value]).join("");
}

const p57 = solved.sections.find((section) => section.name === "p57_parable");
assert.ok(p57);
const p57Words = parseRuneWords(p57.source_text);
assert.equal(p57Words.length, 20);

const rows = p57Words.map((word, index) => {
  const address = gp0(word);
  assert.ok(address < tokens.length);
  const token = tokens[address];
  const value60 = decode60(token);
  return {
    position: index + 1,
    word: translit(word),
    address,
    token,
    value60,
    pair: pair29(value60),
  };
});

/** @param {string} word @returns {{position:number,word:string,address:number,token:string,value60:number,pair:number[]}} */
function row(word) {
  const found = rows.find((candidate) => candidate.word === word);
  assert.ok(found, "missing p57 word " + word);
  return found;
}

assert.deepEqual(
  rows.map((entry) => [entry.word, entry.address, entry.token, entry.value60, entry.pair]),
  [
    ["PARABLE",120,"0g",42,[1,13]],
    ["LICE",53,"2p",171,[5,26]],
    ["THE",20,"1g",102,[3,15]],
    ["INSTAR",78,"0k",46,[1,17]],
    ["TUNNELNG",94,"0u",56,[1,27]],
    ["TO",19,"0X",33,[1,4]],
    ["THE",20,"1g",102,[3,15]],
    ["SURFACE",67,"3C",192,[6,18]],
    ["WE",25,"3I",198,[6,24]],
    ["MUST",51,"0x",59,[2,1]],
    ["SHED",64,"22",122,[4,6]],
    ["OUR",8,"1W",92,[3,5]],
    ["OWN",19,"0X",33,[1,4]],
    ["CIRCUMFERENCES",131,"20",120,[4,4]],
    ["FIND",42,"0S",28,[0,28]],
    ["THE",20,"1g",102,[3,15]],
    ["DIUINITY",105,"13",63,[2,5]],
    ["WITHIN",38,"2D",133,[4,17]],
    ["AND",56,"4E",254,[8,22]],
    ["EMERGE",83,"3D",193,[6,19]],
  ]
);

// The last six words are a direct state register.
const tail = rows.slice(14);
assert.deepEqual(tail.map((entry) => entry.word),
  ["FIND","THE","DIUINITY","WITHIN","AND","EMERGE"]);
assert.deepEqual(tail.map((entry) => entry.pair), [
  [0,28],
  [3,15],
  [2,5],
  [4,17],
  [8,22],
  [6,19],
]);

const e = tail[1].pair[0];
const b = tail[1].pair[1];
const K = tail[2].pair[0];
const g = tail[2].pair[1];
const q = tail[3].pair[0];
const A = tail[4].pair[0];
const p = tail[4].pair[1] + 1;
const a = tail[5].pair[0];
const B = tail[5].pair[1];

assert.deepEqual({ p,g,a,b,A,B,K,e,q },
  { p:23,g:5,a:6,b:15,A:8,B:19,K:2,e:3,q:4 });

// Two tail words are redundant held-out state checks.
assert.deepEqual(tail[0].pair, [0, 29 - 1]);
assert.deepEqual(tail[3].pair, [q, b + K]);

// Full DH consistency.
assert.equal(modPow(g, a, p), A);
assert.equal(modPow(g, b, p), B);
assert.equal(modPow(B, a, p), K);
assert.equal(modPow(A, b, p), K);
assert.equal(inverse(b, p - 1), e);
assert.equal(p - B, q);
assert.equal(B - b, q);
assert.equal(a - K, q);
assert.equal(g - 1, q);

// Every body coordinate is one of the same compact state vocabulary.
const vocabulary = new Set([
  0,1,K,e,q,g,a,g+K,A,K*g,b,b+K,p-g,B,p-1,p,p+1,p+K,
  mod29(-e),mod29(-K),mod29(-1),
]);
assert.ok(rows.slice(1).every((entry) =>
  entry.pair.every((value) => vocabulary.has(value))));

// Native-base60 functional graph.
const next = Array.from({ length: 256 }, (_, address) => decode60(tokens[address]));

/** @param {number} start @param {number} steps @returns {number[]} */
function walk(start, steps) {
  const output = [start];
  let state = start;
  for (let index = 0; index < steps; index += 1) {
    state = next[state];
    output.push(state);
  }
  return output;
}

// Source semantics expose exact K=2 graph links.
assert.deepEqual(walk(row("CIRCUMFERENCES").address, K), [131,120,42]);
assert.equal(walk(row("CIRCUMFERENCES").address, K).at(-1), row("FIND").address);

assert.deepEqual(walk(row("WE").address, K), [25,198,105]);
assert.equal(walk(row("WE").address, K).at(-1), row("DIUINITY").address);

assert.deepEqual(walk(row("DIUINITY").address, K), [105,63,51]);
assert.equal(walk(row("DIUINITY").address, K).at(-1), row("MUST").address);

assert.deepEqual(walk(row("SURFACE").address, K), [67,192,0]);
assert.deepEqual(walk(row("WITHIN").address, K), [38,133,141]);

// THE takes the independently frozen K=2 route through DEVOTED=102 to p32.
assert.deepEqual(walk(row("THE").address, K), [20,102,32]);

// SURFACE lands at the final nonzero node of the established zero cycle and
// K=2 brings it to zero. From zero the same p50 map begins the authored cycle.
const zeroCycle = [0,203,68,199,47,76,114,197,115,247,192,0];
const observedCycle = [0];
let cycleState = 0;
for (let index = 0; index < 11; index += 1) {
  cycleState = next[cycleState];
  observedCycle.push(cycleState);
}
assert.deepEqual(observedCycle, zeroCycle);

const zeroCyclePairs = zeroCycle.slice(0,-1).map((state) => pair29(next[state]));
assert.deepEqual(zeroCyclePairs, [
  [7,0],
  [2,10],
  [6,25],
  [1,18],
  [2,18],
  [3,27],
  [6,23],
  [3,28],
  [8,15],
  [6,18],
  [0,0],
]);

// Express every zero-cycle coordinate in the same DH state vocabulary.
assert.ok(zeroCyclePairs.flat().every((value) => vocabulary.has(value)));
assert.deepEqual(zeroCyclePairs, [
  [g+K,0],
  [K,K*g],
  [a,p+K],
  [1,p-g],
  [K,p-g],
  [e,mod29(-K)],
  [a,p],
  [e,mod29(-1)],
  [A,b],
  [a,p-g],
  [0,0],
]);

// p57 EMERGE=83 is also the already frozen first inner bracket boundary.
assert.equal(row("EMERGE").address, 83);
assert.equal(row("EMERGE").token, "3D");
assert.equal(tokens[127], "3D");
assert.equal(row("DIUINITY").address, 105);
assert.equal(tokens[105], "13");

// WITHIN's K-hop endpoint is an exact p0 word start, and that word has the
// four-rune capacity required by the independently source-selected WILL target.
const p0Source = transcription.split(/^\s*%\s*$/m)[0];
const p0Words = [];
let current = [];
let start = 0;
let runeOffset = 0;
function flushP0() {
  if (!current.length) return;
  p0Words.push({
    start,
    end: start + current.length - 1,
    values: current.slice(),
  });
  current = [];
}
for (const character of [...p0Source]) {
  const value = runeIndex.get(character);
  if (value !== undefined) {
    if (!current.length) start = runeOffset;
    current.push(value);
    runeOffset += 1;
  } else if (character === "-" || character === ".") {
    flushP0();
  }
}
flushP0();

const withinEndpoint = walk(row("WITHIN").address, K).at(-1);
assert.equal(withinEndpoint, 141);
const receiver = p0Words.find((word) => word.start === withinEndpoint);
assert.ok(receiver);
assert.equal(receiver.values.length, 4);
assert.deepEqual(receiver.values, [19,16,9,18]);

console.log(JSON.stringify({
  status: "PASS",
  classification:
    "solved p57 body is a native-p50/base29 DH state register with source-semantic graph links",
  state: { p,g,a,b,A,B,K,e,q },
  tail: tail.map((entry) => ({
    word: entry.word,
    address: entry.address,
    token: entry.token,
    value60: entry.value60,
    pair: entry.pair,
  })),
  graphLinks: {
    circumferencesToFind: walk(row("CIRCUMFERENCES").address, K),
    weToDivinity: walk(row("WE").address, K),
    divinityToMust: walk(row("DIUINITY").address, K),
    surfaceToZero: walk(row("SURFACE").address, K),
    withinToP0Receiver: walk(row("WITHIN").address, K),
    theToP32: walk(row("THE").address, K),
  },
  zeroCycle: {
    states: zeroCycle,
    pairs: zeroCyclePairs,
  },
  p0Receiver: {
    selectedBy: "WITHIN under K=2 native-base60 hops",
    start: receiver.start,
    end: receiver.end,
    values: receiver.values,
  },
}, null, 2));
