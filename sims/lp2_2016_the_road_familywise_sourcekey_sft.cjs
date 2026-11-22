"use strict";

/**
 * SFT for Director #1722.
 *
 * Audits the authenticated 2016 [2,4] phrase family against p0, derives the
 * exact THE key from source-only image geometry plus source word ordinal,
 * charges simple image-number alternatives, and rejects the minimal repeated
 * continuation on ROAD.
 *
 * CommonJS, Node.js 22, no third-party dependencies.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
const readBuffer = (relative) =>
  fs.readFileSync(path.join(root, relative));

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const image2016 = readBuffer("resources/historical/cicada2016-4gq25.jpg");
const image2012 = readBuffer("resources/historical/cicada2012-first-image.jpg");

const tokenRows = corpus.translit
  .map((token, index) => [token, index])
  .sort((left, right) => right[0].length - left[0].length);

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {string} original @returns {number[]} */
function encodeWord(original) {
  const normalized = original.toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S");
  const out = [];
  for (let position = 0; position < normalized.length;) {
    const row = tokenRows.find(([token]) =>
      normalized.startsWith(token, position));
    assert.ok(row, "unmapped GP spelling: " + original);
    out.push(row[1]);
    position += row[0].length;
  }
  return out;
}

/** @param {number} count @returns {number} */
function nthPrime(count) {
  let seen = 0;
  for (let value = 2; ; value += 1) {
    let prime = true;
    for (let divisor = 2; divisor * divisor <= value; divisor += 1) {
      if (value % divisor === 0) {
        prime = false;
        break;
      }
    }
    if (prime && ++seen === count) return value;
  }
}

/** @param {Buffer} jpeg @returns {{width:number,height:number}} */
function jpegSize(jpeg) {
  assert.equal(jpeg[0], 0xff);
  assert.equal(jpeg[1], 0xd8);
  let offset = 2;
  while (offset < jpeg.length) {
    assert.equal(jpeg[offset], 0xff);
    while (jpeg[offset] === 0xff) offset += 1;
    const marker = jpeg[offset++];
    if (marker === 0xd9 || marker === 0xda) break;
    const length = jpeg.readUInt16BE(offset);
    if ([
      0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,
      0xc9,0xca,0xcb,0xcd,0xce,0xcf,
    ].includes(marker)) {
      return {
        height: jpeg.readUInt16BE(offset + 3),
        width: jpeg.readUInt16BE(offset + 5),
      };
    }
    offset += length;
  }
  assert.fail("JPEG SOF marker missing");
}

const size2016 = jpegSize(image2016);
const size2012 = jpegSize(image2012);
assert.deepEqual(size2016, {width:563,height:569});
assert.deepEqual(size2012, {width:503,height:509});
assert.deepEqual([nthPrime(103),nthPrime(104)], [563,569]);
assert.deepEqual([nthPrime(96),nthPrime(97)], [503,509]);
assert.equal(size2016.height - size2016.width, 6);
assert.equal(size2012.height - size2012.width, 6);

const signedBody = signed2016
  .slice(signed2016.indexOf("Hello."),
    signed2016.indexOf("-----BEGIN PGP SIGNATURE-----"))
  .replace(/\b[0-9A-F]{8}\b/g, "")
  .replace(/\b\d+\b/g, "");
const signedWords = (signedBody.match(/[A-Za-z]+/g) || [])
  .map((word, index) => ({
    ordinal:index + 1,
    word:word.toUpperCase(),
    values:encodeWord(word),
  }));
assert.equal(signedWords.length, 43);

const signed24 = [];
for (let index = 0; index + 1 < signedWords.length; index += 1) {
  if (
    signedWords[index].values.length === 2 &&
    signedWords[index + 1].values.length === 4
  ) {
    signed24.push([
      signedWords[index].ordinal,
      signedWords[index].word,
      signedWords[index + 1].ordinal,
      signedWords[index + 1].word,
    ]);
  }
}
assert.deepEqual(signed24, [[23,"THE",24,"ROAD"]]);

const runeIndex = new Map(
  corpus.runes.map((rune, index) => [rune, index]));
const runeSet = new Set(corpus.runes);
const p0Text = transcription.split(/^\s*%\s*$/m)[0];
const p0Words = [];
let current = [];
let start = 0;
let runeOffset = 0;
const flush = () => {
  if (!current.length) return;
  p0Words.push({
    word:p0Words.length + 1,
    start,
    end:runeOffset - 1,
    values:current.slice(),
  });
  current = [];
};
for (const char of [...p0Text]) {
  if (runeSet.has(char)) {
    if (!current.length) start = runeOffset;
    current.push(runeIndex.get(char));
    runeOffset += 1;
  } else if (char === "-" || char === ".") {
    flush();
  }
}
flush();

const p0Pairs24 = [];
for (let index = 0; index + 1 < p0Words.length; index += 1) {
  if (
    p0Words[index].values.length === 2 &&
    p0Words[index + 1].values.length === 4
  ) {
    p0Pairs24.push({
      firstWord:index + 1,
      start:p0Words[index].start,
      end:p0Words[index + 1].end,
      cipher:[p0Words[index].values,p0Words[index + 1].values],
    });
  }
}
assert.deepEqual(p0Pairs24, [{
  firstWord:22,
  start:103,
  end:108,
  cipher:[[8,12],[16,8,25,27]],
}]);

const origins = [
  {name:"zero-forward", offsets:[103,104]},
  {name:"zero-reverse", offsets:[104,103]},
  {name:"one-forward", offsets:[102,103]},
  {name:"one-reverse", offsets:[103,102]},
];
assert.deepEqual(
  origins.filter((row) =>
    row.offsets[0] === p0Words[21].start &&
    row.offsets[1] === p0Words[21].end),
  [{name:"zero-forward", offsets:[103,104]}]
);

const the = signedWords[22];
assert.deepEqual(
  {ordinal:the.ordinal,word:the.word,values:the.values},
  {ordinal:23,word:"THE",values:[2,18]}
);
const imageGap = size2016.height - size2016.width;
const sourceKey = [imageGap, the.ordinal];
const selectedCipher = p0Words[21].values;
assert.deepEqual(sourceKey, [6,23]);
assert.deepEqual(
  the.values.map((value,index) => mod29(value + sourceKey[index])),
  selectedCipher
);
assert.deepEqual(
  selectedCipher.map((value,index) => mod29(value - the.values[index])),
  sourceKey
);

// Charge simple source-image number choices across every authenticated two-rune
// word and every complete p0 two-rune receiver.
const measures = {
  width_mod29:mod29(size2016.width),
  height_mod29:mod29(size2016.height),
  dimension_gap:mod29(size2016.height - size2016.width),
  dimension_sum_mod29:mod29(size2016.width + size2016.height),
  width_prime_ordinal_mod29:mod29(103),
  height_prime_ordinal_mod29:mod29(104),
  ordinal_gap:mod29(104 - 103),
  ordinal_sum_mod29:mod29(103 + 104),
  dimension_product_mod29:mod29(size2016.width * size2016.height),
};
const twoSource = signedWords.filter((row) => row.values.length === 2);
const twoP0 = p0Words.filter((row) => row.values.length === 2);
assert.equal(twoSource.length, 9);
assert.equal(twoP0.length, 7);

const familyHits = [];
for (const source of twoSource) {
  for (const receiver of twoP0) {
    for (const [measureName,measure] of Object.entries(measures)) {
      for (const order of ["measure,ordinal","ordinal,measure"]) {
        const key = order === "measure,ordinal"
          ? [measure,mod29(source.ordinal)]
          : [mod29(source.ordinal),measure];
        for (const sign of [1,-1]) {
          const predicted = source.values.map((value,index) =>
            mod29(value + sign * key[index]));
          if (
            predicted[0] === receiver.values[0] &&
            predicted[1] === receiver.values[1]
          ) {
            familyHits.push({
              sourceOrdinal:source.ordinal,
              sourceWord:source.word,
              p0Word:receiver.word,
              start:receiver.start,
              measureName,
              measure,
              order,
              sign,
              key,
            });
          }
        }
      }
    }
  }
}
assert.equal(9 * 7 * 9 * 2 * 2, 2268);
assert.deepEqual(familyHits, [
  {
    sourceOrdinal:8,sourceWord:"THE",p0Word:24,start:109,
    measureName:"width_mod29",measure:12,
    order:"measure,ordinal",sign:1,key:[12,8],
  },
  {
    sourceOrdinal:22,sourceWord:"IS",p0Word:15,start:73,
    measureName:"width_prime_ordinal_mod29",measure:16,
    order:"measure,ordinal",sign:1,key:[16,22],
  },
  {
    sourceOrdinal:23,sourceWord:"THE",p0Word:22,start:103,
    measureName:"dimension_gap",measure:6,
    order:"measure,ordinal",sign:1,key:[6,23],
  },
  {
    sourceOrdinal:23,sourceWord:"THE",p0Word:22,start:103,
    measureName:"dimension_gap",measure:6,
    order:"ordinal,measure",sign:-1,key:[23,6],
  },
  {
    sourceOrdinal:23,sourceWord:"THE",p0Word:53,start:235,
    measureName:"dimension_product_mod29",measure:13,
    order:"ordinal,measure",sign:-1,key:[23,13],
  },
]);

const imageOrdinalHits = familyHits.filter((row) => row.start === 103);
assert.equal(imageOrdinalHits.length, 2);
assert.ok(imageOrdinalHits.every((row) =>
  row.sourceOrdinal === 23 &&
  row.sourceWord === "THE" &&
  row.measureName === "dimension_gap"));

// Minimal deterministic extension to ROAD: same [gap, source ordinal] pair,
// repeated to fill the four-rune word. It is a predeclared negative control.
const road = signedWords[23];
assert.deepEqual(
  {ordinal:road.ordinal,word:road.word,values:road.values},
  {ordinal:24,word:"ROAD",values:[4,3,24,23]}
);
const repeatedRoadKey = [imageGap,road.ordinal,imageGap,road.ordinal];
const roadCipher = p0Words[22].values;
const roadPrediction = roadCipher.map((value,index) =>
  mod29(value - repeatedRoadKey[index]));
assert.deepEqual(repeatedRoadKey, [6,24,6,24]);
assert.deepEqual(roadPrediction, [10,13,19,3]);
assert.notDeepEqual(roadPrediction, road.values);

console.log(JSON.stringify({
  status:"PASS",
  source:{
    size2016,
    primeOrdinals2016:[103,104],
    imageGap,
    size2012,
    primeOrdinals2012:[96,97],
    repeatedHistoricalGap:size2012.height - size2012.width,
  },
  uniqueSigned24:signed24,
  uniqueP0Pair24:p0Pairs24,
  theRecovery:{
    sourceOrdinal:the.ordinal,
    plaintext:the.values,
    key:sourceKey,
    ciphertext:selectedCipher,
  },
  chargedFamily:{
    combinations:2268,
    measures,
    hits:familyHits,
    imageOrdinalHits,
  },
  roadGate:{
    sourceOrdinal:road.ordinal,
    repeatedRoadKey,
    output:roadPrediction,
    target:road.values,
    passes:false,
  },
  decision:
    "THE at p0 103..104 has an exact source-only additive inverse from the 2016 image gap and source word ordinal. THE ROAD is uniquely placed by the [2,4] source/p0 family, but the same key rule fails on ROAD, so ROAD remains an unverified continuation.",
}, null, 2));
