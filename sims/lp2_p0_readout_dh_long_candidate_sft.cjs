"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const grid = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-grid-256.json"), "utf8"));
const transcription = fs.readFileSync(path.join(root, "resources/liber-primus/lp2-transcription.txt"), "utf8");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const runeSet = new Set(corpus.runes);
const parts = transcription.split(/^\s*%\s*$/m);
const alphabet60 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx";
const alphabet59 = alphabet60.replace("f", "");
const tableTokens = grid.pages.flatMap((page) => page.tokens);
const tableBytes = grid.pages.flatMap((page) => page.bytes);
assert.equal(tableTokens.length, 256);
assert.equal(tableBytes.length, 256);

function mod(value, modulus = 29) {
  return ((value % modulus) + modulus) % modulus;
}

function powMod(base, exponent, modulus) {
  let out = 1;
  let factor = mod(base, modulus);
  let e = exponent;
  while (e > 0) {
    if (e & 1) out = (out * factor) % modulus;
    factor = (factor * factor) % modulus;
    e = Math.floor(e / 2);
  }
  return out;
}

function H([left, right]) {
  return [mod(left - right), mod(left + right)];
}

function HInverse([difference, sum]) {
  return [
    mod(15 * (difference + sum)),
    mod(15 * (sum - difference)),
  ];
}

function shellDecode(values) {
  const out = [];
  for (let left = 0, right = values.length - 1; left < right; left += 1, right -= 1) {
    out.push(...H([values[left], values[right]]));
  }
  if (values.length % 2) out.push(values[(values.length - 1) / 2]);
  return out;
}

function shellEncode(values) {
  const out = new Array(values.length);
  let input = 0;
  for (let left = 0, right = values.length - 1; left < right; left += 1, right -= 1) {
    const [x, y] = HInverse([values[input], values[input + 1]]);
    out[left] = x;
    out[right] = y;
    input += 2;
  }
  if (values.length % 2) out[(values.length - 1) / 2] = values[input];
  return out;
}

function cube(values) {
  return values.map((value) => powMod(value, 3, 29));
}

function inverseCube(values) {
  return values.map((value) => powMod(value, 19, 29));
}

function decodeToken(token, alphabet) {
  return alphabet.indexOf(token[0]) * alphabet.length + alphabet.indexOf(token[1]);
}

function spell(values) {
  return values.map((value) => corpus.translit[value]).join("");
}

function parsePhysicalPage(page) {
  assert.notEqual(page, 50);
  const source = parts[page < 50 ? page : page - 1];
  const runes = [];
  const words = [];
  let current = [];
  let start = 0;

  function flush() {
    if (!current.length) return;
    const sum = current.reduce((total, value) => total + value, 0);
    words.push({
      number: words.length + 1,
      start,
      end: runes.length - 1,
      length: current.length,
      values: current.slice(),
      sum,
      residue: sum % 29,
    });
    current = [];
  }

  for (const char of [...source]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      if (!current.length) start = runes.length;
      current.push(value);
      runes.push(value);
    } else if (char === "-" || char === ".") {
      flush();
    }
  }
  flush();
  return { runes, words };
}

// Reproduce the already established READ OUT receiver.
assert.equal(tableBytes[55], 80);
assert.equal(tableBytes[20], 102);
const p0 = parsePhysicalPage(0);
const receiver = p0.runes.slice(80, 103);
const receiverWords = p0.words.filter((word) => word.start >= 80 && word.end <= 102);
assert.deepEqual(receiverWords.map((word) => word.number), [18, 19, 20, 21]);
assert.deepEqual(receiverWords.map((word) => word.length), [3, 7, 5, 8]);
assert.deepEqual(receiverWords.map((word) => word.residue), [19, 20, 5, 23]);
assert.equal(receiver.length, 23);
assert.equal(receiver[11], 0);

// Derive the p28 DH/cube state from the already selected source object.
const p28Lines = parts[28].trim().split("/").filter((line) => line.trim().length > 0);
const line6 = [...p28Lines[5]]
  .filter((char) => runeSet.has(char))
  .map((char) => runeIndex.get(char));
assert.equal(line6.length, 23);
assert.equal(line6[11], 0);
assert.deepEqual(line6.slice(0, 2), [23, 8]);

const p28 = parsePhysicalPage(28);
const word28 = p28.words[27];
assert.equal(word28.length, 5);
const line6Start = p28.runes.length - p28.runes.length; // explicit local derivation follows
const line6WordValues = (p28Lines[5].match(/[\u16A0-\u16FF]+/gu) || [])
  .map((word) => [...word].map((rune) => runeIndex.get(rune)));
assert.equal(line6WordValues.length, 5);
assert.deepEqual(line6WordValues.at(-1), word28.values);
const word28StartInLine = line6WordValues.slice(0, -1)
  .reduce((total, word) => total + word.length, 0) + 1;
assert.equal(word28StartInLine, 19);
assert.equal(word28.values[(word28.values.length - 1) / 2], 10);

const dh = {
  p: line6.length,
  g: word28.length,
  a: 6,
  B: word28StartInLine,
};
dh.A = powMod(dh.g, dh.a, dh.p);
dh.b = Array.from({length: dh.p - 1}, (_, i) => i + 1)
  .find((candidate) => powMod(dh.g, candidate, dh.p) === dh.B);
dh.K = powMod(dh.B, dh.a, dh.p);
dh.e = dh.g - dh.K;
assert.deepEqual(dh, {p:23, g:5, a:6, B:19, A:8, b:15, K:2, e:3});

// The selected p0 receiver self-encodes the same state after taking OUT out.
const outGp0 = 20;
const outWord = receiverWords.filter((word) => word.residue === outGp0);
assert.deepEqual(outWord.map((word) => word.number), [19]);
const survivingWords = receiverWords.filter((word) => word.residue !== outGp0);
assert.deepEqual(survivingWords.map((word) => word.residue), [dh.B, dh.g, dh.p]);
assert.deepEqual(survivingWords.map((word) => word.length), [dh.e, dh.g, dh.A]);

// The last surviving pair is literally the GP indices D,H and reproduces b,K.
assert.deepEqual(
  [survivingWords[2].residue, survivingWords[2].length],
  line6.slice(0, 2),
);
assert.deepEqual(H([dh.p, dh.A]), [dh.b, dh.K]);

// The first surviving word, selected as (B,e), cubes to I,D,H.
// This target is fixed by the p28 center I and line prefix D,H.
const word18Cubed = cube(survivingWords[0].values);
assert.deepEqual(word18Cubed, [
  word28.values[(word28.values.length - 1) / 2],
  ...line6.slice(0, 2),
]);
assert.equal(spell(word18Cubed), "IDH");

// Corpus control: the exact cubed I,D,H word occurs only at the selected receiver.
const exactIDH = [];
let totalWords = 0;
for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  for (const word of parsePhysicalPage(page).words) {
    totalWords += 1;
    if (JSON.stringify(cube(word.values)) === JSON.stringify(word18Cubed)) {
      exactIDH.push([page, word.number]);
    }
  }
}
assert.equal(totalWords, 2928);
assert.deepEqual(exactIDH, [[0, 18]]);

// Whole-receiver decoding uses the already fixed operation order H -> cube.
// H selected the cube exponent in the upstream route, so the order is frozen.
const decoded = cube(shellDecode(receiver));
assert.equal(decoded.length, receiver.length);
assert.deepEqual(decoded.slice(0, 3), [20, 3, 21]);
assert.equal(spell(decoded.slice(0, 3)), "LONG");
assert.equal(decoded.slice(0, 3).reduce((sum, value) => sum + value, 0), 44);

// Exact inversion recovers the untouched original receiver.
const reconstructed = shellEncode(inverseCube(decoded));
assert.deepEqual(reconstructed, receiver);

// Wordwise-reset control under the same H -> cube operations does not recover LONG.
const wordwise = receiverWords.flatMap((word) => cube(shellDecode(word.values)));
assert.notDeepEqual(wordwise.slice(0, 3), decoded.slice(0, 3));
assert.equal(spell(wordwise.slice(0, 3)), "STD");

// Matched original-source controls: every whole-word-bounded 23-rune interval
// with exact center F. The selected p0 receiver alone yields first-word GP0=44
// and exact LONG under the frozen whole-block H -> cube transform.
const matched = [];
for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  const parsed = parsePhysicalPage(page);
  const starts = new Set(parsed.words.map((word) => word.start));
  const ends = new Set(parsed.words.map((word) => word.end));
  for (let start = 0; start + 22 < parsed.runes.length; start += 1) {
    const end = start + 22;
    if (!starts.has(start) || !ends.has(end) || parsed.runes[start + 11] !== 0) continue;
    const output = cube(shellDecode(parsed.runes.slice(start, end + 1)));
    matched.push({
      page,
      start,
      end,
      first: output.slice(0, 3),
      firstGp0: output.slice(0, 3).reduce((sum, value) => sum + value, 0),
    });
  }
}
assert.equal(matched.length, 23);
assert.deepEqual(
  matched.filter((row) => row.firstGp0 === 44)
    .map(({page, start, end}) => [page, start, end]),
  [[0, 80, 102]],
);
assert.deepEqual(
  matched.filter((row) => spell(row.first) === "LONG")
    .map(({page, start, end}) => [page, start, end]),
  [[0, 80, 102]],
);

// Independent exact four-word metadata control across all unknown pages.
const stateBlocks = [];
for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  const words = parsePhysicalPage(page).words;
  for (let i = 0; i + 3 < words.length; i += 1) {
    const block = words.slice(i, i + 4);
    const outCount = block.filter((word) => word.residue === outGp0).length;
    const remaining = block.filter((word) => word.residue !== outGp0);
    if (
      outCount === 1 &&
      JSON.stringify(remaining.map((word) => word.residue)) === JSON.stringify([dh.B, dh.g, dh.p]) &&
      JSON.stringify(remaining.map((word) => word.length)) === JSON.stringify([dh.e, dh.g, dh.A])
    ) {
      stateBlocks.push([page, i + 1, i + 4]);
    }
  }
}
assert.deepEqual(stateBlocks, [[0, 18, 21]]);

// LONG has the already established GP0 address44. Under the frozen post-SHED
// base59 table state, address44 reaches the DH root (row23,col5) in a edges.
const map59 = tableTokens.map((token) => decodeToken(token, alphabet59));
const map60 = tableTokens.map((token) => decodeToken(token, alphabet60));
assert(map59.every((value) => value >= 0 && value < 256));
const rootAddress = 23 * 8 + 5;
assert.equal(rootAddress, 189);
assert.equal(map59[rootAddress], rootAddress);

function pathToRoot(map, start, rootValue) {
  const path = [start];
  const seen = new Set(path);
  while (path.at(-1) !== rootValue) {
    const next = map[path.at(-1)];
    assert(!seen.has(next), "cycle before root");
    path.push(next);
    seen.add(next);
  }
  return path;
}

const longAddress = decoded.slice(0, 3).reduce((sum, value) => sum + value, 0);
const longPath = pathToRoot(map59, longAddress, rootAddress);
assert.deepEqual(longPath, [44, 226, 72, 161, 214, 247, 189]);
assert.equal(longPath.length - 1, dh.a);

function orbit(map, start) {
  const out = [];
  const seen = new Set();
  let at = start;
  while (!seen.has(at)) {
    seen.add(at);
    out.push(at);
    at = map[at];
  }
  return out;
}
assert(!orbit(map60, longAddress).includes(rootAddress));

console.log(JSON.stringify({
  status: "PASS",
  classification: "conditional p0 decoder/output candidate; LONG is not authenticated plaintext while READOUT receiver semantics remain unresolved",
  receiver: {
    page: 0,
    offsets: [80, 102],
    original: spell(receiver),
    wordNumbers: receiverWords.map((word) => word.number),
    lengths: receiverWords.map((word) => word.length),
    residues: receiverWords.map((word) => word.residue),
    centerRune: corpus.translit[receiver[11]],
  },
  dh,
  takeOut: {
    outResidue: outGp0,
    removedWord: outWord[0].number,
    survivingResidues: survivingWords.map((word) => word.residue),
    survivingLengths: survivingWords.map((word) => word.length),
    exactStateBlocks: stateBlocks,
  },
  word18Holdout: {
    cubed: word18Cubed,
    text: spell(word18Cubed),
    p28Target: {
      word28Center: corpus.translit[word28.values[2]],
      line6Prefix: spell(line6.slice(0, 2)),
    },
    exactCorpusHits: exactIDH,
  },
  wholeBlockDecoder: {
    operation: "shell H then GP29 cube",
    output: spell(decoded),
    firstWord: spell(decoded.slice(0, 3)),
    firstWordGp0: longAddress,
    exactInverse: spell(reconstructed),
    wordwiseResetControlFirstWord: spell(wordwise.slice(0, 3)),
  },
  matchedControl: {
    comparableIntervals: matched.length,
    gp0_44Hits: matched.filter((row) => row.firstGp0 === 44)
      .map(({page, start, end}) => [page, start, end]),
    LONGHits: matched.filter((row) => spell(row.first) === "LONG")
      .map(({page, start, end}) => [page, start, end]),
  },
  navigationHoldout: {
    base59Path: longPath,
    edgesToDhRoot: longPath.length - 1,
    rootAddress,
    rootCoordinate: [Math.floor(rootAddress / 8), rootAddress % 8],
    base60ReachesRoot: orbit(map60, longAddress).includes(rootAddress),
  },
}, null, 2) + "\n");
