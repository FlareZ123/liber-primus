"use strict";

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
const solved = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));

const RUNIC = /[\u16A0-\u16FF]/u;
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const state = Object.freeze({ p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2 });
const tokens = grid.pages.flatMap((page) => page.tokens);
const alphabet60 = grid.alphabet;
const alphabet59 = alphabet60.replace("f", "");

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

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
    assert.ok(token, "unmapped GP spelling " + word + " at " + normalized.slice(offset));
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
assert.deepEqual(
  signedWords.filter((word) => word.length === 5).map((word) => word.word),
  ["HELLO", "EMPTY", "SEEKS", "LIBER", "WORDS", "FOUND", "FALSE"]
);
const fiveTargets = signedWords.filter((word, index, all) =>
  word.length === 5 && all.findIndex((other) => other.word === word.word) === index);
const found = fiveTargets.find((target) => target.word === "FOUND");
assert.ok(found);
assert.equal(found.gp0, 36);

const segments = source.split("%").slice(0, 55);

/** @param {number} segment @returns {number} */
function physicalPage(segment) {
  return segment >= 50 ? segment + 1 : segment;
}

/**
 * Parse the unknown stream continuously, preserving line/page-spanning words
 * and retaining only words wholly contained on one physical page.
 * @returns {Map<number, {physicalPage:number,runeCount:number,words:Array<object>}>}
 */
function containedPages() {
  const pages = segments.map((text, segment) => ({
    physicalPage: physicalPage(segment),
    runeCount: [...text].filter((char) => RUNIC.test(char)).length,
    words: [],
  }));

  let values = [];
  let startSegment = 0;
  let endSegment = 0;
  let startOffset = 0;
  const localOffsets = new Array(segments.length).fill(0);

  function flush() {
    if (!values.length) return;
    if (startSegment === endSegment) {
      const page = pages[startSegment];
      page.words.push({
        ordinal: page.words.length,
        start: startOffset,
        end: startOffset + values.length - 1,
        length: values.length,
        values: values.slice(),
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
          startOffset = localOffsets[segment];
        }
        endSegment = segment;
        values.push(runeIndex.get(char));
        localOffsets[segment] += 1;
      } else if (char === "/" || /\s/u.test(char)) {
        continue;
      } else {
        flush();
      }
    }
  }
  flush();

  return new Map(pages.map((page) => [page.physicalPage, page]));
}

const pages = containedPages();
const containedFiveRuneWords = [];
for (const [pageNumber, page] of pages) {
  for (const word of page.words) {
    if (word.length === 5) containedFiveRuneWords.push({ page: pageNumber, ...word });
  }
}
assert.equal(containedFiveRuneWords.length, 311);

// Reconstruct the source-only p57 direct-page selector family.
const p57 = solved.sections.find((section) => section.name === "p57_parable");
assert.ok(p57);
const p57Words = p57.source_text
  .split(/[•⁘⁜⁚\s]+/u)
  .filter(Boolean)
  .filter((piece) => [...piece].some((rune) => runeIndex.has(rune)))
  .map((piece, index) => {
    const values = [...piece]
      .filter((rune) => runeIndex.has(rune))
      .map((rune) => runeIndex.get(rune));
    return { index, gp0: sum(values), length: values.length };
  });
const physicalSelectors = [...new Set(
  p57Words.map((word) => word.gp0).filter((value) => value >= 0 && value <= 55 && value !== 50)
)].sort((left, right) => left - right);
assert.deepEqual(physicalSelectors, [8, 19, 20, 25, 38, 42, 51, 53]);

/**
 * Typed closure used upstream of p38 FOUND.
 * @param {object} word
 * @param {number[]} decoded
 * @returns {object|null}
 */
function typedClosure(word, decoded) {
  if (word.gp0 >= decoded.length) return null;
  const signedIndex = decoded[word.gp0];
  if (signedIndex >= signedWords.length) return null;
  const selected = signedWords[signedIndex];
  if (selected.gp0 >= decoded.length) return null;
  const destination = decoded[selected.gp0];
  if (destination !== word.start && destination !== word.end) return null;
  return {
    signedIndex,
    selectedWord: selected.word,
    selectedLength: selected.length,
    selectedGp0: selected.gp0,
    destination,
    boundary: destination === word.start ? "start" : "end",
  };
}

const upstreamSelectorHits = [];
for (const pageNumber of physicalSelectors) {
  const page = pages.get(pageNumber);
  assert.ok(page);
  for (const [radix, decoded] of Object.entries(tables)) {
    for (const word of page.words) {
      const closure = typedClosure(word, decoded);
      if (closure) upstreamSelectorHits.push({ page: pageNumber, radix, ...word, ...closure });
    }
  }
}
assert.equal(upstreamSelectorHits.length, 1);
assert.equal(upstreamSelectorHits[0].page, 38);
assert.equal(upstreamSelectorHits[0].radix, "base59");
assert.equal(upstreamSelectorHits[0].start, 49);
assert.equal(upstreamSelectorHits[0].end, 53);
assert.equal(upstreamSelectorHits[0].selectedWord, "FOUND");

// Freeze the p28 HERE/DH one-based lookup family.
function physicalPart(pageNumber) {
  assert.notEqual(pageNumber, 50);
  const partIndex = pageNumber <= 49 ? pageNumber : pageNumber - 1;
  return segments[partIndex];
}

/**
 * Match Agent16's original page-local comparison population. This parser
 * intentionally treats each physical page independently, so a page-edge
 * continuation can appear as a local chunk. It is used only for the published
 * 318-receiver lookup baseline, while the full-chain audit below uses the
 * stricter continuous parser's 311 wholly page-contained words.
 * @param {string} text
 * @returns {Array<object>}
 */
function parsePageWords(text) {
  const words = [];
  let current = [];
  let start = 0;
  let offset = 0;
  const flush = () => {
    if (!current.length) return;
    words.push({
      ordinal: words.length,
      start,
      end: offset - 1,
      length: current.length,
      values: current.slice(),
      gp0: sum(current),
    });
    current = [];
  };
  for (const char of [...text]) {
    if (runeIndex.has(char)) {
      if (!current.length) start = offset;
      current.push(runeIndex.get(char));
      offset += 1;
    } else if (char === "-" || char === ".") {
      flush();
    }
  }
  flush();
  return words;
}

const fiveRuneWords = [];
for (let pageNumber = 0; pageNumber <= 55; pageNumber += 1) {
  if (pageNumber === 50) continue;
  for (const word of parsePageWords(physicalPart(pageNumber))) {
    if (word.length === 5) fiveRuneWords.push({ page: pageNumber, ...word });
  }
}
assert.equal(fiveRuneWords.length, 318);

function runeLines(pageNumber) {
  return physicalPart(pageNumber).trim().split("/").filter((line) => RUNIC.test(line));
}

function runeValues(line) {
  return [...line].map((char) => runeIndex.get(char)).filter((value) => value !== undefined);
}

const p28Lines = runeLines(28);
const lookupLines = Object.freeze({ HERE: runeValues(p28Lines[0]), DH: runeValues(p28Lines[5]) });
const lookupOptions = [];
for (const [lineName, values] of Object.entries(lookupLines)) {
  for (const [field, oneBasedIndex] of Object.entries(state)) {
    lookupOptions.push({
      descriptor: lineName + "[" + field + "]",
      value: values[oneBasedIndex - 1],
    });
  }
}
assert.equal(lookupOptions.length, 14);
const allowedKeyValues = new Set(lookupOptions.map((option) => option.value));
assert.deepEqual(
  [...allowedKeyValues].sort((left, right) => left - right),
  [3, 5, 7, 8, 10, 12, 17, 20, 22, 23, 24, 26, 28]
);

/**
 * Return both signed-key orientations by which a receiver can become target.
 * sign=+1 means P=C+K; sign=-1 means P=C-K.
 * @param {number[]} cipher
 * @param {number[]} target
 * @returns {Array<{sign:number,key:number[]}>}
 */
function lookupRecoveries(cipher, target) {
  const hits = [];
  for (const sign of [1, -1]) {
    const key = cipher.map((value, index) =>
      sign === 1
        ? mod29(target[index] - value)
        : mod29(value - target[index])
    );
    if (key.every((value) => allowedKeyValues.has(value))) hits.push({ sign, key });
  }
  return hits;
}

// Manuscript-wide baseline for the broad lookup vocabulary.
const lookupFoundReceivers = [];
const lookupAnyReceivers = [];
let lookupTargetPairs = 0;
for (const receiver of fiveRuneWords) {
  const foundHits = lookupRecoveries(receiver.values, found.values);
  if (foundHits.length) lookupFoundReceivers.push({ ...receiver, recoveries: foundHits });
  const targetHits = [];
  for (const target of fiveTargets) {
    const recoveries = lookupRecoveries(receiver.values, target.values);
    if (!recoveries.length) continue;
    lookupTargetPairs += 1;
    targetHits.push({ target: target.word, recoveries });
  }
  if (targetHits.length) lookupAnyReceivers.push({ ...receiver, targetHits });
}

// Combined full-chain gate over all five-rune receivers on all pages and both radices.
// The typed closure chooses the target. No alternative target is scored.
const fullChainMatches = [];
const fiveRuneTypedClosures = [];
for (const receiver of containedFiveRuneWords) {
  for (const [radix, decoded] of Object.entries(tables)) {
    const closure = typedClosure(receiver, decoded);
    if (!closure || closure.selectedLength !== 5) continue;
    fiveRuneTypedClosures.push({ ...receiver, radix, ...closure });
    const selected = signedWords[closure.signedIndex];
    const recoveries = lookupRecoveries(receiver.values, selected.values);
    if (recoveries.length) {
      fullChainMatches.push({ ...receiver, radix, ...closure, recoveries });
    }
  }
}

const p38FullChain = fullChainMatches.filter((hit) =>
  hit.page === 38 && hit.start === 49 && hit.end === 53 && hit.selectedWord === "FOUND");
const outsideP38FullChain = fullChainMatches.filter((hit) => hit.page !== 38);
const outsideKnownReceiver = fullChainMatches.filter((hit) =>
  !(hit.page === 38 && hit.start === 49 && hit.end === 53));

// Existing downstream self-index/literal-token holdout, evaluated only after
// the lookup/full-chain census has been constructed.
const singleRuneAlias = new Map();
for (let value = 0; value < corpus.translit.length; value += 1) {
  for (const alias of corpus.translit[value].toUpperCase().split("/")) {
    if (/^[A-Z]$/u.test(alias)) singleRuneAlias.set(alias, value);
  }
}

/** @param {object} target @returns {boolean} */
function literalTokenCount(target) {
  if (target.gp0 >= tokens.length) return false;
  const token = tokens[target.gp0];
  if (!/^[0-9]/u.test(token[0])) return false;
  const value = singleRuneAlias.get(token[1].toUpperCase());
  if (value === undefined) return false;
  const expected = Number(token[0]);
  const observed = target.values.filter((rune) => rune === value).length;
  return observed === expected;
}

const knownReceiver = upstreamSelectorHits[0];
const selfIndexAudit = fiveTargets.map((target) => {
  const token = tokens[target.gp0];
  const selfIndexHits = [];
  for (const [radix, decoded] of Object.entries(tables)) {
    const raw = decoded[target.gp0];
    for (const origin of [0, 1]) {
      const offset = raw - origin;
      for (const boundary of ["start", "end"]) {
        if (offset === knownReceiver[boundary]) {
          selfIndexHits.push({ radix, origin, raw, offset, boundary });
        }
      }
    }
  }
  return {
    target: target.word,
    gp0: target.gp0,
    token,
    selfIndexHits,
    literalTokenCount: literalTokenCount(target),
  };
});
const bothSelfIndexAndLiteral = selfIndexAudit.filter((row) =>
  row.selfIndexHits.length && row.literalTokenCount);
assert.deepEqual(bothSelfIndexAndLiteral.map((row) => row.target), ["FOUND"]);

const decision = Object.freeze({
  upstreamSelectorUnique: upstreamSelectorHits.length === 1,
  knownP38FullChainCount: p38FullChain.length,
  outsideKnownReceiverFullChainCount: outsideKnownReceiver.length,
  outsideP38FullChainCount: outsideP38FullChain.length,
  blindSpecificityHoldoutPass: outsideKnownReceiver.length === 0,
});

console.log(JSON.stringify({
  status: "PASS: combined p38 FOUND family audited",
  upstream: {
    physicalSelectors,
    selectorFamilyHits: upstreamSelectorHits.map((hit) => ({
      page: hit.page,
      radix: hit.radix,
      ordinal: hit.ordinal,
      start: hit.start,
      end: hit.end,
      cipherGp0: hit.gp0,
      selectedWord: hit.selectedWord,
      selectedGp0: hit.selectedGp0,
      destination: hit.destination,
      boundary: hit.boundary,
    })),
  },
  lookupBaseline: {
    fiveRuneWords: fiveRuneWords.length,
    whollyPageContainedFiveRuneWords: containedFiveRuneWords.length,
    foundReachableReceivers: lookupFoundReceivers.length,
    anyAuthenticatedTargetReachableReceivers: lookupAnyReceivers.length,
    receiverTargetPairs: lookupTargetPairs,
    foundReceiverPages: [...new Set(lookupFoundReceivers.map((hit) => hit.page))],
  },
  combinedFamily: {
    fiveRuneTypedClosures: fiveRuneTypedClosures.length,
    fullChainMatches: fullChainMatches.map((hit) => ({
      page: hit.page,
      radix: hit.radix,
      ordinal: hit.ordinal,
      start: hit.start,
      end: hit.end,
      cipherGp0: hit.gp0,
      selectedWord: hit.selectedWord,
      destination: hit.destination,
      boundary: hit.boundary,
      recoveries: hit.recoveries,
    })),
  },
  downstreamHoldout: {
    receiver: { page: 38, start: knownReceiver.start, end: knownReceiver.end },
    targetAudit: selfIndexAudit,
    bothSelfIndexAndLiteral: bothSelfIndexAndLiteral.map((row) => row.target),
  },
  decision,
}, null, 2));
