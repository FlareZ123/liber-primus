'use strict';

/**
 * Original visual line-break candidate: p55 long 13-rune word split 1+12
 * exactly mirrors p57 CIRCUMFERENCES 14-rune word split 1+13.
 *
 * Candidate p55 plaintext word CIRCUMFERENCE is NOT assumed to be true.
 * It fails plaintext-F-transparent encoding and a no-skip period13 key
 * inferred there contradicts a separate hypothesized OUR OWN p55 footer.
 *
 * Run on Windows 11: node sims/lp2_p55_p57_linecarry_circumference_word13_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = path.join(__dirname, '..', 'resources', 'liber-primus');
const corpus = JSON.parse(fs.readFileSync(path.join(base, 'lp2-corpus.json'), 'utf8'));
const transcription = fs.readFileSync(path.join(base, 'lp2-transcription.txt'), 'utf8');
const GP = new Map(corpus.runes.map((r, i) => [r, i]));
const alpha = new Map(corpus.translit.map((s, i) => [s, i]));
const page = i => corpus.pages.find(p => p.page === i).indices;
const mod = n => ((n % 29) + 29) % 29;

function exactLines(source) {
  const lines = [];
  let index = 0;
  for (const line of source.split('/')) {
    const indices = [...line].filter(x => GP.has(x)).map(x => GP.get(x));
    lines.push({ start: index, end: index + indices.length, indices });
    index += indices.length;
  }
  return lines;
}
const sourcePages = transcription.split('%');
const line55 = exactLines(sourcePages.at(-3));
const line57 = exactLines(sourcePages.at(-1));
assert.deepEqual(line55.filter(l => l.indices.length).map(l => l.indices.length),
  [24, 22, 22, 8]);
assert.deepEqual(line57.filter(l => l.indices.length).map(l => l.indices.length),
  [20, 17, 17, 18, 23]);
assert.deepEqual(line55.flatMap(l => l.indices), page(55));
assert.deepEqual(line57.flatMap(l => l.indices), page(57));

// The 13-rune p55 word starts with the final rune of printed line 1.
const p55 = page(55), p57 = page(57);
const ciphertextWord = p55.slice(23, 36);
assert.equal(ciphertextWord.length, 13);
assert.equal(line55[0].end, 24);
assert.deepEqual(ciphertextWord.slice(0, 1), line55[0].indices.slice(-1));
assert.deepEqual(ciphertextWord.slice(1), line55[1].indices.slice(0, 12));

// Clear p57 CIRCUMFERENCES likewise starts with the final rune of
// printed line 3 (source p57 local53), with thirteen on line 4.
const knownPlural = [...'CIRCUMFERENCES'].map(x => alpha.get(x));
const hypotheticalSingular = [...'CIRCUMFERENCE'].map(x => alpha.get(x));
const footer = [...'OUROWN'].map(x => alpha.get(x));
assert.equal(knownPlural.length, 14);
assert.equal(hypotheticalSingular.length, 13);
assert.deepEqual(p57.slice(53, 67), knownPlural);
assert.equal(line57[2].end, 54);
assert.deepEqual(knownPlural.slice(0, 1), line57[2].indices.slice(-1));
assert.deepEqual(knownPlural.slice(1), line57[3].indices.slice(0, 13));
assert.deepEqual(p55.slice(70, 76), [23, 11, 1, 17, 18, 10]);

// Under actual solved-LP1 plaintext F bypass, any plaintext F must emit
// original ciphertext F literally. The source-conjectured word has F
// at relative sixth (zero-based6), but p55 source has U at that site.
assert.equal(hypotheticalSingular[6], 0);
assert.equal(ciphertextWord[6], alpha.get('U'));
assert.notEqual(ciphertextWord[6], 0);

// Independently test *nontransparent* 13-position repeating GP29
// Vigenere for both proposed visual/text cribs, without fitting a key.
const key = ciphertextWord.map((c, i) => mod(c - hypotheticalSingular[i]));
assert.deepEqual(key, [12, 18, 25, 9, 9, 0, 1, 16, 9, 19, 12, 15, 23]);
function phase(position) {
  return ((position - 23) % 13 + 13) % 13;
}
const footerKeys = footer.map((_, i) => key[phase(70 + i)]);
const requiredFooterKeys = footer.map((p, i) => mod(p55[70 + i] - p));
assert.deepEqual(footerKeys, [9, 19, 12, 15, 23, 12]);
assert.deepEqual(requiredFooterKeys, [20, 10, 26, 14, 11, 1]);
const footerMatches = footerKeys.filter((k, i) => k === requiredFooterKeys[i]).length;
assert.equal(footerMatches, 0);
const decoded = p55.map((c, i) => mod(c - key[phase(i)]));
const decodedFooter = decoded.slice(70, 76);
const ioc = a => {
  const n = Array(29).fill(0);
  for (const v of a) n[v]++;
  return n.reduce((total, v) => total + v * (v - 1), 0) /
    (a.length * (a.length - 1));
};
const genuineHoldout = decoded.filter((_, i) => i < 23 || i >= 36);
assert.ok(Math.abs(ioc(genuineHoldout) - 0.037378392217101895) < 1e-12);

// Independent, solved-p57-shaped positive, with both candidate phrases
// inserted and an arbitrary hidden 13-step key. The same direct algorithm
// recovers the genuine 13-key and correctly predicts both holdout phrases.
const plant = Array.from({ length: 76 }, (_, i) => p57[i % p57.length]);
plant.splice(23, 13, ...hypotheticalSingular);
plant.splice(70, 6, ...footer);
const secret = Array.from({ length: 13 }, (_, i) => (7 * i + 11) % 29);
const plantedCipher = plant.map((v, i) => mod(v + secret[phase(i)]));
const plantedKey = plantedCipher.slice(23, 36).map((c, i) =>
  mod(c - hypotheticalSingular[i]));
assert.deepEqual(plantedKey, secret);
assert.deepEqual(
  plantedCipher.slice(70).map((c, i) => mod(c - plantedKey[phase(70 + i)])),
  footer
);
assert.deepEqual(plantedCipher.map((c, i) => mod(c - plantedKey[phase(i)])), plant);

console.log(JSON.stringify({
  source: {
    p55SingleRuneLongWordBreak: [23, 24], p55LongCipherWord:
      ciphertextWord.map(i => corpus.translit[i]).join(' '),
    p57SingleRuneLongWordBreak: [53, 54],
    p57KnownPlural: 'CIRCUMFERENCES',
    p55HypothesizedSingular: 'CIRCUMFERENCE'
  },
  genuineFBypassContradiction: {
    expectedLiteralFAtP55Index: 29, printedCipherAt29: corpus.translit[p55[29]]
  },
  noSkipPeriod13: {
    inferredKey: key, requiredFooterKeys, inferredFooterKeys: footerKeys,
    overlappingAnchorAgreementOutOf6: footerMatches,
    decodedFooter: decodedFooter.map(i => corpus.translit[i]).join(' '),
    untouched63RuneIoC: ioc(genuineHoldout)
  },
  sourceNativePositive: {
    period13KeyRecovered: true, all76Correct: true, bothCribsCorrect: true
  }
}, null, 2));
console.log('PASS: shared single-rune-linebreak source; two precise candidate-crib inverses fail.');
