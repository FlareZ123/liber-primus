'use strict';

/**
 * Reproduce a bounded, original-source p3/p39 red-fragment Atbash observation.
 * Fixed solved-Cicada GP29 Atbash (index -> 28 - index), no key search.
 * Candidate meaning is not a completed LP2 plaintext decipherment.
 */
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..', 'resources', 'liber-primus');
const corpus = JSON.parse(readFileSync(path.join(root, 'lp2-corpus.json'), 'utf8'));
const ink = JSON.parse(readFileSync(path.join(root, 'lp2-ink-annotations.json'), 'utf8'));

/** @param {string} runes @returns {number[]} */
function indices(runes) {
  return Array.from(runes, rune => {
    const index = corpus.runes.indexOf(rune);
    assert.ok(index >= 0);
    return index;
  });
}

/** @param {number[]} symbols @returns {number[]} */
function atbash(symbols) {
  return symbols.map(index => 28 - index);
}

/** @param {number[]} symbols @returns {string} */
function transliteration(symbols) {
  return symbols.map(index => corpus.translit[index]).join('');
}

const redSpans = ink.pages.flatMap(page =>
  (page.red_spans || []).map(span => ({
    page: page.page,
    start: span.start,
    length: span.length,
    runes: span.runes,
  })),
);
assert.equal(redSpans.length, 18);

const triads = redSpans.filter(span => span.length === 3);
assert.deepEqual(triads.map(span => [span.page, span.start]), [[3, 119], [39, 119]]);

const evidence = triads.map(span => {
  const page = ink.pages.find(item => item.page === span.page);
  assert.ok(page);
  assert.ok(page.large_punctuation.some(([position, dots, color]) =>
    position === 119 && dots === 13 && color === 'red'));
  assert.ok(page.large_punctuation.some(([position, dots, color]) =>
    position === 122 && dots === 13 && color === 'red'));

  const source = indices(span.runes);
  const decoded = atbash(source);
  assert.deepEqual(atbash(decoded), source, 'Atbash must be a complete involution');
  return {
    page: span.page,
    start: span.start,
    length: span.length,
    originalRunes: span.runes,
    ciphertextIndices: source,
    ciphertextTransliteration: transliteration(source),
    atbashIndices: decoded,
    atbashGpSpelling: transliteration(decoded),
  };
});

assert.deepEqual(evidence.map(item => item.ciphertextIndices), [[13, 23, 2], [27, 5, 15]]);
assert.deepEqual(evidence.map(item => item.atbashGpSpelling), ['SCY', 'UDP']);

// Held-out solved-page control: the original p57 red PARABLE is literal plaintext.
// A global rule "Atbash every red span" would corrupt it into nonplaintext.
const solvedParable = redSpans.find(span => span.page === 57 && span.start === 0);
assert.ok(solvedParable);
const parable = transliteration(indices(solvedParable.runes));
const parableAtbash = transliteration(atbash(indices(solvedParable.runes)));
assert.equal(parable, 'PARABLE');
assert.equal(parableAtbash, 'SRARJHI');

console.log(JSON.stringify({
  observedIsolatedRedSpans: redSpans.length,
  isolatedRedThreeRuneSpans: triads.length,
  bothAreAfterExactly119PageLocalRunes: true,
  bothBracketedByRed13DotMarks: true,
  operation: 'Solved-LP1 GP29 Atbash P[i] = 28 - C[i]',
  fragments: evidence,
  orthographicNote: 'GP transliteration C represents the English C/K phoneme: SCY can spell SKY',
  solvedControl: { originalRedPage57: parable, indiscriminateAtbash: parableAtbash, conclusion: 'Atbash is not a global red-ink decoding rule' },
  historicalHypothesis: 'The signed 2013 sky/ICMP clue and 2013 TCP stage make SKY and UDP a protocol-related candidate. No live host/port, new decoder, or authenticated LP2 intended reading follows.',
  status: 'Source-exact local Atbash observation, provisional interpretation',
}, null, 2));
