"use strict";

/**
 * SFT: ROAD/LEAD self-end and p50 coordinate MUST->SHED bridge.
 *
 * Starting family is exactly the 12 A1Z26 English-key hits from the fixed
 * authenticated-2016 four-rune target × unknown four-rune receiver census.
 * For each resulting four-letter key, split letters into two A1 coordinates
 * on the printed 32x8 p50 grid. Charge:
 *   - forward or reverse pair order,
 *   - base60/base59 independently at each coordinate,
 *   - one fixed GP metric (GP0, GP1, GP-prime) for both outputs.
 * Success means the two outputs equal consecutive solved p57 words under
 * that same metric.
 *
 * No rotations, coordinate offsets, row/column swapping, or mixed metrics.
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
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");

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
function parseWords(text) {
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

/** @param {number[]} cipher @param {number[]} plain @returns {number[]} */
function additiveKey(cipher, plain) {
  assert.equal(cipher.length, plain.length);
  return cipher.map((value, index) => (value - plain[index] + 29) % 29);
}

/** @param {number[]} values @returns {string|null} */
function a1z26(values) {
  if (!values.every((value) => value >= 1 && value <= 26)) return null;
  return values
    .map((value) => String.fromCharCode(64 + value))
    .join("")
    .toLowerCase();
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

// Reconstruct Agent4's fixed 12-hit A1 family.
const signedClear = signed2016
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .split(/\r?\n\r?\n/u)
  .slice(1)
  .join("\n");
const signedTargets = [...new Set(
  signedClear
    .split(/[^A-Za-z]+/u)
    .filter(Boolean)
    .map((word) => word.toUpperCase())
    .filter((word) => gp(word).length === 4)
)];
assert.deepEqual(signedTargets, [
  "LIES", "THEIR", "ROAD", "SEEK", "WILL", "GOOD", "LUCK", "PATHS",
]);

const a1Hits = [];
for (const target of signedTargets) {
  const plain = gp(target);

  for (let page = 0; page <= 55; page += 1) {
    if (page === 50) continue;
    const words = parseWords(physicalPart(page));

    for (let index = 0; index < words.length; index += 1) {
      const word = words[index];
      if (word.values.length !== 4) continue;

      const key = additiveKey(word.values, plain);
      const keyWord = a1z26(key);
      if (keyWord !== null && lexicon4.has(keyWord)) {
        a1Hits.push({
          target,
          page,
          word: index + 1,
          start: word.start,
          end: word.end,
          key,
          keyWord: keyWord.toUpperCase(),
        });
      }
    }
  }
}

assert.equal(a1Hits.length, 12);
assert.deepEqual(
  a1Hits.map((row) => row.keyWord),
  ["HIRE", "CASE", "LEAD", "GUMS", "BANE", "COPE",
   "GUNS", "BODY", "FIRS", "CURS", "MENU", "EASE"]
);

const tableTokens = grid.pages.flatMap((page) => page.tokens);
const tableBytes = grid.pages.flatMap((page) => page.bytes);
const alphabet60 = grid.alphabet;
const alphabet59 = alphabet60.replace("f", "");

/**
 * @param {string} pair two A1 letters: first=row, second=column
 * @param {"base60"|"base59"} radix
 * @returns {null|{pair:string,row:number,col:number,index:number,token:string,value:number}}
 */
function coordinate(pair, radix) {
  const row = pair.charCodeAt(0) - 64;
  const col = pair.charCodeAt(1) - 64;
  if (row < 1 || row > 32 || col < 1 || col > 8) return null;

  const index = (row - 1) * 8 + (col - 1);
  const token = tableTokens[index];
  const alphabet = radix === "base60" ? alphabet60 : alphabet59;

  return {
    pair,
    row,
    col,
    index,
    token,
    value: numeralValue(token, alphabet),
  };
}

// LEAD's GP0 self-pointer is the only self-END case in the already fixed
// 12-hit A1 family. CASE is retained as the self-START rival.
const selfBoundary = [];
for (const row of a1Hits) {
  const keyGp0 = gp0(gp(row.keyWord));
  if (keyGp0 >= tableBytes.length) continue;
  const output = tableBytes[keyGp0];
  if (output === row.start || output === row.end) {
    selfBoundary.push({
      target: row.target,
      keyWord: row.keyWord,
      page: row.page,
      start: row.start,
      end: row.end,
      keyGp0,
      output,
      selfStart: output === row.start,
      selfEnd: output === row.end,
    });
  }
}
assert.deepEqual(selfBoundary, [
  {
    target: "THEIR", keyWord: "CASE", page: 44,
    start: 124, end: 127, keyGp0: 62, output: 124,
    selfStart: true, selfEnd: false,
  },
  {
    target: "ROAD", keyWord: "LEAD", page: 0,
    start: 105, end: 108, keyGp0: 71, output: 108,
    selfStart: false, selfEnd: true,
  },
]);

// Build solved p57 metric registers.
const p57Section = solved.sections.find((section) => /p57/i.test(section.name));
assert.ok(p57Section);
const p57Words = (p57Section.source_text.match(/[\u16A0-\u16FF]+/gu) || [])
  .map((word) => [...word].map((rune) => runeIndex.get(rune)));
assert.equal(p57Words.length, 20);

const metrics = {gp0, gp1, gpPrime};
const metricMaps = {};
for (const [name, fn] of Object.entries(metrics)) {
  const map = new Map();
  for (let index = 0; index < p57Words.length; index += 1) {
    const value = fn(p57Words[index]);
    if (!map.has(value)) map.set(value, []);
    map.get(value).push({
      position: index + 1,
      word: spell(p57Words[index]),
    });
  }
  metricMaps[name] = map;
}

// Charge the complete fixed family.
const consecutiveHits = [];
for (const row of a1Hits) {
  const pairs = [row.keyWord.slice(0, 2), row.keyWord.slice(2, 4)];

  for (const order of ["forward", "reverse"]) {
    const orderedPairs = order === "forward" ? pairs : [pairs[1], pairs[0]];

    for (const firstRadix of ["base60", "base59"]) {
      for (const secondRadix of ["base60", "base59"]) {
        const first = coordinate(orderedPairs[0], firstRadix);
        const second = coordinate(orderedPairs[1], secondRadix);
        if (first === null || second === null) continue;

        for (const metric of Object.keys(metrics)) {
          const firstWords = metricMaps[metric].get(first.value) || [];
          const secondWords = metricMaps[metric].get(second.value) || [];

          for (const a of firstWords) {
            for (const b of secondWords) {
              if (b.position === a.position + 1) {
                consecutiveHits.push({
                  target: row.target,
                  keyWord: row.keyWord,
                  order,
                  pairs: orderedPairs,
                  radices: [firstRadix, secondRadix],
                  metric,
                  values: [first.value, second.value],
                  words: [a, b],
                });
              }
            }
          }
        }
      }
    }
  }
}

assert.deepEqual(consecutiveHits, [{
  target: "ROAD",
  keyWord: "LEAD",
  order: "reverse",
  pairs: ["AD", "LE"],
  radices: ["base60", "base59"],
  metric: "gpPrime",
  values: [186, 232],
  words: [
    {position: 10, word: "MUST"},
    {position: 11, word: "SHED"},
  ],
}]);

// Explicitly tie the hit to the already independently selected transition.
assert.equal(gpPrime(gp("MUST")), 186);
assert.equal(gpPrime(gp("SHED")), 232);
assert.equal(coordinate("AD", "base60").value, 186);
assert.equal(coordinate("LE", "base59").value, 232);
assert.notEqual(coordinate("AD", "base59").value, 186);
assert.notEqual(coordinate("LE", "base60").value, 232);

// Prospective recursion test: apply the ROAD rule unchanged to the next p0
// word. It fails before the self-end predicate, so no decoder continuation.
const p0Words = parseWords(physicalPart(0));
const next = p0Words[23];
assert.deepEqual(next, {start: 109, end: 110, values: [14, 26]});
const nextTargets = [...new Set(
  signedClear
    .split(/[^A-Za-z]+/u)
    .filter(Boolean)
    .map((word) => word.toUpperCase())
    .filter((word) => gp(word).length === 2)
)];
assert.deepEqual(nextTargets, ["THE", "IS", "BE"]);

const nextEnglishKeys = [];
for (const target of nextTargets) {
  const key = additiveKey(next.values, gp(target));
  const keyWord = a1z26(key);
  if (keyWord !== null && dictionaryWords.includes(keyWord)) {
    nextEnglishKeys.push({target, key, keyWord});
  }
}
assert.deepEqual(nextEnglishKeys, []);

console.log(JSON.stringify({
  status: "PASS",
  a1Family: {
    hitCount: a1Hits.length,
    keyWords: a1Hits.map((row) => row.keyWord),
    selfBoundary,
  },
  chargedCoordinateFamily:
    "12 A1 key words x forward/reverse bigram order x 4 radix pairs x 3 fixed GP metrics; invalid row/column pairs skipped",
  consecutiveHits,
  prospectiveNextWord: {
    receiver: next,
    authenticatedTargets: nextTargets,
    englishA1Keys: nextEnglishKeys,
  },
  classification:
    "strong post-discovery semantic/radix-state bridge for ROAD/LEAD; unique in the charged family, but reverse-pair reading is still an interpretive selector and no recursive decoder follows",
}, null, 2));
