"use strict";

/**
 * Source-selected p57 WITHIN -> physical p38 -> signed FOUND closure.
 *
 * Prospective family:
 *   solved p57 word GP0, when in the unknown physical-page range,
 *   -> same-numbered rune-bearing LP2 page
 *   -> receiver ciphertext word GP0
 *   -> original p50 value
 *   -> authenticated 2016 signed-word index
 *   -> selected signed-word GP0
 *   -> original p50 value
 *   -> originating receiver-word boundary.
 *
 * Both p50 radices are charged. Only complete words wholly contained on one
 * physical page are eligible. No candidate plaintext letters or language
 * score are used to select the hit.
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
const solved = JSON.parse(fs.readFileSync(
  path.join(root, "resources/external/relikd-solved-gp29-native-v1.json"), "utf8"));

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const RUNIC = /[\u16A0-\u16FF]/u;
const tokens = grid.pages.flatMap((page) => page.tokens);
const alphabet60 = grid.alphabet;
const alphabet59 = alphabet60.replace("f", "");

/** @param {number[]} xs @returns {number} */
function sum(xs) {
  return xs.reduce((a, b) => a + b, 0);
}

/** @param {string} token @param {string} alphabet @returns {number} */
function decode(token, alphabet) {
  const hi = alphabet.indexOf(token[0]);
  const lo = alphabet.indexOf(token[1]);
  assert.ok(hi >= 0 && lo >= 0);
  return hi * alphabet.length + lo;
}

const tables = {
  base59: tokens.map((token) => decode(token, alphabet59)),
  base60: tokens.map((token) => decode(token, alphabet60)),
};
assert.deepEqual(tables.base60, grid.bytes);

const gpTokens = corpus.translit
  .map((symbol, value) => ({symbol, value}))
  .sort((a, b) => b.symbol.length - a.symbol.length);

/** @param {string} word @returns {number[]} */
function gpEnglish(word) {
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
  const indices = gpEnglish(word);
  return {index, word: word.toUpperCase(), gp0: sum(indices), length: indices.length};
});
assert.equal(signedWords.length, 43);
assert.equal(signedWords[35].word, "FOUND");
assert.equal(signedWords[35].gp0, 36);
assert.equal(signedWords[35].length, 5);

const p57 = solved.sections.find((section) => section.name === "p57_parable");
assert.ok(p57);
const p57Words = p57.source_text
  .split(/[•⁘⁜⁚\s]+/u)
  .filter(Boolean)
  .filter((piece) => [...piece].some((rune) => runeIndex.has(rune)))
  .map((piece, index) => {
    const indices = [...piece].filter((rune) => runeIndex.has(rune))
      .map((rune) => runeIndex.get(rune));
    return {index, gp0: sum(indices), length: indices.length};
  });

const physicalSelectors = [...new Set(p57Words
  .map((word) => word.gp0)
  .filter((value) => value >= 0 && value <= 55 && value !== 50))]
  .sort((a, b) => a - b);
assert.deepEqual(physicalSelectors, [8, 19, 20, 25, 38, 42, 51, 53]);

const within = p57Words[17];
assert.deepEqual(within, {index: 17, gp0: 38, length: 5});

const segments = raw.split("%").slice(0, 55);

/** @param {number} segment @returns {number} */
function physicalPage(segment) {
  return segment >= 50 ? segment + 1 : segment;
}

/**
 * Parse the entire unknown rune stream, keeping only words wholly contained on
 * one physical page. Page breaks do not terminate a word.
 * @returns {Map<number, {runeCount:number,words:Array<object>}>}
 */
function containedPages() {
  const pageRows = segments.map((source, segment) => ({
    physicalPage: physicalPage(segment),
    runeCount: [...source].filter((char) => RUNIC.test(char)).length,
    words: [],
  }));

  let indices = [];
  let startSegment = 0;
  let endSegment = 0;
  let startOffset = 0;
  let localOffset = 0;

  function flush() {
    if (!indices.length) return;
    if (startSegment === endSegment) {
      const words = pageRows[startSegment].words;
      words.push({
        index: words.length,
        start: startOffset,
        end: startOffset + indices.length - 1,
        length: indices.length,
        gp0: sum(indices),
        indices: indices.slice(),
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
          startOffset = localOffset;
        }
        endSegment = segment;
        indices.push(runeIndex.get(char));
        localOffset += 1;
      } else if (char === "/" || /\s/u.test(char)) {
        continue;
      } else {
        flush();
      }
    }
  }
  flush();

  return new Map(pageRows.map((page) => [page.physicalPage, page]));
}

const pages = containedPages();

/**
 * @param {{words:Array<object>}} page
 * @param {number[]} decoded
 * @returns {Array<object>}
 */
function typedClosures(page, decoded) {
  const hits = [];
  for (const word of page.words) {
    if (word.gp0 >= decoded.length) continue;
    const signedIndex = decoded[word.gp0];
    if (signedIndex >= signedWords.length) continue;
    const selected = signedWords[signedIndex];
    if (selected.gp0 >= decoded.length) continue;
    const destination = decoded[selected.gp0];
    if (destination === word.start || destination === word.end) {
      hits.push({
        receiverWord: word.index,
        start: word.start,
        end: word.end,
        receiverLength: word.length,
        cipherGp0: word.gp0,
        signedIndex,
        signedWord: selected.word,
        signedLength: selected.length,
        signedGp0: selected.gp0,
        destination,
      });
    }
  }
  return hits;
}

const familyHits = [];
for (const pageNumber of physicalSelectors) {
  const page = pages.get(pageNumber);
  assert.ok(page, "missing rune-bearing selector page " + pageNumber);
  for (const [radix, decoded] of Object.entries(tables)) {
    for (const hit of typedClosures(page, decoded)) {
      familyHits.push({page: pageNumber, radix, ...hit});
    }
  }
}

assert.deepEqual(familyHits, [{
  page: 38,
  radix: "base59",
  receiverWord: 9,
  start: 49,
  end: 53,
  receiverLength: 5,
  cipherGp0: 95,
  signedIndex: 35,
  signedWord: "FOUND",
  signedLength: 5,
  signedGp0: 36,
  destination: 53,
}]);

assert.equal(tables.base59[95], 35);
assert.equal(tables.base59[36], 53);

// Sensitivity control: the most literal same-offset p50 additive pads do not
// turn the five ciphertext runes directly into FOUND under either radix/sign.
// This prevents the navigation hit from being misreported as a cipher inverse.
const p38word = pages.get(38).words[9];
const found = gpEnglish("FOUND");
for (const decoded of Object.values(tables)) {
  const key = decoded.slice(p38word.start, p38word.end + 1)
    .map((value) => value % 29);
  for (const sign of [-1, 1]) {
    const candidate = p38word.indices.map(
      (value, i) => (value + sign * key[i] + 29) % 29);
    assert.notDeepEqual(candidate, found);
  }
}

console.log(JSON.stringify({
  status: "PASS: p57 direct-page selector family has one typed closure",
  physicalSelectors,
  selectorWord: "WITHIN",
  selectorGp0: 38,
  familyHits,
  directSameOffsetP50PadRecoversFound: false,
}, null, 2));
