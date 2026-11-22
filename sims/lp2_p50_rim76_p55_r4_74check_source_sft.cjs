'use strict';

/**
 * Original LP2 direct key bridge: p50 76-cell perimeter -> p55 76 GP runes
 * -> checksums of 74 six-back R4-ambiguous printed words.
 *
 * Run on Windows 11: node sims/lp2_p50_rim76_p55_r4_74check_source_sft.cjs
 * Read-only, deterministic; produces a complete source-native positive plant.
 *
 * This tests a hypothetical decoder. R4 and the checksum appendix are not
 * attributed to Cicada 3301 without an independently authored instruction.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const base = path.join(__dirname, '..', 'resources', 'liber-primus');
const corpus = JSON.parse(fs.readFileSync(path.join(base, 'lp2-corpus.json'), 'utf8'));
const transcription = fs.readFileSync(path.join(base, 'lp2-transcription.txt'), 'utf8');
const table = JSON.parse(fs.readFileSync(path.join(base, 'base60-grid.json'), 'utf8'));
const alphabet = new Map(corpus.runes.map((r, i) => [r, i]));
const mod = (n) => ((n % 29) + 29) % 29;
assert.equal(table.rows.length, 32);
const tokens = table.rows.flat();
assert.equal(tokens.length, 256);
assert.ok(table.rows.every(row => row.length === 8));

const words = [];
let word = [];
for (const section of transcription.split('%').slice(0, 55)) {
  for (const glyph of section.replace(/[\/\s]/g, '')) {
    if (alphabet.has(glyph)) word.push(alphabet.get(glyph));
    else if (word.length) { words.push(word); word = []; }
  }
}
if (word.length) words.push(word);
const source = words.flat();
assert.equal(words.length, 2896);
assert.equal(source.length, 12956);
assert.deepEqual(
  source, corpus.pages.filter(page => page.page <= 55).flatMap(page => page.indices)
);

const checks = [];
let ambiguityCount = 0;
const countByMultiplicity = [0, 0, 0];
for (const printed of words) {
  const sites = [];
  for (let j = 6; j < printed.length; j++) {
    if (printed[j] === mod(24 - 2 * printed[j - 6]) &&
        printed[j] !== printed[j - 1]) sites.push(j);
  }
  ambiguityCount += sites.length;
  assert.ok(sites.length <= 2);
  countByMultiplicity[sites.length]++;
  if (!sites.length) continue;
  const possibilities = new Set();
  for (let mask = 0; mask < 2 ** sites.length; mask++) {
    let total = printed.reduce((a, b) => a + b, 0);
    for (let bit = 0; bit < sites.length; bit++) {
      if (mask & (1 << bit)) {
        const at = sites[bit];
        total += printed[at - 1] - printed[at];
      }
    }
    possibilities.add(mod(total));
  }
  assert.equal(possibilities.size, 2 ** sites.length);
  checks.push(possibilities);
}
assert.equal(ambiguityCount, 79);
assert.equal(checks.length, 74);
assert.deepEqual(countByMultiplicity, [2822, 69, 5]);

// Printed perimeter, clockwise from top-left. Exclude repeated corners.
const rimIndices = [];
for (let c = 0; c < 8; c++) rimIndices.push(c);
for (let r = 1; r < 32; r++) rimIndices.push(8 * r + 7);
for (let c = 6; c >= 0; c--) rimIndices.push(8 * 31 + c);
for (let r = 30; r >= 1; r--) rimIndices.push(8 * r);
assert.equal(rimIndices.length, 76);
assert.equal(new Set(rimIndices).size, 76);

const p55 = corpus.pages.find(page => page.page === 55).indices;
assert.equal(p55.length, 76);
assert.equal(table.alphabet.length, 60);
const models = [];
for (const radix of [59, 60]) {
  const digits = radix === 60 ? table.alphabet : table.alphabet.replace('f', '');
  assert.equal(digits.length, radix);
  const byteValues = tokens.map(token =>
    radix * digits.indexOf(token[0]) + digits.indexOf(token[1]));
  assert.ok(byteValues.every(n => n >= 0 && n <= 255));
  if (radix === 60) {
    const sha256 = crypto.createHash('sha256')
      .update(Buffer.from(byteValues)).digest('hex');
    assert.equal(sha256,
      '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
  }
  const rim = rimIndices.map(index => byteValues[index]);
  for (const rimReverse of [false, true]) {
    for (const sourceReverse of [false, true]) {
      for (const sign of [-1, 1]) {
        for (const offset of [0, 1, 2]) {
          const pad = rimReverse ? rim.slice().reverse() : rim;
          const page = sourceReverse ? p55.slice().reverse() : p55;
          let compatible = 0;
          for (let i = 0; i < 74; i++) {
            const check = mod(page[offset + i] + sign * pad[offset + i]);
            if (checks[i].has(check)) compatible++;
          }
          models.push({
            radix, rimReverse, sourceReverse, sign, offset, compatible
          });
        }
      }
    }
  }
}
assert.equal(models.length, 48);
models.sort((a, b) => b.compatible - a.compatible);
const best = models[0].compatible;
const bestModels = models.filter(model => model.compatible === best);
const sumHits = models.reduce((a, b) => a + b.compatible, 0);
assert.equal(best, 10);
assert.equal(bestModels.length, 2);
assert.equal(sumHits, 266);
assert.deepEqual(
  bestModels.map(m => [m.radix, m.rimReverse, m.sourceReverse, m.sign, m.offset]),
  [[59, true, true, 1, 0], [60, true, false, 1, 1]]
);

// Independently manufactured 76-rune packet: each affected word's smallest
// legal nominal checksum is encrypted using the original p50 clockwise rim.
// The same completely fixed source gate must recover 74/74 planted checks.
const radix60 = table.alphabet;
const bytes = tokens.map(token =>
  60 * radix60.indexOf(token[0]) + radix60.indexOf(token[1]));
const pad = rimIndices.map(i => bytes[i]);
const planted = Array(76).fill(0);
planted[0] = 3;
planted[75] = 19;
for (let i = 0; i < 74; i++) {
  const chosen = Math.min(...checks[i]);
  planted[i + 1] = mod(chosen - pad[i + 1]);
}
const plantedHits = checks.filter((set, i) =>
  set.has(mod(planted[i + 1] + pad[i + 1]))).length;
assert.equal(plantedHits, 74);

const expectedSingle = (69 * 2 + 5 * 4) / 29;
let probability = [1];
for (const q of [...Array(69).fill(2 / 29), ...Array(5).fill(4 / 29)]) {
  const next = new Array(probability.length + 1).fill(0);
  for (let j = 0; j < probability.length; j++) {
    next[j] += probability[j] * (1 - q);
    next[j + 1] += probability[j] * q;
  }
  probability = next;
}
const singleModelTailAtLeast10 = probability.slice(10)
  .reduce((a, b) => a + b, 0);

console.log(JSON.stringify({
  originalRunes: source.length,
  originalWords: words.length,
  ambiguityCount, ambiguousWords: checks.length, countByMultiplicity,
  tableCells: tokens.length, rimCells: rimIndices.length,
  candidateModels: models.length, bestMatches: best, bestModels,
  matchTotal: sumHits, meanMatches: sumHits / models.length,
  uniformReferenceMean: expectedSingle,
  singleModelUniformTailAtLeast10: singleModelTailAtLeast10, plantedCompatible: plantedHits
}, null, 2));
console.log('PASS: exact source-conditioned packet test and 74/74 positive control.');
