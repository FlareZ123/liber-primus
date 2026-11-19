"use strict";

/**
 * Source-constrained p55 core -> signed-2016 word -> DH-state packet.
 *
 * This is an intermediate structural result, not a plaintext decoder. The
 * H transform and p28 state are reconstructed from original LP2 source;
 * branch coordinates address the first 29 authenticated signed-2016 words
 * under the established zero-based convention. GP-prime word sums are
 * reduced modulo the independently reconstructed p28 modulus.
 *
 * Run:
 *   node sims/lp2_p55_h_core_signedword_dh_state_bridge_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = relative =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");

const transcription = read("resources/liber-primus/lp2-transcription.txt");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const runePattern = /[\u16A0-\u16FF]/u;
const gpTokens = corpus.translit
  .map((symbol, value) => ({symbol, value}))
  .sort((left, right) => right.symbol.length - left.symbol.length);

const mod29 = value => (value % 29 + 29) % 29;
const H = (left, right) => [
  mod29(left - right),
  mod29(left + right),
];

function gp(word) {
  const normalized = word
    .toUpperCase()
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
    const token = gpTokens.find(candidate =>
      normalized.startsWith(candidate.symbol, offset)
    );
    assert.ok(token, "unmapped GP spelling at " + normalized.slice(offset));
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}

function signedWords() {
  const clear = signed2016
    .split("-----BEGIN PGP SIGNATURE-----")[0]
    .split(/\n\n/u)
    .slice(1)
    .join("\n");

  return clear
    .split(/[^A-Za-z0-9]+/u)
    .filter(token => /^[A-Za-z]+$/u.test(token))
    .map(word => word.toUpperCase());
}

function physicalLines(page) {
  const parts = transcription.split(/^\s*%\s*$/m);
  return parts[page]
    .split("/")
    .filter(line => runePattern.test(line));
}

function lineFragments(line) {
  return (line.match(/[\u16A0-\u16FF]+/gu) || []).map(fragment =>
    [...fragment].map(rune => {
      const value = runeIndex.get(rune);
      assert.notEqual(value, undefined);
      return value;
    })
  );
}

function multiplicativeInverse(value, modulus) {
  for (let candidate = 1; candidate < modulus; candidate += 1) {
    if ((value * candidate) % modulus === 1) return candidate;
  }
  return null;
}

// Reconstruct p28's DH state from its literal-DH line, not from the target.
const p28Lines = physicalLines(28);
assert.equal(p28Lines.length, 12);
const dhFragments = lineFragments(p28Lines[5]);
assert.equal(dhFragments.length, 5);
assert.deepEqual(dhFragments[0].map(value => corpus.translit[value]), ["D", "H"]);
const firstH = H(dhFragments[0][0], dhFragments[0].at(-1));
const lastH = H(dhFragments.at(-1)[0], dhFragments.at(-1).at(-1));
const state = {
  p: dhFragments.flat().length,
  g: dhFragments.length,
  a: 6,
  b: firstH[0],
  A: lastH[0],
  B: lastH[1],
  K: firstH[1],
};
const e = multiplicativeInverse(state.b, state.p - 1);
assert.deepEqual(state, {p:23, g:5, a:6, b:15, A:8, B:19, K:2});
assert.equal(e, 3);

const sourceWords = signedWords();
assert.equal(sourceWords.length, 43);
assert.equal(corpus.prime.length, 29);
const sourcePrimeSums = sourceWords.map(word =>
  gp(word).reduce((sum, value) => sum + corpus.prime[value], 0)
);
const sourcePrimeResidues = sourcePrimeSums.map(sum => sum % state.p);

// Parse complete printed words with the canonical cross-page word parser.
const segments = transcription.split("%").slice(0, 55);
const stream = segments.join("%");
const words = [];
let current = [];
let runePage = 0;

function finishWord() {
  if (!current.length) return;
  words.push(current);
  current = [];
}

for (const character of stream) {
  if (runePattern.test(character)) {
    current.push({page:runePage, value:runeIndex.get(character)});
  } else if (character === "%") {
    runePage += 1;
  } else if (character === "/" || /\s/u.test(character)) {
    // Physical line wrapping preserves the current printed word.
  } else {
    finishWord();
  }
}
finishWord();

function physicalPage(page) {
  return page >= 50 ? page + 1 : page;
}

const completeWordsByPhysicalPage = new Map();
for (let page = 0; page < segments.length; page += 1) {
  const completeWords = words
    .filter(word => word[0].page === page && word.at(-1).page === page)
    .map(word => word.map(site => site.value));
  completeWordsByPhysicalPage.set(physicalPage(page), completeWords);
}
completeWordsByPhysicalPage.set(50, []);

function recursiveCore(values) {
  let layer = values.slice();
  while (layer.length > 1) layer = layer.slice(1, -1);
  return layer.length ? layer[0] : null;
}

function coreSignature(wordValues) {
  const cores = wordValues.map(recursiveCore).filter(value => value !== null);
  const pairs = [];
  for (let index = 0; index < Math.floor(cores.length / 2); index += 1) {
    pairs.push(H(cores[index], cores[cores.length - 1 - index]));
  }
  return {
    cores,
    difference: pairs.map(pair => pair[0]),
    sum: pairs.map(pair => pair[1]),
    gp0: cores.reduce((total, value) => total + value, 0),
    h0: pairs.reduce((total, pair) => total + pair[0], 0),
    h1: pairs.reduce((total, pair) => total + pair[1], 0),
    center: cores.length % 2 ? cores[(cores.length - 1) / 2] : null,
  };
}

function packet(signature, indexOrigin = 0, branchOrder = "difference-center-sum") {
  const indexes = [...signature.difference, ...signature.sum];
  const wordsAtIndexes = indexes.map(index => sourceWords[index - indexOrigin] || null);
  if (wordsAtIndexes.some(word => word === null)) return null;
  const residues = indexes.map(index =>
    sourcePrimeResidues[index - indexOrigin]
  );
  const differenceResidues = residues.slice(0, signature.difference.length);
  const sumResidues = residues.slice(signature.difference.length);
  const vector = branchOrder === "difference-center-sum"
    ? [...differenceResidues, signature.center, ...sumResidues]
    : [...sumResidues, signature.center, ...differenceResidues];
  return {
    indexes,
    words: wordsAtIndexes,
    primeSums: indexes.map(index => sourcePrimeSums[index - indexOrigin]),
    primeResidues: residues,
    vector,
  };
}

const p55Words = completeWordsByPhysicalPage.get(55);
assert.ok(p55Words);
assert.equal(p55Words.length, 16);
const p55 = coreSignature(p55Words);
assert.deepEqual(p55.cores, [1,6,2,11,18]);
assert.equal(p55.gp0, 38);
assert.equal(p55.h0, 36);
assert.equal(p55.h1, 36);
assert.equal(p55.center, state.K);
assert.deepEqual(p55.difference, [12,24]);
assert.deepEqual(p55.sum, [19,17]);

const expected = [e, state.A, state.K, state.p - 1, e];
const p55Packet = packet(p55, 0, "difference-center-sum");
assert.ok(p55Packet);
assert.deepEqual(p55Packet.words, ["THE","AND","THEIR","THE"]);
assert.deepEqual(p55Packet.primeSums, [72,215,114,72]);
assert.deepEqual(p55Packet.primeResidues, [3,8,22,3]);
assert.deepEqual(p55Packet.vector, expected);

// Matched control: p49's page-level five-core window.
const p49Words = completeWordsByPhysicalPage.get(49);
assert.ok(p49Words && p49Words.length >= 16);
const p49 = coreSignature(p49Words.slice(0,16));
const p49Packet = packet(p49, 0, "difference-center-sum");

// Census every page-local 16-word window that has exactly five recursive cores.
const fiveCoreWindows = [];
for (let page = 0; page <= 55; page += 1) {
  const pageWords = completeWordsByPhysicalPage.get(page) || [];
  for (let start = 0; start + 16 <= pageWords.length; start += 1) {
    const signature = coreSignature(pageWords.slice(start, start + 16));
    if (signature.cores.length !== 5) continue;
    fiveCoreWindows.push({
      page,
      start: start + 1,
      signature,
      zeroBased: packet(signature, 0, "difference-center-sum"),
      oneBased: packet(signature, 1, "difference-center-sum"),
      swapped: packet(signature, 0, "sum-center-difference"),
    });
  }
}

const hits = fiveCoreWindows.filter(window =>
  window.zeroBased &&
  JSON.stringify(window.zeroBased.vector) === JSON.stringify(expected)
);
const oneBasedHits = fiveCoreWindows.filter(window =>
  window.oneBased &&
  JSON.stringify(window.oneBased.vector) === JSON.stringify(expected)
);
const swappedHits = fiveCoreWindows.filter(window =>
  window.swapped &&
  JSON.stringify(window.swapped.vector) === JSON.stringify(expected)
);

assert.equal(fiveCoreWindows.length, 116);
assert.equal(hits.length, 1);
assert.equal(hits[0].page, 55);
assert.equal(hits[0].start, 1);
assert.equal(oneBasedHits.length, 0);
assert.equal(swappedHits.length, 0);

console.log(JSON.stringify({
  classification: "intermediate source-constrained state bridge; not plaintext",
  dhState: {...state, e},
  expectedPacket: {
    labels: ["e","A","K","p-1","e"],
    vector: expected,
  },
  p55: {
    page: 55,
    completeWordCount: p55Words.length,
    cores: p55.cores,
    differenceBranch: p55.difference,
    center: p55.center,
    sumBranch: p55.sum,
    sourceWordIndexes: p55Packet.indexes,
    sourceWords: p55Packet.words,
    sourceWordPrimeSums: p55Packet.primeSums,
    sourceWordPrimeResiduesMod23: p55Packet.primeResidues,
    statePacket: p55Packet.vector,
  },
  p49Control: {
    cores: p49.cores,
    differenceBranch: p49.difference,
    center: p49.center,
    sumBranch: p49.sum,
    sourceWords: p49Packet && p49Packet.words,
    statePacket: p49Packet && p49Packet.vector,
  },
  controlCensus: {
    fiveCoreWindows: fiveCoreWindows.length,
    zeroBasedDifferenceCenterSumHits: hits.map(hit => ({
      page: hit.page,
      start: hit.start,
      cores: hit.signature.cores,
    })),
    oneBasedHits: oneBasedHits.length,
    swappedBranchHits: swappedHits.length,
  },
}, null, 2));
