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
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const base60 = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const screen2013 = read("resources/historical/cicada2013-os-original-message.txt");
const parts = transcription.split(/^\s*%\s*$/m);
const runeToValue = new Map(corpus.runes.map((rune, value) => [rune, value]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number} count @returns {number[]} */
function firstPrimes(count) {
  const out = [];
  for (let candidate = 2; out.length < count; candidate += 1) {
    let prime = true;
    for (let divisor = 2; divisor * divisor <= candidate; divisor += 1) {
      if (candidate % divisor === 0) {
        prime = false;
        break;
      }
    }
    if (prime) out.push(candidate);
  }
  return out;
}

const primes = firstPrimes(200);

/** @param {number} cardinal @returns {number} */
function T(cardinal) {
  return (primes[cardinal - 1] - 1) % 29;
}

/** @param {number} a @param {number} b @returns {number[]} */
function H(a, b) {
  return [mod29(a - b), mod29(a + b)];
}

/** @param {number[]} cardinals @returns {string} */
function spell(cardinals) {
  return cardinals.map(T).map((value) => corpus.translit[value]).join("");
}

/** @param {number} page @returns {string} */
function physicalPart(page) {
  assert.notEqual(page, 50);
  return parts[page <= 49 ? page : page - 1];
}

/** @param {string} word @returns {number[]} */
function gp(word) {
  const normalized = word
    .toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/[KQ]/g, "C")
    .replace(/V/g, "U")
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
    assert.ok(token, "unmapped GP spelling: " + normalized.slice(offset));
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}

/** @param {string} text @returns {number} */
function gp0(text) {
  return text
    .split(/[^A-Za-z]+/u)
    .filter(Boolean)
    .flatMap(gp)
    .reduce((sum, value) => sum + value, 0);
}

/**
 * Return printed rune words with rune-stream offsets.
 * Punctuation and separators do not increment the rune offset.
 *
 * @param {number} page
 * @returns {{start:number,len:number,values:number[]}[]}
 */
function wordsWithOffsets(page) {
  const out = [];
  let runeOffset = 0;
  let start = null;
  let values = [];

  function flush() {
    if (values.length === 0) return;
    out.push({ start, len: values.length, values });
    start = null;
    values = [];
  }

  for (const character of [...physicalPart(page)]) {
    const value = runeToValue.get(character);
    if (value !== undefined) {
      if (start === null) start = runeOffset;
      values.push(value);
      runeOffset += 1;
    } else {
      flush();
    }
  }
  flush();
  return out;
}

// Charge every adjacent printed-word pair fully inside every canonical red span.
const riseHits = [];
for (const pageInk of ink.pages) {
  const words = wordsWithOffsets(pageInk.page);
  const redSpans = pageInk.red_spans || [];
  for (let spanIndex = 0; spanIndex < redSpans.length; spanIndex += 1) {
    const span = redSpans[spanIndex];
    const inside = words.filter((word) =>
      word.start >= span.start &&
      word.start + word.len <= span.start + span.length
    );
    for (let pairIndex = 0; pairIndex + 1 < inside.length; pairIndex += 1) {
      const left = inside[pairIndex].len;
      const right = inside[pairIndex + 1].len;
      const serialized = [left, right, ...H(left, right)];
      if (spell(serialized) === "RISE") {
        riseHits.push({
          page: pageInk.page,
          spanIndex,
          pairIndex,
          lengths: [left, right],
          serialized
        });
      }
    }
  }
}

assert.deepEqual(riseHits, [
  {
    page: 23,
    spanIndex: 0,
    pairIndex: 2,
    lengths: [3, 5],
    serialized: [3, 5, 27, 8]
  },
  {
    page: 33,
    spanIndex: 1,
    pairIndex: 0,
    lengths: [3, 5],
    serialized: [3, 5, 27, 8]
  },
  {
    page: 40,
    spanIndex: 0,
    pairIndex: 0,
    lengths: [3, 5],
    serialized: [3, 5, 27, 8]
  }
]);

// P23 uniquely prefixes the same RISE packet with THE ONE.
const p23Span = ink.pages.find((page) => page.page === 23).red_spans[0];
const p23Words = wordsWithOffsets(23).filter((word) =>
  word.start >= p23Span.start &&
  word.start + word.len <= p23Span.start + p23Span.length
);
assert.deepEqual(p23Words.map((word) => word.len), [2, 6, 3, 5]);
assert.equal(spell([2, 6, ...H(2, 6)]), "THEONE");
assert.equal(spell([3, 5, ...H(3, 5)]), "RISE");

const rise = 5 - 3;
assert.equal(rise, 2);
assert.deepEqual(riseHits.map((hit) => [hit.page, hit.page + rise]), [
  [23, 25],
  [33, 35],
  [40, 42]
]);

// Authenticated 2016 signed-word typing of all three source/destination pairs.
const clear2016 = signed2016.split("-----BEGIN PGP SIGNATURE-----")[0];
const body2016 = clear2016.slice(clear2016.indexOf("Hello."));
const sourceWords = body2016
  .split(/[^A-Za-z0-9]+/u)
  .filter((token) => /^[A-Za-z]+$/u.test(token))
  .map((token) => token.toUpperCase());
assert.equal(sourceWords.length, 43);
assert.deepEqual(
  [23, 25, 33, 35, 40, 42].map((index) => [index, sourceWords[index]]),
  [
    [23, "ROAD"],
    [25, "THEIR"],
    [33, "WILL"],
    [35, "FOUND"],
    [40, "PATHS"],
    [42, "OPENPGP"]
  ]
);

// Independent pre-existing selector for the newly transferred p23->p25 destination.
assert.ok(screen2013.includes("Good luck."));
assert.equal(gp0("GOOD LUCK"), 66);
const table = base60.rows.flat();
const alphabet60 = base60.alphabet;
const table60 = table.map((token) =>
  60 * alphabet60.indexOf(token[0]) + alphabet60.indexOf(token[1])
);
assert.equal(table[66], "0P");
assert.equal(table60[66], 25);

// Reproduce the held-out p25 [K,g] source-object selector from the existing
// GOOD LUCK route, without using candidate plaintext.
const K = 2;
const g = 5;

/**
 * Parse printed words while retaining the continuous rune stream.
 *
 * @param {string} text
 * @returns {{words:{start:number,values:number[]}[],runes:number[]}}
 */
function parseWords(text) {
  const words = [];
  const runes = [];
  let current = [];
  let start = 0;

  function flush() {
    if (current.length === 0) return;
    words.push({ start, values: current });
    current = [];
  }

  for (const character of [...text]) {
    const value = runeToValue.get(character);
    if (value !== undefined) {
      if (current.length === 0) start = runes.length;
      current.push(value);
      runes.push(value);
    } else if (character === "-" || character === ".") {
      flush();
    }
  }
  flush();
  return { words, runes };
}

/**
 * @param {number[]} runes
 * @param {{start:number,values:number[]}} word
 * @param {"predecessor"|"successor"} side
 * @returns {number|null}
 */
function boundaryRune(runes, word, side) {
  const position = side === "predecessor"
    ? word.start - 1
    : word.start + word.values.length;
  return position >= 0 && position < runes.length ? runes[position] : null;
}

const kgHits = [];
let sideObjects = 0;
for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  const parsed = parseWords(physicalPart(page));
  for (let wordIndex = 0; wordIndex < parsed.words.length; wordIndex += 1) {
    const word = parsed.words[wordIndex];
    if (word.values.length !== 5) continue;
    for (const side of ["predecessor", "successor"]) {
      const boundary = boundaryRune(parsed.runes, word, side);
      if (boundary === null) continue;
      sideObjects += 1;
      const source = side === "predecessor"
        ? [boundary, ...word.values]
        : [...word.values, boundary];
      if (
        H(source[0], source.at(-1))[0] === K &&
        H(source[0], source.at(-1))[1] === g
      ) {
        kgHits.push({
          page,
          word: wordIndex + 1,
          start: word.start,
          side,
          source
        });
      }
    }
  }
}
assert.equal(sideObjects, 627);
assert.deepEqual(kgHits, [{
  page: 25,
  word: 30,
  start: 145,
  side: "predecessor",
  source: [18, 3, 20, 10, 11, 16]
}]);

// Keep the plaintext boundary explicit: p25 does not contain a complete word
// whose GP0 alone types the signed target THEIR.
const theirGp0 = gp("THEIR").reduce((sum, value) => sum + value, 0);
assert.equal(theirGp0, 34);
const p25CompleteGp0 = wordsWithOffsets(25)
  .map((word) => word.values.reduce((sum, value) => sum + value, 0));
assert.equal(p25CompleteGp0.filter((value) => value === theirGp0).length, 0);

console.log(JSON.stringify({
  status: "PASS",
  redRiseFamily: {
    count: riseHits.length,
    hits: riseHits,
    fixedDisplacement: rise
  },
  p23Instruction: "THE ONE RISE",
  destinations: [
    { from: 23, to: 25, source: "ROAD", destinationWord: "THEIR" },
    { from: 33, to: 35, source: "WILL", destinationWord: "FOUND" },
    { from: 40, to: 42, source: "PATHS", destinationWord: "OPENPGP" }
  ],
  independentP25Selector: {
    phrase: "GOOD LUCK",
    gp0: 66,
    p50Token: table[66],
    p50Value: table60[66],
    exactKgSideObjectHits: kgHits
  },
  p25PlaintextBoundary: {
    target: "THEIR",
    targetGp0: theirGp0,
    completeWordGp0Hits: 0
  },
  decision:
    "The fixed red-layout RISE packet occurs exactly three times, always as [3,5]+H -> RISE, so its established literal displacement is +2. P23 uniquely says THE ONE RISE; one +2 step lands on p25, which was independently selected beforehand by authenticated GOOD LUCK and contains the sole [K,g] side object in the 627-object family. Preserve p23->p25 as a source-constrained navigation handoff. Do not claim p25 plaintext THEIR without a separately selected reversible receiver."
}, null, 2));
