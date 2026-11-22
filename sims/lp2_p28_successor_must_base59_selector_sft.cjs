"use strict";

/**
 * Source-exact WE -> MUST -> SHED radix-transition gate.
 *
 * Frozen upstream facts:
 *   1. Solved p57 whole-word GP0 selects zero-based p50 addresses.
 *   2. Conventional base60 gives CIRCUMFERENCES -> PARABLE -> FIND -> 28.
 *   3. Physical p28 word28 is source-selected by page number, exact center,
 *      and line6 DH geometry.
 *   4. Its peeled interior supplies generator35 for modulus FIND-prime151;
 *      p57 OUR/OWN prime sums are the two DH exponents.
 *
 * The new decision tested here is an ordered numeral-state transition:
 *   DH151 public B=66 -> p50[66]=WE under either radix;
 *   the clear text continues WE MUST SHED;
 *   MUST has phi(GP-prime)=60 and GP0-address51 -> base60 value59;
 *   SHED plus the unique unused digit f selects the drop-f base59 alphabet;
 *   only after that switch, DH151 shared K=87 -> SHED under base59.
 *
 * The earlier p28-successor GP1 observation remains as an auxiliary clue. It
 * is not required for the radix transition.
 *
 * This is a navigation/radix-selector test. It recovers no unknown plaintext.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const solved = JSON.parse(
  read("resources/external/relikd-solved-gp29-native-v1.json")
);
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const ink = JSON.parse(
  read("resources/liber-primus/lp2-ink-annotations.json")
);
const transcription = read("resources/liber-primus/lp2-transcription.txt");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const parts = transcription.split(/^\s*%\s*$/m);
const tokens = grid.pages.flatMap((page) => page.tokens);
const alphabet60 = grid.alphabet;
const alphabet59 = alphabet60.replace("f", "");

/** @param {string} token @param {string} alphabet */
function decode(token, alphabet) {
  const high = alphabet.indexOf(token[0]);
  const low = alphabet.indexOf(token[1]);
  assert.ok(high >= 0 && low >= 0);
  return high * alphabet.length + low;
}

/** @param {number[]} values */
function gp0(values) {
  return values.reduce((sum, value) => sum + value, 0);
}

/** @param {number[]} values */
function gp1(values) {
  return values.reduce((sum, value) => sum + value + 1, 0);
}

/** @param {number[]} values */
function gpPrime(values) {
  return values.reduce((sum, value) => sum + corpus.prime[value], 0);
}

/** @param {number[]} values */
function translit(values) {
  return values.map((value) => corpus.translit[value]).join("");
}

/** @param {string} text */
function runeWords(text) {
  const normalized = text.replace(/\/\s*/gu, "");
  return (normalized.match(/[\u16A0-\u16FF]+/gu) || []).map((word) =>
    [...word].map((rune) => {
      const value = runeIndex.get(rune);
      assert.notEqual(value, undefined);
      return value;
    })
  );
}

/** @param {number} page */
function physicalPart(page) {
  assert.notEqual(page, 50);
  return parts[page <= 49 ? page : page - 1];
}

/** @param {number} page */
function wordsOnPage(page) {
  return runeWords(physicalPart(page));
}

/** @param {number} page */
function wordSpans(page) {
  let offset = 0;
  return wordsOnPage(page).map((word, index) => {
    const start = offset;
    offset += word.length;
    return {
      number: index + 1,
      start,
      end: offset - 1,
      word,
    };
  });
}

/** @param {number} n */
function isPrime(n) {
  if (n < 2) return false;
  for (let divisor = 2; divisor * divisor <= n; divisor += 1) {
    if (n % divisor === 0) return false;
  }
  return true;
}

/** @param {number} n */
function primePi(n) {
  let count = 0;
  for (let value = 2; value <= n; value += 1) {
    if (isPrime(value)) count += 1;
  }
  return count;
}

/** @param {number} n */
function phi(n) {
  let result = n;
  let value = n;
  for (let factor = 2; factor * factor <= value; factor += 1) {
    if (value % factor !== 0) continue;
    while (value % factor === 0) value /= factor;
    result -= result / factor;
  }
  if (value > 1) result -= result / value;
  return result;
}

const p57 = solved.sections.find((section) => section.name === "p57_parable");
assert.ok(p57);
const p57Rows = runeWords(p57.source_text).map((word, index) => ({
  position: index + 1,
  text: translit(word),
  gp0: gp0(word),
  gp1: gp1(word),
  prime: gpPrime(word),
}));

/** @param {string} text */
function p57Word(text) {
  const row = p57Rows.find((candidate) => candidate.text === text);
  assert.ok(row);
  return row;
}

const we = p57Word("WE");
const must = p57Word("MUST");
const shed = p57Word("SHED");
const our = p57Word("OUR");
const own = p57Word("OWN");
const parable = p57Word("PARABLE");
const find = p57Word("FIND");
const circumferences = p57Word("CIRCUMFERENCES");
const surface = p57Word("SURFACE");
const within = p57Word("WITHIN");
const emerge = p57Word("EMERGE");

assert.deepEqual(
  {
    must: must.gp0,
    shed: shed.gp0,
    parable: parable.gp0,
    find: find.gp0,
    circumferences: circumferences.gp0,
    surface: surface.gp0,
    within: within.gp0,
    emerge: emerge.gp0,
  },
  {
    must: 51,
    shed: 64,
    parable: 120,
    find: 42,
    circumferences: 131,
    surface: 67,
    within: 38,
    emerge: 83,
  }
);
assert.equal(p57Rows[we.position].text, "MUST");
assert.equal(p57Rows[must.position].text, "SHED");

// The route reaches p28 without using base59.
assert.equal(tokens[circumferences.gp0], "20");
assert.equal(decode(tokens[circumferences.gp0], alphabet60), parable.gp0);
assert.equal(tokens[parable.gp0], "0g");
assert.equal(decode(tokens[parable.gp0], alphabet60), find.gp0);
assert.equal(tokens[find.gp0], "0S");
assert.equal(decode(tokens[find.gp0], alphabet60), 28);

// P28 word28 and its literal next complete word.
const p28Spans = wordSpans(28);
const selected = p28Spans[27];
const next = p28Spans[28];
assert.deepEqual(selected.word, [28, 24, 10, 1, 20]);
assert.deepEqual(next.word, [24, 25]);
assert.equal(selected.end + 1, next.start);
assert.equal(next.number, 29);
assert.equal(next.word.length, 2);
assert.equal(next.word[1], next.word[0] + 1);
assert.equal(gp1(next.word), must.gp0);

// The selected word is the final word of line6 and the successor starts line7.
const p28Lines = physicalPart(28)
  .trim()
  .split("/")
  .filter((line) => line.trim().length > 0);
let lineOffset = 0;
const lineSpans = p28Lines.map((line, index) => {
  const length = [...line].filter((rune) => runeIndex.has(rune)).length;
  const row = {
    number: index + 1,
    start: lineOffset,
    end: lineOffset + length - 1,
    length,
  };
  lineOffset += length;
  return row;
});
assert.equal(lineSpans[5].end, selected.end);
assert.equal(lineSpans[6].start, next.start);

// The same p28 geometry gives the DH shared value K=2, equal to successor length.
const p = lineSpans[5].length;
const g = selected.word.length;
const a = 6;
const B = selected.start - lineSpans[5].start + 1;
/** @param {number} base @param {number} exponent @param {number} modulus */
function powMod(base, exponent, modulus) {
  let result = 1;
  let factor = base % modulus;
  let power = exponent;
  while (power > 0) {
    if (power % 2 === 1) result = (result * factor) % modulus;
    factor = (factor * factor) % modulus;
    power = Math.floor(power / 2);
  }
  return result;
}
const K = powMod(B, a, p);
let b = null;
for (let exponent = 1; exponent < p; exponent += 1) {
  if (powMod(g, exponent, p) === B) {
    assert.equal(b, null);
    b = exponent;
  }
}
assert.equal(b, 15);
const A = powMod(g, a, p);
assert.deepEqual(
  { p, g, a, b, A, B, K },
  { p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2 }
);
assert.equal(next.word.length, K);

// The independent DH23 state reaches the same WE address as DH151.
assert.equal(grid.pages.every((page) => page.cols === A), true);
const dh23WeAddress = A * A + K;
assert.equal(dh23WeAddress, 66);
assert.equal(decode(tokens[dh23WeAddress], alphabet60), we.gp0);
assert.equal(decode(tokens[dh23WeAddress], alphabet59), we.gp0);

// P28's peeled interior + FIND/OUR/OWN select a second DH instance.
const peeled = selected.word.slice(1, -1);
assert.deepEqual(peeled, [24, 10, 1]);
const generator151 = gp0(peeled);
const modulus151 = find.prime;
const exponentOur = our.prime;
const exponentOwn = own.prime;
assert.deepEqual(
  { generator151, modulus151, exponentOur, exponentOwn },
  { generator151: 35, modulus151: 151, exponentOur: 21, exponentOwn: 55 }
);
const publicOwn151 = powMod(generator151, exponentOwn, modulus151);
const shared151 = powMod(
  generator151,
  exponentOur * exponentOwn,
  modulus151
);
assert.deepEqual(
  { publicOwn151, shared151 },
  { publicOwn151: 66, shared151: 87 }
);
assert.equal(publicOwn151, dh23WeAddress);
assert.equal(tokens[publicOwn151], "0P");
assert.equal(decode(tokens[publicOwn151], alphabet60), we.gp0);
assert.equal(decode(tokens[publicOwn151], alphabet59), we.gp0);

// WE lands before the literal clear-text instruction MUST SHED.
assert.equal(we.position, 9);
assert.equal(must.position, 10);
assert.equal(shed.position, 11);

// MUST independently names both sides of the 60 -> 59 transition.
assert.equal(must.prime, 186);
assert.equal(phi(must.prime), alphabet60.length);

// MUST itself produces literal 59 before any radix change.
assert.equal(tokens[must.gp0], "0x");
assert.equal(decode(tokens[must.gp0], alphabet60), 59);
const distinctP57Addresses = [
  ...new Map(p57Rows.map((row) => [row.gp0, row])).values(),
];
assert.deepEqual(
  distinctP57Addresses
    .filter((row) => decode(tokens[row.gp0], alphabet60) === 59)
    .map((row) => row.text),
  ["MUST"]
);

// The 60-symbol table alphabet has exactly one globally unused digit.
assert.equal(alphabet60.length, 60);
assert.equal(alphabet59.length, 59);
const absentDigits = [...alphabet60].filter(
  (digit) => !tokens.some((token) => token.includes(digit))
);
assert.deepEqual(absentDigits, ["f"]);
assert.ok(
  tokens.every((token) =>
    [...token].every((digit) => alphabet59.includes(digit))
  )
);

// The frozen DH151 shared value becomes SHED only after the radix switch.
assert.equal(tokens[shared151], "15");
assert.equal(decode(tokens[shared151], alphabet59), shed.gp0);
assert.notEqual(decode(tokens[shared151], alphabet60), shed.gp0);

// Post-SHED base59 consequences.
assert.equal(decode(tokens[shed.gp0], alphabet59), parable.gp0);
assert.equal(decode(tokens[parable.gp0], alphabet59), 41);
assert.equal(primePi(41), 13);
assert.equal(decode(tokens[41], alphabet59), emerge.gp0);

// Family control over page-numbered successor words.
const pageSuccessors = [];
for (let page = 1; page <= 55; page += 1) {
  if (page === 50) continue;
  const words = wordsOnPage(page);
  if (words.length <= page) continue;
  const successor = words[page];
  pageSuccessors.push({
    page,
    values: successor,
    gp1: gp1(successor),
    forwardAdjacent:
      successor.length === 2 && successor[1] === successor[0] + 1,
  });
}
assert.equal(pageSuccessors.length, 48);
assert.deepEqual(
  pageSuccessors.filter((row) => row.forwardAdjacent).map((row) => row.page),
  [28]
);
assert.deepEqual(
  pageSuccessors.filter((row) => row.gp1 === must.gp0).map((row) => row.page),
  [28]
);

// Independent p27 red-heading successor under the same GP1 receiver.
const p27Ink = ink.pages.find((page) => page.page === 27);
assert.ok(p27Ink);
const p27Red = p27Ink.red_spans.find(
  (span) => span.start === 0 && span.length === 19
);
assert.ok(p27Red);
const p27Spans = wordSpans(27);
const p27End = p27Red.start + p27Red.length - 1;
const p27EndWord = p27Spans.findIndex((row) => row.end === p27End);
assert.equal(p27EndWord, 2);
const p27Next = p27Spans[p27EndWord + 1];
assert.deepEqual(p27Next.word, [9, 8, 6, 1, 27, 8, 1]);
assert.equal(gp1(p27Next.word), surface.gp0);
assert.equal(tokens[surface.gp0], "3C");
assert.equal(decode(tokens[surface.gp0], alphabet59), 189);
assert.equal(decode(tokens[189], alphabet59), 189);

// Red-span successor family: only p3 and independently selected p27 hit p57 GP0.
const p57Targets = new Set(p57Rows.map((row) => row.gp0));
const redSuccessorHits = [];
let redBoundarySuccessors = 0;
for (const page of ink.pages) {
  if (page.page === 50) continue;
  const spans = wordSpans(page.page);
  for (const red of page.red_spans || []) {
    const end = red.start + red.length - 1;
    const index = spans.findIndex((row) => row.end === end);
    if (index < 0 || index + 1 >= spans.length) continue;
    redBoundarySuccessors += 1;
    const successor = spans[index + 1];
    const value = gp1(successor.word);
    if (p57Targets.has(value)) {
      redSuccessorHits.push({
        page: page.page,
        redStart: red.start,
        value,
      });
    }
  }
}
assert.equal(redBoundarySuccessors, 16);
assert.deepEqual(redSuccessorHits, [
  { page: 3, redStart: 0, value: find.gp0 },
  { page: 27, redStart: 0, value: surface.gp0 },
]);

// Third source-selected foothold: DJU from the repeated p27/p55 pair.
const dju = p27Spans.find(
  (row) => row.start === 28 && translit(row.word) === "DJU"
);
assert.ok(dju);
assert.equal(gp1(dju.word), within.gp0);
assert.equal(decode(tokens[within.gp0], alphabet59), circumferences.gp0);

console.log(JSON.stringify({
  status:
    "PASS: cross-DH WE -> MUST -> 60/59 -> SHED gives an ordered drop-f base59 transition",
  preSwitchBase60: {
    route: "CIRCUMFERENCES131 -> PARABLE120 -> FIND42 -> 28",
    dh23: { p, g, a, b, A, B, K, weAddress: dh23WeAddress },
    dh151: {
      p: modulus151,
      g: generator151,
      a: exponentOur,
      b: exponentOwn,
      publicB: publicOwn151,
      shared: shared151,
    },
    publicBTarget: "WE",
    weGp0: we.gp0,
    mustPhiPrime: phi(must.prime),
    mustAddress: must.gp0,
    mustToken: tokens[must.gp0],
    mustValue60: decode(tokens[must.gp0], alphabet60),
    clearWords: ["WE", "MUST", "SHED"],
  },
  p28Successor: {
    selectedWord: selected.number,
    selectedEnd: selected.end,
    nextWord: next.number,
    nextStart: next.start,
    values: next.word,
    translit: translit(next.word),
    length: next.word.length,
    dhShared: K,
    gp1: gp1(next.word),
    target: "MUST",
    uniqueForwardAdjacentPageNumberedSuccessor: 28,
    uniqueMustGp1PageNumberedSuccessor: 28,
  },
  radixSelector: {
    sourceWord: "MUST",
    mustGpPrime: must.prime,
    mustPhiPrime: phi(must.prime),
    alphabet60,
    mustGp0: must.gp0,
    valueFromMust: 59,
    instruction: "SHED",
    absentDigits,
    alphabet59,
    dh151SharedToken: tokens[shared151],
    dh151SharedBase60: decode(tokens[shared151], alphabet60),
    dh151SharedBase59: decode(tokens[shared151], alphabet59),
    dh151SharedTarget: "SHED",
  },
  postSwitchBase59: {
    shedToParable: decode(tokens[shed.gp0], alphabet59),
    parableToPrime13: decode(tokens[parable.gp0], alphabet59),
    prime13ToEmerge: decode(tokens[41], alphabet59),
    p27NextGp1: gp1(p27Next.word),
    p27NextTarget: "SURFACE",
    surfaceToDhEndpoint: decode(tokens[surface.gp0], alphabet59),
    djuGp1: gp1(dju.word),
    djuTarget: "WITHIN",
    withinToCircumferences: decode(tokens[within.gp0], alphabet59),
  },
  controls: {
    pageNumberedSuccessors: pageSuccessors.length,
    redBoundarySuccessors,
    redSuccessorHits,
  },
  interpretation:
    "The route can remain conventional base60 through FIND->28. The source-selected p28 word supplies DH151 g=35 with FIND-prime151 and OUR/OWN exponents21/55, producing publicB66 and shared87. PublicB66 is also the independent DH23 coordinate (A,K)=(8,2) and p50[66]=WE under both radices. Clear p57 then reads WE MUST SHED. MUST has phi(GP-prime186)=60, while GP0(MUST)=51 addresses token0x=59 under base60; SHED plus the sole unused table digit f deterministically selects the drop-f base59 alphabet. Only after that switch does shared87 decode to GP0(SHED)=64. The earlier p28-successor GP1=MUST observation is auxiliary and no longer required. No unknown plaintext is recovered.",
}, null, 2));
