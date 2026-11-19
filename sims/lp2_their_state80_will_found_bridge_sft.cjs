"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);
const parts = transcription.split(/^\s*%\s*$/m);
const table = grid.pages.flatMap((page) => page.tokens);
const alphabet60 = grid.alphabet;
const alphabet59 = alphabet60.replace("f", "");

function mod29(value) {
  return ((value % 29) + 29) % 29;
}

function H(left, right) {
  return [mod29(left - right), mod29(left + right)];
}

function shell(values) {
  const output = [];
  for (
    let left = 0, right = values.length - 1;
    left < right;
    left += 1, right -= 1
  ) {
    output.push(...H(values[left], values[right]));
  }
  if (values.length % 2 === 1) {
    output.push(values[(values.length - 1) / 2]);
  }
  return output;
}

function gp(word) {
  const normalized = word
    .toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");

  const output = [];
  for (let offset = 0; offset < normalized.length;) {
    if (normalized.startsWith("ING", offset)) {
      output.push(21);
      offset += 3;
      continue;
    }
    if (normalized.startsWith("IO", offset)) {
      output.push(27);
      offset += 2;
      continue;
    }
    const token = gpTokens.find((candidate) =>
      normalized.startsWith(candidate.symbol, offset)
    );
    assert.ok(token, "unmapped GP spelling: " + normalized.slice(offset));
    output.push(token.value);
    offset += token.symbol.length;
  }
  return output;
}

function gp0(word) {
  return gp(word).reduce((total, value) => total + value, 0);
}

function parsePage(text) {
  const words = [];
  let current = [];
  let start = 0;
  let offset = 0;

  function flush() {
    if (!current.length) return;
    words.push({
      index: words.length,
      start,
      end: offset - 1,
      length: current.length,
      values: current.slice(),
    });
    current = [];
  }

  for (const char of [...text]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      if (!current.length) start = offset;
      current.push(value);
      offset += 1;
    } else if ((char === "-" || char === ".") && current.length) {
      flush();
    }
  }
  flush();
  return words;
}

function decodeToken(token, alphabet) {
  const high = alphabet.indexOf(token[0]);
  const low = alphabet.indexOf(token[1]);
  if (high < 0 || low < 0) return null;
  return high * alphabet.length + low;
}

const clear = signed2016
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .split(/\n\n/)
  .slice(1)
  .join("\n");
const message = clear
  .split(/[^A-Za-z0-9]+/)
  .filter((token) => /^[A-Za-z]+$/.test(token));

assert.equal(message.length, 43);
assert.deepEqual(
  message.slice(23, 30).map((word) => word.toUpperCase()),
  ["ROAD", "AND", "THEIR", "NUMBERS", "ARE", "THE", "DIRECTION"]
);

const p0 = parsePage(parts[0]);
const p0ByStart = new Map(p0.map((word) => [word.start, word]));
assert.deepEqual(
  p0.slice(42, 45).map((word) => ({
    index: word.index,
    start: word.start,
    end: word.end,
    length: word.length,
    values: word.values,
  })),
  [
    { index: 42, start: 189, end: 191, length: 3, values: [0, 6, 9] },
    { index: 43, start: 192, end: 195, length: 4, values: [19, 12, 20, 9] },
    { index: 44, start: 196, end: 200, length: 5, values: [21, 19, 0, 4, 27] },
  ]
);

// Upstream prospectively sealed ROAD -> AND THEIR context.
assert.equal(gp0("ROAD"), 54);
assert.equal(gp0("THEIR"), 34);
assert.equal(table[34], "3H");

const modes = [
  { radix: "base60", alphabet: alphabet60, origin: 0 },
  { radix: "base60", alphabet: alphabet60, origin: 1 },
  { radix: "base59", alphabet: alphabet59, origin: 0 },
  { radix: "base59", alphabet: alphabet59, origin: 1 },
];

function wordStartStep(address, mode) {
  if (address < 0 || address >= table.length) return null;
  const token = table[address];
  const value = decodeToken(token, mode.alphabet);
  if (value === null) return null;
  const offset = value - mode.origin;
  const word = p0ByStart.get(offset);
  if (!word) return null;
  return {
    address,
    token,
    radix: mode.radix,
    origin: mode.origin,
    value,
    offset,
    word,
  };
}

// THEIR has one word-start interpretation among the four live radix/origin
// conventions: base60 with one-based receiver semantics.
const theirStarts = modes
  .map((mode) => wordStartStep(gp0("THEIR"), mode))
  .filter(Boolean);
assert.equal(theirStarts.length, 1);
const theirReceiver = theirStarts[0];
assert.equal(theirReceiver.radix, "base60");
assert.equal(theirReceiver.origin, 1);
assert.equal(theirReceiver.value, 197);
assert.equal(theirReceiver.offset, 196);
assert.equal(theirReceiver.word.index, 44);

const state = { p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2 };
const receiverShell = shell(theirReceiver.word.values);
assert.deepEqual(receiverShell, [state.p, state.B, state.b, state.p, 0]);

// Exact state packet is unique among complete unknown five-rune words.
const exactFiveRuneShellHits = [];
const typedFiveRuneShellHits = [];
const directStateOrF = new Set([...Object.values(state), 0]);
let fiveRuneWordCount = 0;

for (let partIndex = 0; partIndex < 55; partIndex += 1) {
  const physicalPage = partIndex <= 49 ? partIndex : partIndex + 1;
  for (const word of parsePage(parts[partIndex])) {
    if (word.length !== 5) continue;
    fiveRuneWordCount += 1;
    const wordShell = shell(word.values);
    const row = {
      page: physicalPage,
      word: word.index,
      start: word.start,
      values: word.values,
      shell: wordShell,
    };
    if (wordShell.every((value, index) => value === receiverShell[index])) {
      exactFiveRuneShellHits.push(row);
    }
    if (wordShell.every((value) => directStateOrF.has(value))) {
      typedFiveRuneShellHits.push(row);
    }
  }
}

assert.equal(fiveRuneWordCount, 318);
assert.deepEqual(exactFiveRuneShellHits, [{
  page: 0,
  word: 44,
  start: 196,
  values: [21, 19, 0, 4, 27],
  shell: [23, 19, 15, 23, 0],
}]);
assert.equal(typedFiveRuneShellHits.length, 2);

// The state packet's ordinary integer coordinate sum is 80.
const stateDirection = receiverShell.reduce((total, value) => total + value, 0);
assert.equal(stateDirection, 80);
assert.equal(table[stateDirection], "2M");

// Reuse the exact same base60 / one-based word-start semantics.
const fixedMode = modes.find((mode) =>
  mode.radix === "base60" && mode.origin === 1
);
assert.ok(fixedMode);

const state80Starts = modes
  .map((mode) => wordStartStep(stateDirection, mode))
  .filter(Boolean);
assert.deepEqual(
  state80Starts.map((step) => ({
    radix: step.radix,
    origin: step.origin,
    offset: step.offset,
    word: step.word.index,
  })),
  [{ radix: "base60", origin: 1, offset: 141, word: 32 }]
);

const willReceiver = wordStartStep(stateDirection, fixedMode);
assert.ok(willReceiver);
assert.equal(willReceiver.offset, 141);
assert.deepEqual(willReceiver.word.values, [19, 16, 9, 18]);

// Existing source-state WILL inverse.
const willKey = [
  mod29(state.K * state.a),
  state.a,
  ...H(state.A, state.B),
];
assert.deepEqual(willKey, [12, 6, 18, 27]);
const willPlain = willReceiver.word.values.map((value, index) =>
  mod29(value - willKey[index])
);
assert.deepEqual(willPlain, gp("WILL"));

// Reuse the same base60 / one-based semantics once more.
assert.equal(gp0("WILL"), 57);
assert.equal(table[57], "1w");
const willStarts = modes
  .map((mode) => wordStartStep(gp0("WILL"), mode))
  .filter(Boolean);
assert.deepEqual(
  willStarts.map((step) => ({
    radix: step.radix,
    origin: step.origin,
    offset: step.offset,
    word: step.word.index,
  })),
  [{ radix: "base60", origin: 1, offset: 117, word: 26 }]
);

const foundReceiver = wordStartStep(gp0("WILL"), fixedMode);
assert.ok(foundReceiver);
assert.deepEqual(foundReceiver.word.values, [12, 2, 11, 10, 2]);

const foundKey = [
  mod29(state.K * state.a),
  mod29(state.g - state.a),
  mod29(state.K * state.g),
  mod29(state.a - state.g),
  state.A,
];
assert.deepEqual(foundKey, [12, 28, 10, 1, 8]);
const foundPlain = foundReceiver.word.values.map((value, index) =>
  mod29(value - foundKey[index])
);
assert.deepEqual(foundPlain, gp("FOUND"));

// Same numeric semantics stops at FOUND, so it does not smuggle in GOOD.
assert.equal(gp0("FOUND"), 36);
assert.equal(table[36], "0s");
const afterFound = wordStartStep(gp0("FOUND"), fixedMode);
assert.ok(afterFound);
assert.equal(afterFound.offset, 53);
assert.equal(afterFound.word.length, 3);
assert.notEqual(afterFound.word.length, gp("GOOD").length);

// Charge the post-discovery two-stage recipe over every authenticated source
// word and all four live radix/origin modes:
// source GP0 -> p50 -> p0 word start -> H-shell integer sum -> p50 -> p0 start.
const twoStageHits = [];
for (let sourceIndex = 0; sourceIndex < message.length; sourceIndex += 1) {
  const source = message[sourceIndex].toUpperCase();
  const address = gp0(source);
  for (const mode of modes) {
    const first = wordStartStep(address, mode);
    if (!first) continue;
    const firstShell = shell(first.word.values);
    const direction = firstShell.reduce((total, value) => total + value, 0);
    const second = wordStartStep(direction, mode);
    if (!second) continue;
    twoStageHits.push({
      sourceIndex,
      source,
      mode: [mode.radix, mode.origin],
      firstAddress: address,
      firstOffset: first.offset,
      firstWord: first.word.index,
      firstShell,
      direction,
      secondOffset: second.offset,
      secondWord: second.word.index,
    });
  }
}
assert.equal(twoStageHits.length, 9);

const toWill = twoStageHits.filter((row) => row.secondOffset === 141);
assert.deepEqual(
  toWill.map((row) => ({
    sourceIndex: row.sourceIndex,
    source: row.source,
    mode: row.mode,
    firstAddress: row.firstAddress,
    firstOffset: row.firstOffset,
    firstShell: row.firstShell,
    direction: row.direction,
    secondOffset: row.secondOffset,
  })),
  [
    {
      sourceIndex: 19,
      source: "THEIR",
      mode: ["base60", 1],
      firstAddress: 34,
      firstOffset: 196,
      firstShell: [23, 19, 15, 23, 0],
      direction: 80,
      secondOffset: 141,
    },
    {
      sourceIndex: 25,
      source: "THEIR",
      mode: ["base60", 1],
      firstAddress: 34,
      firstOffset: 196,
      firstShell: [23, 19, 15, 23, 0],
      direction: 80,
      secondOffset: 141,
    },
  ]
);
assert.equal(message[23].toUpperCase(), "ROAD");
assert.equal(message[24].toUpperCase(), "AND");
assert.equal(message[25].toUpperCase(), "THEIR");

// The ROAD-selected occurrence is therefore message index25. The duplicated
// index19 is the same source word and same numeric route, not a second identity.
assert.equal(toWill.filter((row) => row.sourceIndex === 25).length, 1);

console.log(JSON.stringify({
  status: "PASS",
  classification:
    "post-receiver state/navigation compression: prospectively sealed ROAD -> AND THEIR context fixes THEIR; GP0(THEIR)=34 has one p0 word-start interpretation (base60/one-based), whose unique five-rune shell is [p,B,b,p,F]; its coordinate sum80 under the same semantics reaches the independently recovered WILL receiver, and WILL under the same semantics reaches the FOUND receiver. The two-stage recipe has nine authenticated-source/mode survivors and only THEIR reaches WILL. Operator recognition remains retrospective, so this is not plaintext promotion.",
  roadContext: message.slice(23, 30).map((word) => word.toUpperCase()),
  their: {
    gp0: gp0("THEIR"),
    token: table[gp0("THEIR")],
    receiverOffset: theirReceiver.offset,
    receiverWord: theirReceiver.word.index,
    receiverCipher: theirReceiver.word.values,
    receiverShell,
    stateDirection,
    exactFiveRuneShellHits,
    typedFiveRuneShellHits,
  },
  state80: {
    token: table[stateDirection],
    receiverOffset: willReceiver.offset,
    receiverWord: willReceiver.word.index,
    willKey,
    willPlain,
  },
  will: {
    gp0: gp0("WILL"),
    token: table[gp0("WILL")],
    receiverOffset: foundReceiver.offset,
    receiverWord: foundReceiver.word.index,
    foundKey,
    foundPlain,
  },
  afterFound: {
    gp0: gp0("FOUND"),
    token: table[gp0("FOUND")],
    receiverOffset: afterFound.offset,
    receiverWord: afterFound.word.index,
    receiverLength: afterFound.word.length,
  },
  family: {
    twoStageHits,
    toWill,
  },
}, null, 2));
