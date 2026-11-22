"use strict";

/**
 * Source-exact cross-page navigation closure:
 * authenticated 2016 THE / WAY -> p0 -> byte80, independently matching
 * the p27 DJU / BEI GP0 convergence into the DIVINITY carrier.
 *
 * Run: node sims/lp2_p0_the_way_p27_80_cycle_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const tableTokens = grid.pages.flatMap((page) => page.tokens);
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({symbol, value}))
  .sort((a, b) => b.symbol.length - a.symbol.length);

/** @param {number[]} values */
function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

/** @param {string} word */
function gp(word) {
  const normalized = word.toUpperCase()
    .replace(/K/g, "C")
    .replace(/V/g, "U")
    .replace(/Q/g, "C")
    .replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < normalized.length;) {
    const token = gpTokens.find((item) => normalized.startsWith(item.symbol, i));
    assert.ok(token, "unmapped GP spelling at " + word + ":" + i);
    out.push(token.value);
    i += token.symbol.length;
  }
  return out;
}

/**
 * @param {number} pageNumber
 * @returns {{index:number,start:number,length:number,indices:number[]}[]}
 */
function parsePageWords(pageNumber) {
  const source = transcription.split(/\r?\n%\r?\n/)[pageNumber];
  if (source === undefined) return [];
  const words = [];
  let current = [];
  let offset = 0;
  let start = 0;
  const flush = () => {
    if (!current.length) return;
    words.push({index: words.length, start, length: current.length, indices: current});
    current = [];
  };
  for (const ch of [...source]) {
    const value = runeIndex.get(ch);
    if (value !== undefined) {
      if (!current.length) start = offset;
      current.push(value);
      offset += 1;
    } else if (ch === "-" || ch === ".") {
      flush();
    }
  }
  flush();
  return words;
}

function signedWords() {
  const clear = signed2016
    .split("-----BEGIN PGP SIGNATURE-----")[0]
    .split(/\r?\n\r?\n/)
    .slice(1)
    .join("\n");
  return clear.split(/[^A-Za-z0-9]+/)
    .filter((token) => /^[A-Za-z]+$/.test(token));
}

/**
 * One bipartite source-word step on a fixed receiver page:
 * signed word -> GP0 -> p50 byte -> containing page word -> GP0 -> p50 byte.
 * @param {{index:number,start:number,length:number,indices:number[]}[]} pageWords
 * @param {string[]} message
 * @param {number} signedIndex
 */
function bridge(pageWords, message, signedIndex) {
  const address = sum(gp(message[signedIndex]));
  assert(address < 256);
  const offset = grid.bytes[address];
  const word = pageWords.find((candidate) =>
    candidate.start <= offset && offset < candidate.start + candidate.length);
  if (!word) return null;
  const cipherGp0 = sum(word.indices);
  if (cipherGp0 >= 256) return null;
  return {
    address,
    offset,
    word,
    cipherGp0,
    next: grid.bytes[cipherGp0],
  };
}

const message = signedWords();
assert.equal(message.length, 43);
assert.equal(message[12].toLowerCase(), "the");
assert.equal(message[13].toLowerCase(), "way");
assert.equal(sum(gp(message[12])), 20);
assert.equal(grid.bytes[20], 102);

const p0 = parsePageWords(0);
const theStep = bridge(p0, message, 12);
assert.ok(theStep);
assert.equal(theStep.offset, 102);
assert.equal(theStep.word.index, 20);
assert.equal(theStep.word.start, 95);
assert.equal(theStep.word.start + theStep.word.length - 1, 102);
assert.equal(theStep.cipherGp0, 139);
assert.equal(theStep.next, 13);

const wayStep = bridge(p0, message, 13);
assert.ok(wayStep);
assert.equal(sum(gp("WAY")), 57);
assert.equal(wayStep.offset, 118);
assert.equal(wayStep.word.index, 26);
assert.equal(wayStep.word.start, 117);
assert.equal(wayStep.word.start + wayStep.word.length - 1, 121);
assert.equal(wayStep.cipherGp0, 37);
assert.equal(wayStep.next, 80);

// The two receiver-word GP0 sums reduce in the native GP29 alphabet to
// 23,8 = D,H. This supplies an operation-family readout from the exact
// authenticated source-order road, before consulting the independent p27
// DH23 reconstruction.
assert.equal(theStep.cipherGp0 % 29, 23);
assert.equal(wayStep.cipherGp0 % 29, 8);
assert.equal(corpus.translit[theStep.cipherGp0 % 29], "D");
assert.equal(corpus.translit[wayStep.cipherGp0 % 29], "H");

// Full source-family census. A hit requires an authenticated adjacent signed
// pair to bridge in source order on one original unknown page, followed by
// the second source word exiting at independently frozen byte80.
const firstHopAdjacencies = [];
const endpoint80Chains = [];
for (let page = 0; page <= 55; page += 1) {
  const words = parsePageWords(page);
  if (!words.length) continue;
  for (let i = 0; i < message.length - 1; i += 1) {
    const first = bridge(words, message, i);
    if (!first || first.next !== i + 1) continue;
    firstHopAdjacencies.push({
      page,
      index: i,
      from: message[i].toLowerCase(),
      to: message[i + 1].toLowerCase(),
      offset: first.offset,
    });
    const second = bridge(words, message, i + 1);
    if (second && second.next === 80) {
      endpoint80Chains.push({
        page,
        index: i,
        from: message[i].toLowerCase(),
        to: message[i + 1].toLowerCase(),
        firstOffset: first.offset,
        secondOffset: second.offset,
      });
    }
  }
}
assert.equal(firstHopAdjacencies.length, 10);
assert.deepEqual(endpoint80Chains, [{
  page: 0,
  index: 12,
  from: "the",
  to: "way",
  firstOffset: 102,
  secondOffset: 118,
}]);

// The first-hop THE->WAY relation alone has one rival page, p25.
// Its WAY continuation exits at65, so endpoint80 discriminates p0.
const theWayPages = firstHopAdjacencies
  .filter((row) => row.index === 12)
  .map((row) => row.page);
assert.deepEqual(theWayPages, [0, 25]);
const p25Way = bridge(parsePageWords(25), message, 13);
assert.ok(p25Way);
assert.equal(p25Way.next, 65);

// Wider null: ignore the source-order requirement and inspect every page ×
// adjacent signed-word pair for a two-receiver GP29 readout of D,H.
let validReceiverPairs = 0;
const dhPairs = [];
const dhEndpoint80 = [];
const sourceOrderDh = [];
const sourceOrderDhEndpoint80 = [];
for (let page = 0; page <= 55; page += 1) {
  const words = parsePageWords(page);
  if (!words.length) continue;
  for (let i = 0; i < message.length - 1; i += 1) {
    const first = bridge(words, message, i);
    const second = bridge(words, message, i + 1);
    if (!first || !second) continue;
    validReceiverPairs += 1;
    const isDh =
      first.cipherGp0 % 29 === 23 &&
      second.cipherGp0 % 29 === 8;
    const isSourceOrder = first.next === i + 1;
    if (isDh) dhPairs.push([page, i]);
    if (isDh && second.next === 80) dhEndpoint80.push([page, i]);
    if (isDh && isSourceOrder) sourceOrderDh.push([page, i]);
    if (isDh && isSourceOrder && second.next === 80) {
      sourceOrderDhEndpoint80.push([page, i]);
    }
  }
}
assert.equal(validReceiverPairs, 1931);
assert.equal(dhPairs.length, 6);
assert.deepEqual(dhEndpoint80, [[0, 12], [28, 3]]);
assert.deepEqual(sourceOrderDh, [[0, 12]]);
assert.deepEqual(sourceOrderDhEndpoint80, [[0, 12]]);

// Prospective p2 receiver selected from the source-natural 27x27 p0-p2 square.
// After p0 ROAD and DEVOTED were fixed independently, a complete p0-p2 census
// leaves one additional word ending on global column0: p2 word9. Reuse the
// already frozen source->GP0->table-byte->receiver->GP0->table-byte grammar
// against every signed source adjacency. GOOD is the sole exact family hit
// when receiver length, exact endpoint, next-source index, and byte80 are all
// required.
const p2 = parsePageWords(2);
const p0p1Length =
  corpus.pages.find((page) => page.page === 0).indices.length +
  corpus.pages.find((page) => page.page === 1).indices.length;
const p2Good = bridge(p2, message, 36);
assert.ok(p2Good);
assert.equal(message[36].toLowerCase(), "good");
assert.equal(message[37].toLowerCase(), "luck");
assert.equal(sum(gp("GOOD")), 35);
assert.equal(p2Good.offset, 39);
assert.equal(p2Good.word.index, 9);
assert.equal(p2Good.word.start, 36);
assert.equal(p2Good.word.length, 4);
assert.equal(p2Good.word.start + p2Good.word.length - 1, 39);
assert.equal(p0p1Length + 39, 567);
assert.equal((p0p1Length + 39) % 27, 0);
assert.equal(p2Good.cipherGp0, 37);
assert.equal(p2Good.cipherGp0, 37); // zero-based signed index of LUCK
assert.equal(p2Good.next, 80);

const p0p2ColumnZeroEnds = [];
let p0p2Base = 0;
for (let page = 0; page <= 2; page += 1) {
  const words = parsePageWords(page);
  for (const word of words) {
    const end = word.start + word.length - 1;
    if ((p0p2Base + end) % 27 === 0) {
      p0p2ColumnZeroEnds.push({
        page,
        word: word.index,
        start: word.start,
        end,
        length: word.length,
        globalEnd: p0p2Base + end,
      });
    }
  }
  p0p2Base += corpus.pages.find((row) => row.page === page).indices.length;
}
assert.deepEqual(p0p2ColumnZeroEnds, [
  {page: 0, word: 22, start: 105, end: 108, length: 4, globalEnd: 108},
  {page: 0, word: 53, start: 237, end: 243, length: 7, globalEnd: 243},
  {page: 2, word: 9, start: 36, end: 39, length: 4, globalEnd: 567},
]);

const goodLuckFamilyHits = [];
for (let page = 0; page <= 55; page += 1) {
  const words = parsePageWords(page);
  if (!words.length) continue;
  for (let i = 0; i < message.length - 1; i += 1) {
    const step = bridge(words, message, i);
    if (!step) continue;
    const receiverEnd = step.word.start + step.word.length - 1;
    const sourceLength = gp(message[i]).length;
    if (
      step.offset === receiverEnd &&
      step.word.length === sourceLength &&
      step.cipherGp0 === i + 1 &&
      step.next === 80
    ) {
      goodLuckFamilyHits.push({
        page,
        index: i,
        from: message[i].toLowerCase(),
        to: message[i + 1].toLowerCase(),
        offset: step.offset,
        receiverWord: step.word.index,
        receiverGp0: step.cipherGp0,
      });
    }
  }
}
assert.deepEqual(goodLuckFamilyHits, [{
  page: 2,
  index: 36,
  from: "good",
  to: "luck",
  offset: 39,
  receiverWord: 9,
  receiverGp0: 37,
}]);

// Independently reproduce the p27 DJU / BEI endpoint80 from original inputs.
const p27 = parsePageWords(27);
const dju = p27.find((word) => word.start === 28);
const bei = p27.find((word) => word.start === 31);
assert.ok(dju);
assert.ok(bei);
assert.equal(sum(dju.indices), 35);
assert.equal(sum(bei.indices), 45);
assert.equal(grid.bytes[35], 39);
assert.equal(grid.bytes[45], 107);

const djuIntermediate = p27.find((word) =>
  word.start <= 39 && 39 < word.start + word.length);
const beiIntermediate = p27.find((word) =>
  word.start <= 107 && 107 < word.start + word.length);
assert.ok(djuIntermediate);
assert.ok(beiIntermediate);
assert.equal(sum(djuIntermediate.indices), 40);
assert.equal(sum(beiIntermediate.indices), 55);
assert.equal(grid.bytes[40], 80);
assert.equal(grid.bytes[55], 80);

const divinityCarrier = p27.find((word) =>
  word.start <= 80 && 80 < word.start + word.length);
assert.ok(divinityCarrier);
assert.equal(divinityCarrier.start, 79);
assert.equal(divinityCarrier.length, 12);
assert.equal(80, divinityCarrier.start + 1);
const twiceShed = divinityCarrier.indices.slice(2, -2);
const twiceShedPrimeSum = twiceShed.reduce(
  (total, value) => total + corpus.prime[value], 0);
assert.equal(twiceShedPrimeSum, 376);
assert.equal(gp("DIVINITY").reduce(
  (total, value) => total + corpus.prime[value], 0), 376);

// Existing source-derived 3301 route points back toward p0 through the table.
assert.equal(3301 % 256, 229);
assert.equal(tableTokens[229], "00");
assert.equal(grid.bytes[229], 0);

process.stdout.write(JSON.stringify({
  status: "authenticated THE/WAY p0 road uniquely returns to independently frozen p27 byte80; NO UNKNOWN PLAINTEXT",
  signedSource: {
    words: message.length,
    pair: [message[12], message[13]],
    sourceIndices: [12, 13],
  },
  p0Road: {
    the: {
      gp0: sum(gp(message[12])),
      tableByte: theStep.offset,
      receiverWord: [theStep.word.start, theStep.word.start + theStep.word.length - 1],
      receiverGp0: theStep.cipherGp0,
      nextSignedIndex: theStep.next,
    },
    way: {
      gp0: sum(gp(message[13])),
      tableByte: wayStep.offset,
      receiverWord: [wayStep.word.start, wayStep.word.start + wayStep.word.length - 1],
      receiverGp0: wayStep.cipherGp0,
      endpoint: wayStep.next,
    },
  },
  familyControl: {
    pages: 56,
    sourceAdjacencies: message.length - 1,
    firstHopAdjacencies: firstHopAdjacencies.length,
    exactEndpoint80Chains: endpoint80Chains,
    theWayFirstHopPages: theWayPages,
    p25RivalEndpoint: p25Way.next,
    receiverGp29Readout: [
      corpus.translit[theStep.cipherGp0 % 29],
      corpus.translit[wayStep.cipherGp0 % 29],
    ],
    allValidReceiverPairs: validReceiverPairs,
    allDhPairs: dhPairs.length,
    dhAndEndpoint80Pairs: dhEndpoint80.length,
    sourceOrderDhPairs: sourceOrderDh.length,
    sourceOrderDhEndpoint80,
  },
  p2ProspectiveGood: {
    sourcePair: [message[36], message[37]],
    sourceGp0: sum(gp(message[36])),
    tableByte: p2Good.offset,
    receiverWord: [
      p2Good.word.start,
      p2Good.word.start + p2Good.word.length - 1,
    ],
    receiverGp0: p2Good.cipherGp0,
    nextSignedIndex: 37,
    endpoint: p2Good.next,
    exactFamilyHits: goodLuckFamilyHits,
    p0p2ColumnZeroEnds,
    classification:
      "prospective conditional plaintext candidate GOOD; value-changing cipher still unknown",
  },
  p27Holdout: {
    pairStarts: [28, 31],
    firstBytes: [39, 107],
    intermediateGp0: [40, 55],
    convergedByte: 80,
    carrierStart: divinityCarrier.start,
    carrierLength: divinityCarrier.length,
    twiceShedPrimeSum,
  },
  returnPointer: {
    value: 3301,
    tableAddress: 3301 % 256,
    token: tableTokens[229],
    byte: grid.bytes[229],
  },
}, null, 2) + "\n");
