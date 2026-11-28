'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r/g, '');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const signed = read('resources/historical/cicada2016-4gq25-outguess.asc');
const pretarget = JSON.parse(read('im-results/lp2-p6-stencil-row-onehot-pretarget.json'));

const tokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((a, b) => b.symbol.length - a.symbol.length);

/** @param {string} word */
function gp(word) {
  const normalized = word.toUpperCase()
    .replace(/QU/g, 'CW')
    .replace(/V/g, 'U')
    .replace(/[KQ]/g, 'C')
    .replace(/Z/g, 'S')
    .replace(/[^A-Z]/g, '');

  const output = [];
  for (let offset = 0; offset < normalized.length;) {
    if (normalized.startsWith('ING', offset)) {
      output.push(21);
      offset += 3;
      continue;
    }
    if (normalized.startsWith('IO', offset)) {
      output.push(27);
      offset += 2;
      continue;
    }
    const token = tokens.find((item) => normalized.startsWith(item.symbol, offset));
    assert.ok(token, 'unmapped ' + normalized.slice(offset));
    output.push(token.value);
    offset += token.symbol.length;
  }
  return output;
}

const clear = signed
  .split('-----BEGIN PGP SIGNATURE-----')[0]
  .slice(signed.indexOf('Hello.'));
const words = clear
  .split(/[^A-Za-z0-9]+/u)
  .filter((word) => /^[A-Za-z]+$/u.test(word))
  .map((word) => word.toUpperCase());

assert.deepEqual(words.slice(32, 43), [
  'YOU', 'WILL', 'BE', 'FOUND', 'GOOD',
  'LUCK', 'BEWARE', 'FALSE', 'PATHS', 'VERIFY', 'OPENPGP',
]);

const targetWords = [
  ...words.slice(32, 36),
  ...words.slice(37, 41),
];
const targets = targetWords.map(gp);
const rows = [...pretarget.q1, ...pretarget.q3];

let runeHits = 0;
let wordHits = 0;
let totalRunes = 0;
const graded = rows.map((row, index) => {
  const target = targets[index];
  assert.equal(row.raw.length, target.length);
  const hits = row.raw.reduce(
    (count, value, coordinate) => count + Number(value === target[coordinate]),
    0
  );
  runeHits += hits;
  totalRunes += target.length;
  wordHits += Number(hits === target.length);
  return {
    page: row.page,
    sourceWord: targetWords[index],
    raw: row.raw,
    target,
    hits,
    exact: hits === target.length,
  };
});

assert.equal(totalRunes, 33);
assert.equal(runeHits, 1);
assert.equal(wordHits, 0);
assert.deepEqual(graded.filter((row) => row.hits > 0), [{
  page: 32,
  sourceWord: 'YOU',
  raw: [0, 3, 27],
  target: [26, 3, 1],
  hits: 1,
  exact: false,
}]);

console.log(JSON.stringify({
  status: 'PASS',
  totalRunes,
  runeHits,
  wordHits,
  graded,
  decision: 'Reject the top-down zero-based 13-dot row one-sparse checksum lift as the missing q-block coordinate opcode.',
}, null, 2));
