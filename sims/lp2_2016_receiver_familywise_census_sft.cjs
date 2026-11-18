"use strict";

/**
 * Familywise receiver census for the authenticated-2016 GP0 -> p50 map.
 *
 * The current p0 branch fixes:
 *   source word -> canonical GP0 sum -> p50 token address -> decoded value
 *   -> receiver-page local rune offset.
 *
 * This SFT charges the previously uncharged receiver choice by applying that
 * exact grammar to every rune-bearing unsolved LP2 page, under both source-
 * supported p50 radices. It evaluates two frozen word-boundary conventions:
 * page-local printed fragments and only continuous words wholly contained on
 * one page. No plaintext scoring or receiver-specific parameter tuning is used.
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
const signed = fs.readFileSync(
  path.join(root, "resources/historical/cicada2016-4gq25-outguess.asc"), "utf8");

const RUNIC = /[\u16A0-\u16FF]/u;
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const alphabet60 = grid.alphabet;
const alphabet59 = alphabet60.replace("f", "");
const tokens = grid.pages.flatMap((page) => page.tokens);

assert.equal(alphabet60.length, 60);
assert.equal(alphabet59.length, 59);
assert.equal(tokens.length, 256);

/** @param {string} token @param {string} alphabet @returns {number} */
function decode(token, alphabet) {
  const a = alphabet.indexOf(token[0]);
  const b = alphabet.indexOf(token[1]);
  assert.ok(a >= 0 && b >= 0);
  return a * alphabet.length + b;
}

const tables = {
  base59: tokens.map((token) => decode(token, alphabet59)),
  base60: tokens.map((token) => decode(token, alphabet60)),
};
assert.deepEqual(tables.base60, grid.bytes);

const gpTokens = corpus.translit
  .map((symbol, value) => ({symbol, value}))
  .sort((a, b) => b.symbol.length - a.symbol.length);

/** @param {number[]} xs @returns {number} */
function sum(xs) {
  return xs.reduce((a, b) => a + b, 0);
}

/** @param {string} word @returns {number[]} */
function gp(word) {
  const normalized = word.toUpperCase()
    .replace(/K/g, "C").replace(/V/g, "U")
    .replace(/Q/g, "C").replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");
  const out = [];
  for (let i = 0; i < normalized.length;) {
    const token = gpTokens.find((item) => normalized.startsWith(item.symbol, i));
    assert.ok(token, "unmapped GP spelling at " + normalized.slice(i));
    out.push(token.value);
    i += token.symbol.length;
  }
  return out;
}

const signedBody = signed
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .replace(/^-----BEGIN PGP SIGNED MESSAGE-----[\s\S]*?Hash: SHA1\s*/, "")
  .replace(/\b3301\b/g, "")
  .replace(/\b[0-9A-F]{8,}\b/g, "");
const signedWords = (signedBody.match(/[A-Za-z]+/g) || []).map((word, index) => {
  const indices = gp(word);
  return {index, word: word.toUpperCase(), sum: sum(indices), length: indices.length};
});
assert.equal(signedWords.length, 43);

const segments = raw.split("%").slice(0, 55);

/** @param {number} segment @returns {number} */
function physicalPage(segment) {
  return segment >= 50 ? segment + 1 : segment;
}

/**
 * Parse a single page independently. A trailing/leading page fragment counts
 * as a page-local printed word fragment, matching the current p0 receiver.
 * @param {string} source
 * @returns {{runeCount:number,words:Array<object>}}
 */
function parseLocal(source) {
  const words = [];
  let indices = [];
  let start = 0;
  let runeOffset = 0;
  function flush() {
    if (!indices.length) return;
    words.push({
      index: words.length,
      start,
      end: start + indices.length - 1,
      length: indices.length,
      indices,
      gp0: sum(indices),
    });
    indices = [];
  }
  for (const char of source) {
    if (RUNIC.test(char)) {
      if (!indices.length) start = runeOffset;
      const value = runeIndex.get(char);
      assert.notEqual(value, undefined);
      indices.push(value);
      runeOffset += 1;
    } else if (char === "/" || /\s/u.test(char)) {
      continue;
    } else {
      flush();
    }
  }
  flush();
  return {runeCount: runeOffset, words};
}

/**
 * Parse the 55 rune-bearing pages as one stream and retain only words wholly
 * contained on a page. Page boundaries do not terminate a word.
 * @returns {Array<{runeCount:number,words:Array<object>}>}
 */
function parseContained() {
  const out = segments.map((source) => ({runeCount: [...source].filter(
    (char) => RUNIC.test(char)).length, words: []}));
  let indices = [];
  let startSegment = 0;
  let endSegment = 0;
  let startLocal = 0;
  let localOffset = 0;

  function flush() {
    if (!indices.length) return;
    if (startSegment === endSegment) {
      const words = out[startSegment].words;
      words.push({
        index: words.length,
        start: startLocal,
        end: startLocal + indices.length - 1,
        length: indices.length,
        indices,
        gp0: sum(indices),
      });
    }
    indices = [];
  }

  for (let segment = 0; segment < segments.length; segment += 1) {
    localOffset = 0;
    for (const char of segments[segment]) {
      if (RUNIC.test(char)) {
        if (!indices.length) {
          startSegment = segment;
          startLocal = localOffset;
        }
        endSegment = segment;
        const value = runeIndex.get(char);
        assert.notEqual(value, undefined);
        indices.push(value);
        localOffset += 1;
      } else if (char === "/" || /\s/u.test(char)) {
        continue;
      } else {
        flush();
      }
    }
    // Intentionally do not flush at a page boundary.
  }
  flush();
  return out;
}

const localPages = segments.map(parseLocal);
const containedPages = parseContained();
assert.equal(localPages[0].runeCount, 262);
assert.equal(localPages[0].words.length, 59);
assert.equal(localPages[0].words[52].start, 235);
assert.equal(localPages[0].words[52].end, 236);
assert.equal(localPages[0].words[53].start, 237);
assert.equal(localPages[0].words[53].length, 7);

/**
 * @param {number[]} vector
 * @returns {Array<{start:number,phrase:string}>}
 */
function matchingSignedPhrases(vector) {
  const hits = [];
  for (let i = 0; i + vector.length <= signedWords.length; i += 1) {
    const phrase = signedWords.slice(i, i + vector.length);
    if (phrase.every((word, j) => word.length === vector[j])) {
      hits.push({start: i, phrase: phrase.map((word) => word.word).join(" ")});
    }
  }
  return hits;
}

/**
 * Census one receiver page under one decoded p50 table.
 * @param {{runeCount:number,words:Array<object>}} page
 * @param {number[]} decoded
 * @returns {object}
 */
function censusPage(page, decoded) {
  const startMap = new Map(page.words.map((word) => [word.start, word]));
  const endMap = new Map(page.words.map((word) => [word.end, word]));
  const boundaryCrossings = [];
  const bracketPhraseMatches = [];
  const bracketCandidates = [];

  for (let i = 0; i < signedWords.length - 1; i += 1) {
    const left = signedWords[i];
    const right = signedWords[i + 1];
    if (left.sum >= decoded.length || right.sum >= decoded.length) continue;
    const x = decoded[left.sum];
    const y = decoded[right.sum];
    if (x >= page.runeCount || y >= page.runeCount) continue;
    const pair = left.word + " / " + right.word;

    const ending = endMap.get(x);
    const starting = startMap.get(y);
    if (ending && starting && y === x + 1 && starting.start === ending.end + 1) {
      boundaryCrossings.push({
        sourceIndex: i, pair, x, y,
        receiverLengths: [ending.length, starting.length],
      });
    }

    if (endMap.has(x) && endMap.has(y) && x !== y) {
      const low = Math.min(x, y);
      const high = Math.max(x, y);
      const vector = page.words
        .filter((word) => word.start > low && word.end <= high)
        .map((word) => word.length);
      if (!vector.length) continue;
      const matches = matchingSignedPhrases(vector);
      bracketCandidates.push({sourceIndex:i,pair,x,y,vector,matchCount:matches.length});
      for (const match of matches) {
        bracketPhraseMatches.push({sourceIndex:i,pair,x,y,vector,...match});
      }
    }
  }

  const typedCandidates = [];
  const typedClosures = [];
  for (const word of page.words) {
    if (word.gp0 >= decoded.length) continue;
    const signedIndex = decoded[word.gp0];
    if (signedIndex >= signedWords.length) continue;
    const selected = signedWords[signedIndex];
    if (selected.sum >= decoded.length) continue;
    const destination = decoded[selected.sum];
    const row = {
      receiverWord: word.index,
      start: word.start,
      end: word.end,
      length: word.length,
      cipherGp0: word.gp0,
      signedIndex,
      signedWord: selected.word,
      signedGp0: selected.sum,
      destination,
    };
    typedCandidates.push(row);
    if (destination === word.start || destination === word.end) {
      typedClosures.push(row);
    }
  }

  return {boundaryCrossings,bracketCandidates,bracketPhraseMatches,typedCandidates,typedClosures};
}

/**
 * @param {Array<{runeCount:number,words:Array<object>}>} pages
 * @param {number[]} decoded
 * @returns {Array<object>}
 */
function censusAll(pages, decoded) {
  return pages.map((page, segment) => ({
    segment,
    physicalPage: physicalPage(segment),
    runeCount: page.runeCount,
    wordCount: page.words.length,
    ...censusPage(page, decoded),
  }));
}

const result = {};
for (const [boundaryConvention, pages] of Object.entries({
  pageLocal: localPages,
  containedOnly: containedPages,
})) {
  result[boundaryConvention] = {};
  for (const [radix, decoded] of Object.entries(tables)) {
    const rows = censusAll(pages, decoded);
    result[boundaryConvention][radix] = {
      pagesWithBoundaryCrossings: rows.filter((row) => row.boundaryCrossings.length)
        .map((row) => ({page:row.physicalPage,hits:row.boundaryCrossings})),
      pagesWithBracketPhraseMatches: rows.filter((row) => row.bracketPhraseMatches.length)
        .map((row) => ({page:row.physicalPage,hits:row.bracketPhraseMatches})),
      pagesWithTypedClosures: rows.filter((row) => row.typedClosures.length)
        .map((row) => ({page:row.physicalPage,hits:row.typedClosures})),
      receiverPageCount: rows.length,
    };
  }
}

// Lock the already-published p0 base60 behavior so the familywise extension
// cannot silently drift from the current receiver grammar.
const p0 = result.pageLocal.base60;
const p0Boundary = p0.pagesWithBoundaryCrossings.find((row) => row.page === 0);
assert.ok(p0Boundary);
assert.deepEqual(p0Boundary.hits, [{
  sourceIndex: 4,
  pair: "EMPTY / EPIPHANY",
  x: 236,
  y: 237,
  receiverLengths: [2, 7],
}]);
const p0Bracket = p0.pagesWithBracketPhraseMatches.find((row) => row.page === 0);
assert.ok(p0Bracket);
assert.equal(p0Bracket.hits.length, 1);
assert.equal(p0Bracket.hits[0].pair, "SEEKS / THE");
assert.equal(p0Bracket.hits[0].phrase, "THE ROAD");

console.log(JSON.stringify({
  status:"PASS: full receiver-family census completed without changing the frozen GP0->p50 grammar",
  result,
}, null, 2));
