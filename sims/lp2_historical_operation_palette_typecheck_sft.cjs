"use strict";

// Bounded type-check of historical Cicada operations against the fixed p0
// 23-rune block, the p0 DH23 tuple, and the p50 256-token table.
// No parameter search, new cipher family, padding, or invented KDF is used.

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const parts = read("resources/liber-primus/lp2-transcription.txt")
  .split(/^\s*%\s*$/m);

const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const mod29 = (x) => ((x % 29) + 29) % 29;
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((a, b) => b.symbol.length - a.symbol.length);

function gp(word) {
  const normalized = word.toUpperCase()
    .replace(/K/g, "C").replace(/V/g, "U")
    .replace(/Q/g, "C").replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");
  const out = [];
  for (let i = 0; i < normalized.length;) {
    const hit = gpTokens.find((x) => normalized.startsWith(x.symbol, i));
    assert.ok(hit, "unmapped GP text " + normalized.slice(i));
    out.push(hit.value);
    i += hit.symbol.length;
  }
  return out;
}

function parseP0() {
  const runes = [];
  const words = [];
  let current = [];
  let start = 0;
  const flush = () => {
    if (!current.length) return;
    words.push({
      n: words.length + 1,
      start,
      end: start + current.length - 1,
      values: current.slice(),
      length: current.length,
    });
    current = [];
  };
  for (const ch of [...parts[0]]) {
    const value = runeIndex.get(ch);
    if (value !== undefined) {
      if (!current.length) start = runes.length;
      current.push(value);
      runes.push(value);
    } else if (ch === "-" || ch === ".") {
      flush();
    }
  }
  flush();
  return { runes, words };
}

const p0 = parseP0();
const receiverWords = p0.words.filter((w) => w.start >= 80 && w.end <= 102);
assert.deepEqual(receiverWords.map((w) => [w.n, w.start, w.end, w.length]), [
  [18, 80, 82, 3],
  [19, 83, 89, 7],
  [20, 90, 94, 5],
  [21, 95, 102, 8],
]);
const block = p0.runes.slice(80, 103);
assert.equal(block.length, 23);
assert.deepEqual(block, [
  21,25,2, 10,25,8,14,2,13,6, 26,0,21,5,11, 2,24,19,10,21,10,27,26,
]);
assert.deepEqual(
  block.map((value, index) => value === 0 ? index : -1).filter((index) => index >= 0),
  [11],
);

function firstPrimes(n) {
  const out = [];
  for (let x = 2; out.length < n; x += 1) {
    let prime = true;
    for (let d = 2; d * d <= x; d += 1) {
      if (x % d === 0) { prime = false; break; }
    }
    if (prime) out.push(x);
  }
  return out;
}

const primes = firstPrimes(23);
function primeTotientInverse(skipPositions) {
  let cursor = 0;
  return block.map((cipher, position) => {
    if (skipPositions.has(position)) return 0; // transparent plaintext F
    const key = primes[cursor] - 1; // phi(prime)
    cursor += 1;
    return mod29(cipher - key);
  });
}

const primeNoSkip = primeTotientInverse(new Set());
const primeSkipCipherF = primeTotientInverse(new Set([11]));
assert.deepEqual(primeNoSkip, [
  20,23,27,4,15,25,27,13,20,7,25,22,10,21,23,8,24,17,2,9,25,7,2,
]);
assert.deepEqual(primeSkipCipherF, [
  20,23,27,4,15,25,27,13,20,7,25,0,22,9,16,7,14,8,23,9,17,2,23,
]);

// Exact 2014 Stage04 Vigenere-like operation and its archived key phrase.
// RUNE_LOOKUP order is the source script's native order; its reverse is the
// traversal alphabet used by the original implementation.
const RUNE_LOOKUP = [
  ["ᛠ",["F"]],["ᛡ",["U"]],["ᚣ",["TH"]],["ᚫ",["O"]],["ᚪ",["R"]],
  ["ᛞ",["C","K"]],["ᛟ",["G"]],["ᛝ",["W"]],["ᛚ",["H"]],["ᛗ",["N"]],
  ["ᛖ",["I"]],["ᛒ",["J"]],["ᛏ",["EO"]],["ᛋ",["P"]],["ᛉ",["X"]],
  ["ᛈ",["S","Z"]],["ᛇ",["T"]],["ᛄ",["B"]],["ᛁ",["E"]],["ᚾ",["M"]],
  ["ᚻ",["L"]],["ᚹ",["NG","ING"]],["ᚷ",["OE"]],["ᚳ",["D"]],["ᚱ",["A"]],
  ["ᚩ",["AE"]],["ᚦ",["Y"]],["ᚢ",["IO","IA"]],["ᚠ",["EA"]],
];
const runeKeys = RUNE_LOOKUP.map((row) => row[0]).reverse();
const runeValues = RUNE_LOOKUP.map((row) => row[1]);
const lookup = new Map(runeKeys.map((r, i) => [r, runeValues[i]]));
const keyValues = [...lookup.values()].reverse();
const keyPhrase = "WELCOMEPILGRIMTOTHE";
const stage04Shifts = [];
for (let i = 0; i < keyPhrase.length;) {
  const pair = keyPhrase.slice(i, i + 2);
  let index = keyValues.findIndex((values) => values.includes(pair));
  if (index !== -1) {
    stage04Shifts.push(index + 1);
    i += 2;
    continue;
  }
  index = keyValues.findIndex((values) => values.includes(keyPhrase[i]));
  assert.notEqual(index, -1);
  stage04Shifts.push(index + 1);
  i += 1;
}
assert.equal(stage04Shifts.length, 18);

const p0Runes = [...parts[0]].filter((ch) => runeIndex.has(ch)).slice(80, 103);
const stage04OutputRunes = p0Runes.map((rune, i) => {
  const index = runeKeys.indexOf(rune);
  assert.notEqual(index, -1);
  return runeKeys[(index + stage04Shifts[i % stage04Shifts.length]) % 29];
});
const stage04Output = stage04OutputRunes.map((rune) => runeIndex.get(rune));
assert.deepEqual(stage04Output, [
  14,7,11,5,22,18,25,18,3,15,20,25,11,15,24,28,22,1,3,3,19,22,23,
]);

function segment(values) {
  const lengths = receiverWords.map((w) => w.length);
  let cursor = 0;
  return lengths.map((length) => {
    const part = values.slice(cursor, cursor + length);
    cursor += length;
    return part.map((v) => corpus.translit[v]).join("·");
  });
}
const signedWords = [
  "HELLO","THE","PATH","LIES","EMPTY","EPIPHANY","SEEKS","DEVOTED",
  "LIBER","PRIMUS","IS","WAY","ITS","WORDS","ARE","MAP","THEIR",
  "MEANING","ROAD","AND","NUMBERS","DIRECTION","SEEK","YOU","WILL",
  "BE","FOUND","GOOD","LUCK","BEWARE","FALSE","PATHS","VERIFY","OPENPGP",
];
const signedWordSet = new Set(signedWords.map((w) => gp(w).join(",")));
function exactSourceWordSegments(values) {
  const lengths = receiverWords.map((w) => w.length);
  let cursor = 0;
  return lengths.map((length) => {
    const part = values.slice(cursor, cursor + length);
    cursor += length;
    return signedWordSet.has(part.join(","));
  });
}
assert.deepEqual(exactSourceWordSegments(primeNoSkip), [false,false,false,false]);
assert.deepEqual(exactSourceWordSegments(primeSkipCipherF), [false,false,false,false]);
assert.deepEqual(exactSourceWordSegments(stage04Output), [false,false,false,false]);

// Exact 2013 signed-protocol arithmetic: DH consumes the tuple and returns a
// scalar shared key; it does not serialize that scalar into a GP29 keystream.
function powMod(base, exponent, modulus) {
  let result = 1;
  let value = base % modulus;
  let power = exponent;
  while (power > 0) {
    if (power % 2) result = (result * value) % modulus;
    value = (value * value) % modulus;
    power = Math.floor(power / 2);
  }
  return result;
}
const dh = {
  p: 23, g: 5, a: 6, b: 15,
  A: powMod(5, 6, 23),
  B: powMod(5, 15, 23),
};
dh.Ka = powMod(dh.B, dh.a, dh.p);
dh.Kb = powMod(dh.A, dh.b, dh.p);
assert.deepEqual(dh, { p:23,g:5,a:6,b:15,A:8,B:19,Ka:2,Kb:2 });

// The 2013 BASE29 command uses its own alphanumeric digit alphabet.
const base29Alphabet = "0123456789ABCDEFGHIJKLMNOPQRS";
function base29(value) {
  if (value === 0) return "0";
  let n = value;
  let out = "";
  while (n > 0) {
    out = base29Alphabet[n % 29] + out;
    n = Math.floor(n / 29);
  }
  return out;
}
assert.equal(base29(3301), "3QO");
assert.equal(base29(1033), "16I");
assert.notEqual(base29Alphabet, corpus.translit.join(""));

// p50 is a 256-cell array of two-character base60 tokens. Its base60 decode
// matches the repository's derived byte field; base59 gives a different value.
const tokens = grid.pages.flatMap((page) => page.tokens);
const bytes = grid.pages.flatMap((page) => page.bytes);
assert.equal(tokens.length, 256);
assert.equal(bytes.length, 256);
const alphabet60 = grid.alphabet;
const alphabet59 = grid.alphabet.replace("f", "");
const decode60 = (token) =>
  alphabet60.indexOf(token[0]) * 60 + alphabet60.indexOf(token[1]);
const decode59 = (token) =>
  alphabet59.indexOf(token[0]) * 59 + alphabet59.indexOf(token[1]);
const decoded60 = tokens.map(decode60);
assert.ok(decoded60.every((value, i) => value === bytes[i]));
assert.equal(new Set(bytes).size, 161);
assert.equal(bytes[56], 254);
assert.equal(tokens[56], "4E");
assert.equal(decode59(tokens[56]), 250);

// Stage05 is a seven-column permutation; a 23-rune receiver has no complete
// seven-rune framing and the source gives no padding convention.
assert.equal(block.length % 7, 2);

console.log(JSON.stringify({
  status: "PASS",
  fixedP0Block: {
    offsets: [80,102],
    words: receiverWords.map((w) => w.n),
    lengths: receiverWords.map((w) => w.length),
    gp29: block,
  },
  p56PrimeTotientTransfer: {
    operation: "P_i = C_i - (prime_j - 1) mod29",
    primePrefix: primes,
    noLiteralFBypass: primeNoSkip,
    literalFBypassAtOnlyCipherFPosition11: primeSkipCipherF,
    bothPreserveOriginalWordBoundariesButMatchNoSigned2016Word: true,
  },
  stage04Transfer: {
    keyPhrase: "WELCOME PILGRIM TO THE",
    keyLengthInGP29: stage04Shifts.length,
    shifts: stage04Shifts,
    output: stage04Output,
    outputWords: segment(stage04Output),
    matchesNoSigned2016Word: true,
  },
  stage05TypeCheck: {
    blockLength: block.length,
    sevenColumnRemainder: block.length % 7,
    paddingRuleInSource: false,
  },
  cicada2013Protocol: {
    dh,
    base29Examples: { "3301": base29(3301), "1033": base29(1033) },
    base29Alphabet: base29Alphabet,
    hasDeterministicDHToGP29Kdf: false,
    nextCommand: "client-supplied text storage, not a transform",
    randCommand: "nondeterministic bytes, not a reproducible key schedule",
  },
  p50: {
    tokens: tokens.length,
    bytes: bytes.length,
    uniqueBytes: new Set(bytes).size,
    cell56: tokens[56],
    base60Value: decode60(tokens[56]),
    base59Value: decode59(tokens[56]),
  },
  decision: {
    historicalOperationsBridgeDHToGP29: false,
    historicalOperationsDecodeP50TokensToGP29: false,
    manuscriptInternalTHECandidatesRemainConditional: true,
    missingBridge: "source-selected deterministic DH-state/p50-to-GP29 serialization and state update",
  },
}, null, 2));
