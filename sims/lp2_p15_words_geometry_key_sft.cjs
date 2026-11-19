'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8').replace(/\r/g, '');

const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const transcription = read('resources/liber-primus/lp2-transcription.txt');
const signed = read('resources/cicada2016-4gq25.md');

function parseSignedWords(md) {
  const start = md.indexOf('Hello.');
  const end = md.indexOf('```', start);
  assert.ok(start >= 0 && end > start);
  const all = md.slice(start, end).match(/[A-Za-z]+/gu).map((w) => w.toUpperCase());
  const last = all.indexOf('OPENPGP');
  assert.ok(last >= 0);
  return all.slice(0, last + 1);
}

const sourceWords = parseSignedWords(signed);
assert.equal(sourceWords.length, 43);

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const translitIndex = new Map(corpus.translit.map((token, index) => [token, index]));
const digraphs = ['TH','EO','NG','OE','AE','IA','EA'];

function gp(word) {
  const s = word.toUpperCase().replaceAll('V', 'U').replaceAll('K', 'C');
  const out = [];
  for (let i = 0; i < s.length;) {
    const pair = s.slice(i, i + 2);
    if (digraphs.includes(pair)) {
      out.push(translitIndex.get(pair));
      i += 2;
    } else {
      assert.ok(translitIndex.has(s[i]), `unmapped GP letter in ${word}: ${s[i]}`);
      out.push(translitIndex.get(s[i]));
      i += 1;
    }
  }
  return out;
}

function gp0(word) {
  return gp(word).reduce((sum, value) => sum + value, 0);
}

function mod29(value) {
  return (value % 29 + 29) % 29;
}

function H5(values) {
  assert.equal(values.length, 5);
  return [
    mod29(values[0] - values[4]),
    mod29(values[1] - values[3]),
    values[2],
    mod29(values[1] + values[3]),
    mod29(values[0] + values[4]),
  ];
}

const parts = transcription.split(/^\s*%\s*$/mu);

function physicalPart(page) {
  assert.notEqual(page, 50);
  return parts[page <= 49 ? page : page - 1];
}

function pageWords(page) {
  const words = physicalPart(page).replace(/\/\s*/gu, '').match(/[\u16A0-\u16FF]+/gu) || [];
  let offset = 0;
  return words.map((word, ordinal) => {
    const values = [...word].map((rune) => runeIndex.get(rune));
    const row = {
      page, ordinal, start: offset, end: offset + values.length - 1, values,
    };
    offset += values.length;
    return row;
  });
}

// Source-visible p15 geometry.
const p15Ink = ink.pages.find((entry) => entry.page === 15);
assert.ok(p15Ink);
assert.deepEqual(p15Ink.red_spans.map((span) => span.length), [9, 11]);
assert.deepEqual(p15Ink.large_punctuation, [
  [0,13,'red'], [9,13,'red'], [20,13,'red'],
]);

const redLengths = p15Ink.red_spans.map((span) => span.length);
const punctuationGroupCount = p15Ink.large_punctuation.length;
const punctuationDotCount = p15Ink.large_punctuation[0][1];
const physicalPage = 15;

assert.equal(punctuationGroupCount, 3);
assert.equal(punctuationDotCount, 13);

// Charge the complete manuscript family with the same source-visible object type:
// two red spans on one page plus at least one red large-punctuation count.
// In natural span order, only p15 forms a four-term arithmetic progression
// [span1 length, span2 length, red-dot count, physical page].
const redSpanPacketFamily = [];
for (const page of ink.pages) {
  const spans = (page.red_spans || []).slice().sort((left, right) => left.start - right.start);
  const counts = [...new Set(
    (page.large_punctuation || [])
      .filter((row) => row[2] === 'red')
      .map((row) => row[1])
  )];
  for (let left = 0; left < spans.length; left += 1) {
    for (let right = left + 1; right < spans.length; right += 1) {
      for (const count of counts) {
        const sequence = [spans[left].length, spans[right].length, count, page.page];
        const differences = sequence.slice(1).map((value, index) => value - sequence[index]);
        redSpanPacketFamily.push({
          page:page.page,
          spanStarts:[spans[left].start, spans[right].start],
          sequence,
          differences,
          arithmetic:differences.every((value) => value === differences[0]),
        });
      }
    }
  }
}
assert.deepEqual(redSpanPacketFamily.map((row) => ({
  page:row.page, spanStarts:row.spanStarts, sequence:row.sequence, differences:row.differences,
})), [
  {page:3, spanStarts:[0,119], sequence:[16,3,13,3], differences:[-13,10,-10]},
  {page:15, spanStarts:[0,9], sequence:[9,11,13,15], differences:[2,2,2]},
  {page:33, spanStarts:[0,91], sequence:[10,8,13,33], differences:[-2,5,20]},
]);
assert.deepEqual(
  redSpanPacketFamily.filter((row) => row.arithmetic).map((row) => [row.page,row.sequence]),
  [[15,[9,11,13,15]]],
);

// The four directly visible source numbers are a K=2 progression.
const oddSkeleton = [redLengths[0], redLengths[1], punctuationDotCount, physicalPage];
assert.deepEqual(oddSkeleton, [9,11,13,15]);
const step = oddSkeleton[1] - oddSkeleton[0];
assert.equal(step, 2);
assert.deepEqual(
  oddSkeleton.slice(1).map((x, i) => x - oddSkeleton[i]),
  [2,2,2],
);
assert.deepEqual(
  oddSkeleton.map((index) => sourceWords[index]),
  ['LIBER','IS','WAY','WORDS'],
);

// Fill the arithmetic midpoints to reconstruct the complete source clause.
const midpoints = oddSkeleton.slice(0, -1).map((x, i) => (x + oddSkeleton[i + 1]) / 2);
assert.deepEqual(midpoints, [10,12,14]);
assert.deepEqual(midpoints.map((index) => sourceWords[index]), ['PRIMUS','THE','ITS']);
const reconstructedIndices = [];
for (let i = 0; i < oddSkeleton.length; i += 1) {
  reconstructedIndices.push(oddSkeleton[i]);
  if (i < midpoints.length) reconstructedIndices.push(midpoints[i]);
}
assert.deepEqual(reconstructedIndices, [9,10,11,12,13,14,15]);
assert.deepEqual(
  reconstructedIndices.map((index) => sourceWords[index]),
  ['LIBER','PRIMUS','IS','THE','WAY','ITS','WORDS'],
);

// Visible 4x4 p15 numerical square. The values are retained only to verify dimensions.
const p15Square = [
  [3258,3222,3152,3038],
  [3278,3299,3298,2838],
  [3288,3294,3296,2472],
  [4516,1206,708,1820],
];
const redSquareValue = 3299;
assert.equal(3301 - redSquareValue, state.K);
assert.equal(redLengths[1] - redLengths[0], 3301 - redSquareValue);
const rows = p15Square.length;
const cols = p15Square[0].length;
assert.equal(rows, 4);
assert.ok(p15Square.every((row) => row.length === cols));
assert.equal(cols, 4);

// The page geometry supplies one compact five-coordinate key:
// [number of red punctuation groups,
//  midpoint of red title lengths,
//  square rows, square columns,
//  red-title length difference].
const titleMidpoint = (redLengths[0] + redLengths[1]) / 2;
const titleDifference = redLengths[1] - redLengths[0];
const geometryKey = [punctuationGroupCount, titleMidpoint, rows, cols, titleDifference];
assert.deepEqual(geometryKey, [3,10,4,4,2]);

// Independently reconstructed DH/state values describe the same tuple.
const state = {p:23,g:5,a:6,b:15,A:8,B:19,K:2,e:3,q:4};
const stateKey = [state.e, state.K * state.g, state.q, state.q, state.K];
assert.deepEqual(geometryKey, stateKey);

// The H shell is also entirely state-derived.
assert.deepEqual(
  H5(geometryKey),
  [state.a - state.g, state.a, state.q, mod29(-state.b), state.g],
);

// Charge the same-index page/local-word residual family across the complete
// authenticated source. P32 READ OUT independently selects DEVOTED8, making
// the longest run's entry point source-selected before this finite census.
const stateScalars = new Set([
  0, state.p, state.g, state.a, state.b, state.A, state.B,
  state.K, state.e, state.q, state.K * state.a, state.K * state.g,
  state.a - state.g,
]);

const residualRows = sourceWords.map((word, index) => {
  const words = pageWords(index);
  if (index >= words.length) return {index, word, residual:null, inFamily:false};
  const local = words[index];
  const localGp0 = local.values.reduce((sum, value) => sum + value, 0);
  const residual = mod29(localGp0 - gp0(word));
  return {index, word, residual, inFamily:stateScalars.has(residual)};
});

const residualRuns = [];
let runStart = null;
for (let index = 0; index <= residualRows.length; index += 1) {
  const inside = index < residualRows.length && residualRows[index].inFamily;
  if (inside && runStart === null) runStart = index;
  if (!inside && runStart !== null) {
    residualRuns.push({
      start:runStart,
      end:index - 1,
      length:index - runStart,
      residuals:residualRows.slice(runStart, index).map((row) => row.residual),
      words:residualRows.slice(runStart, index).map((row) => row.word),
    });
    runStart = null;
  }
}
residualRuns.sort((left, right) => right.length - left.length || left.start - right.start);
assert.deepEqual(residualRuns[0], {
  start:8,
  end:15,
  length:8,
  residuals:[23,6,0,0,15,12,5,23],
  words:['DEVOTED','LIBER','PRIMUS','IS','THE','WAY','ITS','WORDS'],
});
assert.equal(residualRuns.filter((run) => run.length === 8).length, 1);
assert.deepEqual(
  residualRuns.slice(0, 3).map((run) => [run.start, run.end, run.length]),
  [[8,15,8],[21,25,5],[33,35,3]],
);

// Signed word15 selects physical p15 and local printed word15.
assert.equal(sourceWords[15], 'WORDS');
const receiver = pageWords(15)[15];
assert.deepEqual(receiver, {
  page:15, ordinal:15, start:71, end:75,
  values:[10,13,8,27,17],
});
const target = gp('WORDS');
assert.deepEqual(target, [7,3,4,23,15]);
assert.equal(target.length, geometryKey.length);
const plaintext = receiver.values.map((value, i) => mod29(value - geometryKey[i]));
assert.deepEqual(plaintext, target);

// Exhaust every distinct permutation of the visible key multiset and both signs
// at the already selected receiver. Exactly one produces any authenticated
// five-GP-rune source word.
function permutations(values) {
  if (values.length <= 1) return [values];
  const out = [];
  for (let i = 0; i < values.length; i += 1) {
    const rest = [...values.slice(0, i), ...values.slice(i + 1)];
    for (const tail of permutations(rest)) out.push([values[i], ...tail]);
  }
  const seen = new Set();
  return out.filter((row) => {
    const key = row.join(',');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const fiveRuneTargets = new Map();
for (let i = 0; i < sourceWords.length; i += 1) {
  const values = gp(sourceWords[i]);
  if (values.length !== 5) continue;
  const key = values.join(',');
  if (!fiveRuneTargets.has(key)) fiveRuneTargets.set(key, []);
  fiveRuneTargets.get(key).push({index:i, word:sourceWords[i]});
}

const permutationHits = [];
const perms = permutations(geometryKey);
assert.equal(perms.length, 60);
for (const key of perms) {
  for (const sign of [-1, 1]) {
    const out = receiver.values.map((value, i) => mod29(value + sign * key[i]));
    const hit = fiveRuneTargets.get(out.join(','));
    if (hit) {
      permutationHits.push({
        key, sign: sign === -1 ? 'subtract' : 'add', hit,
      });
    }
  }
}
assert.deepEqual(permutationHits, [{
  key:[3,10,4,4,2], sign:'subtract', hit:[{index:15,word:'WORDS'}],
}]);

// Charge the exact geometry key, both signs, against every complete five-rune
// word in all unknown physical pages. The sole signed-source five-rune hit is
// the selected p15 word15 -> WORDS receiver.
const globalHits = [];
for (let page = 0; page <= 57; page += 1) {
  if (page === 50) continue;
  for (const word of pageWords(page)) {
    if (word.values.length !== 5) continue;
    for (const sign of [-1, 1]) {
      const out = word.values.map((value, i) => mod29(value + sign * geometryKey[i]));
      const hit = fiveRuneTargets.get(out.join(','));
      if (hit) {
        globalHits.push({
          page, ordinal:word.ordinal, start:word.start, end:word.end,
          sign:sign === -1 ? 'subtract' : 'add', hit,
        });
      }
    }
  }
}
assert.deepEqual(globalHits, [{
  page:15, ordinal:15, start:71, end:75,
  sign:'subtract', hit:[{index:15,word:'WORDS'}],
}]);

console.log('PASS lp2_p15_words_geometry_key_sft');
console.log('red-span packet family:', redSpanPacketFamily.map((row) => [row.page,row.sequence,row.differences]));
console.log('p15 source-index skeleton:', oddSkeleton, '=>', oddSkeleton.map((i) => sourceWords[i]).join(' '));
console.log('midpoints:', midpoints, '=>', midpoints.map((i) => sourceWords[i]).join(' '));
console.log('full clause:', reconstructedIndices.map((i) => sourceWords[i]).join(' '));
console.log('same-index residual longest run:', residualRuns[0]);
console.log('geometry key:', geometryKey, '= [e,K*g,q,q,K]');
console.log('H(key):', H5(geometryKey), '= [a-g,a,q,-b,g]');
console.log('receiver p15 word15:', receiver.values, 'subtract key => WORDS', target);
console.log('permutation/sign source-word hits:', permutationHits.length);
console.log('global five-rune source-word hits:', globalHits.length);
