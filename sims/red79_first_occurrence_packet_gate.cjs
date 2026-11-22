'use strict';
/**
 * Source-fixed 79-red-rune first-occurrence alphabet challenge.
 *
 * The red 8+20+51 spans on physical LP2 pages 40,15,53 supply exactly
 * 79 rune positions. Read those source spans in triangle order; keep first
 * occurrences to obtain 28 different glyphs, then insert the absent glyph
 * at each of 29 possible ranks. Test both orientations of this *fixed*
 * source-relative alphabet against phase35 forward 78->79 numeric packing.
 *
 * Also compute an exact, conditional, independent-whole-page-rotation null
 * for the observed missing-GP-E complete 28-rune inventory. Node 22 CJS.
 * Neither a clue's historical intent nor any original plaintext is assumed.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const corpus = read('resources/liber-primus/lp2-corpus.json');
const ink = read('resources/liber-primus/lp2-ink-annotations.json');
const sources = [40, 15, 53];
const spans = sources.map(page => {
  const data = corpus.pages[page].indices;
  return ink.pages.find(x => x.page === page).red_spans.flatMap(
    span => data.slice(span.start, span.start + span.length));
});
assert.deepEqual(spans.map(x => x.length), [8, 20, 51]);
const red = spans.flat();
const first = [...new Set(red)];
const missing = Array.from({length: 29}, (_, i) => i)
  .filter(x => !first.includes(x));
assert.equal(red.length, 79);
assert.equal(first.length, 28);
assert.deepEqual(missing, [18]); // GP E, not EA.
const cipher = corpus.pages.filter(x => x.page < 56).flatMap(x => x.indices);
assert.equal(cipher.length, 12956);
const clean = [];
for (let st = 35; st + 79 <= cipher.length; st += 79) {
  let repeated = false;
  for (let j = st; j < st + 79; j++) {
    if (cipher[j] === cipher[j - 1]) { repeated = true; break; }
  }
  if (!repeated) clean.push(st);
}
assert.equal(clean.length, 95);
const limit = 29n ** 78n;
const tests = [];
for (const direction of ['source', 'reverse']) {
  for (let insertion = 0; insertion <= 28; insertion++) {
    const order = first.slice();
    order.splice(insertion, 0, missing[0]);
    if (direction === 'reverse') order.reverse();
    const rank = Array(29);
    order.forEach((symbol, i) => { rank[symbol] = i; });
    let invalid = 0, leadingInvalid = 0;
    for (const st of clean) {
      let value = 0n;
      for (let j = st; j < st + 79; j++) {
        const digit = (rank[cipher[j]] - rank[cipher[j - 1]] + 28) % 29;
        if (j === st && digit > 15) leadingInvalid++;
        value = value * 28n + BigInt(digit);
      }
      if (value >= limit) invalid++;
    }
    tests.push({direction, insertion, invalid, leadingInvalid});
  }
}
assert.equal(tests.length, 58);
assert.equal(Math.min(...tests.map(x => x.invalid)), 37);
assert.equal(tests.filter(x => x.invalid === 0).length, 0);

/** Exact hidden-order numerical encoder/decoder positive control. */
function positive() {
  const order = first.slice();
  order.unshift(missing[0]);
  const rank = Array(29);
  order.forEach((glyph, i) => { rank[glyph] = i; });
  let prev = 18, recovered = 0, output = 0;
  for (let block = 0; block < 95; block++) {
    const plain = Array.from({length: 78}, (_, i) => (i * 17 + block * 11) % 29);
    let n = plain.reduce((v, d) => v * 29n + BigInt(d), 0n);
    const digits = Array(79);
    for (let j = 78; j >= 0; j--) {
      digits[j] = Number(n % 28n); n /= 28n;
    }
    assert.equal(n, 0n);
    let packed = 0n;
    for (const digit of digits) {
      const c = order[(rank[prev] + digit + 1) % 29];
      assert.notEqual(c, prev);
      const inverse = (rank[c] - rank[prev] + 28) % 29;
      assert.equal(inverse, digit);
      packed = packed * 28n + BigInt(inverse);
      prev = c;
      output++;
    }
    assert.ok(packed < limit);
    const restored = new Array(78);
    for (let j = 77; j >= 0; j--) {
      restored[j] = Number(packed % 29n);
      packed /= 29n;
    }
    assert.equal(packed, 0n);
    assert.deepEqual(restored, plain);
    recovered += 78;
  }
  return {syntheticPlainRunes: recovered, syntheticCipherRunes: output};
}
/** Bitmask of all rune labels in red windows after a page-wise rotation. */
function rotatedMasks(page, offset) {
  const data = corpus.pages[page].indices;
  const spans = ink.pages.find(x => x.page === page).red_spans;
  return Array.from({length: data.length}, (_, shift) => {
    let mask = 0;
    for (const s of spans) for (let j = 0; j < s.length; j++)
      mask |= 1 << data[(s.start + j + shift) % data.length];
    return mask;
  });
}
const masks = sources.map(rotatedMasks);
const target = ((1 << 29) - 1) ^ (1 << 18);
let full28NoE = 0, noE = 0, total = 0;
for (const a of masks[0]) for (const b of masks[1]) for (const c of masks[2]) {
  const union = a | b | c;
  if (!(union & (1 << 18))) noE++;
  if (union === target) full28NoE++;
  total++;
}
assert.equal(total, 6574491);
assert.equal(full28NoE, 135773);
assert.equal(noE, 517080);
assert.equal(masks[0][0] | masks[1][0] | masks[2][0], target);
const result = {
  classification: 'source-derived finite negative, no LP2 plaintext/key',
  pages: sources, originalRedLengths: spans.map(x => x.length),
  originalRedRunes: red.length, distinctFirstOccurrence: first.length,
  missingGPIndices: missing,
  fixedSourceOrder: first,
  phase: 35, direction: 'forward', cleanPackets: clean.length,
  variants: tests.length, best: tests.slice().sort((a, b) =>
    a.invalid - b.invalid).slice(0, 4),
  rangeInvalid: [Math.min(...tests.map(x => x.invalid)),
    Math.max(...tests.map(x => x.invalid))],
  exactSourceRotations: {
    total, full28NoE, probability: full28NoE / total,
    noE, probabilityNoE: noE / total,
    conditioning: 'Selected pages/spans and all 29 glyph labels frozen'
  },
  positive: positive(),
  caveat: 'The red triangle and 79-packet model were already selected retrospectively. This is an exact family exclusion, not evidence for an intended cipher.'
};
console.log(JSON.stringify(result, null, 2));
