"use strict";

/**
 * SFT: solved p57 MUST SHED -> p50 inverse coordinates -> LEAD
 * -> READ OUT p0 packet -> derived (A,K) -> THE -> LEAD key -> ROAD.
 *
 * This is a conditional unknown-p0 plaintext recovery. It does NOT use
 * plaintext THE or ROAD to select either key. The remaining upstream premise
 * is the candidate READ OUT split-word receiver semantics:
 *   GP0(READ)=55 -> p50[55]=80
 *   GP0(OUT)=20  -> p50[20]=102
 * interpreted as p0 rune offsets under conventional base60.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const solved = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const runeSet = new Set(corpus.runes);
const parts = transcription.split(/^\s*%\s*$/m);
const gpTokens = corpus.translit
  .map((symbol, value) => ({symbol, value}))
  .sort((a, b) => b.symbol.length - a.symbol.length);

/** @param {number} page @returns {string} */
function physicalPart(page) {
  assert.notEqual(page, 50);
  return parts[page <= 49 ? page : page - 1];
}

/** @param {string} word @returns {number[]} */
function gp(word) {
  const normalized = word.toUpperCase()
    .replace(/K/g, "C")
    .replace(/V/g, "U")
    .replace(/Q/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");
  const out = [];

  for (let i = 0; i < normalized.length;) {
    const token = gpTokens.find((item) =>
      normalized.startsWith(item.symbol, i)
    );
    assert.ok(token, "unmapped GP spelling at " + word + ":" + i);
    out.push(token.value);
    i += token.symbol.length;
  }

  return out;
}

/**
 * @param {string} text
 * @returns {Array<{start:number,end:number,values:number[]}>}
 */
function pageWords(text) {
  const words = [];
  let current = [];
  let start = 0;
  let offset = 0;

  const flush = () => {
    if (!current.length) return;
    words.push({start, end: offset - 1, values: current});
    current = [];
  };

  for (const char of [...text]) {
    if (runeSet.has(char)) {
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

/** @param {number} left @param {number} right @returns {[number,number]} */
function H(left, right) {
  return [((left - right) % 29 + 29) % 29, (left + right) % 29];
}

/** @param {number[]} word @returns {number[]} */
function shell(word) {
  const out = [];
  for (
    let left = 0, right = word.length - 1;
    left < right;
    left += 1, right -= 1
  ) {
    out.push(...H(word[left], word[right]));
  }
  if (word.length % 2 === 1) {
    out.push(word[Math.floor(word.length / 2)]);
  }
  return out;
}

/** @param {number[]} values @returns {number} */
function gp0(values) {
  return values.reduce((sum, value) => sum + value, 0);
}

/** @param {number[]} values @returns {number} */
function gp1(values) {
  return values.reduce((sum, value) => sum + value + 1, 0);
}

/** @param {number[]} values @returns {number} */
function gpPrime(values) {
  return values.reduce((sum, value) => sum + corpus.prime[value], 0);
}

/** @param {number[]} values @returns {string} */
function spell(values) {
  return values.map((value) => {
    if (value === 21) return "ING";
    if (value === 27) return "IO";
    return corpus.translit[value];
  }).join("");
}

/** @param {string} token @param {string} alphabet @returns {number} */
function numeralValue(token, alphabet) {
  const high = alphabet.indexOf(token[0]);
  const low = alphabet.indexOf(token[1]);
  assert.ok(high >= 0 && low >= 0);
  return high * alphabet.length + low;
}

const tableTokens = grid.pages.flatMap((page) => page.tokens);
const table60 = grid.pages.flatMap((page) => page.bytes);
const alphabet60 = grid.alphabet;
const alphabet59 = alphabet60.replace("f", "");

/**
 * Invert one exact p50 numeric value to a unique row/column coordinate.
 * @param {number} value
 * @param {"base60"|"base59"} radix
 * @returns {null|{index:number,row:number,col:number,pair:string,token:string}}
 */
function uniqueCoordinate(value, radix) {
  const alphabet = radix === "base60" ? alphabet60 : alphabet59;
  const hits = [];

  for (let index = 0; index < tableTokens.length; index += 1) {
    if (numeralValue(tableTokens[index], alphabet) === value) hits.push(index);
  }

  if (hits.length !== 1) return null;
  const index = hits[0];
  const row = Math.floor(index / 8) + 1;
  const col = index % 8 + 1;
  if (row > 26 || col > 26) return null;

  return {
    index,
    row,
    col,
    pair:
      String.fromCharCode(64 + row) +
      String.fromCharCode(64 + col),
    token: tableTokens[index],
  };
}

// Frozen four-letter English lexicon used only to decide whether an inverse
// coordinate string is an ordinary word. The family is charged exhaustively.
const dictionaryWords = read("resources/control/english_wordfreq_textblob.txt")
  .toLowerCase()
  .split(/\s+/u)
  .filter(Boolean);
for (const relative of [
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/shakespeare_first300k.txt",
  "resources/control/emerson_essays_2944.txt",
  "resources/liber-primus/lp1-plaintext-reference.txt",
]) {
  dictionaryWords.push(...(read(relative).toLowerCase().match(/[a-z]+/gu) || []));
}
const lexicon4 = new Set(
  dictionaryWords.filter((word) => /^[a-z]{4}$/u.test(word))
);

// Solved p57 gives the source words. Search all adjacent word pairs under all
// four base60/base59 state pairs and both coordinate orders. GP-prime is
// frozen here because the independently established MUST -> SHED transition
// is itself defined by GP-prime(MUST)=186 and the post-switch SHED state.
const p57Section = solved.sections.find((section) => /p57/i.test(section.name));
assert.ok(p57Section);
const p57Words = (p57Section.source_text.match(/[\u16A0-\u16FF]+/gu) || [])
  .map((word) => [...word].map((rune) => runeIndex.get(rune)));
assert.equal(p57Words.length, 20);

const englishCoordinateHits = [];
let typedCoordinateStrings = 0;

for (let index = 0; index < p57Words.length - 1; index += 1) {
  const first = {
    position: index + 1,
    word: spell(p57Words[index]),
    value: gpPrime(p57Words[index]),
  };
  const second = {
    position: index + 2,
    word: spell(p57Words[index + 1]),
    value: gpPrime(p57Words[index + 1]),
  };

  for (const firstRadix of ["base60", "base59"]) {
    for (const secondRadix of ["base60", "base59"]) {
      const firstCoord = uniqueCoordinate(first.value, firstRadix);
      const secondCoord = uniqueCoordinate(second.value, secondRadix);
      if (firstCoord === null || secondCoord === null) continue;

      for (const order of ["forward", "reverse"]) {
        typedCoordinateStrings += 1;
        const text = order === "forward"
          ? firstCoord.pair + secondCoord.pair
          : secondCoord.pair + firstCoord.pair;

        if (lexicon4.has(text.toLowerCase())) {
          englishCoordinateHits.push({
            words: [first, second],
            radices: [firstRadix, secondRadix],
            coordinates: [firstCoord, secondCoord],
            order,
            text,
          });
        }
      }
    }
  }
}

assert.equal(typedCoordinateStrings, 12);
assert.deepEqual(englishCoordinateHits, [{
  words: [
    {position: 10, word: "MUST", value: 186},
    {position: 11, word: "SHED", value: 232},
  ],
  radices: ["base60", "base59"],
  coordinates: [
    {index: 3, row: 1, col: 4, pair: "AD", token: "36"},
    {index: 92, row: 12, col: 5, pair: "LE", token: "3u"},
  ],
  order: "reverse",
  text: "LEAD",
}]);

// This derives LEAD without a ROAD plaintext assumption.
const lead = englishCoordinateHits[0].text;
assert.equal(lead, "LEAD");
const leadA1 = [...lead].map((char) => char.charCodeAt(0) - 64);
assert.deepEqual(leadA1, [12, 5, 1, 4]);

// The forward coordinate order is the non-word ADLE. Its GP0 route returns
// to p28; the English reverse order self-points to the end of the later ROAD
// word. These are checks, not selection predicates in the family above.
const adle = "ADLE";
assert.deepEqual(gp(adle), [24, 23, 20, 18]);
assert.equal(gp0(gp(adle)), 85);
assert.equal(table60[85], 28);
assert.deepEqual(gp(lead), [20, 28, 23]);
assert.equal(gp0(gp(lead)), 71);
assert.equal(table60[71], 108);

// Reconstruct the candidate READ OUT receiver. This remains the explicit
// upstream conditional premise of the plaintext recovery.
const READ = gp("READ");
const OUT = gp("OUT");
assert.equal(gp0(READ), 55);
assert.equal(gp0(OUT), 20);
assert.equal(table60[55], 80);
assert.equal(table60[20], 102);

const p0Words = pageWords(physicalPart(0));
const receiver = p0Words.filter((word) =>
  word.start >= 80 && word.end <= 102
);
assert.equal(receiver.length, 4);
const packet = receiver.flatMap((word) => shell(word.values));
assert.equal(packet.length, 23);

const dh = {p: 23, g: 5, a: 6, A: 8, B: 19, b: 15, K: 2};

// Literal MUST SHED on LEAD removes its one-letter circumference. LEAD is
// the sole word in the fixed 12-key A1 family whose inner bigram is one
// dedicated native GP rune; the stronger 12-key family is verified by the
// companion ROAD/LEAD coordinate SFT.
const inner = lead.slice(1, -1);
assert.equal(inner, "EA");
const innerRune = corpus.translit.findIndex((symbol) => symbol === inner);
assert.equal(innerRune, 28);
assert.equal(corpus.prime[innerRune], 109);

// EA is the unique prime-self-indexed value inside this p-length packet.
const selfIndexed = packet
  .map((value, index) => ({
    position: index + 1,
    value,
    prime: corpus.prime[value],
    modP: corpus.prime[value] % dh.p,
  }))
  .filter((row) => row.position === row.modP);
assert.deepEqual(selfIndexed, [{
  position: 17,
  value: 28,
  prime: 109,
  modP: 17,
}]);

// Its immediate circumference supplies the ordered DH selector (A,K).
const eaPosition = selfIndexed[0].position;
const neighbors = [packet[eaPosition - 2], packet[eaPosition]];
assert.deepEqual(neighbors, [5, 26]);
const selector = H(neighbors[0], neighbors[1]);
assert.deepEqual(selector, [dh.A, dh.K]);
assert.deepEqual(selector, [8, 2]);

// The derived selector emits the additive key (a,p) without using THE.
const theKey = [
  packet[selector[0] - 1],
  packet[selector[1] - 1],
];
assert.deepEqual(theKey, [dh.a, dh.p]);
assert.deepEqual(theKey, [6, 23]);

// First value-changing plaintext recovery.
const theCipher = p0Words.find((word) => word.start === 103);
assert.ok(theCipher);
assert.deepEqual(theCipher.values, [8, 12]);
const thePlain = theCipher.values.map(
  (value, index) => (value - theKey[index] + 29) % 29
);
assert.deepEqual(thePlain, [2, 18]);
assert.equal(spell(thePlain), "THE");

// The next complete word is now a prospective receiver. Apply the already
// derived A1 LEAD numbers as an additive key. No ROAD plaintext was used in
// deriving the key.
const roadCipher = p0Words.find((word) => word.start === 105);
assert.ok(roadCipher);
assert.deepEqual(roadCipher.values, [16, 8, 25, 27]);
const roadPlain = roadCipher.values.map(
  (value, index) => (value - leadA1[index] + 29) % 29
);
assert.deepEqual(roadPlain, [4, 3, 24, 23]);
assert.equal(spell(roadPlain), "ROAD");

// Exact forward reconstruction.
assert.deepEqual(
  thePlain.map((value, index) => (value + theKey[index]) % 29),
  theCipher.values
);
assert.deepEqual(
  roadPlain.map((value, index) => (value + leadA1[index]) % 29),
  roadCipher.values
);

// Independent source phrase check: the recovered two-word plaintext is the
// authenticated phrase used in the 2016 clue, but it was not used above.
assert.equal(spell(thePlain) + " " + spell(roadPlain), "THE ROAD");

// EA's full GP-prime weight points exactly to the next word after ROAD.
const afterRoad = p0Words.find((word) => word.start === 109);
assert.ok(afterRoad);
assert.equal(corpus.prime[innerRune], afterRoad.start);

// Manuscript-wide selector census under the canonical center-preserving H
// packet transform. This removes the old retrospective (A,K) choice.
let windows = 0;
let eaAt17 = 0;
let neighborAk = 0;
let indexedAp = 0;
const fullHits = [];

for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  const words = pageWords(physicalPart(page));

  for (let index = 0; index <= words.length - 4; index += 1) {
    windows += 1;
    const candidate = words
      .slice(index, index + 4)
      .flatMap((word) => shell(word.values));

    if (candidate.length < 18 || candidate[16] !== innerRune) continue;
    eaAt17 += 1;

    const candidateSelector = H(candidate[15], candidate[17]);
    if (
      candidateSelector[0] !== dh.A ||
      candidateSelector[1] !== dh.K
    ) continue;
    neighborAk += 1;

    const candidateKey = [
      candidate[candidateSelector[0] - 1],
      candidate[candidateSelector[1] - 1],
    ];
    if (
      candidateKey[0] !== dh.a ||
      candidateKey[1] !== dh.p
    ) continue;
    indexedAp += 1;

    fullHits.push({
      page,
      word: index + 1,
      start: words[index].start,
      packetLength: candidate.length,
      selector: candidateSelector,
      key: candidateKey,
    });
  }
}

assert.equal(windows, 2763);
assert.equal(eaAt17, 51);
assert.equal(neighborAk, 2);
assert.equal(indexedAp, 1);
assert.deepEqual(fullHits, [{
  page: 0,
  word: 18,
  start: 80,
  packetLength: 23,
  selector: [8, 2],
  key: [6, 23],
}]);

console.log(JSON.stringify({
  status: "PASS",
  p57InverseCoordinates: {
    chargedAdjacentPairs: 19,
    typedCoordinateStrings,
    englishCoordinateHits,
    selectedKey: lead,
    selectedA1: leadA1,
    forwardOrder: {
      text: adle,
      gp0: gp0(gp(adle)),
      p50: table60[gp0(gp(adle))],
    },
    reverseOrder: {
      text: lead,
      gp0: gp0(gp(lead)),
      p50: table60[gp0(gp(lead))],
    },
  },
  packet: {
    inner,
    innerRune,
    innerPrime: corpus.prime[innerRune],
    selfIndexed,
    neighbors,
    selector,
    theKey,
  },
  plaintextRecovery: {
    the: {cipher: theCipher.values, key: theKey, plain: thePlain, text: spell(thePlain)},
    road: {cipher: roadCipher.values, key: leadA1, plain: roadPlain, text: spell(roadPlain)},
    phrase: spell(thePlain) + " " + spell(roadPlain),
    nextWordStart: afterRoad.start,
  },
  selectorControl: {windows, eaAt17, neighborAk, indexedAp, fullHits},
  classification:
    "conditional value-changing recovery of original p0 THE ROAD without using either plaintext to derive its key; remaining upstream uncertainty is the READ OUT split-word base60 offset receiver semantics",
}, null, 2));
