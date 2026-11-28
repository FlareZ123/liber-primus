"use strict";

/**
 * LP2 p32/p55 source-selected horizontal-reflection text-opcode gate.
 *
 * The common tree source independently selects horizontal reflection on both
 * illustrated pages. Test the finite direct text interpretations:
 *   - reverse rune order within each physical line;
 *   - the independently calibrated literal GP glyph-reflection map;
 *   - the physically complete glyph+line raster mirror;
 *   - reversible GP29 Atbash, with and without line reversal.
 *
 * Compare every output with matched-length native solved-GP29 bigram windows.
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
const pages = transcript.split("\n%\n");
const runeSet = new Set(corpus.runes);
const index = new Map(corpus.runes.map((r, i) => [r, i]));

// Independently calibrated literal horizontal glyph-reflection map from the
// p2 original-image training gallery, already held-out on p22.
const mirrorOutputs = [
  "X","M","J","S","G","X","G","X","H","N","I","J","EO","E","X",
  "O","T","OE","E","E","X","NG","OE","D","OE","S","M","IA","EA",
];
const mirrorRunes = mirrorOutputs.map(x => {
  const i = corpus.translit.indexOf(x);
  assert.ok(i >= 0);
  return corpus.runes[i];
});
assert.equal(new Set(mirrorRunes).size, 17);
const mirrorMap = new Map(corpus.runes.map((r, i) => [r, mirrorRunes[i]]));
const atbashMap = new Map(corpus.runes.map((r, i) => [r, corpus.runes[28 - i]]));

const counts = Array.from({length: 29}, () => Array(29).fill(0.5));
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

/** @param {number} n */
function nativeWindowScores(n) {
  const out = [];
  for (const seq of sections) {
    for (let i = 0; i + n <= seq.length; i++) out.push(score(seq.slice(i, i + n)));
  }
  out.sort((a, b) => a - b);
  return out;
}

const translit = seq => seq.map(ch => corpus.translit[index.get(ch)]).join("");

/** @param {number} block @param {number[]} expectedLengths @param {string} name */
function testPage(block, expectedLengths, name) {
  const page = pages[block].split("\n&")[0].trim();
  const lines = page.split("\n").map(line => [...line].filter(ch => runeSet.has(ch)));
  assert.deepEqual(lines.map(x => x.length), expectedLengths);

  const original = lines.flat();
  const lineMirror = lines.flatMap(line => [...line].reverse());
  const wholeReverse = [...original].reverse();
  const glyphMirror = original.map(ch => mirrorMap.get(ch));
  const fullRasterMirror = lines.flatMap(line =>
    [...line].reverse().map(ch => mirrorMap.get(ch))
  );
  const atbash = original.map(ch => atbashMap.get(ch));
  const atbashLineMirror = lines.flatMap(line =>
    [...line].reverse().map(ch => atbashMap.get(ch))
  );

  const candidates = {
    original,
    lineMirror,
    wholeReverseControl: wholeReverse,
    fixedGlyphReflection: glyphMirror,
    fullRasterMirrorGlyphPlusLineOrder: fullRasterMirror,
    gp29Atbash: atbash,
    gp29AtbashPlusLineMirror: atbashLineMirror,
  };
  const scores = Object.fromEntries(
    Object.entries(candidates).map(([k, v]) => [k, score(v)])
  );
  const native = nativeWindowScores(original.length);
  const nativeMin = native[0];
  for (const [k, v] of Object.entries(scores)) {
    if (k === "original") continue;
    assert.ok(v < nativeMin, `${name} ${k} unexpectedly reaches native solved-GP range`);
  }

  return {
    transcriptionBlock: block,
    physicalLineLengths: expectedLengths,
    runeCount: original.length,
    distinctInputRunes: new Set(original).size,
    fixedGlyphMirrorDistinctOutputs: new Set(glyphMirror).size,
    scores,
    nativeWindows: {
      n: native.length,
      min: nativeMin,
      median: native[Math.floor(native.length / 2)],
      max: native[native.length - 1],
    },
    bestDirectReflectionScore: Math.max(
      scores.lineMirror, scores.fixedGlyphReflection,
      scores.fullRasterMirrorGlyphPlusLineOrder,
      scores.gp29Atbash, scores.gp29AtbashPlusLineMirror
    ),
    fullRasterMirrorTransliteration: translit(fullRasterMirror),
    atbashTransliteration: translit(atbash),
  };
}

const p32 = testPage(32, [25, 23, 23, 21, 22, 7], "p32");
const p55 = testPage(54, [24, 22, 22, 8], "p55");
assert.equal(p32.runeCount, 121);
assert.equal(p32.distinctInputRunes, 29);
assert.equal(p32.fixedGlyphMirrorDistinctOutputs, 17);
assert.equal(p32.nativeWindows.n, 1990);
assert.equal(p55.runeCount, 76);
assert.equal(p55.distinctInputRunes, 25);
assert.equal(p55.fixedGlyphMirrorDistinctOutputs, 15);
assert.equal(p55.nativeWindows.n, 2304);

console.log(JSON.stringify({
  sourceOperation: "common reflected tree -> finite direct horizontal-reflection text operations",
  p32,
  p55,
  decision: "NO_DIRECT_REFLECTION_TEXT_OPCODE_RECOVERS_NATIVE_GP29_ON_EITHER_TREE_PAGE",
}, null, 2));
