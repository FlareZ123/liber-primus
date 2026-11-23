"use strict";

/**
 * Source-bounded historical two-primitive decoder gate for Director #2428.
 *
 * Command:
 *   node sims/lp2_shed_historical_program_original_sft.cjs
 *
 * Windows 11 / Node.js 22 / CommonJS / read-only.
 *
 * Original operations:
 *   1. Solved LP2 p57's literal SHED CIRCUMFERENCES, interpreted as
 *      operating only on interior runes of complete printed words.
 *   2. Exactly one previously authenticated additive historical operator:
 *      - LP1 DIVINITY Vigenere, selected also by p57's actual wording;
 *      - LP1 FIRFUMFERENFE Vigenere, independently evidenced in LP1;
 *      - solved LP2 p56 prime-totient, key phi(prime_i) = prime_i - 1.
 *
 * These are tests of complete frozen interpretation candidates, not claims
 * that the p57 instruction actually applies to pp16-21 or pp40-53.
 * Explicit plaintext-F bypasses require the chosen source positions; none
 * is supplied for the unknown pages, so this gate does not guess F masks.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const ROOT = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(
  ROOT, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const originalText = fs.readFileSync(path.join(
  ROOT, "resources", "liber-primus", "lp2-transcription.txt"), "utf8");
const sourcePages = corpus.pages.filter(page => page.page <= 55);
const original = sourcePages.flatMap(page => page.indices);
const RUNE = new Map(corpus.runes.map((ch, index) => [ch, index]));
const re = new RegExp("[" + corpus.runes.join("") + "]+", "gu");

// The historical plaintext source is 58 physical pages, including one
// runeless p50. The original '%' markers preserve page-carry words.
// Only slash/newline typography is removed, never a printed word break.
const joined = originalText.split("%").slice(0, 55).join("")
  .replace(/\//g, "").replace(/\n/g, "");
const words = [...joined.matchAll(re)]
  .map(match => [...match[0]].map(ch => RUNE.get(ch)));
const reconstructed = words.flat();
assert.equal(words.length, 2896);
assert.equal(reconstructed.length, 12956);
assert.deepEqual(reconstructed, original);

// Complete-word first and last source runes remain exterior, and singletons
// and doublets have zero interior. The retained outer runes are sidecar data,
// giving a genuinely bijective complete-manuscript forward/inverse.
const interior = new Uint8Array(original.length);
let pos = 0;
for (const word of words) {
  for (let index = 1; index < word.length - 1; index++) {
    interior[pos + index] = 1;
  }
  pos += word.length;
}
assert.equal(pos, original.length);
assert.equal(interior.reduce((a, b) => a + b, 0), 7247);

const chapterStarts = [];
let end = 0;
for (const page of sourcePages) {
  chapterStarts[page.page] = end;
  end += page.indices.length;
}
const chapters = [
  { name: "p16-p21", first: 16, lastExclusive: 22, runes: 1613 },
  { name: "p40-p53", first: 40, lastExclusive: 54, runes: 3008 }
];

function firstPrimes(count) {
  const values = [];
  for (let candidate = 2; values.length < count; candidate++) {
    let prime = true;
    for (let divisor = 2; divisor * divisor <= candidate; divisor++) {
      if (candidate % divisor === 0) {
        prime = false;
        break;
      }
    }
    if (prime) values.push(candidate);
  }
  return values;
}

const asKey = text => [...text].map(ch => {
  const symbol = ch === "V" ? "U" : ch;
  const index = corpus.translit.indexOf(symbol);
  assert.ok(index >= 0, "source key contains invalid rune");
  return index;
});

const programs = [
  { name: "SHED+LP1-DIVINITY", key: asKey("DIVINITY") },
  { name: "SHED+LP1-FIRFUMFERENFE", key: asKey("FIRFUMFERENFE") },
  { name: "SHED+LP2-p56-prime-totient",
    key: firstPrimes(2000).map(p => (p - 1) % 29) }
];

function apply(data, mask, key, direction) {
  assert.equal(mask.length, data.length);
  const out = data.slice();
  let consumed = 0;
  for (let index = 0; index < data.length; index++) {
    if (!mask[index]) continue;
    const shift = key[consumed % key.length];
    out[index] = (data[index] + direction * shift + 29) % 29;
    consumed++;
  }
  return { out, consumed };
}

function ic(data) {
  const counts = new Uint32Array(29);
  for (const value of data) counts[value]++;
  return Array.from(counts).reduce((sum, count) =>
    sum + count * (count - 1), 0) / (data.length * (data.length - 1));
}

const digest = sequence =>
  crypto.createHash("sha256").update(Buffer.from(sequence)).digest("hex");
const spell = sequence => sequence.map(index => corpus.translit[index]).join(" ");

function summarize(chapter, program) {
  const start = chapterStarts[chapter.first];
  const stop = chapter.lastExclusive === 54
    ? chapterStarts[54] : chapterStarts[22];
  const cipher = original.slice(start, stop);
  const mask = interior.slice(start, stop);
  assert.equal(cipher.length, chapter.runes);

  const plain = apply(cipher, mask, program.key, -1);
  const roundtrip = apply(plain.out, mask, program.key, 1);
  assert.deepEqual(roundtrip.out, cipher);
  assert.equal(roundtrip.consumed, plain.consumed);

  const inside = plain.out.filter((value, i) => mask[i]);
  assert.ok(inside.length >= 300);
  return {
    chapter: chapter.name,
    sourceRunes: cipher.length,
    transformedInteriors: plain.consumed,
    exteriorRunesPreserved: cipher.length - plain.consumed,
    asPrintedIoC: ic(cipher),
    decodedFullIoC: ic(plain.out),
    decodedInteriorIoC: ic(inside),
    first300IoC: ic(plain.out.slice(0, 300)),
    untouchedNext250IoC: ic(plain.out.slice(300, 550)),
    first30GP: spell(plain.out.slice(0, 30)),
    outputSHA256: digest(plain.out),
    exactOriginalReencryption: true
  };
}

// Native known-GP plaintext plant. Each program must round-trip the exact
// already solved p57 rune tape under this fixed nontrivial printed-word
// interior mask. It is an implementation control, not new LP2 plaintext.
const native = corpus.pages.find(p => p.page === 57).indices;
assert.equal(native.length, 95);
const nativeMask = interior.slice(chapterStarts[16], chapterStarts[16] + 95);
assert.ok(nativeMask.reduce((a, b) => a + b, 0) > 30);
const nativePositives = programs.map(program => {
  const encrypted = apply(native, nativeMask, program.key, 1);
  const decoded = apply(encrypted.out, nativeMask, program.key, -1);
  assert.deepEqual(decoded.out, native);
  const wrongKey = program.key.slice();
  wrongKey[0] = (wrongKey[0] + 1) % 29;
  const wrong = apply(encrypted.out, nativeMask, wrongKey, -1);
  const mismatches = wrong.out.filter((value, i) => value !== native[i]).length;
  assert.ok(mismatches > 0, "Wrong-key control must fail");
  return {
    program: program.name,
    sourceSolvedPlaintextRunes: native.length,
    activeInteriors: encrypted.consumed,
    exactNativeRecovery: 95,
    wrongKeyMismatches: mismatches
  };
});

// Separate authentic, unplanted solved-Cicada vectors (LP1 methods + p56).
// Their true original-cipher correctness is checked independently of this gate.
const auth = require("./authentic_decryption_regression.cjs").run();
assert.equal(auth.length, 5);
assert.ok(auth.every(row => row.exactEnglishMatch && row.wrongMethodRejected));

const results = programs.map(program => ({
  program: program.name,
  exactSourceKey: program.name.includes("prime")
    ? "phi(p_i), zero-based i, no source-specified skip" : program.key,
  sourceSelector: program.name.includes("DIVINITY")
    ? "p57 FIND DIVINITY + solved LP1 DIVINITY"
    : program.name.includes("FIRFUM")
      ? "historical solved LP1 FIRFUMFERENFE"
      : "p57 SHED + solved p56 prime-totient",
  original: chapters.map(chapter => summarize(chapter, program))
}));

for (const test of results) {
  for (const chapter of test.original) {
    assert.ok(chapter.decodedFullIoC > 0.032);
    assert.ok(chapter.decodedFullIoC < 0.038);
  }
}
console.log(JSON.stringify({
  status: "PASS",
  decision: "Three source-typed SHED-plus-historical-additive candidates fail original GP-native plaintext; no source-selected unknown-page skip/interior receiver.",
  originalRunes: original.length,
  completeWords: words.length,
  allBookInteriors: 7247,
  originalFullChapterReplays: results.length * chapters.length,
  knownAuthenticRealDecryptionControls: auth.map(x => ({
    name: x.section,
    actualRecovered: x.recoveredRunes,
    exactEnglish: x.exactEnglishMatch
  })),
  nativePositives,
  programs: results
}, null, 2));
