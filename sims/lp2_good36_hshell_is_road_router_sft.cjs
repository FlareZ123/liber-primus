"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
const readJson = (relative) => JSON.parse(read(relative));

const corpus = readJson("resources/liber-primus/lp2-corpus.json");
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const pageTexts = transcription.split("%").slice(0, 55);

function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/**
 * Parse one physical-page fragment stream.
 * Printed "/" line wraps and whitespace continue a fragment.
 * A physical "%" page boundary is already removed by the caller, so a
 * fragment cannot continue into the next physical page under this route.
 *
 * @param {string} text
 * @param {number} page
 * @returns {Array<{page:number,ordinal:number,start:number,values:number[]}>}
 */
function parsePageFragments(text, page) {
  const words = [];
  let values = [];
  let start = 0;
  let offset = 0;

  function flush() {
    if (!values.length) return;
    words.push({
      page,
      ordinal: words.length + 1,
      start,
      values: values.slice(),
    });
    values = [];
  }

  for (const char of [...text]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      if (!values.length) start = offset;
      values.push(value);
      offset += 1;
    } else if (char === "/" || /\s/u.test(char)) {
      // Printed line wrapping is not a fragment delimiter.
    } else {
      flush();
    }
  }
  flush();
  return words;
}

/**
 * Outside-in H channels for an odd-length word.
 *
 * @param {number[]} values
 * @returns {{differences:number[],sums:number[],center:number|null,interleaved:number[]}}
 */
function hChannels(values) {
  const differences = [];
  const sums = [];
  const interleaved = [];
  let left = 0;
  let right = values.length - 1;

  while (left < right) {
    const difference = mod29(values[left] - values[right]);
    const sum = mod29(values[left] + values[right]);
    differences.push(difference);
    sums.push(sum);
    interleaved.push(difference, sum);
    left += 1;
    right -= 1;
  }

  const center = left === right ? values[left] : null;
  if (center !== null) interleaved.push(center);
  return {differences, sums, center, interleaved};
}

const clear = signed2016
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .replace(/^-----BEGIN PGP SIGNED MESSAGE-----[\s\S]*?Hash: SHA1\s*/, "")
  .replace(/\b3301\b/g, "")
  .replace(/\b[0-9A-F]{8,}\b/g, "");

const source = (clear.match(/[A-Za-z]+/g) || []).map((word, index) => ({
  index,
  word: word.toUpperCase(),
}));

assert.equal(source.length, 43);
assert.equal(source[4].word, "EMPTY");
assert.equal(source[11].word, "IS");
assert.equal(source[21].word, "IS");
assert.equal(source[22].word, "THE");
assert.equal(source[23].word, "ROAD");
assert.equal(source[36].word, "GOOD");

const pages = pageTexts.map((text, page) => parsePageFragments(text, page));
const fragments = pages.flat();

const good = pages[36][36];
assert.ok(good);
assert.equal(good.ordinal, 37);
assert.equal(good.start, 169);
assert.deepEqual(good.values, [2, 22, 4, 1, 20]);

const goodH = hChannels(good.values);
assert.deepEqual(goodH.differences, [11, 21]);
assert.deepEqual(goodH.sums, [22, 23]);
assert.equal(goodH.center, 4);
assert.deepEqual(goodH.interleaved, [11, 22, 21, 23, 4]);

assert.deepEqual(
  goodH.differences.map((index) => source[index].word),
  ["IS", "IS"]
);
assert.deepEqual(
  goodH.sums.map((index) => source[index].word),
  ["THE", "ROAD"]
);
assert.equal(source[goodH.center].word, "EMPTY");

const fiveRune = fragments.filter((fragment) => fragment.values.length === 5);
assert.equal(fiveRune.length, 318);

function isBroadRouter(fragment) {
  if (fragment.values.length !== 5) return false;
  const packet = hChannels(fragment.values);
  if (packet.center !== 4) return false;
  if (packet.differences.length !== 2 || packet.sums.length !== 2) return false;

  const [leftDifference, rightDifference] = packet.differences;
  const [leftSum, rightSum] = packet.sums;
  if (!source[leftDifference] || !source[rightDifference]) return false;
  if (source[leftDifference].word !== source[rightDifference].word) return false;
  return rightSum === leftSum + 1;
}

const broadHits = fiveRune.filter(isBroadRouter);
assert.deepEqual(
  broadHits.map((fragment) => [
    fragment.page,
    fragment.ordinal,
    fragment.start,
    fragment.values,
  ]),
  [[36, 37, 169, [2, 22, 4, 1, 20]]]
);

const exactPacket = goodH.interleaved;
const exactHits = fiveRune.filter((fragment) => {
  const packet = hChannels(fragment.values).interleaved;
  return packet.every((value, index) => value === exactPacket[index]);
});
assert.deepEqual(
  exactHits.map((fragment) => [fragment.page, fragment.ordinal, fragment.start]),
  [[36, 37, 169]]
);

// Authenticated source index i selects physical page i and one-based local
// page fragment i+1 under the active numbered route.
const diagonal = source.map((row) => ({
  source: row,
  object: pages[row.index]?.[row.index] || null,
}));

const missing = diagonal.filter((row) => !row.object);
assert.deepEqual(
  missing.map((row) => [row.source.index, row.source.word]),
  [[32, "YOU"]]
);

const diagonalBroadHits = diagonal.filter(
  (row) => row.object && isBroadRouter(row.object)
);
assert.deepEqual(
  diagonalBroadHits.map((row) => [
    row.source.index,
    row.source.word,
    row.object.page,
    row.object.ordinal,
    row.object.start,
  ]),
  [[36, "GOOD", 36, 37, 169]]
);

console.log("PASS GOOD36 H-shell IS/THE ROAD router");
console.log(JSON.stringify({
  sourceSelector: {index: 36, word: "GOOD"},
  receiver: good,
  H: {
    differences: goodH.differences,
    differenceWords: goodH.differences.map((index) => source[index].word),
    sums: goodH.sums,
    sumWords: goodH.sums.map((index) => source[index].word),
    center: goodH.center,
    centerWord: source[goodH.center].word,
    interleaved: goodH.interleaved,
  },
  controls: {
    fiveRuneFragments: fiveRune.length,
    broadHits: broadHits.map((fragment) => ({
      page: fragment.page,
      ordinal: fragment.ordinal,
      start: fragment.start,
    })),
    exactPacketHits: exactHits.map((fragment) => ({
      page: fragment.page,
      ordinal: fragment.ordinal,
      start: fragment.start,
    })),
    diagonalExisting: diagonal.length - missing.length,
    diagonalMissing: missing.map((row) => ({
      index: row.source.index,
      word: row.source.word,
    })),
  },
}, null, 2));
