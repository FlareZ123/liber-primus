"use strict";

/**
 * SFT: p0 red13 ciphertext state packet, THE WAY readout, and the exact
 * state-derived additive key for the independently selected EPIPHANY SEEKS.
 *
 * Node.js 22, CommonJS, read-only.
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
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const ink = JSON.parse(
  read("resources/liber-primus/lp2-p0-physical-ink-override.json")
);
const solved = JSON.parse(
  read("resources/external/relikd-solved-gp29-native-v1.json")
);
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");

const M = 29;
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({symbol, value}))
  .sort((left, right) => right.symbol.length - left.symbol.length);

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % M) + M) % M;
}

/** @param {number[]} values @returns {number} */
function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

/**
 * Interleaved outside-in H:
 * [d0,s0,d1,s1,...,center].
 *
 * @param {number[]} values
 * @returns {number[]}
 */
function interleavedH(values) {
  const out = [];
  for (
    let left = 0, right = values.length - 1;
    left < right;
    left += 1, right -= 1
  ) {
    out.push(
      mod29(values[left] - values[right]),
      mod29(values[left] + values[right])
    );
  }
  if (values.length % 2 === 1) {
    out.push(values[Math.floor(values.length / 2)]);
  }
  return out;
}

/** @param {number[]} values @returns {number} */
function shellSum(values) {
  return mod29(sum(interleavedH(values)));
}

/** @param {number[]} values @returns {string} */
function equalityPattern(values) {
  const classes = new Map();
  return values
    .map((value) => {
      if (!classes.has(value)) classes.set(value, classes.size);
      return classes.get(value);
    })
    .join(",");
}

/** @param {string} text @returns {number[]} */
function gpText(text) {
  const normalized = text
    .toUpperCase()
    .replace(/K/g, "C")
    .replace(/V/g, "U")
    .replace(/Q/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");

  const out = [];
  for (let index = 0; index < normalized.length;) {
    const token = gpTokens.find((row) =>
      normalized.startsWith(row.symbol, index)
    );
    assert.ok(token, "unmapped GP spelling: " + normalized.slice(index));
    out.push(token.value);
    index += token.symbol.length;
  }
  return out;
}

/**
 * Split a rune-native source on every non-rune separator.
 *
 * @param {string} source
 * @returns {number[][]}
 */
function runeWords(source) {
  const out = [];
  let current = [];
  for (const character of [...source]) {
    const value = runeIndex.get(character);
    if (value !== undefined) {
      current.push(value);
    } else if (current.length) {
      out.push(current);
      current = [];
    }
  }
  if (current.length) out.push(current);
  return out;
}

/**
 * Parse complete printed words on each unknown physical page.
 * Whitespace and "/" preserve an in-progress word across layout wraps.
 *
 * @returns {Array<{page:number,words:Array<{start:number,values:number[]}>}>}
 */
function unknownPhysicalWords() {
  const parts = transcription.split(/^\s*%\s*$/m).slice(0, 55);
  return parts.map((part, segment) => {
    const page = segment >= 50 ? segment + 1 : segment;
    const words = [];
    let current = [];
    let start = 0;
    let offset = 0;

    const finish = () => {
      if (!current.length) return;
      words.push({start, values: current});
      current = [];
    };

    for (const character of [...part]) {
      const value = runeIndex.get(character);
      if (value !== undefined) {
        if (!current.length) start = offset;
        current.push(value);
        offset += 1;
      } else if (character === "/" || /\s/u.test(character)) {
        // Printed line/page layout does not itself end a word.
      } else {
        finish();
      }
    }
    finish();
    return {page, words};
  });
}

const state = Object.freeze({
  p: 23,
  g: 5,
  a: 6,
  b: 15,
  A: 8,
  B: 19,
  K: 2,
  e: 3,
  q: 4,
});

// Original image adjudication fixes the exact red 8+5 title and marker13.
const redWords = ink.physical_zero_based.red_words.map((word) =>
  word.gp_indices
);
assert.deepEqual(redWords.map((word) => word.length), [8, 5]);
assert.equal(ink.physical_zero_based.large_punctuation[0].after_runes, 13);
assert.equal(ink.physical_zero_based.large_punctuation[0].dots, 13);

const cipherWord1 = redWords[0];
const cipherWord2 = redWords[1];
const cipher = [...cipherWord1, ...cipherWord2];
assert.deepEqual(cipher, corpus.pages.find((page) => page.page === 0).indices.slice(0, 13));
assert.deepEqual(cipher, [
  15,8,18,3,6,19,27,0,
  15,26,18,21,5,
]);

// Authenticated signed message and the independently selected phrase.
const clear = signed
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .replace(/^-----BEGIN PGP SIGNED MESSAGE-----[\s\S]*?Hash: SHA1\s*/, "")
  .replace(/\b3301\b/g, "")
  .replace(/\b[0-9A-F]{8,}\b/g, "");
const signedWords = (clear.match(/[A-Za-z]+/g) || []).map((text, index) => ({
  index,
  text: text.toUpperCase(),
  values: gpText(text),
}));
assert.equal(signedWords.length, 43);
assert.equal(signedWords[1].text, "THE");
assert.equal(signedWords[13].text, "WAY");
assert.equal(signedWords[5].text, "EPIPHANY");
assert.equal(signedWords[6].text, "SEEKS");

const plainWord1 = signedWords[5].values;
const plainWord2 = signedWords[6].values;
const plain = [...plainWord1, ...plainWord2];
assert.deepEqual(plainWord1, [18,13,10,13,8,24,9,26]);
assert.deepEqual(plainWord2, [15,18,18,5,15]);

// Untouched ciphertext: every rune is a simple state expression.
const cipherFromState = [
  state.b,
  state.A,
  mod29(state.A - state.B),
  state.e,
  state.a,
  state.B,
  mod29(-state.K),
  0,
  state.b,
  mod29(-state.e),
  mod29(state.A - state.B),
  mod29(state.p - state.K),
  state.g,
];
assert.deepEqual(cipher, cipherFromState);

// The exact additive key is itself an ordered state schedule.
const stateKey = [
  mod29(-state.e),
  mod29(-state.g),
  state.A,
  state.B,
  mod29(-state.K),
  mod29(-state.g),
  mod29(state.A - state.B),
  state.e,
  0,
  state.A,
  0,
  mod29(state.K - state.b),
  state.B,
];
assert.deepEqual(stateKey, [
  26,24,8,19,27,24,18,3,
  0,8,0,16,19,
]);

const recovered = cipher.map((value, index) =>
  mod29(value - stateKey[index])
);
assert.deepEqual(recovered, plain);
assert.deepEqual(
  recovered.map((value, index) => mod29(value + stateKey[index])),
  cipher
);

// Word-local ciphertext H shells and ciphertext-only THE WAY readout.
const cipherH1 = interleavedH(cipherWord1);
const cipherH2 = interleavedH(cipherWord2);
assert.deepEqual(cipherH1, [15,15,10,6,28,8,26,9]);
assert.deepEqual(cipherH2, [10,20,5,18,18]);
assert.deepEqual(cipherH1, [
  state.b,
  state.b,
  state.A + state.K,
  state.a,
  mod29(-1),
  state.A,
  mod29(-state.e),
  state.q + state.g,
]);
assert.deepEqual(cipherH2, [
  state.A + state.K,
  state.p - state.e,
  state.g,
  mod29(state.A - state.B),
  mod29(state.A - state.B),
]);
assert.deepEqual([shellSum(cipherWord1), shellSum(cipherWord2)], [1,13]);

// Candidate and key word-local shells.
const plainH1 = interleavedH(plainWord1);
const plainH2 = interleavedH(plainWord2);
assert.deepEqual(plainH1, [21,15,4,22,15,5,5,21]);
assert.deepEqual(plainH2, [0,1,13,23,18]);
assert.deepEqual([shellSum(plainWord1), shellSum(plainWord2)], [21,26]);

const keyWord1 = stateKey.slice(0, 8);
const keyWord2 = stateKey.slice(8);
const keyH1 = interleavedH(keyWord1);
const keyH2 = interleavedH(keyWord2);
assert.deepEqual(keyH1, [23,0,6,13,13,3,21,17]);
assert.deepEqual(keyH2, [10,19,21,24,0]);
assert.deepEqual([shellSum(keyWord1), shellSum(keyWord2)], [9,16]);

// Manuscript-wide adjacent 8+5 charge.
const physicalPages = unknownPhysicalWords();
const adjacent8x5 = [];
for (const page of physicalPages) {
  for (let index = 0; index + 1 < page.words.length; index += 1) {
    const left = page.words[index];
    const right = page.words[index + 1];
    if (left.values.length !== 8 || right.values.length !== 5) continue;
    adjacent8x5.push({
      page: page.page,
      word: index + 1,
      start: left.start,
      shellSums: [shellSum(left.values), shellSum(right.values)],
    });
  }
}
assert.equal(adjacent8x5.length, 19);
assert.deepEqual(
  adjacent8x5.filter((row) =>
    row.shellSums[0] === 1 && row.shellSums[1] === 13
  ),
  [{page:0, word:1, start:0, shellSums:[1,13]}]
);

// Whole-title H shell and visible 4|5|4 marker reduction.
const titleH = interleavedH(cipher);
assert.deepEqual(titleH, [
  10,20,16,0,0,7,6,0,20,21,19,19,27,
]);
assert.deepEqual(titleH, [
  state.A + state.K,
  state.p - state.e,
  mod29(state.K - state.b),
  0,
  0,
  state.g + state.K,
  state.a,
  0,
  state.p - state.e,
  state.p - state.K,
  state.B,
  state.B,
  mod29(-state.K),
]);

const markerColumns = [4,5,4];
assert.equal(sum(markerColumns), 13);

/**
 * @param {number[]} values
 * @returns {{groups:number[],packet:number[]}}
 */
function markerPacket(values) {
  const shell = interleavedH(values);
  const groups = [];
  let offset = 0;
  for (const length of markerColumns) {
    groups.push(mod29(sum(shell.slice(offset, offset + length))));
    offset += length;
  }
  return {groups, packet: interleavedH(groups)};
}

const cipherMarker = markerPacket(cipher);
assert.deepEqual(cipherMarker.groups, [17,4,28]);
assert.deepEqual(cipherMarker.packet, [
  mod29(state.A - state.B),
  mod29(state.K - state.b),
  state.q,
]);
assert.deepEqual(cipherMarker.packet, [18,16,4]);

const plainMarker = markerPacket(plain);
assert.deepEqual(plainMarker.groups, [4,10,22]);
assert.deepEqual(plainMarker.packet, [
  state.a + state.g,
  mod29(-state.e),
  state.A + state.K,
]);

const keyMarker = markerPacket(stateKey);
assert.deepEqual(keyMarker.groups, [13,23,6]);
assert.deepEqual(keyMarker.packet, [
  state.g + state.K,
  state.B,
  state.p,
]);

// Charge all page-local 13-rune windows against the ciphertext packet and
// against the full title-H equality structure.
const expectedPacket = cipherMarker.packet;
const targetPattern = equalityPattern(titleH);
const packetHits = [];
const patternHits = [];
let thirteenWindows = 0;

for (const page of corpus.pages) {
  if (page.page > 55 || page.page === 50) continue;
  for (let start = 0; start + 13 <= page.indices.length; start += 1) {
    thirteenWindows += 1;
    const window = page.indices.slice(start, start + 13);
    const packet = markerPacket(window).packet;
    if (packet.every((value, index) => value === expectedPacket[index])) {
      packetHits.push({page: page.page, start, packet});
    }
    if (equalityPattern(interleavedH(window)) === targetPattern) {
      patternHits.push({page: page.page, start});
    }
  }
}
assert.equal(thirteenWindows, 12296);
assert.deepEqual(packetHits, [
  {page:0, start:0, packet:[18,16,4]},
]);
assert.deepEqual(patternHits, [{page:0, start:0}]);

// Broad source-native 8+5 lexical control.
const lexicalPool = new Map();
for (const section of solved.sections) {
  for (const values of runeWords(section.source_text)) {
    const text = values.map((value) => corpus.translit[value]).join("");
    lexicalPool.set(text, {text, values, source:"solved"});
  }
}
for (const row of signedWords) {
  lexicalPool.set(row.text, {
    text: row.text,
    values: row.values,
    source: "signed2016",
  });
}

const length8 = [...lexicalPool.values()].filter((row) =>
  row.values.length === 8
);
const length5 = [...lexicalPool.values()].filter((row) =>
  row.values.length === 5
);
assert.equal(lexicalPool.size, 295);
assert.equal(length8.length, 18);
assert.equal(length5.length, 38);

const exactStateKeyHits = [];
const jointStateHits = [];
let lexicalCases = 0;

for (const sign of [1,-1]) {
  for (const left of length8) {
    for (const right of length5) {
      lexicalCases += 1;
      const candidate = [...left.values, ...right.values];
      const key = cipher.map((value, index) =>
        mod29(sign === 1
          ? value - candidate[index]
          : candidate[index] - value)
      );

      const exact = key.every((value, index) =>
        value === stateKey[index]
      );

      const keyPacket = markerPacket(key).packet;
      const keyWordSums = [
        shellSum(key.slice(0, 8)),
        shellSum(key.slice(8)),
      ];
      const candidateWordSums = [
        shellSum(left.values),
        shellSum(right.values),
      ];
      const joint =
        keyPacket[0] === state.g + state.K
        && keyPacket[1] === state.B
        && keyPacket[2] === state.p
        && keyWordSums[0] === 9
        && keyWordSums[1] === 16
        && candidateWordSums[0] === 21
        && candidateWordSums[1] === 26;

      const row = {
        sign: sign === 1 ? "C-P" : "P-C",
        left: left.text,
        right: right.text,
        leftSource: left.source,
        rightSource: right.source,
      };
      if (exact) exactStateKeyHits.push(row);
      if (joint) jointStateHits.push(row);
    }
  }
}

assert.equal(lexicalCases, 1368);
const expectedLexicalHit = [{
  sign:"C-P",
  left:"EPIPHANY",
  right:"SEEKS",
  leftSource:"signed2016",
  rightSource:"signed2016",
}];
assert.deepEqual(exactStateKeyHits, expectedLexicalHit);
assert.deepEqual(jointStateHits, expectedLexicalHit);

console.log(JSON.stringify({
  status: "PASS",
  state,
  p0: {
    cipher,
    cipherStateTyping: [
      "b","A","A-B","e","a","B","-K","0",
      "b","-e","A-B","p-K","g",
    ],
    ciphertextWordHSums: [1,13],
    ciphertextWordLabels: ["THE","WAY"],
    titleH,
    markerColumns,
    cipherMarker,
  },
  recovery: {
    plaintext: "EPIPHANY SEEKS",
    plain,
    stateKey,
    stateKeyTyping: [
      "-e","-g","A","B","-K","-g","A-B","e",
      "0","A","0","K-b","B",
    ],
    keyMarker,
    keyMarkerLabels: ["WAY","ROAD","SEEKS"],
    plaintextWordHSums: [21,26],
    keyWordHSums: [9,16],
  },
  controls: {
    adjacent8x5: adjacent8x5.length,
    thirteenWindows,
    markerPacketHits: packetHits,
    titlePatternHits: patternHits,
    lexicalPool: lexicalPool.size,
    length8: length8.length,
    length5: length5.length,
    lexicalCases,
    exactStateKeyHits,
    jointStateHits,
  },
}, null, 2));
