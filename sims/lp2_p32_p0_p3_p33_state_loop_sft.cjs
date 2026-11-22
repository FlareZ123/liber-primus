"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");

function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

function mod29(value) {
  return ((value % 29) + 29) % 29;
}

function powMod(base, exponent, modulus) {
  let result = 1;
  let x = base % modulus;
  let e = exponent;
  while (e > 0) {
    if (e & 1) result = (result * x) % modulus;
    x = (x * x) % modulus;
    e >>= 1;
  }
  return result;
}

function discreteLog(base, target, modulus) {
  let value = 1;
  for (let exponent = 0; exponent < modulus - 1; exponent += 1) {
    if (value === target) return exponent;
    value = (value * base) % modulus;
  }
  return null;
}

function primeOrdinal(value) {
  let ordinal = 0;
  for (let n = 2; n <= value; n += 1) {
    let prime = true;
    for (let d = 2; d * d <= n; d += 1) {
      if (n % d === 0) {
        prime = false;
        break;
      }
    }
    if (prime) {
      ordinal += 1;
      if (n === value) return ordinal;
    }
  }
  return null;
}

function primes(count) {
  const out = [];
  for (let n = 2; out.length < count; n += 1) {
    let prime = true;
    for (let d = 2; d * d <= n; d += 1) {
      if (n % d === 0) {
        prime = false;
        break;
      }
    }
    if (prime) out.push(n);
  }
  return out;
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const p0Ink = JSON.parse(
  read("resources/liber-primus/lp2-p0-physical-ink-override.json")
);
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const parts = transcription.split(/^\s*%\s*$/m);
const runeToValue = new Map(corpus.runes.map((rune, value) => [rune, value]));
const gpPrime = corpus.prime;
const gpTokens = corpus.translit
  .map((symbol, value) => ({symbol, value}))
  .sort((a, b) => b.symbol.length - a.symbol.length);
const primeTable = primes(180);

const state = Object.freeze({
  K: 2,
  e: 3,
  q: 4,
  g: 5,
  a: 6,
  A: 8,
  b: 15,
  B: 19,
  p: 23,
});

function gp(word) {
  const normalized = word
    .toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");
  const out = [];
  for (let index = 0; index < normalized.length;) {
    if (normalized.startsWith("ING", index)) {
      out.push(21);
      index += 3;
      continue;
    }
    if (normalized.startsWith("IO", index)) {
      out.push(27);
      index += 2;
      continue;
    }
    const token = gpTokens.find((row) =>
      normalized.startsWith(row.symbol, index)
    );
    assert.ok(token, "unmapped " + normalized.slice(index));
    out.push(token.value);
    index += token.symbol.length;
  }
  return out;
}

function pageValues(page) {
  assert.notEqual(page, 50);
  const segment = page <= 49 ? page : page - 1;
  const out = [];
  for (const character of [...parts[segment]]) {
    const value = runeToValue.get(character);
    if (value !== undefined) out.push(value);
  }
  return out;
}

function spanWords(page) {
  const segment = page <= 49 ? page : page - 1;
  const normalized = parts[segment].replace(/\/\s*/gu, "");
  let offset = 0;
  return (normalized.match(/[\u16A0-\u16FF]+/gu) || []).map((spelling) => {
    const values = [...spelling].map((rune) => runeToValue.get(rune));
    const row = {
      start: offset,
      end: offset + values.length,
      length: values.length,
      values,
    };
    offset = row.end;
    return row;
  });
}

let canonicalPageMap = null;
function buildCanonicalPageMap() {
  if (canonicalPageMap) return canonicalPageMap;

  const unknownSegments = parts.slice(0, 55);
  const pages = unknownSegments.map((text, segment) => ({
    page: segment >= 50 ? segment + 1 : segment,
    words: [],
    offset: 0,
  }));

  let current = [];
  let startSegment = 0;
  let endSegment = 0;
  let startOffset = 0;

  function flush() {
    if (!current.length) return;
    if (startSegment === endSegment) {
      const page = pages[startSegment];
      page.words.push({
        ordinal: page.words.length + 1,
        start: startOffset,
        end: startOffset + current.length - 1,
        values: current.slice(),
        length: current.length,
      });
    }
    current = [];
  }

  for (let segment = 0; segment < unknownSegments.length; segment += 1) {
    for (const character of [...unknownSegments[segment]]) {
      const value = runeToValue.get(character);
      if (value !== undefined) {
        if (!current.length) {
          startSegment = segment;
          startOffset = pages[segment].offset;
        }
        endSegment = segment;
        current.push(value);
        pages[segment].offset += 1;
      } else if (character === "/" || /\s/u.test(character)) {
        // Printed line/page wrapping may continue a word.
      } else {
        flush();
      }
    }
  }
  flush();

  canonicalPageMap = new Map(pages.map((page) => [page.page, page.words]));
  return canonicalPageMap;
}

function canonicalWords(page) {
  return buildCanonicalPageMap().get(page) || [];
}

function H2(pair) {
  return [mod29(pair[0] - pair[1]), mod29(pair[0] + pair[1])];
}

function H2inv(pair) {
  const inv2 = 15;
  return [
    mod29((pair[0] + pair[1]) * inv2),
    mod29((pair[1] - pair[0]) * inv2),
  ];
}

function T(cardinal) {
  return mod29(primeTable[cardinal - 1] - 1);
}

const sourceWords = signed2016
  .slice(
    signed2016.indexOf("Hello."),
    signed2016.indexOf("-----BEGIN PGP SIGNATURE-----")
  )
  .replace(/\b7A35090F\b/g, "")
  .match(/[A-Za-z]+/g)
  .map((word) => word.toUpperCase());

assert.equal(sourceWords.length, 43);
assert.equal(sourceWords[32], "YOU");
assert.equal(sourceWords[33], "WILL");

// p32 -> [K,A] -> F0/HOME
const p32 = pageValues(32);
assert.equal(p32.length, 121);
assert.deepEqual([p32[32], p32[33]], [state.K, state.A]);
assert.equal(p32[state.K * 11 + state.A], 0);
assert.deepEqual(p32.slice(33, 37), [8, 3, 19, 18]);
assert.equal(
  p32.slice(33, 37).map((value) => corpus.translit[value]).join(""),
  "HOME"
);

// p0 red title -> logs [K,A] -> shared e
const p0Words = spanWords(0);
assert.deepEqual(
  p0Ink.physical_zero_based.red_words.map((word) => [word.start, word.length]),
  [[0, 8], [8, 5]]
);
assert.deepEqual(p0Words[0].values, p0Ink.physical_zero_based.red_words[0].gp_indices);
assert.deepEqual(p0Words[1].values, p0Ink.physical_zero_based.red_words[1].gp_indices);
const p0PrimeSums = [p0Words[0], p0Words[1]].map((word) =>
  word.values.reduce((sum, value) => sum + gpPrime[value], 0)
);
assert.deepEqual(p0PrimeSums, [347, 315]);
const publicShares = p0PrimeSums.map((sum) => sum % state.p);
assert.deepEqual(publicShares, [2, 16]);
const exponents = publicShares.map((share) =>
  discreteLog(state.g, share, state.p)
);
assert.deepEqual(exponents, [state.K, state.A]);
const shared = powMod(publicShares[1], exponents[0], state.p);
assert.equal(shared, state.e);

// e=3 selects p3, then its unique red length-e span.
assert.equal(shared, 3);
const p3Annotation = ink.pages.find((page) => page.page === shared);
assert.ok(p3Annotation);
const p3Spans = p3Annotation.red_spans || [];
assert.deepEqual(p3Spans.map((span) => span.length), [16, 3]);
const p3Selected = p3Spans.find((span) => span.length === shared);
assert.ok(p3Selected);
assert.equal(p3Selected.start, 119);
const p3 = pageValues(3);
const p3Triad = p3.slice(p3Selected.start, p3Selected.start + p3Selected.length);
assert.deepEqual(p3Triad, [13, 23, 2]);
const p3PrimeSum = p3Triad.reduce(
  (sum, value) => sum + gpPrime[value],
  0
);
assert.equal(p3PrimeSum, 137);
const nextPage = primeOrdinal(p3PrimeSum);
assert.equal(nextPage, 33);
assert.equal(sourceWords[nextPage], "WILL");

const redLength3 = [];
for (const page of ink.pages) {
  for (const span of page.red_spans || []) {
    if (span.length === 3) {
      redLength3.push({page: page.page, start: span.start});
    }
  }
}
assert.deepEqual(redLength3, [
  {page: 3, start: 119},
  {page: 39, start: 119},
]);

assert.deepEqual(
  p3Annotation.large_punctuation,
  [[16,13,"red"], [119,13,"red"], [122,13,"red"]]
);

// p33 re-emits [K,A] and THEIR RISE.
const p33Annotation = ink.pages.find((page) => page.page === nextPage);
assert.ok(p33Annotation);
const p33WordsForSpans = spanWords(33);
const exactTwoWord = [];
for (const span of p33Annotation.red_spans || []) {
  const selected = p33WordsForSpans.filter(
    (word) =>
      word.start >= span.start &&
      word.end <= span.start + span.length
  );
  if (
    selected.length === 2 &&
    selected[0].start === span.start &&
    selected[1].end === span.start + span.length
  ) {
    exactTwoWord.push({
      start: span.start,
      pair: selected.map((word) => word.length),
    });
  }
}
assert.deepEqual(exactTwoWord, [
  {start: 0, pair: [2, 8]},
  {start: 91, pair: [3, 5]},
]);

const upperExtended = [...exactTwoWord[0].pair, ...H2inv(exactTwoWord[0].pair)];
const lowerExtended = [...exactTwoWord[1].pair, ...H2(exactTwoWord[1].pair)];
assert.deepEqual(upperExtended.map(T), gp("THEIR"));
assert.deepEqual(lowerExtended.map(T), gp("RISE"));

const theirRise =
  sourceWords.lastIndexOf("THEIR") - sourceWords.indexOf("THEIR");
assert.equal(theirRise, state.a);

const p33Words = canonicalWords(33);
const youReceiver = p33Words[28];
const willReceiver = p33Words[34];
assert.equal(youReceiver.ordinal, 29);
assert.equal(willReceiver.ordinal, 35);
assert.equal(willReceiver.ordinal - youReceiver.ordinal, theirRise);
assert.deepEqual(
  youReceiver.values.map((value, index) =>
    mod29(value - [17,14,7][index])
  ),
  gp("YOU")
);
assert.deepEqual(
  willReceiver.values.map((value, index) =>
    mod29(value - [25,5,26,2][index])
  ),
  gp("WILL")
);

console.log(JSON.stringify({
  status: "PASS",
  route: [
    {page:32, object:"boundary33", output:[2,8], type:"[K,A]"},
    {page:32, object:"coordinate(2,8)", output:0, checksum:"HOME"},
    {page:0, object:"red title", logs:exponents, shared},
    {page:3, object:"red length-3 triad", values:p3Triad, primeSum:p3PrimeSum, primeOrdinal:nextPage},
    {page:33, object:"upper/lower red titles", upper:[2,8], lower:[3,5], decoded:["THEIR","RISE"]},
  ],
  controls: {
    redLength3,
    p3Punctuation:p3Annotation.large_punctuation,
  },
  suffix: {
    theirRise,
    p33YouWord:youReceiver.ordinal,
    p33WillWord:willReceiver.ordinal,
    displacement:willReceiver.ordinal-youReceiver.ordinal,
  },
  decision:
    "Strong navigation/state loop: p32 [K,A] -> p0 logs [K,A] -> shared e=3 -> p3 red length3 -> prime#33 -> p33 [K,A] THEIR RISE -> +a to WILL. Previously rejected cipher transfers remain rejected.",
}, null, 2));
