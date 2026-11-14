"use strict";

/**
 * Source-frozen original p55 IOGEM-key inverse gate.
 * Reproducer: node sims/lp2_p57_divinity_iogem_p55_strictf_sft.cjs
 * Inputs are the unchanged authoritative LP2 GP29 rune corpus and numeric table.
 * No output file writes and no external packages.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"));
const corpus = read("resources/liber-primus/lp2-corpus.json");
const grid = read("resources/liber-primus/lp2-grid-256.json");
const gp = new Map(corpus.translit.map((value, i) => [value, i]));
const primes = [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109];
const moves = [[1,-1],[1,0],[1,1],[0,-1],[0,0],[0,1],[-1,-1],[-1,0],[-1,1]];
const p55 = corpus.pages.find((p) => p.page === 55).indices;
const p57 = corpus.pages.find((p) => p.page === 57).indices;
const bytes = grid.bytes;
assert.equal(bytes.length, 256);
assert.equal(p55.length, 76);
assert.equal(p57.length, 95);

/* The original solved p57 explicitly prints D-I-U-I-N-I-T-Y. U encodes V. */
const divinity = ["D","I","U","I","N","I","T","Y"].map((name) => gp.get(name));
assert.deepEqual(divinity, [23,10,1,10,9,10,16,26]);
const numericSum = divinity.reduce((sum, symbol) => sum + primes[symbol], 0);
assert.equal(numericSum, 376);
let index = (numericSum - 1) % 256;
const visited = new Set();
const sequence = [];
const positions = [];
while (!visited.has(index)) {
  visited.add(index);
  positions.push(index + 1);
  const digit = bytes[index];
  const quotient = Math.floor(digit / 29);
  const remainder = digit % 29;
  sequence.push(remainder);
  const [dRow, dColumn] = moves[quotient];
  const row = Math.floor(index / 8) + dRow;
  const column = index % 8 + dColumn;
  if (quotient === 4 || row < 0 || row >= 32 || column < 0 || column >= 8) break;
  index = row * 8 + column;
}
assert.deepEqual(positions, [120,111,119,127,128]);
const keyNames = sequence.map((x) => corpus.translit[x]);
assert.deepEqual(keyNames, ["I","O","G","E","M"]);
const key = sequence;
assert.deepEqual(key, [10,3,6,18,19]);
assert.deepEqual(p55.flatMap((v,i) => v === 0 ? [i] : []), [15,25,41]);

/**
 * Enumerate every state of a known cyclic key and native p56 F-transparent
 * Vigenere rule, keeping ciphertext-F ambiguous.
 * A key-consuming operation may never return plaintext F, because original
 * plaintext F is emitted transparently without consuming a key symbol.
 * @param {number[]} ciphertext
 * @param {number} phase
 */
function invert(ciphertext, phase, currentKey = key) {
  let states = [{ clock: phase, bypass: [], plain: [] }];
  let impossibleAt = null;
  for (let i = 0; i < ciphertext.length; i++) {
    const next = [];
    for (const state of states) {
      if (ciphertext[i] === 0) {
        next.push({ clock: state.clock, bypass: [...state.bypass, i], plain: [...state.plain, 0] });
      }
      const candidate = (ciphertext[i] - currentKey[state.clock % currentKey.length] + 29) % 29;
      if (candidate !== 0) {
        next.push({ clock: state.clock + 1, bypass: state.bypass, plain: [...state.plain, candidate] });
      }
    }
    states = next;
    if (!states.length) {
      impossibleAt = i;
      break;
    }
  }
  return { impossibleAt, states };
}

/** Strict source-authentic forward encoder, including plaintext-F transparency. */
function encrypt(plain, phase, currentKey = key) {
  let clock = phase;
  const cipher = [];
  for (const symbol of plain) {
    if (symbol === 0) cipher.push(0);
    else cipher.push((symbol + currentKey[clock++ % currentKey.length]) % 29);
  }
  return cipher;
}
let bypassesInP57 = 0;
for (let phase = 0; phase < 5; phase++) {
  const plant = encrypt(p57, phase);
  const inverse = invert(plant, phase);
  assert.equal(inverse.impossibleAt, null);
  assert(inverse.states.some((state) => state.plain.every((symbol, i) => symbol === p57[i])));
  assert.deepEqual(encrypt(p57, phase), plant);
  bypassesInP57 += p57.filter((v) => v === 0).length;
}
assert(bypassesInP57 > 0);

const cases = [];
for (const [scope, ciphertext] of [["full76", p55], ["suffix75", p55.slice(1)]]) {
  for (let phase = 0; phase < 5; phase++) {
    const outcome = invert(ciphertext, phase);
    cases.push({ scope, phase, earliestImpossibleAt: outcome.impossibleAt, survivors: outcome.states.length });
    assert.equal(outcome.states.length, 0);
  }
}
assert.deepEqual(cases.map((x) => x.earliestImpossibleAt),
  [55,8,2,67,67,66,54,7,1,66]);
// The historically verified p56 key uses phi(prime)=prime-1, not the GP
// rune's ordinal index. This is a distinct source-motivated consumer of the
// IOGEM path's actual prime weights, so do not conflate its survivors with
// the strict impossibility of the literal GP-index key above.
const totientKey = key.map((symbol) => (primes[symbol] - 1) % 29);
assert.deepEqual(totientKey, [1,6,16,8,12]);
for (let phase = 0; phase < totientKey.length; phase++) {
  const planted = encrypt(p57, phase, totientKey);
  const recovered = invert(planted, phase, totientKey);
  assert.equal(recovered.impossibleAt, null);
  assert(recovered.states.some((state) => state.plain.every((symbol, i) => symbol === p57[i])));
}
const totientCases = [];
for (const [scope, ciphertext] of [["full76", p55], ["suffix75", p55.slice(1)]]) {
  for (let phase = 0; phase < totientKey.length; phase++) {
    const outcome = invert(ciphertext, phase, totientKey);
    totientCases.push({
      scope, phase, earliestImpossibleAt: outcome.impossibleAt, survivors: outcome.states.length,
      firstNativeGpCandidate: outcome.states.length
        ? outcome.states[0].plain.slice(0, 28).map((index) => corpus.translit[index]).join(" ")
        : null
    });
  }
}
assert.deepEqual(totientCases.filter((x) => x.scope === "full76").map((x) => x.survivors), [0,1,2,2,0]);
assert.deepEqual(totientCases.filter((x) => x.scope === "suffix75").map((x) => x.survivors), [0,0,1,2,2]);

// One further original-cipher gate: a source-led key intended for a *whole*
// unknown visual chapter must remain valid across the entire printed chapter.
// Every phase is granted a free chapter-local initial key position and every
// ciphertext F may be treated as either literal or encrypted. This is a
// necessary legality criterion, without any language/dictionary scoring.
const sourceChapterWindows = [[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
const originalUnknownPages = corpus.pages.filter((page) => page.page <= 55 && page.indices.length > 0);
assert.equal(originalUnknownPages.length, 55);
assert.equal(originalUnknownPages.reduce((s, p) => s + p.indices.length, 0), 12956);
const sourceChapterTests = sourceChapterWindows.map(([start, end], chapter) => {
  const chapterCiphertext = originalUnknownPages
    .filter((p) => p.page >= start && p.page <= end)
    .flatMap((p) => p.indices);
  const tests = Array.from({ length: 5 }, (_, phase) =>
    invert(chapterCiphertext, phase, totientKey));
  assert(tests.every((test) => !test.states.length), `chapter ${chapter + 1} had an unexpected legal full inverse`);
  return { chapter: chapter + 1, pages: [start, end], length: chapterCiphertext.length,
    firstImpossibleOffsets: tests.map((test) => test.impossibleAt) };
});
assert.deepEqual(sourceChapterTests.map((x) => x.length),
  [729,1145,1729,1903,1021,1433,1680,3008,308]);
const legalPageStarts = originalUnknownPages.flatMap((p) => {
  const legalPhases = Array.from({length: 5}, (_, phase) =>
    invert(p.indices, phase, totientKey).states.length > 0 ? phase : null).filter((v) => v !== null);
  return legalPhases.length ? [{ page: p.page, runes: p.indices.length, legalPhases }] : [];
});
assert.deepEqual(legalPageStarts.map((x) => x.page), [0,9,22,24,27,49,51,52,55]);

// Compare the five algebraically legal p55 outputs to original physical
// *printed* words, joining line-end "/" continuations before tokenizing.
const runeMap = new Map(corpus.runes.map((rune, i) => [rune, i]));
const p55OriginalTranscript = fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-transcription.txt"), "utf8")
  .trim().split("%")[54].replace(/\/\s*/g, "");
const p55OriginalWords = p55OriginalTranscript.match(/[\u16A0-\u16FF]+/gu) || [];
const p55PrintedWordLengths = p55OriginalWords.map((w) => [...w].length);
assert.deepEqual(p55PrintedWordLengths, [1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]);
assert.deepEqual(p55OriginalWords.flatMap((word) =>
  [...word].map((rune) => runeMap.get(rune))), p55);
const englishOriginal = fs.readFileSync(
  path.join(root, "resources/control/english_wordfreq_textblob.txt"), "utf8");
const longTokens = new Set(["TH","NG","EO","OE","AE","IA","EA"]);
const lexicon = new Set();
for (const line of englishOriginal.split("\n")) {
  const match = /^([a-z]+) (\d+)$/.exec(line);
  if (!match) continue;
  const word = match[1].toUpperCase().replace(/[KQ]/g, "C").replace(/V/g, "U").replace(/Z/g, "S");
  const values = [];
  for (let i = 0; i < word.length;) {
    const digraph = word.slice(i, i + 2);
    if (longTokens.has(digraph)) {
      values.push(gp.get(digraph));
      i += 2;
    } else {
      const value = gp.get(word[i]);
      if (value === undefined) { values.length = 0; break; }
      values.push(value);
      i++;
    }
  }
  if (values.length) lexicon.add(values.join(","));
}
const p55LexiconChecks = [];
for (let phase = 0; phase < totientKey.length; phase++) {
  for (const candidate of invert(p55, phase, totientKey).states) {
    let offset = 0;
    const matchedWords = [];
    for (const size of p55PrintedWordLengths) {
      const word = candidate.plain.slice(offset, offset + size);
      if (lexicon.has(word.join(","))) {
        matchedWords.push({ runeOffset: offset, runeCount: size,
          translit: word.map((v) => corpus.translit[v]).join("") });
      }
      offset += size;
    }
    assert.equal(offset, p55.length);
    assert.equal(matchedWords.filter((w) => w.runeCount >= 3).length, 0);
    p55LexiconChecks.push({ phase, bypassOffsets: candidate.bypass, matchedWords });
  }
}
assert.equal(p55LexiconChecks.length, 5);

// Independently, the actual historical LP1 DIVINITY key is directly named
// by the p57 instruction and the p55 43 strict *word* interiors are original
// source geometry. This extends the earlier loose F-mask test to ALL legal
// ciphertext-F choices and ALL eight original key phases. No full decoding.
const p55StrictInteriors = p55OriginalWords.flatMap((word) =>
  [...word].slice(1, -1).map((rune) => runeMap.get(rune)));
assert.equal(p55StrictInteriors.length, 43);
const divinity43PhaseFailures = Array.from({length: divinity.length}, (_, phase) =>
  invert(p55StrictInteriors, phase, divinity).impossibleAt);
assert.deepEqual(divinity43PhaseFailures, [1,28,1,22,1,28,28,28]);

console.log(JSON.stringify({
  input: "unaltered LP2 physical p55 original 76 GP29 runes",
  originalSourceSelector: "p57 DIVINITY GP prime-sum 376, %256 cell120, 29q+r keypad",
  visitedCells: positions,
  keyRuneNames: keyNames,
  key,
  sourceCiphertextFOffsets: [15,25,41],
  knownPlaintextPositive: "all 5 cyclic phases exactly recover native p57 95/95 with genuine plaintext-F bypass",
  tests: cases,
  totientKey,
  totientCases,
  sourceChapterTests,
  legalPageStarts,
  p55PrintedWordLengths,
  p55LexiconChecks,
  divinity43PhaseFailures,
  interpretation: "Literal GP-index IOGEM is impossible for p55 in all cyclic strict-F phases. The source-prime-totient IOGEM key remains legal on nine isolated original pages including p55, but all nine full source visual chapters have zero legal phases. No unknown plaintext."
},null,2));
console.log("PASS");
