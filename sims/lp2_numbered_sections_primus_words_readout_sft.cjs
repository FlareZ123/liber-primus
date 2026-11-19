'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8').replace(/\r/g, '');
}

const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/base60-grid.json'));
const ink = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const transcription = read('resources/liber-primus/lp2-transcription.txt');
const signed = read('resources/cicada2016-4gq25.md');

function parseSignedWords(md) {
  const block = md.match(/```text\nHello\.[\s\S]*?\n```/u);
  assert.ok(block, 'normalized authenticated 2016 text block not found');
  const alpha = block[0].match(/[A-Za-z]+/gu).map((word) => word.toUpperCase());
  const end = alpha.indexOf('OPENPGP');
  assert.ok(end >= 0);
  return alpha.slice(0, end + 1);
}

const gpMap = new Map([
  ['F',0],['U',1],['TH',2],['O',3],['R',4],['C',5],['G',6],['W',7],
  ['H',8],['N',9],['I',10],['J',11],['EO',12],['P',13],['X',14],['S',15],
  ['T',16],['B',17],['E',18],['M',19],['L',20],['NG',21],['OE',22],['D',23],
  ['A',24],['AE',25],['Y',26],['IA',27],['EA',28],
]);
const digraphs = ['TH','EO','NG','OE','AE','IA','EA'];

function gp(word) {
  const s = word.toUpperCase().replaceAll('V','U').replaceAll('K','C');
  const out = [];
  for (let i = 0; i < s.length;) {
    const pair = s.slice(i, i + 2);
    if (digraphs.includes(pair)) {
      out.push(gpMap.get(pair));
      i += 2;
    } else {
      assert.ok(gpMap.has(s[i]), `unmapped GP letter in ${word}: ${s[i]}`);
      out.push(gpMap.get(s[i]));
      i += 1;
    }
  }
  return out;
}

function gp0(word) {
  return gp(word).reduce((sum, value) => sum + value, 0);
}

function base60(token) {
  const hi = grid.alphabet.indexOf(token[0]);
  const lo = grid.alphabet.indexOf(token[1]);
  assert.ok(hi >= 0 && lo >= 0);
  return hi * 60 + lo;
}

function low60(token) {
  const value = grid.alphabet.indexOf(token[1]);
  assert.ok(value >= 0);
  return value;
}

function cube(value) {
  return (value * value * value) % 29;
}

const source = parseSignedWords(signed);
assert.equal(source.length, 43);

// The source-number convention is independently zero-based.
assert.deepEqual(
  source.map((word, index) => ({word, index}))
    .filter((entry) => entry.word === 'THEIR')
    .map((entry) => entry.index),
  [19,25],
);

// Physical pp36-p38 visibly/transcriptionally contain section markers 1-5.
const parts = transcription.split(/^\s*%\s*$/mu);
const packet = [parts[36], parts[37], parts[38]].join('\n');
const markers = [...packet.matchAll(/([1-5])-/gu)].map((match) => Number(match[1]));
assert.deepEqual(markers, [1,2,3,4,5]);

// Ink annotations independently record identical red 10-dot punctuation
// immediately before the numbered packet on p36 and after it on p38.
const p36 = ink.pages.find((entry) => entry.page === 36);
const p38 = ink.pages.find((entry) => entry.page === 38);
assert.ok(p36 && p38);
assert.deepEqual(p36.large_punctuation, [[99,10,'red']]);
assert.deepEqual(p38.large_punctuation, [[186,10,'red']]);
const anchor = p36.large_punctuation[0][1];
assert.equal(anchor, p38.large_punctuation[0][1]);
assert.equal(anchor, 10);

// Under the already established zero-based signed-source numbering,
// the bracket value is PRIMUS and the ascending printed section offsets
// enumerate the next five source words.
assert.equal(source[anchor], 'PRIMUS');
const numberedIndices = markers.map((marker) => anchor + marker);
assert.deepEqual(numberedIndices, [11,12,13,14,15]);
assert.deepEqual(
  numberedIndices.map((index) => source[index]),
  ['IS','THE','WAY','ITS','WORDS'],
);

// Independently selected p9 supplies the immediately preceding source word LIBER.
// VERIFY's p50 token has low base60 digit 9.
const tokens = grid.rows.flat();
assert.equal(gp0('VERIFY'), 59);
assert.equal(tokens[59], '19');
assert.equal(low60(tokens[59]), 9);
assert.equal(source[9], 'LIBER');

// A second source-only control also sends WAY13 to LIBER9:
// apply the fixed cube operator e=3 times modulo29.
let way = 13;
const cubeCycle = [way];
for (let i = 0; i < 3; i += 1) {
  way = cube(way);
  cubeCycle.push(way);
}
assert.deepEqual(cubeCycle, [13,22,5,9]);
assert.equal(source[cubeCycle[0]], 'WAY');
assert.equal(source[cubeCycle.at(-1)], 'LIBER');

const reconstructedIndices = [9, anchor, ...numberedIndices];
assert.deepEqual(reconstructedIndices, [9,10,11,12,13,14,15]);
const reconstructedWords = reconstructedIndices.map((index) => source[index]);
assert.deepEqual(
  reconstructedWords,
  ['LIBER','PRIMUS','IS','THE','WAY','ITS','WORDS'],
);

console.log('PASS lp2_numbered_sections_primus_words_readout_sft');
console.log('section markers:', markers.join(','));
console.log('red-dot anchor:', anchor, '=>', source[anchor]);
console.log('anchor+markers:', numberedIndices.join(','), '=>', numberedIndices.map((i) => source[i]).join(' '));
console.log('p9 / cube^e predecessor:', source[9]);
console.log('reconstructed clause:', reconstructedWords.join(' '));
