'use strict';

/**
 * LP2 p33 complete black-word register + p34 carry (198 GP29 runes),
 * paired with all 99 authentic 2014 OpenPuff magic-square integers.
 * Original-only direct pair operations and a nonunit hard gate.
 * Windows 11 / Node 22 / CommonJS; read-only, no dependencies.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} file @returns {string} */
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const physical = read('resources/lp2-transcription.txt')
  .replace(/\r/g, '').split('\n%\n');
assert.equal(physical.length, 57);
const p33 = corpus.pages.find(page => page.page === 33).indices;
const p34 = corpus.pages.find(page => page.page === 34).indices;
assert.deepEqual([p33.length, p34.length], [214, 261]);

/** @param {string} text @returns {string[]} */
function words(text) {
  return text.replace(/\/\s*\n/g, '').replace(/[\s/]/g, '')
    .split(/[-.]/g).filter(Boolean);
}
const twoSections = physical[33].split('&').map(words);
assert.deepEqual(twoSections.map(section => section.length), [23, 30]);
const blackWords = twoSections.flatMap(section => section.slice(2));
assert.deepEqual(twoSections.map(section => section.slice(2).length), [21, 28]);
assert.equal(blackWords.length, 49);
assert.equal(blackWords.at(-1), 'ᛒ', 'last p33 word begins before page carry');
assert.ok(physical[34].startsWith('ᛗᛒ-'), 'two original carry runes on p34');
const charToGP = new Map(corpus.runes.map((rune, i) => [rune, i]));
/** @param {string} word @returns {number[]} */
function gp(word) {
  return [...word].map(rune => {
    assert.ok(charToGP.has(rune), 'only known GP rune glyphs');
    return charToGP.get(rune);
  });
}
const p33Black = blackWords.flatMap(gp);
assert.deepEqual(p33Black, p33.slice(10, 91).concat(p33.slice(99)));
assert.equal(p33Black.length, 196);
const original = p33Black.concat(p34.slice(0, 2));
assert.equal(original.length, 198);
assert.deepEqual(original.slice(-3), gp('ᛒᛗᛒ'));

const squareText = read('resources/cicada2014-openpuff-magic-squares.txt');
const squares = squareText.trim().split(/\r?\n\s*\r?\n/).map(block =>
  block.trim().split(/\r?\n/).map(row =>
    row.trim().split(/\s+/).map(Number)));
assert.deepEqual(squares.map(matrix => matrix.length), [5, 7, 5]);
const sums = [3301, 1033, 1033];
squares.forEach((matrix, i) => {
  assert.ok(matrix.every(row => row.length === matrix.length));
  assert.ok(matrix.every(row => row.reduce((sum, x) => sum + x, 0) === sums[i]));
});
const key = squares.flat(2);
assert.equal(key.length, 99);
assert.equal(2 * key.length, original.length);

const mod = (x, m) => (x % m + m) % m;
/**
 * @param {number[]} input 198 original GP29 symbols
 * @param {number} sign +1 or -1
 * @param {'base29-integer'|'independent-digits'} law
 * @param {number[]} values 99 historical square numbers
 * @returns {number[]}
 */
function transform(input, sign, law, values) {
  assert.equal(input.length, 2 * values.length);
  const result = [];
  for (let i = 0; i < values.length; i++) {
    const k = mod(values[i], 841);
    const x = input[2*i], y = input[2*i+1];
    if (law === 'base29-integer') {
      const n = mod(29*x + y + sign*k, 841);
      result.push(Math.floor(n / 29), n % 29);
    } else {
      assert.equal(law, 'independent-digits');
      result.push(mod(x + sign*Math.floor(k / 29), 29),
        mod(y + sign*(k % 29), 29));
    }
  }
  return result;
}
/** @param {number[]} runes @returns {number} */
function ioc(runes) {
  const counts = Array(29).fill(0);
  for (const rune of runes) counts[rune]++;
  return counts.reduce((sum, n) => sum+n*(n-1), 0) /
    (runes.length * (runes.length-1));
}
/** @param {number[]} runes @returns {string} */
const translit = runes => runes.map(i => corpus.translit[i]).join('');
const solved = corpus.pages.find(page => page.page === 57).indices;
assert.equal(solved.length, 95);
const positive = Array.from({length:198}, (_, i) => solved[i % solved.length]);
const outcomes = [];
for (const law of ['base29-integer', 'independent-digits']) {
  for (const sign of [-1, +1]) {
    const decoded = transform(original, sign, law, key);
    const restored = transform(decoded, -sign, law, key);
    assert.deepEqual(restored, original, 'all 198 original runes reencrypt');
    const encryptedPlant = transform(positive, -sign, law, key);
    assert.deepEqual(transform(encryptedPlant, sign, law, key), positive);
    const wrong = transform(encryptedPlant, sign, law, key.slice().reverse());
    assert.ok(wrong.some((v,i) => v !== positive[i]), 'wrong-order key control');
    outcomes.push({law, sign, decodedIoC:ioc(decoded),
      first72GP:translit(decoded.slice(0, 72)),
      exactOriginalReplay:198, positiveGPReplay:198});
  }
}
assert.deepEqual(outcomes.map(o => Number(o.decodedIoC.toFixed(10))),
  [0.0388145414, 0.0338409475, 0.0363533815, 0.0343536892]);

// The same historical square has 4 entries divisible by29.
// Multiplication C=K*P (mod841) would force C%29=0 at those positions,
// but all four original ciphertext pairs have nonzero low digits.
// The reverse P=K*C is not bijective for these keys either.
const nonunits = key.flatMap((k,i) => k % 29 === 0 ?
  [{pairIndex:i, key:k, sourcePair:original.slice(2*i,2*i+2),
    number:29*original[2*i]+original[2*i+1]}] : []);
assert.deepEqual(nonunits.map(x => x.pairIndex), [6,18,40,58]);
assert.deepEqual(nonunits.map(x => x.number), [821,247,603,515]);
assert.ok(nonunits.every(x => x.number%29!==0));
console.log(JSON.stringify({
  source:'p33 49 black words completed by two actual p34 carry runes',
  gpRuneCount:198, squareCells:99, matrixDimensions:[5,7,5],
  originalIoC:ioc(original), nativeClearP57IoC:ioc(solved),
  directAdditivePairs:outcomes,
  multiplicativeUnitObstruction:nonunits,
  meaning:'Exact source alignment; direct square-pad pair inverses fail to produce native GP plaintext. No author-selected cipher or plaintext is claimed.'
},null,2));
console.log('PASS: original 198/99 source-pair gate and all controls.');

/**
 * Historically stronger operation than guessed pair arithmetic:
 * original solved LP1 SOME WISDOM expands each whole runic word to
 * its exact GP-prime sum in the 5×5/1033 square. Test transfer to
 * p33's 49 complete original word lengths and historical 7×7/1033,
 * under ALL eight source-natural square orientations, granting
 * arbitrary secret new GP rune choices at every original position.
 * A target sum is feasible only if it lies in the exact set of sums
 * of that many original GP prime weights.
 */
const completeWords = blackWords.slice();
completeWords[48] += [...physical[34]].slice(0, 2).join('');
const lengths = completeWords.map(word => [...word].length);
assert.equal(completeWords.flatMap(gp).length, 198);
assert.equal(lengths.reduce((sum, n) => sum + n, 0), 198);
assert.equal(corpus.prime.length, 29);
assert.equal(Math.min(...corpus.prime), 2);
assert.equal(Math.max(...corpus.prime), 109);
const reachableSums = [new Set([0])];
for (let n = 1; n <= Math.max(...lengths); n++) {
  reachableSums.push(new Set(
    [...reachableSums[n-1]].flatMap(sum => corpus.prime.map(p => sum + p))
  ));
}
const originalMagic7 = squares[1];
const wordPrimeSumObstructions = [];
for (let reflected = 0; reflected <= 1; reflected++) {
  for (let rotation = 0; rotation < 4; rotation++) {
    const sourceTargets = [];
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 7; col++) {
        let r = row, c = col;
        if (reflected) r = 6-r;
        for (let turn = 0; turn < rotation; turn++) [r,c] = [c,6-r];
        sourceTargets.push(originalMagic7[r][c]);
      }
    }
    const impossible = sourceTargets.flatMap((sum,i) =>
      reachableSums[lengths[i]].has(sum) ? [] :
        [{word:i+1, GP29Runes:lengths[i], targetPrimeSum:sum}]);
    wordPrimeSumObstructions.push({
      reflected:Boolean(reflected), rotation90:rotation,
      impossibleWords:impossible.length, examples:impossible.slice(0,5)
    });
  }
}
assert.deepEqual(wordPrimeSumObstructions.map(x => x.impossibleWords),
  [14,17,14,17,17,18,17,18]);
assert.ok(wordPrimeSumObstructions.every(x => x.impossibleWords >= 14));
console.log('Original complete-word GP prime-sum -> historical 7x7 source orientations');
console.log(JSON.stringify(wordPrimeSumObstructions,null,2));
console.log('PASS: all 8 authentic square orientations have >=14 exact unreachable word-prime sums, even with fully secret GP plaintext symbols.');

/**
 * Corpus-internal frequency calibration for the exact two-runes-per-99-square
 * 198-length relation. The source transcription omits the entirely non-rune
 * p50 image, so source blocks 0..54 correspond to rune-bearing physical
 * pages 0..55 (and exclude solved p56/p57 at blocks 55/56).
 * Original data independently demands 12,956 runes in 2,896 complete words.
 * Explicit separators are honored, physical line/page wraps are joined,
 * and visual decimal labels are not GP29 runes.
 */
const canonicalRunes = new Set(corpus.runes);
const unknownPhysicalText = physical.slice(0, 55).join('')
  .replace(/\//g,'').replace(/\s/g,'');
const completeUnknownWords = unknownPhysicalText.split(/[-.&$%]/)
  .filter(Boolean).map(part => [...part]
    .filter(c => canonicalRunes.has(c)).join('')).filter(Boolean);
const allUnknownLengths = completeUnknownWords.map(s => [...s].length);
assert.equal(completeUnknownWords.length, 2896);
assert.equal(allUnknownLengths.reduce((sum,n) => sum+n,0), 12956);
const rolling49 = [];
let sum49 = allUnknownLengths.slice(0,49).reduce((s,n) => s+n,0);
rolling49.push(sum49);
for (let i=49; i<allUnknownLengths.length; i++) {
  sum49 += allUnknownLengths[i] - allUnknownLengths[i-49];
  rolling49.push(sum49);
}
assert.equal(rolling49.length, 2848);
const exact198 = rolling49.filter(n => n===198).length;
assert.equal(exact198,26);
console.log(JSON.stringify({
  corpusCalibration:'unknown LP2 complete printed words, source-boundary-aware',
  unknownGP29Runes:12956,unknownWords:2896,windows49:2848,
  windowsWith198Runes:exact198,
  descriptiveFraction:exact198/rolling49.length,
  warning:'Sliding windows overlap and 198/99 was noticed after seeing the puzzle. This is a descriptive base-rate, NOT a significance probability for Cicada intent.'
},null,2));
console.log('PASS: 198-rune 49-word relation has source-internal 26/2848 base rate.');
