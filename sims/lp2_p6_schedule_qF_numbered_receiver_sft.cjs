"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signedText = read("resources/historical/cicada2016-4gq25-outguess.asc");
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);

/** @param {string} word @returns {number[]} */
function gp(word) {
  const normalized = word.toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
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

const clear = signedText.split("-----BEGIN PGP SIGNATURE-----")[0];
const signed = clear.slice(clear.indexOf("Hello."))
  .split(/[^A-Za-z0-9]+/u)
  .filter((token) => /^[A-Za-z]+$/u.test(token))
  .map((label, index) => ({
    index,
    label: label.toUpperCase(),
    gp: gp(label),
  }));

assert.equal(signed.length, 43);
assert.equal(signed[36].label, "GOOD");
assert.equal(signed[41].label, "VERIFY");
assert.equal(signed[42].label, "OPENPGP");

const parts = transcription.split(/^\s*%\s*$/m).slice(0, 55);
const words = [];
let current = [];
let startPage = -1;
let endPage = -1;
let startOffset = -1;

/** Flush one canonical printed word. */
function flush() {
  if (!current.length) return;
  words.push({
    page: startPage,
    endPage,
    start: startOffset,
    values: current.slice(),
  });
  current = [];
}

for (let block = 0; block < parts.length; block += 1) {
  const page = block >= 50 ? block + 1 : block;
  let offset = 0;
  for (const char of parts[block]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      if (!current.length) {
        startPage = page;
        startOffset = offset;
      }
      endPage = page;
      current.push(value);
      offset += 1;
    } else if (!/[\s/]/u.test(char)) {
      flush();
    }
  }
}
flush();

const canonical = words.filter((word) => word.page === word.endPage);

/** @param {number} page @returns {{page:number,endPage:number,start:number,values:number[]}[]} */
function localWords(page) {
  return canonical.filter((word) => word.page === page);
}

// Reconstruct the p6 visible schedule packet.
const p6 = localWords(6);
const p6TitleStarts = [71, 75, 76, 80];
const p6Title = p6TitleStarts.map((start) => {
  const word = p6.find((candidate) => candidate.start === start);
  assert.ok(word, "missing p6 title word at " + start);
  return word;
});
const p6Lengths = p6Title.map((word) => word.values.length);
assert.deepEqual(p6Lengths, [4, 1, 4, 2]);

const q = p6Lengths[0];
const one = p6Lengths[1];
const K = p6Lengths[3];
const F = 0;
assert.deepEqual({ q, one, K, F }, { q: 4, one: 1, K: 2, F: 0 });

// Block 2 of [q,1,q,K] is singleton source/page36.
// Test the zero-based source-index convention: p_i / local word_i.
const indexDiagonal = [];
for (let page = 1; page <= 42; page += 1) {
  const local = localWords(page);
  const receiver = local[page - 1];
  if (!receiver) continue;
  indexDiagonal.push({
    page,
    ordinal: page,
    start: receiver.start,
    values: receiver.values,
  });
}

const qCenteredIndex = indexDiagonal.filter((entry) =>
  entry.values.length % 2 === 1 &&
  entry.values[Math.floor(entry.values.length / 2)] === q
);

assert.deepEqual(qCenteredIndex, [{
  page: 36,
  ordinal: 36,
  start: 169,
  values: [2, 22, 4, 1, 20],
}]);

const p36Prepared = qCenteredIndex[0].values.filter((_, index) => index !== 2);
assert.deepEqual(p36Prepared, [2, 22, 1, 20]);
assert.equal(p36Prepared.length, signed[36].gp.length);
const p36Key = [25, 19, 27, 26];
assert.deepEqual(
  p36Prepared.map((value, index) => mod29(value - p36Key[index])),
  signed[36].gp
);
assert.deepEqual(signed[36].gp, [6, 3, 3, 23]);

// Block 4 has K=2 pages. Test source-ordinal convention:
// p_i / local word_(i+1), and look for a center F marker.
const ordinalDiagonal = [];
for (let page = 0; page <= 42; page += 1) {
  const local = localWords(page);
  const receiver = local[page];
  if (!receiver) continue;
  ordinalDiagonal.push({
    page,
    ordinal: page + 1,
    start: receiver.start,
    values: receiver.values,
  });
}

const fCenteredOrdinal = ordinalDiagonal.filter((entry) =>
  entry.values.length % 2 === 1 &&
  entry.values[Math.floor(entry.values.length / 2)] === F
);

assert.deepEqual(
  fCenteredOrdinal.map((entry) => ({
    page: entry.page,
    ordinal: entry.ordinal,
    start: entry.start,
    length: entry.values.length,
  })),
  [
    { page: 12, ordinal: 13, start: 60, length: 5 },
    { page: 41, ordinal: 42, start: 178, length: 7 },
    { page: 42, ordinal: 43, start: 206, length: 3 },
  ]
);

const consecutiveFBlocks = [];
for (let index = 0; index + K - 1 < ordinalDiagonal.length; index += 1) {
  const block = ordinalDiagonal.slice(index, index + K);
  const consecutivePages = block.every((entry, offset) =>
    entry.page === block[0].page + offset
  );
  const allCenteredF = block.every((entry) =>
    entry.values.length % 2 === 1 &&
    entry.values[Math.floor(entry.values.length / 2)] === F
  );
  if (consecutivePages && allCenteredF) consecutiveFBlocks.push(block);
}

assert.equal(consecutiveFBlocks.length, 1);
assert.deepEqual(
  consecutiveFBlocks[0].map((entry) => ({
    page: entry.page,
    ordinal: entry.ordinal,
    start: entry.start,
    values: entry.values,
  })),
  [
    {
      page: 41,
      ordinal: 42,
      start: 178,
      values: [27, 12, 5, 0, 17, 13, 19],
    },
    {
      page: 42,
      ordinal: 43,
      start: 206,
      values: [16, 0, 14],
    },
  ]
);

// P41: direct center-F removal yields the native VERIFY length and exact replay.
const p41Receiver = consecutiveFBlocks[0][0];
const p41Prepared = p41Receiver.values.filter((_, index) => index !== 3);
assert.equal(p41Prepared.length, signed[41].gp.length);
const p41Key = [26, 23, 1, 7, 13, 22];
assert.deepEqual(
  p41Prepared.map((value, index) => mod29(value - p41Key[index])),
  signed[41].gp
);
assert.deepEqual(signed[41].gp, [1, 18, 4, 10, 0, 26]);

// P42: the selected ordinal word is itself the operational packet [K,1,F].
function hpair3(values) {
  assert.equal(values.length, 3);
  return [
    mod29(values[0] - values[2]),
    mod29(values[0] + values[2]),
    values[1],
  ];
}

const p42Selector = consecutiveFBlocks[0][1];
assert.deepEqual(hpair3(p42Selector.values), [K, one, F]);

const k1fHits = [];
for (const word of canonical) {
  if (word.values.length !== 3) continue;
  if (hpair3(word.values).join(",") === [K, one, F].join(",")) {
    k1fHits.push(word);
  }
}
assert.deepEqual(k1fHits, [{
  page: 42,
  endPage: 42,
  start: 206,
  values: [16, 0, 14],
}]);

const p42Local = localWords(42);
const selectorIndex = p42Local.findIndex((word) => word.start === p42Selector.start);
assert.equal(selectorIndex + 1, 43);
const p42Destination = p42Local[selectorIndex + K];
assert.deepEqual(p42Destination, {
  page: 42,
  endPage: 42,
  start: 211,
  values: [10, 0, 14, 1, 3, 26, 8, 2],
});
assert.equal(p42Destination.values[one], F);

const p42Prepared = p42Destination.values.filter((_, index) => index !== one);
assert.equal(p42Prepared.length, signed[42].gp.length);
const p42Key = [7, 1, 12, 23, 13, 2, 18];
assert.deepEqual(
  p42Prepared.map((value, index) => mod29(value - p42Key[index])),
  signed[42].gp
);
assert.deepEqual(signed[42].gp, [3, 13, 18, 9, 13, 6, 13]);

console.log(JSON.stringify({
  status: "PASS",
  p6Schedule: {
    titleStarts: p6TitleStarts,
    lengths: p6Lengths,
    state: { q, one, K, F },
  },
  singletonBlock: {
    convention: "p_i / local word_i",
    chargedReceivers: indexDiagonal.length,
    qCenteredHits: qCenteredIndex.length,
    hit: qCenteredIndex[0],
    targetBlindPreparedLength: p36Prepared.length,
    replayTarget: signed[36].label,
  },
  finalBlock: {
    convention: "p_i / local word_(i+1)",
    chargedReceivers: ordinalDiagonal.length,
    fCenteredReceivers: fCenteredOrdinal.length,
    consecutiveWidth: K,
    consecutiveFBlocks: consecutiveFBlocks.length,
    pages: consecutiveFBlocks[0].map((entry) => entry.page),
    p41: {
      preparedLength: p41Prepared.length,
      replayTarget: signed[41].label,
    },
    p42: {
      selectorH: hpair3(p42Selector.values),
      manuscriptWideK1FHits: k1fHits.length,
      destinationStart: p42Destination.start,
      checkedRuneIndex: one,
      preparedLength: p42Prepared.length,
      replayTarget: signed[42].label,
    },
  },
}, null, 2));
