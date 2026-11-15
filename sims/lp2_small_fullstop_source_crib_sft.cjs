'use strict';

/**
 * Strict 138-confirmed-small-full-stop source-quotation length screen.
 * Node.js 22 CommonJS; read-only; no external dependencies.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const load = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const corpus = JSON.parse(load('resources/liber-primus/lp2-corpus.json'));
const punctuation = JSON.parse(load('resources/liber-primus/lp2-punctuation-identity.json'));
const parts = load('resources/liber-primus/lp2-transcription.txt').split(/\r?\n%\r?\n/);
assert.equal(parts.length, 57);

const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const runeSet = new Set(corpus.runes);
const source = corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
assert.equal(source.length, 12956);
const transcribed = Array.from(parts.slice(0, -2).join('\n'))
  .filter(ch => runeIndex.has(ch))
  .map(ch => runeIndex.get(ch));
assert.deepEqual(transcribed, source);

const audit = punctuation.source_audit;
assert.equal(audit.morphology.stop_four_dot_diamonds.count, 138);
assert.equal(audit.morphology.stop_single_dot_ambiguous, 1);
assert.equal(audit.morphology.stop_three_dot_comma_form, 1);
assert.equal(audit.morphology.stop_absent, 1);
assert.equal(audit.morphology.comma_three_dot_zigzags, 4);
const excluded = new Set([57, 58, 59, 60, 91, 125, 127]);
const stopEvents = punctuation.events.filter(e => e.symbol === '⁘' && e.page <= 55);
assert.equal(stopEvents.length, 145);
const confirmed = stopEvents.filter(e => !excluded.has(e.index));
assert.equal(confirmed.length, 138);
const offsets = confirmed.map(e => e.rune_offset).sort((a, b) => a - b);
assert.equal(new Set(offsets).size, 138);
assert.equal(offsets[0], 154);
assert.equal(offsets.at(-1), 12597);

function strictLengths(boundaries) {
  const b = [0, ...boundaries, source.length];
  const lengths = b.slice(1).map((end, i) => end - b[i]);
  assert.ok(lengths.every(n => n > 0));
  assert.equal(lengths.reduce((a, n) => a + n, 0), source.length);
  return lengths;
}
const lengths = strictLengths(offsets);
assert.equal(lengths.length, 139);
assert.deepEqual(lengths.slice(0, 12), [154, 121, 22, 53, 44, 40, 97, 494, 21, 21, 44, 183]);
assert.equal(lengths.at(-1), 359);

function runeRuns(text) {
  const out = [];
  let n = 0;
  for (const ch of text) {
    if (runeSet.has(ch)) n++;
    else if (ch === '.' && n) {
      out.push(n);
      n = 0;
    }
  }
  if (n) out.push(n);
  return out;
}

const GP_GROUPS = ['ING', 'IO', 'TH', 'NG', 'EO', 'OE', 'AE', 'IA', 'EA'];
function gpLength(text) {
  const s = text.toUpperCase()
    .replace(/[^A-Z]/g, '')
    .replace(/QU/g, 'CW')
    .replace(/V/g, 'U')
    .replace(/[KQ]/g, 'C')
    .replace(/Z/g, 'S');
  let n = 0;
  for (let i = 0; i < s.length; n++) {
    const group = GP_GROUPS.find(g => s.startsWith(g, i));
    i += group ? group.length : 1;
  }
  return n;
}

function referenceLengths(text, mode) {
  return text.split(/[.!?]/)
    .map(part => mode === 'gp' ? gpLength(part) : (part.match(/[A-Za-z]/g) || []).length)
    .filter(Boolean);
}

function longest(a, b) {
  const index = new Map();
  for (let j = 0; j + 2 < b.length; j++) {
    const key = b.slice(j, j + 3).join(',');
    if (!index.has(key)) index.set(key, []);
    index.get(key).push(j);
  }
  let max = 0;
  const hits = [];
  for (let i = 0; i + 2 < a.length; i++) {
    const key = a.slice(i, i + 3).join(',');
    for (const j of index.get(key) || []) {
      let n = 3;
      while (i + n < a.length && j + n < b.length && a[i + n] === b[j + n]) n++;
      if (n > max) {
        max = n;
        hits.length = 0;
      }
      if (n === max) hits.push({ unknownIndex: i, sourceIndex: j, values: a.slice(i, i + n) });
    }
  }
  return { max: max || 2, hits: hits.slice(0, 5) };
}

const sources = [
  { name: 'Shakespeare first 300k', path: 'resources/control/shakespeare_first300k.txt' },
  { name: 'Emerson essays', path: 'resources/control/emerson_essays_2944.txt' },
  { name: 'Gibran The Prophet', path: 'resources/control/gibran_prophet_58585.txt' },
  { name: 'Blake Marriage of Heaven and Hell', path: 'resources/external/blake-marriage-1906-gutenberg45315.txt' },
  { name: 'Crowley Book of the Law I', path: 'resources/external/2013-book-of-law-I.txt' },
  { name: 'Crowley Book of the Law II', path: 'resources/external/2013-book-of-law-II.txt' },
  { name: 'Crowley Book of the Law III', path: 'resources/external/2013-book-of-law-III.txt' },
  { name: 'Liber AL bookcode I', path: 'resources/external/2013-liber-al-bookcode-I.txt' },
  { name: 'Liber AL bookcode II', path: 'resources/external/2013-liber-al-bookcode-II.txt' },
  { name: 'Liber AL bookcode III', path: 'resources/external/2013-liber-al-bookcode-III.txt' }
];

function compareFrame(frame) {
  const results = [];
  for (const sourceFile of sources) {
    const text = load(sourceFile.path);
    for (const mode of ['latin', 'gp']) {
      const ref = referenceLengths(text, mode);
      results.push({
        source: sourceFile.name,
        mode,
        referenceSpans: ref.length,
        ...longest(frame, ref)
      });
    }
  }
  const lp1 = runeRuns(load('resources/transcriptions/lp1_wulfic_canonical.txt'));
  results.push({
    source: 'Original LP1 rune-only',
    mode: 'runes',
    referenceSpans: lp1.length,
    ...longest(frame, lp1)
  });
  return results;
}

const strictResults = compareFrame(lengths);
assert.equal(strictResults.length, 21);
assert.equal(Math.max(...strictResults.map(x => x.max)), 3);
const triple = strictResults.filter(x => x.max === 3);
assert.equal(triple.length, 1);
assert.equal(triple[0].source, 'Shakespeare first 300k');
assert.equal(triple[0].mode, 'gp');
assert.deepEqual(triple[0].hits[0], {
  unknownIndex: 83,
  sourceIndex: 3142,
  values: [61, 41, 71]
});
const shakespeareGp = referenceLengths(load(sources[0].path), 'gp');
assert.equal(lengths[86], 312);
assert.equal(shakespeareGp[3145], 29);
assert.notEqual(lengths[86], shakespeareGp[3145]);

// Ambiguous event 91 sensitivity: include it as a 139th stop boundary.
const ambiguous = punctuation.events.find(e => e.index === 91);
const ambiguousLengths = strictLengths([...offsets, ambiguous.rune_offset].sort((a, b) => a - b));
assert.equal(ambiguousLengths.length, 140);
const ambiguousResults = compareFrame(ambiguousLengths);
assert.equal(ambiguousResults.length, 21);
assert.equal(Math.max(...ambiguousResults.map(x => x.max)), 3);
const ambiguousTriple = ambiguousResults.filter(x => x.max === 3);
assert.equal(ambiguousTriple.length, 1);
assert.equal(ambiguousTriple[0].source, 'Shakespeare first 300k');
assert.equal(ambiguousTriple[0].mode, 'gp');
assert.deepEqual(ambiguousTriple[0].hits[0], {
  unknownIndex: 84,
  sourceIndex: 3142,
  values: [61, 41, 71]
});

// Source-authentic p57 positive control, planted at unknown field index 75.
const p57Lengths = runeRuns(parts.at(-1));
assert.deepEqual(p57Lengths, [7, 30, 30, 28]);
const plant = lengths.slice();
plant.splice(75, 4, ...p57Lengths);
const plantResult = longest(plant, p57Lengths);
assert.equal(plantResult.max, 4);
assert.equal(plantResult.hits[0].unknownIndex, 75);
assert.deepEqual(plantResult.hits[0].values, p57Lengths);

console.log(JSON.stringify({
  strictFrame: {
    unknownRunes: source.length,
    confirmedStops: offsets.length,
    fields: lengths.length,
    firstStop: offsets[0],
    lastStop: offsets.at(-1),
    first12Lengths: lengths.slice(0, 12),
    eofTail: lengths.at(-1)
  },
  sourceResults: strictResults,
  strictMaximum: 3,
  uniqueThreeFieldMatch: {
    source: triple[0].source,
    mode: triple[0].mode,
    unknownIndex: 83,
    sourceIndex: 3142,
    lengths: [61, 41, 71],
    nextUnknown: 312,
    nextSource: 29
  },
  ambiguousSensitivity: {
    fields: ambiguousLengths.length,
    maximum: 3,
    matchUnknownIndex: 84,
    matchSourceIndex: 3142,
    lengths: [61, 41, 71]
  },
  p57PositiveControl: {
    sourceLengths: p57Lengths,
    plantedUnknownIndex: 75,
    recoveredLength: plantResult.max
  },
  verdict: 'no four-consecutive known-source quotation in the tested 21 source/register controls'
}, null, 2));
