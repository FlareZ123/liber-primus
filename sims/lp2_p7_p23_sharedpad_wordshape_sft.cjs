'use strict';
/**
 * GP29 original p7/p23 additive two-time-pad discriminator.
 * Run: node sims/lp2_p7_p23_sharedpad_wordshape_sft.cjs
 * Preserves original ciphertext, word boundaries and printed lines.
 * Scores four predeclared alignments against every circular p23 shift.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} f */
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const pages = read('resources/liber-primus/lp2-transcription.txt').split('%');
const glyph = new Map(corpus.runes.map((s, i) => [s, i]));
const tokens = corpus.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);
const M = 29;
/** @param {string} source */
function encode(source) {
  const word = source.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const output = [];
  for (let i = 0; i < word.length;) {
    const token = tokens.find(x => word.startsWith(x.s, i));
    assert(token, 'Unmapped native GP word: ' + word);
    output.push(token.i);
    i += token.s.length;
  }
  return output;
}
/** @param {number} page */
function layout(page) {
  const words = [], contexts = [], lines = [];
  let line = [], wordLen = 0, position = 0;
  const finish = () => {
    if (!wordLen) return;
    for (let i = 0; i < wordLen; i++) {
      contexts[position - wordLen + i] = [wordLen, i];
    }
    words.push(wordLen);
    wordLen = 0;
  };
  for (const ch of pages[page]) {
    if (glyph.has(ch)) {
      wordLen++;
      line.push(position++);
    } else if ('- .&$§'.includes(ch)) {
      finish();
    }
    if (ch === '/' && line.length) {
      lines.push(line);
      line = [];
    }
  }
  finish();
  if (line.length) lines.push(line);
  const cipher = corpus.pages.find(p => p.page === page).indices;
  assert.equal(position, cipher.length, 'Original transcription mismatch');
  return {words, contexts, lines, cipher};
}
const a = layout(7), b = layout(23);
assert.deepEqual([a.cipher.length, b.cipher.length], [208, 213]);
assert.deepEqual([a.words.length, b.words.length], [50, 46]);
assert.deepEqual([a.lines.length, b.lines.length], [10, 10]);
const original = Array.from({length: 213}, (_, i) => i);
const mirrored = b.lines.slice().reverse().flat();
assert.equal(new Set(mirrored).size, 213);
const alignments = [
  ['direct-first', original.slice(0, 208)],
  ['direct-last', original.slice(5)],
  ['mirror-first', mirrored.slice(0, 208)],
  ['mirror-last', mirrored.slice(5)]
];
for (const [, indices] of alignments) {
  assert.equal(indices.length, 208);
  assert.equal(new Set(indices).size, 208);
}
/** @param {string} text */
function makeModel(text) {
  const all = (text.match(/[A-Za-z]+/g) || []).map(encode);
  const counts = new Map(), total = new Float64Array(M);
  let N = 0;
  for (const word of all) {
    for (let i = 0; i < word.length; i++) {
      total[word[i]]++;
      N++;
      const key = word.length + ':' + i;
      let row = counts.get(key);
      if (!row) { row = new Float64Array(M); counts.set(key, row); }
      row[word[i]]++;
    }
  }
  const prior = Array.from(total, x => x / N), cache = new Map();
  /** @param {number[]} context */
  function dist(context) {
    const key = context.join(':');
    if (cache.has(key)) return cache.get(key);
    const row = counts.get(key) || new Float64Array(M);
    const count = row.reduce((s, x) => s + x, 0);
    const p = Array.from(row, (x, i) => (x + 12 * prior[i]) / (count + 12));
    cache.set(key, p);
    return p;
  }
  return alignments.map(([name, indices]) => ({
    name, indices,
    likelihood: Array.from({length: 208}, (_, i) => {
      const x = dist(a.contexts[i]), y = dist(b.contexts[indices[i]]);
      const row = new Float64Array(M);
      for (let delta = 0; delta < M; delta++) {
        let chance = 0;
        for (let k = 0; k < M; k++)
          chance += x[k] * y[(k - delta + M) % M];
        row[delta] = Math.log(M * chance);
      }
      return row;
    })
  }));
}
/**
 * @param {number[]} x
 * @param {number[]} y
 * @param {ReturnType<typeof makeModel>[number]} m
 * @param {number} offset
 */
function score(x, y, m, offset = 0) {
  let value = 0;
  for (let i = 0; i < 208; i++) {
    const d = (x[i] - y[(m.indices[i] + offset) % 213] + M) % M;
    value += m.likelihood[i][d];
  }
  return value;
}
const sources = [
  {author:'Shakespeare',file:'resources/control/shakespeare_first300k.txt',
   expected:[-2.0574, -18.3400, -20.1761, -24.6959], rank:3},
  {author:'Emerson',file:'resources/control/emerson_essays_2944.txt',
   expected:[-4.229, -16.280, -26.369, -18.007], rank:9},
  {author:'Gibran',file:'resources/control/gibran_prophet_58585.txt',
   expected:[-11.483, -19.973, -32.421, -23.787], rank:33}
];
const results = [];
for (const source of sources) {
  const model = makeModel(read(source.file));
  const originalScores = model.map(m => score(a.cipher, b.cipher, m));
  originalScores.forEach((s, i) =>
    assert(Math.abs(s - source.expected[i]) < 0.003, source.author + ':' + i));
  const best = Math.max(...originalScores);
  const shifts = Array.from({length: 213}, (_, offset) =>
    Math.max(...model.map(m => score(a.cipher, b.cipher, m, offset))));
  const rank = shifts.filter(x => x >= best - 1e-9).length;
  assert.equal(rank, source.rank);
  results.push({
    author: source.author,
    sourceScores: Object.fromEntries(model.map((m, i) =>
      [m.name, Number(originalScores[i].toFixed(6))])),
    originalAlignmentRankOf213: rank,
    bestRotatedOffset: shifts.indexOf(Math.max(...shifts))
  });
}
process.stdout.write(JSON.stringify({
  hypothesis: 'same-position secret additive GP29 pad reused on p7 and p23',
  exactOriginalPageLengths: [208, 213],
  originalPrintedWords: [50, 46],
  sourceSelectedCandidateAlignments: alignments.map(x => x[0]),
  results,
  verdict: 'No robust source-keyed shared pad or unknown plaintext'
}, null, 2) + '\n');
