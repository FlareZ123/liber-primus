"use strict";

/**
 * Audit a chronology-independent convergence between the p38 FOUND candidate
 * and Agent15's pre-existing authenticated VERIFY -> p50 reflection -> DH B
 * invariant.
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
const source = read("resources/liber-primus/lp2-transcription.txt");
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");

const RUNIC = /[\u16A0-\u16FF]/u;
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const tokens = grid.pages.flatMap((page) => page.tokens);
const alphabet60 = grid.alphabet;
const alphabet59 = alphabet60.replace("f", "");
const state = Object.freeze({ p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2 });

/** @param {number[]} values @returns {number} */
function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

/** @param {string} token @param {string} alphabet @returns {number} */
function decodeToken(token, alphabet) {
  const hi = alphabet.indexOf(token[0]);
  const lo = alphabet.indexOf(token[1]);
  assert.ok(hi >= 0 && lo >= 0, "token outside alphabet: " + token);
  return hi * alphabet.length + lo;
}

/** @param {number} cell @returns {number} */
function reflect(cell) {
  return Math.floor(cell / 8) * 8 + (7 - (cell % 8));
}

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

const tables = Object.freeze({
  base59: tokens.map((token) => decodeToken(token, alphabet59)),
  base60: tokens.map((token) => decodeToken(token, alphabet60)),
});
assert.deepEqual(tables.base60, grid.bytes);

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
    const token = gpTokens.find((candidate) => normalized.startsWith(candidate.symbol, offset));
    assert.ok(token, "unmapped GP spelling: " + word);
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}

const signedBody = signed
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .replace(/^-----BEGIN PGP SIGNED MESSAGE-----[\s\S]*?Hash: SHA1\s*/, "")
  .replace(/\b3301\b/g, "")
  .replace(/\b[0-9A-F]{8,}\b/g, "");

const signedWords = (signedBody.match(/[A-Za-z]+/g) || []).map((word, index) => {
  const values = gpEnglish(word);
  return { index, word: word.toUpperCase(), values, gp0: sum(values), length: values.length };
});
assert.equal(signedWords.length, 43);
const distinctSigned = [...new Map(signedWords.map((word) => [word.word, word])).values()];
const verify = distinctSigned.find((word) => word.word === "VERIFY");
const found = distinctSigned.find((word) => word.word === "FOUND");
assert.ok(verify && found);
assert.equal(verify.gp0, 59);
assert.equal(found.gp0, 36);

/**
 * Reproduce Agent15's source-word/reflection/DH-state invariant for an address.
 * The address must be the GP0 of at least one authenticated signed word.
 * @param {number} address
 * @returns {object|null}
 */
function authenticatedReflectionInvariant(address) {
  if (address < 0 || address >= tokens.length) return null;
  const sourceWords = distinctSigned.filter((word) => word.gp0 === address);
  if (!sourceWords.length) return null;
  const token = tokens[address];
  if (!/^\d{2}$/u.test(token)) return null;
  const literal = Number(token);
  if (!Object.values(state).includes(literal)) return null;
  const reflected = reflect(address);
  const reflectedToken = tokens[reflected];
  const v59 = mod29(decodeToken(reflectedToken, alphabet59));
  const v60 = mod29(decodeToken(reflectedToken, alphabet60));
  const preserve59 = v59 === literal;
  const preserve60 = v60 === literal;
  if (preserve59 === preserve60) return null;
  return {
    address,
    sourceWords: sourceWords.map((word) => word.word),
    token,
    literal,
    reflected,
    reflectedToken,
    mod59: v59,
    mod60: v60,
    preservingRadix: preserve60 ? "base60" : "base59",
  };
}

const invariantAddresses = [];
for (let address = 0; address < tokens.length; address += 1) {
  const invariant = authenticatedReflectionInvariant(address);
  if (invariant) invariantAddresses.push(invariant);
}
assert.deepEqual(invariantAddresses, [{
  address: 59,
  sourceWords: ["VERIFY"],
  token: "19",
  literal: state.B,
  reflected: 60,
  reflectedToken: "1k",
  mod59: 17,
  mod60: state.B,
  preservingRadix: "base60",
}]);

const segments = source.split("%").slice(0, 55);

/** @param {number} segment @returns {number} */
function physicalPage(segment) {
  return segment >= 50 ? segment + 1 : segment;
}

/**
 * Parse the whole unknown stream continuously and retain words wholly contained
 * on a single physical page.
 * @returns {Array<object>}
 */
function containedWords() {
  const pages = segments.map((text, segment) => ({
    page: physicalPage(segment),
    words: [],
  }));
  const offsets = new Array(segments.length).fill(0);
  let values = [];
  let startSegment = 0;
  let endSegment = 0;
  let start = 0;

  function flush() {
    if (!values.length) return;
    if (startSegment === endSegment) {
      const page = pages[startSegment];
      page.words.push({
        page: page.page,
        ordinal: page.words.length,
        start,
        end: start + values.length - 1,
        values: values.slice(),
        length: values.length,
        gp0: sum(values),
      });
    }
    values = [];
  }

  for (let segment = 0; segment < segments.length; segment += 1) {
    for (const char of segments[segment]) {
      if (RUNIC.test(char)) {
        if (!values.length) {
          startSegment = segment;
          start = offsets[segment];
        }
        endSegment = segment;
        values.push(runeIndex.get(char));
        offsets[segment] += 1;
      } else if (char === "/" || /\s/u.test(char)) {
        continue;
      } else {
        flush();
      }
    }
  }
  flush();
  return pages.flatMap((page) => page.words);
}

const receivers = containedWords();
assert.equal(receivers.length, 2864);

/**
 * Apply the exact zero-origin p50 typed closure.
 * @param {object} receiver
 * @param {number[]} decoded
 * @returns {object|null}
 */
function typedClosure(receiver, decoded) {
  if (receiver.gp0 < 0 || receiver.gp0 >= decoded.length) return null;
  const signedIndex = decoded[receiver.gp0];
  if (signedIndex < 0 || signedIndex >= signedWords.length) return null;
  const selected = signedWords[signedIndex];
  if (selected.gp0 < 0 || selected.gp0 >= decoded.length) return null;
  const destination = decoded[selected.gp0];
  if (destination !== receiver.start && destination !== receiver.end) return null;
  if (selected.length !== receiver.length) return null;
  return {
    signedIndex,
    selectedWord: selected.word,
    selectedGp0: selected.gp0,
    destination,
    boundary: destination === receiver.start ? "start" : "end",
  };
}

const closureHits = [];
for (const receiver of receivers) {
  for (const [radix, decoded] of Object.entries(tables)) {
    const closure = typedClosure(receiver, decoded);
    if (!closure) continue;
    const delta = receiver.gp0 - closure.selectedGp0;
    const invariant = authenticatedReflectionInvariant(delta);
    closureHits.push({
      ...receiver,
      radix,
      ...closure,
      delta,
      verifyInvariant: invariant,
      firstCipherIsB: receiver.values[0] === state.B,
    });
  }
}

const verifyClosureHits = closureHits.filter((hit) => hit.verifyInvariant);
const verifyAndBFirst = verifyClosureHits.filter((hit) => hit.firstCipherIsB);

// Broader same-length pair control, without requiring the typed closure.
const pairControls = [];
for (const receiver of receivers) {
  for (const target of distinctSigned) {
    if (target.length !== receiver.length) continue;
    const delta = receiver.gp0 - target.gp0;
    const invariant = authenticatedReflectionInvariant(delta);
    if (!invariant) continue;
    pairControls.push({
      page: receiver.page,
      ordinal: receiver.ordinal,
      start: receiver.start,
      end: receiver.end,
      cipherGp0: receiver.gp0,
      target: target.word,
      targetGp0: target.gp0,
      delta,
      firstCipherIsB: receiver.values[0] === state.B,
    });
  }
}

const p38 = verifyClosureHits.find((hit) =>
  hit.page === 38 && hit.start === 49 && hit.end === 53 && hit.selectedWord === "FOUND");
assert.ok(p38);
assert.equal(p38.gp0, 95);
assert.equal(p38.delta, verify.gp0);
assert.equal(p38.values[0], state.B);

console.log(JSON.stringify({
  status: "PASS: p38 FOUND / VERIFY-B chronology convergence audited",
  invariantAddresses,
  population: {
    whollyPageContainedWords: receivers.length,
    lengthMatchedTypedClosures: closureHits.length,
    typedClosuresWithAuthenticatedReflectionInvariant: verifyClosureHits.length,
    typedClosuresAlsoStartingWithSelectedDhValue: verifyAndBFirst.length,
    sameLengthReceiverTargetPairsWithInvariant: pairControls.length,
    sameLengthPairsAlsoStartingWithSelectedDhValue:
      pairControls.filter((row) => row.firstCipherIsB).length,
  },
  verifyClosureHits: verifyClosureHits.map((hit) => ({
    page: hit.page,
    ordinal: hit.ordinal,
    start: hit.start,
    end: hit.end,
    cipherGp0: hit.gp0,
    radix: hit.radix,
    selectedWord: hit.selectedWord,
    selectedGp0: hit.selectedGp0,
    delta: hit.delta,
    firstCipher: hit.values[0],
    firstCipherIsB: hit.firstCipherIsB,
    verifyInvariant: hit.verifyInvariant,
  })),
  p38Found: {
    page: p38.page,
    start: p38.start,
    end: p38.end,
    cipherGp0: p38.gp0,
    plaintextCandidate: p38.selectedWord,
    targetGp0: p38.selectedGp0,
    delta: p38.delta,
    verifyGp0: verify.gp0,
    firstCipher: p38.values[0],
    dhB: state.B,
  },
  classification:
    "chronology-independent checksum audit: Agent15 fixed VERIFY->59->B reflection before this p38 convergence was recognized; family counts quantify selectivity without treating recognition time as a blind p38 prediction.",
}, null, 2));
