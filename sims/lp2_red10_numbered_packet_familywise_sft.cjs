'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8').replace(/\r/g, '');

const transcription = read('resources/liber-primus/lp2-transcription.txt');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const grid = JSON.parse(read('resources/liber-primus/base60-grid.json'));
const signed = read('resources/cicada2016-4gq25.md');

function parseSignedWords(md) {
  const start = md.indexOf('Hello.');
  const finish = md.indexOf('```', start);
  assert.ok(start >= 0 && finish > start);
  const all = md.slice(start, finish).match(/[A-Za-z]+/gu).map((word) => word.toUpperCase());
  const end = all.indexOf('OPENPGP');
  assert.ok(end >= 0);
  return all.slice(0, end + 1);
}

const source = parseSignedWords(signed);
assert.equal(source.length, 43);

const translitIndex = new Map(corpus.translit.map((token, index) => [token, index]));
const digraphs = ['TH','EO','NG','OE','AE','IA','EA'];

function gp(word) {
  const s = word.toUpperCase().replaceAll('V','U').replaceAll('K','C');
  const out = [];
  for (let i = 0; i < s.length;) {
    const pair = s.slice(i, i + 2);
    if (digraphs.includes(pair)) {
      out.push(translitIndex.get(pair));
      i += 2;
    } else {
      assert.ok(translitIndex.has(s[i]), `unmapped GP letter ${s[i]} in ${word}`);
      out.push(translitIndex.get(s[i]));
      i += 1;
    }
  }
  return out;
}
const gp0 = (word) => gp(word).reduce((sum, value) => sum + value, 0);

function prime(n) {
  let found = 0;
  for (let value = 2;; value += 1) {
    let isPrime = true;
    for (let divisor = 2; divisor * divisor <= value; divisor += 1) {
      if (value % divisor === 0) { isPrime = false; break; }
    }
    if (isPrime && ++found === n) return value;
  }
}
const T = (length) => (prime(length) - 1) % 29;

function base60(token) {
  const hi = grid.alphabet.indexOf(token[0]);
  const lo = grid.alphabet.indexOf(token[1]);
  assert.ok(hi >= 0 && lo >= 0);
  return hi * 60 + lo;
}

const parts = transcription.split(/^\s*%\s*$/mu);
const numericPages = [];
for (let page = 0; page < parts.length; page += 1) {
  const markers = [...parts[page].matchAll(/(?:^|\s)([1-5])-/gu)].map((match) => Number(match[1]));
  if (markers.length) numericPages.push({page, markers});
}
assert.deepEqual(numericPages, [
  {page:36, markers:[1]},
  {page:37, markers:[2,3,4]},
  {page:38, markers:[5]},
]);

const redPunctuation = [];
for (const page of ink.pages) {
  for (const row of page.large_punctuation || []) {
    const [start, count, color] = row;
    if (color === 'red') redPunctuation.push({page:page.page, start, count});
  }
}
assert.equal(redPunctuation.length, 35);
const byCount = new Map();
for (const row of redPunctuation) {
  if (!byCount.has(row.count)) byCount.set(row.count, []);
  byCount.get(row.count).push(row.page);
}
assert.deepEqual(Object.fromEntries([...byCount.entries()].sort((a,b) => a[0]-b[0])), {
  10:[36,38,49,56],
  13:[0,2,3,3,3,6,6,7,7,14,15,15,15,22,23,26,27,32,33,33,33,39,39,39,53,54,55,56,56,57],
  23:[57],
});

const markerPages = new Set(numericPages.map((row) => row.page));
assert.deepEqual(
  redPunctuation.filter((row) => row.count === 10 && markerPages.has(row.page)),
  [{page:36,start:99,count:10},{page:38,start:186,count:10}],
);
assert.deepEqual(
  redPunctuation.filter((row) => row.count === 10 && !markerPages.has(row.page)),
  [{page:49,start:66,count:10},{page:56,start:45,count:10}],
);

const markers = [1,2,3,4,5];
const targetIndices = [10,11,12,13,14,15];
const family = [];
for (const anchor of redPunctuation) {
  for (const anchorOrigin of [0,1]) {
    for (const markerOrigin of [0,1]) {
      for (const sign of [1,-1]) {
        const base = anchor.count - anchorOrigin;
        const indices = [base, ...markers.map((marker) => base + sign * (marker - markerOrigin))];
        if (indices.every((index) => index >= 0 && index < source.length)) {
          family.push({...anchor, anchorOrigin, markerOrigin, sign, indices});
        }
      }
    }
  }
}
assert.equal(family.length, 280);
const exactTargetHits = family.filter((row) =>
  row.indices.every((value, index) => value === targetIndices[index])
);
assert.deepEqual(
  exactTargetHits.map((row) => [row.page,row.start,row.count,row.anchorOrigin,row.markerOrigin,row.sign]),
  [[36,99,10,0,0,1],[38,186,10,0,0,1],[49,66,10,0,0,1],[56,45,10,0,0,1]],
);
assert.deepEqual(targetIndices.map((index) => source[index]), [
  'PRIMUS','IS','THE','WAY','ITS','WORDS',
]);

const joined = [parts[36],parts[37],parts[38]].join('\n').replace(/\/\s*/gu,'');
const marks = [...joined.matchAll(/([1-5])-/gu)].map((match) => ({
  n:Number(match[1]), start:match.index, end:match.index + match[0].length,
}));
assert.deepEqual(marks.map((row) => row.n), markers);

const selected = [];
for (let i = 0; i < marks.length; i += 1) {
  const mark = marks[i];
  const end = i + 1 < marks.length ? marks[i + 1].start : joined.length;
  const section = joined.slice(mark.end, end);
  const words = section.match(/[\u16A0-\u16FF]+/gu) || [];
  assert.ok(words.length >= mark.n);
  const length = [...words[mark.n - 1]].length;
  selected.push({section:mark.n, ordinal:mark.n, length, serialized:T(length)});
}
assert.deepEqual(selected.map((row) => row.length), [4,4,4,2,6]);
assert.deepEqual(selected.map((row) => row.serialized), [6,6,6,2,12]);

const continuationValues = selected.map((row) => row.serialized);
const continuationGp0 = continuationValues.reduce((sum, value) => sum + value, 0);
assert.equal(continuationGp0, 32);

assert.equal(gp0('SEEKS'), 71);
const tokens = grid.rows.flat();
const bytes = grid.byte_rows.flat();
for (let i = 0; i < tokens.length; i += 1) assert.equal(base60(tokens[i]), bytes[i]);
let pointer = gp0('SEEKS');
const chain = [pointer];
for (let step = 0; step < 23; step += 1) {
  pointer = bytes[pointer];
  chain.push(pointer);
}
assert.equal(pointer, 32);

console.log('PASS lp2_red10_numbered_packet_familywise_sft');
console.log('red punctuation counts:', Object.fromEntries(byCount));
console.log('charged arithmetic configurations:', family.length);
console.log('exact numeric target hits:', exactTargetHits.map((row) => [row.page,row.start]));
console.log('packet readout:', targetIndices.map((index) => source[index]).join(' '));
console.log('frozen nth-word lengths:', selected.map((row) => row.length));
console.log('T(length):', continuationValues, 'GP0=', continuationGp0);
console.log('independent SEEKS depth-p terminal:', pointer);
