"use strict";
/**
 * Source-constrained test: use the 13-GP-rune inward Wisdom path
 * CABAL → UOID → FORM as a repeating GP29 key, resetting at each original
 * thirteen-dot event. The 13-dot boundaries are preserved as separate events,
 * including coincident marks and their empty fragments.
 *
 * This tests only direct GP29 Vigenere (+/-) and Beaufort, with fragment-reset
 * phase and a continuous global-phase control. It is not a key claim.
 * Run: node sims/p55_wisdom_13dot_key_reset_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = f => fs.readFileSync(path.join(root, f), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const { train, encode } = require("./grid_keyskip_viterbi.cjs");
const MOD = 29;
const mod = x => (x % MOD + MOD) % MOD;
const pages = corpus.pages.filter(p => p.page < 56);
const C = pages.flatMap(p => p.indices);
assert.equal(C.length, 12956);

const pageStart = new Map();
let offset = 0;
for (const page of pages) {
  pageStart.set(page.page, offset);
  offset += page.indices.length;
}
assert.equal(offset, C.length);

const annotations = new Map(ink.pages.map(p => [p.page, p]));
const marks = [];
for (const page of pages) {
  const annotation = annotations.get(page.page);
  for (const mark of annotation?.large_punctuation || []) {
    if (mark[1] === 13) {
      marks.push({
        global: pageStart.get(page.page) + mark[0],
        page: page.page,
        local: mark[0],
        ink: mark[2]
      });
    }
  }
}
marks.sort((a, b) => a.global - b.global ||
  (a.ink === "black" ? -1 : b.ink === "black" ? 1 : 0));
assert.equal(marks.length, 28);
assert.equal(marks.filter(m => m.ink === "red").length, 27);
assert.equal(marks.filter(m => m.ink === "black").length, 1);
assert.equal(marks.at(-1).global, C.length);

// Each physical 13-dot mark terminates the fragment before it. The final
// mark is at the end of p55, so the 28 intervals exactly cover p0–p55.
const bounds = [0, ...marks.map(m => m.global)];
assert.equal(bounds.length, 29);
assert.equal(bounds.at(-1), C.length);
const fragments = bounds.slice(0, -1).map((start, i) => ({
  start,
  end: bounds[i + 1],
  length: bounds[i + 1] - start
}));
assert.equal(fragments.length, 28);
assert.deepEqual(fragments.flatMap((f, i) => f.length === 0 ? [i + 1] : []), [9, 12]);
assert.equal(fragments.reduce((s, f) => s + f.length, 0), C.length);

// The source-derived central-column path is CABAL → UOID → FORM. UOID is
// the original GP transliteration (V is represented by U), not normalized
// to English VOID.
const keyText = "CABALUOIDFORM";
const key = [...keyText].map(ch => corpus.translit.indexOf(ch));
assert.equal(key.length, 13);
assert.deepEqual(key, [5, 24, 17, 24, 20, 1, 3, 10, 23, 0, 3, 4, 19]);
const wisdom = read("resources/external/2013-0-wisdom.txt");
for (const word of ["ᚳᚪᛒᚪᛚ", "ᚢᚩᛁᛞ", "ᚠᚩᚱᛗ"]) {
  assert.ok(wisdom.includes(word), "missing source word " + word);
}

const model = train(read("resources/control/shakespeare_first300k.txt"));
function languageScore(runes) {
  let score = 0;
  for (let i = 0; i < runes.length; i++) {
    if (i === 0) score += model.unigram[runes[i]];
    else if (i === 1) score += model.bigram[runes[i - 1] * MOD + runes[i]];
    else score += model.trigram[
      (runes[i - 2] * MOD + runes[i - 1]) * MOD + runes[i]
    ];
  }
  return score / runes.length;
}
function ioc(runes) {
  const counts = new Uint32Array(MOD);
  for (const r of runes) counts[r]++;
  let pairs = 0;
  for (const n of counts) pairs += n * (n - 1);
  return pairs / (runes.length * (runes.length - 1));
}

/**
 * mode:
 *   vigenere-minus: P=C-K; inverse C=P+K
 *   vigenere-plus:  P=C+K; inverse C=P-K
 *   beaufort:       P=K-C; inverse C=K-P
 */
function transform(input, mode, fragmentReset, decrypt) {
  const output = new Array(input.length);
  for (const fragment of fragments) {
    for (let i = fragment.start; i < fragment.end; i++) {
      const phase = fragmentReset ? i - fragment.start : i;
      const k = key[phase % key.length];
      const v = input[i];
      let next;
      if (mode === "vigenere-minus") next = decrypt ? mod(v - k) : mod(v + k);
      else if (mode === "vigenere-plus") next = decrypt ? mod(v + k) : mod(v - k);
      else if (mode === "beaufort") next = mod(k - v);
      else throw new Error("unknown mode " + mode);
      output[i] = next;
    }
  }
  return output;
}
const pageRange = pageNumber => {
  const page = pages.find(p => p.page === pageNumber);
  assert.ok(page);
  const start = pageStart.get(pageNumber);
  return [start, start + page.indices.length];
};
const slicePage = (runes, pageNumber) => {
  const [start, end] = pageRange(pageNumber);
  return runes.slice(start, end);
};
const runePrefix = runes => runes.slice(0, 60).map(i => corpus.translit[i]).join(" ");

const raw = {
  ioc: ioc(C),
  englishGP: languageScore(C)
};
const variants = [];
for (const fragmentReset of [true, false]) {
  for (const mode of ["vigenere-minus", "vigenere-plus", "beaufort"]) {
    const plain = transform(C, mode, fragmentReset, true);
    const recoveredCipher = transform(plain, mode, fragmentReset, false);
    assert.deepEqual(recoveredCipher, C);
    const p36 = slicePage(plain, 36);
    const p55 = slicePage(plain, 55);
    variants.push({
      mode,
      clock: fragmentReset ? "reset-at-each-13-dot" : "continuous-global",
      ioc: ioc(plain),
      englishGP: languageScore(plain),
      p36: { ioc: ioc(p36), englishGP: languageScore(p36) },
      p55: { ioc: ioc(p55), englishGP: languageScore(p55) },
      prefix: runePrefix(plain),
      p36Prefix: p36.slice(0, 30).map(i => corpus.translit[i]).join(""),
      p55Prefix: p55.slice(0, 30).map(i => corpus.translit[i]).join(""),
      exactReencrypt: true
    });
  }
}
const lp1 = read("resources/liber-primus/lp1-plaintext-reference.txt");
const lp1Sample = encode(lp1.slice(
  lp1.indexOf("BELIEVE NOTHING"),
  lp1.indexOf("### 3")
)).slice(0, 179);
assert.equal(lp1Sample.length, 179);

const output = {
  classification: "bounded original-input negative for direct GP29 Vigenere/Beaufort under one source-motivated key and two clocks",
  source: {
    keyText,
    keyIndices: key,
    keyLength: key.length,
    sourceWords: ["CABAL", "UOID", "FORM"],
    unknownRunes: C.length,
    unknown13DotEvents: marks.length,
    redMarks: 27,
    blackMarks: 1,
    fragments: fragments.length,
    emptyFragmentsOneBased: [9, 12],
    fragmentLengths: fragments.map(f => f.length),
    marks
  },
  raw,
  nativeCicadaEnglishControl: {
    source: "LP1 plaintext reference, BELIEVE NOTHING through the next section marker",
    symbols: lp1Sample.length,
    englishGP: languageScore(lp1Sample)
  },
  variants,
  decision: "The fragment-reset key does not move original LP2 toward GP-English. No plaintext or authentic key is recovered; other transformations are outside this finite test."
};
process.stdout.write(JSON.stringify(output, null, 2) + "\n");
module.exports = { transform, fragments, key, output };
