"use strict";

/**
 * LP2 p32 horizontal-reflection reading-order gate.
 *
 * The tree source independently selects horizontal reflection. Test the exact
 * corresponding text operation on the same physical page: reverse rune order
 * within each printed line, preserve the vertical line order, and compare the
 * resulting 121-rune stream with native solved GP29 bigram controls.
 *
 * No key, phase, language-guided permutation or downstream ciphertext is fit.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = rel => fs.readFileSync(path.join(root, rel), "utf8").replace(/\r/g, "");

const transcript = read("resources/liber-primus/lp2-transcription.txt");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const solved = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));

const page = transcript.split("\n%\n")[32].split("\n&")[0].trim();
const runeSet = new Set(corpus.runes);
const lines = page.split("\n").map(line => [...line].filter(ch => runeSet.has(ch)));
assert.deepEqual(lines.map(x => x.length), [25, 23, 23, 21, 22, 7]);

const original = lines.flat();
const mirrored = lines.flatMap(line => [...line].reverse());
const wholeReverse = [...original].reverse();
assert.equal(original.length, 121);
assert.equal(mirrored.length, 121);

const index = new Map(corpus.runes.map((r, i) => [r, i]));
const counts = Array.from({length:29}, () => Array(29).fill(0.5));
const totals = Array(29).fill(29 * 0.5);

const sections = solved.sections.map(s =>
  [...s.source_text].filter(ch => index.has(ch)).map(ch => index.get(ch))
);
assert.equal(sections.flat().length, 2979);

for (const seq of sections) {
  for (let i = 0; i + 1 < seq.length; i++) {
    counts[seq[i]][seq[i + 1]] += 1;
    totals[seq[i]] += 1;
  }
}

/** @param {string[]|number[]} seq */
function score(seq) {
  const a = typeof seq[0] === "number" ? seq : seq.map(ch => index.get(ch));
  let s = 0;
  for (let i = 0; i + 1 < a.length; i++) {
    assert.notEqual(a[i], undefined);
    assert.notEqual(a[i + 1], undefined);
    s += Math.log(counts[a[i]][a[i + 1]] / totals[a[i]]);
  }
  return s / (a.length - 1);
}

const native = [];
for (const seq of sections) {
  for (let i = 0; i + original.length <= seq.length; i++) {
    native.push(score(seq.slice(i, i + original.length)));
  }
}
assert.equal(native.length, 1990);
native.sort((a, b) => a - b);

const sOriginal = score(original);
const sMirror = score(mirrored);
const sWhole = score(wholeReverse);
const nativeMin = native[0];
const q = p => native[Math.min(native.length - 1, Math.floor(p * native.length))];

assert.ok(sMirror > sOriginal, "mirror should reproduce measured slight improvement");
assert.ok(sMirror < nativeMin, "mirrored p32 must remain below every matched native window");
assert.ok(sWhole < nativeMin, "whole reverse control must remain below every matched native window");

const translit = seq => seq.map(ch => corpus.translit[index.get(ch)]).join("");

console.log(JSON.stringify({
  sourceOperation: "horizontal reflection -> reverse rune order within each printed line",
  physicalLineLengths: lines.map(x => x.length),
  runeCount: original.length,
  scores: {
    original: sOriginal,
    mirroredLines: sMirror,
    wholePageReverseControl: sWhole,
  },
  native121RuneWindows: {
    n: native.length,
    min: nativeMin,
    q05: q(.05),
    median: q(.5),
    q95: q(.95),
    max: native[native.length - 1],
  },
  mirroredMarginBelowWorstNative: nativeMin - sMirror,
  mirroredTransliteration: translit(mirrored),
  decision: "HORIZONTAL_REFLECTION_DOES_NOT_RECOVER_NATIVE_GP29_TEXT_ORDER",
}, null, 2));
