#!/usr/bin/env node
"use strict";

// Agent 24: source-fixed test of the p57-named dual-channel LP1-key hypothesis.
// Shell uses FIRFUMFERENFE; interior uses DIUINITY. Each independent key clock
// starts at phase zero at the first unknown word and runs continuously.
// Cipher: C=P+K (mod 29); plaintext F=0 is transparent and non-consuming.

const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const root = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const tapes = JSON.parse(read("im-results/lp2-word-circumference-tapes.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const reference = read("resources/liber-primus/lp1-plaintext-reference.txt");
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const translitIndex = new Map(corpus.translit.map((t, i) => [t, i]));

function encodeWord(raw) {
  const s = raw.toUpperCase();
  const out = [];
  for (let i = 0; i < s.length;) {
    if (s.startsWith("ING", i)) {
      out.push(translitIndex.get("NG"));
      i += 3;
      continue;
    }
    const two = s.slice(i, i + 2);
    if (translitIndex.has(two)) {
      out.push(translitIndex.get(two));
      i += 2;
      continue;
    }
    let ch = s[i];
    if (ch === "V") ch = "U";
    if (ch === "K") ch = "C";
    if (ch === "Z") ch = "S";
    if (ch === "Q") {
      out.push(translitIndex.get("C"), translitIndex.get("W"));
      i += 1;
      continue;
    }
    if (!translitIndex.has(ch)) throw new Error("Unmapped character " + ch);
    out.push(translitIndex.get(ch));
    i += 1;
  }
  return out;
}

const keyShell = encodeWord("FIRFUMFERENFE");
const keyInterior = encodeWord("DIVINITY");
assert.deepEqual(keyShell, [0, 10, 4, 0, 1, 19, 0, 18, 4, 18, 9, 0, 18]);
assert.deepEqual(keyInterior, [23, 10, 1, 10, 9, 10, 16, 26]);

// Verify the p57 key-word transliteration against all 95 native GP29 symbols.
const p57Words = (reference.split("### 57")[1] || "").match(/[A-Z]+/g) || [];
const p57PlainWords = p57Words.map(encodeWord);
const p57Encoded = p57PlainWords.flat();
assert.deepEqual(p57Encoded, corpus.pages.find((p) => p.page === 57).indices);

// Rebuild original word/page membership from the transcription and page counts.
const pageForRune = [];
for (const page of corpus.pages) {
  assert.equal(page.indices.length, page.runic_count);
  for (let i = 0; i < page.runic_count; i++) pageForRune.push(page.page);
}
const allWords = [];
let currentWord = [];
let runeOffset = 0;
for (const ch of transcription) {
  if (runeIndex.has(ch)) {
    currentWord.push({ rune: ch, page: pageForRune[runeOffset++] });
  } else if ("-.&$".includes(ch)) {
    if (currentWord.length) {
      allWords.push(currentWord);
      currentWord = [];
    }
  }
}
if (currentWord.length) allWords.push(currentWord);
assert.equal(runeOffset, pageForRune.length);

const unknownWords = allWords.filter((w) => w.some((r) => r.page <= 55));
const derivedShells = unknownWords.map((w) =>
  w.length === 1 ? w[0].rune : w[0].rune + w[w.length - 1].rune
);
const derivedInteriors = unknownWords.map((w) =>
  w.length <= 2 ? "" : w.slice(1, -1).map((r) => r.rune).join("")
);
assert.deepEqual(derivedShells, tapes.shells);
assert.deepEqual(derivedInteriors, tapes.interiors);

const unknownNative = corpus.pages.filter((p) => p.page <= 55).flatMap((p) => p.indices);
const reconstructed = unknownWords.flatMap((w) => w.map((r) => runeIndex.get(r.rune)));
assert.deepEqual(reconstructed, unknownNative);

const shellRunes = tapes.shells.reduce((n, s) => n + Array.from(s).length, 0);
const interiorRunes = tapes.interiors.reduce((n, s) => n + Array.from(s).length, 0);
assert.equal(unknownWords.length, 2896);
assert.equal(unknownNative.length, 12956);
assert.equal(shellRunes, 5709);
assert.equal(interiorRunes, 7247);

// Reconstruct p55's physical split, including the word carried from p54.
const p55Words = allWords.filter((w) => w.some((r) => r.page === 55));
const p55Shell = p55Words.flatMap((w) =>
  w.filter((r, i) => w.length === 1 || i === 0 || i === w.length - 1)
    .filter((r) => r.page === 55)
);
const p55Interior = p55Words.flatMap((w) =>
  w.filter((r, i) => w.length > 2 && i > 0 && i < w.length - 1)
    .filter((r) => r.page === 55)
);
assert.equal(p55Words.length, 17);
assert.equal(p55Shell.length, 33);
assert.equal(p55Interior.length, 43);

function makeOps(shellText, interiorText) {
  const shell = Array.from(shellText, (r) => runeIndex.get(r));
  const interior = Array.from(interiorText, (r) => runeIndex.get(r));
  if (!shell.length || shell.some((x) => x === undefined) ||
      interior.some((x) => x === undefined)) throw new Error("Malformed source tape");
  const ops = [{ c: shell[0], channel: "shell" }];
  for (const c of interior) ops.push({ c, channel: "interior" });
  if (shell.length === 2) ops.push({ c: shell[1], channel: "shell" });
  return { shell, interior, ops };
}

// Exact phase-pair reachability. At ciphertext F, allow transparent plaintext
// F (no advance) and a non-F plaintext that encrypts to F (advance). At any
// non-F ciphertext, a decrypted plaintext F is impossible.
function checkReachability(shells, interiors) {
  let states = new Set([0]); // shellPhase*8 + interiorPhase
  for (let wordIndex = 0; wordIndex < shells.length; wordIndex++) {
    const built = makeOps(shells[wordIndex], interiors[wordIndex]);
    for (let opIndex = 0; opIndex < built.ops.length; opIndex++) {
      const op = built.ops[opIndex];
      const next = new Set();
      for (const pair of states) {
        const shellPhase = Math.floor(pair / 8);
        const interiorPhase = pair % 8;
        const phase = op.channel === "shell" ? shellPhase : interiorPhase;
        const key = op.channel === "shell" ? keyShell[phase] : keyInterior[phase];

        if (op.c === 0) next.add(pair); // transparent plaintext F
        const plain = (op.c - key + 29) % 29;
        if (plain !== 0) {
          next.add(op.channel === "shell"
            ? ((shellPhase + 1) % 13) * 8 + interiorPhase
            : shellPhase * 8 + ((interiorPhase + 1) % 8));
        }
      }
      if (next.size === 0) {
        const phasePairs = Array.from(states).sort((a, b) => a - b).map((pair) => ({
          shellPhase: Math.floor(pair / 8),
          interiorPhase: pair % 8
        }));
        const impossibleTransitions = phasePairs.map((pair) => {
          const key = op.channel === "shell"
            ? keyShell[pair.shellPhase] : keyInterior[pair.interiorPhase];
          return {
            shellPhase: pair.shellPhase,
            interiorPhase: pair.interiorPhase,
            keyValue: key,
            requiredPlainValue: (op.c - key + 29) % 29
          };
        });
        const fullWord = [built.shell[0], ...built.interior,
          ...(built.shell.length === 2 ? [built.shell[1]] : [])];
        return {
          ok: false,
          failure: {
            wordIndex, opIndex, channel: op.channel,
            wordRunes: fullWord.map((i) => corpus.runes[i]).join(""),
            wordTranslit: fullWord.map((i) => corpus.translit[i]).join(""),
            cipherRune: corpus.runes[op.c],
            cipherTranslit: corpus.translit[op.c],
            cipherIndex: op.c,
            phasePairs, impossibleTransitions
          }
        };
      }
      states = next;
    }
  }
  return {
    ok: true,
    finalPhasePairs: Array.from(states).sort((a, b) => a - b).map((pair) => ({
      shellPhase: Math.floor(pair / 8),
      interiorPhase: pair % 8
    }))
  };
}

// Positive transducer control: re-encrypt the independently clear p57 words.
function encryptWords(words) {
  let shellPhase = 0;
  let interiorPhase = 0;
  const shells = [];
  const interiors = [];
  for (const word of words) {
    const shell = word.length === 1 ? [word[0]] : [word[0], word[word.length - 1]];
    const interior = word.length <= 2 ? [] : word.slice(1, -1);
    function encOne(plain, channel) {
      if (plain === 0) return 0;
      if (channel === "shell") {
        const cipher = (plain + keyShell[shellPhase]) % 29;
        shellPhase = (shellPhase + 1) % 13;
        return cipher;
      }
      const cipher = (plain + keyInterior[interiorPhase]) % 29;
      interiorPhase = (interiorPhase + 1) % 8;
      return cipher;
    }
    const shellOut = [encOne(shell[0], "shell")];
    const interiorOut = interior.map((p) => encOne(p, "interior"));
    if (shell.length === 2) shellOut.push(encOne(shell[1], "shell"));
    shells.push(shellOut.map((i) => corpus.runes[i]).join(""));
    interiors.push(interiorOut.map((i) => corpus.runes[i]).join(""));
  }
  return { shells, interiors };
}

const positive = checkReachability(
  encryptWords(p57PlainWords).shells,
  encryptWords(p57PlainWords).interiors
);
assert.equal(positive.ok, true);

const original = checkReachability(tapes.shells, tapes.interiors);
assert.equal(original.ok, false);
assert.equal(original.failure.wordIndex, 4);
assert.equal(original.failure.opIndex, 1);
assert.equal(original.failure.channel, "interior");
assert.equal(original.failure.wordTranslit, "ONTH");
assert.equal(original.failure.cipherRune, "ᚾ");
assert.equal(original.failure.cipherIndex, 9);
assert.deepEqual(original.failure.phasePairs, [
  { shellPhase: 7, interiorPhase: 4 },
  { shellPhase: 8, interiorPhase: 4 }
]);
assert.deepEqual(
  original.failure.impossibleTransitions.map((x) => [x.keyValue, x.requiredPlainValue]),
  [[9, 0], [9, 0]]
);

const output = {
  hypothesis: "global phase-zero dual channel: FIRFUMFERENFE on word shells; DIUINITY on word interiors",
  cipher: "C=P+K mod29; plaintext F=0 is transparent and does not consume key",
  sourceChecks: {
    p57TransliterationExact: true,
    p57Symbols: p57Encoded.length,
    unknownWords: unknownWords.length,
    unknownRunes: unknownNative.length,
    shellRunes,
    interiorRunes,
    p55Words: p55Words.length,
    p55ShellRunes: p55Shell.length,
    p55InteriorRunes: p55Interior.length,
    exactTapeReconstruction: true
  },
  positiveControl: {
    clearP57ReencryptedWithHypothesisKeys: true,
    legalInversePathExists: positive.ok,
    finalPhasePairs: positive.finalPhasePairs.length
  },
  original: {
    legalInversePathExists: original.ok,
    firstFailure: original.failure,
    conclusion: "No legal global phase-zero dual-key F-hold decryption exists for the original source."
  },
  scope: "Rejects only this key-to-channel assignment and continuous phase-zero clock; no alternate offsets or reset schedules were searched."
};
process.stdout.write(JSON.stringify(output, null, 2) + "\n");
