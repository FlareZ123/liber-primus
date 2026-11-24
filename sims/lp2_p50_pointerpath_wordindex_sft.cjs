'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const raw = fs.readFileSync(path.join(ROOT, 'resources/liber-primus/lp2-transcription.txt'), 'utf8');

const sourcePaths = [
  [103,206,127,193,155,112,73,79,82,201,74,205,76],
  [29,66,25,198,105,63,51,59,69,73,79,82,201,74,205,76]
];

const runeId = new Map(corpus.runes.map((rune, index) => [rune, index]));
const pages = raw.split('%').slice(0, 55);
const words = [];
let current = [];
function finish() { if (current.length) words.push(current); current = []; }
for (const ch of [...pages.join('%')]) {
  if (runeId.has(ch)) current.push(runeId.get(ch));
  else if (ch === '%' || ch === '/' || /\s/u.test(ch)) continue;
  else finish();
}
finish();
assert.equal(words.length, 2896);

function extract(position, base) {
  const index = position - base;
  const word = words[index];
  assert.ok(word, 'word position outside LP2 corpus');
  return word.map(i => corpus.translit[i]).join('');
}

const results = sourcePaths.map((nodes, pathIndex) => ({
  path: pathIndex + 1,
  nodes,
  zeroBasedWords: nodes.map(n => extract(n, 0)),
  oneBasedWords: nodes.map(n => extract(n, 1))
}));

console.log(JSON.stringify({
  hypothesis: 'use source-derived p50 pointer-graph nodes as word indices in the 2,896 printed LP2 word groups, motivated by the 2016 words-as-map/numbers-as-direction message',
  wordCount: words.length,
  results
}, null, 2));
