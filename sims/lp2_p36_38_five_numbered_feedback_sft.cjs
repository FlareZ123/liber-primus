'use strict';

/**
 * Source-exact five-numbered-stanza counterexample to a GP29
 * ciphertext-feedback law selected by the literal red labels 1..5.
 * Windows 11 / Node >=22: run this file with Node from any directory.
 * No external modules or web/network requests.
 *
 * Inputs: original LP2 transcription and canonical numeric GP29 corpus.
 * Original image mapping: p36=53.jpg, p37=54.jpg, p38=55.jpg.
 *
 * Tested reversible family:
 *   C[j] = (C[j-1] + P[j] + sectionNumber) mod 29,
 *   C[-1] = 0 at each *numbered* paragraph (not each physical page).
 * A fixed nonzero unit coefficient of P and fixed additive offsets preserve
 * the differenced-stream IoC, so one test excludes no more than this family.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const raw = fs.readFileSync(path.join(root, 'resources', 'liber-primus',
  'lp2-transcription.txt'), 'utf8');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources',
  'liber-primus', 'lp2-corpus.json'), 'utf8'));
const gp = corpus.runes.join('');
assert.equal(gp.length, 29);

const pages = raw.split(/(?:^|\n)%\s*(?:\n|$)/m);
assert.equal(pages.length, 57);
const [p36, p37, p38] = [pages[36], pages[37], pages[38]];
assert.ok(p36.includes('\n1-'));
assert.ok(p37.startsWith('2-') && p37.includes('\n3-') &&
  p37.includes('\n4-'));
assert.ok(p38.includes('\n5-') && p38.includes('\n&'));
const i1 = p36.indexOf('\n1-');
const i3 = p37.indexOf('\n3-');
const i4 = p37.indexOf('\n4-');
const i5 = p38.indexOf('\n5-');
const iEnd = p38.indexOf('\n&');
const fragments = [
  p36.slice(i1 + 3),
  p37.slice(2, i3),
  p37.slice(i3 + 3, i4),
  p37.slice(i4 + 3) + p38.slice(0, i5),
  p38.slice(i5 + 3, iEnd)
];

/** @param {string} s @returns {string[]} */
function parseWords(s) {
  // Source '/' marks visual line wrap, including at cropped stanza ends.
  const stream = s.replace(/\//g, '').replace(/[\r\n]/g, '');
  const tokens = stream.split(/[-.]/).filter(t => t.length);
  for (const token of tokens) {
    assert.ok([...token].every(r => gp.includes(r)),
      'unexpected non-GP letter in printed stanza ' + token);
  }
  return tokens;
}
/** @param {number} n @returns {number} */
const mod29 = n => ((n % 29) + 29) % 29;

/**
 * @param {number[]} c
 * @param {number} printedSection 1..5
 * @returns {number[]}
 */
function decode(c, printedSection) {
  let prev = 0;
  return c.map(v => {
    const p = mod29(v - prev - printedSection);
    prev = v;
    return p;
  });
}
/**
 * @param {number[]} p
 * @param {number} printedSection 1..5
 * @returns {number[]}
 */
function encode(p, printedSection) {
  let prev = 0;
  return p.map(v => (prev = mod29(prev + v + printedSection)));
}
/** @param {number[]} xs @returns {number} */
function ioc(xs) {
  const freq = Array(29).fill(0);
  for (const v of xs) {
    assert.ok(Number.isInteger(v) && v >= 0 && v < 29);
    freq[v] += 1;
  }
  return freq.reduce((a, v) => a + v * (v - 1), 0) /
    (xs.length * (xs.length - 1));
}
/** @param {number[]} p @param {number[]} lengths @returns {string} */
function firstWords(p, lengths) {
  let start = 0;
  return lengths.slice(0, 8).map(n => {
    const w = p.slice(start, start + n)
      .map(v => corpus.translit[v]).join('');
    start += n;
    return w;
  }).join(' ');
}

const clear = corpus.pages.find(p => p.page === 57).indices;
assert.equal(clear.length, 95);
const expectedLengths = [139, 91, 98, 96, 129];
const expectedWords = [30, 20, 25, 19, 28];
const expectedEquals = [1, 0, 0, 0, 0];
let grandTotal = 0;
let grandWords = 0;

for (let k = 0; k < 5; k += 1) {
  const section = k + 1;
  const words = parseWords(fragments[k]);
  const lengths = words.map(w => [...w].length);
  const c = words.flatMap(w => [...w].map(r => gp.indexOf(r)));
  assert.equal(c.length, expectedLengths[k]);
  assert.equal(words.length, expectedWords[k]);
  const adjacent = c.reduce((n, v, j) =>
    n + (j && v === c[j - 1] ? 1 : 0), 0);
  assert.equal(adjacent, expectedEquals[k]);
  const p = decode(c, section);
  assert.deepEqual(encode(p, section), c,
    'exact original ciphertext forward reconstruction');
  // Native clear-p57 positive: run the *same* five-state operation on
  // a source-native GP29 plant of identical length, then invert perfectly.
  const plantedPlain = c.map((_, j) => clear[j % clear.length]);
  assert.deepEqual(decode(encode(plantedPlain, section), section), plantedPlain);
  const io = ioc(p);
  grandTotal += c.length;
  grandWords += words.length;
  console.log(JSON.stringify({
    section, physicalPages: ['36', '37', '37', '37-38', '38'][k],
    runes: c.length, printedWords: words.length,
    adjacentEquals: adjacent, sourceCipherIoc: ioc(c),
    decodedIoc: io, sourceRedLabel: section,
    originalOpening: firstWords(p, lengths),
    originalReciphered: true, nativeGPPlantRoundTrip: true
  }));
}
assert.equal(grandTotal, 553);
assert.equal(grandWords, 122);
console.log(JSON.stringify({
  status: 'PASS', fiveSourceLabels: [1, 2, 3, 4, 5],
  totalRunes: grandTotal, printedWords: grandWords,
  p57ClearIoc: ioc(clear),
  interpretation: 'One source-number-seeded ciphertext-feedback law is invertible but yields no recognizable GP29 text; all five original numbered paragraphs are included.'
}));
