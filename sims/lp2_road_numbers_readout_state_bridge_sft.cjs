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
const state = { p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2, e: 3 };



const clear2016 = signed2016
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .split(/\n\n/)
  .slice(1)
  .join("\n");
const signedWords = clear2016
  .split(/[^A-Za-z0-9]+/)
  .filter((token) => /^[A-Za-z]+$/.test(token))
  .map((word) => word.toUpperCase());
assert.equal(signedWords.length, 43);

// The authenticated phrase itself supplies an independent backwards selector:
// NUMBERS -> p50[GP0(NUMBERS)] dual-radix outputs reproduce the two preceding
// source-word GP lengths AND THEIR = [3,4].
const numbersIndex = signedWords.indexOf("NUMBERS");
assert.equal(numbersIndex, 26);
assert.deepEqual(signedWords.slice(numbersIndex - 2, numbersIndex + 1),
  ["AND", "THEIR", "NUMBERS"]);
assert.equal(gp0("NUMBERS"), 83);
assert.equal(tableTokens[83], "3D");

function decodeToken(token, alphabet) {
  const high = alphabet.indexOf(token[0]);
  const low = alphabet.indexOf(token[1]);
  assert.ok(high >= 0 && low >= 0);
  return high * alphabet.length + low;
}

const alphabet59 = alphabet60.replace("f", "");
const numbersBase59 = decodeToken(tableTokens[83], alphabet59);
const numbersBase60 = decodeToken(tableTokens[83], alphabet60);
assert.deepEqual([numbersBase59, numbersBase60], [190, 193]);
const numbersPair = [
  p0ByStart.get(numbersBase59 - 1),
  p0ByStart.get(numbersBase60 - 1),
];
assert.ok(numbersPair[0] && numbersPair[1]);
assert.equal(numbersPair[0].end + 1, numbersPair[1].start);
assert.deepEqual(numbersPair.map((word) => word.start), [189, 192]);
assert.deepEqual(numbersPair.map((word) => word.length), [3, 4]);
assert.deepEqual(
  signedWords.slice(numbersIndex - 2, numbersIndex)
    .map((word) => gp(word).length),
  [3, 4]
);

// Charge the rule over every authenticated source occurrence and both receiver
// origins. Only three source words produce any adjacent base59/base60 p0 pair;
// only NUMBERS matches its two preceding source-word GP lengths.
const adjacentDualRadix = [];
const backwardLengthMatches = [];
for (let sourceIndex = 0; sourceIndex < signedWords.length; sourceIndex += 1) {
  const address = gp0(signedWords[sourceIndex]);
  if (address < 0 || address >= tableTokens.length) continue;
  const token = tableTokens[address];
  const value59 = decodeToken(token, alphabet59);
  const value60 = decodeToken(token, alphabet60);
  for (const origin of [0, 1]) {
    const word59 = p0ByStart.get(value59 - origin);
    const word60 = p0ByStart.get(value60 - origin);
    if (!word59 || !word60 || word59.end + 1 !== word60.start) continue;
    const row = {
      sourceIndex,
      source: signedWords[sourceIndex],
      address,
      token,
      origin,
      starts: [word59.start, word60.start],
      lengths: [word59.length, word60.length],
      previous: sourceIndex >= 2
        ? signedWords.slice(sourceIndex - 2, sourceIndex)
        : [],
      previousLengths: sourceIndex >= 2
        ? signedWords.slice(sourceIndex - 2, sourceIndex)
          .map((word) => gp(word).length)
        : [],
    };
    adjacentDualRadix.push(row);
    if (
      sourceIndex >= 2 &&
      row.lengths[0] === row.previousLengths[0] &&
      row.lengths[1] === row.previousLengths[1]
    ) {
      backwardLengthMatches.push(row);
    }
  }
}
assert.deepEqual(
  adjacentDualRadix.map((row) => [row.source, row.origin, row.starts, row.lengths]),
  [
    ["PRIMUS", 0, [122, 124], [2, 3]],
    ["NUMBERS", 1, [189, 192], [3, 4]],
    ["OPENPGP", 1, [173, 176], [3, 1]],
  ]
);
assert.deepEqual(backwardLengthMatches, [adjacentDualRadix[1]]);

// NUMBERS is also the only authenticated source word whose addressed token is
// literally the independently fixed (e,p) state pair: 3 and GP-letter D=23.
const typedSourceTokens = [];
for (let sourceIndex = 0; sourceIndex < signedWords.length; sourceIndex += 1) {
  const address = gp0(signedWords[sourceIndex]);
  if (address < 0 || address >= tableTokens.length) continue;
  const token = tableTokens[address];
  const digit = /^[1-9]$/.test(token[0]) ? Number(token[0]) : null;
  const letterValue = corpus.translit.indexOf(token[1]);
  if (digit === null || letterValue < 0) continue;
  typedSourceTokens.push({
    sourceIndex,
    source: signedWords[sourceIndex],
    address,
    token,
    digit,
    letterValue,
    exactEP: digit === state.e && letterValue === state.p,
  });
}
assert.deepEqual(
  typedSourceTokens.filter((row) => row.exactEP),
  [{
    sourceIndex: numbersIndex,
    source: "NUMBERS",
    address: 83,
    token: "3D",
    digit: 3,
    letterValue: 23,
    exactEP: true,
  }]
);

const numbersTokenH = H(state.p, state.e);
assert.deepEqual(numbersTokenH, [20, 26]);

// Charge a source-token/state family for the first three-rune receiver.
// Keys are [x, H(p,e)[j], y] with distinct x,y chosen from the seven
// non-modulus state variables. Only AND reaches an authenticated 3-rune target.
const stateVariables = [
  ["g", state.g], ["a", state.a], ["b", state.b], ["A", state.A],
  ["B", state.B], ["K", state.K], ["e", state.e],
];
const signedThreeTargets = new Map(
  [...new Map(
    signedWords
      .map((word) => ({ word, values: gp(word) }))
      .filter((row) => row.values.length === 3)
      .map((row) => [row.values.join(","), row])
  ).values()].map((row) => [row.values.join(","), row.word])
);
const andReceiver = numbersPair[0];
const andFamilyHits = [];
let andFamilyConfigs = 0;
for (const [leftName, leftValue] of stateVariables) {
  for (const [rightName, rightValue] of stateVariables) {
    if (leftName === rightName) continue;
    for (let coordinate = 0; coordinate < 2; coordinate += 1) {
      andFamilyConfigs += 1;
      const key = [leftValue, numbersTokenH[coordinate], rightValue];
      const plain = andReceiver.values.map((value, index) =>
        mod29(value - key[index])
      );
      const target = signedThreeTargets.get(plain.join(","));
      if (target) {
        andFamilyHits.push({
          left: leftName,
          middle: "H(p,e)[" + coordinate + "]",
          right: rightName,
          key,
          plain,
          target,
        });
      }
    }
  }
}
assert.equal(andFamilyConfigs, 84);
assert.deepEqual(andFamilyHits, [{
  left: "g",
  middle: "H(p,e)[1]",
  right: "b",
  key: [5, 26, 15],
  plain: gp("AND"),
  target: "AND",
}]);

// Charge a second source-token/state family for the four-rune receiver.
// Keys are [H(p,x)[j], p, K*y, y]. Only THEIR reaches an authenticated
// four-rune source target in the complete 7*7*2 family.
const signedFourTargets = new Map(
  [...new Map(
    signedWords
      .map((word) => ({ word, values: gp(word) }))
      .filter((row) => row.values.length === 4)
      .map((row) => [row.values.join(","), row])
  ).values()].map((row) => [row.values.join(","), row.word])
);
const theirReceiver = numbersPair[1];
const theirFamilyHits = [];
let theirFamilyConfigs = 0;
for (const [xName, xValue] of stateVariables) {
  for (const [yName, yValue] of stateVariables) {
    for (let coordinate = 0; coordinate < 2; coordinate += 1) {
      theirFamilyConfigs += 1;
      const key = [
        H(state.p, xValue)[coordinate],
        state.p,
        mod29(state.K * yValue),
        yValue,
      ];
      const plain = theirReceiver.values.map((value, index) =>
        mod29(value - key[index])
      );
      const target = signedFourTargets.get(plain.join(","));
      if (target) {
        theirFamilyHits.push({
          x: xName,
          y: yName,
          coordinate,
          key,
          plain,
          target,
        });
      }
    }
  }
}
assert.equal(theirFamilyConfigs, 98);
assert.deepEqual(theirFamilyHits, [{
  x: "a",
  y: "g",
  coordinate: 0,
  key: [17, 23, 10, 5],
  plain: gp("THEIR"),
  target: "THEIR",
}]);

// Their key shells are themselves compact p28-state expressions.
assert.deepEqual(shell(andFamilyHits[0].key), [
  state.B,
  mod29(state.p - state.e),
  mod29(state.p + state.e),
]);
assert.deepEqual(shell(theirFamilyHits[0].key), [
  mod29(state.K * state.a),
  mod29(state.p - 1),
  mod29(state.p - state.K * state.g),
  mod29(state.K * state.K),
]);



// The immediately preceding p0 word is itself a state packet whose H-shell
// coordinate sum equals GP0(NUMBERS). Charge this over the complete three-case
// adjacent-dual-radix source family.
const numbersPredecessor = p0[p0ByStart.get(189).index - 1];
assert.equal(numbersPredecessor.index, 41);
assert.equal(numbersPredecessor.start, 183);
assert.equal(numbersPredecessor.end, 188);
assert.deepEqual(numbersPredecessor.values, [0,20,7,12,16,25]);
const numbersPredecessorShell = shell(numbersPredecessor.values);
assert.deepEqual(numbersPredecessorShell, [4,25,4,7,24,19]);
assert.deepEqual(numbersPredecessorShell, [
  mod29(state.K * state.K),
  mod29(state.p + state.K),
  mod29(state.K * state.K),
  mod29(state.g + state.K),
  mod29(state.p + 1),
  state.B,
]);
const numbersPredecessorSum = numbersPredecessorShell
  .reduce((total, value) => total + value, 0);
assert.equal(numbersPredecessorSum, gp0("NUMBERS"));
assert.equal(numbersPredecessorSum, 83);

let sixRuneWordCount = 0;
const exactNumbersStatePackets = [];
for (let partIndex = 0; partIndex < 55; partIndex += 1) {
  const physicalPage = partIndex <= 49 ? partIndex : partIndex + 1;
  for (const word of parsePage(parts[partIndex])) {
    if (word.length !== 6) continue;
    sixRuneWordCount += 1;
    const wordShell = shell(word.values);
    if (
      wordShell.length === numbersPredecessorShell.length &&
      wordShell.every((value, index) => value === numbersPredecessorShell[index])
    ) {
      exactNumbersStatePackets.push({
        page: physicalPage,
        word: word.index,
        start: word.start,
        values: word.values,
        shell: wordShell,
      });
    }
  }
}
assert.equal(sixRuneWordCount, 252);
assert.deepEqual(exactNumbersStatePackets, [{
  page: 0,
  word: 41,
  start: 183,
  values: [0,20,7,12,16,25],
  shell: [4,25,4,7,24,19],
}]);

const predecessorFamily = adjacentDualRadix.map((row) => {
  const firstWord = p0ByStart.get(row.starts[0]);
  const predecessor = p0[firstWord.index - 1];
  const predecessorShell = shell(predecessor.values);
  const predecessorSum = predecessorShell
    .reduce((total, value) => total + value, 0);
  return {
    source: row.source,
    gp0: row.address,
    origin: row.origin,
    pairStarts: row.starts,
    predecessor: predecessor.index,
    predecessorStart: predecessor.start,
    predecessorShell,
    predecessorSum,
    matchesSourceGp0: predecessorSum === row.address,
  };
});
assert.deepEqual(
  predecessorFamily.map((row) => [row.source, row.predecessorSum, row.matchesSourceGp0]),
  [
    ["PRIMUS", 68, false],
    ["NUMBERS", 83, true],
    ["OPENPGP", 91, false],
  ]
);

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
    "source-selected plus post-location local-cycle bridge: authenticated NUMBERS is uniquely the only 2016 source word whose GP0 p50 dual-radix outputs form adjacent p0 word starts matching its two preceding GP lengths AND THEIR=[3,4]; the same [189,192] pair is independently reached by ROAD source geometry. ROAD source numbers select the unique zero bracket; its length sends p0 start192 to the seven-rune NUMBERS-shaped receiver at228. Its raw H shell is a unique DH-state packet and sums to75=GP0(READOUT). p50[75]=2v base60=177 is the center of the independently fixed whole READOUT packet166..188; its frozen DH boundary joins the split packet80..102, whose A/K selector yields the exact THE key immediately before the recovered ROAD receiver. The receiver values were exposed before the H/sum consequence was recognized, so this closes mechanism/state structure rather than proving NUMBERS plaintext.",
  numbersDirection: {
    sourceIndex: numbersIndex,
    predecessor: {
      word: numbersPredecessor.index,
      start: numbersPredecessor.start,
      values: numbersPredecessor.values,
      shell: numbersPredecessorShell,
      sum: numbersPredecessorSum,
      exactPackets: exactNumbersStatePackets,
      family: predecessorFamily,
    },
    sourceContext: signedWords.slice(numbersIndex - 2, numbersIndex + 1),
    gp0: gp0("NUMBERS"),
    token: tableTokens[83],
    dualValues: [numbersBase59, numbersBase60],
    starts: numbersPair.map((word) => word.start),
    lengths: numbersPair.map((word) => word.length),
    adjacentDualRadix,
    backwardLengthMatches,
    typedSourceTokens,
    tokenH: numbersTokenH,
    andRecovery: { configs: andFamilyConfigs, hits: andFamilyHits },
    theirRecovery: { configs: theirFamilyConfigs, hits: theirFamilyHits },
  },
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
