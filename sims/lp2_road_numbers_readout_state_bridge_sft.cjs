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

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);
const parts = transcription.split(/^\s*%\s*$/m);
const tableTokens = grid.pages.flatMap((page) => page.tokens);
const tableBytes = grid.pages.flatMap((page) => page.bytes);
const alphabet60 = grid.alphabet;

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

function base29Number(values) {
  return values.reduce((total, value) => total * 29 + value, 0);
}

function decodeBase60(token) {
  const high = alphabet60.indexOf(token[0]);
  const low = alphabet60.indexOf(token[1]);
  assert.ok(high >= 0 && low >= 0);
  return high * 60 + low;
}

function parsePage(text) {
  const output = [];
  let current = [];
  let start = 0;
  let offset = 0;

  function flush() {
    if (!current.length) return;
    output.push({
      index: output.length,
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
  return output;
}

const p0 = parsePage(parts[0]);
const p0ByStart = new Map(p0.map((word) => [word.start, word]));

// Reconstruct the upstream ROAD receiver geometry.
const roadGp = gp("ROAD");
assert.deepEqual(roadGp, [4, 3, 24, 23]);
const roadNumber = base29Number(roadGp);
assert.equal(roadNumber, 100798);
assert.equal(roadNumber % 256, 190);
const roadCell = (roadNumber % 256) - 1;
assert.equal(roadCell, 189);
assert.equal(tableTokens[roadCell], "3C");
assert.equal(decodeBase60("3C"), 192);
assert.equal(p0ByStart.get(192)?.length, 4);

// Reconstruct the ROAD source-descriptor zero bracket.
const roadDescriptor = [12, 5, 1, 4];
const firstCoordinate = roadDescriptor[0] * 8 + roadDescriptor[1];
const secondCoordinate = roadDescriptor[2] * 8 + roadDescriptor[3];
assert.deepEqual([firstCoordinate, secondCoordinate], [101, 12]);

assert.equal(tableBytes[101], 229);
assert.equal(tableTokens[229], "00");
assert.equal(tableBytes[12], 247);
assert.equal(tableBytes[247], 192);
assert.equal(tableTokens[192], "00");
assert.deepEqual(
  tableTokens.map((token, index) => token === "00" ? index : -1)
    .filter((index) => index >= 0),
  [192, 229]
);
const zeroInteriorLength = 229 - 192 - 1;
assert.equal(zeroInteriorLength, 36);

// The ROAD-selected p0 start192 plus the source-selected bracket length lands
// exactly on a seven-rune word start, matching the authenticated successor
// NUMBERS in GP length.
const numbersReceiverOffset = 192 + zeroInteriorLength;
assert.equal(numbersReceiverOffset, 228);
const numbersReceiver = p0ByStart.get(numbersReceiverOffset);
assert.ok(numbersReceiver);
assert.equal(numbersReceiver.length, gp("NUMBERS").length);
assert.equal(numbersReceiver.length, 7);
assert.deepEqual(numbersReceiver.values, [25, 15, 26, 1, 8, 4, 16]);

// Do not force a plaintext inverse. Read the raw selected receiver through the
// already frozen outside-in H transform.
const receiverShell = shell(numbersReceiver.values);
assert.deepEqual(receiverShell, [9, 12, 11, 19, 18, 5, 1]);

const state = { p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2, e: 3 };
const stateForm = [
  mod29(state.b - state.a),
  mod29(state.K * state.a),
  mod29(state.A + state.e),
  state.B,
  H(state.A, state.B)[0],
  state.g,
  mod29(state.a - state.g),
];
assert.deepEqual(receiverShell, stateForm);

const shellDirection = receiverShell.reduce((total, value) => total + value, 0);
assert.equal(shellDirection, 75);
assert.equal(shellDirection, gp0("READOUT"));

// Charge the raw H-shell sum across all complete seven-rune unknown words.
let sevenRuneWordCount = 0;
const sum75Hits = [];
const exactShellHits = [];
for (let partIndex = 0; partIndex < 55; partIndex += 1) {
  const physicalPage = partIndex <= 49 ? partIndex : partIndex + 1;
  for (const word of parsePage(parts[partIndex])) {
    if (word.length !== 7) continue;
    sevenRuneWordCount += 1;
    const wordShell = shell(word.values);
    const wordSum = wordShell.reduce((total, value) => total + value, 0);
    const row = {
      page: physicalPage,
      word: word.index,
      start: word.start,
      values: word.values,
      shell: wordShell,
    };
    if (wordSum === 75) sum75Hits.push(row);
    if (wordShell.every((value, index) => value === receiverShell[index])) {
      exactShellHits.push(row);
    }
  }
}
assert.equal(sevenRuneWordCount, 214);
assert.equal(sum75Hits.length, 2);
assert.deepEqual(exactShellHits, [{
  page: 0,
  word: 51,
  start: 228,
  values: [25, 15, 26, 1, 8, 4, 16],
  shell: [9, 12, 11, 19, 18, 5, 1],
}]);

// Feed 75 through the already promoted GP0 -> p50 address layer.
assert.equal(tableTokens[75], "2v");
assert.equal(decodeBase60("2v"), 177);

// Existing READOUT work independently fixes the whole-word-bounded 23-rune
// p0 interval 166..188, whose exact center is 177.
const readoutWords = p0.filter((word) => word.start >= 166 && word.end <= 188);
assert.deepEqual(
  readoutWords.map((word) => [word.start, word.end, word.length]),
  [[166, 172, 7], [173, 175, 3], [176, 176, 1], [177, 182, 6], [183, 188, 6]]
);
const readoutLength = 188 - 166 + 1;
assert.equal(readoutLength, state.p);
assert.equal((166 + 188) / 2, 177);



function transformWord(values) {
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

function packetForSpan(start, end) {
  const words = p0.filter((word) => word.start >= start && word.end <= end);
  assert.ok(words.length > 0);
  assert.equal(words[0].start, start);
  assert.equal(words.at(-1).end, end);
  return words.flatMap((word) => transformWord(word.values));
}

// The independently selected whole packet has the published [b,A] ... B
// boundary and one-based (A,K) -> (K,A) self-swap.
const wholePacket = packetForSpan(166, 188);
assert.equal(wholePacket.length, state.p);
assert.deepEqual(wholePacket.slice(0, 2), [state.b, state.A]);
assert.equal(wholePacket.at(-1), state.B);
assert.equal(wholePacket[state.A - 1], state.K);
assert.equal(wholePacket[state.K - 1], state.A);

// Its unique boundary join leads to the independently selected split READOUT
// packet 80..102, whose boundary is [B,p] ... K.
const splitPacket = packetForSpan(80, 102);
assert.equal(splitPacket.length, state.p);
assert.deepEqual(splitPacket.slice(0, 2), [state.B, state.p]);
assert.equal(splitPacket.at(-1), state.K);
assert.equal(wholePacket.at(-1), splitPacket[0]);

// The already frozen one-based (A,K) selector on the split packet yields
// [a,p], the exact additive key for the adjacent THE receiver.
assert.deepEqual(
  [splitPacket[state.A - 1], splitPacket[state.K - 1]],
  [state.a, state.p]
);
const theReceiver = p0ByStart.get(103);
assert.ok(theReceiver);
assert.deepEqual(theReceiver.values, [8, 12]);
const theKey = [state.a, state.p];
const thePlain = theReceiver.values.map((value, index) =>
  mod29(value - theKey[index])
);
assert.deepEqual(thePlain, gp("THE"));

// ROAD follows immediately and replays with its published source-descriptor key.
const roadReceiver = p0ByStart.get(105);
assert.ok(roadReceiver);
assert.deepEqual(roadReceiver.values, [16, 8, 25, 27]);
const roadKey = roadDescriptor;
const roadPlain = roadReceiver.values.map((value, index) =>
  mod29(value - roadKey[index])
);
assert.deepEqual(roadPlain, gp("ROAD"));

console.log(JSON.stringify({
  status: "PASS",
  classification:
    "post-location local-cycle bridge: ROAD source numbers select the unique zero bracket; its length sends p0 start192 to the seven-rune NUMBERS-shaped receiver at228. Its raw H shell is a unique DH-state packet and sums to75=GP0(READOUT). p50[75]=2v base60=177 is the center of the independently fixed whole READOUT packet166..188; its frozen DH boundary joins the split packet80..102, whose A/K selector yields the exact THE key immediately before the recovered ROAD receiver. The receiver values were exposed before the H/sum consequence was recognized, so this closes mechanism/state structure rather than proving NUMBERS plaintext.",
  road: {
    gp: roadGp,
    base29: roadNumber,
    cell: roadCell,
    token: tableTokens[roadCell],
    base60: decodeBase60(tableTokens[roadCell]),
    descriptor: roadDescriptor,
  },
  zeroBracket: {
    endpoints: [192, 229],
    interiorLength: zeroInteriorLength,
    numbersReceiverOffset,
    numbersReceiverLength: numbersReceiver.length,
  },
  receiver: {
    values: numbersReceiver.values,
    shell: receiverShell,
    stateForm,
    shellDirection,
    sum75Hits,
    exactShellHits,
  },
  readout: {
    gp0: gp0("READOUT"),
    token: tableTokens[75],
    base60: decodeBase60(tableTokens[75]),
    interval: [166, 188],
    center: 177,
    length: readoutLength,
    wholePacket,
    splitPacket,
    boundaryJoin: wholePacket.at(-1),
    theKey,
    thePlain,
    roadKey,
    roadPlain,
  },
}, null, 2));
