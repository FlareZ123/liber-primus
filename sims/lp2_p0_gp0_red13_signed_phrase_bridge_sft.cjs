"use strict";

/**
 * Single-file test for the p0 red-title GP0 graph -> signed-phrase bridge.
 *
 * Run from the repository root:
 *   node sims/lp2_p0_gp0_red13_signed_phrase_bridge_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const corpus = JSON.parse(
  fs.readFileSync(path.join(ROOT, "resources", "liber-primus", "lp2-corpus.json"), "utf8"),
);
const grid = JSON.parse(
  fs.readFileSync(path.join(ROOT, "resources", "liber-primus", "lp2-grid-256.json"), "utf8"),
);
const transcription = fs.readFileSync(
  path.join(ROOT, "resources", "lp2-transcription.txt"),
  "utf8",
);
const signed2016 = fs.readFileSync(
  path.join(ROOT, "resources", "historical", "cicada2016-4gq25-outguess.asc"),
  "utf8",
);

const M = 29;
const bytes = grid.pages.flatMap((page) => page.bytes);
const tokens = grid.pages.flatMap((page) => page.tokens);
const runeRe = /[ᚠ-᛿]/gu;

/**
 * @param {number} value
 * @returns {number}
 */
function mod29(value) {
  return ((value % M) + M) % M;
}

/**
 * @param {number[]} values
 * @returns {number}
 */
function sum(values) {
  return values.reduce((acc, value) => acc + value, 0);
}

/**
 * @param {number} n
 * @returns {number}
 */
function phi(n) {
  if (n === 0) return 0;
  let m = n;
  let out = n;
  for (let d = 2; d * d <= m; d += 1) {
    if (m % d !== 0) continue;
    while (m % d === 0) m /= d;
    out -= out / d;
  }
  if (m > 1) out -= out / m;
  return Math.round(out);
}

/**
 * @param {number} n
 * @returns {number}
 */
function primePi(n) {
  let count = 0;
  for (let x = 2; x <= n; x += 1) {
    let prime = true;
    for (let d = 2; d * d <= x; d += 1) {
      if (x % d === 0) {
        prime = false;
        break;
      }
    }
    if (prime) count += 1;
  }
  return count;
}

/**
 * @returns {{index:number,start:number,end:number,length:number,indices:number[],translit:string}[]}
 */
function parseP0Words() {
  const p0Source = transcription.split("%")[0];
  const compact = p0Source
    .replaceAll("/", "")
    .replaceAll("\n", "")
    .replaceAll("\r", "");

  let cursor = 0;
  return compact
    .split(/[-.&$§,:!?]/u)
    .map((piece) => (piece.match(runeRe) || []).join(""))
    .filter(Boolean)
    .map((word, index) => {
      const indices = [...word].map((rune) => corpus.runes.indexOf(rune));
      const row = {
        index,
        start: cursor,
        end: cursor + indices.length - 1,
        length: indices.length,
        indices,
        translit: indices.map((value) => corpus.translit[value]).join(""),
      };
      cursor += indices.length;
      return row;
    });
}

const gpAlphabet = corpus.translit
  .map((token, index) => ({ token: token.toLowerCase(), index }))
  .sort((a, b) => b.token.length - a.token.length);

/**
 * @param {string} word
 * @returns {number[]}
 */
function gp(word) {
  const normalized = word
    .toLowerCase()
    .replaceAll("v", "u")
    .replaceAll("k", "c")
    .replaceAll("z", "s");

  const out = [];
  for (let i = 0; i < normalized.length; ) {
    const hit = gpAlphabet.find((entry) => normalized.startsWith(entry.token, i));
    assert.ok(hit, `unencodable signed word: ${word} at ${i}`);
    out.push(hit.index);
    i += hit.token.length;
  }
  return out;
}

/**
 * @returns {string[]}
 */
function parseSignedWords() {
  const match = signed2016.match(
    /Hash: SHA1\r?\n\r?\n([\s\S]*?)\r?\n-----BEGIN PGP SIGNATURE-----/,
  );
  assert.ok(match, "signed 2016 body");
  const body = match[1].replaceAll("7A35090F", "");
  return body.match(/[A-Za-z]+/g) || [];
}

/**
 * @param {{start:number,end:number,index:number}[]} words
 * @param {number} offset
 * @returns {number}
 */
function ownerOf(words, offset) {
  const hit = words.find((word) => offset >= word.start && offset <= word.end);
  assert.ok(hit, `missing p0 owner at offset ${offset}`);
  return hit.index;
}

/**
 * @param {number[]} next
 * @param {number} start
 * @returns {{transient:number[],cycle:number[]}}
 */
function cycleInfo(next, start) {
  const seen = new Map();
  const pathTaken = [];
  let node = start;

  for (;;) {
    if (seen.has(node)) {
      const at = seen.get(node);
      return {
        transient: pathTaken.slice(0, at),
        cycle: pathTaken.slice(at),
      };
    }
    seen.set(node, pathTaken.length);
    pathTaken.push(node);
    node = next[node];
  }
}

/**
 * xorshift32 for deterministic permutation controls.
 *
 * @param {{state:number}} rng
 * @returns {number}
 */
function nextU32(rng) {
  let state = rng.state >>> 0;
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  rng.state = state >>> 0;
  return rng.state;
}

/**
 * @param {number[]} source
 * @param {{state:number}} rng
 * @returns {number[]}
 */
function shuffled(source, rng) {
  const out = source.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = nextU32(rng) % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const words = parseP0Words();
const signedWords = parseSignedWords();
const p0 = corpus.pages.find((page) => page.page === 0).indices;

assert.equal(words.length, 59, "p0 complete words");
assert.equal(p0.length, 262, "p0 rune count");
assert.deepEqual(
  words.slice(0, 2).map((word) => word.length),
  [8, 5],
  "red-title word lengths",
);

const wordSums = words.map((word) => sum(word.indices));
assert.ok(wordSums.every((value) => value < 256), "all p0 word GP0 sums address p50");

const next = words.map((word, index) => {
  const offset = bytes[wordSums[index]];
  return ownerOf(words, offset);
});

const seed0 = cycleInfo(next, 0);
const seed1 = cycleInfo(next, 1);
assert.deepEqual(seed0.transient, [0], "first red word transient");
assert.deepEqual(seed1.transient, [1], "second red word transient");
assert.equal(seed0.cycle.length, 11, "first red-word attractor length");
assert.equal(seed1.cycle.length, 2, "second red-word attractor length");
assert.equal(
  seed0.cycle.some((node) => seed1.cycle.includes(node)),
  false,
  "red-title cycles are disjoint",
);

const union = [...seed0.cycle, ...seed1.cycle];
assert.deepEqual(
  union,
  [50, 18, 9, 44, 22, 25, 41, 32, 28, 40, 36, 5, 10],
  "red-title cycle union in source order",
);
assert.equal(union.length, 13, "13 selected cycle words");
assert.equal(
  sum(union.map((index) => words[index].length)),
  71,
  "13 cycle words contain 71 runes",
);

const signedRows = signedWords.map((word, index) => {
  const indices = gp(word);
  return {
    index,
    word,
    length: indices.length,
    gp0: sum(indices),
  };
});

const gp71 = signedRows.filter((row) => row.gp0 === 71);
const gp102 = signedRows.filter((row) => row.gp0 === 102);
assert.deepEqual(
  gp71.map((row) => row.word.toLowerCase()),
  ["seeks"],
  "SEEKS is unique signed GP0=71 word",
);
assert.deepEqual(
  gp102.map((row) => row.word.toLowerCase()),
  ["devoted"],
  "DEVOTED is unique signed GP0=102 word",
);

const adjacent85 = [];
for (let i = 0; i + 1 < signedRows.length; i += 1) {
  if (signedRows[i].length === 8 && signedRows[i + 1].length === 5) {
    adjacent85.push([
      signedRows[i].word.toLowerCase(),
      signedRows[i + 1].word.toLowerCase(),
    ]);
  }
}
assert.deepEqual(adjacent85, [["epiphany", "seeks"]], "unique signed 8/5 adjacency");

const fourWordHits = [];
for (let i = 0; i + 3 < signedRows.length; i += 1) {
  const [a, b, c, d] = signedRows.slice(i, i + 4);
  const shape = a.length === 8 && b.length === 5;
  const graphCount = b.gp0 === 71;
  const primeStep = primePi(b.gp0) === c.gp0;
  const tableStep = c.gp0 < 256 && bytes[c.gp0] === d.gp0;
  if (shape || graphCount || primeStep || tableStep) {
    fourWordHits.push({
      i,
      words: [a.word, b.word, c.word, d.word].map((word) => word.toLowerCase()),
      shape,
      graphCount,
      primeStep,
      tableStep,
    });
  }
}
assert.deepEqual(
  fourWordHits,
  [{
    i: 5,
    words: ["epiphany", "seeks", "the", "devoted"],
    shape: true,
    graphCount: true,
    primeStep: true,
    tableStep: true,
  }],
  "unique authenticated four-word source-order window",
);

assert.equal(primePi(71), 20, "pi(71)");
assert.ok(
  signedRows.some((row) => row.word.toLowerCase() === "the" && row.gp0 === 20),
  "GP0(THE)=20",
);
assert.equal(bytes[20], 102, "T[20]=102");
assert.equal(tokens[20], "1g", "printed p50 cell20 token");

/*
 * Candidate-crib shift tape:
 * p0 title EPIPHANY SEEKS and later THE DEVOTED.
 */
const candidatePlainWords = [
  { p0Word: 0, plain: "epiphany" },
  { p0Word: 1, plain: "seeks" },
  { p0Word: 52, plain: "the" },
  { p0Word: 53, plain: "devoted" },
];

const crib = [];
for (const row of candidatePlainWords) {
  const cipher = words[row.p0Word].indices;
  const plain = gp(row.plain);
  assert.equal(cipher.length, plain.length, `crib length ${row.plain}`);
  for (let j = 0; j < cipher.length; j += 1) {
    crib.push({
      pos: words[row.p0Word].start + j,
      shift: mod29(cipher[j] - plain[j]),
    });
  }
}

const titleCrib = crib.filter((row) => row.pos <= 12);
const lateCrib = crib.filter((row) => row.pos >= 235);
assert.equal(titleCrib.length, 13);
assert.equal(lateCrib.length, 9);

/*
 * Source-natural period gates.
 */
const byPhase27 = new Map();
let period27Conflict = 0;
for (const row of crib) {
  const phase = row.pos % 27;
  if (byPhase27.has(phase) && byPhase27.get(phase) !== row.shift) {
    period27Conflict += 1;
  } else {
    byPhase27.set(phase, row.shift);
  }
}
assert.equal(period27Conflict, 1, "period-27 additive conflict");

const byPhase29 = new Map();
let period29Conflict = 0;
for (const row of crib) {
  const phase = row.pos % 29;
  if (byPhase29.has(phase) && byPhase29.get(phase) !== row.shift) {
    period29Conflict += 1;
  } else {
    byPhase29.set(phase, row.shift);
  }
}
assert.equal(period29Conflict, 9, "period-29 additive conflicts");

/*
 * Exhaustive p50 cyclic affine readout gate.
 */
const digitAlphabet = grid.alphabet;
const registers = {
  raw: bytes.map((value) => mod29(value)),
  phi: bytes.map((value) => mod29(phi(value))),
  base29q: bytes.map((value) => Math.floor(value / 29)),
  base29r: bytes.map((value) => value % 29),
  hi: tokens.map((token) => mod29(digitAlphabet.indexOf(token[0]))),
  lo: tokens.map((token) => mod29(digitAlphabet.indexOf(token[1]))),
};

let maxTrain = -1;
let maxHoldoutAmongMaxTrain = -1;

for (const source of Object.values(registers)) {
  for (const reverse of [false, true]) {
    const register = reverse ? source.slice().reverse() : source;
    for (let phase = 0; phase < 256; phase += 1) {
      let localTrain = -1;
      let localHoldout = -1;
      for (let a = 0; a < 29; a += 1) {
        for (let b = 0; b < 29; b += 1) {
          let trainHits = 0;
          let holdoutHits = 0;
          for (const row of titleCrib) {
            const value = register[(phase + row.pos) % 256];
            if (mod29(a * value + b) === row.shift) trainHits += 1;
          }
          for (const row of lateCrib) {
            const value = register[(phase + row.pos) % 256];
            if (mod29(a * value + b) === row.shift) holdoutHits += 1;
          }
          if (
            trainHits > localTrain ||
            (trainHits === localTrain && holdoutHits > localHoldout)
          ) {
            localTrain = trainHits;
            localHoldout = holdoutHits;
          }
        }
      }
      if (localTrain > maxTrain) {
        maxTrain = localTrain;
        maxHoldoutAmongMaxTrain = localHoldout;
      } else if (localTrain === maxTrain) {
        maxHoldoutAmongMaxTrain = Math.max(maxHoldoutAmongMaxTrain, localHoldout);
      }
    }
  }
}

assert.equal(maxTrain, 6, "best p50 cyclic affine title fit");
assert.equal(maxHoldoutAmongMaxTrain, 0, "holdout hits at maximum title fit");

/*
 * Deterministic exact-byte-multiset permutation diagnostic.
 * This is deliberately classified as conditional, not a familywise p-value.
 */
const owner = new Array(256);
for (const word of words) {
  for (let offset = word.start; offset <= Math.min(word.end, 255); offset += 1) {
    owner[offset] = word.index;
  }
}
assert.ok(owner.every(Number.isInteger), "all p50 byte outputs have p0 word owners");

const rng = { state: 0x07120102 };
const controls = 200000;
let broad = 0;
let exact = 0;
let full = 0;
let fullExact = 0;

for (let trial = 0; trial < controls; trial += 1) {
  const permuted = shuffled(bytes, rng);
  const trialNext = words.map((word, index) => owner[permuted[wordSums[index]]]);
  const a = cycleInfo(trialNext, 0).cycle;
  const b = cycleInfo(trialNext, 1).cycle;
  if (a.some((node) => b.includes(node))) continue;

  const nodes = [...a, ...b];
  const hit =
    nodes.length === 13 &&
    sum(nodes.map((index) => words[index].length)) === 71;
  if (!hit) continue;

  broad += 1;
  const exactSplit = a.length === 11 && b.length === 2;
  if (exactSplit) exact += 1;
  if (permuted[20] === 102) {
    full += 1;
    if (exactSplit) fullExact += 1;
  }
}

assert.deepEqual(
  [broad, exact, full, fullExact],
  [60, 6, 1, 0],
  "deterministic 200k permutation control",
);

console.log("PASS p0 red-title GP0 signed-phrase bridge");
console.log({
  redTitleLengths: words.slice(0, 2).map((word) => word.length),
  cycleLengths: [seed0.cycle.length, seed1.cycle.length],
  selectedWords: union.length,
  selectedRuneCount: 71,
  chain: "71=SEEKS -> pi(71)=20=THE -> T[20]=102=DEVOTED",
  candidateCribShifts: crib,
  p50CyclicAffineGate: {
    maxTitleHits: maxTrain,
    lateHitsAmongMaximumTitleFits: maxHoldoutAmongMaxTrain,
  },
  permutationControl: {
    trials: controls,
    broad,
    exact,
    full,
    fullExact,
    classification: "conditional diagnostic, not familywise p-value",
  },
});
