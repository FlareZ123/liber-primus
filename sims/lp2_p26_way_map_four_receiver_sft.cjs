"use strict";

/**
 * SFT: p26 unknown-cipher receiver for the fixed WAY -> MAP table move.
 *
 * Node.js 22, CommonJS, read-only, no third-party dependencies.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(ROOT, relative), "utf8").replace(/\r/g, "");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const table = grid.pages.flatMap((page) => page.tokens);
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));

/** @param {string} text @returns {number[][]} */
function runeWords(text) {
  const out = [];
  let current = [];
  for (const char of [...text]) {
    if (runeIndex.has(char)) {
      current.push(runeIndex.get(char));
    } else if (current.length > 0) {
      out.push(current);
      current = [];
    }
  }
  if (current.length > 0) out.push(current);
  return out;
}

/** @param {number[]} vector */
const gp0 = (vector) => vector.reduce((sum, value) => sum + value, 0);

/** @param {number[]} vector */
const translit = (vector) =>
  vector.map((value) => corpus.translit[value]).join("").toUpperCase();

const delta = {
  N: [-1, 0],
  S: [1, 0],
  E: [0, 1],
  W: [0, -1],
};

/**
 * @param {number} index
 * @param {string} token
 * @returns {number|null}
 */
function literalMove(index, token) {
  const match = token.match(/^([1-9])([NSEWnsew])$/);
  if (!match) return null;
  const row = Math.floor(index / 8);
  const col = index % 8;
  const [dr, dc] = delta[match[2].toUpperCase()];
  const distance = Number(match[1]);
  const nextRow = row + dr * distance;
  const nextCol = col + dc * distance;
  return nextRow >= 0 && nextRow < 32 && nextCol >= 0 && nextCol < 8
    ? nextRow * 8 + nextCol
    : null;
}

/** @param {number} index @param {string} token @returns {number|null} */
function hexCardinalMove(index, token) {
  if (!/^[0-9A-Fa-f]{2}$/.test(token)) return null;
  const direction = String.fromCharCode(Number.parseInt(token, 16)).toUpperCase();
  if (!delta[direction]) return null;
  const row = Math.floor(index / 8);
  const col = index % 8;
  const [dr, dc] = delta[direction];
  const nextRow = row + dr;
  const nextCol = col + dc;
  return nextRow >= 0 && nextRow < 32 && nextCol >= 0 && nextCol < 8
    ? nextRow * 8 + nextCol
    : null;
}

const tableComposite = [];
for (let source = 0; source < table.length; source += 1) {
  const middle = literalMove(source, table[source]);
  if (middle === null) continue;
  const destination = hexCardinalMove(middle, table[middle]);
  if (destination === null) continue;
  tableComposite.push({
    source,
    sourceToken: table[source],
    middle,
    middleToken: table[middle],
    destination,
  });
}
assert.deepEqual(tableComposite, [{
  source: 57,
  sourceToken: "1w",
  middle: 56,
  middleToken: "4E",
  destination: 48,
}]);

const pages = transcription.split(/^\s*%\s*$/m);
const movementEligible = [];
const movementHits = [];
const pair57to56 = [];
const fourHits = [];
let withinPagePairs = 0;
let fourWordWindows = 0;

for (let page = 0; page <= 55; page += 1) {
  const lines = (pages[page] || "").trim().split("/");
  const words = [];
  const locations = [];
  for (let line = 0; line < lines.length; line += 1) {
    const lineWords = runeWords(lines[line]);
    for (let word = 0; word < lineWords.length; word += 1) {
      words.push(lineWords[word]);
      locations.push({ line: line + 1, word: word + 1 });
    }
  }

  const addresses = words.map(gp0);
  for (let index = 0; index + 1 < addresses.length; index += 1) {
    withinPagePairs += 1;
    const sourceAddress = addresses[index];
    const targetAddress = addresses[index + 1];

    if (sourceAddress === 57 && targetAddress === 56) {
      pair57to56.push({
        page,
        index,
        source: translit(words[index]),
        target: translit(words[index + 1]),
        sourceLoc: locations[index],
        targetLoc: locations[index + 1],
      });
    }

    if (sourceAddress >= table.length) continue;
    const destination = literalMove(sourceAddress, table[sourceAddress]);
    if (destination === null) continue;
    const row = {
      page,
      index,
      source: translit(words[index]),
      target: translit(words[index + 1]),
      sourceAddress,
      token: table[sourceAddress],
      destination,
      targetAddress,
      sourceLoc: locations[index],
      targetLoc: locations[index + 1],
      crossLine: locations[index].line !== locations[index + 1].line,
    };
    movementEligible.push(row);
    if (destination === targetAddress) movementHits.push(row);
  }

  for (let index = 0; index + 3 < words.length; index += 1) {
    fourWordWindows += 1;
    const window = words.slice(index, index + 4);
    const windowAddresses = addresses.slice(index, index + 4);
    if (windowAddresses.some((address) => address >= table.length)) continue;
    const high = windowAddresses.map((address) => Number(table[address][0]));
    if (high.join(",") !== "0,3,1,4") continue;
    fourHits.push({
      page,
      index,
      sourceWords: window.map(translit),
      addresses: windowAddresses,
      tokens: windowAddresses.map((address) => table[address]),
      high,
      output: translit(high),
      locations: locations.slice(index, index + 4),
    });
  }
}

assert.equal(withinPagePairs, 3288);
assert.equal(movementEligible.length, 292);
assert.deepEqual(movementHits, [
  {
    page: 7,
    index: 26,
    source: "IEOTH",
    target: "EOUO",
    sourceAddress: 24,
    token: "1n",
    destination: 16,
    targetAddress: 16,
    sourceLoc: { line: 5, word: 5 },
    targetLoc: { line: 5, word: 6 },
    crossLine: false,
  },
  {
    page: 26,
    index: 53,
    source: "CHISFIN",
    target: "POENG",
    sourceAddress: 57,
    token: "1w",
    destination: 56,
    targetAddress: 56,
    sourceLoc: { line: 10, word: 2 },
    targetLoc: { line: 10, word: 3 },
    crossLine: false,
  },
]);

assert.deepEqual(pair57to56, [{
  page: 26,
  index: 53,
  source: "CHISFIN",
  target: "POENG",
  sourceLoc: { line: 10, word: 2 },
  targetLoc: { line: 10, word: 3 },
}]);

assert.equal(fourWordWindows, 3176);
assert.equal(fourHits.length, 4);
const p26Four = fourHits.find((hit) => hit.page === 26);
assert.deepEqual(p26Four, {
  page: 26,
  index: 51,
  sourceWords: ["E", "SAOE", "CHISFIN", "POENG"],
  addresses: [18, 61, 57, 56],
  tokens: ["0F", "3G", "1w", "4E"],
  high: [0, 3, 1, 4],
  output: "FOUR",
  locations: [
    { line: 9, word: 5 },
    { line: 10, word: 1 },
    { line: 10, word: 2 },
    { line: 10, word: 3 },
  ],
});


/*
 * Follow the table-state continuation within p26 without changing semantics.
 * State48 occurs exactly once as a word-GP0 receiver, but the already-frozen
 * 4D current-page rune self-index does not transfer to p26.
 */
const p26NavigationLines = pages[26].trim().split("/");
const p26State48 = [];
for (let line = 0; line < p26NavigationLines.length; line += 1) {
  const lineWords = runeWords(p26NavigationLines[line]);
  for (let word = 0; word < lineWords.length; word += 1) {
    if (gp0(lineWords[word]) === 48) {
      p26State48.push({
        line: line + 1,
        word: word + 1,
        cipher: translit(lineWords[word]),
        vector: lineWords[word],
      });
    }
  }
}
assert.deepEqual(p26State48, [{
  line: 4,
  word: 1,
  cipher: "EAMU",
  vector: [28, 19, 1],
}]);

const p26Page = corpus.pages.find((page) => page.page === 26);
assert.ok(p26Page);
const dIndex = corpus.translit.findIndex((token) => token.toUpperCase() === "D");
assert.equal(corpus.translit[p26Page.indices[48]], "L");
assert.equal(
  p26Page.indices.slice(0, 49).filter((value) => value === dIndex).length,
  1
);

/*
 * The recovered DH shared secret K=2 gives a readable word at the selected
 * state56 receiver under +K, but charge the sign and English background before
 * treating it as plaintext.
 */
const selectedReceiver = runeWords(p26NavigationLines[9])[2];
const mod29 = (value) => ((value % 29) + 29) % 29;
const plusK = selectedReceiver.map((value) => mod29(value + 2));
const minusK = selectedReceiver.map((value) => mod29(value - 2));
assert.equal(translit(plusK), "SAD");
assert.equal(translit(minusK), "JLM");

const english = new Set(
  read("resources/control/english_wordfreq_textblob.txt")
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith(";"))
    .map((line) => line.trim().split(/\s+/)[0].toUpperCase())
);

let threeRuneWords = 0;
let signedKEnglishHits = 0;
for (let page = 0; page <= 55; page += 1) {
  for (const word of runeWords(pages[page] || "")) {
    if (word.length !== 3) continue;
    threeRuneWords += 1;
    for (const sign of [-1, 1]) {
      const shifted = word.map((value) => mod29(value + sign * 2));
      if (english.has(translit(shifted))) signedKEnglishHits += 1;
    }
  }
}
assert.equal(threeRuneWords, 795);
assert.equal(signedKEnglishHits, 41);

/*
 * Boundary: the second stage is a table-state transition, not the immediate
 * next p26 ciphertext word. After the state56 word, p26's next word is state95.
 */
const p26Lines = pages[26].trim().split("/");
const p26Line10 = runeWords(p26Lines[9]);
const p26Line10Addresses = p26Line10.map(gp0);
assert.deepEqual(p26Line10Addresses.slice(0, 4), [61, 57, 56, 95]);
assert.equal(hexCardinalMove(56, table[56]), 48);
assert.notEqual(p26Line10Addresses[3], 48);

console.log(JSON.stringify({
  status: "PASS",
  tableComposite,
  unknownCorpus: {
    withinPagePairs,
    movementEligible: movementEligible.length,
    movementHits,
    unique57to56: pair57to56,
    fourWordWindows,
    fourHits,
  },
  p26Receiver: {
    fourWindow: p26Four,
    uniqueState48Word: p26State48,
    state48CurrentPageSelfIndex: { offset48Rune: corpus.translit[p26Page.indices[48]], dCountThrough48: 1, pass: false },
    sharedSecretWordProbe: { plusK: translit(plusK), minusK: translit(minusK), threeRuneWords, signedKEnglishHits },
    line10Addresses: p26Line10Addresses,
    exactNextStateTransition: "57 --1w--> 56",
    tableContinuation: "56 --4E/hex N--> 48",
    immediateCiphertextContinuation: 95,
  },
  classification:
    "Bounded unknown-cipher receiver candidate. Among 3288 within-page unknown-word adjacencies, only two literal p50 movement tokens predict the next word GP0; p26 is the sole 57->56 hit selected by the independently fixed WAY->MAP table edge, and that same p26 boundary window reads FOUR under the independently authenticated high-digit rule. The 56->48 table continuation does not equal p26's immediate next word; the unique p26 state48 word fails the frozen 4D current-page self-index; and the readable +K word SAD is only a bounded candidate against a 41/1590 signed-K English background. No continuous plaintext is claimed.",
}, null, 2));
