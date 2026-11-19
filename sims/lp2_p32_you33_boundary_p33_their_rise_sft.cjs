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

const primeTable = primes(130);
function T(cardinal) {
  assert.ok(cardinal >= 1);
  return mod29(primeTable[cardinal - 1] - 1);
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const parts = transcription.split(/^\s*%\s*$/m);
const runeToValue = new Map(corpus.runes.map((rune, value) => [rune, value]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({symbol, value}))
  .sort((a, b) => b.symbol.length - a.symbol.length);

function physicalPart(page) {
  assert.notEqual(page, 50);
  return parts[page <= 49 ? page : page - 1];
}

function pageValues(page) {
  const out = [];
  for (const character of [...physicalPart(page)]) {
    if (runeToValue.has(character)) out.push(runeToValue.get(character));
  }
  return out;
}

function canonicalWords(page) {
  const out = [];
  let current = [];
  let start = 0;
  let runeOffset = 0;
  function flush() {
    if (!current.length) return;
    out.push({
      ordinal: out.length + 1,
      start,
      end: runeOffset - 1,
      values: current.slice(),
      length: current.length,
    });
    current = [];
  }
  for (const character of [...physicalPart(page)]) {
    const value = runeToValue.get(character);
    if (value !== undefined) {
      if (!current.length) start = runeOffset;
      current.push(value);
      runeOffset += 1;
    } else if ((character === "-" || character === ".") && current.length) {
      flush();
    }
  }
  flush();
  return out;
}

function spanWords(page) {
  const normalized = physicalPart(page).replace(/\/\s*/gu, "");
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

function exactTwoWordRedSpans() {
  const out = [];
  for (const page of ink.pages) {
    if (page.page === 50) continue;
    const words = spanWords(page.page);
    for (const span of page.red_spans || []) {
      const selected = words.filter(
        (word) =>
          word.start >= span.start &&
          word.end <= span.start + span.length
      );
      const exact =
        selected.length === 2 &&
        selected[0].start === span.start &&
        selected[1].end === span.start + span.length;
      if (!exact) continue;
      out.push({
        page: page.page,
        start: span.start,
        pair: selected.map((word) => word.length),
      });
    }
  }
  return out;
}

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
assert.equal(sourceWords[19], "THEIR");
assert.equal(sourceWords[25], "THEIR");

const state = Object.freeze({
  p: 23,
  g: 5,
  a: 6,
  b: 15,
  A: 8,
  B: 19,
  K: 2,
  e: 3,
  q: 4,
});
const directState = new Set(Object.values(state));

const p32 = pageValues(32);
assert.equal(p32.length, 121);
assert.equal(Math.sqrt(p32.length), 11);
assert.equal(canonicalWords(32).length, 21);

const boundaryPairs = [];
for (let boundary = 11; boundary <= 110; boundary += 11) {
  boundaryPairs.push({
    boundary,
    pair: [p32[boundary - 1], p32[boundary]],
    bothDirectState:
      directState.has(p32[boundary - 1]) &&
      directState.has(p32[boundary]),
  });
}

assert.deepEqual(
  boundaryPairs.filter((row) => row.bothDirectState),
  [{boundary: 33, pair: [state.K, state.A], bothDirectState: true}]
);

const selected = boundaryPairs.find((row) => row.boundary === 33);
assert.deepEqual(selected.pair, [2, 8]);
assert.equal(p32[32], state.K);
assert.equal(p32[33], state.A);

const redSpans = exactTwoWordRedSpans();
assert.equal(redSpans.length, 8);

const pairMatches = [];
for (const boundary of boundaryPairs) {
  for (const span of redSpans) {
    if (
      boundary.pair[0] === span.pair[0] &&
      boundary.pair[1] === span.pair[1]
    ) {
      pairMatches.push({
        boundary: boundary.boundary,
        pair: boundary.pair,
        page: span.page,
        start: span.start,
      });
    }
  }
}
assert.equal(boundaryPairs.length * redSpans.length, 80);
assert.deepEqual(pairMatches, [{
  boundary: 33,
  pair: [2, 8],
  page: 33,
  start: 0,
}]);

const p33Upper = redSpans.find((row) => row.page === 33 && row.start === 0);
const p33Lower = redSpans.find((row) => row.page === 33 && row.start === 91);
assert.deepEqual(p33Upper.pair, [2, 8]);
assert.deepEqual(p33Lower.pair, [3, 5]);

const upperExtended = [...p33Upper.pair, ...H2inv(p33Upper.pair)];
const upperOutput = upperExtended.map(T);
assert.deepEqual(upperExtended, [2, 8, 5, 3]);
assert.deepEqual(upperOutput, gp("THEIR"));

const lowerExtended = [...p33Lower.pair, ...H2(p33Lower.pair)];
const lowerOutput = lowerExtended.map(T);
assert.deepEqual(lowerExtended, [3, 5, 27, 8]);
assert.deepEqual(lowerOutput, gp("RISE"));

const p33Words = canonicalWords(33);
const youReceiver = p33Words[28];
const willReceiver = p33Words[34];
assert.equal(youReceiver.ordinal, 29);
assert.equal(youReceiver.start, 116);
assert.deepEqual(youReceiver.values, [14, 17, 8]);
assert.equal(willReceiver.ordinal, 35);
assert.equal(willReceiver.start, 132);
assert.deepEqual(willReceiver.values, [3, 15, 17, 22]);

const p31Key = [17, 14, 7];
assert.deepEqual(
  youReceiver.values.map((value, index) =>
    mod29(value - p31Key[index])
  ),
  gp("YOU")
);

const willKey = [25, 5, 26, 2];
assert.deepEqual(
  willReceiver.values.map((value, index) =>
    mod29(value - willKey[index])
  ),
  gp("WILL")
);

const theirRise = sourceWords.lastIndexOf("THEIR") - sourceWords.indexOf("THEIR");
assert.equal(theirRise, state.a);
assert.equal(willReceiver.ordinal - youReceiver.ordinal, state.a);

const selectedRow = p32.slice(33, 44);
assert.equal(
  selectedRow.map((value) => corpus.translit[value]).join(""),
  "HOMEXWDSLFD"
);

console.log(JSON.stringify({
  status: "PASS",
  geometry: {
    p32RuneCount: p32.length,
    square: "11x11",
    missingOrdinal: 33,
    consumer: "ordered pair straddling the 33-rune row boundary",
    boundaryPair: selected.pair,
    stateTyping: ["K", "A"],
    oneBasedScalar: {offset: 32, value: p32[32], state: "K"},
    zeroBasedScalar: {offset: 33, value: p32[33], state: "A"},
  },
  controls: {
    internalBoundaries: boundaryPairs.length,
    exactTwoWordRedSpans: redSpans.length,
    pairComparisons: 80,
    directStateBoundaryHits: boundaryPairs.filter((row) => row.bothDirectState),
    redSpanPairMatches: pairMatches,
  },
  immediateHandoff: {
    page: 33,
    upperTitle: p33Upper.pair,
    upperDecoded: "THEIR",
    lowerTitle: p33Lower.pair,
    lowerDecoded: "RISE",
    theirRise,
  },
  heldOutSuffix: {
    p33YouWord: youReceiver.ordinal,
    p33WillWord: willReceiver.ordinal,
    displacement: willReceiver.ordinal - youReceiver.ordinal,
    expected: "a=6",
  },
  excludedFromSelector: {
    selectedRowTranslit: "HOMEXWDSLFD",
    note: "Known p32 lexical material was not used to choose boundary33.",
  },
  decision:
    "Resolve YOU33 as the ordered p32 11x11 boundary33 pair [K,A]=[2,8], which uniquely matches the immediately following p33 upper red title and hands off to established THEIR RISE. No modulo wrap is used.",
}, null, 2));
