"use strict";

/**
 * SFT: full-space p0 ROAD/LEAD coordinate inverse gate.
 *
 * Fixed receiver: p0 word23, offsets105..108.
 *
 * Enumerate every four-letter A1 string whose two bigrams can be interpreted
 * as 1-based row/column coordinates on the printed 32x8 p50 grid. Charge:
 * - forward/reverse bigram order;
 * - base60/base59 independently at both coordinates;
 * - one shared GP metric (GP0, GP1, GP-prime) for both p57 outputs.
 *
 * A coordinate configuration survives only when its two p50 values equal the
 * metric values of consecutive solved p57 words. The surviving key is then
 * applied to the fixed original p0 ciphertext under charged alphabet-numbering
 * and additive-direction variants.
 *
 * Node.js 22, CommonJS, no third-party dependencies.
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
    words.push({start, end: offset - 1, values: current.slice()});
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

/** @param {number[]} values @returns {string} */
function translit(values) {
  return values.map((value) => corpus.translit[value]).join("").toLowerCase();
}

/** @param {string} token @param {string} alphabet @returns {number|null} */
function numeralValue(token, alphabet) {
  const high = alphabet.indexOf(token[0]);
  const low = alphabet.indexOf(token[1]);
  if (high < 0 || low < 0) return null;
  return high * alphabet.length + low;
}

/**
 * @param {number} row
 * @param {number} col
 * @param {"base60"|"base59"} radix
 * @returns {null|{index:number,token:string,value:number}}
 */
function coordinate(row, col, radix) {
  if (row < 1 || row > 32 || col < 1 || col > 8) return null;
  const index = (row - 1) * 8 + (col - 1);
  const token = tableTokens[index];
  const alphabet = radix === "base60" ? alphabet60 : alphabet59;
  const value = numeralValue(token, alphabet);
  if (value === null) return null;
  return {index, token, value};
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

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
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
const lexiconAll = new Set(
  dictionaryWords.filter((word) => /^[a-z]+$/u.test(word))
);
const lexicon4 = new Set(
  dictionaryWords.filter((word) => /^[a-z]{4}$/u.test(word))
);
assert.equal(lexicon4.has("lead"), true);
assert.equal(lexicon4.has("road"), true);

const p0Words = parseWords(physicalPart(0));
const receiver = p0Words[22];
assert.deepEqual(receiver, {
  start: 105,
  end: 108,
  values: [16, 8, 25, 27],
});

const tableTokens = grid.pages.flatMap((page) => page.tokens);
const tableBytes = grid.pages.flatMap((page) => page.bytes);
const alphabet60 = grid.alphabet;
const alphabet59 = alphabet60.replace("f", "");
assert.equal(tableTokens.length, 256);
assert.equal(tableBytes.length, 256);

const p57Section = solved.sections.find((section) => /p57/i.test(section.name));
assert.ok(p57Section);
const p57Words = (p57Section.source_text.match(/[\u16A0-\u16FF]+/gu) || [])
  .map((word) => [...word].map((rune) => runeIndex.get(rune)));
assert.equal(p57Words.length, 20);

const metrics = {gp0, gp1, gpPrime};
const consecutiveMetricPairs = {};
for (const [metricName, metric] of Object.entries(metrics)) {
  const values = p57Words.map(metric);
  const pairs = new Map();

  for (let index = 0; index + 1 < values.length; index += 1) {
    const key = values[index] + "," + values[index + 1];
    if (!pairs.has(key)) pairs.set(key, []);
    pairs.get(key).push([index + 1, index + 2]);
  }
  consecutiveMetricPairs[metricName] = pairs;
}

const coordinateHits = [];
const orders = ["forward", "reverse"];
const radices = ["base60", "base59"];
const coordinateValidKeyCount = 26 * 8 * 26 * 8;
let enumeratedKeyCount = 0;

for (let a = 1; a <= 26; a += 1) {
  for (let b = 1; b <= 8; b += 1) {
    for (let c = 1; c <= 26; c += 1) {
      for (let d = 1; d <= 8; d += 1) {
        enumeratedKeyCount += 1;
        const keyValues = [a, b, c, d];
        const keyWord = keyValues
          .map((value) => String.fromCharCode(64 + value))
          .join("")
          .toLowerCase();
        const bigrams = [[a, b], [c, d]];

        for (const order of orders) {
          const ordered = order === "forward"
            ? bigrams
            : [bigrams[1], bigrams[0]];

          for (const firstRadix of radices) {
            for (const secondRadix of radices) {
              const first = coordinate(
                ordered[0][0], ordered[0][1], firstRadix
              );
              const second = coordinate(
                ordered[1][0], ordered[1][1], secondRadix
              );
              assert.ok(first);
              assert.ok(second);

              for (const metricName of Object.keys(metrics)) {
                const match = consecutiveMetricPairs[metricName].get(
                  first.value + "," + second.value
                );
                if (!match) continue;

                const plaintextValues = receiver.values.map(
                  (value, index) => mod29(value - keyValues[index])
                );
                const plaintext = translit(plaintextValues);

                coordinateHits.push({
                  keyWord,
                  keyValues,
                  keyEnglish: lexicon4.has(keyWord),
                  order,
                  radices: [firstRadix, secondRadix],
                  metric: metricName,
                  values: [first.value, second.value],
                  p57Pairs: match,
                  plaintextValues,
                  plaintext,
                  plaintextEnglish: lexiconAll.has(plaintext),
                });
              }
            }
          }
        }
      }
    }
  }
}

assert.equal(enumeratedKeyCount, coordinateValidKeyCount);
assert.equal(coordinateHits.length, 264);
assert.equal(new Set(coordinateHits.map((row) => row.keyWord)).size, 208);

const englishKeyHits = coordinateHits.filter((row) => row.keyEnglish);
assert.deepEqual(englishKeyHits, [{
  keyWord: "lead",
  keyValues: [12, 5, 1, 4],
  keyEnglish: true,
  order: "reverse",
  radices: ["base60", "base59"],
  metric: "gpPrime",
  values: [186, 232],
  p57Pairs: [[10, 11]],
  plaintextValues: [4, 3, 24, 23],
  plaintext: "road",
  plaintextEnglish: true,
}]);

const englishPlaintextHits = coordinateHits.filter(
  (row) => row.plaintextEnglish
);
assert.deepEqual(
  englishPlaintextHits.map((row) => ({
    keyWord: row.keyWord,
    keyEnglish: row.keyEnglish,
    order: row.order,
    radices: row.radices,
    metric: row.metric,
    values: row.values,
    p57Pairs: row.p57Pairs,
    plaintext: row.plaintext,
  })),
  [
    {
      keyWord: "lead",
      keyEnglish: true,
      order: "reverse",
      radices: ["base60", "base59"],
      metric: "gpPrime",
      values: [186, 232],
      p57Pairs: [[10, 11]],
      plaintext: "road",
    },
    {
      keyWord: "ndvf",
      keyEnglish: false,
      order: "reverse",
      radices: ["base59", "base59"],
      metric: "gpPrime",
      values: [115, 215],
      p57Pairs: [[18, 19]],
      plaintext: "throng",
    },
  ]
);

const dualEnglishHits = coordinateHits.filter(
  (row) => row.keyEnglish && row.plaintextEnglish
);
assert.deepEqual(dualEnglishHits, englishKeyHits);

// Verify the LEAD coordinate semantics directly.
const ad60 = coordinate(1, 4, "base60");
const le59 = coordinate(12, 5, "base59");
assert.ok(ad60);
assert.ok(le59);
assert.equal(ad60.value, gpPrime(gp("MUST")));
assert.equal(le59.value, gpPrime(gp("SHED")));
assert.deepEqual(
  [gpPrime(gp("MUST")), gpPrime(gp("SHED"))],
  [186, 232]
);

// LEAD also self-closes on the exact end of the fixed receiver through the
// established whole-word GP0 -> p50 conventional-base60 mapping.
const leadGp0 = gp0(gp("LEAD"));
assert.equal(leadGp0, 71);
assert.equal(tableBytes[leadGp0], receiver.end);
assert.equal(numeralValue(tableTokens[leadGp0], alphabet59), 106);
assert.notEqual(
  numeralValue(tableTokens[leadGp0], alphabet59),
  receiver.end
);

// Charge common alphabet-number and additive-direction variants once LEAD has
// survived the independent coordinate gate.
const zeroBased = [..."LEAD"].map((char) => char.charCodeAt(0) - 65);
const numbering = {
  A1: zeroBased.map((value) => value + 1),
  A0: zeroBased,
  Z1: zeroBased.map((value) => 26 - value),
  Z0: zeroBased.map((value) => 25 - value),
};
const arithmeticHits = [];

for (const [scheme, key] of Object.entries(numbering)) {
  const variants = {
    "c-k": receiver.values.map((value, index) =>
      mod29(value - key[index])
    ),
    "k-c": receiver.values.map((value, index) =>
      mod29(key[index] - value)
    ),
    "c+k": receiver.values.map((value, index) =>
      mod29(value + key[index])
    ),
  };

  for (const [operation, values] of Object.entries(variants)) {
    const plaintext = translit(values);
    if (lexiconAll.has(plaintext)) {
      arithmeticHits.push({scheme, operation, key, values, plaintext});
    }
  }
}
assert.deepEqual(arithmeticHits, [{
  scheme: "A1",
  operation: "c-k",
  key: [12, 5, 1, 4],
  values: [4, 3, 24, 23],
  plaintext: "road",
}]);

const chargedCoordinateConfigurations =
  coordinateValidKeyCount *
  orders.length *
  radices.length *
  radices.length *
  Object.keys(metrics).length;
assert.equal(chargedCoordinateConfigurations, 1038336);

console.log(JSON.stringify({
  status: "PASS",
  receiver,
  chargedFamily: {
    coordinateValidKeys: coordinateValidKeyCount,
    pairOrders: orders.length,
    radixPairs: radices.length * radices.length,
    metrics: Object.keys(metrics).length,
    coordinateConfigurations: chargedCoordinateConfigurations,
    rawCoordinateHits: coordinateHits.length,
    uniqueCoordinateHitKeys:
      new Set(coordinateHits.map((row) => row.keyWord)).size,
    englishKeyHits,
    englishPlaintextHits,
    dualEnglishHits,
  },
  lead: {
    gp0: leadGp0,
    base60SelfEnd: tableBytes[leadGp0],
    base59Value: numeralValue(tableTokens[leadGp0], alphabet59),
    reverseCoordinates: ["AD", "LE"],
    coordinateRadices: ["base60", "base59"],
    coordinateValues: [ad60.value, le59.value],
    solvedP57: ["MUST", "SHED"],
  },
  arithmeticVariants: {
    tested: 12,
    englishHits: arithmeticHits,
  },
  classification:
    "On the independently fixed p0 word23 receiver, the complete coordinate-valid A1 key family leaves LEAD as the sole English coordinate key, and A1 c-k uniquely yields ROAD. The reverse-bigram coordinate interpretation remains a manuscript-internal selector and no recursive decoder is claimed.",
}, null, 2));
