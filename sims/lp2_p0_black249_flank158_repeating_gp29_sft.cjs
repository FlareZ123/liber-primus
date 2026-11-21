'use strict';

/**
 * Source-count-selected original p0 black249 / p49+p51 flank158 pad gate.
 *
 * The new original source p50 cycle 249 <-> 158 motivates this single
 * conservative reversible consumer: flank runes, in manuscript order,
 * repeat every 158 runes as a GP29 additive pad on the 249 black p0 runes.
 * Both decrypt signs are reported; no key phase, permutation, F-bypass or
 * word-clock is fitted on the original ciphertext.
 *
 * Run on Windows Node 22: node sims/lp2_p0_black249_flank158_repeating_gp29_sft.cjs
 */

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {parseLP2Words} = require('./lp2_word_pages.cjs');
const {buildSourceNativeTrigramModel} = require('./lp1_source_native_trigram_model.cjs');

const root = path.resolve(__dirname, '..');
/** @param {string} p @returns {string} */
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const ink = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const transcript = read('resources/liber-primus/lp2-transcription.txt');
const p0 = corpus.pages.find(p => p.page === 0).indices;
const p49 = corpus.pages.find(p => p.page === 49).indices;
const p51 = corpus.pages.find(p => p.page === 51).indices;
const flank = [...p49, ...p51];
const red = ink.pages.find(p => p.page === 0).red_spans
  .filter(s => s.start === 0).reduce((sum, s) => sum + s.length, 0);
const black = p0.slice(red);
const p0Words = parseLP2Words(transcript, 1).words;

assert.equal(red, 13);
assert.deepEqual(p0Words.slice(0, 2).map(w => w.length), [8, 5]);
assert.equal(p0Words.length, 59);
assert.equal(p0Words.slice(2).reduce((s, w) => s + w.length, 0), 249);
assert.equal(black.length, 249);
assert.equal(p49.length, 66);
assert.equal(p51.length, 92);
assert.equal(flank.length, 158);
assert.equal(grid.bytes[249], 158);
assert.equal(grid.bytes[158], 249);

const model = buildSourceNativeTrigramModel({
  corpus, referenceText: read('resources/liber-primus/lp1-plaintext-reference.txt')
});

/** @param {number} n @returns {number} */
const mod29 = n => ((n % 29) + 29) % 29;

/** @param {number[]} xs @returns {number} */
function ioc(xs) {
  const f = Array(29).fill(0);
  for (const x of xs) f[x]++;
  return f.reduce((s, n) => s + n * (n - 1), 0) / (xs.length * (xs.length - 1));
}

const decoders = [-1, 1].map(sign => {
  const candidate = black.map((c, i) => mod29(c + sign * flank[i % flank.length]));
  // Every reversible additive key candidate round-trips regardless of key
  // correctness. Round-trip is a minimal implementation invariant only.
  const replay = candidate.map((p, i) => mod29(p - sign * flank[i % flank.length]));
  assert.deepEqual(replay, black);
  const printedLengths = p0Words.slice(2).map(w => w.length);
  let offset = 0;
  const printWords = printedLengths.map(n => {
    const runes = candidate.slice(offset, offset + n);
    offset += n;
    return model.spell(runes);
  });
  assert.equal(offset, candidate.length);
  return {
    sign: sign < 0 ? 'subtract' : 'add',
    ioc: ioc(candidate), trigram: model.scoreStream(candidate).mean,
    previewWords: printWords.slice(0, 18),
    previewRaw: model.spell(candidate.slice(0, 75))
  };
});

// Native positive controls verify exactly the proposed additive inverse,
// without using the unknown p0 text as a desired plaintext.
const solved = corpus.pages.find(p => p.page === 57).indices;
const plantedCipher = solved.map((p, i) => mod29(p + flank[i]));
assert.deepEqual(plantedCipher.map((c, i) => mod29(c - flank[i])), solved);

console.log(JSON.stringify({
  status: 'rejected fixed repeated-flank GP29 additive consumer; no LP2 plaintext',
  input: 'p0 black249 and physical pp49+p51 flank158, original source order, period158 phase0',
  sourceCounts: {p0Total: p0.length, p0Red: red, p0Black: black.length,
    flankLeft: p49.length, flankRight: p51.length, flankTotal: flank.length,
    openingBodyWords: p0Words.length - 2},
  model: {lp1TrainingScore: model.trainingScore, clearP57Score: model.p57Score,
    originalP0BlackCipherIoC: ioc(black), originalP0BlackCipherTrigram: model.scoreStream(black).mean},
  decoders,
  positiveControl: 'original solved p57 GP indices, length95, 95/95 planted inverse',
  inferenceLimit: 'both signs fit by arithmetic; neither yields native-GP prose, and the table 2cycle supplies no author-defined consumer'
}, null, 2));
