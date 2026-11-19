"use strict";

/**
 * P57 shed-circumferences -> p33 -> p39 -> DIVINITY-within -> VERIFY.
 *
 * Frozen chain:
 * 1. solved p57 says SHED OUR OWN CIRCUMFERENCES and shedding all p57 body
 *    word circumferences leaves 50 runes -> p50.
 * 2. frozen DH B=19 and p50[19]=33 select p33.
 * 3. shedding p33 first black-body word circumferences leaves39 -> p39.
 * 4. p39 red title contains b=15. The already frozen p50 reverse-tree grammar
 *    at depth b has 105 cells including root = GP0(DIVINITY).
 * 5. zero-based p39 rune offset105 is exactly a g=5 word start.
 * 6. shed that selected word once; inner GP0=p-1=22; p50[22]=59.
 * 7. canonical GP0(VERIFY)=59.
 *
 * A p39-local census charges the same step on every five-rune p39 word. The
 * selected offset105 word is the only one whose result is GP0 of any signed
 * 2016 word, and the hit is VERIFY.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const solved = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const tokens = grid.pages.flatMap((page) => page.tokens);
const alphabet60 = grid.alphabet;

/** @param {string} token @returns {number} */
function decode60(token) {
  const high = alphabet60.indexOf(token[0]);
  const low = alphabet60.indexOf(token[1]);
  assert.ok(high >= 0 && low >= 0);
  return high * 60 + low;
}

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number} left @param {number} right @returns {number[]} */
function H(left, right) {
  return [mod29(left - right), mod29(left + right)];
}

/** @param {number[]} values @returns {number} */
function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

/** @param {number[]} values @returns {string} */
function translit(values) {
  return values.map((value) => corpus.translit[value]).join("");
}

/**
 * Parse physical printed words while preserving zero-based rune offsets.
 * @param {string} text
 * @returns {Array<{index:number,start:number,end:number,values:number[]}>}
 */
function parsePhysicalWords(text) {
  const words = [];
  let current = [];
  let start = 0;
  let runeOffset = 0;

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

  for (const character of [...text]) {
    const value = runeIndex.get(character);
    if (value !== undefined) {
      if (!current.length) start = runeOffset;
      current.push(value);
      runeOffset += 1;
    } else if (
      character === "-" ||
      character === "." ||
      character === "&" ||
      character === ":" ||
      character === "⁘" ||
      character === "⁜" ||
      character === "⁚" ||
      character === "•"
    ) {
      flush();
    }
  }
  flush();
  return words;
}

/** @param {string} text @returns {number[][]} */
function parseSolvedWords(text) {
  const words = [];
  let current = [];
  function flush() {
    if (!current.length) return;
    words.push(current.slice());
    current = [];
  }
  for (const character of [...text]) {
    const value = runeIndex.get(character);
    if (value !== undefined) current.push(value);
    else if (current.length && "•⁘⁜⁚ \n".includes(character)) flush();
  }
  flush();
  return words;
}

const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);

/** @param {string} word @returns {number[]} */
function gpEnglish(word) {
  const normalized = word.toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");

  const out = [];
  for (let offset = 0; offset < normalized.length;) {
    if (normalized.startsWith("ING", offset)) {
      out.push(21);
      offset += 3;
      continue;
    }
    if (normalized.startsWith("IO", offset)) {
      out.push(27);
      offset += 2;
      continue;
    }
    const token = gpTokens.find((candidate) =>
      normalized.startsWith(candidate.symbol, offset)
    );
    assert.ok(token, "unmapped GP spelling: " + normalized.slice(offset));
    out.push(token.value);
    offset += token.symbol.length;
  }
  return out;
}

/** @param {string} word @returns {number} */
function gp0English(word) {
  return sum(gpEnglish(word));
}

const pages = transcription.split(/^\s*%\s*$/m);

// State fixed upstream.
const state = {
  p:23, g:5, a:6, b:15, A:8, B:19, K:2, e:3, q:4,
};

// Positive control: solved p57 circumference instruction selects p50.
const p57 = solved.sections.find((section) => section.name === "p57_parable");
assert.ok(p57);
const p57Words = parseSolvedWords(p57.source_text);
assert.equal(p57Words.length, 20);
const p57Body = p57Words.slice(1);
assert.equal(p57Body.length, 19);
assert.equal(sum(p57Body.map((word) => word.length)), 88);
const p57InnerCount = sum(p57Body.map((word) => Math.max(0, word.length - 2)));
assert.equal(p57InnerCount, 50);

// B selects p33 in the frozen native-base60 table.
assert.equal(decode60(tokens[state.B]), 33);

// P33 first black body: words after red title, first81 body runes.
const p33Words = parsePhysicalWords(pages[33]);
const p33FirstBody = [];
let bodyRunes = 0;
for (const word of p33Words) {
  if (word.start < 10) continue;
  if (word.start >= 91) break;
  p33FirstBody.push(word);
  bodyRunes += word.values.length;
}
assert.equal(p33FirstBody.length, state.p - state.K);
assert.equal(bodyRunes, state.e ** state.q);
const p33InnerCount = sum(
  p33FirstBody.map((word) => Math.max(0, word.values.length - 2))
);
assert.equal(p33InnerCount, 39);

// P39 carries the independently fixed b value in its unique red three-rune title.
const p39Ink = ink.pages.find((page) => page.page === 39);
assert.ok(p39Ink);
assert.equal(p39Ink.red_spans.length, 1);
const p39Red = [...p39Ink.red_spans[0].runes].map((rune) => runeIndex.get(rune));
assert.deepEqual(p39Red, [mod29(-state.K), state.g, state.b]);

// Reconstruct root115 reverse tree and freeze depth b=15 -> 105 cells including root.
const next = tokens.map((token) => decode60(token));
const cycle = new Set([0,203,68,199,47,76,114,197,115,247,192]);
const reverse = Array.from({ length:256 }, () => []);
for (let address = 0; address < 256; address += 1) {
  reverse[next[address]].push(address);
}

const depth = new Map([[115,0]]);
const queue = [115];
while (queue.length) {
  const node = queue.shift();
  const d = depth.get(node);
  for (const parent of reverse[node]) {
    if (cycle.has(parent) || depth.has(parent)) continue;
    depth.set(parent, d + 1);
    queue.push(parent);
  }
}

const depthBIncludingRoot = [...depth.entries()]
  .filter(([,d]) => d <= state.b)
  .length;
assert.equal(depthBIncludingRoot, 105);
assert.equal(gp0English("DIVINITY"), 105);

// FIND DIVINITY WITHIN on p39: zero-based offset105 is an exact g=5 word start.
const p39Words = parsePhysicalWords(pages[39]);
const selected = p39Words.find((word) => word.start === depthBIncludingRoot);
assert.ok(selected);
assert.equal(selected.values.length, state.g);
assert.deepEqual(selected.values, [8,6,4,12,16]);
assert.equal(selected.values[Math.floor(selected.values.length / 2)], state.q);

// One-based rival (#105 -> zero offset104) is not a word start and lies in the
// preceding two-rune word, independently favoring the repository's zero origin.
assert.equal(p39Words.some((word) => word.start === 104), false);
const oneBasedContaining = p39Words.find((word) =>
  word.start <= 104 && word.end >= 104
);
assert.ok(oneBasedContaining);
assert.deepEqual(
  { start:oneBasedContaining.start, len:oneBasedContaining.values.length },
  { start:103, len:2 }
);

// The selected word is itself a complete DH-state shell.
const selectedShell = [
  ...H(selected.values[0], selected.values[4]),
  ...H(selected.values[1], selected.values[3]),
  selected.values[2],
];
assert.deepEqual(selectedShell, [
  state.B + state.K,
  state.p + 1,
  state.p,
  state.p - state.g,
  state.q,
]);

// Apply the already explicit solved operation once: shed one circumference.
const inner = selected.values.slice(1,-1);
assert.deepEqual(inner, [state.a, state.q, state.K * state.a]);
const innerGp0 = sum(inner);
assert.equal(innerGp0, state.p - 1);
assert.equal(innerGp0, 22);

// The table then yields GP0(VERIFY) exactly.
const verifyAddress = decode60(tokens[innerGp0]);
assert.equal(verifyAddress, 59);
assert.equal(gp0English("VERIFY"), verifyAddress);

// Authenticated 2016 vocabulary census.
const signedBody = signed
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .replace(/^-----BEGIN PGP SIGNED MESSAGE-----[\s\S]*?Hash: SHA1\s*/, "")
  .replace(/\b3301\b/g, "")
  .replace(/\b[0-9A-F]{8,}\b/g, "");
const signedWords = (signedBody.match(/[A-Za-z]+/g) || [])
  .map((word) => word.toUpperCase());
assert.equal(signedWords.length, 43);

const sourceByGp0 = new Map();
for (const word of signedWords) {
  const address = gp0English(word);
  if (!sourceByGp0.has(address)) sourceByGp0.set(address, []);
  if (!sourceByGp0.get(address).includes(word)) {
    sourceByGp0.get(address).push(word);
  }
}

const fiveRuneRows = p39Words
  .filter((word) => word.values.length === state.g)
  .map((word) => {
    const shed = word.values.slice(1,-1);
    const shedGp0 = sum(shed);
    const output = decode60(tokens[shedGp0]);
    return {
      start:word.start,
      shedGp0,
      output,
      sourceWords:sourceByGp0.get(output) || [],
    };
  });

assert.equal(fiveRuneRows.length, 10);
const sourceHits = fiveRuneRows.filter((row) => row.sourceWords.length > 0);
assert.deepEqual(sourceHits, [{
  start:105,
  shedGp0:22,
  output:59,
  sourceWords:["VERIFY"],
}]);

// The recovered source phrase is explicitly authentication-only.
const verifyIndex = signedWords.indexOf("VERIFY");
assert.equal(verifyIndex, 41);
assert.equal(signedWords[verifyIndex + 1], "OPENPGP");

// Frozen negative: do not globalize p28's (3,27) power transform. Applying it
// to predecessor104 + selected p39 word105 fails the candidate VERIFY route.
function modPow(base, exponent, modulus) {
  let out = 1;
  let x = base % modulus;
  let e = exponent;
  while (e > 0) {
    if (e & 1) out = out * x % modulus;
    x = x * x % modulus;
    e >>= 1;
  }
  return out;
}

const p39Runes = [...pages[39]]
  .map((character) => runeIndex.get(character))
  .filter((value) => value !== undefined);
const sixRuneTransfer = p39Runes.slice(104,110);
const powerOutput = [
  modPow(sixRuneTransfer[0],3,29),
  ...sixRuneTransfer.slice(1).map((value) => modPow(value,27,29)),
];
assert.equal(translit(powerOutput), "RJCOEBL");

console.log(JSON.stringify({
  status:"PASS",
  classification:
    "source-selected p39 receiver recovers authenticated VERIFY under solved shed-circumference + p50 rule",
  route:{
    p57ShedCount:p57InnerCount,
    p50BToPage:decode60(tokens[state.B]),
    p33ShedCount:p33InnerCount,
    p39Red:p39Red,
    treeDepthBCount:depthBIncludingRoot,
    treeDepthBWord:"DIVINITY",
  },
  selectedP39Word:{
    start:selected.start,
    length:selected.values.length,
    values:selected.values,
    center:selected.values[2],
    shell:selectedShell,
    shedInner:inner,
    shedGp0:innerGp0,
    p50Output:verifyAddress,
    recovered:"VERIFY",
  },
  controls:{
    fiveRuneWordCount:fiveRuneRows.length,
    sourceVocabularyHits:sourceHits,
    oneBasedOffset104WordStart:false,
    powerTransferNegative:translit(powerOutput),
  },
  instructionContext:{
    verifyIndex,
    nextSignedWord:signedWords[verifyIndex+1],
    interpretation:"VERIFY OPENPGP is an authentication instruction; no packet-field cipher operand is inferred.",
  },
}, null, 2));
